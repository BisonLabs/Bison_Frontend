import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import CoinBox from "../../components/Liquidity/CoinBox";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";



const LiquidityPool = () => {
  const {ordinalsAddress, BISON_SEQUENCER_ENDPOINT} = useWallet();
  const [fakeData, setFakeData] = useState([]);
  
  const getLiquidityPool = async () => {
    const url = `${BISON_SEQUENCER_ENDPOINT}/liquidity_pool`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: ordinalsAddress || "pool"}),
      });
      const data= await response.json()
      setFakeData(data.liquidityPools)
    } catch (error) {
      console.error('Error:', error);
    }
  }
  useEffect(() => {
    getLiquidityPool();
  },[ordinalsAddress]);
  return (
    <Layout>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 2xl:grid-cols-2 mt-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {fakeData.map((item, index) => (
          <CoinBox data={item} key={index} />
        ))}
      </div>
    </Layout>
  );

};

export default LiquidityPool;
