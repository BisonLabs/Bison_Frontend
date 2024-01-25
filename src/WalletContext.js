import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
    return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
    // Xverse contexts
    const [ordinalsAddress, setOrdinalsAddress] = useState("");
    const [paymentAddress, setPaymentAddress] = useState("");
    const [ordinalsPublicKey, setOrdinalsPublicKey] = useState("");
    const [paymentPublicKey, setPaymentPublicKey] = useState("");
    const [xverseNetwork,setXverseNetwork] = useState("Testnet");

    // Unisat contexts
    const [isUnisatInstalled, setIsUnisatInstalled] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState("");
    const [currentAccount, setCurrentAccount] = useState('');
    const [uniSatNetwork, setUniSatNetwork] = useState("Testnet");

    const [BISON_SEQUENCER_ENDPOINT,setBISON_SEQUENCER_ENDPOINT] = useState("https://testnet.bisonlabs.io/sequencer_endpoint");
    const [btcContractEndpoint,setBtcContractEndpoint] = useState("https://testnet.bisonlabs.io/sequencer_endpoint");
    const [PIPE_endpoint,setPIPE_endpoint] = useState("https://testnet.bisonlabs.io/pipe_endpoint");
    const [LABB_endpoint,setLABB_endpoint] = useState("https://testnet.bisonlabs.io/labbs_endpoint");
    const [claim_endpoint,setClaim_endpoint] = useState("https://testnet.bisonlabs.io/labb_endpoint");

    return (
        <WalletContext.Provider value={{
            // Xverse values
            ordinalsAddress, setOrdinalsAddress,
            paymentAddress, setPaymentAddress,
            ordinalsPublicKey, setOrdinalsPublicKey,
            paymentPublicKey, setPaymentPublicKey,
            xverseNetwork, setXverseNetwork,

            //UniSat values
            isUnisatInstalled, setIsUnisatInstalled,
            isConnected, setIsConnected,
            balance, setBalance,
            currentAccount, setCurrentAccount,
            uniSatNetwork, setUniSatNetwork,

            BISON_SEQUENCER_ENDPOINT,setBISON_SEQUENCER_ENDPOINT,
            btcContractEndpoint,setBtcContractEndpoint,
            PIPE_endpoint,setPIPE_endpoint,
            LABB_endpoint,setLABB_endpoint,
            claim_endpoint,setClaim_endpoint,
        }}>
            {children}
        </WalletContext.Provider>
    );
};
