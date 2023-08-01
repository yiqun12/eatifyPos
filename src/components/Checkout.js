/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { useMyHook } from '../pages/myHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Link from '@mui/material/Link';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import multipleCard from './mutiple_card.png';

import applepay from './applepay.png';

import amex from './amex.png';


import visa from './visa.png';


import discover from './discover.png';



function Checkout(props) {

  const [newCardAdded, setNewCardAdded] = useState(false);

  const handleAddNewCard = () => {
    setNewCardAdded(true);
  }
  const Goback = () => {
    setNewCardAdded(false);
  }
  const user = JSON.parse(sessionStorage.getItem('user'));
  const { totalPrice } = props;
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  
  const handleWechat = async (e) => {
    e.preventDefault();

    if (!stripe) {
      return;
    }

    // console.log('Payment Method ID:', paymentMethodId);

    // Remember to handle the promise returned by fetch and implement error handling
    const amount = Number(totalPrice);
    const currency = 'usd';
    //  console.log(currency)
    console.log(amount)
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const data = {
      payment_method: 'wechat_pay',
      currency,
      amount: amount,
      status: 'new',
      receipt: sessionStorage.getItem("products"),
      dateTime: date,
      user_email: user.email,
      isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut"
    };
    // reconfirm the payment
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data);
    // e.complete('success'); // Notify the browser that the payment is successful

  }

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Total:',
        amount: Math.round(totalPrice * 100),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check the availability of the Payment Request API.
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }

    });//google/apple pay
    pr.on('paymentmethod', async (e) => {
      const { paymentMethod } = e; // Extract the paymentMethod object from the event

      const paymentMethodId = paymentMethod.id; // Extract the id from the paymentMethod object

      // console.log('Payment Method ID:', paymentMethodId);

      // Remember to handle the promise returned by fetch and implement error handling
      const amount = Number(totalPrice);
      const currency = 'usd';
      //  console.log(currency)
      console.log(amount)
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const user = JSON.parse(sessionStorage.getItem('user'));
      const data = {
        payment_method: paymentMethodId,
        currency,
        amount: amount,
        status: 'new',
        receipt: sessionStorage.getItem("products"),
        dateTime: date,
        user_email: user.email,
        isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut"
      };
      // reconfirm the payment
      await firebase
        .firestore()
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .add(data);
      //e.complete('success'); // Notify the browser that the payment is successful
    });
  }, [stripe, elements]);

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
        console.log('read card')
        if (snapshot.empty) {
          // console.log('No payment methods found for the customer');

          //<option disabled="disabled" default="true"></option>
          let optionElement = document.createElement('option');
          optionElement.disabled = true;
          optionElement.id = "404null"
          optionElement.value = "null"
          if (document.getElementById('404null')) {
            console.log("does not have card")
          } else {
            document.querySelector('select[name=payment-method]').appendChild(optionElement);
            document.querySelector('#add-new-card').open = true;
            document.querySelector('[name=delete]').setAttribute('disabled', true);
            document.querySelector('[name=pay]').setAttribute('disabled', true);

          }
          handleAddNewCard();
          saveId(Math.random());
        } else {
          Goback();
          saveId(Math.random());
          // console.log('payment methods found for the customer');
          if (document.getElementById('404null')) {
            const optionElementToDelete = document.querySelector(`option[id="${'404null'}"]`);
            optionElementToDelete.remove();
          } else {
          }

        }
        snapshot.forEach(function (doc) {
          const paymentMethod = doc.data();
          if (!paymentMethod.card) {
            return;
          }

          const optionId = `card-${doc.id}`;
          let optionElement = document.getElementById(optionId);
          if (!optionElement) {
            optionElement = document.createElement('option');
            optionElement.id = optionId;
            document.querySelector('select[name=payment-method]').appendChild(optionElement);
            // console.log(optionElement.id)
          }

          optionElement.value = paymentMethod.id;
          optionElement.setAttribute("data-type", paymentMethod.card.brand);
          //console(optionElement.value)
          optionElement.text = `•••• ${paymentMethod.card.last4} | ${paymentMethod.card.exp_month}/${parseInt(paymentMethod.card.exp_year) % 100}`;
          optionElement.selected = true;

          saveId(Math.random())
          // get the select element
          //console.log("exist card:",optionElement.text)
        });

      });

    // for translation
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
      // const trans = sessionStorage.getItem("translations")
      // console.log(trans)
      // console.log(sessionStorage.getItem("translationsMode"))

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

    document
      .querySelector('#payment-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        if (event.submitter.name === 'delete') {
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = true));
          const form = new FormData(event.target);
          const paymentMethodValue = form.get('payment-method');
          const paymentMethodId = document.querySelector(`option[value="${paymentMethodValue}"]`).id;
          const new_paymentMethodId = paymentMethodId.substring(5);
          const user = JSON.parse(sessionStorage.getItem('user'));
          // console.log("deleted click")
          // console.log(new_paymentMethodId);
          await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user.uid)
            .collection('payment_methods')
            .doc(new_paymentMethodId)
            .delete();
          const optionIdToDelete = paymentMethodId;
          const optionElementToDelete = document.querySelector(`option[id="${optionIdToDelete}"]`);
          if (optionElementToDelete) {
            optionElementToDelete.remove();
          }
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = false));
          // set the prompt message
          const promptMessage = document.querySelector('#delete-message');
          promptMessage.textContent = t("successfully deleted") + "!";

          // hide the error message after 2 seconds
          setTimeout(() => {
            promptMessage.textContent = "";
          }, 6000);
        }
        if (event.submitter.name === 'pay') {
          //console.log(sessionStorage.getItem("isDinein")== "true"?"TakeOut":"DineIn")
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = true));
          const form = new FormData(event.target);
          const amount = Number(totalPrice);
          const currency = 'usd';
          //console.log(currency)
          //console.log(amount)
          const dateTime = new Date().toISOString();
          const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
          //console.log(form.get('payment-method'))
          const user = JSON.parse(sessionStorage.getItem('user'));
          const data = {
            payment_method: form.get('payment-method'),
            currency,
            amount: amount,
            status: 'new',
            receipt: sessionStorage.getItem("products"),
            dateTime: date,
            user_email: user.email,
            isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut"
          };
          // reconfirm the payment
          await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user.uid)
            .collection('payments')
            .add(data);
        }
      });
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

  // for translation
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    // console.log(trans)
    // console.log(sessionStorage.getItem("translationsMode"))

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

  return (
    <div>
      <div>


        <div style={{ color: "white", fontSize: "5px" }}>.</div>
        <CardSection totalPrice={totalPrice} />
      </div>

      <div>
        <div id="card2-header">
          <div id="add-new-card">
            <form id="payment-form">
              <div>
                <label style={{ width: '100%' }}>
                  <div className="row row-1">
                    <div className="col-2">
                      {selectedOption === 'mastercard' ? (
                        <img className="img-fluid" src="https://img.icons8.com/color/48/000000/mastercard-logo.png" />
                      ) : (
                        <img className="img-fluid" src="https://img.icons8.com/color/48/000000/visa.png" />
                      )}
                    </div>
                    <div className="col-7 select-dropdown">
                      <select style={{ backgroundcolor: "white",color: "#9ca3af" }} name="payment-method" onChange={handleOptionChange} required>
                        <option hidden data-type="mastercard">{t("Select Account")}</option>
                      </select>
                    </div>
                    <div className="col-3 d-flex justify-content-center">
                      <button onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        type="submit" style={{ 'color': isHover ? '#0a58ca' : '#444444' }}
                        name="delete"><FontAwesomeIcon icon={faTrash} /></button>
                      {
                      }
                    </div>
                  </div>
                </label>
              </div>
              <div id="delete-message" role="alert"></div>
              <button
  type="submit"
  name="pay"
  class="flex items-center justify-center text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-4 focus:ring-yellow-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:focus:ring-yellow-700"
  style={{ 	"borderRadius": "0.2rem", width: "100%" }}
>
  <img src={multipleCard} alt="Multiple Card" style={{ filter: 'invert(1)', width: '20px', height: '20px', marginRight: '8px' }} />
  {t("Pay with Saved Card")}
</button>

            </form>
            {paymentRequest && <PaymentRequestButtonElement options={{ paymentRequest }} />}

            <form id="payment-form" onSubmit={handleWechat}>
            <button
                type="submit"
                name="pay"
                class="text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                style={{	"borderRadius": "0.2rem", marginTop:"10px", width: "100%" }}
              >
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="25"
    width="25"
    viewBox="0 0 1024 1024"
    style={{ display: "inline", verticalAlign: "middle" }}
  >
    <g fill="#FFF" fill-rule="evenodd">
    <path d="M395.846 603.585c-3.921 1.98-7.936 2.925-12.81 2.925-10.9 0-19.791-5.85-24.764-14.625l-2.006-3.864-78.106-167.913c-0.956-1.98-0.956-3.865-0.956-5.845 0-7.83 5.928-13.68 13.863-13.68 2.965 0 5.928 0.944 8.893 2.924l91.965 64.43c6.884 3.864 14.82 6.79 23.708 6.79 4.972 0 9.85-0.945 14.822-2.926L861.71 282.479c-77.149-89.804-204.684-148.384-349.135-148.384-235.371 0-427.242 157.158-427.242 351.294 0 105.368 57.361 201.017 147.323 265.447 6.88 4.905 11.852 13.68 11.852 22.45 0 2.925-0.957 5.85-2.006 8.775-6.881 26.318-18.831 69.334-18.831 71.223-0.958 2.92-2.013 6.79-2.013 10.75 0 7.83 5.929 13.68 13.865 13.68 2.963 0 5.928-0.944 7.935-2.925l92.922-53.674c6.885-3.87 14.82-6.794 22.756-6.794 3.916 0 8.889 0.944 12.81 1.98 43.496 12.644 91.012 19.53 139.48 19.53 235.372 0 427.24-157.158 427.24-351.294 0-58.58-17.78-114.143-48.467-163.003l-491.39 280.07-2.963 1.98z" fill="#FFFFFF" />

    </g>
  </svg>
     {t("WeChat Pay")}
              </button>

            </form>



          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


