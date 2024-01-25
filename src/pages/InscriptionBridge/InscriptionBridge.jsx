/* global BigInt */
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { signMessage } from "sats-connect";

export default function InscriptionBridge() {
  const { NETWORK, ordinalsAddress, BISON_SEQUENCER_ENDPOINT } = useWallet();
  const [inscriptionList, setInscriptionList] = useState([]);
  const [response, setResponse] = useState(null);
  const [isClicked, setIsClicked] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState("");
  const [receiptAddress, setReceiptAddress] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState(0);

  useEffect(() => {
    //Query the insertion list
    const fetchInscriptions = async () => {
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
        `https://testnet.bisonlabs.io/inscription_endpoint/inscriptions`,
        requestOptions
      );
      const responseData = await response.json();
      if (Array.isArray(responseData) && responseData.length > 0) {
        setInscriptionList(responseData);
        setSelectedInscription(responseData[0].inscription); // default selectedInscription
      } else {
        setInscriptionList([]);
        setSelectedInscription(""); // If there is no inscription, set selectedInsertion to an empty string
      }
      
    };
    fetchInscriptions();
  }, [ordinalsAddress]);

  const handleSelectChange = (event) => {
    setSelectedInscription(event.target.value);
  };

  const handleReceiptAddressChange = (e) => {
    let address = e.target.value.replace(/\s/g, "");
    setReceiptAddress(address);
  };

  const handlePegIn = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
    const payload = {
      method: "peg_in",
      rAddr: ordinalsAddress,
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    //Bridge in request
    const response = await fetch(
      `https://testnet.bisonlabs.io/inscription_endpoint/bridge_peg_in`,
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

  const handleTransfer = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
    if (!receiptAddress) {
      alert("Please set receive Wallet First");
      return;
    }
    //Obtain the nonce of the address
    const nonceResponse = await fetch(
      `${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`
    );
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;
    //transfer method,amt,tick,tokenContractAddress default fixed value
    const messageObj = {
      method: "inscription_transfer",
      sAddr: ordinalsAddress,
      rAddr: receiptAddress,
      amt: 546,
      inscription: selectedInscription,
      tick: "inscription",
      nonce: nonce,
      tokenContractAddress:
        "tb1pdy0zaspcgzjwv6gjqxl32dlkxhwtrnc4vg9tjpw8w7n5ngvudevs6yf7j4",
      sig: "",
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
        messageObj.sig = response;
        onSendMessageClick(messageObj);
      },
      onCancel: () => alert("Canceled"),
    };
    await signMessage(signMessageOptions);
  };

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
  
  const onPegOutSignAndSendMessageClick = async () => {
    if (!ordinalsAddress) {
      alert("Please Connect Wallet First");
      return;
    }
    if (!withdrawAddress) {
      alert("Please set withdrawAddress First");
      return;
    }
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;
    const pegOutMessageObj = {
      method: "inscription_peg_out",
      "token": "inscription",
      sAddr: ordinalsAddress,
      rAddr: withdrawAddress, // Assuming receiptAddress is a state or prop
      "inscription": selectedInscription,
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
        onSendMessageClick(pegOutMessageObj);

      },
      onCancel: () => alert("Request canceled."),
    };

    await signMessage(signMessageOptions);
  }


  const amount2=10000;
  const method="inscription_swap";
  const contractAddress1="tb1pdy0zaspcgzjwv6gjqxl32dlkxhwtrnc4vg9tjpw8w7n5ngvudevs6yf7j4";
  const contractAddress2="tb1pqzv3xwp40antfxdslnddj6zda4r5uwdh89qy7rrzjsat4etrvxxqq2fmjq";
  const tick1="inscription";
  const tick2="btc";
  const expiry = new Date(new Date().getTime() + 1 * 60000).toISOString();

  const handleSwapClick = async () => {
    //Obtain nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1;

    const messageObj = {
      method: method,
      expiry: expiry,
      tick1: tick1,
      contractAddress1: contractAddress1,
      inscription: selectedInscription,
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
    const messageObj2 = {
      method: method,
      expiry: expiry,
      tick1: tick1,
      contractAddress1:contractAddress1 ,
      inscription: selectedInscription,
      tick2: tick2,
      contractAddress2: contractAddress2,
      amount2: amount2,
      makerAddr: "",
      takerAddr: ordinalsAddress,
      nonce: nonce,
      slippage: 0.02,
      makerSig: "",
      takerSig: ""
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
        messageObj.makerSig = response;
        alert("messageObj.makerSig:"+messageObj.makerSig)
        taker2Sign(messageObj,messageObj2);
      },
      onCancel: () => alert("Swap canceled"),
    };
    await signMessage(signMessageOptions);
  };

  const taker2Sign= async(messageObj,messageObj2) =>{
    
    const signMessageOptions2 = {
      payload: {
        network: {
          type: NETWORK,
        },
        address: ordinalsAddress,
        message: JSON.stringify(messageObj2),
      },
      onFinish: (response) => {
        messageObj.takerSig = response;
        messageObj.takerAddr = ordinalsAddress;
        alert("messageObj.takerSig:"+messageObj.takerSig)
        onSendMessageClick(messageObj);
      },
      onCancel: () => alert("Swap canceled"),
    };
    await signMessage(signMessageOptions2);

  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">
        <select value={selectedInscription} onChange={handleSelectChange}>
          {inscriptionList.map((inscription, index) => (
            <option key={index} value={inscription.inscription}>
              {inscription.inscription}
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
          PegIn
        </button>
        {isClicked && (
          <strong style={{ color: "white" }}>
            Send your inscriptions <br /> ONLY from {ordinalsAddress} <br />
            to {response ? response.address : "error"}
            <br />
            Last Deposit Status: {response ? response.status : ""}
          </strong>
        )}
        
        
        <div>
        <div style={{ display: "flex", alignItems: "center" }}>
      <h3 style={{ flex: 1 }}>Transfer</h3>
      <br />
      <div style={{ flex: 2 }}>
      <input
        style={{
          width: "100%",
          height: "100%",
          color: "white",
          border: "none",
          background: "transparent",
          outline: "none",
        }}
        placeholder="Address"
        type="text"
        value={receiptAddress}
        onChange={handleReceiptAddressChange}
      />
      <button
        style={{
          background: "#ff7248",
          padding: "13px",
          borderRadius: "35px",
          marginTop: "27px",
        }}
        onClick={handleTransfer}
      >
        Transfer
      </button>
    </div>
  </div>



  <div style={{ display: "flex", alignItems: "center" }}>
    <h3 style={{ flex: 1 }}>Withdraw</h3>
    <div style={{ flex: 2 }}>
      
    <input style={{
                width: '100%',
                height: '100%',
                color: 'white',
                border: 'none',
                background: 'transparent',
                outline: 'none',
              }}
                placeholder="withdraw Address"
                type="text"    
                onChange={(e) => setWithdrawAddress(e.target.value)}

              />
      <button
        style={{
          background: "#ff7248",
          padding: "13px",
          borderRadius: "35px",
          marginTop: "27px",
        }}
        onClick={onPegOutSignAndSendMessageClick}
      >
        Confirm Withdraw
      </button>
    </div>
  </div>




  <div>
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
      
  </div>


</div>



      </div>
    </Layout>
  );
}
