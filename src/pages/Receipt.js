
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
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';

const App = () => {

  return (

    <div className='mx-auto'>
      <Item />
    </div>
  );
};

const Item = () => {
  function roundToTwoDecimalsTofix(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }
  const [payment_data, setPaymentData] = useState(null);
  const [products, setProducts] = useState([]);
  //const receiptToken = window.location.href.split('?')[1];
  const urlParams = new URLSearchParams(window.location.search);
  const receiptToken = urlParams.get('order');  // '12345'
  const { user, user_loading } = useUserContext();

  const [documentData, setDocumentData] = useState("");
  // Get the query string from the current URL
  const queryString = window.location.search;

  // Create a URLSearchParams object from the query string
  const urlParams_ = new URLSearchParams(queryString);

  // Extract specific parameters
  const storeIdentity = urlParams_.get('store'); // 'demo'

  useEffect(() => {
    if (!payment_data) return;

    const fetchData = async () => {
      const db = firebase.firestore();
      try {
        const docRef = db.collection('TitleLogoNameContent').doc(payment_data.store);
        const doc = await docRef.get();
        if (doc.exists) {
          console.log(doc.data().Name)
          if (localStorage.getItem("Google-language")?.includes("中") || localStorage.getItem("Google-language")?.includes("Chinese")) {
            setDocumentData(doc.data().storeNameCHI);

          } else {
            setDocumentData(doc.data().Name);

          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      }
    };

    fetchData();
  }, [payment_data]);

  useEffect(() => {
    if (receiptToken && receiptToken.length === 20) {
      const unsubscribe =
        firebase
          .firestore()
          .collection("stripe_customers")
          .doc(user.uid)
          .collection("payments")
          .doc(receiptToken)
          .onSnapshot((doc) => {
            if (doc.exists) {
              const payment = doc.data();
              console.log("formattedDate"+parseDateUTC(payment.dateTime))
              const paymentData = {
                receipt_data: payment.receiptData,
                document_id: doc.id.substring(0, 4),
                time: parseDateUTC(payment.dateTime),
                email: payment.user_email,
                status: payment.powerBy,
                isDinein: payment.metadata.isDine === "TakeOut" ? "TakeOut" : "Table: " + payment.tableNum,
                tax: payment.metadata.tax,
                tips: payment.metadata.service_fee,
                subtotal: payment.metadata.subtotal,
                total: payment.metadata.total,
                store: payment.store,
                tableNum: payment.tableNum
              };
              console.log("Document data:", paymentData);
              setPaymentData(paymentData);
              setProducts(JSON.parse(paymentData.receipt_data));
            } else {//http://localhost:3000/store?store=demo&order=TH7DXBaLTDgn8yueN7Yb&modal=true#receive-jade-traffic

              firebase
                .firestore()
                .collection("stripe_customers")
                .doc(user.uid)
                .collection("TitleLogoNameContent")
                .doc(storeIdentity)
                .collection("success_payment")
                .doc(receiptToken)
                .onSnapshot((doc) => {
                  if (doc.exists) {
                    const payment = doc.data();
                    console.log("formattedDate"+parseDateUTC(payment.dateTime))

                    const paymentData = {
                      receipt_data: payment.receiptData,
                      document_id: doc.id.substring(0, 4),
                      time: parseDateUTC(payment.dateTime),
                      email: payment.user_email,
                      status: payment.powerBy,
                      isDinein: payment.metadata.isDine === "TakeOut" ? "TakeOut" : "Table: " + payment.tableNum,
                      tax: payment.metadata.tax,
                      tips: payment.metadata.service_fee,
                      subtotal: payment.metadata.subtotal,
                      total: payment.metadata.total,
                      store: payment.store,
                      tableNum: payment.tableNum
                    };
                    console.log("Document data:", paymentData);
                    setPaymentData(paymentData);
                    setProducts(JSON.parse(paymentData.receipt_data));
                    console.log("No such document!");
                  }
                }, (error) => {
                  console.log("Error getting document:", error);
                });
            }//http://localhost:3000/store?store=demo&order=WVpWWerpIyAYsYNyBLAP&modal=true
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

  if (!payment_data || !receiptToken) return <div></div>; // Render a loading state if payment_data is not fetched

  return (
    <div className="" >
      <div className="col d-flex">
        <div>

          <b>
            We have received your paid order.
            Please contact the seller to confirm your order.
          </b>
        </div>
      </div>
      <div className="gap">
        <div className="col-2 d-flex mx-auto" />

        <div className='mt-1 mb-2' >
          <b className="text-black text-2xl">{documentData}</b>
        </div>
        <b className="block text-black text-sm">{payment_data.isDinein} ({payment_data.status})</b>

        <b className="block text-black notranslate">{t("Order ID")}: {payment_data.document_id?.substring(0, 4)}</b>

        <span className="block text-black text-sm">
        {payment_data.time}
        </span>


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
                  <b>
                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                  </b>
                </div>
                <div className="row d-flex">
                  <p className="text-muted mb-0 pb-0">@ ${roundToTwoDecimalsTofix(product.subtotal)} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>${roundToTwoDecimalsTofix(Math.round(100 * product.subtotal * product.quantity) / 100)}</b>
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
              <b>${roundToTwoDecimalsTofix(payment_data.subtotal)}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${roundToTwoDecimalsTofix(payment_data.tax)}</b>
            </div>
          </div>
          {payment_data.tips && payment_data.tips !== 0 && (
            <div className="row">
              <div className="col">
                <b>{t("Gratuity")}:</b>
              </div>
              <div className="col d-flex justify-content-end">
                <b>${roundToTwoDecimalsTofix(payment_data.tips)}</b>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${roundToTwoDecimalsTofix(payment_data.total)}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};


export default App