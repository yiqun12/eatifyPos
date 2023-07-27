/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import {loadStripe} from '@stripe/stripe-js';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useState ,useEffect} from 'react';
import { useMyHook } from '../pages/myHook';



function PayFullhistory() {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;
  
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
  const promise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
    stripeAccount: 'acct_1NR75OE0QS2AMUUQ'
  });
    
  const user = JSON.parse(sessionStorage.getItem('user'));
  /**
   * Get all payments for the logged in customer
   */
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0,10) + '-' + dateTime.slice(11,13) + '-' + dateTime.slice(14,16) + '-' + dateTime.slice(17,19) + '-' + dateTime.slice(20,22);        
  useEffect(() => {
    firebase
    .firestore()
    .collection('stripe_customers')
    .doc(user.uid)
    .collection('payments')
    .orderBy("dateTime", "desc")
    .onSnapshot((snapshot) => {
      console.log('read card')
    
      snapshot.forEach((doc) => {
        const payment = doc.data();
        if(payment.status === 'succeeded') {
          console.log(payment)
        }
      });
    });
    
  }, []); // empty dependency array to run once on mount

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
   //console.log(sessionStorage.getItem("translationsMode"))

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
  //console.log(elements.getElement(CardElement))
  return (
    <div>
                        <table
                          className="shop_table my_account_orders"
                          style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            borderSpacing: "6px", // added CSS
                          }}
                        >
                          <thead>
                            <tr>
                              <th className="order-number" style={isMobile ? {} : { width: "10%" }}>Order</th>
                              <th className="order-name" style={isMobile ? {} : { width: "30%" }}>Name</th>
                              <th className="order-status" style={isMobile ? {} : { width: "10%" }}>Status</th>
                              <th className="order-total" style={isMobile ? {} : { width: "10%" }}>Total</th>
                              <th className="order-dine-mode" style={isMobile ? {} : { width: "10%" }}>Service</th>
                              <th className="order-date" style={isMobile ? {} : { width: "15%" }}>Time</th>
                              <th className="order-details" style={isMobile ? {} : { width: "15%" }}>Detail</th>
                            </tr>
                          </thead>
                          <tbody>

                                  <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                    <td className="order-number" data-title="OrderID"><a >0</a></td>
                                    <td className="order-name" data-title="Name" style={{ whiteSpace: "nowrap" }}>1</td>
                                    <td className="order-status" data-title="Status" style={{ whiteSpace: "nowrap" }}>2</td>
                                    <td className="order-total" data-title="Total" style={{ whiteSpace: "nowrap" }}><span className="amount">3</span></td>
                                    <td className="order-dine-mode" data-title="Service" style={{ whiteSpace: "nowrap" }}>4</td>
                                    <td className="order-date" data-title="Time" style={{ whiteSpace: "nowrap" }}>
                                      <time nowrap>
                                        5
                                      </time>
                                    </td>
                                    <td className="order-details" style={{ whiteSpace: "nowrap" }} data-title="Details">
                                    </td>
                                  </tr>
                          </tbody>
                          </table>
    </div>
  );
};

export default PayFullhistory;