import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import { useToast } from '../components/Toast';

import firebase from 'firebase/compat/app';
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';
import { lookup } from 'zipcode-to-timezone';



function Test_Notification_Page({ storeID, reviewVar, setReviewVar, sortedData }) {

  // Initialize toast for better notifications
  const { showToast, ToastList } = useToast();

  function getTimeZoneByZip(zipCode) {
    // Use the library to find the timezone ID from the ZIP code
    const timeZoneId = lookup(zipCode);

    // Check if the timezone ID is in our timeZones list
    return timeZoneId;
  }
  var reviewCount = sortedData.length;
  setReviewVar(reviewCount)

  const statusPriority = {
    "Review": 1,
    "Pending": 2,
    "Failed": 3,
    "Paid": 4
  };

  console.log(sortedData)

  const { user, user_loading } = useUserContext();

  function roundToTwoDecimalsTofix(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }
  const addTestNotification = async () => {
    const testItems = [
      {
        id: "test-item-1",
        name: "Test Burger",
        subtotal: "12.99",
        quantity: 1,
        attributeSelected: { size: "Medium" },
        itemTotalPrice: 12.99,
        CHI: "测试汉堡"
      },
      {
        id: "test-item-2",
        name: "Test Fries",
        subtotal: "4.99",
        quantity: 2,
        attributeSelected: {},
        itemTotalPrice: 9.98,
        CHI: "测试薯条"
      }
    ];
    const dateTime = new Date().toISOString();
    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
    addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "PendingDineInOrder"), {
      store: storeID,
      stripe_account_store_owner: user.uid,
      items: testItems,
      date: parseDateUTC(date, getTimeZoneByZip("94133")),
      amount: 0,
      Status: "Pending", // Assuming "NO USE" is a comment and not part of the value
      table: "abc",
      username: "kiosk",
      isConfirm: false,
    }).then(() => {

    }).catch((error) => {
      console.error("Error writing document: ", error);

    });
  };

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

  // Function to add order items to the corresponding table's cart
  const addOrderToTableCart = async (order) => {
    try {
      const tableName = order.table;
      const orderItems = order.items;
      
      if (!tableName || !orderItems) {
        console.error("Missing table name or order items");
        return;
      }

      // Get existing cart data for this table
      const existingCartKey = `${storeID}-${tableName}`;
      let existingCart = [];
      
      try {
        const existingCartData = localStorage.getItem(existingCartKey);
        if (existingCartData) {
          existingCart = JSON.parse(existingCartData);
        }
      } catch (error) {
        console.log("No existing cart found for table, creating new one");
      }

      // Process and add new items to the cart
      const processedItems = orderItems.map(item => ({
        ...item,
        // Add a unique count identifier if not present
        count: item.count || Date.now() + Math.random(),
        // Ensure proper structure for backend cart
        isFromCustomerOrder: true,
        customerOrderId: order.orderId,
        addedAt: new Date().toISOString()
      }));

      // Combine existing cart with new items
      const updatedCart = [...existingCart, ...processedItems];

      // Save to localStorage (backend cart format)
      localStorage.setItem(existingCartKey, JSON.stringify(updatedCart));

      console.log(`Added ${processedItems.length} items to table ${tableName} cart`);
      showToast(`Order confirmed! Items added to table ${order.table}`, 'success', 3000);

      
    } catch (error) {
      console.error("Error adding order to table cart: ", error);
      throw error;
    }
  };

  const deleteDocument = async (orderId, orderStatus, order) => {
    console.log("deleteDocument")
    console.log(order)
    if (order.Status === "Delivery") {
      // try {
      //   const docRef = firebase.firestore()
      //     .collection('RequestQuoteDoordash')
      //     .doc(orderId);

      //   const docSnapshot = await docRef.get();

      //   if (docSnapshot.exists) {
      //     const data = docSnapshot.data();
      //     console.log("Document exists:");
      //     data.uid = "Merchant" + orderId; // Append the document ID as a new field
      //     console.log(data);
      //     //orderStatus === 'Delivery'
      //     try {
      //       const myFunction = firebase.functions().httpsCallable('requestQuoteDoordash');
      //       const response = await myFunction(data);

      //       if (response.data.message) {//error
      //         // console.error('Error requesting quote:', error);
      //       } else {
      //         try {


      //           if (true) {

      //             const myFunction = firebase.functions().httpsCallable('acceptQuoteDoordash');
      //             const response = await myFunction({
      //               uid: "Merchant" + orderId,
      //             });
      //             console.log('Quote Response:', response.data);
      //           } else {//successful deploy

      //           }
      //         } catch (error) {
      //           console.error('Error requesting quote:', error);
      //           // Handle the error appropriately
      //         }
      //       }
      //     }
      //     catch (error) {
      //       console.error("Error deleting document: ", error);
      //     }
      //   } else {
      //     console.log("No such document!");
      //   }
      // } catch (err) {
      //   console.error("Error getting document:", err);
      // }
    }

    try {
      // Step 1: Add order items to the table's cart
      await addOrderToTableCart(order);
      
      // Step 2: Mark the order as confirmed
      const docRef = doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', storeID, 'PendingDineInOrder', orderId);
      await updateDoc(docRef, {
        isConfirm: true
      });
    } catch (error) {
      console.error("Error confirming order: ", error);
      showToast("Error confirming order. Please try again.", 'error', 5000);
    }
  };

  return (
    // <div>Hello</div>

    <div >
      <ToastList />
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
          <div className="d-flex justify-content-between align-items-center">
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

            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={addTestNotification}
              title="Add a test notification for testing purposes"
            >
              Add Test Notification

            </button>

          </div>
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

              {sortedData.filter(order => order.isConfirm === false).map((order, index) => (
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
                      {!isMobile ?
                        <button type="button" className="mb-1 btn btn-sm btn-primary text-primary-hover" onClick={() => deleteDocument(order.orderId, order.Status, order)}>
                          Confirm
                        </button> :
                        null}


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
                            <div>
                              <div>Reference Tag: Order Number is {order.orderId.substring(0, 2)}</div>
                            </div>
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

                        {isMobile ? (
                          <button
                            type="button"
                            className="mb-1 btn btn-sm btn-primary text-primary-hover w-full"
                            onClick={() => deleteDocument(order.orderId, order.Status, order)}
                          >
                            Confirm
                          </button>
                        ) : null}


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
