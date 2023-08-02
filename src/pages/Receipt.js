
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import { useEffect } from 'react';
//import './html.css';
import { useMyHook } from './myHook';
import './SwitchToggle.css';
import moment from 'moment';
import firebase from 'firebase/compat/app';

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
  const [payment_data, setPaymentData] = useState(null);
  const [products, setProducts] = useState([]);
  const receiptToken = window.location.href.split('?')[1];

  useEffect(() => {
    if (receiptToken && receiptToken.length === 20) {
      const unsubscribe = firebase
        .firestore()
        .collection("success_payment")
        .doc(receiptToken)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const payment = doc.data();
            const paymentData = {
              receipt_data: payment.receiptData,
              document_id: doc.id,
              time: payment.dateTime,
              email: payment.user_email,
              status: payment.status === "succeeded" ? "Paid Online" : "Unpaid Online",
              isDinein: payment.metadata.isDine,
              tax: payment.metadata.tax,
              tips: payment.metadata.tips,
              subtotal: payment.metadata.subtotal,
              total: payment.metadata.total,
            };
            console.log("Document data:", paymentData);
            setPaymentData(paymentData);
            setProducts(JSON.parse(paymentData.receipt_data));
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
   const t = (text) => {
     // const trans = sessionStorage.getItem("translations")
     //console.log(trans)
    // console.log(sessionStorage.getItem("translationsMode"))
 
     if (trans != null) {
       if (sessionStorage.getItem("translationsMode") != null) {
       // return the translated text with the right mode
         if (trans[text] != null) {
           if (trans[text][sessionStorage.getItem("translationsMode")] != null)
             return trans[text][sessionStorage.getItem("translationsMode")]
         }
       }
     } 
     // base case to just return the text if no modes/translations are found
     return text
   }

  if (!payment_data) return <div>Loading...</div>; // Render a loading state if payment_data is not fetched

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
        
        <b className="text-black text-2xl">{payment_data.isDinein} ({payment_data.status})</b>
        
        <span className="block text-black text-sm">{  moment(payment_data.time, "YYYY-MM-DD-HH-mm-ss-SS").utcOffset(-8).format("MMMM D, YYYY h:mm a")}</span>
        <span className="block text-black text-sm">{t("Email")}: {payment_data.email}</span>
        <span className="block text-black text-sm">{t("Order ID")}: {payment_data.document_id}</span>

      </div>
      <div className="main">
        <span id="sub-title">
          <br>
          </br>
        </span>
        {products.map((product, index) => {
          return (
            <div className="row row-main" key={index}>
              <div className="col-9">
                <div className="row d-flex">
                    <b>{index+1}.{t(product.name)}</b>
                </div>
                <div className="row d-flex">
                  <p className="text-muted  mb-0 pb-0">@ ${product.subtotal} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>${Math.round(100 * product.subtotal * product.quantity)/100}</b>
                </p>
              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
          <div className="row">
            <div className="col">
              <b> {t("Subtotal")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.subtotal}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.tax}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tips")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.tips}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${payment_data.total}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};


export default App