import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import CoinBox from "../../components/Liquidity/CoinBox";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";

const LiquidityPool = () => {
  const fakeData = [
    {
      index: 0,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
    {
      index: 1,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
    {
      index: 2,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
    {
      index: 3,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
    {
      index: 4,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
    {
      index: 5,
      token_pair: "BTC/ORDI",
      subtitle: "TX 0.2%",
      token_name1: "BTC",
      token_name2: "ORDI",
      coin_value1: 123456.34,
      coin_value2: 123456.34,
      pool_percentage: "1.2%",
      ETH_unit: 1.012,
      USDT_unit: 1234,
      token_value: 0.00502549,
      income: "12%",
      imgURL1: "/img/coinbox/Ellipse.svg",
      imgURL2: "/img/coinbox/Union.svg",
    },
  ];
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
