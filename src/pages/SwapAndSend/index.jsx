import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { signMessage } from "sats-connect";


const SwapAndSend = () => {
  const { ordinalsAddress ,BISON_SEQUENCER_ENDPOINT,NETWORK} = useWallet(); // 使用useWallet钩子
  const [contracts, setContracts] = useState([]);
  const [tokenBalances, setTokenBalances] = useState({});
  const [receiptAddress, setReceiptAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTransferToken, setSelectedTransferToken] = useState("btc");
  const [selectedSwapToken1, setSelectedSwapToken1] = useState("btc");
  const [selectedSwapToken2, setSelectedSwapToken2] = useState("bmap");
  const [availableSwapOptions, setAvailableSwapOptions] = useState([]);
  const [swapContracts, setSwapContracts] = useState([]);
  const [allTokensFromSwap, setAllTokensFromSwap] = useState([]);
  const [quoteID, setQuoteID] = useState(null);
  const [swapAmount, setSwapAmount] = useState("");
  const [amount2, setAmount2] = useState("");
  const [quote, setQuote] = useState(null);
  const [btcRate, setBtcRate] = useState(0);
  const [totalValue, setTotalValue] = useState(0);


  const fetchBalanceForContract = async (contract) => {
    const url = `${contract.contractEndpoint}/balance`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: ordinalsAddress }),
    })
      .then(response => response.json())
      .then(data => {
        setTokenBalances(prevTokenBalances => ({
          ...prevTokenBalances,
          [contract.tick]: data.balance
        }));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const receiptAddressChange = async (e) =>{
    let address = e.target.value;
    setReceiptAddress(address)
  }

  const onSignAndSendMessageClick = async () => {

    console.log(selectedTransferToken)
    // 从contracts数组中找到与selectedTransferToken匹配的合约
    const selectedContract = contracts.find(contract => contract.tick === selectedTransferToken);
    if (!selectedContract) {
      console.error('No contract found for the selected token.');
      return;
    }

    if(amount<=0){
      alert("The transfer amount must be greater than zero");
      return;
    }
    if (NETWORK != 'Testnet' && receiptAddress.startsWith('bc1p')){
    }else if (NETWORK == 'Testnet' && receiptAddress.startsWith('tb1q')){
    }else{
      alert("receipt address must be ordinals address!");
      return;
    }

    // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1; // 确保从JSON响应中正确地获取nonce值

    // 如果tick是btc,那么amount从btc转化成sats
    let transferAmount = amount;
    if (selectedTransferToken === 'btc' || selectedTransferToken === 'pipe' || selectedTransferToken === 'TESTpipe') {
      transferAmount = Math.round(parseFloat(amount) * 100000000); // 1 BTC = 100,000,000 sats
    } else {
      transferAmount = parseInt(amount, 10);
    }


    const messageObj = {
      method: "transfer",
      sAddr: ordinalsAddress,
      rAddr: receiptAddress,
      amt: transferAmount,
      tick: selectedTransferToken,
      nonce: nonce,
      tokenContractAddress: selectedContract.contractAddr, // 添加tokenContractAddress
      sig: ""
    };

    // 先将messageObj发送到/gas_meter以获取gas数据
    const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageObj),
    });
    const gasData = await gasResponse.json();

    // 更新messageObj以包含gas数据
    messageObj.gas_estimated = gasData.gas_estimated;
    messageObj.gas_estimated_hash = gasData.gas_estimated_hash;

    // 检查余额是否足够
    if (selectedTransferToken === 'btc') {
      if (tokenBalances['btc'] < (transferAmount + gasData.gas_estimated)) {
        alert("Your BTC balance is insufficient to cover the transaction amount and estimated gas fees.");
        return;
      }
    } else {
      if (tokenBalances[selectedTransferToken] < transferAmount) {
        alert(`Your ${selectedTransferToken} balance is insufficient for this transaction.`);
        return;
      }
      if (tokenBalances['btc'] < gasData.gas_estimated) {
        alert("Your BTC balance is insufficient to cover the estimated gas fees.");
        return;
      }
    }

    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(messageObj),
      },
      onFinish: (response) => {
        messageObj.sig = response;
        onSendMessageClick(messageObj);
      },
      onCancel: () => alert("Canceled"),
    };

    await signMessage(signMessageOptions);

  }


  const onSendMessageClick = async (signedMessage) => {
    // Make a HTTP POST request to /enqueue_transaction
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signedMessage),
    })
      .then(response => response.json())
      .then(data => {
        alert(JSON.stringify(data));
        fetchContracts();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Check if the value starts with a negative sign
    if (value.startsWith('-')) return;

    // If selectedTransferToken is 'btc', allow decimal input
    if (selectedTransferToken === 'btc' || selectedTransferToken === 'pipe'|| selectedTransferToken === 'TESTpipe') {
      if (!value || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setAmount(value);
      }
    } else {
      // For other tokens, only allow integer input
      if (!value || /^[0-9]+$/.test(value)) {
        setAmount(value);
      }
    }
  };


  const fetchContracts = async () => {
    const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}/contracts_list`);
    const data = await response.json();

    // Filter contracts that are of type "Token"
    const tokenContracts = data.contracts.filter(contract => contract.contractType === "Token");

    // Filter contracts that are of type "SWAP"
    const swapContractsFiltered = data.contracts.filter(contract => contract.contractType === "SWAP");
    // Fetch the balance for each token contract
    for (let contract of tokenContracts) {
      await fetchBalanceForContract(contract);
    }

    setContracts(tokenContracts);
    setSwapContracts(swapContractsFiltered);
  }

  useEffect(() => {
    fetchContracts();
  }, [ordinalsAddress]);


  //This part of code is used for swap
  useEffect(() => {
    if (selectedSwapToken1) {
      const availableOptions = swapContracts
        .filter(contract => contract.tick.startsWith(selectedSwapToken1 + "-"))
        .map(contract => contract.tick.split('-')[1].split('_')[0]);

      setAvailableSwapOptions(availableOptions);

      // 如果availableOptions有值，将selectedSwapToken2设置为第一个选项
      if (availableOptions.length > 0) {
        setSelectedSwapToken2(availableOptions[0]);
      }
    }
  }, [selectedSwapToken1, swapContracts]);


  useEffect(() => {
    const uniqueTokens = [...new Set(swapContracts.map(contract => contract.tick.split('-')[0]))];
    setAllTokensFromSwap(uniqueTokens);
  }, [swapContracts]);


  useEffect(() => {
    const getQuote = async () => {

      if (!selectedSwapToken1 || !selectedSwapToken2 || !swapAmount) return;

      const contract1 = contracts.find(contract => contract.tick === selectedSwapToken1);
      const contract2 = contracts.find(contract => contract.tick === selectedSwapToken2);

      let adjustedSwapAmount = swapAmount;

      if (selectedSwapToken1.toLowerCase() === "btc" || selectedSwapToken1.toLowerCase() === "pipe"||selectedSwapToken1.toLowerCase() === "testpipe") {
        adjustedSwapAmount = Math.round(swapAmount * 100000000); // 1 btc = 100,000,000 sats
      }


      if (!contract1 || !contract2) return;

      const contractAddress1 = contract1.contractAddr;
      const contractAddress2 = contract2.contractAddr;

      const swapContractTick = `${selectedSwapToken1}-${selectedSwapToken2}_SWAP`;
      const swapContract = swapContracts.find(swapContracts => swapContracts.tick === swapContractTick);



      if (!swapContract) return;

      const endpoint = `${swapContract.contractEndpoint}/quote`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tick1: selectedSwapToken1,
            tick2: selectedSwapToken2,
            contractAddress1: contractAddress1,
            contractAddress2: contractAddress2,
            amount1: adjustedSwapAmount,
          }),
        });

        const data = await response.json();
        console.log(data);
        setQuote(data);
        setAmount2(data.amount2);  // 如果您需要存储quote的结果
      } catch (error) {
        console.error("Error fetching quote:", error);
      }
    };

    getQuote();
  }, [selectedSwapToken1, selectedSwapToken2, swapAmount, contracts]);

  const handleSwapAmountChange = (e) => {
    const value = e.target.value;

    // Check if the value starts with a negative sign
    if (value.startsWith('-')) return;

    // If selectedSwapToken1 is 'btc', allow decimal input
    if (selectedSwapToken1 === 'btc' || selectedSwapToken1 === 'pipe'|| selectedSwapToken1 === 'TESTpipe') {
      if (!value || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setSwapAmount(value);
      }
    } else {
      // For other tokens, only allow integer input
      if (!value || /^[0-9]+$/.test(value)) {
        setSwapAmount(value);
      }
    }
  };


  const handleSwapClick = async () => {


    let adjustedSwapAmount = swapAmount;

    if (selectedSwapToken1.toLowerCase() === "btc" || selectedSwapToken1.toLowerCase() === 'pipe'|| selectedSwapToken1.toLowerCase() === 'testpipe') {
      adjustedSwapAmount = Math.round(swapAmount * 100000000); // 1 btc = 100,000,000 sats
    }
    const amount1 = parseInt(adjustedSwapAmount);

    const tick1 = selectedSwapToken1;
    const tick2 = selectedSwapToken2;
    const expiry = new Date(new Date().getTime() + 1 * 60000).toISOString();

    const contract1 = contracts.find(contract => contract.tick === tick1);
    const contract2 = contracts.find(contract => contract.tick === tick2);
    const contractAddress1 = contract1 ? contract1.contractAddr : "";
    const contractAddress2 = contract2 ? contract2.contractAddr : "";

    // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;





    const messageObj = {
      method: "swap",
      expiry: expiry,
      tick1: tick1,
      contractAddress1: contractAddress1,
      amount1: amount1,
      tick2: tick2,
      contractAddress2: contractAddress2,
      amount2: amount2,
      makerAddr: ordinalsAddress,
      takerAddr: "",
      nonce: nonce,
      slippage: 0.02,
      makerSig: "",
      takerSig: ""
    };

    // 先将messageObj发送到/gas_meter以获取gas数据
    const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageObj),
    });
    const gasData = await gasResponse.json();

    if (selectedSwapToken1 === 'btc') {
      if (tokenBalances['btc'] < (adjustedSwapAmount + gasData.gas_estimated)) {
        alert("Your BTC balance is insufficient to cover the swap amount and estimated gas fees.");
        return;
      }
    } else {
      if (tokenBalances[selectedSwapToken1] < adjustedSwapAmount) {
        alert(`Your ${selectedSwapToken1} balance is insufficient for this swap.`);
        return;
      }
      if (tokenBalances['btc'] < gasData.gas_estimated) {
        alert("Your BTC balance is insufficient to cover the estimated gas fees.");
        return;
      }
    }

    // 更新messageObj以包含gas数据
    messageObj.gas_estimated = gasData.gas_estimated;
    messageObj.gas_estimated_hash = gasData.gas_estimated_hash;

    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(messageObj),
      },
      onFinish: (response) => {
        messageObj.makerSig = response;
        onSwapMessageClick(messageObj);
        fetchContracts();
      },
      onCancel: () => alert("Swap canceled"),
    };

    await signMessage(signMessageOptions);

  };


  const onSwapMessageClick = async (signedMessage) => {
    // Make a HTTP POST request to /enqueue_transaction
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signedMessage),
    })
      .then(response => response.json())
      .then(data => {
        alert(JSON.stringify(data));
        setTimeout(() => {
          fetchContracts();
        }, 500);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  useEffect(() => {
    setAmount("");
  }, [selectedTransferToken]);

  useEffect(() => {
    setSwapAmount("");
  }, [selectedSwapToken1]);

  //This part of code is used to display total value
  const fetchBtcRate = async () => {
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
      const data = await response.json();
      setBtcRate(data.bitcoin.usd);
    } catch (error) {
      console.error("Error fetching BTC rate:", error);
    }
  };

  useEffect(() => {
    fetchBtcRate();
    const interval = setInterval(() => {
      fetchBtcRate();
    }, 60000); // 每 60 秒更新一次

    return () => clearInterval(interval); // 清除定时器
  }, []);

  const fetchTotalValueInUSD = async () => {
    let totalValueInBTC = 0;

    // 添加 BTC 的价值
    totalValueInBTC += (tokenBalances['btc'] || 0) / 100000000;

    // 对于每一个非 BTC 的代币，获取其相对于 BTC 的价值
    for (const contract of contracts) {
      if (contract.tick === 'btc') continue;

      const contract1 = contract;
      const contract2 = contracts.find(c => c.tick === 'btc');

      if (!contract1 || !contract2) continue;

      const contractAddress1 = contract1.contractAddr;
      const contractAddress2 = contract2.contractAddr;

      const swapContractTick = `${contract.tick}-btc_SWAP`;
      const swapContract = swapContracts.find(s => s.tick === swapContractTick);

      if (!swapContract) continue;

      const endpoint = `${swapContract.contractEndpoint}/quote`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tick1: contract.tick,
            tick2: 'btc',
            contractAddress1: contractAddress1,
            contractAddress2: contractAddress2,
            amount1: tokenBalances[contract.tick] || 0,
          }),
        });

        const data = await response.json();
        const btcEquivalent = data.amount2 / 100000000;

        totalValueInBTC += btcEquivalent;

      } catch (error) {
        console.error("Error fetching quote:", error);
      }
    }

    // 用 BTC 的汇率转换为美元
    const totalValueInUSD = totalValueInBTC * btcRate;

    // 更新状态
    setTotalValue(totalValueInUSD);
  };

  useEffect(() => {
    fetchTotalValueInUSD();
  }, [tokenBalances]);  // 当 tokenBalances 变动时，重新计算总价值

  return (
    <Layout>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">

        <XBox isBackground={true} >

          <div style={{ display: 'flex' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#424242',
              borderRadius: '25px'
            }}>
              <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 8V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V8M21 12H19C17.8954 12 17 12.8954 17 14C17 15.1046 17.8954 16 19 16H21M3 8V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V11.2C21 10.0799 21 9.51984 20.782 9.09202C20.5903 8.71569 20.2843 8.40973 19.908 8.21799C19.4802 8 18.9201 8 17.8 8H3Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
            </div>
          </div>

          <div style={{ marginTop: '60px', fontSize: '40px' }}>
            <h3>
              Balance
            </h3>
          </div>

          <div style={{ marginTop: '60px', fontSize: '40px' }}>
            <h3>
              ${totalValue.toFixed(2)}
            </h3>
          </div>

        </XBox>

        <XBox isBackground={true} >
          <h3 className="text-center">Swap</h3>

          <div style={{
            height: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '30px',
            backgroundColor: '#424242',
            padding: '0px 21px',
            borderRadius: '9px',
          }}>

            <input
              style={{
                width: '100%',
                height: '100%',
                color: 'white',
                border: 'none',
                background: 'transparent',
                outline: 'none',
              }}
              type="text"
              value={swapAmount}
              onChange={handleSwapAmountChange}
            />


            <select style={{
              backgroundColor: '#FF7248',
              padding: '1px 15px',
              borderRadius: '6px',
              border: 'none',
            }}
              value={selectedSwapToken1}
              onChange={(e) => setSelectedSwapToken1(e.target.value)}
            >
              {allTokensFromSwap.map((token, index) => (
                <option key={index} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          <div style={{
            height: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '30px',
            backgroundColor: '#424242',
            padding: '0px 21px',
            borderRadius: '9px',
          }}>

            <div
              style={{
                width: '100%',
                height: '100%',
                color: 'white',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              {selectedSwapToken2.toLowerCase() === "btc" || selectedSwapToken2.toLowerCase() === "pipe" || selectedSwapToken2.toLowerCase() === "testpipe" ? (amount2 / 100000000).toFixed(8) : amount2}
            </div>

            <select style={{
              backgroundColor: '#FF7248',
              padding: '1px 15px',
              borderRadius: '6px',
              border: 'none',
            }}
              value={selectedSwapToken2}
              onChange={(e) => setSelectedSwapToken2(e.target.value)}
            >
              {availableSwapOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <p style={{
            marginTop: '15px',
            fontSize: '15px',
          }}></p>

          <button
            onClick={handleSwapClick}
            style={{
              background: '#ff7248',
              padding: '13px',
              borderRadius: '35px',
              marginTop: '27px',
            }}>
            Swap
          </button>

        </XBox>

        <XBox isBackground={true} >
          <h3 className="text-center">Transfer</h3>

          <div style={{
            height: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '30px',
            backgroundColor: '#424242',
            padding: '0px 21px',
            borderRadius: '9px',
          }}>

            <input style={{
              width: '100%',
              height: '100%',
              color: 'white',
              border: 'none',
              background: 'transparent',
              outline: 'none',
            }}
              placeholder="Address"
              type="text"
              value={receiptAddress}
              onChange={receiptAddressChange}

            />
          </div>

          <div style={{
            height: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '30px',
            backgroundColor: '#424242',
            padding: '0px 21px',
            borderRadius: '9px',
          }}>

            <input
              style={{
                width: '100%',
                height: '100%',
                color: 'white',
                border: 'none',
                background: 'transparent',
                outline: 'none',
              }}
              placeholder="Amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
            />


            <select style={{
              backgroundColor: '#FF7248',
              padding: '1px 15px',
              borderRadius: '6px',
              border: 'none',
            }}
              value={selectedTransferToken}
              onChange={(e) => setSelectedTransferToken(e.target.value)}
            >
              {contracts.map((contract, index) => (
                <option key={index} value={contract.tick}>
                  {contract.tick}
                </option>
              ))}
            </select>
          </div>

          <p style={{
            marginTop: '15px',
            fontSize: '15px',
          }}></p>

          <button style={{
            background: '#ff7248',
            padding: '13px',
            borderRadius: '35px',
            marginTop: '27px',
          }}
            onClick={onSignAndSendMessageClick}
          >
            Transfer
          </button>

        </XBox>

      </div>

      <div style={{ marginTop: '45px', }}>

        <XBox >
          <div style={{ textAlign: "-webkit-center", }}>
            <div style={{ maxWidth: '95%' }} className="flex flex-col">
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4"></th>
                          <th scope="col" className="px-6 py-4">Name</th>
                          <th scope="col" className="px-6 py-4">Balance</th>
                          <th scope="col" className="px-6 py-4">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((contract, index) => {
                          const balance = (contract.tick === 'btc' || contract.tick === 'TESTpipe'|| contract.tick === 'pipe')
                            ? parseFloat((tokenBalances[contract.tick] || 0) / 100000000).toFixed(8)
                            : tokenBalances[contract.tick] || 0;

                          return (
                            <tr key={index} className="border-b dark:border-neutral-500">
                              <td className="whitespace-nowrap px-6 py-4">{index + 1}</td>
                              <td className="whitespace-nowrap px-6 py-4">{contract.tick}</td>
                              <td className="whitespace-nowrap px-6 py-4">{balance}</td>
                              <td className="whitespace-nowrap px-6 py-4"></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </XBox>

      </div>


    </Layout>
  );
};

export default SwapAndSend;
