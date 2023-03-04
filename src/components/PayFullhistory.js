/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import {loadStripe} from '@stripe/stripe-js';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useState ,useEffect} from 'react';
import { useMyHook } from '../pages/myHook';



function PayFullhistory() {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

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
  useEffect(() => {
  firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .orderBy("dateTime", "desc")
    .onSnapshot((snapshot) => {
      let count = snapshot.size;

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
          
          content = `${count} (${t("Pending")})🚨 ${t("Creating Payment for")} ${formatAmount(
            payment.amount*100,
            payment.currency
          )}`;
        } else if (payment.status === 'succeeded') {
            
          const card = payment.charges.data[0].payment_method_details.card;
          const dateTime = payment.dateTime;
          const formattedDate = moment(dateTime, "YYYY-MM-DD-HH-mm-ss-SS").utcOffset(-13).format("MMMM D, YYYY h:mm a");
            // Format receipt data
            let products_ = JSON.parse(payment.receiptData)
            const newItems = products_.map(item => {
                return {name: item.name, quantity: item.quantity, subtotal: item.subtotal,item_Total: item.subtotal * item.quantity}
              });
              var formattedString = "";
              for(var i=0;i<newItems.length;i++){
                  formattedString += `${newItems[i].quantity} x ${t(newItems[i].name)}($${newItems[i].subtotal}) = $${newItems[i].item_Total}<br>`;
              }
              console.log(doc.id)
              //console.log(payment.receiptData)
              //应该显示这次交易id 时间不够 下次再加。
      content = `<div style="display: inline-block;">
      <details>
        <summary>
        ${count}  ✅${formatAmount(payment.amount, payment.currency)} ${card.brand} •••• ${card.last4}. <i class="fas fa-arrow-circle-down"></i>
        </summary>
        <div style="border: 1px solid; padding: 10px; background-color: white;">
        <p style="padding: 0; margin: 0;">${t("Card Owner")}: ${payment.charges.data[0].billing_details.name} </p>
        <p style="padding: 0; margin: 0px 0px 0px 5px;">${formattedString}</p>
        <p style="padding: 0; margin: 0;">${formattedDate}</p>
        </div>
      </details>`;//${payment.dateTime} ${payment.receiptData} ${payment.charges.data[0].billing_details.name} 
        } else if (payment.status === 'requires_action') {
          content = `${count} 🚨 ${t("Payment for")} ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status} ${t("requires action")}`;
          handleCardAction(payment, doc.id);
        } else if(payment.error) {
          content = `<div style="display: inline-block;">
          <details>
            <summary>
            ${count} ⚠️ ${t("Failed Payment")}. <i class="fas fa-arrow-circle-down"></i>
            </summary>
            <div style="border: 1px solid; padding: 10px; background-color: white;">
            <p>${payment.error} </p>
            </div>
          </details>
      </div>`;
        }else {
          content = `${count} ⚠️ ` + t("Payment for") + ` ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
        }
        const sanitizedContent = DOMPurify.sanitize(content);//DOMPurify to sanitize the content, it can remove any malicious code and make it safe to use with innerHTML.
        liElement.innerHTML = sanitizedContent;
        document.querySelector('#payments-list').appendChild(liElement);
        count--;
      });
    });
  }, []); // empty dependency array to run once on mount

  const trans = JSON.parse(localStorage.getItem("translations"))
  const t = (text) => {
    // const trans = localStorage.getItem("translations")
    console.log(trans)
    console.log(localStorage.getItem("translationsMode"))

    if (trans != null) {
      if (localStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
            if (trans[text][localStorage.getItem("translationsMode")] != null)
              return trans[text][localStorage.getItem("translationsMode")]
        }
      }
    } 
    // base case to just return the text if no modes/translations are found
    return text
  }
  //console.log(elements.getElement(CardElement))
  return (
    <div>
  <ul style = {{"text-align": "left"}}id="payments-list"></ul>
    </div>
  );
};

export default PayFullhistory;