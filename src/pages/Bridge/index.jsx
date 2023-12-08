import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";


const Bridge = () => {
  const { NETWORK,ordinalsAddress, paymentAddress ,BISON_SEQUENCER_ENDPOINT,btcContractEndpoint,setBtcContractEndpoint} = useWallet(); // 使用useWallet钩子
  const [btcBalance, setBtcBalance] = useState(0); // 初始化BTC余额为0
  const [contracts, setContracts] = useState([]);
  const [depositeAmount, setDepositeAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [tokenBalances, setTokenBalances] = useState({});
  const [bBTCAmount, setBBTCAmount] = useState(0);
  const [peginsData, setPeginsData] = useState([]);
  const [pegOutsData, setPegOutsData] = useState([]);






  useEffect(() => {

    fetchContracts();
    fetchBTCSum(paymentAddress);
    fetchPegInData();
    fetchPegOutData();
  }, [paymentAddress]);

  useEffect(() => {

    fetchContracts();
    fetchBTCSum(paymentAddress);
    fetchPegInData();
    fetchPegOutData();
  }, []);
  //This part of code is used to display BTC balance

  const fetchBTCSum = async (Address) => {
    try {
      let  url = `https://mempool.space/api/address/${Address}`
      if (NETWORK == 'Testnet') {
        url=`https://mempool.space/testnet/api/address/${Address}`
      }
      const response = await fetch(url);
      const data = await response.json();
      const btcBalance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000; // Converting satoshis to BTC
      setBtcBalance(btcBalance);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const fetchBalanceForContract = async (contract) => {
    const url = `${contract.contractEndpoint}/balance`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setTokenBalances(prevBalances => ({
        ...prevBalances,
        [contract.tick]: data.balance
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const fetchContracts = async () => {
    try {
      const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}contracts_list`);
      const data = await response.json();
      setContracts(data.contracts);
      const tokenContracts = data.contracts.filter(contract => contract.contractType === "Token");

      // Fetch the balance for each contract
      for (let contract of tokenContracts) {
        await fetchBalanceForContract(contract);
        if (contract.tick === 'btc') {
          setBtcContractEndpoint(contract.contractEndpoint);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //This part of code is used to deposite BTC
  const handleDepositeAmountChange = (event) => {
    const value = parseFloat(event.target.value);
    if (value >= 0) { // Only update the state if the value is non-negative
      setDepositeAmount(value);
    }
  }

  const onPegInSignAndSendMessageClick = async (txid) => {
    // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${paymentAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;

    const pegInMessageObj = {
      method: "peg_in",
      token: "btc",
      L1txid: txid,
      sAddr: paymentAddress,
      rAddr: ordinalsAddress,
      nonce: nonce,
      sig: ""
    };

    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: paymentAddress,
        message: JSON.stringify(pegInMessageObj),
      },
      onFinish: (response) => {
        pegInMessageObj.sig = response;

        // Find the contract related to BTC
        const btcContract = contracts.find(contract => contract.tick === 'btc');

        if (btcContract) {
          const endpoint = btcContract.contractEndpoint;

          // Use this endpoint to send the message
          sendPegInMessage(pegInMessageObj, endpoint);
          fetchBTCSum(paymentAddress);
          fetchPegInData();
        } else {
          console.error('BTC contract not found.');
        }
      },
      onCancel: () => alert("Request canceled."),
    };

    await signMessage(signMessageOptions);
  }

  const sendPegInMessage = async (message) => {
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then(response => response.json())
      .then(data => {
        alert(JSON.stringify(data));
        fetchContracts();
        fetchBTCSum(paymentAddress);
        fetchPegInData();
        fetchPegOutData();
      })
      .catch((error) => {
        console.error('Error while sending the peg-in message:', error);
      });
  }

  const onSendBtcClick = async () => {
    // Finding the btc contract
    const btcContract = contracts.find(contract => contract.tick === 'btc');

    if (!btcContract) {
      console.error('BTC contract not found.');
      return;
    }

    const sendBtcOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        recipients: [
          {
            address: btcContract.valutAddr,
            amountSats: parseInt(depositeAmount * 100000000), // Convert amount to satoshis (assuming depositeAmount is in BTC)
          },
        ],
        senderAddress: paymentAddress,
      },
      onFinish: (response) => {
        alert(response);
        setTimeout(() => {
          onPegInSignAndSendMessageClick(response);
        }, 100);
      },
      onCancel: () => alert("Canceled"),
    };
    await sendBtcTransaction(sendBtcOptions);
  }

  //This part of code is used to withdraw

  const handleWithdrawAmountChange = (event) => {
    const value = parseFloat(event.target.value);
    if (value >= 0) { // Only update the state if the value is non-negative
      setWithdrawAmount(value);
    }
  };
  const onPegOutSignAndSendMessageClick = async () => {
    alert("The mainnet is not online yet, waiting ");
    return;
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;

    const pegOutMessageObj = {
      method: "peg_out",
      token: "btc",
      sAddr: ordinalsAddress,
      rAddr: paymentAddress, // Assuming paymentAddress is a state or prop
      amount: Math.round(withdrawAmount * 100000000), // Changed to withdrawAmount
      nonce: nonce,
      sig: ""
    };

    const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pegOutMessageObj),
    });
    const gasData = await gasResponse.json();


    // Update pegOutMessageObj to include gas data
    pegOutMessageObj.gas_estimated = gasData.gas_estimated;
    pegOutMessageObj.gas_estimated_hash = gasData.gas_estimated_hash;

    const totalWithGas = pegOutMessageObj.amount + pegOutMessageObj.gas_estimated; // 用户想要提款的金额加上估计的 gas 费用

    if (tokenBalances['btc'] < totalWithGas) {
      alert("You don't have enough BTC to cover the withdrawal and gas fees.");
      return;
    }
    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(pegOutMessageObj),
      },
      onFinish: (response) => {
        pegOutMessageObj.sig = response;

        // Assuming the same contract is used for both peg-in and peg-out operations
        const btcContract = contracts.find(contract => contract.tick === 'btc');

        if (btcContract) {
          const endpoint = btcContract.contractEndpoint;

          // Use this endpoint to send the peg-out message
          sendPegOutMessage(pegOutMessageObj, endpoint);
        } else {
          console.error('BTC contract not found.');
        }
      },
      onCancel: () => alert("Request canceled."),
    };

    await signMessage(signMessageOptions);
  }

  const sendPegOutMessage = async (message, endpoint) => {
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then(response => response.json())
      .then(data => {
        alert(JSON.stringify(data));
        fetchContracts();
        fetchBTCSum(paymentAddress);
        fetchPegInData();
        fetchPegOutData();
      })
      .catch((error) => {
        console.error('Error while sending the peg-out message:', error);
      });
  }

  //This is used to display pegin and pegout data

  const fetchPegInData = async () => {
    try {
      const response = await fetch(`${btcContractEndpoint}/peginsByAddr/${ordinalsAddress}`);
      const data = await response.json();

      if (data.results) {
        setPeginsData(data.results);
      } else {
        console.warn(data.message); // or handle this message in another way
        setPeginsData([]); // set to an empty array or handle it differently
      }
    } catch (error) {
      console.error('Error fetching peg-in data:', error);
    }
  }

  const fetchPegOutData = async () => {
    try {
      const response = await fetch(`${btcContractEndpoint}/pegoutsByAddr/${ordinalsAddress}`);
      const data = await response.json();

      if (data.transactions) {
        setPegOutsData(data.transactions);
      } else {
        console.warn(data.message); // or handle this message in another way
        setPegOutsData([]); // set to an empty array or handle it differently
      }
    } catch (error) {
      console.error('Error fetching peg-out data:', error);
    }
  };



  const onBitmapPegOutSignAndSendMessageClick = async () => {
    alert("The mainnet is not online yet, waiting ");
    return;
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;


    const pegOutMessageObj = {
      method: "bitmap_peg_out",
      token: "bmap",
      Addr: ordinalsAddress,
      amount: 1, // 设为1 BTC的satoshi值
      nonce: nonce,
      sig: ""
    };

    if (tokenBalances['bmap'] < pegOutMessageObj.amount) {
      alert("Your Bitmap balance is insufficient for this transaction.");
      return;
    }
    const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pegOutMessageObj),
    });
    const gasData = await gasResponse.json();

    if (tokenBalances['btc'] < gasData.gas_estimated) {
      alert("Your BTC balance is insufficient to cover the estimated gas fees.");
      return;
    }

    // 更新pegOutMessageObj以包含gas数据
    pegOutMessageObj.gas_estimated = gasData.gas_estimated;
    pegOutMessageObj.gas_estimated_hash = gasData.gas_estimated_hash;


    const signMessageOptions = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(pegOutMessageObj),
      },
      onFinish: (response) => {
        pegOutMessageObj.sig = response;
        sendBitmapPegOutMessage(pegOutMessageObj);
      },
      onCancel: () => alert("Request canceled."),
    };

    await signMessage(signMessageOptions);
  }

  const sendBitmapPegOutMessage = async (message) => {
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
      .then(response => response.json())
      .then(data => {
        alert(JSON.stringify(data));
        fetchContracts();
        fetchBTCSum(paymentAddress);
        fetchPegInData();
        fetchPegOutData();
      })
      .catch((error) => {
        console.error('Error while sending the peg-out message:', error);
      });
  }

  const handleMaxDeposite = () => {
    const maxAmount = Math.max(btcBalance - 0.0001, 0);
    setDepositeAmount(maxAmount);
  };
  
  const handleMaxWithdraw = () => {
    const maxWithdrawAmount = Math.max(tokenBalances['btc'] - 10000,0); // Assuming tokenBalances['btc'] is in satoshis
    setWithdrawAmount(maxWithdrawAmount / 100000000); // Convert satoshis to BTC for the input field
  };
  

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 2xl:grid-cols-2 mt-4">

        <XBox ixBackground={true}>
          <h3>Deposit</h3>


          <div className='mt-5'>
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Asset{" "}
            </label>
            <div className="mt-1 relative">
              <button
                style={{ height: "60px" }}
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <span className="flex items-center">
                  <img
                    src="/img/menuImages/btc.png"
                    alt=""
                    className="flex-shrink-0 h-6 w-6 rounded-full"
                  />
                  <span style={{ color: 'black', }} className="ml-3 block truncate"> BTC </span>
                </span>
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {/* Heroicon name: solid/selector */}
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className='mt-5'>
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Amount{" "}
            </label>
            <div className="mt-1 relative">
              <button
                style={{ height: "60px" }}
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <input style={{
                  width: '100%',
                  height: '100%',
                  color: 'black',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                }} type="number"
                  min="0"
                  value={depositeAmount}
                  onChange={handleDepositeAmountChange} />
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 ">
                  {/* Heroicon name: solid/selector */}
                  <p style={{ color: 'black', cursor: 'pointer' }} onClick={handleMaxDeposite}>Max</p>
                </span>
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }} className="mt-5">
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Available{" "}
            </label>

            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              {btcBalance.toFixed(8)} BTC
            </p>

          </div>

          <div className="mt-2" style={{ textAlign: 'right', }}>
            <button className="mx-3" style={{
              background: '#FF7248',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '17px',
            }}>
              Cancel
            </button>
            <button onClick={onSendBtcClick}
              style={{
                background: '#FF7248',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '17px',
              }
              }>
              Confirm Deposit
            </button>
          </div>

        </XBox>
        <XBox ixBackground={true} >
          <h3>Withdraw</h3>


          <div className='mt-5'>
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Asset{" "}
            </label>
            <div className="mt-1 relative">
              <button
                style={{ height: "60px" }}
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <span className="flex items-center">
                  <img
                    src="/img/menuImages/btc.png"
                    alt=""
                    className="flex-shrink-0 h-6 w-6 rounded-full"
                  />
                  <span style={{ color: 'black', }} className="ml-3 block truncate"> BTC </span>
                </span>
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {/* Heroicon name: solid/selector */}
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className='mt-5'>
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Amount{" "}
            </label>
            <div className="mt-1 relative">
              <button
                style={{ height: "60px" }}
                type="button"
                className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                aria-haspopup="listbox"
                aria-expanded="true"
                aria-labelledby="listbox-label"
              >
                <input style={{
                  width: '100%',
                  height: '100%',
                  color: 'black',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                }}
                  value={withdrawAmount}
                  onChange={handleWithdrawAmountChange}
                  min="0"
                  type="number" />
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 " >
                  {/* Heroicon name: solid/selector */}
                  <p style={{ color: 'black', cursor: 'pointer' }} onClick={handleMaxWithdraw}>Max</p>
                </span>
              </button>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }} className="mt-5">
            <label
              style={{ color: 'white', }}
              id="listbox-label"
              className="block text-sm font-medium text-gray-700"
            >
              {" "}
              Available{" "}
            </label>

            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              {tokenBalances['bmap'] ? (tokenBalances['bmap']) : '0'} BMAP
            </p>




            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              {tokenBalances['btc'] ? (tokenBalances['btc'] / 100000000).toFixed(8) : '0.00000000'} BTC
            </p>

          </div>

          <div  className="mt-2" style={{ textAlign: 'right',}}>
            
            <button 
              onClick={onBitmapPegOutSignAndSendMessageClick}
              className="mx-3" style={{
                background: '#FF7248',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '17px',
              }}>
              Withdraw 1 Bitmap
            </button>
            <button 
              onClick={onPegOutSignAndSendMessageClick}
              style={{
                background: '#FF7248',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '17px',
              }}>
              Confirm Withdraw
            </button>
          </div>
        </XBox>
      </div>

      <h3 style={{ fontSize: '30px', color: 'white', }} className="mt-10">Transactions</h3>

      <XBox>

        <div style={{ textAlign: "-webkit-center", }}>

          <div style={{ maxWidth: '95%' }} className="grid grid-cols-1 gap-10 lg:grid-cols-2 2xl:grid-cols-2 mt-4">

            <div className="flex flex-col">
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">Deposit</th>
                          <th scope="col" className="px-6 py-4">Amount</th>
                          <th scope="col" className="px-6 py-4">Transaction Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {peginsData.map((peg, index) => (
                          <tr key={index} className="border-b dark:border-neutral-500">
                            <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                            <td className="whitespace-nowrap px-6 py-4">{peg.amount_sum / 100000000} BTC</td> {/* Convert sats to BTC */}
                            <td className="whitespace-nowrap px-6 py-4">{peg.L1txid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left text-sm font-light">
                      <thead className="border-b font-medium dark:border-neutral-500">
                        <tr>
                          <th scope="col" className="px-6 py-4">Withdraw</th>
                          <th scope="col" className="px-6 py-4">Amount</th>
                          <th scope="col" className="px-6 py-4">Transaction Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pegOutsData.map((transaction, index) => (
                          <tr key={index} className="border-b dark:border-neutral-500">
                            <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                            <td className="whitespace-nowrap px-6 py-4">{(transaction.amount / 100000000)} BTC</td> {/* Convert satoshis to BTC */}
                            <td className="whitespace-nowrap px-6 py-4">{transaction.L1txid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>




      </XBox>

    </Layout>
  );
};

export default Bridge;
