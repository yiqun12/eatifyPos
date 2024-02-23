import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { collection, doc, setDoc, addDoc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import { onSnapshot, query } from 'firebase/firestore';


function Test_Notification_Page({ storeID, reviewVar, setReviewVar, sortedData, setSortedData }) {

  // const exampleJSON = [{orderId: "1", date: "10/7/2023", amount: "100", Status: "Review"},{orderId: "2", date: "10/7/2023", amount: "300", Status: "Review"},{orderId: "3", date: "10/7/2023", amount: "1000", Status: "Paid"}]

  // const [sortedData, setSortedData] = useState(exampleJSON);

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

  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    console.log("docs");

    const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table");

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      console.log("docs")
      console.log(docs);
      setArrEmpty(docs
        .filter(element => element.product === "[]")
        .map(element => element.id.slice((storeID + "-").length)))
      setArrOccupied(docs
        .filter(element => element.product !== "[]")
        .map(element => element.id.slice((storeID + "-").length)))
    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Dependencies for useEffect


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


  useEffect(() => {
    const sorted = [...sortedData].sort((a, b) => { // Sort based on sortedData
      if (statusPriority[a.Status] !== statusPriority[b.Status]) {
        return statusPriority[a.Status] - statusPriority[b.Status];
      } else {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA - dateB;
      }
    });
    setSortedData(sorted);

  }, []);


  const deleteDocument = async (orderId) => {
    try {

      const docRef = doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', storeID, 'PendingDineInOrder', orderId);
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };


  const [isChangeTableModal, setChangeTableModal] = useState(false);
  const [arrEmpty, setArrEmpty] = useState([]);
  const [arrOccupied, setArrOccupied] = useState([]);
  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);

  const uniqueModalStyles = {
    overlayStyle: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isUniqueModalOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStyle: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    closeBtnStyle: {
      position: 'absolute',
      right: '30px',
      top: '0',
      background: 'none',
      border: 'none',
      fontSize: '48px',
      cursor: 'pointer',
    },
    inputStyle: {
      width: '100%',
      padding: '12px',
      boxSizing: 'border-box',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    buttonStyle: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px',
    },
  };
  function groupAndSumItems(items) {
    const groupedItems = {};
    items.reverse();
    items.forEach(item => {
      // Create a unique key based on id and JSON stringified attributes
      const key = `${item.id}-${JSON.stringify(item.attributeSelected)}`;

      if (!groupedItems[key]) {
        // If this is the first item of its kind, clone it (to avoid modifying the original item)
        groupedItems[key] = { ...item };
      } else {
        // If this item already exists, sum up the quantity and itemTotalPrice
        groupedItems[key].quantity += item.quantity;
        groupedItems[key].itemTotalPrice += item.itemTotalPrice;
        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
  }
  const SetTableIsSent = async (table_name, product) => {
    try {
      if (localStorage.getItem(table_name) === product) {
        return
      }
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "TableIsSent", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const SetTableInfo_ = async (table_name, product, TableId) => {
    try {

      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table", table_name);
      await setDoc(docRef, docData);
      setTimeout(() => SendToKitchen(TableId), 200);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const mergeProduct = async (table_name) => {
    // console.log(JSON.stringify(selectedOrder.items));
    SetTableInfo_(`${storeID}-${table_name}`, JSON.stringify(groupAndSumItems(
      [...selectedOrder.items, ...JSON.parse(localStorage.getItem(`${storeID}-${table_name}`))]
    )), table_name)

    //SetTableIsSent(`${storeID}-${table_name}-isSent`, JSON.stringify(groupAndSumItems(selectedOrder.items, JSON.parse(localStorage.getItem(storeID + "-" + table_name + "-isSent")))))

  };

  const SendToKitchen = async (selectedTable) => {

    try {
      if (localStorage.getItem(storeID + "-" + selectedTable) === null || localStorage.getItem(storeID + "-" + selectedTable) === "[]") {
        if (localStorage.getItem(storeID + "-" + selectedTable + "-isSent") === null || localStorage.getItem(storeID + "-" + selectedTable + "-isSent") === "[]") {
          console.log(1)
          return //no item in the array no item isSent.
        } else {//delete all items
          console.log(2)
        }
      }
      compareArrays(JSON.parse(localStorage.getItem(storeID + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(storeID + "-" + selectedTable)), selectedTable)
      SetTableIsSent(storeID + "-" + selectedTable + "-isSent", localStorage.getItem(storeID + "-" + selectedTable) !== null ? localStorage.getItem(storeID + "-" + selectedTable) : "[]")
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  async function compareArrays(array1, array2, selectedTable) {//array1 isSent array2 is full array
    const array1ById = Object.fromEntries(array1.map(item => [item.count, item]));
    const array2ById = Object.fromEntries(array2.map(item => [item.count, item]));
    const add_array = []
    const delete_array = []
    for (const [count, item1] of Object.entries(array1ById)) {
      const item2 = array2ById[count];
      if (item2) {
        // If item exists in both arrays
        if (item1.quantity > item2.quantity) {
          console.log('Deleted trigger:', {
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          });
          delete_array.push({
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          })

        } else if (item1.quantity < item2.quantity) {
          console.log('Added trigger:', {
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          });
          add_array.push({
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          })
        }
      } else {
        // If item exists in array 1 but not in array 2
        console.log('Deleted trigger:', item1);
        delete_array.push(item1)
      }
    }

    for (const [count, item2] of Object.entries(array2ById)) {
      const item1 = array1ById[count];
      if (!item1) {
        // If item exists in array 2 but not in array 1
        console.log('Added trigger:', item2);
        add_array.push(item2)
      }
    }
    const promises = [];//make them call at the same time

    if (add_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const addPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "SendToKitchen"), {
        date: date,
        data: add_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      });
      promises.push(addPromise);
    }

    if (delete_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const deletePromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "DeletedSendToKitchen"), {
        date: date,
        data: delete_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("DeleteSendToKitchen Document written with ID: ", docRef.id);
      });
      promises.push(deletePromise);
    }

    // Execute both promises in parallel
    Promise.all(promises).then(() => {
      console.log("All operations completed");
    }).catch(error => {
      console.error("Error in executing parallel operations", error);
    });
  }

  return (
    // <div>Hello</div>
    <div>
      <style>
        {`
          /* Webpixels CSS */
          @import url(https://unpkg.com/@webpixels/css@1.1.5/dist/index.css);

          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
      </style>


      {isChangeTableModal && (
        <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Dining Desk to Merge</h5>
                <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setChangeTableModal(false); }}>
                  &times;
                </button>
              </div>
              <div className="modal-body pt-0">
                <div>Customer's Chosen Dining Table:{
                  arrOccupied.includes(selectedOrder.table) || arrEmpty.includes(selectedOrder.table) ? "" : "Customer's Table Not Found"
                }</div>

                {arrEmpty.includes(selectedOrder.table) ?
                  <button
                    type="button"
                    className="btn btn-primary mb-2 mr-2 notranslate"
                    onClick={() => {
                      mergeProduct(selectedOrder.table);//A1
                      setChangeTableModal(false);
                      deleteDocument(selectedOrder.orderId)
                    }}
                    style={{ backgroundColor: '#966f33' }}
                  >
                    {selectedOrder.table}
                  </button> : ""}

                {arrOccupied.includes(selectedOrder.table) ?
                  <button
                    type="button"
                    className="btn btn-primary mb-2 mr-2 notranslate"
                    onClick={() => {
                      mergeProduct(selectedOrder.table);
                      setChangeTableModal(false);
                      deleteDocument(selectedOrder.orderId)
                    }}
                  >
                    {selectedOrder.table}
                  </button> : ""}
                <div>Select Other Empty Dining Desk:</div>
                {arrEmpty.map((option) => (

                  <button
                    type="button"
                    className="btn btn-primary mb-2 mr-2 notranslate"
                    onClick={() => {
                      mergeProduct(option);//A1
                      setChangeTableModal(false);
                      deleteDocument(selectedOrder.orderId)
                    }}
                    style={{ backgroundColor: '#966f33' }}
                  >
                    {option}
                  </button>

                ))}
                <hr></hr>
                <div>Select Other Dining Desk(s) in Use:</div>
                {arrOccupied.map((option) => (

                  <button
                    type="button"
                    className="btn btn-primary mb-2 mr-2 notranslate"
                    onClick={() => {
                      mergeProduct(option);
                      setChangeTableModal(false);
                      deleteDocument(selectedOrder.orderId)
                    }}
                  >
                    {option}
                  </button>

                ))}
              </div>
              <div className="modal-footer">
              </div>
            </div>
          </div>
        </div>

      )
      }

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
                <th style={{ "font-size": "16px" }} scope="col">State</th>
                <th style={{ "font-size": "16px" }} scope="col">Name</th>
                <th style={{ "font-size": "16px" }} scope="col">Dining Table</th>
                <th style={{ "font-size": "16px" }} scope="col">Date</th>
                <th style={{ "font-size": "16px" }} scope="col">Total Price</th>
              </tr>
            </thead>
            <tbody>

              {sortedData.map((order, index) => (
                <div style={{ display: 'contents' }}>

                  <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                    <td className="rder-number notranslate" data-title="OrderID">{order.orderId.substring(0, 4)}</td>
                    <td className="order-status notranslate" data-title="status" style={{ whiteSpace: "nowrap" }}> {order.Status}</td>
                    <td className="order-name notranslate" data-title="name" style={{ whiteSpace: "nowrap" }}>{order.username}</td>
                    <td className="order-Table notranslate" data-title="Dining Table" style={{ whiteSpace: "nowrap" }}>{order.table ? order.table : "no table"}</td>
                    <td className="order-date notranslate" data-title="Time" style={{ whiteSpace: "nowrap" }}>
                      {order.date}
                    </td>
                    <td className="order-Total notranslate" data-title="Total" style={{ whiteSpace: "nowrap" }}>
                      ${roundToTwoDecimalsTofix(order.amount)}
                    </td>
                    {isMobile ? null :
                      <td className="pr-2 text-end">
                        {order.Status === "Paid" ?
                          <div>

                            <button type="button" className="btn btn-sm btn-primary text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
                              Confirm
                            </button>
                          </div>
                          :
                          <div>
                            <button className="btn btn-sm btn-primary mr-2" onClick={() => { setChangeTableModal(true); setSelectedOrder(order) }}>Add to Dining Table</button>
                            <button type="button" className="btn btn-sm btn-danger text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
                              Delete
                            </button>
                          </div>
                        }

                      </td>
                    }
                    {isMobile ?
                      <div className="pr-2 text-end">
                        {order.Status === "Paid" ?
                          <div>

                            <button type="button" className="mb-1 btn btn-sm btn-primary text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
                              Confirm
                            </button>
                          </div>
                          : <div>

                            <button className="mb-1 btn btn-sm btn-primary mr-2" onClick={() => { setChangeTableModal(true); setSelectedOrder(order) }}>Add to Dining Table</button>

                            <button type="button" className="mb-1 btn btn-sm btn-danger text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
                              Delete
                            </button>
                          </div>
                        }

                      </div> : null
                    }
                  </tr>

                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td colSpan={8} style={{ padding: "10px" }}>
                      <div className="receipt">
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