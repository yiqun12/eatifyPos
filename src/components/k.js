import React from "react";
import { useUserContext } from "../context/userContext";
import {CardElement,Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { useStripe, useElements } from '@stripe/react-stripe-js';

const Dashboard = () => {
  const { user, logoutUser, emailVerification } = useUserContext();
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
  var verificationStatus = user.emailVerified ? "Verified" : "Not Verified";
  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  const elements = useElements();
  //const elements = useElements();

  //console.log(elements.getElement(CardElement));
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
  
  return (
    
    <div>
            <React.Fragment>
            <script src="https://js.stripe.com/v3/"></script>
    <link
      type="text/css"
      rel="stylesheet"
      href="https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.css"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1/new.min.css"
    />

    </React.Fragment>
      <h1>Dashboard </h1>
      {user.photoURL && <img src={user.photoURL} />}
      <h2>Name : {user.displayName}</h2>
      <h2>Email : {user.email}</h2>
      <button onClick={logoutUser}>Log out</button>
      <button onClick={emailVerification}>Verify Email</button>
      <h2>Verification Status : {verificationStatus} </h2>
<div>
<h2>Payment Methods</h2>
<details id="add-new-card">
  <summary>Add new</summary>
  <p>
    Use any of the
    <a href="https://stripe.com/docs/testing#international-cards">
      Stripe test cards
    </a>
    for this demo!
  </p>
  <form id="payment-method-form">
    <label>
      Cardholder name
      <input type="text" name="name" required />
    </label>

    <fieldset>
    <Elements stripe={promise}>
      <div id="card-element">
<CardElement options={CARD_ELEMENT_OPTIONS}  />
      </div>
      </Elements>
    </fieldset>
    <div id="error-message" role="alert"></div>
    <button>Save Card</button>
  </form>
</details>

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
        value="100"
        required
      />
    </label>
    <label>
  Currency:
  <select name="currency">
    <option value="usd">USD</option>
    <option value="eur">EUR</option>
    <option value="gbp">GBP</option>
    <option value="jpy">JPY</option>
  </select>
</label>
</div>
<button>Charge selected card</button>
</form>
</div>
<div>
  <h2>Payments</h2>
  <ul id="payments-list"></ul>
</div>
    </div>
  );
};

export default Dashboard;
