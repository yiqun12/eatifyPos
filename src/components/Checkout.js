/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';
import { useLocation } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { loadStripe } from '@stripe/stripe-js';
import useGeolocation from './useGeolocation';

import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { useMyHook } from '../pages/myHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from '@mui/material/Link';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import multipleCard from './mutiple_card.png';
import { MDBCheckbox } from 'mdb-react-ui-kit';
import { useParams } from 'react-router-dom';

function Checkout(props) {
  const params = new URLSearchParams(window.location.search);
  
  const  store  = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  console.log(store)
  const [receiptToken, setReceiptToken] = useState("");

  useEffect(() => {
    console.log("receiptToken has changed:", receiptToken);
  }, [receiptToken]);

  const [newCardAdded, setNewCardAdded] = useState(false);

  const handleAddNewCard = () => {
    setNewCardAdded(true);
  }
  const Goback = () => {
    setNewCardAdded(false);
  }
  
  const { user, user_loading} = useUserContext();
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
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = true));
    // console.log('Payment Method ID:', paymentMethodId);

    // Remember to handle the promise returned by fetch and implement error handling
    const amount = Number(totalPrice);
    const currency = 'usd';
    //  console.log(currency)
    console.log(amount)
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    const data = {
      store,
      payment_method: 'wechat_pay',
      currency,
      amount: amount,
      status: 'new',
      receipt: sessionStorage.getItem(store),
      dateTime: date,
      user_email: user.email,
      isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut",
      tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""
    };
    // send to db
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data).then((docRef) => {
        setReceiptToken(docRef.id)
        console.log("Document ID is:", docRef.id);
      })
      .catch((error) => {
        setReceiptToken("")
        console.error("Error adding document: ", error);
      });
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
      const data = {
        store,
        payment_method: paymentMethodId,
        currency,
        amount: amount,
        status: 'new',
        receipt: sessionStorage.getItem(store),
        dateTime: date,
        user_email: user.email,
        isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut",
        tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""
      };
      // send to db
      await firebase
        .firestore()
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .add(data).then((docRef) => {
          setReceiptToken(docRef.id)
          console.log("Document ID is:", docRef.id);
        })
        .catch((error) => {
          setReceiptToken("")
          console.error("Error adding document: ", error);
        });
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
          const data = {
            store,
            payment_method: form.get('payment-method'),
            currency,
            amount: amount,
            status: 'new',
            receipt: sessionStorage.getItem(store),
            dateTime: date,
            user_email: user.email,
            isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut",
            tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""
          };
          //send to db
          await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user.uid)
            .collection('payments')
            .add(data).then((docRef) => {
              setReceiptToken(docRef.id)
              console.log("Document ID is:", docRef.id);
            })
            .catch((error) => {
              setReceiptToken("")
              console.error("Error adding document: ", error);
            });
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
        <CardSection receiptToken={receiptToken} setReceiptToken={setReceiptToken} totalPrice={totalPrice} />
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
                      <select style={{ backgroundcolor: "white", color: "#9ca3af" }} name="payment-method" onChange={handleOptionChange} required>
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
                style={{ "borderRadius": "0.2rem", width: "100%" }}
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
                style={{ "borderRadius": "0.2rem", marginTop: "10px", width: "100%" }}
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
      <PayHistory receiptToken={receiptToken} setReceiptToken={setReceiptToken} totalPrice={totalPrice} />
    </div>
  );
};
function CardSection(props) {
  const params = new URLSearchParams(window.location.search);
  
  const  store  = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  
  console.log(store)
  const [newCardAdded, setNewCardAdded] = useState(false);

  const handleAddNewCard = () => {
    setNewCardAdded(true);
  }
  const Goback = () => {
    setNewCardAdded(false);
  }
  const { user, user_loading} = useUserContext();
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
  useEffect(() => {
    if (error) {
              document
                .querySelectorAll('button')
                .forEach((button) => (button.disabled = false));
    }
  }, [error]);


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

    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = true));

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
    const amount = Math.round(totalPrice * 100) / 100;
    const currency = 'usd';
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    console.log(amount)
    const data = {
      store,
      payment_method: paymentMethodId,
      currency,
      amount,
      status: 'new',
      receipt: sessionStorage.getItem(store),
      dateTime: date,
      user_email: user.email,
      isDinein: sessionStorage.getItem('isDinein') === 'true' ? 'DineIn' : 'TakeOut',
      saveCard: saveCard, // Include the saveCard value in the data
      tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""

    };


