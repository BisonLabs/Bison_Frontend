import React from "react";
import { Link } from "react-router-dom";

const NetworkTable = ({ imgURL, name, value, link, gap }) => {
  return (
    <div className={`flex justify-between mt-2 items-center mt-${gap}`}>
      <div className="flex gap-3 items-center">
        {imgURL && (
          <img src={imgURL} alt="Coin Gainers" className="rounded-full w-10" />
        )}
        <div className="flex flex-col">
          <p className="text-[14px] text-white">{name}</p>
        </div>
      </div>
      <div className="flex flex-col">
        <Link to={link} className="text-white text-[14px] text-right font-semibold">
          {value}
        </Link>
      </div>
    </div>
  );
};

export default NetworkTable;
