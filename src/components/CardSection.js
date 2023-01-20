/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';
import {CardElement} from '@stripe/react-stripe-js';
import {useStripe, useElements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import e from 'cors';


const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      margin: "20px 5px",
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
  let customerData ={}
  ///
  const stripe = useStripe();
  const elements = useElements();
  console.log(user.uid)
  let paymentMethodAdded = false;
  useEffect(() => {
    
    document
      .querySelector('#payment-method-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!event.target.reportValidity()) {
          return;
        }
    
        document
          .querySelectorAll('button')
          .forEach((button) => (button.disabled = true));
        if (!stripe || !elements) {
          
          // Stripe.js has not yet loaded.
          // Make sure to disable form submission until Stripe.js has loaded.
          return;
        } else if (!paymentMethodAdded) {
          
          // Payment method has not yet been added
          // Proceed with adding payment method
          console.log(elements);
          console.log(stripe);

          //console.log(result.setupIntent.payment_method)
          const form = new FormData(event.target);
          const cardholderName = form.get('name');
          console.log(user.uid)
          console.log("hello")
          await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user.uid)
            .onSnapshot((snapshot) => {
              console.log("hello")
              if (snapshot.data()) {
                console.log('user found in stripe');
                customerData = snapshot.data();
                console.log(customerData);
                console.log(elements.getElement(CardElement));
                const { setupIntent, error } = stripe.confirmCardSetup(
                  customerData.setup_secret,
                  {
                    payment_method: {
                      card: elements.getElement(CardElement),
                      billing_details: {
                        name: cardholderName,
                      },
                    },
                  }
                ).then(function(result) {
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
                      document.querySelector('#add-new-card').open = false;
                      document
                        .querySelectorAll('button')
                        .forEach((button) => (button.disabled = false));
                      paymentMethodAdded = true;
                      window.location.reload()
                    });

                  }
                });
              }
            });
        } else {
          // Payment method has already been added
          // Do not allow form submission
          return;
        }
      });
    
}, [stripe, elements]);
  //console.log(elements.getElement(CardElement))
  return (
    <div>
    <div id="add-new-card">
    <form id="payment-method-form">
      <label>
        Cardholder name
        <br></br>
        <input type="text" name="name" required />
      </label>
      <fieldset>
        <div id="card-element">
        <label style={{width: "400px"}}>
      Card details
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </label>
        </div>
      </fieldset>
      <div id="error-message" role="alert"></div>
      <button style ={{color:"white", background:"#007bff", padding:"6px 12px", textAlign:"center", borderRadius:"0.25rem"}}> Save Card</button>
    </form>
  </div>

    </div>


  );
};

export default CardSection;