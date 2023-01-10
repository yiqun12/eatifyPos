import React from "react";
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';

const Dashboard = () => {
  const { promise,user, logoutUser, emailVerification, customerData,currentUser } = useUserContext();
  var verificationStatus = user.emailVerified ? "Verified" : "Not Verified";

  return (
    <div>
      <React.Fragment>
      <script src="https://js.stripe.com/v3/"></script>
      <link
        type="text/css"
        rel="stylesheet"
        href="https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.css"
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
        <Elements stripe={promise}>
                <CardSection />
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
          <h2>Payments</h2>
  <ul id="payments-list"></ul>
        </Elements>
      </div>

    </div>
  );
};

export default Dashboard;
