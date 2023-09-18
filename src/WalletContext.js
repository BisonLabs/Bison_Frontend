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

    return (
        <WalletContext.Provider value={{
            ordinalsAddress, setOrdinalsAddress,
            paymentAddress, setPaymentAddress,
            ordinalsPublicKey, setOrdinalsPublicKey,
            paymentPublicKey, setPaymentPublicKey
        }}>
            {children}
        </WalletContext.Provider>
    );
};
