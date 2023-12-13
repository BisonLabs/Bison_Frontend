import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
    return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
    const [ordinalsAddress, setOrdinalsAddress] = useState("");
    const [paymentAddress, setPaymentAddress] = useState("");
    const [ordinalsPublicKey, setOrdinalsPublicKey] = useState("");
    const [paymentPublicKey, setPaymentPublicKey] = useState("");


    const [BISON_SEQUENCER_ENDPOINT,setBISON_SEQUENCER_ENDPOINT] = useState("http://209.141.49.238:8008/");
    const [btcContractEndpoint,setBtcContractEndpoint] = useState("http://209.141.49.238:8008/");
    const [PIPE_endpoint,setPIPE_endpoint] = useState("http://209.141.49.238:5077/");
    const [NETWORK,setNetwork] = useState("Testnet");
    const [LABB_endpoint,setLABB_endpoint] = useState("http://209.141.49.238:5074");
    const [claim_endpoint,setClaim_endpoint] = useState("http://209.141.49.238:8072");

    return (
        <WalletContext.Provider value={{
            ordinalsAddress, setOrdinalsAddress,
            paymentAddress, setPaymentAddress,
            ordinalsPublicKey, setOrdinalsPublicKey,
            paymentPublicKey, setPaymentPublicKey,
            BISON_SEQUENCER_ENDPOINT,setBISON_SEQUENCER_ENDPOINT,
            btcContractEndpoint,setBtcContractEndpoint,
            PIPE_endpoint,setPIPE_endpoint,
            NETWORK,setNetwork,
            LABB_endpoint,setLABB_endpoint,
            claim_endpoint,setClaim_endpoint,
        }}>
            {children}
        </WalletContext.Provider>
    );
};
