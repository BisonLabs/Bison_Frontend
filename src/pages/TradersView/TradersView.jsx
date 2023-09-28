import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import XBox from "../../components/XBox";
import ReactApexChart from "react-apexcharts";

export default function TradersView() {
  const [latestPrice, setLatestPrice] = useState(null);
  const [lineGraphData, setLineGraphData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("1h");
  const [timeLabels, setTimeLabels] = useState([]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("Laser");
  const [toToken, setToToken] = useState("BTC");



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
                    width: "100%",
                    height: "100%",
                    color: "black",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="Amount"
                  type="text"
                />

                <select
                  style={{
                    backgroundColor: "#FF7248",
                    padding: "1px 15px",
                    borderRadius: "6px",
                    border: "none",
                  }}
                  name="dog-names"
                  id="dog-names"
                >
                  <option value="dave">Laser</option>
                  <option value="rigatoni">BTC</option>
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
                  style={{
                    width: "100%",
                    height: "100%",
                    color: "black",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                  placeholder="Amount"
                  type="text"
                />

                <select
                  style={{
                    backgroundColor: "#FF7248",
                    padding: "1px 15px",
                    borderRadius: "6px",
                    border: "none",
                  }}
                  name="dog-names"
                  id="dog-names"
                >
                  <option value="dave">BTC</option>
                  <option value="rigatoni">Laser</option>
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
                style={{
                  background: "#ff7248",
                  padding: "13px",
                  borderRadius: "35px",
                  marginTop: "27px",
                }}
              >
                Swap
              </button>
            </XBox>
          </div>
        </div>
      </Layout>
    </>
  );
}