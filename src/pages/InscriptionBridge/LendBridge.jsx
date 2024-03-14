/* global BigInt */
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { signMessage } from "sats-connect";

export default function LendBridge() {
  const { NETWORK, ordinalsAddress, BISON_SEQUENCER_ENDPOINT } = useWallet();
  const [assetList, setAssetList] = useState([]);
  const [response, setResponse] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [receiptAddress, setReceiptAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(0);
  const [btcBlance, setBtcBlance] = useState(0);
  const [lendList, setLendList] = useState([]);
  const [borrowerList, setBorrowerList] = useState([]);
  const [inscriptionList, setInscriptionList] = useState([]);
  const [selectedInscription, setSelectedInscription] = useState("");

  useEffect(() => {
    //Query the insertion list
    const fetchBalance = async () => {
      if (!ordinalsAddress) return;
      const payload = {
        address: ordinalsAddress,
      };
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
      const response = await fetch(
        `https://testnet.bisonlabs.io/asset_endpoint/balance`,
        requestOptions
      );
      const responseData = await response.json();
      if (Array.isArray(responseData) && responseData.length > 0) {
        setAssetList(responseData);
        setSelectedAsset(responseData[0].tick+"-"+responseData[0].amount); 
      } else {
        setAssetList([]);
        setSelectedAsset(""); 
      }
      
    };

    const fetchInscriptionBalance = async () => {
      if (!ordinalsAddress) return;
      const payload = {
        address: ordinalsAddress,
      };
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
      const response = await fetch(
        `https://testnet.bisonlabs.io/asset_endpoint/inscriptions`,
        requestOptions
      );
      const responseData = await response.json();
      if (Array.isArray(responseData) && responseData.length > 0) {
        setInscriptionList(responseData);
        setSelectedInscription(responseData[0].inscription); 
      } else {
        setInscriptionList([]);
        setSelectedInscription(""); 
      }
      
    };
    fetchBalance();
    fetchBtcBalance();
    fetchInscriptionBalance();
  }, [ordinalsAddress]);


  const fetchBtcBalance = async (contract) => {
    const url = `https://testnet.bisonlabs.io/btc_endpoint/balance`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setBtcBlance(data.balance)
    } catch (error) {
      console.error('Error:', error);
    }
  }



  const lend_list = async (contract) => {
    const url = `https://testnet.bisonlabs.io/lend_endpoint/lend_list`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress,type:'lender' }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setLendList(data)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const borrower_list = async (contract) => {
    const url = `https://testnet.bisonlabs.io/lend_endpoint/lend_list`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress,type:'borrower' }), // Assuming ordinalsAddress is a state or prop
      });
      const data = await response.json();
      setBorrowerList(data)
    } catch (error) {
      console.error('Error:', error);
    }
  }


  const handleSelectChange = (event) => {
    setSelectedAsset(event.target.value);
  };

  const handleSelectInscriptionChange = (event) => {
    setSelectedInscription(event.target.value);
  };
  
  const handlePegIn = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
    const payload = {
      method: "asset_peg_in",
      rAddr: ordinalsAddress,
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    //Bridge in request
    const response = await fetch(
      `https://testnet.bisonlabs.io/asset_endpoint/bridge_peg_in`,
      requestOptions
    );
    const responseData = await response.json();
    if (!responseData.address) {
      alert("bridge peg in address null!");
      return;
    }
    setResponse(responseData);
    setIsClicked(true);
  };
  const repay_lend = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
     //Obtain the nonce of the address
     const nonceResponse = await fetch(
        `${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`
      );
      const nonceData = await nonceResponse.json();
      const nonce = nonceData.nonce + 1;
      const filteredBorrowerList = borrowerList.filter(item => item.status == 'ing');
      if(filteredBorrowerList.length==0){
        alert("no borrower record");
        return;
      }
      const borrower=filteredBorrowerList[0];
      const messageObj = {
        method: "repay_lend_swap",
        tick1: borrower.tick1,
        tick2: borrower.tick2,
        amount2: parseInt(borrower.amount2),
        inscription: borrower.inscription,
        repayAmount:  parseInt(borrower.repay_amount),
        lenderContractAddr: borrower.lender_contract_addr,
        lenderAddr: borrower.lender_addr,
        borrowerAddr: borrower.borrower_addr,
        borrowerSig: "",
        lend_hash: borrower.lend_hash,
        nonce: nonce,
        slippage: 0.02
      };
      //Obtain gas fees
      const gasResponse = await fetch(
        `${BISON_SEQUENCER_ENDPOINT}/gas_meter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageObj),
        }
      );
      const gasData = await gasResponse.json();
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
          messageObj.borrowerSig = response;
          onSendMessageClick(messageObj);
        },
        onCancel: () => alert("Canceled"),
      };
      await signMessage(signMessageOptions);

  }

  const lend = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
     //Obtain nonce
     const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
     const nonceData = await nonceResponse.json();
     const nonce = nonceData.nonce + 1;
     const lenderAddr=ordinalsAddress;
     const borrowerAddr=ordinalsAddress;
     const amount1=10000;
     const method="lend_swap";
     const lenderContractAddr="tb1p938g8dt7pr5hhty7smf3ykrf5qrd533xa5f7vpdjxf30hlq03aqsv5g2va";
     const tick1="btc";
     const expiry = new Date(new Date().getTime() + 1 * 60000).toISOString();
     const contractExpireTime = new Date(new Date().getTime() + 1 * 60000*5).toISOString();
     //获取amount2和tick2
     const tick2=selectedAsset.split("-")[0]
     const amount2=selectedAsset.split("-")[1]
     const messageObj = {
       method: method,
       tick1: tick1,
       amount1: parseInt(amount1),
       tick2: tick2,
       amount2: parseInt(amount2)/2,
       inscription: '',
       repayAmount: parseInt(amount1*1.5),
       offExpiryTime: expiry,
       contractExpireTime: contractExpireTime,
       lenderContractAddr: lenderContractAddr,
       lenderAddr: lenderAddr,
       lenderSig: "",
       borrowerAddr: "",
       borrowerSig: "",
       nonce: nonce,
       slippage: 0.02,
     };
     const messageObj2 = {
        method: method,
        tick1: tick1,
        amount1: parseInt(amount1),
        tick2: tick2,
        amount2: parseInt(amount2)/2,
        inscription: '',
        repayAmount: parseInt(amount1*1.5),
        offExpiryTime: expiry,
        contractExpireTime: contractExpireTime,
        lenderContractAddr: lenderContractAddr,
        lenderAddr: "",
        lenderSig: "",
        borrowerAddr: borrowerAddr,
        borrowerSig: "",
        nonce: nonce,
        slippage: 0.02,
      };
     // Send messageObj to/gas first_ Meter to obtain gas data
     const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(messageObj),
     });
     const gasData = await gasResponse.json();
     // Update messageObj to include gas data
     messageObj.gas_estimated = gasData.gas_estimated;
     messageObj.gas_estimated_hash = gasData.gas_estimated_hash;
     messageObj2.gas_estimated = gasData.gas_estimated;
     messageObj2.gas_estimated_hash = gasData.gas_estimated_hash;
 
     const signMessageOptions = {
       payload: {
         network: {
           type: NETWORK,
         },
         address: ordinalsAddress,
         message: JSON.stringify(messageObj),
       },
       onFinish: (response) => {
         messageObj.lenderSig = response;
         alert("messageObj.lenderSig:"+messageObj.lenderSig)
         borrowerSign(messageObj,messageObj2);
       },
       onCancel: () => alert("Swap canceled"),
     };
     await signMessage(signMessageOptions);

  }
  




  const inscription_lend = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
     //Obtain nonce
     const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
     const nonceData = await nonceResponse.json();
     const nonce = nonceData.nonce + 1;
     const lenderAddr=ordinalsAddress;
     const borrowerAddr=ordinalsAddress;
     const amount1=10000;
     const method="lend_swap";
     const lenderContractAddr="tb1p938g8dt7pr5hhty7smf3ykrf5qrd533xa5f7vpdjxf30hlq03aqsv5g2va";
     const tick1="btc";
     const expiry = new Date(new Date().getTime() + 1 * 60000).toISOString();
     const contractExpireTime = new Date(new Date().getTime() + 1 * 60000*5).toISOString();
     //获取amount2和tick2
     const tick2="inscription"
     const amount2=selectedInscription
     const messageObj = {
       method: method,
       tick1: tick1,
       amount1: parseInt(amount1),
       tick2: tick2,
       amount2: 546,
       inscription: selectedInscription,
       repayAmount: parseInt(amount1*1.5),
       offExpiryTime: expiry,
       contractExpireTime: contractExpireTime,
       lenderContractAddr: lenderContractAddr,
       lenderAddr: lenderAddr,
       lenderSig: "",
       borrowerAddr: "",
       borrowerSig: "",
       nonce: nonce,
       slippage: 0.02,
     };
     const messageObj2 = {
        method: method,
        tick1: tick1,
        amount1: parseInt(amount1),
        tick2: tick2,
        amount2: 546,
        inscription: selectedInscription,
        repayAmount: parseInt(amount1*1.5),
        offExpiryTime: expiry,
        contractExpireTime: contractExpireTime,
        lenderContractAddr: lenderContractAddr,
        lenderAddr: "",
        lenderSig: "",
        borrowerAddr: borrowerAddr,
        borrowerSig: "",
        nonce: nonce,
        slippage: 0.02,
      };
     // Send messageObj to/gas first_ Meter to obtain gas data
     const gasResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/gas_meter`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(messageObj),
     });
     const gasData = await gasResponse.json();
     // Update messageObj to include gas data
     messageObj.gas_estimated = gasData.gas_estimated;
     messageObj.gas_estimated_hash = gasData.gas_estimated_hash;
     messageObj2.gas_estimated = gasData.gas_estimated;
     messageObj2.gas_estimated_hash = gasData.gas_estimated_hash;
 
     const signMessageOptions = {
       payload: {
         network: {
           type: NETWORK,
         },
         address: ordinalsAddress,
         message: JSON.stringify(messageObj),
       },
       onFinish: (response) => {
         messageObj.lenderSig = response;
         alert("messageObj.lenderSig:"+messageObj.lenderSig)
         borrowerSign(messageObj,messageObj2);
       },
       onCancel: () => alert("Swap canceled"),
     };
     await signMessage(signMessageOptions);

  }
  

  const borrowerSign= async(messageObj,messageObj2) =>{
    
    const signMessageOptions2 = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(messageObj2),
      },
      onFinish: (response) => {
        messageObj.borrowerSig = response;
        messageObj.borrowerAddr = ordinalsAddress;
        alert("messageObj.borrowerSig:"+messageObj.borrowerSig)
        onSendMessageClick(messageObj);
      },
      onCancel: () => alert("Swap canceled"),
    };
    await signMessage(signMessageOptions2);

  }

  //send message
  const onSendMessageClick = async (signedMessage) => {
    await fetch(`${BISON_SEQUENCER_ENDPOINT}/enqueue_transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signedMessage),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(JSON.stringify(data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">
     <span style={{background: "#ffffff",
            padding: "13px",
            borderRadius: "10px",}}> BTC AMOUNT: {btcBlance/100000000}</span>

        <select value={selectedAsset} onChange={handleSelectChange}>
          {assetList.map((asset, index) => (
            <option key={index} value={asset.tick+'-'+asset.amount}>
              {asset.tick+'-'+asset.amount/100000000}
            </option>
          ))}
        </select>

        <select value={selectedInscription} onChange={handleSelectInscriptionChange}>
          {inscriptionList.map((asset, index) => (
            <option key={index} value={asset.inscription}>
              {asset.inscription}
            </option>
          ))}
        </select>
        <button
          onClick={handlePegIn}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
          PegIn mortgage asset
        </button>
        {isClicked && (
          <strong style={{ color: "white" }}>
            Send brc20 <br /> ONLY from {ordinalsAddress} <br />
            to {response ? response.address : "error"}
            <br />
            Last Deposit Status: {response ? response.status : ""}
          </strong>
        )}
        
        
        <button
          onClick={lend}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
          lend 
        </button>

        <button
          onClick={repay_lend}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
          repay lend first 
        </button>

        <button
          onClick={inscription_lend}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
          inscription_lend 
        </button>


        <button
          onClick={lend_list}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
           lend list
        </button>

        <button
          onClick={borrower_list}
          style={{
            background: "#ff7248",
            padding: "13px",
            borderRadius: "10px",
          }}
        >
           borrower list
        </button>

            {/* show borrower list */}
            {borrowerList.length > 0 && (
                <div>
                <h2>Borrower List</h2>
                <ul><li>Borrow coins - Collateral assets - Collateral amount - Repayment amount</li>
                    {borrowerList.map((item, index) => (
                    <li key={index}>{item.tick1+'-'+item.tick2+"-"+item.amount2/100000000
                    +'-'+item.repay_amount+'-'+item.status
                    }</li>
                    ))}
                </ul>
                </div>
            )}
            {/*  show lend list */}
            {lendList.length > 0 && (
                <div>
                <h2>Lend List</h2>
                <ul><li>Borrow coins - Collateral assets - Collateral amount - Repayment amount</li>
                    {lendList.map((item, index) => (
                    <li key={index}>{item.tick1+'-'+item.tick2+"-"+item.amount2/100000000
                    +'-'+item.repay_amount+'-'+item.status 
                    }</li>
                    ))}
                </ul>
                </div>
            )}
      </div>
    </Layout>
  );
}
