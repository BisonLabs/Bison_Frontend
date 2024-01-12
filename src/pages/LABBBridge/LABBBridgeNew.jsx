/* global BigInt */
import React from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useState } from "react";
import { useWallet } from "../../WalletContext";
import { useEffect } from "react";
import { signMessage ,sendBtcTransaction} from "sats-connect";
export default function LABBBridge() {


  const [data, setData] = useState({
    asset: '',
    amount: ''
  });

  const [isClicked, setIsClicked] = useState(false);
  const { ordinalsAddress, paymentAddress,BISON_SEQUENCER_ENDPOINT,claim_endpoint,LABB_endpoint,setLABB_endpoint,NETWORK} = useWallet();
  const [isDepositConfirmed, setIsDepositConfirmed] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [receiptAddress, setReceiptAddress] = useState("");
  const [tokenBalances, setTokenBalances] = useState({});
  const [amt, setAmt] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [labbResponse, setLabbResponse] = useState(null);
  const [labbBalanceAmount, setLabbBalanceAmount] = useState(0);
  
  const fetchBalanceForContract = async (contract) => {
    const url = `${contract.contractEndpoint}/balance`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress}), // Assuming ordinalsAddress is a state or prop
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
  useEffect(() => {
    fetchLabbBalance();
  }, [ordinalsAddress]);

  
  const fetchLabbBalance = async () => {
    const url = `${LABB_endpoint}/labb_balance`;
    try {
      if( ordinalsAddress==''){
        return;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setLabbBalanceAmount(data.balance/100000000);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleWithdrawAmountChange = (event) => {
    const value = parseFloat(event.target.value);
    if (value >= 0) { // Only update the state if the value is non-negative
      setWithdrawAmount(value);
    }
  };
  const handlePegIn = async () => {

    if (!ordinalsAddress) {
      alert('Please Connect Wallet First'); // 或者使用更高级的弹窗提示
      return;
    }

    if (isDepositConfirmed) {
      return; // 如果已经确认过存款，直接返回
    }

    const amtMultiplied = parseInt(data.amount) * Math.pow(10, 8);

    const payload = {
      method: "peg_in",
      rAddr: ordinalsAddress,
      amt: amtMultiplied
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    const ec = new TextEncoder()
    const response = await fetch(`${LABB_endpoint}/bridge_peg_in`, requestOptions);
    const responseData = await response.json();
    if(!responseData.address){
      alert(" bridge peg in address null!");
      return;
    }
    setLabbResponse(responseData);
    console.log("sign transfer address:"+ responseData.address+",amount: "+data.amount)
    setIsClicked(true); 
  };

  useEffect(() => {

    fetchContracts();
  }, [ordinalsAddress]);

  const claimCall = async ()=>{
    if (!ordinalsAddress) {
      alert('Please Connect Wallet First'); // 或者使用更高级的弹窗提示
      return;
    }
    const payload = {
      token: "LABB",
      address: ordinalsAddress
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    const response = await fetch(`${claim_endpoint}/claim`, requestOptions);
    const responseData = await response.json();
    alert(responseData.message);
    console.log("claimCall address:"+ordinalsAddress+",result:"+responseData.message)
  }

  const checkBalance = async () => {
    let responseData; // 在这里定义
    if (!labbResponse || !labbResponse.address) return; // 如果没有  或 hash，则返回

    const payload = {
      addr: ordinalsAddress
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };

    try {
      const response = await fetch(`${LABB_endpoint}/peg_in_status`, requestOptions);
      responseData = await response.json(); // 在这里只是设置值，而不是定义
      // 更新  状态
      setLabbResponse(prevState => ({
        ...prevState,
        status: responseData.status
      }));
    } catch (error) {
      console.error("Error:", error);
    }

    if (responseData && responseData.amt) {
      setAmt(responseData.amt);
    }

    if (responseData && responseData.status === 'pending' && responseData.timestamp) {
      // 使用Date对象解析返回的GMT时间格式
      const endDate = new Date(responseData.timestamp);
      // 在当前时间基础上加上1小时
      endDate.setHours(endDate.getHours() + 1);

      // 将结束时间保存到状态中
      setEndTime(endDate.getTime());
    }
  };

  useEffect(() => {
    let timer;
    if (endTime) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const remaining = endTime - now;
        setRemainingTime(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [endTime]);

  useEffect(() => {
    fetchContracts();
  }, []);


  const fetchContracts = async () => {
    try {
      const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}contracts_list`);
      const data = await response.json();

      const labbContract = data.contracts.find(contract => contract.tick === 'labb'||contract.tick === 'LABB');
      if (labbContract) {
        setLABB_endpoint(labbContract.contractEndpoint);
        fetchBalanceForContract(labbContract);
      }
      const btcContract = data.contracts.find(contract => contract.tick === 'btc');
      if (btcContract) {
        fetchBalanceForContract(btcContract);
      }


    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if(value>labbBalanceAmount){
      alert("balance insufficient for transfer");
      return;
    }
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const onPegOutSignAndSendMessageClick = async () => {
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;
    if (withdrawAmount == 0) {
        alert("withdraw amount need > 0");
        return;
    }
    if (receiptAddress ==''){
      alert("receipt address is empty");
      return;
    }
    const pegOutMessageObj = {
      method: "peg_out",
      "token": "LABB",
      sAddr: ordinalsAddress,
      rAddr: receiptAddress, // Assuming receiptAddress is a state or prop
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

    const totalWithGas = pegOutMessageObj.gas_estimated; // 用户想要提款的金额加上估计的 gas 费用

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
        sendPegOutMessage(pegOutMessageObj);

      },
      onCancel: () => alert("Request canceled."),
    };

    await signMessage(signMessageOptions);
  }

  const sendPegOutMessage = async (message) => {
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
      })
      .catch((error) => {
        console.error('Error while sending the peg-out message:', error);
      });
  }

 
  const fetchLabbSwapBalance = async (tick1,amount1) => {
    const url = `https://testnet.bisonlabs.io/labb_swap_endpoint/pool_quote`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sAddr: ordinalsAddress,'tick1':tick1,'amount1':amount1}), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setSwap(data)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleTick1AmountChange = async () => {
    const btcAmount = document.getElementsByName("tick1")[0].value;
    fetchLabbSwapBalance('btc',btcAmount*100000000);
  }
  
  const transfer = async (tick) => {
      const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}contracts_list`);
      const data = await response.json();
      let contract = data.contracts.find(contract => contract.tick === 'btc');
      let transferAmount=swap.tick1
      if(tick!='btc'){
        contract = data.contracts.find(contract => contract.tick === 'labb'||contract.tick === 'LABB');
        transferAmount=swap.tick2
      }

       // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1; // 确保从JSON响应中正确地获取nonce值
    const messageObj = {
      method: "transfer",
      sAddr: ordinalsAddress,
      rAddr: swap.contract_address,
      amt: transferAmount,
      tick: tick,
      nonce: nonce,
      tokenContractAddress: contract.contractAddr, // 添加tokenContractAddress
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
  const transferBTC = async () => {
    transfer('btc')
  }
  const transferLABB = async () => {
    transfer('labb')
  }

  
 const poolRemove= async () => {
    // 获取 nonce
  const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
  const nonceData = await nonceResponse.json();
  const nonce = nonceData.nonce + 1; // 确保从JSON响应中正确地获取nonce值
  const messageObj = {
    method: "pool_remove",
    sAddr: ordinalsAddress,
    tick1: 'btc',
    tick2: 'labb',
    "amount1": swap.tick1,
    "amount2": swap.tick2,
    percentage: "0.5",
    nonce: nonce,
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

  const poolAdd = async () => {
       // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1; // 确保从JSON响应中正确地获取nonce值
    const messageObj = {
      method: "pool_add",
      sAddr: ordinalsAddress,
      tick1: 'btc',
      tick2: 'labb',
      "amount1": swap.tick1,
      "amount2": swap.tick2,
      nonce: nonce,
      proportion: (swap.tick1_balance / swap.tick1).toString(),
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
  useEffect(() => {
    fetchLabbSwapBalance('btc',0);
  }, []);
  const [swap, setSwap] = useState({
    tick1:0,
    tick2:0,
    tickswap:0,
    contract_address:'',
    proportion:0,
    tick1_balance:0,
    tick2_balance:0
  });
  return (
    <>
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">
          <button
              onClick={() => { claimCall(); }}
              style={{
                background: "#ff7248",
                padding: "13px",
                borderRadius: "10px",
                display:"None"
              }}
            >
              claim
            </button>
            <div className="col-span-5">
            <XBox isBackground={true} height={isClicked ? 500 : 400}>
              <h3 className="">Contract address: {swap.contract_address} Contract interaction ratio: {swap.tickswap} Current user proportion: {swap.proportion}  tick1: {swap.tick1_balance}   tick2: {swap.tick2_balance}</h3>
              
              BTC<input
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "white",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="btc Amount"
                  type="text"
                  name="tick1"
                />
                <button
                  onClick={handleTick1AmountChange}
                  style={{
                    margin: '0px 10px',
                    background: "white",
                    color: 'black',
                    padding: "13px",
                    borderRadius: "10px",

                  }} >
                  commit
                </button>

                LABB<input 
                  value={swap.tick2/100000000}
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "white",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="labb amount"
                  type="text"
                  name="tick2"
                />
              <div>
                <button onClick={transferBTC} style={{ margin: '0px 10px', background: "white", color: 'black', padding: "13px", borderRadius: "10px" }}>transfer BTC</button>
                <button onClick={transferLABB} style={{ margin: '0px 10px', background: "white", color: 'black', padding: "13px", borderRadius: "10px" }}>transfer LABB</button>
                <button onClick={poolAdd} style={{ margin: '0px 10px', background: "white", color: 'black', padding: "13px", borderRadius: "10px" }}>pool add</button>

                <button onClick={poolRemove} style={{ margin: '0px 10px', background: "white", color: 'black', padding: "13px", borderRadius: "10px" }}>pool remove 50%</button>
              </div>
            </XBox>
            </div>
          <div className="col-span-5">
            <XBox isBackground={true} height={isClicked ? 500 : 400}>

              <h3 className="">Deposit</h3>
              <div
                style={{
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "",
                  marginTop: "30px",
                  backgroundColor: "#424242",
                  padding: "0px 21px",
                  borderRadius: "9px",
                }}
              >

                <select
                  value={data.asset}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#424242",
                    padding: "1px 15px",
                    borderRadius: "6px",
                    border: "none",
                  }}
                  name="asset"
                >
                  <option value="">LABB  balance: {labbBalanceAmount} (Layer One)</option>
                </select>
              </div>

              <div
                style={{
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "30px",
                  backgroundColor: "#424242",
                  padding: "0px 21px",
                  borderRadius: "9px",
                }}
              >
                <input
                  value={data.amount}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "white",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="Amount"
                  type="text"
                  name="amount"
                />

                <p>
                  {data.asset !== "Asset" && data.asset}
                </p>
              </div>

              <div style={{ marginTop: "60px", textAlign: 'right', }}>
                <button
                  onClick={() => { setIsClicked(false) }}
                  style={{
                    margin: '0px 10px',
                    background: "white",
                    color: 'black',
                    padding: "13px",
                    borderRadius: "10px",

                  }} >
                  Cancel
                </button>
                <button
                  onClick={() => { handlePegIn(); }}
                  style={{
                    background: "#ff7248",
                    padding: "13px",
                    borderRadius: "10px",
                  }}
                >
                  Confirm Deposit
                </button>
              </div>

              {isClicked &&
              <>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#3b3b3bb0',
                  borderRadius: '12px',
                  marginTop: '30px',
                }}>
                  <p style={{
                    fontSize: '18px'
                  }}>
                    Order expires in 1 hour. Once complete wait 1 block.
                    <br />
                    <strong>
                      Send { data.amount} LABB tokens <br/> ONLY from {ordinalsAddress} <br/>to {labbResponse ? labbResponse.address : "error"}
                      <br /> 
                      Last Deposit Status: {labbResponse ? labbResponse.status : ""} 
                      {labbResponse && labbResponse.status === "successful" && 
                          <span>
                            &nbsp;Amount: {amt/100000000} LABB
                          </span>
                        }
                    </strong>
                  </p>
                </div>  
              </>
              }

            </XBox>
            {
              isClicked &&
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={checkBalance}
                  style={{
                    backgroundImage: 'linear-gradient(136deg, #FF5722, #6EACFE)',
                    padding: '9px 30px',
                    borderRadius: '8px',
                    color: 'white',
                    height: '73px',
                    fontSize: '23px',
                    marginTop: '30px',
                  }}>
                 Check Last Deposit
                </button>
              </div>
            }



          </div>
          <div className="col-span-5">

          <XBox isBackground={true} height={isClicked ? 500 : 400}>
              <h3 className="">Withdraw</h3>
              <div
                style={{
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "",
                  marginTop: "30px",
                  backgroundColor: "#424242",
                  padding: "0px 21px",
                  borderRadius: "9px",
                }}
              >

                <select
                  value={data.asset}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    backgroundColor: "#424242",
                    padding: "1px 15px",
                    borderRadius: "6px",
                    border: "none",
                  }}
                  name="asset"
                >
                  <option value="">LABB</option>
                </select>
              </div>

              <div
                style={{
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  backgroundColor: "#424242",
                  padding: "0px 21px",
                  borderRadius: "9px",
                }}
              >
                <input
                  value={data.withdrawAmount}
                  onChange={handleWithdrawAmountChange}
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "white",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="Withdraw Amount"
                  type="text"
                  name="withdrawAmount"
                />

                <p>
                  {data.asset !== "Asset" && data.asset}
                </p>
              </div>
              <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }} className="mt-5">
            <label
                style={{ color: 'white', fontSize: '24px' }} // Here's where I've increased the font size.
                id="listbox-label"
                className="block text-sm font-medium text-gray-700"
              >
                {" "}
                Available{" "}
              </label>



              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                {tokenBalances['labb'] ? (tokenBalances['labb'] / 100000000).toFixed(8) : tokenBalances['LABB'] ? (tokenBalances['LABB'] / 100000000).toFixed(8) : '0.00000000'} LABB
              </p>

            </div>

            <div style={{
              height: '55px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
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
                value={receiptAddress.replace(/\s+/g, '')}
                onChange={(e) => setReceiptAddress(e.target.value)}

              />
            </div>
              <div style={{ marginTop: "60px", textAlign: 'right', }}>
                <button
                  onClick={() => { setIsClicked(false) }}
                  style={{
                    margin: '0px 10px',
                    background: "white",
                    color: 'black',
                    padding: "13px",
                    borderRadius: "10px",

                  }} >
                  Cancel
                </button>
                <button
                  onClick={onPegOutSignAndSendMessageClick}
                  style={{
                    background: "#ff7248",
                    padding: "13px",
                    borderRadius: "10px",
                  }}
                >
                  Confirm Withdraw
                </button>
              </div>





            </XBox>
            </div>

        </div>
      </Layout>
    </>
  );
}
