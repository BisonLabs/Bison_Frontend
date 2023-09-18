import React, { useEffect, useState } from "react";
import BitmapBridgeAll from "./SwapBride/BitmapBridge";
import SwapBridge from "./SwapBride/SwapBride";
import { useWallet } from "../../WalletContext";
import { getAddress, signMessage, sendBtcTransaction } from "sats-connect";
import io from "socket.io-client"; // 引入Socket.io客户端库


const BitmapBridge = () => {
  const { ordinalsAddress, paymentAddress } = useWallet();
  const [isSelected, setIsSelected] = useState(false);
  const [selectedBitmapsItems, setSelectedBitmapsItems] = useState([]);
  const [BitmapBridgeItems, setBitmapBridgeItems] = useState([]); // 使用状态来存储从服务器获取的数据

  const fetchData = () => {
    const trac_base = io("https://api-testnet.trac.network");

    if (ordinalsAddress) {
      trac_base.emit("get", {
        func: "walletLight",
        args: [ordinalsAddress.trim()],
        call_id: "",
      });

      trac_base.on("response", (msg) => {
        if (msg.func === "walletLight") {
          setBitmapBridgeItems(msg.result);
          console.log(msg.result);
        }
      });
    }

    return trac_base;
  };

  useEffect(() => {
    const trac_base = fetchData();

    return () => {
      trac_base.disconnect();
    };
  }, [ordinalsAddress]);

  useEffect(() => {
    console.log(selectedBitmapsItems);
    if (selectedBitmapsItems.length === 0) {
      setIsSelected(false);
    } else {
      setIsSelected(true);
    }
  }, [selectedBitmapsItems]);

  const handleAddSelectedBitmap = (bitmap) => {
    setSelectedBitmapsItems([...selectedBitmapsItems, bitmap]);
  };

  const handleDeleteSelectedBitmap = (bitmap) => {
    setSelectedBitmapsItems((prevItems) =>
      prevItems.filter((item) => item.id !== bitmap.id)
    );
  };

  if (!isSelected) {
    return (
      <>
        <BitmapBridgeAll
          BitmapBridgeItems={BitmapBridgeItems}
          handleAddSelectedBitmap={handleAddSelectedBitmap}
        />
      </>
    );
  } else if (isSelected) {
    return (
      <>
        <SwapBridge
          BitmapBridgeItems={BitmapBridgeItems}
          selectedBitmapsItems={selectedBitmapsItems}
          handleDeleteSelectedBitmap={handleDeleteSelectedBitmap}
          handleAddSelectedBitmap={handleAddSelectedBitmap}
        />
      </>
    );
  }
};

export default BitmapBridge;
