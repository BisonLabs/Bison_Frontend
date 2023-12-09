import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { getAddress } from "sats-connect";
import { useWallet } from "../WalletContext";


// Styles for animation
const containerStyle = {
  maxHeight: "0",
  overflow: "hidden",
  padding: 0,
  transition: "all 0.3s ease-in-out",
};

const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const activeContainerStyle = {
  ...containerStyle,
  padding: "10px",
  maxHeight: "200px",
};

const linkStyle = {
  fontSize: "1.1rem",
  transition: "font-size 0.3s ease-in-out",
};

const activeLinkStyle = {
  ...linkStyle,
  fontSize: "1.5rem",
};

const Layout = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSocialSlidebarCollapsed, setIsSocialSlideBarCollapsed] =
    useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState("");
  const leftBarRef = useRef();
  const location = useLocation();
  const {
    ordinalsAddress, setOrdinalsAddress,
    paymentAddress, setPaymentAddress,
    ordinalsPublicKey, setOrdinalsPublicKey,
    paymentPublicKey, setPaymentPublicKey,
    NETWORK,setNetwork,
  } = useWallet();

  const onConnectClick = async () => {
    const getAddressOptions = {
      payload: {
        purposes: ["ordinals", "payment"],
        message: "Address for receiving Ordinals",
        network: {
          type: NETWORK,
        },
      },
      onFinish: async (response) => {
        setOrdinalsAddress(response.addresses[0].address);
        setPaymentAddress(response.addresses[1].address);
        setOrdinalsPublicKey(response.addresses[0].publicKey);
        setPaymentPublicKey(response.addresses[1].publicKey);
      },
      onCancel: () => alert("Request Cancel"),
    };
    await getAddress(getAddressOptions);
    // 如果您有fetchContracts函数，请取消下面这行的注释
    // this.fetchContracts(); 
  };

  useEffect(() => {
    setActiveMenu(location.pathname);
    preventBodyScroll();
    handleResize();
    addEventListeners();

    return removeEventListeners;
  }, [location]);

  useEffect(() => {
    handleResize();
  }, [isMobile, isSidebarCollapsed]);

  // stop scroll
  const preventBodyScroll = () => {
    document.body.classList.add("overflow-hidden");
  };

  // get event for mobile device
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // add when component mount
  const addEventListeners = () => {
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
  };

  // remove when component unmount
  const removeEventListeners = () => {
    document.body.classList.remove("overflow-hidden");
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("mousedown", handleClickOutside);
  };

  // when we click outside of sidebar
  const handleClickOutside = () => {
    if (isMobile && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
    if (!isSocialSlidebarCollapsed) {
      setIsSocialSlideBarCollapsed(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSocialIconClick = (social) => (e) => {
    e.preventDefault();
    setIsSocialSlideBarCollapsed(!isSocialSlidebarCollapsed);
    setSelectedSocial(social);
  };

  const menuItems = [
    { path: "/bridge", label: "Bridge" },
    { path: "/swap-and-send", label: "Swap And Send" },
    // { path: "/bitmap-bridge", label: "Bitmap Bridge" },
    { path: "/pipe-bridge", label: "Pipe Bridge" }

    
  ];

  return (
    <div className="overflow-y-hidden justify-between flex flex-col h-screen">
      <div
        className={`fixed inset-0 transition-opacity duration-300 ${(isMobile && !isSidebarCollapsed) || !isSocialSlidebarCollapsed
            ? "bg-[rgba(0,0,0,0.5)] backdrop-blur-[5px]"
            : "bg-opacity-0 pointer-events-none"} 
          ${isSocialSlidebarCollapsed ? "z-20" : "z-40"}
        `}
        onClick={handleClickOutside}
      ></div>

      <div className="light x1 -z-[10]"></div>
      <div className="light x3 -z-[10]"></div>
      <div className="light x4 -z-[10]"></div>
      <div className="light x6 -z-[10]"></div>
      <div className="light x7 -z-[10]"></div>
      <div className="light x9 -z-[10]"></div>
      <div className="flex justify-between px-5 py-10">
        <div className="ml-10 flex gap-4 items-center">
          <img
          src="/img/menuImages/sidebarImg.png" 
            alt=""
            width={54}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-xl text-white whitespace-nowrap">
              Bison Labs
            </span>
          </div>
        </div>
        <div className="mr-10 items-center gap-4 hidden md:flex">
          {/* <div className="flex gap-3 text-white cursor-pointer transition hover:bg-[#212121] px-5 py-4 rounded-2xl">
            <FontAwesomeIcon
              className="px-[2px] py-[1px] border-2 border-white rounded-full"
              icon={faEllipsisH}
            />
            More Options
          </div> */}
          <button style={{
            backgroundImage: 'linear-gradient(136deg, #FF5722, #6EACFE)',
            padding: '9px 30px',
            borderRadius: '8px',
          }}
            onClick={onConnectClick}
          >
            {ordinalsAddress ? formatAddress(ordinalsAddress) : "Connect Wallet"}
          </button>
        </div>
      </div>
      <div className="flex h-[calc(100vh-100px)]">
        <div
          ref={leftBarRef}
          className={`flex flex-col text-xl text-white transition-all duration-500 ease-in-out rounded-r-xl 
            px-${isSidebarCollapsed || isMobile ? 0 : 5} 
            ${isMobile && !isSidebarCollapsed ? "z-20" : ""}   
            ${isMobile && "absolute"} 
            ${isMobile && "bg-[#323232]"}
          `}
          style={{
            width: isSidebarCollapsed ? 0 : "300px",
            opacity: isSidebarCollapsed ? 0 : 1,
            height: isMobile && !isSidebarCollapsed ? "80%" : "auto",
          }}
        >
          <div className="overflow-y-auto">
            {menuItems &&
              menuItems.map(({ path, label }) => (
                <Link key={path} to={path}>
                  <div
                    className={`cursor-pointer transition ease-in-out duration-300 hover:text-white rounded-lg p-3 
                      ${activeMenu.includes(path)
                        ? "text-white font-semibold"
                        : "text-[#747474]"
                      }
                    `}
                    style={
                      activeMenu.includes(path) ? activeLinkStyle : linkStyle
                    }
                  >
                    {label}
                  </div>
                  <div
                    className={`${label === "Research" && "mb-[50px]"} text-black rounded-lg `}
                    style={
                      activeMenu.includes(path)
                        ? activeContainerStyle
                        : containerStyle
                    }
                  >
                    <img
                      src={`/img/menuImages/sidebarImg.png`}
                      alt="Category"
                    />
                  </div>
                </Link>
              ))}
          </div>
        </div>
        <div
          style={{
            width:
              isSidebarCollapsed || isMobile ? "100vw" : "calc(100% - 300px)",
            paddingLeft: isMobile ? "16px" : "64px",
            paddingRight: isMobile ? "16px" : "64px",
            paddingTop: "32px",
            paddingBottom: "100px",
          }}
          className="h-full overflow-auto"
        >
          <div
            className={`absolute bottom-[70px] z-30 transition-all duration-500 ${isSidebarCollapsed
                ? "-ml-[15px]"
                : isMobile
                  ? "ml-[200px]"
                  : "-ml-[80px]"
              }`}
          >
            <button
              className="rounded-full border-2 border-white px-3 py-2 transition hover:bg-gray-600"
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? (
                <FontAwesomeIcon icon={faArrowRight} className="text-white" />
              ) : (
                <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
              )}
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
