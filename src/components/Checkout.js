/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import { useState } from 'react';


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
          optionElement.setAttribute("data-type", paymentMethod.card.brand);
          //console(optionElement.value)
          optionElement.text = `•••• ${paymentMethod.card.last4} | ${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
          //console.log("exist card:",optionElement.text)

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
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        console.log(form.get('payment-method'))
        const data = {
          payment_method: form.get('payment-method'),
          currency,
          amount: amount,
          status: 'new',
          receipt: localStorage.getItem("products"),
          dateTime: date,
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

  const [selectedOption, setSelectedOption] = useState('');

  function handleOptionChange(event) {
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];
    const dataType = selectedOption.getAttribute("data-type");
    setSelectedOption(dataType);
    //console.log(dataType)
  }
  //console.log(selectedOption)

  return (
    <div>

      <form id="payment-form">
        <div>
          <label  style={{ width: '100%' }}>

            <div className="row row-1">
              <div className="col-2">
                {selectedOption === 'mastercard' ? (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/mastercard-logo.png" />
                ) : (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/visa.png" />
                )}

              </div>

              <div className="col-7">

                <select style={{ 'background-color': "#f5f7f9", color: "#9ca3af" }} name="payment-method" onChange={handleOptionChange} required>
                  <option data-type="mastercard" >•••• •••• | mm/yyyy</option>
                </select>
              </div>
              <div className="col-3 d-flex justify-content-center">
                {/* <a href="#">X</a> */}
              </div>
            </div>
          </label>
        </div>

        <button className="btn btn-info" style={{width : "100%"}}  class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Pay ${totalPrice}</button>
      </form>
    </div>
  );
};

export default Checkout;

/**

import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import { useState } from 'react';


function Checkout(props) {
  // Format amount for diplay in the UI

  const user = JSON.parse(localStorage.getItem('user'));
  const { totalPrice } = props;

  function startDataListeners() {


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
          optionElement.setAttribute("data-type", paymentMethod.card.brand);
          //console(optionElement.value)
          optionElement.text = `•••• ${paymentMethod.card.last4} | ${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
          //console.log("exist card:",optionElement.text)

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
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        console.log(form.get('payment-method'))
        const data = {
          payment_method: form.get('payment-method'),
          currency,
          amount: amount,
          status: 'new',
          receipt: localStorage.getItem("products"),
          dateTime: date,
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

  const [selectedOption, setSelectedOption] = useState('');

  function handleOptionChange(event) {
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];
    const dataType = selectedOption.getAttribute("data-type");
    setSelectedOption(dataType);
    //console.log(dataType)
  }
  //console.log(selectedOption)

  return (
    <div>

      <form id="payment-form">
        <div>
          <label  style={{ width: '100%' }}>

            <div className="row row-1">
              <div className="col-2">
                {selectedOption === 'mastercard' ? (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/mastercard-logo.png" />
                ) : (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/visa.png" />
                )}

              </div>

              <div className="col-7">

                <select style={{ 'background-color': "#f5f7f9", color: "#9ca3af" }} name="payment-method" onChange={handleOptionChange} required>
                  <option data-type="mastercard" >•••• •••• | mm/yyyy</option>
                </select>
              </div>
              <div className="col-3 d-flex justify-content-center">
              </div>
            </div>
          </label>
        </div>
        <button className="btn btn-info" style={{width : "100%"}} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Pay</button>
      </form>
    </div>
  );
};

export default Checkout;

*/