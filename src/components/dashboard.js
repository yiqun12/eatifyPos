import React, { useState } from 'react';
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Checkout from './Checkout';
import PayHistory from './PayHistory';
import { MyHookProvider } from '../pages/myHook';
import Link from '@mui/material/Link';


const Dashboard = (props) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { totalPrice } = props;
  const { promise, logoutUser, emailVerification } = useUserContext();
  var verificationStatus = user.emailVerified ? "Verified" : "Not Verified";

  const [newCardAdded, setNewCardAdded] = useState(false);

  const handleAddNewCard = () => {
    setNewCardAdded(true);
  }
  const Goback = () => {
    setNewCardAdded(false);
  }
  return (
    <div>
      <Elements stripe={promise}>
        <div className="card2 mb-50">
          <div className="card2-title mx-auto">
            CHECKOUT
          </div>
          
         
          {newCardAdded ?
          <>

<Link style={{cursor: 'pointer'}} onClick={Goback} variant="body2">
         &lt; go back                                
            </Link>
            <CardSection  totalPrice={totalPrice}/>

          </>
            
            :<>
            <Checkout totalPrice={totalPrice}/>
<Link style={{cursor: 'pointer' }} onClick={handleAddNewCard} variant="body2">
If a card is not saved in our system, please add a new one here.
                                </Link>
                                            </>

          }
          <PayHistory />
        </div>
      </Elements>
    </div>
  );
};

export default Dashboard;