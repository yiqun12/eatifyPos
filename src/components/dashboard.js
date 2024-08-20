import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import Checkout from './Checkout';
import { loadStripe } from '@stripe/stripe-js';

const Dashboard = (props) => {

  const { dropoffAddress, products, directoryType, totalPrice, isDineIn, deliveryID, deliveryFee } = props;

  //pk_live_51MLJBWBuo6dxSribckKazcKBLmCf3gSXs6JHKLZbwPS19dscgaVb7bBH48ua3zj8m2xh3oUoByvojdBzcl9Voegu00HyKvJ54W
  //pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS
  const STRIPE_PUBLISHABLE_KEY = 'pk_live_51MLJBWBuo6dxSribckKazcKBLmCf3gSXs6JHKLZbwPS19dscgaVb7bBH48ua3zj8m2xh3oUoByvojdBzcl9Voegu00HyKvJ54W';

  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: JSON.parse(sessionStorage.getItem('TitleLogoNameContent'))?.stripe_store_acct
  });
  function stringTofixed(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
  }
  return (
    <div>
      <Elements stripe={promise}>
        <div className="m-4" style={{ "box-shadow": 'rgba(0, 0, 0, 0.02)-20px 1 20px -10px' }}>
          <div >
            <span
              className="text-black text-2xl"
            >
              Checkout Order <span className='notranslate'>&nbsp;${stringTofixed(Math.round(100 * totalPrice) / 100)}</span>
            </span>

            <br></br>
            {
              deliveryFee === 0 ? (
                null
              ) : (
                <div className="payment-summary">
                  <div className="summary-item flex justify-between">
                    <span className="label">Item Total (with tax & tips):</span>
                    <span className="value notranslate">${stringTofixed((Math.round(100 * totalPrice) - deliveryFee) / 100)}</span>
                  </div>
                  <div className="summary-item flex justify-between">
                    <span className="label">Delivery Fee to
                      <span className='notranslate'>({dropoffAddress})</span>:</span>
                    <span className="value notranslate">${(deliveryFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="summary-item total-payment flex justify-between">
                    <span className="label">Total Payment:</span>
                    <span className="value notranslate">${stringTofixed(Math.round(100 * totalPrice) / 100)}</span>
                  </div>
                </div>)
            }

          </div>
          <Checkout dropoffAddress={dropoffAddress} products={JSON.stringify(products)} deliveryID={deliveryID} deliveryFee={deliveryFee} directoryType={directoryType} isDineIn={isDineIn} totalPrice={totalPrice} />

        </div>
      </Elements>
    </div>
  );
};

export default Dashboard;