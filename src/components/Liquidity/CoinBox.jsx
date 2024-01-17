import React, { useState } from "react";
import "./CoinBox.css";

const CoinBox = ({ isBackground, imgURL, center, height, data }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const handleOpenDetails = () => setOpenDetails(!openDetails);

  
  const handleOpenSelect = () => {
    setOpenSelect(!openSelect);
    if(!openSelect){
      //查询最新的
      
    }
  }
  const handleOpenWithdraw = () => {
    setOpenDetails(!openDetails);
    setOpenWithdraw(!openWithdraw);
  };

  // handle Deposit Amount
  const [token1InputValue, setToken1InputValue] = useState("");

  const handleDepositAmount = (event) => {
    setToken1InputValue(event.target.value);
  };

  // handle Withdraw Amount
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const handleWithdrawAmountChange = (event) => {
    setWithdrawAmount(event.target.value);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-5 mx-4">
        <div>
          <p className="mt-2 text-white sm:text-lg md:text-xl lg:text-2xl xl:text-2xl 2xl:text-2xl">
            {data.token_pair}
            <br />
            <span className="text-base text-white sm:text-lg md:text-md lg:text-base xl:text-lg 2xl:text-xl opacity-50">
              {data.subtitle}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-end gap-5 text-right">
          {(data.index === 0 || data.index === 1) && (
            <div>
              <button
                className="rounded-md cursor-pointer items-center border border-1 border-[#EF7A54] text-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center"
                onClick={handleOpenDetails}
              >
                Details
              </button>
            </div>
          )}
          <div>
            <button
              className="rounded-md cursor-pointer items-center border border-1 border-[#EF7A54] text-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center"
              onClick={handleOpenSelect}
            >
              Select
            </button>
          </div>
        </div>
      </div>
      <div
        className={` ${!height && "h-[70px] md:h-[130px]"}  ${
          isBackground && "bg-gradient-card1"
        } ${
          center && "flex justify-center items-center"
        } border-2 border-[#323232] text-white text-lg lg:text-2xl rounded-[15px] p-5 transition flex flex-col relative h-auto`}
        style={{
          backgroundImage: imgURL ? `url(${imgURL})` : "none",
          height: height && `${height}px`,
          backgroundColor: "#181818",
        }}
      >
        <div className="flex flex-row justify-between h-full">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-5">
              <img src={data.imgURL1} alt="" className="w-8 h-8 rounded-full" />
              <span style={{ fontSize: "1.1rem", color: "white" }}>
                {data.token_name1}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <img src={data.imgURL2} alt="" className="w-8 h-8 rounded-full" />
              <span style={{ fontSize: "1.1rem", color: "white" }}>
                {data.token_name2}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div style={{ fontSize: "1.1rem", color: "white" }}>
              {data.coin_value1/100000000}
            </div>
            <div style={{ fontSize: "1.1rem", color: "white" }}>
              {data.coin_value2/100000000}
            </div>
          </div>
        </div>
        {openDetails && (
          <div
            id="static-modal"
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full text-white bg-black bg-opacity-90 "
          >
            <div className="relative p-2 max-w-2xl border border-[#898787] rounded-2xl bg-[#121212] w-[508px] h-[432px]">
              <div className="grid items-center justify-between grid-cols-2">
                <p className="text-base text-white m-4">Details</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white m-4"
                  onClick={handleOpenDetails}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>

              <div className="font-sans text-white">
                <div className="grid grid-cols-2 gap-5 m-4">
                  <p className="text-base text-[#898787] text-left">
                    Currently held
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="h-[80px] rounded-[12px] border-2 border-[#323232] bg-[#232323] w-full mx-4 flex justify-between items-center">
                    <div className="flex flex-raw items-center">
                      <span className="ml-3">
                        <img
                          src={data.imgURL1}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </span>
                      <span className="ml-3">
                        <img
                          src={data.imgURL2}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </span>
                      <span className="ml-3">
                        <p className="text-white text-base">
                          {data.token_pair}
                        </p>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3">
                        <p className="text-white text-base">
                          {data.pool_percentage}
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 px-5 mb-4">
                  <div>
                    <p className="text-[#898787] text-sm m-4 ml-8">Quantity</p>
                    <button
                      onClick={handleOpenSelect}
                      className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] text-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full m-4"
                    >
                      Add
                    </button>
                  </div>
                  <div>
                    <p className="flex flex-raw text-sm m-4 justify-end mr-8">
                      <span className="text-[#898787] mr-1">ETH</span>
                      {data.ETH_unit}
                      <span className="text-[#898787] mx-1">USDT</span>
                      {data.USDT_unit}
                    </p>
                    <button
                      onClick={handleOpenWithdraw}
                      className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] text-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full m-4"
                    >
                      Reduce
                    </button>
                  </div>
                </div>
                <div className="w-full px-5">
                  <button
                    onClick={handleOpenWithdraw}
                    className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#323232] hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {openSelect && (
          <div
            id="static-modal"
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full text-white bg-black bg-opacity-90 "
          >
            <div className="relative p-2 max-w-2xl border border-[#898787] rounded-2xl bg-[#121212] w-[508px] h-[586px]">
              <div className="grid items-center justify-between grid-cols-2">
                <p className="text-base text-white m-4">Select</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white m-4"
                  onClick={handleOpenSelect}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>

              <div className="font-sans text-white">
                <div className="flex justify-center mb-5">
                  <div className="h-[80px] rounded-[12px] border-2 border-[#323232] bg-[#232323] w-full mx-4 flex justify-between items-center">
                    <div className="flex flex-row items-center">
                      <div className="ml-3">
                        <img
                          src={data.imgURL1}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-white text-base">
                          {data.token_name1}
                        </p>
                      </div>
                    </div>
                    <div className="text-white flex justify-end mr-3">
                      <input
                        type="number"
                        placeholder="0"
                        className="bg-transparent border-none outline-none flex justify-end text-right"
                        value={token1InputValue}
                        onChange={handleDepositAmount}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="h-[80px] rounded-[12px] border-2 border-[#323232] bg-[#232323] w-full mx-4 flex justify-between items-center">
                    <div className="flex flex-row items-center">
                      <div className="ml-3">
                        <img
                          src={data.imgURL2}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-white text-base">
                          {data.token_name2}
                        </p>
                      </div>
                    </div>
                    <div className="text-white flex justify-end mr-3">
                      {token1InputValue * (1 / data.token_value)}
                    </div>
                  </div>
                </div>
                <div className="text-sm flex flex-row justify-between m-4 px-8">
                  <p className="text-[#898787]">Price</p>
                  <div>
                    <span className="text-[#898787] mr-1">
                      {data.token_value}
                    </span>
                    {data.token_name1}
                    <span className="text-[#898787] mx-1">per</span>
                    <span className="mr-1">{data.token_name2}</span>
                    <button className="rounded-sm p-1 bg-[#222222]">
                      <img src="/img/coinbox/Vector.png" alt="vector" />
                    </button>
                  </div>
                </div>

                <div className="text-sm flex flex-row justify-between m-4 px-8">
                  <p className="text-[#898787]">Income</p>
                  <p className="text-[#25A73A]">{data.income}</p>
                </div>
                <div className="w-full px-5 flex flex-col gap-5 text-[#EF7A54]">
                  <button className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full">
                    Deposit {data.token_name1}
                  </button>
                  <button className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full">
                    Deposit {data.token_name2}
                  </button>
                  <button className="rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full">
                    Add Liquidity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {openWithdraw && (
          <div
            id="static-modal"
            data-modal-backdrop="static"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full text-white bg-black bg-opacity-90 "
          >
            <div className="relative p-2 max-w-2xl border border-[#898787] rounded-2xl bg-[#121212] w-[508px] h-[380px]">
              <div className="grid items-center justify-between grid-cols-2">
                <p className="text-base text-white m-4">Withdraw</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 ms-auto dark:hover:bg-gray-600 dark:hover:text-white m-4"
                  onClick={handleOpenWithdraw}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>

              <div className="font-sans text-white">
                <div className="flex justify-center">
                  <div className="h-[80px] rounded-[12px] border-2 border-[#323232] bg-[#232323] w-full mx-4 flex justify-between items-center">
                    <div className="flex flex-row items-center">
                      <span className="ml-3">
                        <img
                          src={data.imgURL1}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </span>
                      <span className="ml-3">
                        <img
                          src={data.imgURL2}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </span>
                      <p className="ml-3">
                        <span className="text-white text-base">
                          {data.token_pair}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3">
                        <p className="text-white text-base">
                          {withdrawAmount}%
                        </p>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm flex flex-row m-6 ml-8">
                  <p className="text-[#898787] mr-1">Set Withdraw</p>
                </div>
                <div className="text-sm flex justify-between items-center m-6 ml-8">
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={withdrawAmount}
                      className="slider"
                      id="myRange"
                      onChange={handleWithdrawAmountChange}
                    />
                  </div>
                  <button className="text-right mr-4 text-[#898787] border-[#323232] bg-[#232323] border-2 rounded-xl px-8 py-1">
                    Custom
                  </button>
                </div>
                <div className="text-sm flex-row grid grid-cols-2 m-6 ml-8">
                  <p className="text-[#898787] mr-1">Quantity</p>
                  <div className="text-right mr-1">
                    <span className="text-[#898787] mr-1">
                      {data.token_value}
                    </span>
                    {data.token_name1}
                    <span className="text-[#898787] mx-1">per</span>
                    <span className="mr-1">{data.token_name2}</span>
                  </div>
                </div>
                <div className="w-full px-5 flex flex-col">
                  <button className="text-[#EF7A54] rounded-xl cursor-pointer items-center border border-1 text-xl border-[#EF7A54] hover:text-white hover:bg-[#EF7A54] px-3 py-1 h-[40px] flex justify-center mx-auto w-full">
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinBox;
