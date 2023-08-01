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
import { MDBCheckbox } from 'mdb-react-ui-kit';

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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };
  
  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };
  
  const [cardElement, setCardElement] = useState(null);
  const [error, setError] = useState(null);
  const [saveCard, setSaveCard] = useState(false);

const handleSaveCardChange = (e) => {
  setSaveCard(e.target.checked);
};

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }
  
    const card = elements.create('card');
    card.mount('#card-element');
    setCardElement(card);
  
    return () => {
      card.unmount();
    };
  }, [stripe, elements]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!stripe || !cardElement) {
      return;
    }
    const cardholderName = `${firstName} ${lastName}`;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });
  
    if (error) {
      setError(error.message);
      return;
    }
  
    // Payment method created successfully, proceed with further processing
    const paymentMethodId = paymentMethod.id;
    const amount = Math.round(totalPrice * 100)/100;
    const currency = 'usd';
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    const user = JSON.parse(sessionStorage.getItem('user'));
    console.log(amount)
    const data = {
      payment_method: paymentMethodId,
      currency,
      amount,
      status: 'new',
      receipt: sessionStorage.getItem('products'),
      dateTime: date,
      user_email: user.email,
      isDinein: sessionStorage.getItem('isDinein') === 'true' ? 'DineIn' : 'TakeOut',
      saveCard: saveCard, // Include the saveCard value in the data
    };
  

  
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data);
    if (saveCard) {
        await firebase
          .firestore()
          .collection('stripe_customers')
          .doc(user.uid)
          .collection('payment_methods')
          .add({ id: paymentMethodId });
      }
    // Payment completed successfully
    // Add your logic here for handling the successful payment
  
    setError(null);
  };
  
  
  
  return (
    <div>
      
    <div id="card2-header">
      <div id="add-new-card">
      <form onSubmit={handleSubmit}>
          <div id="" >
          <div className="row-1 m-0" style={{ "border-radius": '0px',  marginTop: "15px !important", borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
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
              <div class="flex flex-wrap -mx-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
<div className="w-1/2 px-2">
  <label>
    <input 
      className="input-style"
      type="text"
      name="First Name"
      required 
      placeholder="First Name"
      value={firstName} 
      onChange={handleFirstNameChange} 
    />
  </label>
</div>
<div className="w-1/2 px-2 flex justify-end">
  <label>
    <input 
      className="input-style"
      type="text"
      name="Last Name"
      required 
      placeholder="Last Name"
      value={lastName}
      onChange={handleLastNameChange}
    />
  </label>
</div>

              </div>
            </div>
          </div>
            <div className="row-1" style={{ "border-radius": '0px', marginTop: "0px", marginBottom: "5px", width: "100%" }}>
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
                }}>    
                <div id="card-element"></div>             
                </span>
              </div>
            </div>

            {/*The following US states and territories are not currently supported by Stripe and will not be accepted for validation:"AMERICAN SAMOA", "MICRONESIA", "GUAM", "MARSHALL ISLANDS", "NORTHERN MARIANA ISLANDS", "PALAU", "UNITED STATES MINOR OUTLYING ISLANDS", "VIRGIN ISLANDS"*/}
          </div>

          {error && <div id="prompt-message" role="alert">{error}</div>}
          <div style={{color:"white",fontSize:"5px"}}>.</div>
          <MDBCheckbox
  name='flexCheck'
  value={saveCard}
  id='flexCheckChecked'
  checked={saveCard}
  label={t('Save Card')}
  onChange={handleSaveCardChange}
/>
<div style={{color:"white",fontSize:"5px"}}>.</div>
          <button 
          style={{ 	"borderRadius": "0.2rem", width: "100%" }} 
          class="text-white bg-orange-700 hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                          <FontAwesomeIcon icon={faCreditCard} />
                          &nbsp; {t("Pay with New Card")}</button>
        </form>

      </div>
    </div>
    
    </div>
  );
};

export default Checkout;


