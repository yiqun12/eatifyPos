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

  var reviewCount = sortedData.filter(item => item.Status === "Review").length;
  setReviewVar(reviewCount)

  const statusPriority = {
    "Review": 1,
    "Pending": 2,
    "Failed": 3,
    "Paid": 4
  };

  const [triggerSort, setTriggerSort] = useState(false);
  const { user, user_loading } = useUserContext();
  const [arr, setArr] = useState([]);
  const [checkProduct, setCheckProduct] = useState([]);
  const [awaitingMergeProduct, setAwaitingMergeProduct] = useState("[]");
  const [awaitingMergeProductIncoming, setAwaitingMergeProductIncoming] = useState("[]");

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
      setCheckProduct(docs)
      setArr(docs.map(element => element.id.slice((storeID + "-").length)))
      console.log("docs")
      console.log(docs);
    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Dependencies for useEffect
  const SetTableInfo = async (table_name, product,id) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table", table_name);
      await setDoc(docRef, docData);
      //deleteDocument(id)
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const mergeProduct = async (table_name) => {
    console.log("groupAndSumItemsgroupAndSumItems")
    console.log(groupAndSumItems(awaitingMergeProduct))
    SetTableInfo(table_name, JSON.stringify(awaitingMergeProduct),idForDelete)
    setModalOpen2(false)
  };
  const addToEmptyTable = async (table_name) => {
    
    SetTableInfo(table_name, awaitingMergeProductIncoming,idForDelete)
    setModalOpen2(false)
  };

  const [TableSelected, setTableSelected] = useState("");
  const [idsWithEmptyProduct, setidsWithEmptyProduct] = useState([]);
  const [idForDelete, setIdForDelete] = useState("");

  function clickConfirm(orderId) {
    const updatedData = sortedData.map(item => {
      if (item.orderId === orderId && item.Status === "Review") {
        return { ...item, Status: "Pending" };
      }
      return item;
    });

    const itemsForChange = sortedData.map(item => {
      if (item.orderId === orderId && arr.includes(item.table)) {
        console.log(checkProduct)
        console.log(storeID + "-" + item.table)
        const idToFind = storeID + "-" + item.table
        const foundObject = checkProduct.find(item => item.id === idToFind)
        console.log(foundObject)
        setIdForDelete(orderId)
        const idsWithEmptyProduct_ = checkProduct
          .filter(item => item.product === "[]")
          .map(item => item.id);
        console.log(idsWithEmptyProduct_)
        setidsWithEmptyProduct(idsWithEmptyProduct_)
        if (foundObject) {
          const product = foundObject.product;
          console.log(JSON.parse(product))
          console.log("itemsForChange")
          console.log(item.items)//exissting product
          const mergedArray = [...JSON.parse(product), ...item.items];
          console.log(mergedArray)
          setAwaitingMergeProduct(mergedArray)//for merge
          setAwaitingMergeProductIncoming(product)//this is for the incoming product
          if (product === '[]') {
            setModalOpen(true)
            console.log("empty table")
            setTableSelected(item.table)
            SetTableInfo(storeID + "-" + item.table, JSON.stringify(mergedArray),orderId)

          } else {
            setModalOpen2(true)
            console.log("not empty table")
            setTableSelected(item.table)
          }
        } else {
          console.log(`Object with ID not found.`);
        }


        return { ...item, Status: "Paid" };
      }
      return item;
    });

    reviewCount = sortedData.filter(item => item.Status === "Review").length;
    setReviewVar(reviewCount);

    console.log(sortedData)
    setSortedData(itemsForChange);
    setTriggerSort(prev => !prev); // flip the value to trigger sorting
  }
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpen2, setModalOpen2] = useState(false);

  function reversed(array) {
    return [...array].reverse();
}

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

  }, [triggerSort]);

  function getBadgeColor(status) {
    switch (status) {
      case 'Paid':
        return 'success'; // green
      case 'Pending':
        return 'warning'; // yellow or orange
      case 'Failed':
        return 'danger'; // red
      default:
        return 'secondary'; // grey or any fallback color
    }
  }

  const deleteDocument = async (orderId) => {
    try {

      const docRef = doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', storeID, 'PendingDineInOrder', orderId);
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  

  return (
    // <div>Hello</div>
    <div>
      <style>
        {`
          /* Webpixels CSS */
          @import url("https://unpkg.com/@webpixels/css@1.1.5/dist/index.css");
        
          /* Webpixels CSS */
          @import url(https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `
        }
      </style>
      {isModalOpen && (
        <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation:</h5>
              </div>
              <div className="modal-body">
                This order has been added to {TableSelected}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setModalOpen(false)}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen2 && (
        <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Warning: {TableSelected} has been occupied</h5>
              </div>
              <div className="modal-body">
                <div>
                  <button type="button" className="btn btn-primary" onClick={() => mergeProduct(storeID + "-" + TableSelected)} >Merge this order with existsing order in {TableSelected}</button>
                </div>
                <br></br>
                <div>
                  <div>
                    <div>
                      Move to selected empty dining table.
                    </div>
                    {idsWithEmptyProduct.map((option) => (

                      <button
                        type="button"
                        className="btn btn-primary mb-2 mr-2"
                        onClick={() => addToEmptyTable(option)}
                      >
                        {option.slice((storeID + "-").length)}
                      </button>

                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen2(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div class="card mb-7">
        <div class="card-header">
          <h5 class="mb-0">Applications <span
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
            {reviewVar}
          </span></h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover table-nowrap">
            <thead class="table-light">
              <tr>
                <th scope="col">OrderID</th>
                <th scope="col">State</th>
                <th scope="col">Name</th>
                <th scope="col">Table</th>
                <th scope="col">Date</th>
                <th scope="col">Total Price</th>
                {/* <th scope="col">Meeting</th> */}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((order, index) => (
                <React.Fragment key={order.orderId}>
                  <tr key={order.orderId}>
                    <td>
                      {order.orderId.substring(0, 4)}
                    </td>
                    <td>
                      <span className="badge badge-lg badge-dot">
                        <i className={`bg-${getBadgeColor(order.Status)}`}></i>{order.Status}
                      </span>
                    </td>
                    <td>
                      <a className="text-heading font-semibold">
                        {order.username}
                      </a>
                    </td>
                    <td>
                      {order.table}
                    </td>

                    <td>
                      {order.date}
                    </td>
                    <td>
                      ${order.amount}
                    </td>

                    <td className="text-end">
                      <button className="btn btn-sm btn-primary mr-2" onClick={() => clickConfirm(order.orderId)}>Confirm</button>

                      <button type="button" className="btn btn-sm btn-danger text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
                        Delete
                      </button>
                    </td>


                    {/* Check if the current order should have its items shown
        {order.orderId === expandedOrderId && (
            <td colSpan="5">
                <div style={{padding: '10px', backgroundColor: '#f8f9fa'}}>
                    {order.items && order.items.map(item => (
                      <div key={item.id}>
                          Name: {item.name} | Quantity: {item.quantity} | Price: {item.itemTotalPrice}
                          {item.attributeSelected && Object.keys(item.attributeSelected).map(attributeKey => (
                              <div key={attributeKey}>
                                  {attributeKey}: {Array.isArray(item.attributeSelected[attributeKey]) 
                                      ? item.attributeSelected[attributeKey].join(', ') 
                                      : item.attributeSelected[attributeKey]
                                  }
                              </div>
                          ))}
                      </div>
                    ))}
                </div>
            </td>
        )} */}


                  </tr>

                  {(
                    <tr>
                      <td colSpan="5">
                        <div style={{ padding: '10px', backgroundColor: '#f8f9fa' }}>
                          {order.items && order.items.map(item => (
                            <div key={item.id}>
                              {item.name} | Quantity: {item.quantity} | Price: {item.itemTotalPrice}
                              {item.attributeSelected && Object.keys(item.attributeSelected).map(attributeKey => (
                                <div key={attributeKey}>
                                  {attributeKey}: {Array.isArray(item.attributeSelected[attributeKey])
                                    ? item.attributeSelected[attributeKey].join(', ')
                                    : item.attributeSelected[attributeKey]
                                  }
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

        </div>
        {sortedData.length <= 0
          ?
          <div class="card-footer border-0 py-5">
            <span class="text-muted text-sm">There is no pending dine in order at this moment.</span>
          </div> :
          <></>

        }

      </div>
    </div>
  );
}

export default Test_Notification_Page;