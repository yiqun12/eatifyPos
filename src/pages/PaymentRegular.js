import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserContext } from "../context/userContext";
import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import myImage from '../components/check-mark.png';  // Import the image
import { collection, doc, setDoc,query, where, onSnapshot} from "firebase/firestore";
import { db } from '../firebase/index';
import { MemberPaymentAPI } from '../components/Member/memberUtils';

const PaymentComponent = ({ setDiscount, setTips, setExtra, setInputValue, setProducts, setIsPaymentClick, isPaymentClick, received, setReceived, selectedTable, storeID, chargeAmount, connected_stripe_account_id, discount, service_fee, totalPrice, memberBalanceUsage, setMemberBalanceUsage }) => {
  // State to store the error message
  const [error, setError] = useState(null);

  //setDiscount,setTips,setExtra(null),setExtra,setInputValue 
  // the three variables we keep track of for payment
  var paymentIntentId;
  const { user, user_loading } = useUserContext();

  var simulation_mode;

  async function createPaymentIntent(amount, receipt_JSON) {
    console.log("createPaymentIntent");

    try {
      const createPaymentIntentFunction = firebase.functions().httpsCallable('createPaymentIntent');
      const response = await createPaymentIntentFunction({
        amount: amount,
        connected_stripe_account_id: connected_stripe_account_id,
        receipt_JSON: receipt_JSON,
        storeID: storeID,
        selectedTable: selectedTable,
        uid: user.uid,
        user_email: user.email,
        discount: discount,
        service_fee: service_fee,
      });

      console.log("the response was okay");
      return response.data;

    } catch (error) {
      console.error("There was an error with createPaymentIntent:", error.message);
      setError("There was an error with createPaymentIntent:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }
  //To Do: set Error

  async function processPayment(amount) {
    console.log("processPayment");

    try {
      const processPaymentFunction = firebase.functions().httpsCallable('processPayment');

      const response = await processPaymentFunction({
        reader_id: items.find(item => item.id === selectedId).readerId,
        payment_intent_id: paymentIntentId,
        connected_stripe_account_id: connected_stripe_account_id,
        amount: amount
      });

      console.log("the response was okay");
      return response.data;
    } catch (error) {
      setError("There was an error with processPayment:", error.message);
      console.error("There was an error with processPayment:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }



  async function cancel() {
    console.log("cancel");
    setIsPaymentClick(false)
    try {
      const cancelActionFunction = firebase.functions().httpsCallable('cancelAction');

      const response = await cancelActionFunction({
        reader_id: items.find(item => item.id === selectedId).readerId,
        connected_stripe_account_id: connected_stripe_account_id,
        storeID:storeID
      });

      console.log("the response was okay");
      return response.data;

    } catch (error) {
      setError("There was an error with cancel:", error.message);
      console.error("There was an error with cancel:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }

  const [intent, setIntent] = useState([])
  async function makePayment() {
    const createPaymentButton = document.getElementById("create-payment-button");
    const originalButtonText = createPaymentButton.textContent || createPaymentButton.innerText; // Store the original button text
    
    // Validate member balance before card payment if balance is being used
    if (memberBalanceUsage) {
      console.log('🔍 Validating member balance before card payment...');
      try {
        const validationResult = await MemberPaymentAPI.validateBalanceUsage(
          memberBalanceUsage.memberPhone,
          parseFloat(memberBalanceUsage.balanceToUse),
          storeID
        );
        console.log('✅ Balance validation successful before card payment:', validationResult);
      } catch (validationError) {
        console.error('❌ Balance validation failed before card payment:', validationError);
        alert('Balance validation failed: ' + validationError.message);
        return; // Stop payment if validation fails
      }
    }
    
    createPaymentButton.textContent = "Awaiting for Process. Do not close window."; // Change button text
    createPaymentButton.className = "loading";
    createPaymentButton.disabled = true;
    setIsPaymentClick(true);
    console.log(localStorage.getItem(storeID + "-" + selectedTable) !== null ? localStorage.getItem(storeID + "-" + selectedTable) : "[]");

    try {
      let amount = Math.round(chargeAmount * 100);
      const paymentIntent = await createPaymentIntent(amount, localStorage.getItem(storeID + "-" + selectedTable) !== null ? localStorage.getItem(storeID + "-" + selectedTable) : "[]");
      console.log("payment intent: ", paymentIntent);
      paymentIntentId = paymentIntent["id"];
      //const reader = await processPayment(amount);
      const reader = await processPayment(totalPrice);
      console.log("payment processed at reader: ", reader);

      if (simulation_mode == true) {
        // const simulatedPayment = await simulatePayment();
        // console.log("simulated payment at: ", simulatedPayment);
      }
      console.log("intents" + paymentIntentId);
      setIntent(paymentIntentId);

    } catch (error) {
      console.error("Error in makePayment: ", error.message);
      setError("Error in makePayment: ", error.message);

    } finally {
      createPaymentButton.className = "btn btn-primary";
      createPaymentButton.disabled = false;
      createPaymentButton.textContent = originalButtonText; // Reset button text
    }
  }




  async function cancelPayment() {
    const cancelPaymentButton = document.getElementById("cancel-payment-button");
    cancelPaymentButton.className = "loading";
    cancelPaymentButton.disabled = true;
    try {
      const reader = await cancel();
      console.log("canceled payment at: ", reader);
    } catch (error) {
      setError("Error in cancelPayment: ", error.message);

      console.error("Error in cancelPayment: ", error.message);
    } finally {
      cancelPaymentButton.className = "btn btn-danger";
      cancelPaymentButton.disabled = false;
    }
  }


  const [items, setItems] = useState([])

  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        // Correct reference to the collection
        const colRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "terminals");
  
        // Listening to real-time updates
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
          const terminalsData = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          terminalsData.sort((a, b) => b.date.localeCompare(a.date));
          setItems(terminalsData);
          console.log(terminalsData);
          if (terminalsData.length > 0) {
            setSelectedId(terminalsData[0].id);
          }
        }, (error) => {
          console.error('Error fetching terminals:', error);
        });
  
        // Returning the unsubscribe function will ensure that the subscription is canceled when the component unmounts
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up terminals listener:', error);
      }
    };
  
    fetchTerminals();
  }, []); // Make sure to include all variables used in the useEffect in the dependency array

  useEffect(() => {
    // Construct the query
    const paymentsRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);
    const successPaymentsQuery = query(
      collection(paymentsRef, "success_payment"),
      where("id", "==", intent),
      where("status", "==", "succeeded")
    );
  
    // Listen for real-time updates
    const unsubscribe = onSnapshot(successPaymentsQuery, { includeMetadataChanges: true }, (snapshot) => {
      const paymentData = snapshot.docs.map(doc => doc.data());
  
      console.log("Payment update received: ", paymentData);
      if (paymentData.length > 0) {
        // Actions if payments are found
        console.log("Payments are successful and received.");
        setReceived(true);
        setInputValue("");
        setDiscount("");
        setTips("");
        setExtra(0);
        setProducts([]);
        // Resetting or setting additional state related to the table information
        SetTableInfo(`${storeID}-${selectedTable}`, "[]");
        SetTableIsSent(`${storeID}-${selectedTable}-isSent`, "[]");
        localStorage.removeItem(`${storeID}-${selectedTable}-isSent_startTime`); // Clear start time
      } else {
        // Actions if no payments are found
        console.log("No successful payments found.");
        setReceived(false);
      }
    });
  
    return () => unsubscribe();
  }, [intent]); // Ensure dependencies are correctly listed
  
  
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

  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  const [selectedId, setSelectedId] = useState("");

  // Function to format date string into human-readable format
  const formatDate = (dateString) => {
    const dateParts = dateString.split('-');
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    return formattedDate;
  };

  return (
    <div className="">
      <div className="">
        <div >
          {items?.length === 0 ?
            <span>Merchant Does Not Have Available Credit Card Swiper</span>
            :
            <div>
              <div>
                <label className="text-gray-700 mt-1" htmlFor="storeName">
                </label>
                {items?.map((item, index) => (
                  <div key={item.id}>
                    <label className='flex'>
                      <input
                        className='form-check-input'
                        type="checkbox"
                        name="dataItem"
                        style={{ marginRight: "5px" }}
                        value={item.id}
                        checked={selectedId === item.id}
                        translate="no"
                        onChange={() => setSelectedId(item.id)}
                      />
                      POS Machine No.{items.length - index} --- Added in {formatDate(item.date)}
                    </label>
                  </div>
                ))}
              </div>


              {(isPaymentClick && received) ?

                <div>


                  <div className='mt-2' style={{ display: 'flex' }}>

                    <img className='mr-2'
                      src={myImage}  // Use the imported image here
                      alt="Description"
                      style={{
                        width: '30px',
                        height: '30px',
                      }}
                    />
                    We have received the payment.</div>
                </div> : <div>

                  <div class="mt-2 row margin pad">
                    <button id="create-payment-button" className="btn btn-primary" onClick={makePayment}>
                      Process Payment
                    </button>
                  </div>
                  <div class="mt-2 row margin pad">
                    <button id="cancel-payment-button" className="btn btn-danger" onClick={cancelPayment}>
                      Reset POS Machine
                    </button>
                  </div>
                </div>


              }
              {error && <p style={{ color: 'red' }}>Read this carefully and retry: {error}</p>}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;