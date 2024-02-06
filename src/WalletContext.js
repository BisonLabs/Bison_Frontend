import React, { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export const useWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
  const [ordinalsAddress, setOrdinalsAddress] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [ordinalsPublicKey, setOrdinalsPublicKey] = useState("");
  const [paymentPublicKey, setPaymentPublicKey] = useState("");

  const [isXverseWalletConnectClicked, setIsXverseWalletConnectClicked] =
    useState(false);
  const [isXverseWalletConnected, setIsXverseWalletConnected] = useState(false);

  const [isUniSatWalletConnectClicked, setIsUniSatWalletConnectClicked] =
    useState(false);
  const [isUniSatWalletConnected, setIsUniSatWalletConnected] = useState(false);

  const [BISON_SEQUENCER_ENDPOINT, setBISON_SEQUENCER_ENDPOINT] = useState(
    "https://testnet.bisonlabs.io/sequencer_endpoint"
  );
  const [btcContractEndpoint, setBtcContractEndpoint] = useState(
    "https://testnet.bisonlabs.io/sequencer_endpoint"
  );
  const [PIPE_endpoint, setPIPE_endpoint] = useState(
    "https://testnet.bisonlabs.io/pipe_endpoint"
  );
  const [NETWORK, setNetwork] = useState("Testnet");
  const [LABB_endpoint, setLABB_endpoint] = useState(
    "https://testnet.bisonlabs.io/labbs_endpoint"
  );
  const [claim_endpoint, setClaim_endpoint] = useState(
    "https://testnet.bisonlabs.io/labb_endpoint"
  );

  return (
    <WalletContext.Provider
      value={{
        ordinalsAddress,
        setOrdinalsAddress,
        paymentAddress,
        setPaymentAddress,
        ordinalsPublicKey,
        setOrdinalsPublicKey,
        paymentPublicKey,
        setPaymentPublicKey,
        isXverseWalletConnectClicked,
        setIsXverseWalletConnectClicked,
        isXverseWalletConnected,
        setIsXverseWalletConnected,
        isUniSatWalletConnectClicked,
        setIsUniSatWalletConnectClicked,
        isUniSatWalletConnected,
        setIsUniSatWalletConnected,
        BISON_SEQUENCER_ENDPOINT,
        setBISON_SEQUENCER_ENDPOINT,
        btcContractEndpoint,
        setBtcContractEndpoint,
        PIPE_endpoint,
        setPIPE_endpoint,
        NETWORK,
        setNetwork,
        LABB_endpoint,
        setLABB_endpoint,
        claim_endpoint,
        setClaim_endpoint,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};