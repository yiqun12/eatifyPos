import React from "react";
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Checkout from './Checkout';
import PayHistory from './PayHistory';

const Dashboard = (props) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { totalPrice } = props;
  const { promise, logoutUser, emailVerification } = useUserContext();
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
        <Elements stripe={promise}>
                <CardSection />
          <Checkout totalPrice={totalPrice}/>
          <PayHistory />
        </Elements>
      </div>
  );
};

export default Dashboard;
