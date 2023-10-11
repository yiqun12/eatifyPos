import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaymentComponent = ({connected_stripe_account_id, readerId, locationId}) => {

  // the three variables we keep track of for payment
  // TODO: Save these two values to somewhere so no need to
  var locationId;
  var readerId;
  var connected_stripe_account_id;

  var paymentIntentId;


  var simulation_mode;


  // the functions to the server
  async function createLocation(payloadLocation) {
    try {
    const formattedPayload = {
      connected_stripe_account_id: payloadLocation.stripeID,
      display_name: payloadLocation.storeDetails.name,
      address: { 
        line1: payloadLocation.storeDetails.address.street,
        city: payloadLocation.storeDetails.address.city,
        state: payloadLocation.storeDetails.address.state,
        country: payloadLocation.storeDetails.address.country,
        postal_code: payloadLocation.storeDetails.address.zip,
      }
    };

    connected_stripe_account_id = payloadLocation.stripeID;

    const response = await fetch("http://localhost:4242/create_location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formattedPayload)
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(responseData.error);
  }

  console.log("the response was okay");

  return await response.json();
}
catch (error) {
  console.error("There was an error with createLocation:", error.message);
  throw error; // rethrow to handle it outside of the function or display to user
}
  }
  
  
  async function createReader(payloadReader) {
    try {
      const response = await fetch("http://localhost:4242/register_reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: locationId, terminal_code: payloadReader.terminalRegistrationCode, connected_stripe_account_id: connected_stripe_account_id }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
    }

    console.log("the response was okay");

    return await response.json();
}
catch (error) {
    console.error("There was an error with createReader:", error.message);
    throw error; // rethrow to handle it outside of the function or display to user
}
  }
  
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
  
  async function capture(paymentIntentId) {
    try {
      const response = await fetch("http://localhost:4242/capture_payment_intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_intent_id: paymentIntentId, connected_stripe_account_id: connected_stripe_account_id }),
      });
  
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error);
    }

    console.log("the response was okay");

    return await response.json();
}
catch (error) {
    console.error("There was an error with capture:", error.message);
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

  // the onclick reactions

  async function registerTerminal() {
    const registerTerminalButton = document.getElementById("register-terminal-button");
    registerTerminalButton.className = "loading";
    registerTerminalButton.disabled = true;
  
    try {
      const stripeID = document.getElementById("stripeID").value;
      const nameOfStore = document.getElementById("nameOfStore").value;
      const streetAddress = document.getElementById("streetAddress").value;
      const cityName = document.getElementById("cityName").value;
      const state = document.getElementById("state").value;
      const country = document.getElementById("country").value;
      const zipCode = document.getElementById("zipCode").value;
      const stripeTerminalRegistrationCode = document.getElementById("stripeTerminalRegistrationCode").value.trim();
  
      const payloadLocation = {
        stripeID: stripeID,
        storeDetails: {
          name: nameOfStore,
          address: {
            street: streetAddress,
            city: cityName,
            state: state,
            country: country,
            zip: zipCode
          }
        }
      }
  
      const location = await createLocation(payloadLocation);
      console.log("registered location at: ", location);
      locationId = location["id"]
  
      const payloadReader = {
        terminalRegistrationCode: stripeTerminalRegistrationCode,
        connected_stripe_account_id: stripeID
      }

      // if registration code is simulated-wpe, its not live mode
      if (stripeTerminalRegistrationCode === "simulated-wpe") {
        simulation_mode = true;
      } else {
        simulation_mode = false;
      }
      const reader = await createReader(payloadReader);
      console.log("registered reader: ", reader);
      readerId = reader["id"]
  
    } catch (error) {
      console.error("Error in registerTerminal: ", error.message);
    } finally {
      registerTerminalButton.className = "btn btn-primary";
      registerTerminalButton.disabled = false;
    }
  }
  
  async function makePayment() {
    const createPaymentButton = document.getElementById("create-payment-button");
    createPaymentButton.className = "loading";
    createPaymentButton.disabled = true;
  
    try {
      let amount = document.getElementById("amount-input").value;
  
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

          <div class="row margin pad text">Enter an amount</div>
          <div class="row pad">
            <div class="">
              <input id="amount-input" type="text"/> 
            </div>
          </div>

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