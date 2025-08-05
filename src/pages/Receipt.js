
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
import { lookup } from 'zipcode-to-timezone';

const App = () => {

  return (

    <div className='mx-auto'>
      <Item />
    </div>
  );
};

const Item = () => {
  function getTimeZoneByZip(zipCode) {
    // Use the library to find the timezone ID from the ZIP code
    const timeZoneId = lookup(zipCode);

    // Check if the timezone ID is in our timeZones list
    return timeZoneId;
  }
  //console.log("timezone")
  //console.log(getTimeZoneByZip("94133"))//"America/Los_Angeles"
  const [AmericanTimeZone, setAmericanTimeZone] = useState("America/Los_Angeles");

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
            setAmericanTimeZone(getTimeZoneByZip(doc.data().ZipCode))//america/los_angeles
          } else {
            setDocumentData(doc.data().Name);
            setAmericanTimeZone(getTimeZoneByZip(doc.data().ZipCode))//america/los_angeles
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
    if (receiptToken) {
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
              const paymentData = {
                amount: payment.amount,
                receipt_data: payment.receiptData,
                document_id: doc.id.substring(0, 4),
                time: parseDateUTC(payment.dateTime, AmericanTimeZone),//display purpose
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

                    const paymentData = {
                      amount: payment.amount,
                      receipt_data: payment.receiptData,
                      document_id: doc.id.substring(0, 4),
                      time: parseDateUTC(payment.dateTime, AmericanTimeZone),//display purpose
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
          <b className="text-black text-2xl ">{documentData}</b>
        </div>
        <b className="block text-black text-sm">{payment_data.isDinein} ({payment_data.status})</b>

        <b className="block text-black notranslate">{t("Order ID")}: {payment_data.document_id?.substring(0, 4)}</b>

        <span className="block text-black text-sm notranslate">
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
                    <div>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>
                  </b>
                </div>
                <div className="row d-flex notranslate">
                  <p className="text-muted mb-0 pb-0" >@ ${roundToTwoDecimalsTofix(product.itemTotalPrice)} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b className=" notranslate" >${roundToTwoDecimalsTofix(Math.round(100 * product.itemTotalPrice * product.quantity) / 100)}</b>
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
              <b className=" notranslate"
              >${roundToTwoDecimalsTofix(payment_data.subtotal)}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b className=" notranslate" >${roundToTwoDecimalsTofix(payment_data.tax)}</b>
            </div>
          </div>

          {(payment_data.memberBalanceUsed && payment_data.memberBalanceUsed != 0.00) ?
            <div className="row">
              <div className="col">
                <b style={{color: '#059669'}}>💳 {t("Member Balance Used")}:</b>
              </div>
              <div className="col d-flex justify-content-end">
                <b className=" notranslate" style={{color: '#059669'}}>-${roundToTwoDecimalsTofix(payment_data.memberBalanceUsed)}</b>
              </div>
            </div>
            : null}

          {(payment_data.tips && payment_data.tips != 0.00) ?
            <div className="row">
              <div className="col">
                <b>Gratuity:</b>
              </div>
              <div className="col d-flex justify-content-end">
                <b className=" notranslate" >${roundToTwoDecimalsTofix(payment_data.tips)}</b>
              </div>
            </div>
            : null}

          {(roundToTwoDecimalsTofix(payment_data.amount / 100) == roundToTwoDecimalsTofix(payment_data.total)) ?
            null
            :
            <>
              <div className="row">
                <div className="col">
                  <b>Delivery Fee:</b>
                </div>
                <div className="col d-flex justify-content-end">
                  <b className=" notranslate" >${roundToTwoDecimalsTofix(roundToTwoDecimalsTofix(payment_data.amount / 100) - roundToTwoDecimalsTofix(payment_data.total))}</b>
                </div>
              </div>

            </>

          }
          <div className="row">
            <div className="col">
              <b> {t("Total Price")}:</b>
            </div>

            <div className="col d-flex justify-content-end">
              <b className=" notranslate" >${roundToTwoDecimalsTofix(payment_data.amount / 100)}</b>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
};


export default App
