import React, { useState, useEffect } from 'react';
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import CardSection from './CardSection';
import Checkout from './Checkout';
import PayHistory from './PayHistory';
import { MyHookProvider } from '../pages/myHook';
import Link from '@mui/material/Link';
import { useMyHook } from '../pages/myHook';


const Dashboard = (props) => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const user = JSON.parse(sessionStorage.getItem('user'));
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

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    console.log(trans)
    console.log(sessionStorage.getItem("translationsMode"))

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
      <Elements stripe={promise}>
        <div className="card2 mb-50">
          <div className="card2-title mx-auto">
            {t("CHECKOUT")}
          </div>
          
         
          {newCardAdded ?
          <>

<Link style={{cursor: 'pointer'}} onClick={Goback} variant="body2">
         &lt; {t("go back")}                                
            </Link>
            <CardSection  totalPrice={totalPrice}/>

          </>
            
            :<>
            <Checkout totalPrice={totalPrice}/>
<Link style={{cursor: 'pointer' }} onClick={handleAddNewCard} variant="body2">
{t("If a card is not saved in our system") + ',' + t("please add a new one here")}.
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