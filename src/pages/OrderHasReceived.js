
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

        <div className='mx-auto'>
            <Item />
        </div>
    );
};

const Item = () => {
    const params = new URLSearchParams(window.location.search);
    const { user, user_loading } = useUserContext();
    const [documentData, setDocumentData] = useState([]);
    const store = params.get('store') ? params.get('store').toLowerCase() : "";
    const urlParams = new URLSearchParams(window.location.search);
    const receiptToken = urlParams.get('docId');  // '12345'
    console.log(receiptToken)
    useEffect(() => {
        if (receiptToken && receiptToken.length === 20) {
            const unsubscribe = firebase
                .firestore()
                .collection("stripe_customers")
                .doc(user.uid)
                .collection("payments")
                .doc(receiptToken)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const payment = doc.data();
                        const paymentData = payment;
                        setDocumentData(paymentData)
                        console.log("Document data:", paymentData);
                    } else {
                        console.log("No such document!");
                    }
                }, (error) => {
                    console.log("Error getting document:", error);
                });

            return () => unsubscribe(); // Clean up the listener when the component is unmounted
        } else {
            console.log("null");
        }
    }, [receiptToken]); // useEffect will run when receiptToken changes

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

    if (!store || !receiptToken) return <div></div>; // Render a loading state if payment_data is not fetched

    return (
        <div className="" >
            <div className="col d-flex">

            </div>
            <div className="gap">
                <div className="col-2 d-flex mx-auto" />
                {documentData?.receipt && (
                    <div >
                        <div>

                            <b>
                                We have received your unpaid order.
                                Please contact the seller to confirm your order.
                            </b>
                        </div>

                        <div>
                            <b className="block text-black notranslate">{t("Order ID")}: {receiptToken?.substring(0, 4)}</b>
                        </div>
                        <span className="block text-black text-sm">{moment(documentData?.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").utcOffset(-13).format("MMMM D, YYYY h:mm a")}</span>
                    </div>
                )
                }


                {documentData?.receipt && JSON.parse(documentData.receipt || '[]').map((product, index) => {
                    return (
                        <div className="row row-main" key={index}>
                            <div className="col-9">
                                <div className="row d-flex">
                                    <b>
                                        {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                                    </b>
                                </div>
                                <div className="row d-flex">
                                    <p className="text-muted  mb-0 pb-0">@ ${product.subtotal} {t("each")} x {product.quantity}</p>
                                </div>
                            </div>
                            <div className="col-3 d-flex justify-content-end">
                                <p>
                                    <b>${Math.round(100 * product.subtotal * product.quantity) / 100}</b>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
};


export default App