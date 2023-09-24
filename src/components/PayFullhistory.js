/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';
import { useUserContext } from "../context/userContext";

import firebase from 'firebase/compat/app';
import { loadStripe } from '@stripe/stripe-js';
import DOMPurify from 'dompurify';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useMyHook } from '../pages/myHook';
import { motion, AnimatePresence } from "framer-motion"



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

  const { user, user_loading } = useUserContext();
  /**
 * Get all payments for the logged in customer
 */
  const dateTime = new Date().toISOString();
  const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
  const [payments, setPayments] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  const toggleExpandedOrderId = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payments')
      .orderBy("dateTime", "desc")
      .onSnapshot((snapshot) => {
        console.log('read card');
        //setPayments(newItems);
        const newPayments = [];
        let payment;
        snapshot.forEach((doc) => {
          payment = doc.data();

          if (payment.status === 'succeeded' || payment.status === 'instore_pay') {
            console.log(doc.id)
            payment.id = doc.id
            console.log(payment)
            newPayments.push(payment);
          }
        });
        const newItems = []; // Declare an empty array to hold the new items
        newPayments.forEach((item) => {
          const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
            .subtract(4, "hours")
            .format("M/D/YYYY h:mma");
          const newItem = {
            store: payment.store,
            id: item.id, // use only the first 4 characters of item.id as the value for the id property
            receiptData: item.receiptData,
            date: formattedDate,
            email: item.user_email,
            dineMode: item.metadata.isDine,
            status: item.status === "succeeded" ? "Paid Online" : "Instore Payment",
            total: parseFloat(item.metadata.total),
            tableNum: item.tableNum,
            metadata: item.metadata
          };
          newItems.push(newItem); // Push the new item into the array
        });
        setPayments(newItems); // Update the state with the new payments
        setIsLoading(false); // Data has been loaded

        console.log(newItems)
      });

  }, []); // Make sure to update the dependencies array if you have other dependencies

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
  const [showDetails, setShowDetails] = useState(false);

  //console.log(elements.getElement(CardElement))
  return (
    <div>

      {isLoading && user_loading ? (
        <div>{t("Loading...")}</div>
      ) : (
        <>
          {payments
            .map((order) => (
              <>
                <>
                  <div className=' gap-0 pt-0'>
                    <div

                      className={`rounded-lg `}
                    >
                      <div className='flex'>
                        <img
                          className="h-[80px]  w-[80px]  mt-3 transition-all object-cover rounded-md"
                          src={JSON.parse(order.receiptData)[0].image}
                          loading="lazy"
                        />

                        <div className='w-full ml-3'>
                          <div className="mt-2 flex justify-between">
                            <p className="mb-1 text-blue-700 d-block text-md font-semibold"
                              onClick={() => { window.location.href = `/store?store=${order.store}`; }}
                              style={{ cursor: 'pointer' }}
                            >

                              <span>{order.store}</span>
                            </p>

                          </div>

                          <div className=" flex justify-between">
                            <div>
                              <p className="mb-1 d-block text-sm text-muted font-semibold">{order.date.split(" ")[0]}</p>
                              <p className="mb-1 d-block text-sm text-muted font-semibold">${order.metadata.total}</p>
                            </div>

                            <a 
   onClick={() => { toggleExpandedOrderId(order.id) }}
   class="btn d-inline-flex btn-sm btn-light mx-1 text-center"  // Added "text-center" class
   style={{ height: "40px", display: "flex", alignItems: "center" }}> {/* Added display and alignItems styles */}
   <span class="pe-2">
   </span>
   <span>
      {expandedOrderIds.includes(order.id) ? (
         "Hide Details"
      ) : (
         "View Details"
      )}
   </span>
</a>

                          </div>

                        </div>
                      </div>
                      {expandedOrderIds.includes(order.id) && (
                        <div className="p-0 p-0 rounded-b-lg">
                          <div style={{ paddingTop: "0px", paddingBottom: "10px" }}>
                            <div className="mt-1 flex justify-between mb-1">
                              <div className='text-black d-block text-sm font-semibold '>
                                Order Id: {order.id.substring(0, 3)}
                              </div>


                            </div>
                            <p className="mb-1 text-gray-500 d-block text-sm font-semibold">{order.dineMode === "DineIn" ? "Table Number: " + order.tableNum : order.dineMode} ({order.status}) </p>

                            <div className="receipt">
                              {JSON.parse(order.receiptData).map((item, index) => (

                                <div className="receipt-item" key={item.id}>
                                  <div className="mt-0 flex justify-between">
                                    <div>
                                      <p className="mb-1 text-black d-block text-sm font-semibold ">{item.name}</p>
                                      <p className="mb-1 text-gray-500 d-block text-sm font-semibold">
                                        {item.quantity} x $ {item.subtotal}
                                      </p>
                                    </div>
                                    <p className="mb-1 text-orange-700 d-block text-sm font-semibold  ">${Math.round(item.quantity * item.subtotal * 100) / 100}</p>
                                  </div>
                                </div>
                              ))}
                              <div className=" flex justify-between">
                                <p className="mb-1 text-black d-block text-sm font-semibold">{t("Subtotal")}</p>
                                <p className="mb-1 text-black d-block text-sm font-semibold">${order.metadata.subtotal}</p>
                              </div>
                              <div className="flex justify-between">
                                <p className="mb-1 text-black d-block text-sm font-semibold">{t("Tax")}</p>
                                <p className="mb-1 text-black d-block text-sm font-semibold">${order.metadata.tax}</p>
                              </div>
                              <div className=" flex justify-between">
                                <p className="mb-1 text-black d-block text-sm font-semibold">{t("Gratuity")}</p>
                                <p className="mb-1 text-black d-block text-sm font-semibold">${order.metadata.tips}</p>
                              </div>
                              <div className=" flex justify-between">
                                <p className="mb-1 text-black d-block text-sm font-semibold">{t("Total")}</p>
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">${order.metadata.total}</p>
                              </div>
                              <hr></hr>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>


              </>

            ))}
        </>

      )}
    </div>

  );
};

export default PayFullhistory;


