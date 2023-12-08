/* global BigInt */
import React from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useState } from "react";
import { useWallet } from "../../WalletContext";
import { useEffect } from "react";
import { signMessage ,sendBtcTransaction} from "sats-connect";
import * as btc from '@scure/btc-signer';
export default function PipeBridge() {


  const [data, setData] = useState({
    asset: '',
    amount: ''
  });

  const [isClicked, setIsClicked] = useState(false);
  const { ordinalsAddress, paymentAddress,PIPE_endpoint,setPIPE_endpoint,BISON_SEQUENCER_ENDPOINT,NETWORK} = useWallet();
  const [pipeResponse, setPipeResponse] = useState(null);
  const [isDepositConfirmed, setIsDepositConfirmed] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [receiptAddress, setReceiptAddress] = useState("");
  const [tokenBalances, setTokenBalances] = useState({});
  const [amt, setAmt] = useState(0);
  

  const [pipeBalanceAmount, setPipeBalanceAmount] = useState(0);


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

  const fetchPipeBalance = async () => {
    const url = `${PIPE_endpoint}/pipe_balance`;
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
      setPipeBalanceAmount(data.balance/100000000);
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

  const handlePipePegIn = async () => {

    if (!ordinalsAddress) {
      alert('Please Connect Wallet First'); // 或者使用更高级的弹窗提示
      return;
    }

    if (isDepositConfirmed) {
      return; // 如果已经确认过存款，直接返回
    }

    const amtMultiplied = parseInt(data.amount) * Math.pow(10, 8);

    const payload = {
      method: "pipe_peg_in",
      rAddr: ordinalsAddress,
      amt: amtMultiplied
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };
    const ec = new TextEncoder()
    const response = await fetch(`${PIPE_endpoint}/pipe_bridge_peg_in`, requestOptions);
    const responseData = await response.json();
    setPipeResponse(responseData);
    if(!responseData.address){
      alert("pipe bridge peg in address null!");
      return;
    }
    console.log("sign transfer address:"+ responseData.address+",amount: "+data.amount)
    
    // let all_utxo = [];
    // let rate_fee = {};
    // if(NETWORK == 'Testnet'){
    //   const htmlContent=await fetch("https://mempool.space/testnet/api/v1/fees/recommended");
    //   if(htmlContent.status !='200'){
    //     alert("get recomment fee error,please retry later");
    //     return;
    //   }
    //   rate_fee = JSON.parse(await htmlContent.text());
    //   //查询utox的全部列表
    //   all_utxo =  await get_no_inscribe_utxo("bc1pv0fgr40y3hvgj3xamkmz278fa5jyd5xwc8kx2umxq483ufg7ggfs24997t");
    // }else{
    //   const htmlContent=await fetch("https://mempool.space/testnet/api/v1/fees/recommended");
    //   if(htmlContent.status !='200'){
    //     alert("get recomment fee error,please retry later");
    //     return;
    //   }
    //   rate_fee = JSON.parse(await htmlContent.text());
    //   //获取测试utxo列表
    //    all_utxo =  await get_test_utxo(ordinalsAddress);
    // }
    // console.log(all_utxo)
    // console.log("get rate_fee :"+rate_fee)
    // //获取最新的推荐费用
    // if(rate_fee.fastestFee){
    //   const bitcoinTestnet = {
    //     bech32: 'tb',
    //     pubKeyHash: 0x6f,
    //     scriptHash: 0xc4,
    //     wif: 0xef,
    //   }
    //   // 发起一笔转账
    //   let TRANSFER = data.amount;
    //   const SYMBOL ='PIPE';
    //   const ID= 0;
    //   let fee = rate_fee.fastestFee*300;
    //   let recipientAmount=546;
    //   const tx = new btc.Transaction();
    //     tx.addInput({
    //         txid: all_utxo[0].txid,
    //         index: all_utxo[0].index,
    //         tapInternalKey: ordinalPublicKeyHex,
    //         sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY
    //     });
    //     tx.addOutputAddress(responseData.address, BigInt(recipientAmount), bitcoinTestnet)
    //     const psbt = tx.toPSBT(0)
    //     const psbtB64 = base64.encode(psbt)
    //     console.log(psbt)
    //     console.log(psbtB64)
    //     const signPsbtOptions = {
    //         payload: {
    //             network: {
    //                 type: NETWORK,
    //             },
    //             message: "Sign Transaction",
    //             psbtBase64: psbtB64,
    //             broadcast: false,
    //             inputsToSign: [
    //                 {
    //                     address: ordinalsAddress,
    //                     signingIndexes: [index],
    //                     sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
    //                 }
    //             ],
    //         },
    //         onFinish: (response) => {
    //             console.log(response);
    //             alert(response.psbtBase64);
    //         },
    //         onCancel: () => alert("Canceled"),
    //     };
    //     await signTransaction(signPsbtOptions);
    // }
    setIsClicked(true); 
  };

  const get_test_utxo = async (ordinalsAddress)  =>{
    const all_utxo = await fetch(`https://mempool.space/testnet/api/address/${ordinalsAddress}/utxo`);
    const data1 = await all_utxo.json();
    const confirmedUTXOs = data1.filter(utxo => utxo.status.confirmed === true);
    return confirmedUTXOs;
  }
  const get_no_inscribe_utxo = async (ordinalsAddress)  =>{
    const key="3d4837ba9e785091127df3658c2335783ca87dfe23f9a37e61f1cb269517274f";
    const allOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" ,
              "Authorization":`Bearer ${key}`}
    };
    const all_utxo = await fetch(`https://open-api.unisat.io/v1/indexer/address/${ordinalsAddress}/utxo-data`,allOptions);
    const data1 = await all_utxo.json();
    const utxo_with_inscriptions = data1.data.utxo.filter(utxo => utxo.inscriptions.length == 0);
    return utxo_with_inscriptions;
  }

  const textToHex =(text) => {
    var encoder = new TextEncoder().encode(text);
    return [...new Uint8Array(encoder)]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("");
  }

  const toBytes =(number) =>{
    if (typeof number !== 'bigint') {
      throw new Error("Input must be a BigInt");
    }

    if (number < 0n) {
      throw new Error("BigInt must be non-negative");
    }

    if (number === 0n) {
      return new Uint8Array().buffer;
    }
    const size = Math.ceil((number === 0n ? 0 : number.toString(2).length) / 8);
    const bytes = new Uint8Array(size);
    let x = number;
    for (let i = size - 1; i >= 0; i--) {
      bytes[i] = Number(x & 0xFFn);
      x >>= 8n;
    }
    return bytes.buffer;
  }
  const charRange =(start, stop)=> {
    var result = [];

    // get all chars from starting char
    // to ending char
    var i = start.charCodeAt(0),
            last = stop.charCodeAt(0) + 1;
    for (i; i < last; i++) {
      result.push(String.fromCharCode(i));
    }

    return result;
  }

  const toInt26 =(str) =>{
    var alpha = charRange('a', 'z');
    var result = 0n;

    // make sure we have a usable string
    str = str.toLowerCase();
    str = str.replace(/[^a-z]/g, '');

    // we're incrementing j and decrementing i
    var j = 0n;
    for (var i = str.length - 1; i > -1; i--) {
      // get letters in reverse
      var char = str[i];

      // get index in alpha and compensate for
      // 0 based array
      var position = BigInt(''+alpha.indexOf(char));
      position++;

      // the power kinda like the 10's or 100's
      // etc... position of the letter
      // when j is 0 it's 1s
      // when j is 1 it's 10s
      // etc...
      const pow = (base, exponent) => base ** exponent;

      var power = pow(26n, j)

      // add the power and index to result
      result += power * position;
      j++;
    }

    return result;
  }

  useEffect(() => {
    if (pipeResponse && pipeResponse.address) {
      checkBalance();
    }
  }, [pipeResponse?.address]);

  useEffect(() => {

    fetchContracts();
  }, [ordinalsAddress]);

  useEffect(() => {
    fetchPipeBalance();
  }, [ordinalsAddress]);


  const checkBalance = async () => {
    let responseData; // 在这里定义
    if (!pipeResponse || !pipeResponse.address) return; // 如果没有 pipeResponse 或 hash，则返回

    const payload = {
      addr: ordinalsAddress
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    };

    try {
      const response = await fetch(`${PIPE_endpoint}/pipe_peg_in_status`, requestOptions);
      responseData = await response.json(); // 在这里只是设置值，而不是定义

      // 更新 pipeResponse 状态
      setPipeResponse(prevState => ({
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

      const pipeContract = data.contracts.find(contract => contract.tick === 'pipe');
      if (pipeContract) {
        setPIPE_endpoint(pipeContract.contractEndpoint);
        fetchBalanceForContract(pipeContract);
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
    if(value>pipeBalanceAmount){
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
      method: "pipe_peg_out",
      token: "pipe",
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


  return (
    <>
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">

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
                  <option value="">TEST (pipe | dmt)</option>
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
                  onClick={() => { handlePipePegIn(); }}
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
                        Send {amt ? (amt / 100000000).toFixed(8) : 0} amount of PIPE to {pipeResponse ? pipeResponse.address : "error"}
                        <br />
                        Status: {pipeResponse ? pipeResponse.status : ""}
                        {remainingTime !== null && <div>Remaining time: {Math.floor(remainingTime / 60000)} minutes {((remainingTime % 60000) / 1000).toFixed(0)} seconds</div>}
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
                  Check Balance
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
                  <option value="">PIPE</option>
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
                  placeholder="withdrawAmount"
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
                {tokenBalances['pipe'] ? (tokenBalances['pipe'] / 100000000).toFixed(8) : '0.00000000'} PIPE
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
                value={receiptAddress}
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
