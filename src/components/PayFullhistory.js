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
  const [payments, setPayments] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);
  const dateNow = (new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getDate().toString().padStart(2, '0') + '/' + new Date().getFullYear()

  const [selectedDate, setSelectedDate] = useState(new Date(dateNow));

  const toggleExpandedOrderId = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };


  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .orderBy("dateTime", "desc")
      .onSnapshot((snapshot) => {
        console.log('read card');
        
        const newPayments = [];
        snapshot.forEach((doc) => {
          const payment = doc.data();
          if(payment.status === 'succeeded') {
            console.log(doc.id)
            payment[id]=doc.id
            newPayments.push(payment);
          }
        });
        const newItems = []; // Declare an empty array to hold the new items
        newPayments.forEach((item) => {
          const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
            .subtract(4, "hours")
            .format("M/D/YYYY h:mma");
          const newItem = {
            id: item.id, // use only the first 4 characters of item.id as the value for the id property
            receiptData: item.receiptData,
            date: formattedDate,
            email: item.user_email,
            dineMode: item.metadata.isDine,
            status: "Paid",
            total: parseFloat(item.metadata.total),
            name: "Table A",
            metadata: item.metadata
          };
          newItems.push(newItem); // Push the new item into the array
        });
        setPayments(newItems); // Update the state with the new payments
        console.log(newItems)
      });

    // Returning the unsubscribe function will ensure that the listener is cleaned up when the component is unmounted
    return () => unsubscribe();
  }, [user.uid]); // Make sure to update the dependencies array if you have other dependencies

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
                            {payments
                              .filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true)
                              .map((order) => (

                                <React.Fragment key={order.id}>

                                  <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                    <td className="order-number" data-title="OrderID"><a >{order.id.substring(0, 5)}</a></td>
                                    <td className="order-name" data-title="Name" style={{ whiteSpace: "nowrap" }}>{order.name}</td>
                                    <td className="order-status" data-title="Status" style={{ whiteSpace: "nowrap" }}>{order.status}</td>
                                    <td className="order-total" data-title="Total" style={{ whiteSpace: "nowrap" }}><span className="amount">{"$" + order.total}</span></td>
                                    <td className="order-dine-mode" data-title="Service" style={{ whiteSpace: "nowrap" }}>{order.dineMode}</td>
                                    <td className="order-date" data-title="Time" style={{ whiteSpace: "nowrap" }}>
                                      <time dateTime={order.date} title={order.date} nowrap>
                                        {order.date.replace(/\/\d{4}/, '')}
                                      </time>
                                    </td>
                                    <td className="order-details" style={{ whiteSpace: "nowrap" }} data-title="Details">
                                      <button onClick={() => toggleExpandedOrderId(order.id)} style={{ cursor: "pointer" }}>
                                        {expandedOrderIds.includes(order.id) ? "Hide Details" : "View Details"}
                                      </button>
                                    </td>
                                  </tr>
                                  {expandedOrderIds.includes(order.id) && (
                                    <tr>
                                      <td colSpan={8} style={{ padding: "10px" }}>
                                        <div className="receipt">
                                          <p>{order.email}</p>
                                          <p>{order.date}</p>
                                          {JSON.parse(order.receiptData).map((item, index) => (
                                            <div className="receipt-item" key={item.id}>
                                              <p>{item.name} x {item.quantity} @ $ {item.subtotal} each = $ {Math.round(item.quantity * item.subtotal * 100) / 100}</p>
                                            </div>
                                          ))}
                                          <p>Subtotal: $ {order.metadata.subtotal}</p>
                                          <p>Tax: $ {order.metadata.tax}</p>
                                          <p>Tips: $ {order.metadata.tips}</p>
                                          <p>Total: $ {order.metadata.total}</p>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {isMobile ? <hr class="opacity-50 border-t-2 border-black-1000" /> : <></>}
                                </React.Fragment>
                              ))}
                          </tbody>
                        </table>
    </div>
  );
};

export default PayFullhistory;