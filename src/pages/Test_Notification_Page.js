import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import { onSnapshot, query } from 'firebase/firestore';
import styled from 'styled-components';
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';
import firebase from 'firebase/compat/app';


function Test_Notification_Page({ storeID, reviewVar, setReviewVar, sortedData }) {


  var reviewCount = sortedData.length;
  setReviewVar(reviewCount)

  const statusPriority = {
    "Review": 1,
    "Pending": 2,
    "Failed": 3,
    "Paid": 4
  };

  const { user, user_loading } = useUserContext();

  function roundToTwoDecimalsTofix(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }



  const [width, setWidth] = useState(window.innerWidth);
  const [selectedOrder, setSelectedOrder] = useState("[]");

  function handleWindowSizeChange() {
    console.log(window.innerWidth)
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 600;


  const deleteDocument = async (orderId, orderStatus, order) => {
    console.log("deleteDocument")
    console.log(order)
    try {
      const docRef = firebase.firestore()
        .collection('RequestQuoteDoordash')
        .doc(orderId);

      const docSnapshot = await docRef.get();

      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        console.log("Document exists:");
        data.uid = "Merchant" + orderId; // Append the document ID as a new field
        console.log(data);

        try {
          const myFunction = firebase.functions().httpsCallable('requestQuoteDoordash');
          const response = await myFunction(data);

          if (response.data.message) {//error
            // console.error('Error requesting quote:', error);
          } else {
            try {


              if (orderStatus === 'Delivery') {

                const myFunction = firebase.functions().httpsCallable('acceptQuoteDoordash');
                const response = await myFunction({
                  uid: "Merchant" + orderId,
                });
                console.log('Quote Response:', response.data);
              } else {//successful deploy

              }
            } catch (error) {
              console.error('Error requesting quote:', error);
              // Handle the error appropriately
            }
          }
        }
        catch (error) {
          console.error("Error deleting document: ", error);
        }
      } else {
        console.log("No such document!");
      }
    } catch (err) {
      console.error("Error getting document:", err);
    }





    try {

      const docRef = doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', storeID, 'PendingDineInOrder', orderId);
      await updateDoc(docRef, {
        isConfirm: true  // Replace "newStatus" with the actual status you want to update to
      });
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };






  return (
    // <div>Hello</div>

    <div >
      <style>
        {`
          /* Webpixels CSS */
          @import url(https://unpkg.com/@webpixels/css@1.1.5/dist/index.css);

          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
      </style>


      <div class="">
        <div class="card-header">
          <h5 class="mb-0">Notification&nbsp;<span
            style={{
              display: 'inline-flex', // changed from 'flex' to 'inline-flex'
              alignItems: 'center',
              justifyContent: 'center',
              width: '15px',
              height: '15px',
              backgroundColor: 'blue',
              borderRadius: '50%',
              color: 'white',
              fontSize: '10px',
              verticalAlign: 'middle' // added to vertically center the circle
            }}
          >
            <span className='notranslate'>{reviewVar}</span>

          </span></h5>
        </div>

        <div class="table-responsive">

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
                <th style={{ "font-size": "16px" }} scope="col">Order ID</th>
                {/* <th style={{ "font-size": "16px" }} scope="col">Name</th> */}
                <th style={{ "font-size": "16px" }} scope="col">Dining Table</th>
                {/* <th style={{ "font-size": "16px" }} scope="col">Date</th> */}
                <th style={{ "font-size": "16px" }} scope="col">Time</th>
              </tr>
            </thead>
            <tbody>

              {sortedData.map((order, index) => (
                <div style={{ display: 'contents' }}>

                  <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="order-number notranslate" data-title="OrderID">
                      {order.orderId.substring(0, 4)}

                    </td>
                    {/* <td className="order-status notranslate" data-title="status" style={{ whiteSpace: "nowrap" }}> {order.Status}</td> */}
                    {/* <td className="order-name notranslate" data-title="name" style={{ whiteSpace: "nowrap" }}>{order.username}</td> */}
                    <td className="order-Table notranslate" data-title="Dining Table" style={{ whiteSpace: "nowrap" }}>
                      {order.table ? order.table : "no table"}
                    </td>
                    <td className="order-Total notranslate" data-title="Total" style={{ whiteSpace: "nowrap" }}>
                      {order.date}
                    </td>
                    <td className="text-right">
                      {order.Status === "Delivery" ?
                        <button type="button" className="mb-1 btn btn-sm btn-danger text-danger-hover" onClick={() => deleteDocument(order.orderId, order.Status, order)}>
                          Request Pickup Driver
                        </button>
                        :
                        <button type="button" className="mb-1 btn btn-sm btn-primary text-primary-hover" onClick={() => deleteDocument(order.orderId, order.Status, order)}>
                          Confirm
                        </button>
                      }


                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td colSpan={8} style={{ padding: "10px" }}>
                      <div className="receipt">
                        <div className='flex'>
                          <span>Order ID:</span>

                          <span className='notranslate'>{order.orderId}</span>
                        </div>
                        <div className='flex'>

                          {order.Status === "Delivery" ?

                            <span>Reference Tag: Order Number is {order.orderId.substring(0, 2)}</span>
                            : null
                          }
                        </div>

                        {order.items && order.items.map(item => (
                          <div key={item.id}>
                            <p className='notranslate'>
                              {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? (item?.CHI) : (item?.name)}

                              {item.attributeSelected && Object.keys(item.attributeSelected).map(attributeKey => (
                                <span>
                                  (
                                  {Array.isArray(item.attributeSelected[attributeKey])
                                    ? item.attributeSelected[attributeKey].join(', ')
                                    : item.attributeSelected[attributeKey]
                                  }
                                  )
                                </span>
                              ))}
                              &nbsp;x {item.quantity} @ ${roundToTwoDecimalsTofix(item.subtotal)} each = ${roundToTwoDecimalsTofix(item.itemTotalPrice)}
                            </p>


                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </div>

              ))}


            </tbody>
          </table>
        </div>
        {sortedData.length <= 0
          ?
          <div class="card-footer border-0 py-5">
            <span class="text-muted text-sm">There is no pending dine in order at this moment.</span>
          </div> :
          null

        }
      </div>
    </div >
  );
}

export default Test_Notification_Page;