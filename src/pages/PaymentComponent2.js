import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserContext } from "../context/userContext";
import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';

const PaymentComponent = ({ storeID, chargeAmount, connected_stripe_account_id }) => {

  // the three variables we keep track of for payment
  var paymentIntentId;
  const { user, user_loading } = useUserContext();

  //  console.log(connected_stripe_account_id)
  //  console.log(readerId)
  //  console.log(locationId)

  console.log()



  var simulation_mode;

  async function createPaymentIntent(amount) {
    try {
      const response = await fetch("http://localhost:4242/create_payment_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount, connected_stripe_account_id: connected_stripe_account_id }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      console.error("There was an error with createPaymentIntent:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }

  async function processPayment() {
    try {
      const response = await fetch("http://localhost:4242/process_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reader_id: items.find(item => item.id === selectedId).readerId,
          payment_intent_id: paymentIntentId,
          connected_stripe_account_id: connected_stripe_account_id
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      console.error("There was an error with processPayment:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }

  async function simulatePayment() {
    try {
      const response = await fetch("http://localhost:4242/simulate_payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reader_id: items.find(item => item.id === selectedId).readerId,
          connected_stripe_account_id: connected_stripe_account_id
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      console.error("There was an error with simulatePayment:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }


  async function cancel() {
    try {
      const response = await fetch("http://localhost:4242/cancel_action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reader_id: items.find(item => item.id === selectedId).readerId, connected_stripe_account_id: connected_stripe_account_id }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      console.error("There was an error with cancel:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }


  async function makePayment() {
    const createPaymentButton = document.getElementById("create-payment-button");
    createPaymentButton.className = "loading";
    createPaymentButton.disabled = true;

    try {
      let amount = chargeAmount*100;

      const paymentIntent = await createPaymentIntent(amount);
      console.log("payment intent: ", paymentIntent);
      paymentIntentId = paymentIntent["id"]

      const reader = await processPayment();
      console.log("payment processed at reader: ", reader);

      if (simulation_mode == true) {
        const simulatedPayment = await simulatePayment();
        console.log("simulated payment at: ", simulatedPayment);
      }
      // const simulatedPayment = await simulatePayment();
      // console.log("simulated payment at: ", simulatedPayment);

      // const capturedPayment = await capture(paymentIntent.id);
      // console.log("payment is captured: ", capturedPayment);
    } catch (error) {
      console.error("Error in makePayment: ", error.message);
    } finally {
      createPaymentButton.className = "btn btn-primary";
      createPaymentButton.disabled = false;
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

  const [selectedId, setSelectedId] = useState("");

  // Function to format date string into human-readable format
  const formatDate = (dateString) => {
    const dateParts = dateString.split('-');
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    return formattedDate;
  };

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="offset h-100">
          {items.length === 0 ?
            <></>
            :
            <>
              <div>
                <label className="text-gray-700 mt-3 mb-2" htmlFor="storeName">
                  Select your terminal:
                </label>
                {items.map(item => (
                  <div key={item.id}>
                    <label className='flex'>
                      <input
                        className='form-check-input'
                        type="checkbox"
                        name="dataItem"
                        style={{ marginRight: "5px" }}
                        value={item.id}
                        checked={selectedId === item.id}
                        onChange={() => setSelectedId(item.id)}
                      />
                      {item.id}  ({formatDate(item.date)})
                    </label>
                  </div>
                ))}
              </div>
              <div class="mt-2 row margin pad">
                <button id="create-payment-button" className="btn btn-primary" onClick={makePayment}>
                  Process Payment {chargeAmount}
                </button>
              </div>

              <div class="mt-2 row margin pad">
                <button id="cancel-payment-button" className="btn btn-danger" onClick={cancelPayment}>
                  Cancel payment
                </button>
              </div>
            </>
          }




        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;