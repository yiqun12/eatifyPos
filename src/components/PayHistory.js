/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import {loadStripe} from '@stripe/stripe-js';
import { MyHookProvider, useMyHook } from '../pages/myHook';
import { useState ,useEffect} from 'react';


function PayHistory() {
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
  // Handle card actions like 3D Secure
async function handleCardAction(payment, docId) {
    const { error, paymentIntent } = await promise.handleCardAction(
      payment.client_secret
    );
    if (error) {
      alert(error.message);
      payment = error.payment_intent;
    } else if (paymentIntent) {
      payment = paymentIntent;
    }
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .doc(docId)
      .set(payment, { merge: true });
  
  }
  
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  
  const user = JSON.parse(localStorage.getItem('user'));
  /**
   * Get all payments for the logged in customer
   */
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0,10) + '-' + dateTime.slice(11,13) + '-' + dateTime.slice(14,16) + '-' + dateTime.slice(17,19) + '-' + dateTime.slice(20,22);        
  const { id, saveId } = useMyHook(null);
  let products = JSON.parse(localStorage.getItem("products"));

  useEffect(() => {
    products = JSON.parse(localStorage.getItem("products"));
  }, [id]);
  
  //fetch data from local stroage products.
  //console.log(localStorage.getItem("products"))
  const [totalPrice, setTotalPrice] = useState(products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0));
  useEffect(() => {
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
      //console.log(total)
      //console.log(products)
      setTotalPrice(total);
    }
    console.log(totalPrice)
    calculateTotalPrice();
  }, [products]);
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

        let liElement = document.getElementById(`payment-${doc.id}`);
        if (!liElement) {
          liElement = document.createElement('li');
          liElement.id = `payment-${doc.id}`;
        }
        console.log(payment.dateTime)
        let content = '';

        if (
          payment.status === 'new' & !payment.error ||
          payment.status === 'requires_confirmation'
        ) {
          
          content = `(Pending)🚨 Creating Payment for $${totalPrice}`;
          
        } else if (payment.status === 'succeeded') {
          const card = payment.charges.data[0].payment_method_details.card;
          content = `✅ Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} on ${card.brand} card •••• ${card.last4}.
          `;
        
        const collection_data = {
          receipt_data : payment.receiptData,
          document_id : doc.id,
          time: payment.dateTime,
          pay_name: payment.charges.data[0].billing_details.name,
          isDinein:payment.isDinein
        };
        //console.log(JSON.stringify(collection_data)); // output the JSON object to the console
        localStorage.setItem('collection_data', JSON.stringify(collection_data));
        localStorage.removeItem("products");
        window.location.href = '/Receipt'
        
        } else if (payment.status === 'requires_action') {
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = false));
          content = `🚨 Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
          handleCardAction(payment, doc.id);
        } else if(payment.error) {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          content = `⚠️ Payment failed. ${payment.error}`;
        }else {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          content = `⚠️ Payment for ${formatAmount(
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
  return (
    <div>
  <ul id="payments-list"></ul>
    </div>
  );
};

export default PayHistory;