//send to db 2
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data).then((docRef) => {
        props.setReceiptToken(docRef.id)
        console.log("Document ID is:", docRef.id);
      })
      .catch((error) => {
        props.setReceiptToken("")
        console.error("Error adding document: ", error);
      });

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
              <div className="row-1 m-0" style={{ "border-radius": '0px', marginTop: "15px !important", borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
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
                          placeholder={t("First Name")}
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
                          placeholder={t("Last Name")}
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
            <div style={{ color: "white", fontSize: "5px" }}>.</div>
            <MDBCheckbox
              name='flexCheck'
              value={saveCard}
              id='flexCheckChecked'
              checked={saveCard}
              label={t('Save Card')}
              onChange={handleSaveCardChange}
            />
            <div style={{ color: "white", fontSize: "5px" }}>.</div>
            <button
              style={{ "borderRadius": "0.2rem", width: "100%" }}
              class="text-white bg-orange-700 hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <FontAwesomeIcon icon={faCreditCard} />
              &nbsp; {t("Pay with New Card")}</button>
          </form>

        </div>
      </div>

    </div>
  );
};

function useMobileAndTabletCheck() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    setIsMobileOrTablet(check);
  }, []);

  return isMobileOrTablet;
}

function PayHistory(props) {
  const params = new URLSearchParams(window.location.search);
  
  const  store  = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";

  console.log(store)
  const { user, user_loading} = useUserContext();
  const { totalPrice, tips } = props;

  let stripe; // Declare stripe variable outside of your function

  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';

  loadStripe(STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: 'acct_1NR75OE0QS2AMUUQ'
  }).then(stripeInstance => {
    stripe = stripeInstance; // Save stripe instance for use in your function
  }).catch(console.error);

  const promise = useStripe()
  const elements = useElements()
  const handleAli = async (e) => {
    e.preventDefault();

    if (!promise || !elements) {
      return;
    }
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = true));

    const amount = Number(totalPrice);
    const currency = 'usd';
    //  console.log(currency)
    // console.log(amount)
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    const data = {
      store,
      payment_method: 'alipay',
      currency,
      amount: amount,
      status: 'new',
      receipt: sessionStorage.getItem(store),
      dateTime: date,
      user_email: user.email,
      isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut",
      tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""
    };
    // send to db
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .add(data).then((docRef) => {
        props.setReceiptToken(docRef.id)
        console.log("Document ID is:", docRef.id);
      })
      .catch((error) => {
        props.setReceiptToken("")
        console.error("Error adding document: ", error);
      });
    // e.complete('success'); // Notify the browser that the payment is successful

  };
  async function handleCardAction(payment, docId) {

    if (!stripe) {
      console.log("Stripe has not been initialized yet.")
      return;
    }
    const { error, paymentIntent } = await stripe.handleCardAction(
      payment.client_secret
    );
    if (error) {
      alert(error.message);
      payment = error.payment_intent;
    } else if (paymentIntent) {
      payment = paymentIntent;
      payment['receiptData'] = sessionStorage.getItem(store);
      payment['user_email'] = user.email;
    }

    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .doc(docId)
      .set(payment, { merge: true });
  }
  async function handleAlipay(payment, docId) {
    if (!stripe) {
      console.log("Stripe has not been initialized yet.")
      return;
    }
    sessionStorage.setItem('docid', docId)
    const { error, paymentIntent } = await stripe.confirmAlipayPayment(
      payment.client_secret, {
        //http://localhost:3000/store?store=parkasia&table=A3&return=true
        return_url: `${window.location.origin}/Checkout?store=parkasia&table=A3&return=true`,
      })

    if (error) {
      alert(error.message);
    }
  }

  async function handleWechatPay(payment, docId) {
    if (!stripe) {
      console.log("Stripe has not been initialized yet.")
      return;
    }
    console.log(payment)
    const { error, paymentIntent } = await stripe.confirmWechatPayPayment(
      payment.client_secret, {
      payment_method_options: {
        wechat_pay: {
          client: 'web'
        },
      },
    }
    )
    if (error) {
      alert(error.message);
      payment = error.payment_intent;
    } else if (paymentIntent) {
      payment = paymentIntent;
      payment['receiptData'] = sessionStorage.getItem(store);
      payment['user_email'] = user.email;
    }
    //send to db
    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .doc(docId)
      .set(payment, { merge: true });
  }

  /**
   * Get all payments for the logged in customer
   */
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
  const { id, saveId } = useMyHook(null);
  let products = JSON.parse(sessionStorage.getItem(store));

  useEffect(() => {
    products = JSON.parse(sessionStorage.getItem(store));
  }, [id]);

  useEffect(() => {
    if (props.receiptToken != "") {
      firebase
        .firestore()
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .doc(props.receiptToken) // Referencing the specific document by its ID
        .onSnapshot((doc) => {


          const payment = doc.data();
          console.log('read card')

          let liElement = document.getElementById(`payment-${doc.id}`);
          if (!liElement) {
            liElement = document.createElement('li');
            liElement.id = `payment-${doc.id}`;
          }
          // console.log(payment.dateTime)
          let content = '';

          if (
            payment.status === 'new' & !payment.error ||
            payment.status === 'requires_confirmation'
          ) {

            content = `🚨 ` + t("Creating Payment");

          } else if (payment.status === 'succeeded') {
            sessionStorage.removeItem(store);
            window.location.href = '/orders?order=' + doc.id;

          } else if (payment.status === 'requires_action') {
            content = `🚨 ` + t("Payment status: ") + `${payment.status}`;

            if (payment.payment_method_types[0] === 'alipay') {
              document
                .querySelectorAll('button')
                .forEach((button) => (button.disabled = false));
            } else if (payment.payment_method_types[0] === 'wechat_pay') {
              document
                .querySelectorAll('button')
                .forEach((button) => (button.disabled = false));
            } else if (payment.payment_method_types[0] === 'card') {
              handleCardAction(payment, doc.id);
            }
          } else if (payment.error) {
            document
              .querySelectorAll('button')
              .forEach((button) => (button.disabled = false));
            content = `⚠️ ` + t("Payment failed: ") + `. ${t(payment.error)}`;
          } else if (payment.status === 'requires_payment_method')
            if (payment.payment_method_types[0] === 'alipay') {
              handleAlipay(payment, doc.id);
            } else if (payment.payment_method_types[0] === 'wechat_pay') {
              handleWechatPay(payment, doc.id);
            } else if (payment.payment_method_types[0] === 'card') {
              document
                .querySelectorAll('button')
                .forEach((button) => (button.disabled = false));
            }

          {
            content = `🚨 ` + t("Payment status: ") + `${payment.status}`;
          }

          liElement.innerText = content;
          document.querySelector('#payments-list').appendChild(liElement);

        });
    }
  }, [props.receiptToken]); // empty dependency array to run once on mount
  //console.log(elements.getElement(CardElement))

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
    //console.log(sessionStorage.getItem("translationsMode"))

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

  // Extract the client secret from the query string params.
  const query = new URLSearchParams(useLocation().search);
  const clientSecret = query.get('payment_intent_client_secret');
  //handle ali pay return
  useEffect(() => {
    if (!promise || !elements) {
      return;
    }

    console.log(clientSecret)
    const fetchPaymentIntent = async () => {
      const { error, paymentIntent } = await promise.retrievePaymentIntent(
        clientSecret
      );
      if (error) {
        console.log("error")
        // addMessage(error.message);
      }
      let payment;
      if (error) {
        alert(error.message);
        payment = error.payment_intent;
      }
      if (paymentIntent) {
        payment = paymentIntent;
        payment['receiptData'] = sessionStorage.getItem(store);
        payment['user_email'] = user.email;
      }

      const docId = sessionStorage.getItem('docid');
      const paymentRef = firebase
        .firestore()
        .collection('stripe_customers')
        .doc(user.uid)
        .collection('payments')
        .doc(docId);

      // Set initial payment information
      await paymentRef.set(payment, { merge: true });

      // Listen to updates
      paymentRef.onSnapshot((docSnapshot) => {
        const payment = docSnapshot.data();
        //const card = payment.charges.data[0].payment_method_details.card;
        if (payment.status === "succeeded") {
          sessionStorage.removeItem(store);

          window.location.href = '/orders?order=' + docId
        }

      });

      // addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
    };
    fetchPaymentIntent();
  }, [clientSecret, promise, elements]);
  const [location, getLocation] = useGeolocation();

