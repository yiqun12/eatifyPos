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
    payment_method: {
      billing_details: {
        name: 'Jenny Rosen',
      },
    },
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
          
          content = `(` + t('Pending') + `)🚨 ` + t("Creating Payment for") + ` $ ${Math.round(100*(totalPrice))/100 }`;
          
        } else if (payment.status === 'succeeded') {
          //const card = payment.charges.data[0].payment_method_details.card;
          content = `✅ ` + t("Payment for") + `${formatAmount(
            payment.amount,
            payment.currency
          )} `;
        
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
          content = `🚨 ` + t("Payment for ") + `${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
          handleCardAction(payment, doc.id);
        } else if(payment.error) {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          content = `⚠️ ` + t("Payment failed") + `. ${t(payment.error)}`;
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
          content = `⚠️ ` + t("Payment for") + `${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
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
  <ul id="payments-list"></ul>
    </div>
  );
};

export default PayHistory;