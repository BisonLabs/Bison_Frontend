import React, { useEffect, useState } from "react";
import BitmapBridgeAll from "./SwapBride/BitmapBridge";
import SwapBridge from "./SwapBride/SwapBride";
import { BitmapBridgeItems } from "./data";

const BitmapBridge = () => {
  const [isSelected, setIsSelected] = useState(false);
  const [selectedBitmapsItems, setSelectedBitmapsItems] = useState([]);

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
