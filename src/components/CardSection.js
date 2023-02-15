//import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useRef, useEffect } from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
//import { useEffect } from 'react';
import e from 'cors';
import './blueButton.css';


const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};



function CardSection() {

  const { user } = useUserContext();
  const stripe = useStripe();
  const elements = useElements();
  //console.log(user.uid)
  const customerData = useRef();

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .onSnapshot((snapshot) => {
        if (snapshot.data()) {
          customerData.current = snapshot.data();
          //console.log(snapshot.data())
        }
      });
  
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    setTimeout(() => {
      document
      .querySelector('#payment-method-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!event.target.reportValidity()) {
          return;
        }
        console.log(customerData.current == null)
        console.log(!elements)
        console.log(!stripe)
        document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = true));
      //  console.log(customerData.current)
        if (!stripe || !elements || customerData.current == null) {
          document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = false));
          document.querySelector('#error-message').textContent = "Too frequent operations";
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        } else{
  
          // Payment method has not yet been added
          // Proceed with adding payment method
          const form = new FormData(event.target);
          const cardholderName = form.get('name');
  
          console.log('user found in stripe');
  
          console.log(customerData.current);
          const { setupIntent, error } = stripe.confirmCardSetup(
            customerData.current.setup_secret,
            {
              payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                  name: cardholderName,
                },
              },
            }
          ).then(function (result) {
           console.log(result.error);
            if (result.error != null) {
              console.log('error');
              document.querySelector('#error-message').textContent = result.error.message;
              document
                .querySelectorAll('button')
                .forEach((button) => (button.disabled = false));
            } else if (result.setupIntent != null) {
  
              firebase
                .firestore()
                .collection('stripe_customers')
                .doc(user.uid)
                .collection('payment_methods')
                .add({ id: result.setupIntent.payment_method })
                .then(() => {
                  // Payment method was successfully added
                  console.log(result.setupIntent)
                  document
                  .querySelectorAll('button')
                  .forEach((button) => (button.disabled = false));
                  document.querySelector('#error-message').textContent = "successfuly added!";
                  //customerData.current = null //cleanup
                })
  
            }
          });
        }
      });
    }, 1);
      
  }, [customerData.current,stripe,elements]);

  //console.log(elements.getElement(CardElement))
  return (
    <div id="card2-header">
      <div id="add-new-card">
        <form id="payment-method-form">

          <div className="row-1">
            <div className="row row-2">
              
              <span id="card2-inner">Card holder name</span>
            </div>
            <div className="row row-2">
              <input style={{
'background-color': 'transparent',
'border-color': 'transparent'
              }}className = "card_input" type="text" name="name" required placeholder="Your name" />
            </div>
          </div>

          <fieldset>
            <div id="card-element">
                
              <div className="row-1" style={{ width: "100%" }}>
            <div className="row row-2">
              <span id="card2-inner">Card details</span>
            </div>
            <div className="row row-2">
              <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
          
            </div>
          </fieldset>
          <div id="error-message" role="alert"></div>
          <button style={{width : "100%"}} class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save Card</button>
        </form>
      </div>
    </div>
  );
};

export default CardSection;


// */