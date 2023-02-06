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
      <Elements stripe={promise}>
          <div className="card2 mt-50 mb-50">
      <div className="card2-title mx-auto">
      Checkout
      </div>


    <CardSection />

      Choose Card
          <Checkout totalPrice={totalPrice}/>
          <PayHistory />
      </div>
      </Elements>
      </div>
  );
};

export default Dashboard;
