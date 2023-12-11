import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";


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

  function clickConfirm(orderId) {
    const updatedData = sortedData.map(item => {
      if (item.orderId === orderId && item.Status === "Review") {
        return { ...item, Status: "Pending" };
      }
      return item;
    });
    reviewCount = sortedData.filter(item => item.Status === "Review").length;

    setReviewVar(reviewCount);

    setSortedData(updatedData);
    setTriggerSort(prev => !prev); // flip the value to trigger sorting
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

  const [expandedOrderId, setExpandedOrderId] = useState(null);


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
                <th scope="col">Status</th>
                <th scope="col">Name</th>
                <th scope="col">Table</th>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
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
                      <button className="btn btn-sm btn-neutral" onClick={() => clickConfirm(order.orderId)}>Confirm</button>
                      <button className="btn btn-sm btn-neutral" onClick={() => {
                        if (expandedOrderId === order.orderId) {
                          setExpandedOrderId(null);
                        } else {
                          setExpandedOrderId(order.orderId);
                        }
                      }}>View</button>
                      <button type="button" className="btn btn-sm btn-neutral text-danger-hover" onClick={() => deleteDocument(order.orderId)}>
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

                  {order.orderId === expandedOrderId && (
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