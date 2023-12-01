import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import ReactApexChart from "react-apexcharts";
import { useWallet } from "../../WalletContext";
import {  signMessage } from "sats-connect";



export default function TradersView() {
  const [latestPrice, setLatestPrice] = useState(null);
  const [lineGraphData, setLineGraphData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("1h");
  const [timeLabels, setTimeLabels] = useState([]);
  const { ordinalsAddress,BISON_SEQUENCER_ENDPOINT,NETWORK } = useWallet(); // 使用useWallet钩子
  const [contracts, setContracts] = useState([]);
  const [tokenBalances, setTokenBalances] = useState({});
  const [selectedSwapToken1, setSelectedSwapToken1] = useState("btc");
  const [selectedSwapToken2, setSelectedSwapToken2] = useState("laser");
  const [availableSwapOptions, setAvailableSwapOptions] = useState([]);
  const [swapContracts, setSwapContracts] = useState([]);
  const [allTokensFromSwap, setAllTokensFromSwap] = useState([]);
  const [quoteID, setQuoteID] = useState(null);
  const [swapAmount, setSwapAmount] = useState("");
  const [amount2, setAmount2] = useState("");
  const [quote, setQuote] = useState(null);




  useEffect(() => {
    const fetchPriceData = () => {
      fetch('http://192.168.254.80:4000/quote_history')
        .then(response => response.json())
        .then(data => {
          let aggregationFactor = 12;  // Default for 1m
          if (timeFrame === "1h") aggregationFactor = 720;
          if (timeFrame === "1d") aggregationFactor = 17280;

          let maxDataPoints = 0;
          if (timeFrame === "1m") maxDataPoints = 120;
          if (timeFrame === "1h") maxDataPoints = 48;
          if (timeFrame === "1d") maxDataPoints = 7;

          const aggregatedData = [];
          const timeLabels = [];
          for (let i = 0; i < data.length; i += aggregationFactor) {
            const slice = data.slice(i, i + aggregationFactor);
            const average = slice.reduce((a, b) => a + b[1], 0) / slice.length;
            aggregatedData.push(average);

            const date = new Date(slice[0][0] * 1000);
            const localTime = date.toLocaleTimeString();
            timeLabels.push(localTime);
          }

          const filteredData = aggregatedData.slice(-maxDataPoints);
          const filteredTimeLabels = timeLabels.slice(-maxDataPoints);

          setLineGraphData(filteredData);
          setTimeLabels(filteredTimeLabels);

          if (data.length > 0) {
            setLatestPrice(data[data.length - 1][1]);
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    fetchPriceData();
    const intervalId = setInterval(fetchPriceData, 5000);
    return () => clearInterval(intervalId);
  }, [timeFrame]);

  const series = [
    {
      name: "Laser Price",
      type: "column",
      data: lineGraphData,
    },
  ];


  const options = {
    chart: {
      height: 500,
      type: 'line',
      stacked: false,
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
    },
    stroke: {
      width: 1,
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%'
      }
    },
    fill: {
      opacity: [0.85, 0.25, 1],
      gradient: {
        inverseColors: false,
        shade: 'light',
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [100, 100, 100, 100]
      }
    },
    labels: timeLabels,  // 使用新的 timeLabels 状态变量
    markers: {
      size: 0
    },
    xaxis: {
      type: 'text'
    },
    yaxis: {
      min: 0
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return y.toFixed(0) + " sats";
          }
          return y;
        }
      },
      style: {
        fontSize: '12px',
        colors: ['#000']  // Setting tooltip text color to black
      }
    }
  };


  //This part of code is for swap

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

      if (selectedSwapToken1.toLowerCase() === "btc") {
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
    if (selectedSwapToken1 === 'btc') {
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

    if (selectedSwapToken1.toLowerCase() === "btc") {
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
    setSwapAmount("");
  }, [selectedSwapToken1]);

  return (
    <>
      <style>{`
        .apexcharts-tooltip {
          color: black !important;
          background-color: white !important;
        }
      `}</style>

      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">
          <div className="col-span-3">
            <XBox height="700">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 17px",
                }}
              >
                <p> Laser Price </p>
                <select
                  style={{
                    backgroundColor: "transparent",
                    padding: "1px 15px",
                    borderRadius: "6px",
                    border: "1px solid #787676",
                    color: "#787676",
                  }}
                  name="dog-names"
                  id="dog-names"
                >
                  <option
                    style={{ backgroundColor: "#787676", color: "black" }}
                    value="dave"
                  >
                    SATS
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <select
                    style={{
                      backgroundColor: "transparent",
                      padding: "1px 15px",
                      borderRadius: "6px",
                      border: "none",
                      color: "#787676",
                    }}
                    name="dog-names"
                    id="dog-names"
                  >
                    <option
                      style={{ backgroundColor: "#787676", color: "black" }}
                      value="dave"
                    >
                      Laser/Sats
                    </option>
                  </select>

                  <h3 style={{ padding: "5px 20px" }}>
                    {latestPrice !== null ? latestPrice.toFixed(2) : 'Loading...'} sats
                  </h3>

                </div>

                <div style={{ display: "flex" }}>
                  <p
                    onClick={() => setTimeFrame("1m")}
                    style={{
                      margin: "0px 10px",
                      border: "1px solid #787676",
                      color: timeFrame === "1m" ? "black" : "#787676",  // Changed
                      padding: "0px 22px",
                      borderRadius: "19px",
                      fontSize: "15px",
                      cursor: "pointer",
                      backgroundColor: timeFrame === "1m" ? "blue" : "transparent",  // Changed
                    }}
                  >
                    {" "}
                    1m{" "}
                  </p>
                  <p
                    onClick={() => setTimeFrame("1h")}
                    style={{
                      margin: "0px 10px",
                      border: "1px solid #787676",
                      color: timeFrame === "1h" ? "black" : "#787676",  // Changed
                      padding: "0px 22px",
                      borderRadius: "19px",
                      fontSize: "15px",
                      cursor: "pointer",
                      backgroundColor: timeFrame === "1h" ? "blue" : "transparent",  // Changed
                    }}
                  >
                    {" "}
                    1h{" "}
                  </p>
                  <p
                    onClick={() => setTimeFrame("1d")}
                    style={{
                      margin: "0px 10px",
                      border: "1px solid #787676",
                      color: timeFrame === "1d" ? "black" : "#787676",  // Changed
                      padding: "0px 22px",
                      borderRadius: "19px",
                      fontSize: "15px",
                      cursor: "pointer",
                      backgroundColor: timeFrame === "1d" ? "blue" : "transparent",  // Changed
                    }}
                  >
                    {" "}
                    1d{" "}
                  </p>
                </div>

              </div>

              <div id="chart">
                <ReactApexChart options={options} series={series} type="line" height={500} />
              </div>

            </XBox>
          </div>

          <div className="col-span-2">
            <XBox isBackground={true}>
              <h3 className="text-center">Swap</h3>
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
                  {selectedSwapToken2.toLowerCase() === "btc" ? (amount2 / 100000000).toFixed(8) : amount2}
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

              <p
                style={{
                  marginTop: "15px",
                  fontSize: "15px",
                }}
              >
              </p>

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
          </div>
        </div>
      </Layout>
    </>
  );
}