import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";


const Bridge = () => {
  const { ordinalsAddress, paymentAddress } = useWallet(); // 使用useWallet钩子
  const [btcBalance, setBtcBalance] = useState(0); // 初始化BTC余额为0
  const [contracts, setContracts] = useState([]);
  const [BISON_SEQUENCER_ENDPOINT, setBISON_SEQUENCER_ENDPOINT] = useState("http://127.0.0.1:8008/");
  const [depositeAmount, setDepositeAmount] = useState(0);
  const [tokenBalances, setTokenBalances] = useState({});
  const [bBTCAmount, setBBTCAmount] = useState(0);




  useEffect(() => {

    fetchContracts();
    fetchBTCSum(paymentAddress);
  }, [paymentAddress]);

  //This part of code is used to display BTC balance

  const fetchBTCSum = async (Address) => {
    try {
      const response = await fetch(`https://mempool.space/testnet/api/address/${Address}`);
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

      // Fetch the balance for each contract
      for (let contract of data.contracts) {
        await fetchBalanceForContract(contract);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

    //This part of code is used to deposite BTC
  const handleDepositeAmountChange = (event) => {
      setDepositeAmount(event.target.value);
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
          type: "Testnet",
        },
        address: ordinalsAddress,
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
          type: "Testnet",
        },
        recipients: [
          {
            address: btcContract.contractAddr,
            amountSats: parseInt(depositeAmount * 100000000), // Convert amount to satoshis (assuming depositeAmount is in BTC)
          },
        ],
        senderAddress: paymentAddress,
      },
      onFinish: (response) => {
        alert(response);
        onPegInSignAndSendMessageClick(response);
      },
      onCancel: () => alert("Canceled"),
    };
    await sendBtcTransaction(sendBtcOptions);
}

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
                  value={depositeAmount}
                  onChange={handleDepositeAmountChange} />
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {/* Heroicon name: solid/selector */}
                  <p style={{ color: 'black' }}>Max</p>
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
              Avalible{" "}
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

        <XBox ixBackground={true}>
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
                }} type="number" />
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {/* Heroicon name: solid/selector */}
                  <p style={{ color: 'black' }}>Max</p>
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
              Avalible{" "}
            </label>

            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                {tokenBalances['btc'] ? (tokenBalances['btc'] / 100000000).toFixed(8) : '0.00000000'} BTC
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
            <button style={{
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
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
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
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">Bitcoin BTC</td>
                          <td className="whitespace-nowrap px-6 py-4">$58.3K</td>
                          <td style={{ color: "red" }} className="whitespace-nowrap px-6 py-4">🔻0.04%</td>
                        </tr>
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
