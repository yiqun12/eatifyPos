/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';


function Checkout(props) {
// Format amount for diplay in the UI

  const user = JSON.parse(localStorage.getItem('user'));
  const { totalPrice } = props;

  function startDataListeners() {
  
    /**
     * Get all payment methods for the logged in customer
     */
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payment_methods')
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          document.querySelector('#add-new-card').open = true;
        }
        snapshot.forEach(function (doc) {
          const paymentMethod = doc.data();
          if (!paymentMethod.card) {
            return;
          }
  
          const optionId = `card-${doc.id}`;
          let optionElement = document.getElementById(optionId);
  
          // Add a new option if one doesn't exist yet.
          if (!optionElement) {
            optionElement = document.createElement('option');
            //console.log("hello")
            optionElement.id = optionId;
            document.querySelector('select[name=payment-method]').appendChild(optionElement);
          }
          
          optionElement.value = paymentMethod.id;
          optionElement.text = `${paymentMethod.card.brand} •••• ${paymentMethod.card.last4} | Expires ${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
          console.log("exist card:",optionElement.text)
  
        });
      });
  
  
                      
  document
  .querySelector('#payment-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = true));
  
    const form = new FormData(event.target);
    const amount = Number(totalPrice);
    const currency = 'usd';
    console.log(currency)
    console.log(amount)
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0,10) + '-' + dateTime.slice(11,13) + '-' + dateTime.slice(14,16) + '-' + dateTime.slice(17,19) + '-' + dateTime.slice(20,22);        
    console.log(form.get('payment-method'))
    const data = {
      payment_method: form.get('payment-method'),
      currency,
      amount: amount,
      status: 'new',
      receipt:localStorage.getItem("products"),
      dateTime:date,
    };
    //console.log(data)
  
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data);
  
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = false));
  });
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
  
  // Format amount for Stripe
  function formatAmountForStripe(amount, currency) {
    return zeroDecimalCurrency(amount, currency)
      ? amount
      : Math.round(amount * 100);
  }

  useEffect(() => {
    startDataListeners();
  }, []);
  

  return (
    <div>
          <form id="payment-form">
            <div>
              <label>
                Or Select Card and pay:
                <select name="payment-method" required></select>
              </label>
            </div>
            <div>
            </div>
            <button className="btn btn-info">Pay</button>
          </form>
    </div>
  );
};

export default Checkout;