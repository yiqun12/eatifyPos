/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import {loadStripe} from '@stripe/stripe-js';
import { MyHookProvider, useMyHook } from '../pages/myHook';
import { useState ,useEffect} from 'react';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import {useLocation} from 'react-router-dom';

import applepay from './applepay.png';
import amex from './amex.png';
import visa from './visa.png';
import discover from './discover.png';

function PayHistory(props) {
  const { totalPrice, tips } = props;

// Format amount for diplay in the UI
function formatAmount(amount, currency) {
    amount = zeroDecimalCurrency(amount, currency)
      ? amount
      : (amount / 100).toFixed(2);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
  function zeroDecimalCurrency(amount, currency) {
    let numberFormat = new Intl.NumberFormat(['en-US'], {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let part of parts) {
      if (part.type === 'decimal') {
        zeroDecimalCurrency = false;
      }
    }
    return zeroDecimalCurrency;
  }
let stripe; // Declare stripe variable outside of your function

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';

loadStripe(STRIPE_PUBLISHABLE_KEY, {
  stripeAccount: 'acct_1NR75OE0QS2AMUUQ'
}).then(stripeInstance => {
  stripe = stripeInstance; // Save stripe instance for use in your function
}).catch(console.error);

const promise = useStripe()
const elements = useElements()
const handleAli = async (e) => {
  e.preventDefault();

  if (!promise || !elements) {
    return;
  }

  const amount = Number(totalPrice);
  const currency = 'usd';
  //  console.log(currency)
  // console.log(amount)
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
  const user = JSON.parse(sessionStorage.getItem('user'));
  const data = {
    payment_method: 'alipay',
    currency,
    amount: amount,
    status: 'new',
    receipt: sessionStorage.getItem("products"),
    dateTime: date,
    user_email: user.email,
    isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut"
  };
  // reconfirm the payment
  await firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .add(data);
  // e.complete('success'); // Notify the browser that the payment is successful

};
  async function handleCardAction(payment, docId) {

  if(!stripe){
    console.log("Stripe has not been initialized yet.")
    return;
  }
  const { error, paymentIntent } = await stripe.handleCardAction(
    payment.client_secret
  );
  if (error) {
    alert(error.message);
    payment = error.payment_intent;
  } else if (paymentIntent) {
    payment = paymentIntent;
    payment['receiptData'] =  sessionStorage.getItem('products');
    payment['user_email'] = JSON.parse(sessionStorage.getItem('user')).email;
  }
  
  await firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .doc(docId)
    .set(payment, { merge: true });
}
async function handleAlipay(payment, docId) {
  if(!stripe){
    console.log("Stripe has not been initialized yet.")
    return;
  }
  sessionStorage.setItem('docid',docId)
  const { error, paymentIntent } = await stripe.confirmAlipayPayment(
    payment.client_secret, {
    return_url: `${window.location.origin}/checkout?return=true`,
  })
  
  if (error) {
    alert(error.message);
    }
}

async function handleWechatPay(payment, docId) {
  if(!stripe){
    console.log("Stripe has not been initialized yet.")
    return;
  }
  const { error, paymentIntent } = await stripe.confirmWechatPayPayment(
    payment.client_secret, {
      payment_method_options: {
        wechat_pay: {
          client: 'web'
        },
      },
    }
    )
  if (error) {
    alert(error.message);
    payment = error.payment_intent;
  } else if (paymentIntent) {
    payment = paymentIntent;
    payment['receiptData'] =  sessionStorage.getItem('products');
    payment['user_email'] = JSON.parse(sessionStorage.getItem('user')).email;
  }
  
  await firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .doc(docId)
    .set(payment, { merge: true });
}

  const user = JSON.parse(sessionStorage.getItem('user'));
  /**
   * Get all payments for the logged in customer
   */
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0,10) + '-' + dateTime.slice(11,13) + '-' + dateTime.slice(14,16) + '-' + dateTime.slice(17,19) + '-' + dateTime.slice(20,22);        
  const { id, saveId } = useMyHook(null);
  let products = JSON.parse(sessionStorage.getItem("products"));

  useEffect(() => {
    products = JSON.parse(sessionStorage.getItem("products"));
  }, [id]);
  
  useEffect(() => {

  firebase
  .firestore()
  .collection('stripe_customers')
  .doc(user.uid)
  .collection('payments')
  .where('dateTime', '>', date)
  .orderBy('dateTime', 'desc')
  .limit(1)
  .onSnapshot((snapshot) => {
    
      snapshot.forEach((doc) => {
        const payment = doc.data();
        console.log('read card')

        let liElement = document.getElementById(`payment-${doc.id}`);
        if (!liElement) {
          liElement = document.createElement('li');
          liElement.id = `payment-${doc.id}`;
        }
       // console.log(payment.dateTime)
        let content = '';

        if (
          payment.status === 'new' & !payment.error ||
          payment.status === 'requires_confirmation'
        ) {
          
          content = `🚨 ` + t("Creating Payment");
          
        } else if (payment.status === 'succeeded') {
          //const card = payment.charges.data[0].payment_method_details.card;
        const collection_data = {
          receipt_data : payment.receiptData,
          document_id : doc.id,
          time: payment.dateTime,
          //pay_name: payment.charges.data[0].billing_details.name,
          isDinein:payment.metadata.isDine,
          tax:payment.metadata.tax,
          tips:payment.metadata.tips,
          subtotal:payment.metadata.subtotal,
          total:payment.metadata.total,
        };
        //console.log(JSON.stringify(collection_data)); // output the JSON object to the console
        sessionStorage.setItem('collection_data', JSON.stringify(collection_data));
        sessionStorage.removeItem("products");
        window.location.href = '/Receipt'
        
        } else if (payment.status === 'requires_action') {
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = false));
          content = `🚨 ` + t("Payment status: ") + `${payment.status}`;
          handleCardAction(payment, doc.id);
        } else if(payment.error) {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          content = `⚠️ ` + t("Payment failed: ") + `. ${t(payment.error)}`;
        }else if(payment.status === 'requires_payment_method')
          if(payment.payment_method_types[0]==='alipay'){
            handleAlipay(payment, doc.id);
          }else if(payment.payment_method_types[0]==='wechat_pay'){
            handleWechatPay(payment, doc.id);
          }
          
        {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          content = `🚨 ` + t("Payment status: ") + `${payment.status}`;
        }
        
        liElement.innerText = content;
        document.querySelector('#payments-list').appendChild(liElement);
      });
    });
    
  }, []); // empty dependency array to run once on mount
  //console.log(elements.getElement(CardElement))

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
    //console.log(sessionStorage.getItem("translationsMode"))

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

  // Extract the client secret from the query string params.
  const query = new URLSearchParams(useLocation().search);
  const clientSecret = query.get('payment_intent_client_secret');
  //handle ali pay return
  useEffect(() => {
    if (!promise || !elements) {
      return;
    }
  
    console.log(clientSecret)
    const fetchPaymentIntent = async () => {
      const {error, paymentIntent} = await promise.retrievePaymentIntent(
        clientSecret
      );
      if (error) {
        console.log("error")
       // addMessage(error.message);
      }
      let payment;
      if (error) {
        alert(error.message);
        payment = error.payment_intent;
      }
      if (paymentIntent) {
        payment = paymentIntent;
        payment['receiptData'] =  sessionStorage.getItem('products');
        payment['user_email'] = JSON.parse(sessionStorage.getItem('user')).email;
      }

      const docId = sessionStorage.getItem('docid');
      const paymentRef = firebase
          .firestore()
          .collection('stripe_customers')
          .doc(user.uid)
          .collection('payments')
          .doc(docId);
      
      // Set initial payment information
      await paymentRef.set(payment, { merge: true });
      
      // Listen to updates
      paymentRef.onSnapshot((docSnapshot) => {
        const payment = docSnapshot.data();
          //const card = payment.charges.data[0].payment_method_details.card;
        const collection_data = {
          receipt_data : payment.receiptData,
          document_id : docId,
          time: payment.dateTime,
          //pay_name: payment.charges.data[0].billing_details.name,
          isDinein:payment.metadata.isDine,
          tax:payment.metadata.tax,
          tips:payment.metadata.tips,
          subtotal:payment.metadata.subtotal,
          total:payment.metadata.total,
        };
        //console.log(JSON.stringify(collection_data)); // output the JSON object to the console
        sessionStorage.setItem('collection_data', JSON.stringify(collection_data));
        sessionStorage.removeItem("products");
        window.location.href = '/Receipt'
      });
      
     // addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    };
    fetchPaymentIntent();
  }, [clientSecret, promise,elements]);

  return (
    <div>
                  <form id="payment-form" onSubmit={handleAli}>
        <button
                type="submit"
                name="pay"
                class="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
                style={{ width: "100%" }}
              >
<svg
  xmlns="http://www.w3.org/2000/svg"
  height="25"
  width="25"
  viewBox="-51.45 -71.25 445.9 415.5"
  style={{ display: "inline", verticalAlign: "middle" }}
>
  <g fill="#FFF" fill-rule="evenodd"></g>
<path fill="#FFFFFF" d="M48.508 0C21.694 0 0 21.511 0 48.068v203.87c0 26.536 21.694 48.059 48.508 48.059h205.81c26.793 0 48.496-21.522 48.496-48.059v-2.086c-.902-.372-78.698-32.52-118.24-51.357-26.677 32.524-61.086 52.256-96.812 52.256-60.412 0-80.927-52.38-52.322-86.86 6.237-7.517 16.847-14.698 33.314-18.718 25.76-6.27 66.756 3.915 105.18 16.477 6.912-12.614 12.726-26.506 17.057-41.297H72.581v-11.88h61.057V87.168H59.687V75.28h73.951V44.89s0-5.119 5.236-5.119h29.848v35.508h73.107V87.17h-73.107v21.303h59.674c-5.71 23.176-14.38 44.509-25.264 63.236 18.111 6.49 34.368 12.646 46.484 16.666 40.413 13.397 51.74 15.034 53.201 15.205V48.069c0-26.557-21.704-48.068-48.496-48.068H48.511zm33.207 162.54a91.24 91.24 0 00-7.822.426c-7.565.753-21.768 4.06-29.533 10.865-23.274 20.109-9.344 56.87 37.762 56.87 27.383 0 54.743-17.343 76.236-45.114-27.71-13.395-51.576-23.335-76.643-23.047z"/>
</svg>
               
                {t("AliPay")}
              </button>
      </form>

  <ul id="payments-list"></ul>
    </div>
  );
};

export default PayHistory;