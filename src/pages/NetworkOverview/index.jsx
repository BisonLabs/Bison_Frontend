import Layout from "../../components/Layout";
import SmallChartCard from "../../components/Cards/SmallChartCard";
import XBox from '../../components/XBox';
import { NetworkTableItems } from "./data";
import NetworkTable from "../../components/Network/Table";
import "./index.css"
import { useState } from "react";
import { useEffect } from "react";

const NetworkOverview = () => {

  const initialHours = 0;
  const initialMinutes = 10;
  const initialSeconds = 0;

  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      if (hours === 0 && minutes === 0 && seconds === 0) {
        clearInterval(timer);
      } else {
        if (seconds === 0) {
          if (minutes === 0) {
            setHours((prevHours) => prevHours - 1);
            setMinutes(59);
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
          }
          setSeconds(59);
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [hours, minutes, seconds]);


  return (
    <Layout>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 2xl:grid-cols-3">
        <XBox ixBackground={true} gap={true}>
          <SmallChartCard
            header="No of States"
            height={110}
            value="100,000"
            change={-0.03}
            chartData={[5, 2, 5, 3, 2, 1, 6, 2, 5, 6, 8, 9, 8, 7.5,]}
          />
          <SmallChartCard
            header="No of Proofs"
            height={110}
            value="100,000"
            change={-2.3}
            chartData={[3, 5, 2, 3, 4, 2, 6, 4, 6, 7, 0, 3, 4, 3,]}
          />
          <SmallChartCard
            header="No of Transactions"
            height={110}
            value="100,000"
            change={12.3}
            chartData={[8, 7, 6, 7, 5, 4, 7, 4, 6, 5, 6, 3, 4, 6,]}
          />
        </XBox>
        <XBox isBackground={true}>
          <>
                <NetworkTable
                  name="Proof Number"
                  value= "Link"
                />
                <hr />
            {
              NetworkTableItems.map((item, index) => (
                <NetworkTable
                  key={index}
                  imgURL={item.imgURL}
                  name={item.name}
                  value= "View Inscription"
                  gap = '5'
                />
              ))
            }
          </>
        </XBox>
        
        <XBox isBackground={true}>
          <>
                <NetworkTable
                  name="State Number"
                  value= "Link"
                />
                <hr />
            {
              NetworkTableItems.map((item, index) => (
                <NetworkTable
                  key={index}
                  imgURL={item.imgURL}
                  name={item.name}
                  value= "View Inscription"
                  gap = '5'
                />
              ))
            }
          </>
        </XBox>

        <XBox>
          <img src="/img/menuImages/sidebarImg.png" alt="Coin Gainers" style={{maxWidth: '100%', height: '100%'}} />
        </XBox>

        <div className="lg:col-span-2 2xl:col-span-2 col-span-1">
          <XBox>
            <h3 className="text-center" >Next State Update In:</h3>
            <div>
            <div class="clock">
              <div class="flipper">
                <div class="gear"></div>
                <div class="gear"></div>
                <div class="top">
                </div>
                <div class="bottom">
                  <div class="text">{String(hours).padStart(2, "0")}</div>
                </div>
              </div>
              <div class="flipper">
                <div class="gear"></div>
                <div class="gear"></div>
                <div class="top">
                </div>
                <div class="bottom">
                  <div class="text">{String(minutes).padStart(2, "0")}</div>
                </div>
              </div>
              <div class="flipper">
                <div class="gear"></div>
                <div class="gear"></div>
                <div class="top">
                </div>
                <div class="bottom">
                  <div class="text">{String(seconds).padStart(2, "0")}</div>
                </div>
              </div>
            </div>
            </div>
          </XBox>
        </div>


      </div>
    </Layout>
  );
};

export default NetworkOverview;
