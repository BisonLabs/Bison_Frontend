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


    const BISON_SEQUENCER_ENDPOINT = useState("http://209.141.49.238:8008/");
    const btcContractEndpoint = useState("http://209.141.49.238:8008/");
    const PIPE_endpoint = useState("http://209.141.49.238:5077/");

    return (
        <WalletContext.Provider value={{
            ordinalsAddress, setOrdinalsAddress,
            paymentAddress, setPaymentAddress,
            ordinalsPublicKey, setOrdinalsPublicKey,
            paymentPublicKey, setPaymentPublicKey,
            BISON_SEQUENCER_ENDPOINT,btcContractEndpoint,
            PIPE_endpoint
        }}>
            {children}
        </WalletContext.Provider>
    );
};
