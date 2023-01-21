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

      <form>

      <details>
  <summary class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
    Add new card</summary>
  <CardSection />
</details>

      Choose Card
          <Checkout totalPrice={totalPrice}/>
          <PayHistory />

      </form>
      </div>

      </Elements>
      </div>
  );
};

export default Dashboard;
