import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../../components/Layout'
import XBox from '../../../components/XBox'

const SwapBridge = (props) => {
    const BitmapBridgeItems = props.BitmapBridgeItems
    const selectedBitmapsItems = props.selectedBitmapsItems
    const handleAddSelectedBitmap = props.handleAddSelectedBitmap
    const handleDeleteSelectedBitmap = props.handleDeleteSelectedBitmap

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

                    <button style={{
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