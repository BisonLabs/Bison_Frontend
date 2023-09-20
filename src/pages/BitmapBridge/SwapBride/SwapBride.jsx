/* eslint-disable no-undef */


import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../../components/Layout'
import XBox from '../../../components/XBox'
import { hex, base64 } from '@scure/base'
import { useWallet } from "../../../WalletContext";
import { signTransaction } from 'sats-connect';
import * as btc from '@scure/btc-signer';



const SwapBridge = (props) => {
    const BitmapBridgeItems = props.BitmapBridgeItems
    const selectedBitmapsItems = props.selectedBitmapsItems
    const handleAddSelectedBitmap = props.handleAddSelectedBitmap
    const handleDeleteSelectedBitmap = props.handleDeleteSelectedBitmap
    const { ordinalsAddress, paymentAddress, ordinalsPublicKey } = useWallet();
    const [BISON_SEQUENCER_ENDPOINT, setBISON_SEQUENCER_ENDPOINT] = useState("http://192.168.254.67:8008/");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [swapContracts, setSwapContracts] = useState([]);


    const fetchContracts = async () => {
        try {
            const response = await fetch(`${BISON_SEQUENCER_ENDPOINT}contracts_list`);
            const data = await response.json();

            const bmapContract = data.contracts.find(contract => contract.tick === 'bmap');
            if (bmapContract) {
                setRecipientAddress(bmapContract.contractAddr);
            }

            // ... rest of the fetchContracts function
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);


    const createAndSignPsbt = async (bitmapItem) => {
        const bitcoinTestnet = {
            bech32: 'tb',
            pubKeyHash: 0x6f,
            scriptHash: 0xc4,
            wif: 0xef,
        }
    
        const parts = bitmapItem.location.split(':');
        const txid = parts[0];
        const index = parseInt(parts[1], 10);
    
        const ordinalPublicKeyHex = hex.decode(ordinalsPublicKey)
    
        const p2tr = btc.p2tr(ordinalPublicKeyHex, undefined, bitcoinTestnet);
    
        const tx = new btc.Transaction();
        
        const fee = 300n
    
        tx.addInput({
            txid: txid,
            index: index,
            witnessUtxo: {
                script: p2tr.script,
                amount: BigInt(bitmapItem.value), // Using the value from the bitmap item
            },
            tapInternalKey: ordinalPublicKeyHex,
            sighashType: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY
        });
        
        // Add the recipient address as output
        tx.addOutputAddress(recipientAddress,BigInt(BigInt(bitmapItem.value) - fee),bitcoinTestnet)

        
        const psbt = tx.toPSBT(0);
        
        const signPsbtOptions = {
            payload: {
                network: {
                    type: "Testnet",
                },
                message: "Sign Transaction",
                psbtBase64: base64.encode(psbt),
                broadcast: true,
                inputsToSign: [
                    {
                        address: ordinalsAddress,
                        signingIndexes: [index],
                        sigHash: btc.SignatureHash.SINGLE | btc.SignatureHash.ANYONECANPAY,
                    }
                ],
            },
            onFinish: (response) => {
                console.log(response);
                alert(response.psbtBase64);
            },
            onCancel: () => alert("Canceled"),
        };
        
        await signTransaction(signPsbtOptions);
    };
    
    const handleBridgeClick = () => {
        selectedBitmapsItems.forEach(item => {
            createAndSignPsbt(item);
        });
    };
    

  return (
    <Layout>
    <div className="grid grid-cols-1 lg:grid-cols-5 2xl:grid-cols-5 gap-10">
        
        <div className="col-span-3">

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
            
            {BitmapBridgeItems.map( (item, index) => {
            return(
                <Link key={index} onClick={(e)=>{e.preventDefault(); handleAddSelectedBitmap(item)}}>
                <XBox isBackground={true} square={true}>
                    <img style={{height: "89%"}} src={item.imgURL} alt="" />
                    <p>{item.name}</p>
                </XBox>
                </Link>
            )
            } )}
            </div>

        </div>

        <div className="col-span-2">
            <XBox  isBackground={true} height="836">
                <>
                    <h3>Bridge</h3>

                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-10">

                    {selectedBitmapsItems.map( (item, index) => {
                        return(
                            <div key={index}>
                                <XBox isBackground={true} height="300">
                                    <img style={{height: "89%"}} src={item.imgURL} alt="" />
                                    <p>{item.name}</p>
                                    <div onClick={ (e)=>{e.preventDefault(); handleDeleteSelectedBitmap(item)} } style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '5px',
                                        backgroundColor: 'black',
                                        padding: '0px 10px',
                                        borderRadius: '50px',
                                        color: 'red',
                                        fontWeight: '500',
                                        cursor: "pointer",
                                    }}>x</div>
                                </XBox>
                            </div>
                        )
                    } )}


                    </div>

                    <button
                    onClick={handleBridgeClick} 
                    style={{
                        bottom: '40px',
                        position: 'absolute',
                        left: '37%',
                        background: '#FF7248',
                        padding: '6px 55px',
                        borderRadius: '25px',
                        border: 'none',
                        fontSize: '17px',
                    }}>
                        Bridge
                    </button>

                </>
            </XBox>
        </div>
    </div>
    </Layout>
  )
}

export default SwapBridge