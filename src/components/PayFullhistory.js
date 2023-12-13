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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/index';


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
    setIsLoading(true); // Set loading to true when component mounts or dependencies change
    const fetchCollectionAsMap = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'TitleLogoNameContent'));
        const tempStoreMap = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Using the document ID as the key for the hash map
          tempStoreMap[doc.id] = {
            storeName: data.Name,
            storeNameCHI: data.storeNameCHI,
          };
        });
        return tempStoreMap
      } catch (error) {
        return {}
      }
    };

    const unsubscribe = firebase
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

          if (payment.status === 'succeeded') {
            console.log(doc.id)
            payment.id = doc.id
            console.log(payment)
            newPayments.push(payment);
          }
        });

        const newItems = []; // Declare an empty array to hold the new items
        fetchCollectionAsMap().then(tempStoreMap => {
          console.log(tempStoreMap);
          newPayments.forEach((item) => {
            const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
              .subtract(8, "hours")
              .format("M/D/YYYY h:mma");

            const newItem = {
              storeName: Object.keys(tempStoreMap).length > 0 && tempStoreMap.hasOwnProperty(payment.store) ? tempStoreMap[payment.store].storeName : payment.store,
              storeNameCHI: Object.keys(tempStoreMap).length > 0 && tempStoreMap.hasOwnProperty(payment.store) ? tempStoreMap[payment.store].storeNameCHI : payment.store,
              store: payment.store,
              id: item.id.substring(0, 4), // use only the first 4 characters of item.id as the value for the id property
              receiptData: item.receiptData,
              date: formattedDate,
              email: item.user_email,
              dineMode: item.metadata.isDine,
              status: item.powerBy,
              total: parseFloat(item.metadata.total),
              tableNum: item.tableNum,
              metadata: item.metadata,
            };
            newItems.push(newItem); // Push the new item into the array
          });
          setPayments(newItems); // Update the state with the new payments
          setIsLoading(false); // Data has been loaded

          console.log(newItems)
        });



      });
    ;
    return () => unsubscribe(); // Cleanup the subscription on unmount

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
        <div>
          {payments
            .map((order) => (
              <div>
                <div>
                  <div>
                    <div>
                      <div className='flex'>
                        <div className="w-20 h-20 mt-3 overflow-hidden rounded-md">
                          <img
                            className="w-full h-full object-cover object-center"
                            src={JSON.parse(order.receiptData)[0].image}
                            loading="lazy"
                          />
                        </div>

                        <div className='w-full ml-3'>
                          <div className="mt-2 flex justify-between">
                            <p className="mb-1 text-blue-700 d-block text-md font-semibold"
                              onClick={() => { window.location.href = `/store?store=${order.store}`; }}
                              style={{ cursor: 'pointer' }}
                            >
                              <span className='notranslate'>
                                {
                                  sessionStorage.getItem("Google-language")?.includes("Chinese") || sessionStorage.getItem("Google-language")?.includes("中") ? t(order?.storeNameCHI) : (order?.Name)
                                }
                              </span>
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
                              <div className=' notranslate text-black d-block text-sm font-semibold '>
                                Order Id: {order.id.substring(0, 4)}
                              </div>


                            </div>
                            <p className="mb-1 text-gray-500 d-block text-sm font-semibold">{order.dineMode === "DineIn" ? "Table Number: " + order.tableNum : order.dineMode} ({order.status}) </p>

                            <div className="receipt">
                              {JSON.parse(order.receiptData).map((item, index) => (

                                <div className="receipt-item" key={item.id}>
                                  <div>
                                    <div>
                                      <div className='flex justify-between'>
                                        <p className="notranslate mb-1 text-black text-left text-sm font-semibold">
                                          {item.quantity} x&nbsp; 
                                          {
                                            sessionStorage.getItem("Google-language")?.includes("Chinese") || sessionStorage.getItem("Google-language")?.includes("中") ? t(item?.CHI) : (item?.name)
                                          }
                                        </p>
                                        <p className="mb-1 text-black text-right text-sm font-semibold">
                                          ${Math.round(item.quantity * item.subtotal * 100) / 100}
                                        </p>
                                      </div>

                                      <div className="mb-1 text-gray-500 d-block text-sm font-semibold "> {Object.entries(item.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className=" flex justify-between">
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">{t("Subtotal")}</p>
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">${order.metadata.subtotal}</p>
                              </div>
                              <div className="flex justify-between">
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">{t("Tax")}</p>
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">${order.metadata.tax}</p>
                              </div>
                              <div className=" flex justify-between">
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">{t("Gratuity")}</p>
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">${order.metadata.tips}</p>
                              </div>
                              <div className=" flex justify-between">
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">{t("Total")}</p>
                                <p className="mb-1 text-orange-700 d-block text-sm font-semibold">${order.metadata.total}</p>
                              </div>
                              <hr></hr>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </div>

            ))}
        </div>

      )}
    </div>

  );
};

export default PayFullhistory;


