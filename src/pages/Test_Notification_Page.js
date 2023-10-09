import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useState, useEffect} from 'react';

const exampleJSON = [  {orderId: "1", date: "10/7/2023", amount: "100", Status: "Review", 
items: [{"id":"8d2579fc-bd3a-4df0-bde5-8884bcbd2919",
"name":"肉眼牛排",
"subtotal":1,
"image":"https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
"quantity":5,
"attributeSelected":{"Weight":["18 oz","20oz"],"size":"bg"},
"count":"9224d939-2223-4820-b802-f61ddd9b2879",
"itemTotalPrice":90,
"cancel":"true"},
{"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46",
"name":"宫保鸡丁",
"subtotal":"1",
"image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666",
"quantity":4,
"attributeSelected":{"size":["big"]},
"count":"81e85da6-c0b4-47e8-aa6a-4ee34fc6be6f",
"itemTotalPrice":8}
]},
  {orderId: "2", date: "10/7/2023", amount: "300", Status: "Review",  
  items: [{"id":"8d2579fc-bd3a-4df0-bde5-8884bcbd2919",
  "name":"肉眼牛排",
  "subtotal":1,
  "image":"https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
  "quantity":5,
  "attributeSelected":{"Weight":["18 oz","20oz"],"size":"bg"},
  "count":"9224d939-2223-4820-b802-f61ddd9b2879",
  "itemTotalPrice":90,
  "cancel":"true"},
  {"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46",
  "name":"宫保鸡丁",
  "subtotal":"1",
  "image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666",
  "quantity":4,
  "attributeSelected":{"size":["big"]},
  "count":"81e85da6-c0b4-47e8-aa6a-4ee34fc6be6f",
  "itemTotalPrice":8}
]},
  {orderId: "3", date: "10/7/2023", amount: "1000", Status: "Paid",
  items: [{"id":"8d2579fc-bd3a-4df0-bde5-8884bcbd2919",
  "name":"肉眼牛排",
  "subtotal":1,
  "image":"https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
  "quantity":5,
  "attributeSelected":{"Weight":["18 oz","20oz"],"size":"bg"},
  "count":"9224d939-2223-4820-b802-f61ddd9b2879",
  "itemTotalPrice":90,
  "cancel":"true"},
  {"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46",
  "name":"宫保鸡丁",
  "subtotal":"1",
  "image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666",
  "quantity":4,
  "attributeSelected":{"size":["big"]},
  "count":"81e85da6-c0b4-47e8-aa6a-4ee34fc6be6f",
  "itemTotalPrice":8}
]}
];

const Test_Notification_Page = () => {

  // const exampleJSON = [{orderId: "1", date: "10/7/2023", amount: "100", Status: "Review"},{orderId: "2", date: "10/7/2023", amount: "300", Status: "Review"},{orderId: "3", date: "10/7/2023", amount: "1000", Status: "Paid"}]

  const [sortedData, setSortedData] = useState(exampleJSON);

  var reviewCount = sortedData.filter(item => item.Status === "Review").length;

  const statusPriority = {
    "Review": 1,
    "Pending": 2,
    "Failed": 3,
    "Paid": 4
  };

  const [triggerSort, setTriggerSort] = useState(false);

  function clickConfirm(orderId) {
      const updatedData = sortedData.map(item => {
          if (item.orderId === orderId && item.Status === "Review") {
              return { ...item, Status: "Pending" };
          }
          return item;
      });
      reviewCount = sortedData.filter(item => item.Status === "Review").length;
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
    switch(status) {
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
 
  function getNumberUnderReview () {
    const reviewCount = exampleJSON.filter(item => item.Status === "Review").length;
    return reviewCount
  }

  function deleteItem(orderId) {
    const updatedData = sortedData.filter(item => item.orderId !== orderId);
    setSortedData(updatedData);
    setTriggerSort(prev => !prev); // flip the value to trigger sorting
}


//   function clickConfirm(orderId) {
//     const updatedData = sortedData.map(item => {
//         if (item.orderId === orderId && item.Status === "Review") {
//             return { ...item, Status: "Pending" };
//         }
//         return item;
//     });
//     setSortedData(updatedData);
// }

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
    {reviewCount}
</span></h5>
          </div>
          <div class="table-responsive">
            <table class="table table-hover table-nowrap">
              <thead class="table-light">
                <tr>
                  <th scope="col">Number</th>
                  <th scope="col">OrderID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  {/* <th scope="col">Meeting</th> */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
              {sortedData.map((order, index) => (
                <>
          <tr key={order.orderId}>
          <td>
          {index + 1} {/* Adding 1 because index starts from 0 */}
            </td>
            <td>
              <a className="text-heading font-semibold" href="#">
                {order.orderId}
              </a>
            </td>
            <td>
              {order.date}
            </td>
            <td>
              ${order.amount}
            </td>
            <td>
              <span className="badge badge-lg badge-dot">
                <i className={`bg-${getBadgeColor(order.Status)}`}></i>{order.Status}
              </span>
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
              <button type="button" className="btn btn-sm btn-neutral text-danger-hover" onClick={() => deleteItem(order.orderId)}>
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
            </tr>
          )}
          </>
        ))}
              </tbody>
            </table>
          </div>
          <div class="card-footer border-0 py-5">
            <span class="text-muted text-sm">Showing {exampleJSON.length <= 10 ? exampleJSON.length : "10" } items out of {exampleJSON.length} results found</span>
          </div>
        </div>
      </div>
  );
}

export default Test_Notification_Page;