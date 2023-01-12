import React from "react";
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Checkout from './Checkout';
import PayHistory from './PayHistory';

const Dashboard = () => {
  const { promise,user, logoutUser, emailVerification } = useUserContext();
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
          <Checkout/>
          <PayHistory />
        </Elements>
      </div>

    </div>
  );
};

export default Dashboard;
