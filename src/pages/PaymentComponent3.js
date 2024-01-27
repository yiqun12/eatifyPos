import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserContext } from "../context/userContext";
import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import myImage from '../components/check-mark.png';  // Import the image
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';

const PaymentComponent = ({ setDiscount,setTips,setExtra,setInputValue,setProducts, setIsPaymentClick, isPaymentClick, received, setReceived, selectedTable, storeID, chargeAmount, connected_stripe_account_id, discount, service_fee,checkout_JSON,totalPrice }) => {
    // State to store the error message
    const [error, setError] = useState(null);


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
        amount:amount
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
        connected_stripe_account_id: connected_stripe_account_id
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
    createPaymentButton.textContent = "Awaiting for Process. Do not close window."; // Change button text
    createPaymentButton.className = "loading";
    createPaymentButton.disabled = true;
    setIsPaymentClick(true);
    console.log(localStorage.getItem(storeID + "-" + selectedTable) !== null ? localStorage.getItem(storeID + "-" + selectedTable) : "[]");

    try {
      let amount = Math.round(chargeAmount * 100);
      const paymentIntent = await createPaymentIntent(amount, JSON.stringify(checkout_JSON));
      console.log("payment intent: ", paymentIntent);
      paymentIntentId = paymentIntent["id"];
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
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('TitleLogoNameContent')
      .doc(storeID)
      .collection('terminals')
      .onSnapshot((snapshot) => {

        const terminalsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));


        setItems(terminalsData.sort((a, b) => b.date.localeCompare(a.date)))
        console.log(terminalsData)
        setSelectedId(terminalsData[0].id)
      });
  }, [])


  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('TitleLogoNameContent')
      .doc(storeID)
      .collection('success_payment')
      .where('id', '==', intent)
      .where('status', '==', 'succeeded')
      .onSnapshot((snapshot) => {
        const newTerminalsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
        }));

        console.log("hello");
        console.log(newTerminalsData);
        if (newTerminalsData.length === 0) {
          // newTerminalsData is an empty array
          setReceived(false)
          //console.log("newTerminalsData is empty");
        } else {
          setReceived(true)
          setExtra(0)
          setInputValue("")
          setDiscount("")
          setTips("")
          setProducts([]);
          // newTerminalsData is not empty
          //console.log("newTerminalsData is not empty");
        }
      });

    // Return a cleanup function to unsubscribe from the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, [intent]); // Remove the empty dependency array to listen to real-time changes


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
            <span>No Pos Machine Was Registered</span>
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
                      POS Machine No.{index + 1} --- Added in {formatDate(item.date)}
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
              {error && <p style={{color: 'red'}}>Read this carefully and retry: {error}</p>}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;