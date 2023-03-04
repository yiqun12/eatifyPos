//import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useRef, useEffect } from 'react';
import { useState } from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
//import { useEffect } from 'react';
import e from 'cors';
import './blueButton.css';
import { useMyHook } from '../pages/myHook';
import { AddressElement } from '@stripe/react-stripe-js';
import { MDBCheckbox } from 'mdb-react-ui-kit';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "15px",
      "::placeholder": {
        color: "#aab7c4",
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};



function CardSection(props) {
  

  function handleCheckboxChange() {
    console.log(!isChecked.current)
    isChecked.current = !isChecked.current
  }
  
  const { totalPrice } = props;
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);


  const { user } = useUserContext();
  const isChecked = useRef(user.email != "Anonymous@eatifyPos.com" );
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
            //document.querySelector('#prompt-message').textContent = "Too frequent operations";
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            document
              .querySelectorAll('button')
              .forEach((button) => (button.disabled = false));

            return;
          } else {

            // Payment method has not yet been added
            // Proceed with adding payment method
            const form = new FormData(event.target);
            const cardholderName = form.get('name');
            console.log(form.get('address1'))
            console.log(form.get('address2'))
            console.log(form.get('City'))
            console.log(form.get('State'))
            console.log('user found in stripe');

            console.log(customerData.current);
            const { setupIntent, error } = stripe.confirmCardSetup(
              customerData.current.setup_secret,
              {
                payment_method: {
                  card: elements.getElement(CardElement),
                  billing_details: {
                    name: cardholderName,
                    address:{
                      city:form.get('City'),
                      country:"US",
                      state:form.get('State'),
                      line1:form.get('address1'),
                      line2:form.get('address2'),
                    }
                  },
                },
              }
            ).then(function (result) {
              console.log(result.error);
              if (result.error != null) {
                console.log('error');
                document.querySelector('#prompt-message').textContent = result.error.message;
                document
                  .querySelectorAll('button')
                  .forEach((button) => (button.disabled = false));
              } else if (result.setupIntent != null) {
                //console.log(localStorage.getItem("isDinein"))
                //console.log(localStorage.getItem("isDinein")== "true"?"DineIN":"TakeOut")
 document
.querySelectorAll('button')
.forEach((button) => (button.disabled = true));
const amount = Number(totalPrice);
const currency = 'usd';
const dateTime = new Date().toISOString();
const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
//console.log(form.get('payment-method'))
const user = JSON.parse(localStorage.getItem('user'));
const data = {
payment_method: result.setupIntent.payment_method,
currency,
amount: amount,
status: 'new',
receipt: localStorage.getItem("products"),
dateTime: date,
user_email: user.email,
isDinein:localStorage.getItem("isDinein")== "true"?"DineIn":"TakeOut"
};
//console.log(data)

          // for translation
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

firebase
.firestore()
.collection('stripe_customers')
.doc(user.uid)
.collection('payments')
.add(data).then(() => {
  saveId(Math.random())
  if(isChecked.current ){
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payment_methods')
      .add({ id: result.setupIntent.payment_method })
      .then(() => {
        //console.log(res)
        // Payment method was successfully added
        //console.log(result.setupIntent.payment_method)

        // set the prompt message
        const promptMessage = document.querySelector('#prompt-message');
        promptMessage.textContent = t("Card added") + "!";

        // hide the error message after 2 seconds
        setTimeout(() => {
          promptMessage.textContent = "";
        }, 6000);
        // reset the form inputs
        const form = document.querySelector('#payment-method-form');
        form.reset();
        // clear the card details input field
        if (elements) {
          const cardElement = elements.getElement(CardElement);
          cardElement.clear();
        }
        saveId(Math.random())
        //customerData.current = null //cleanup
      })
    }
})
.catch((error) => {
  console.log("Error writing payment to Firestore: ", error);
});



              }
            });
          }
        });
    }, 1);

  }, [customerData.current, stripe, elements,isChecked.current ]);

            // for translation
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

  return (
    <div id="card2-header">
      <div id="add-new-card">
        <form id="payment-method-form">
          <div id="card-element" >

            <div className="row-1" style={{"border-radius":'0px' ,borderTopLeftRadius: '5px', borderTopRightRadius: '5px', marginTop: "3px", marginBottom: "0px", width: "100%" }}>
              <div className="row row-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <span id="card2-inner" style={{
                  'paddingLeft': 0,
                  'paddingRight': 0,
                  color: "black"
                }}>{t("Card details")}</span>
              </div>
              <div className="row row-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <span style={{
                  'paddingLeft': 0,
                  'paddingRight': 0
                }}>                  <CardElement
                    id="card-element" options={CARD_ELEMENT_OPTIONS} />
                </span>

              </div>
            </div>

            {/*The following US states and territories are not currently supported by Stripe and will not be accepted for validation:"AMERICAN SAMOA", "MICRONESIA", "GUAM", "MARSHALL ISLANDS", "NORTHERN MARIANA ISLANDS", "PALAU", "UNITED STATES MINOR OUTLYING ISLANDS", "VIRGIN ISLANDS"*/}
          </div>

          <div className="row-1 m-0" style={{"border-radius":'0px' }}>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0,

            }}>

              <span id="card2-inner" style={{
                'paddingLeft': 0,
                'paddingRight': 0,
                color: "black"
              }} >{t("Card holder name")}</span>
            </div>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>
              <input style={{
                'background-color': 'transparent',
                'border-color': 'transparent',
                'paddingLeft': 0,
                'paddingRight': 0
              }} className="card_input" type="text" name="name" required placeholder="Your name" />
            </div>
          </div>
          <div className="row-1  m-0" style={{"border-radius":'0px' }}>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>

              <span id="card2-inner" style={{
                'paddingLeft': 0,
                'paddingRight': 0,
                color: "black"
              }} >{t("Billing address")}</span>
            </div>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>
              <input style={{
                'background-color': 'transparent',
                'border-color': 'transparent',
                'paddingLeft': 0,
                'paddingRight': 0
              }} className="card_input" type="text" name="address1" required placeholder="Line 1" />
            </div>
          </div>

          <div className="row-1 m-0" style={{"border-radius":'0px'}}>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>
              <input style={{
                'background-color': 'transparent',
                'border-color': 'transparent',
                'paddingLeft': 0,
                'paddingRight': 0
              }} className="card_input" type="text" name="address2" placeholder="Line 2" />
            </div>
          </div>

          <div className="row-1 mt-0" style={{"border-radius":'0px', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px'}}>

            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>
              <div className="col-5" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <input style={{
                  'background-color': 'transparent',
                  'border-color': 'transparent',
                  'paddingLeft': 0,
                  'paddingRight': 0
                }} className="card_input " type="text" name="City" required placeholder="City" />
              </div>
              <div className='col d-flex justify-content-end' style={{

                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <select 
                name="State"
                style={{
                  'background-color': "#f5f7f9", color: "#9ca3af", width: "110px"
                }}
                required={true}
                >
                  <option hidden value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="DC">District Of Columbia</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>
          </div>
          <div id="prompt-message" role="alert"></div>

          <MDBCheckbox
      name='flexCheck'
      value=''
      id='flexCheckChecked'
      label={t('Save Card')}
      defaultChecked={isChecked.current }
      onChange={handleCheckboxChange}
              />
              
          <button style={{ width: "100%" }} class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{t("Pay")} ${totalPrice}</button>
        </form>
        
      </div>
    </div>
  );
};

export default CardSection;


// */