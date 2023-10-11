import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaymentComponent = ({chargeAmount, connected_stripe_account_id, readerId, locationId}) => {

  // the three variables we keep track of for payment
  var paymentIntentId;

 console.log(connected_stripe_account_id)
 console.log(readerId)
 console.log(locationId)
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
          reader_id: readerId,
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
          reader_id: readerId,
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
        body: JSON.stringify({ reader_id: readerId, connected_stripe_account_id: connected_stripe_account_id}),
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
      let amount = chargeAmount;
  
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
      cancelPaymentButton.className = "btn btn-primary";
      cancelPaymentButton.disabled = false;
    }
  }
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-sm-6 offset h-100">        

          <div class="row margin pad">
            <button id="create-payment-button" className="btn btn-primary" style={{marginBottom: "10px"}} onClick={makePayment}>
              Process Payment
            </button>
          </div>

          <div class="row margin pad">
            <button id="cancel-payment-button" className="btn btn-primary" onClick={cancelPayment}>
              Cancel payment
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;