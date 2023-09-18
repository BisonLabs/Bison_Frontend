import React, {useState, useEffect} from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";


const SwapAndSend = () => {
  const { ordinalsAddress } = useWallet(); // 使用useWallet钩子
  const [contracts, setContracts] = useState([]);
  const [tokenBalances, setTokenBalances] = useState({});
  const [receiptAddress, setReceiptAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTransferToken, setSelectedTransferToken] = useState("");
  const [selectedSwapToken1, setSelectedSwapToken1] = useState("");
  const [selectedSwapToken2, setSelectedSwapToken2] = useState("");

  const BISON_SEQUENCER_ENDPOINT = "http://127.0.0.1:8008";
  
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


  const onSignAndSendMessageClick = async () => {



    // 从contracts数组中找到与selectedTransferToken匹配的合约
    const selectedContract = contracts.find(contract => contract.tick === selectedTransferToken);
    if (!selectedContract) {
      console.error('No contract found for the selected token.');
      return;
    }


    // 获取 nonce
    const nonceResponse = await fetch(`${BISON_SEQUENCER_ENDPOINT}/nonce/${ordinalsAddress}`);
    const nonceData = await nonceResponse.json();
    const nonce = nonceData.nonce + 1; // 确保从JSON响应中正确地获取nonce值

    const messageObj = {
      method: "transfer",
      sAddr: ordinalsAddress,
      rAddr: receiptAddress,
      amt: amount,
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

    const signMessageOptions = {
      payload: {
        network: {
          type: "Testnet",
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

    // Fetch the balance for the existing method (if needed)
    //this.fetchBalance(ordinalsAddress);

    // Fetch the BTC sum for the ordinalsAddress
    //this.fetchBTCSum(ordinalsAddress);
    //this.fetchBTCRate(); // Fetch BTC rate
    //this.fetchContracts();
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
        this.fetchBalance(ordinalsAddress);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }


  const fetchContracts = async () => {
    const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}/contracts_list`);
    const data = await response.json();

    // Fetch the balance for each contract
    for (let contract of data.contracts) {
      await fetchBalanceForContract(contract);
    }

    setContracts(data.contracts);
  }

  useEffect(() => {
    fetchContracts();
  }, []);


  return (
    <Layout>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">

        <XBox isBackground={true} >

         <div style={{display: 'flex'}}>
          <div style={{
            padding: '16px',
            backgroundColor: '#424242',
            borderRadius: '25px'
          }}>
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18 8V7.2C18 6.0799 18 5.51984 17.782 5.09202C17.5903 4.71569 17.2843 4.40973 16.908 4.21799C16.4802 4 15.9201 4 14.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V8M21 12H19C17.8954 12 17 12.8954 17 14C17 15.1046 17.8954 16 19 16H21M3 8V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V11.2C21 10.0799 21 9.51984 20.782 9.09202C20.5903 8.71569 20.2843 8.40973 19.908 8.21799C19.4802 8 18.9201 8 17.8 8H3Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          </div>
         </div>

         <div style={{marginTop: '60px', fontSize: '40px'}}>
          <h3>
            Balance
          </h3>
         </div>

         <div style={{marginTop: '60px', fontSize: '40px'}}>
          <h3>
            $2,377,552.30
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

                <input style={{width: '100%',
                  height: '100%',
                  color: 'white',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',}} type="text" />
              

              <select style={{
                backgroundColor: '#FF7248',
                padding: '1px 15px',
                borderRadius: '6px',
                border: 'none',
              }} name="dog-names" id="dog-names"> 
                  <option value="rigatoni">ZKBT</option> 
                  <option value="dave">BTC</option>
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

                <input style={{width: '100%',
                  height: '100%',
                  color: 'white',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',}} type="text" />

              <select style={{
                backgroundColor: '#FF7248',
                padding: '1px 15px',
                borderRadius: '6px',
                border: 'none',
              }} name="dog-names" id="dog-names"> 
                  <option value="dave">BTC</option>
                  <option value="rigatoni">ZKBT</option> 
              </select>
            </div>

            <p style={{
              marginTop: '15px',
              fontSize: '15px',}}></p>

            <button style={{
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

              <input style={{width: '100%',
                  height: '100%',
                  color: 'white',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',}} 
                  placeholder="Address" 
                  type="text" 
                  value={receiptAddress}
                  onChange={(e) => setReceiptAddress(e.target.value)}

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

              <input style={{width: '100%',
                  height: '100%',
                  color: 'white',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',}} 
                  placeholder="Amount" 
                  type="text" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
              fontSize: '15px',}}></p>

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

      <div style={{marginTop: '45px',}}>
        
        <XBox >
          <div style={{textAlign: "-webkit-center",}}>
            <div style={{maxWidth: '95%'}} className="flex flex-col">
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
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">1</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">2</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">3</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">4</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">5</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">6</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">7</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
                        <tr className="border-b dark:border-neutral-500">
                          <td className="whitespace-nowrap px-6 py-4">8</td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                          <td className="whitespace-nowrap px-6 py-4"></td>
                        </tr>
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
