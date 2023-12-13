import React, { useState, useEffect } from 'react';
import { useUserContext } from "../context/userContext";
import {Elements} from '@stripe/react-stripe-js';
import Checkout from './Checkout';
import { MyHookProvider } from '../pages/myHook';
import Link from '@mui/material/Link';
import { useMyHook } from '../pages/myHook';
import {loadStripe} from '@stripe/stripe-js';

const Dashboard = (props) => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const { user } = useUserContext();
  const { totalPrice } = props;
  
  //pk_live_51MLJBWBuo6dxSribckKazcKBLmCf3gSXs6JHKLZbwPS19dscgaVb7bBH48ua3zj8m2xh3oUoByvojdBzcl9Voegu00HyKvJ54W
  //pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
  
  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: JSON.parse(sessionStorage.getItem('TitleLogoNameContent')).stripe_store_acct
  });
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
   // console.log(trans)
   // console.log(sessionStorage.getItem("translationsMode"))

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
  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);
  /**check if its too small */
  const [cardidth, setCardidth] = useState(0);

  function handleWindowSizeChange() {
    const card2Header = document.getElementById('card2-header');
    setCardidth(card2Header.offsetWidth);
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    const card2Header = document.getElementById('card2-header');
    //setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  return (
    <div>
      <Elements stripe={promise}>
        <div className="card2 mb-50" style={{"box-shadow":'rgba(0, 0, 0, 0.02)-20px 1 20px -10px'}}>
          <div className="text-black select-none text-2xl">
            {t("CHECKOUT")}   ${Math.round(100 * totalPrice) / 100} 
          </div>
            <Checkout totalPrice={totalPrice}/>
          
        </div>
      </Elements>
    </div>
  );
};

export default Dashboard;