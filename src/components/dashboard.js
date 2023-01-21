import React from "react";
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Checkout from './Checkout';
import PayHistory from './PayHistory';
import './detailtag.css';
import { useState } from 'react';

const Dashboard = (props) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { totalPrice } = props;
  const { promise, logoutUser, emailVerification } = useUserContext();
  var verificationStatus = user.emailVerified ? "Verified" : "Not Verified";
  const [showTag, setShowTag] = useState(false);
  return (
    <div>
      <Elements stripe={promise}>
            <React.Fragment>
      <script src="https://js.stripe.com/v3/"></script>
      <link
        type="text/css"
        rel="stylesheet"
        href="https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.css"
      />
      </React.Fragment>
      
          <div className="card2 mt-50 mb-50">
      <div className="card2-title mx-auto">
      Select card and checkout
      </div>

      <form>
        

      <details>
      <CardSection />
      </details>
      <div>
      <button onClick={() => setShowTag(!showTag)}>
        Show Tag
      </button>
      {showTag && <p>This is my tag</p>}
    </div>
          <Checkout totalPrice={totalPrice}/>
          <PayHistory />
        
      </form>
      </div>

      </Elements>
      </div>
  );
};

export default Dashboard;
