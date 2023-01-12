/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';


function Checkout() {
// Format amount for diplay in the UI

  const { user } = useUserContext();
  
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
    const amount = Number(form.get('amount'));
    const currency = form.get('currency');
    const data = {
      payment_method: form.get('payment-method'),
      currency,
      amount: formatAmountForStripe(amount, currency),
      status: 'new',
    };
  
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
                Card:
                <select name="payment-method" required></select>
              </label>
            </div>
            <div>
              <label>
                Amount:
                <input
                  name="amount"
                  type="number"
                  min="1"
                  max="99999999"
                  required
                />
                Currency:
  <select name="currency">
    <option value="usd">USD</option>
    <option value="eur">EUR</option>
    <option value="gbp">GBP</option>
    <option value="jpy">JPY</option>
  </select>
              </label>
            </div>
            <button>Pay</button>
          </form>
    </div>
  );
};

export default Checkout;