import React, { useEffect, useState } from "react";
import BitmapBridgeAll from "./SwapBride/BitmapBridge";
import SwapBridge from "./SwapBride/SwapBride";
import { useWallet } from "../../WalletContext";
import { getAddress} from "sats-connect";
import io from "socket.io-client"; // 引入Socket.io客户端库


const BitmapBridge = () => {
  const { ordinalsAddress, paymentAddress ,NETWORK} = useWallet();
  const [isSelected, setIsSelected] = useState(false);
  const [selectedBitmapsItems, setSelectedBitmapsItems] = useState([]);
  const [BitmapBridgeItems, setBitmapBridgeItems] = useState([]); // 使用状态来存储从服务器获取的数据
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    let trac_base = io("https://api.trac.network");
    if (NETWORK == 'Testnet'){
      trac_base = io("https://api-testnet.trac.network");
    }

    const handleResponse = async (msg) => {
      if (msg.func === "walletLight") {
        const items = await Promise.all(msg.result.map(async id => {
          const shortId = id.slice(0, 4) + '...' + id.slice(-6);
          let inscriptionURL = `https://ordinals.com/inscription/${id}`;
          if (NETWORK == 'Testnet'){
            inscriptionURL = `https://testnet.ordinals.com/inscription/${id}`;
          }
            
          const response = await fetch(inscriptionURL);
          const htmlContent = await response.text();

          // 使用正则表达式从HTML中提取location信息
          const locationMatch = htmlContent.match(/<dt>location<\/dt>\s+<dd class=monospace>([^<]+)<\/dd>/);
          const location = locationMatch ? locationMatch[1] : null;

          // 使用正则表达式从HTML中提取output value信息
          const outputValueMatch = htmlContent.match(/<dt>output value<\/dt>\s+<dd>([^<]+)<\/dd>/);
          const outputValue = outputValueMatch ? parseInt(outputValueMatch[1], 10) : null;

          let  contentURL = `https://ordinals.com/content/${id}`;
          if (NETWORK == 'Testnet'){
            contentURL = `https://testnet.ordinals.com/content/${id}`;
          }
            
          const contentResponse = await fetch(contentURL);
          const name = await contentResponse.text();

          return {
            id: id,
            shortId: shortId,
            name: name,
            location: location,
            value: outputValue
          };
        }));
        setBitmapBridgeItems(items);
        setIsLoading(false); 
      }
    };

    trac_base.on("response", handleResponse);

    if (ordinalsAddress) {
      trac_base.emit("get", {
        func: "walletLight",
        args: [ordinalsAddress.trim()],
        call_id: "",
      });
    }

    return () => {
      trac_base.off("response", handleResponse);  // Remove the event listener
      trac_base.disconnect();  // Disconnect the socket
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
    const isItemAlreadySelected = selectedBitmapsItems.some(selectedItem => selectedItem.id === bitmap.id); // 使用bitmap.id而不是item.id

    console.log(isItemAlreadySelected);
    if (!isItemAlreadySelected) {
        setSelectedBitmapsItems([...selectedBitmapsItems, bitmap]);
    }
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
          isLoading={isLoading}
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
