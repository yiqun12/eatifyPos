
import React from 'react'
import { useState, useMemo } from 'react';
import './checkout.css';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import { useEffect } from 'react';
//import './html.css';
import { useMyHook } from './myHook';
import './SwitchToggle.css';
import moment from 'moment';
import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";

const App = () => {

    return (

        <div className='max-w-[500px] mx-auto p-4 '>
            <div className="app-container" style={{ height: "100%" }}>
                <div className="row">
                    <div className="col">
                        <Item />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Item = () => {
    const params = new URLSearchParams(window.location.search);

    const store = params.get('store') ? params.get('store').toLowerCase() : "";

    // for translations sake
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = useMemo(() => {
        const trans = JSON.parse(sessionStorage.getItem("translations"))
        const translationsMode = sessionStorage.getItem("translationsMode")

        return (text) => {
            if (trans != null && translationsMode != null) {
                if (trans[text] != null && trans[text][translationsMode] != null) {
                    return trans[text][translationsMode];
                }
            }

            return text;
        };
    }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")]);

    if (!store) return <div>Loading...</div>; // Render a loading state if payment_data is not fetched

    return (
        <div className="card2 mb-50" >
            <div className="col d-flex">
                {/** 
        <span className="text-muted" id="orderno">
          order #546924
        </span>*/}
            </div>
            <div className="gap">
                <div className="col-2 d-flex mx-auto" />
                <a href={`./store?store=${store}`} style={{ color: "blue" }}>
                    &lt; Back to store
                </a>
                <div>
                We have received your order. Please contact the seller to confirm your order.
                </div>
            </div>
        </div>
    )
};


export default App