//create a circle with a range of 20 square feet based on sepcific lat and long
//determine whether the new long and lat fall within the circle's range.

  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
    function calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }
    const { sendVerificationCode,verifyCode} = useUserContext();

    const [distanceStatus, setDistanceStatus] = useState(null); // 'near' or 'far'

//this returns meters
    //console.log(calcCrow(location.latitude,location.longitude,location.latitude,location.longitude).toFixed(1));
    function checkgeolocation(){
      getLocation().then((newLocation) => {
        //1公里以内
        console.log(calcCrow(newLocation.latitude, newLocation.longitude, newLocation.latitude, newLocation.longitude).toFixed(5)*1000<1000)
        if(calcCrow(newLocation.latitude, newLocation.longitude, newLocation.latitude, newLocation.longitude).toFixed(5)*1000<=1000){
          setDistanceStatus('near');
          
        }else{
          setDistanceStatus('far');
        };
      });
    }

    const inputs = useRef([]);
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleKeyUp = (event, index) => {
      const key = event.keyCode || event.charCode;
  
      if (inputs.current[index].value.length === inputs.current[index].size && key !== 32) {
        if (index < inputs.current.length - 1) {
          inputs.current[index + 1].focus();
        }
      }
  
      if (key === 8 || key === 47) {
        if (index !== 0) {
          inputs.current[index - 1].value = '';
          inputs.current[index - 1].focus();
        }
      }
    };
  
    const handleConfirm = () => {
      let phoneNumber = '';
      inputs.current.forEach((input) => {
        phoneNumber += input.value;
      });
      
      function isTenDigitNumber(s) {
        if (s.length !== 10) {
          return false;
        }
      
        return /^\d{10}$/.test(s);
      }
      var s = phoneNumber;
      var result = isTenDigitNumber(s);

      if (result===false) {
        setErrorMessage('This is not a valid number');
      } else {
        setErrorMessage(''); // Clear the error message if the input is valid
        console.log(phoneNumber);
        const amount = Number(totalPrice);
        const currency = 'usd';
        //  console.log(currency)
        console.log(amount)
        const dateTime = new Date().toISOString();
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      
        const data = {
          store,
          payment_method: 'instore_pay',
          currency,
          amount: amount,
          status: 'new',
          phoneNumber,
          receipt: sessionStorage.getItem(store),
          dateTime: date,
          user_email: user.email,
          isDinein: sessionStorage.getItem("isDinein") == "true" ? "DineIn" : "TakeOut",
          tableNum:sessionStorage.getItem("isDinein") == "true" ? sessionStorage.getItem("table") : ""
        };
//send to db
firebase
.firestore()
.collection('stripe_customers')
.doc(user.uid)
.collection('payments')
.add(data).then((docRef) => {
  props.setReceiptToken(docRef.id)
  console.log("Document ID is:", docRef.id);
  sessionStorage.removeItem(store);
  window.location.href = '/orders?order=' + docRef.id;
})
.catch((error) => {
  props.setReceiptToken("")
  console.error("Error adding document: ", error);
});

      }
    };
    const isMobileOrTablet = useMobileAndTabletCheck();

    
  return (
    <div>
      <form id="payment-form" onSubmit={handleAli}>
        <button
          type="submit"
          name="pay"
          class="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
          style={{ "borderRadius": "0.2rem", width: "100%" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="25"
            width="25"
            viewBox="-51.45 -71.25 445.9 415.5"
            style={{ display: "inline", verticalAlign: "middle" }}
          >
            <g fill="#FFF" fill-rule="evenodd"></g>
            <path fill="#FFFFFF" d="M48.508 0C21.694 0 0 21.511 0 48.068v203.87c0 26.536 21.694 48.059 48.508 48.059h205.81c26.793 0 48.496-21.522 48.496-48.059v-2.086c-.902-.372-78.698-32.52-118.24-51.357-26.677 32.524-61.086 52.256-96.812 52.256-60.412 0-80.927-52.38-52.322-86.86 6.237-7.517 16.847-14.698 33.314-18.718 25.76-6.27 66.756 3.915 105.18 16.477 6.912-12.614 12.726-26.506 17.057-41.297H72.581v-11.88h61.057V87.168H59.687V75.28h73.951V44.89s0-5.119 5.236-5.119h29.848v35.508h73.107V87.17h-73.107v21.303h59.674c-5.71 23.176-14.38 44.509-25.264 63.236 18.111 6.49 34.368 12.646 46.484 16.666 40.413 13.397 51.74 15.034 53.201 15.205V48.069c0-26.557-21.704-48.068-48.496-48.068H48.511zm33.207 162.54a91.24 91.24 0 00-7.822.426c-7.565.753-21.768 4.06-29.533 10.865-23.274 20.109-9.344 56.87 37.762 56.87 27.383 0 54.743-17.343 76.236-45.114-27.71-13.395-51.576-23.335-76.643-23.047z" />
          </svg>

          {t("AliPay")}
        </button>
      </form>
      <div
          class="text-blue-500 underline bg-white-500 focus:outline-none font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2"
          style={{ "borderRadius": "0.2rem", width: "100%" }}
        >
              <div>
      {isMobileOrTablet && !(sessionStorage.getItem('table')===null || sessionStorage.getItem('table')==="") ? <button onClick={() => {
  checkgeolocation();
}}>

{t("Place Order, Pay Later")}
</button>
 : <>
 </>}
    </div>

        </div>
        {location ? (
        distanceStatus === 'near' ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p>{t("Enter your phone number to use 'Pay Later'")}:</p>
            <div className="phone-field">
            &#40;	
            <input
  ref={(el) => (inputs.current[0] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="4"
  autoFocus
  onKeyUp={(e) => handleKeyUp(e, 0)}
/>
<input
  ref={(el) => (inputs.current[1] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="1"
  onKeyUp={(e) => handleKeyUp(e, 1)}
/>
<input
  ref={(el) => (inputs.current[2] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="5"
  onKeyUp={(e) => handleKeyUp(e, 2)}
/>
&#41; &nbsp;
<input
  ref={(el) => (inputs.current[3] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="5"
  onKeyUp={(e) => handleKeyUp(e, 3)}
/>
<input
  ref={(el) => (inputs.current[4] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="5"
  onKeyUp={(e) => handleKeyUp(e, 4)}
/>
<input
  ref={(el) => (inputs.current[5] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="5"
  onKeyUp={(e) => handleKeyUp(e, 5)}
/>
&nbsp;&#8722;&nbsp;
<input
  ref={(el) => (inputs.current[6] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="1"
  onKeyUp={(e) => handleKeyUp(e, 6)}
/>
<input
  ref={(el) => (inputs.current[7] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="2"
  onKeyUp={(e) => handleKeyUp(e, 7)}
/>
<input
  ref={(el) => (inputs.current[8] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="3"
  onKeyUp={(e) => handleKeyUp(e, 8)}
/>
<input
  ref={(el) => (inputs.current[9] = el)}
  className="phone-input"
  name="phone-input"
  type="tel"
  size="1"
  maxLength="1"
  placeholder="4"
  onKeyUp={(e) => handleKeyUp(e, 9)}
/>
 </div>
    </div>
    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    
    <button
          onClick={handleConfirm}
          class="mt-3 text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
          style={{ "borderRadius": "0.2rem", width: "100%" }}
        >
          {t("Confirm Order")}
        </button>

          </div>
        ) : (
          <div>
            <p>{t("You are too far from our store")}</p>
          </div>
        )
      ) : (
        <>
        </>
      )}

      <ul id="payments-list"></ul>

    </div>
  );
};


export default Checkout;


