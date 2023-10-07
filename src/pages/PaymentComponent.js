import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaymentComponent = () => {

  // the three variables we keep track of for payment
  var locationId;
  var readerId;
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
        body: JSON.stringify({ location_id: locationId, terminal_code: payloadReader.terminalRegistrationCode }),
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
        body: JSON.stringify({ amount: amount }),
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
        body: JSON.stringify({ payment_intent_id: paymentIntentId }),
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
        body: JSON.stringify({ reader_id: readerId, }),
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
      const simulatedPayment = await simulatePayment();
      console.log("simulated payment at: ", simulatedPayment);
  
      const capturedPayment = await capture(paymentIntent.id);
      console.log("payment is captured: ", capturedPayment);
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
          <div className="row title">Create a simulated reader</div>


          {/* bootstrap input fields */}

          
          <div className="form-group">
            <label>Stripe connected Account ID:</label>
            <input
              type="text"
              className="form-control"
              id="stripeID"
              placeholder="acct_1NxNJkBDENUkuYSK"
            />

            <label htmlFor="streetAddress">Street Address:</label>
            <input
              type="text"
              className="form-control"
              id="nameOfStore"
              placeholder="store name"
            />
            <input
              type="text"
              className="form-control"
              id="streetAddress"
              placeholder="street sddress"
            />
            <input
              type="text"
              className="form-control"
              id="cityName"
              placeholder="city name"
            />
            <input
              type="text"
              className="form-control"
              id="state"
              placeholder="state"
            />
            <input
              type="text"
              className="form-control"
              id="country"
              placeholder="country"
            />
            <input
              type="text"
              className="form-control"
              id="zipCode"
              placeholder="zip code"
            />
          </div>

          <label>Stripe Terminal Registration code:</label>
            <input
              type="text"
              className="form-control"
              id="stripeTerminalRegistrationCode"
              placeholder="simulated-wpe"
            />

          <div className="row margin pad">

            <button className="btn btn-primary" id="register-terminal-button" onClick={registerTerminal}>
              Register the terminal
              {/* <div className="spinner hidden"></div> */}
              {/* <svg className="right-arrow" aria-hidden="true" height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"> */}
                {/* <path d="M5.293 2.709A1 1 0 0 1 6.71 1.293l6.3 6.3a1 1 0 0 1 0 1.414l-6.3 6.3a1 1 0 0 1-1.416-1.416L10.884 8.3z" fill-rule="evenodd"></path> */}
              {/* </svg> */}
            </button>

          </div>

          <div class="row title">Simulate a transaction</div>
          <div class="row margin pad text">Enter an amount</div>
          <div class="row pad">
            <div class="">
              <input id="amount-input" type="text"/> 
            </div>
          </div>

          <div class="row margin pad">
            <button id="create-payment-button" className="btn btn-primary" style={{marginBottom: "10px"}} onClick={makePayment}>
              Process Payment
              {/* <div class="spinner hidden"></div>
              <svg class="right-arrow" aria-hidden="true" height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.293 2.709A1 1 0 0 1 6.71 1.293l6.3 6.3a1 1 0 0 1 0 1.414l-6.3 6.3a1 1 0 0 1-1.416-1.416L10.884 8.3z" fill-rule="evenodd"></path>
              </svg> */}
            </button>
          </div>

          <div class="row margin pad">
            <button id="cancel-payment-button" className="btn btn-primary" onClick={cancelPayment}>
              Cancel payment
              {/* <div class="spinner hidden"></div>
              <svg class="right-arrow" aria-hidden="true" height="16" width="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.293 2.709A1 1 0 0 1 6.71 1.293l6.3 6.3a1 1 0 0 1 0 1.414l-6.3 6.3a1 1 0 0 1-1.416-1.416L10.884 8.3z" fill-rule="evenodd"></path>
              </svg> */}
            </button>
          </div>


          {/* ...similarly define other buttons... */}
        </div>
        <div className="col-sm-6 h-100 log-col">
          <div className="row title">Logs</div>
          <div className="row">
            <div className="col-sm-12" id="logs"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentComponent;