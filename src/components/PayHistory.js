/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import {loadStripe} from '@stripe/stripe-js';



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

  firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        const payment = doc.data();

        let liElement = document.getElementById(`payment-${doc.id}`);
        if (!liElement) {
          liElement = document.createElement('li');
          liElement.id = `payment-${doc.id}`;
        }

        let content = '';
        if (
          payment.status === 'new' ||
          payment.status === 'requires_confirmation'
        ) {
          content = `Creating Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )}`;
        } else if (payment.status === 'succeeded') {
          const card = payment.charges.data[0].payment_method_details.card;
          content = `✅ Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} on ${card.brand} card •••• ${card.last4}.`;
        } else if (payment.status === 'requires_action') {
          content = `🚨 Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
          handleCardAction(payment, doc.id);
        } else {
          content = `⚠️ Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
        }
        liElement.innerText = content;
        document.querySelector('#payments-list').appendChild(liElement);
      });
    });
    

  //console.log(elements.getElement(CardElement))
  return (
    <div>
  <ul id="payments-list"></ul>
    </div>
  );
};

export default PayHistory;