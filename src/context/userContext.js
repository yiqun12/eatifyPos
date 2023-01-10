import { createContext, useContext, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";

import {loadStripe} from '@stripe/stripe-js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { auth } from "../firebase";

//import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
let currentUser = {};
let customerData = {};
/**
 * Set up Stripe Elements
 */

const promise = loadStripe(STRIPE_PUBLISHABLE_KEY);



function startDataListeners() {
  
  /**
   * Get all payment methods for the logged in customer
   */
  firebase
    .firestore()
    .collection('stripe_customers')
    .doc(currentUser.uid)
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

  /**
   * Get all payments for the logged in customer
   */

  firebase
    .firestore()
    .collection('stripe_customers')
    .doc(currentUser.uid)
    .collection('payments')
    .onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        const payment = doc.data();

        let liElement = document.getElementById(`payment-${doc.id}`);
        if (!liElement) {
          liElement = document.createElement('li');
          liElement.id = `payment-${doc.id}`;
        }

        let content = '';
        if (
          payment.status === 'new' ||
          payment.status === 'requires_confirmation'
        ) {
          content = `Creating Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )}`;
        } else if (payment.status === 'succeeded') {
          const card = payment.charges.data[0].payment_method_details.card;
          content = `✅ Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} on ${card.brand} card •••• ${card.last4}.`;
        } else if (payment.status === 'requires_action') {
          content = `🚨 Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
          handleCardAction(payment, doc.id);
        } else {
          content = `⚠️ Payment for ${formatAmount(
            payment.amount,
            payment.currency
          )} ${payment.status}`;
        }
        liElement.innerText = content;
        document.querySelector('#payments-list').appendChild(liElement);
      });
    });
}

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
    .doc(currentUser.uid)
    .collection('payments')
    .doc(docId)
    .set(payment, { merge: true });
}

// Format amount for Stripe
function formatAmountForStripe(amount, currency) {
  return zeroDecimalCurrency(amount, currency)
    ? amount
    : Math.round(amount * 100);
}

let helloLogged = false;
export const UserContext = createContext({});

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useState(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        currentUser = firebaseUser;
        //console.log(currentUser)
        firebase
          .firestore()
          .collection('stripe_customers')
          .doc(currentUser.uid)
          .onSnapshot((snapshot) => {
            if (snapshot.data()) {
              console.log("user found in stripe")
              customerData = snapshot.data();
              console.log(customerData)
              if (!helloLogged) {
                startDataListeners();
// Create payment form
//code to called createPayment
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
      .doc(currentUser.uid)
      .collection('payments')
      .add(data);

    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = false));
  });
                helloLogged = true;
              }
              //document.getElementById('loader').style.display = 'none';
              //document.getElementById('content').style.display = 'block';
            } else {
              console.warn(
                `No Stripe customer found in Firestore for user: ${currentUser.uid}`
              );
            }
          });
      } else {
        setUser(null);
      }
      setError("");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const registerUser = (email, password, name) => {
    setLoading(true);
    setError("");

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        updateProfile(auth.currentUser, {
          displayName: name,
        })
        sendEmailVerification(auth.currentUser)
        logoutUser()
          }
      )
      // .then((res) => console.log(auth.currentUser))
      .then(
        alert("Email verification sent")
        // (res) => {    
        // sendEmailVerification(auth.currentUser)
        // logoutUser()
        // .then((res) => alert("Email verification sent"))
        // .catch((err) => setError(err.code))}
        )
      // .then((res) => console.log(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
      // console.log(auth)
      // console.log(user)
  };


  const signInUser = (email, password) => {
    setLoading(true);
    setError("");


    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        if (auth.currentUser.emailVerified) {
          console.log("You're verified")
        } else { 
          logoutUser()
          setError("Email not verified");
          alert("Your email is not verified, go verify your email at your email address provided")
          // setError("Email not verified, please verify your email first");
          // throw new Error("Email not verified");
          // logoutUser()
        }
    
      })
      .catch((err) => setError(err.code))
      .finally(() => setLoading(false));
  };

  

  const signInWithGoogle = () => {
    setLoading(true);
    setError("");

    signInWithPopup(auth, new GoogleAuthProvider())
      .then((res) => console.log(res))
      .catch((err) => setError(err.code))
      .finally(() => setLoading(false));
  };

  const emailVerification = () => {
    setError("");
    sendEmailVerification(auth.currentUser)
      .then((res) => console.log(res))
      .catch((err) => setError(err.code));
  };

  const logoutUser = () => {
    firebase.auth().signOut(auth);
  };

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // const isEmailVerified = () => {
  //   return auth.currentUser.emailVerified;
  // }

  const contextValue = {
    user,
    loading,
    error,
    signInUser,
    registerUser,
    logoutUser,
    forgotPassword,
    signInWithGoogle,
    emailVerification,
    customerData,
    currentUser,
    promise
    // isEmailVerified
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
/**
 * 
 * // Add new card form
document
//addPaymentMethod cloud function is called here
  .querySelector('#payment-method-form')
  .addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!event.target.reportValidity()) {
      return;
    }
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = true));

    const form = new FormData(event.target);
    const cardholderName = form.get('name');

    const { setupIntent, error } = await stripe.confirmCardSetup(
      customerData.setup_secret,
      {
        payment_method: {
          //card: elements.getElement(CardElement),
          billing_details: {
            name: cardholderName,
          },
        },
      }
    );

    if (error) {
      document.querySelector('#error-message').textContent = error.message;
      document
        .querySelectorAll('button')
        .forEach((button) => (button.disabled = false));
      return;
    }

    await firebase
      .firestore()
      .collection('stripe_customers')
      .doc(currentUser.uid)
      .collection('payment_methods')
      .add({ id: setupIntent.payment_method });

    document.querySelector('#add-new-card').open = false;
    document
      .querySelectorAll('button')
      .forEach((button) => (button.disabled = false));
  });

 * 
 */