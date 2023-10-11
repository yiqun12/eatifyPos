import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { db } from '../firebase/index'; // Make sure to import necessary functions
import { useUserContext } from "../context/userContext";
import { doc, collection, setDoc, getDoc } from 'firebase/firestore';

const PaymentComponent = ({storeDisplayName, storeID, connected_stripe_account_id }) => {
  const country = 'US'
  // the three variables we keep track of for payment
  // TODO: Save these two values to somewhere so no need to
  var locationId;
  var readerId;
  //var connected_stripe_account_id;

  var paymentIntentId;
  const { user, user_loading } = useUserContext();

  const [error, setError] = useState("");
  var simulation_mode;


  // the functions to the server
  async function createLocation(payloadLocation) {
    try {
      const formattedPayload = {
        connected_stripe_account_id: connected_stripe_account_id,
        display_name: payloadLocation.storeDetails.name,
        address: {
          line1: payloadLocation.storeDetails.address.street,
          city: payloadLocation.storeDetails.address.city,
          state: payloadLocation.storeDetails.address.state,
          country: country,
          postal_code: payloadLocation.storeDetails.address.zip,
        }
      };

      connected_stripe_account_id = connected_stripe_account_id;

      const response = await fetch("http://localhost:4242/create_location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formattedPayload)
      });

      if (!response.ok) {
        const responseData = await response.json();
        setError(responseData.error)
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      setError("There was an error with createLocation:" + error.message)
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
        setError(responseData.error)
        throw new Error(responseData.error);
      }

      console.log("the response was okay");

      return await response.json();
    }
    catch (error) {
      setError("There was an error with createReader:", error.message)
      console.error("There was an error with createReader:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }

  // the onclick reactions

  async function registerTerminal() {
    const registerTerminalButton = document.getElementById("register-terminal-button");
    registerTerminalButton.className = "loading";
    registerTerminalButton.disabled = true;
    try {
      //const stripeID = document.getElementById("stripeID").value;
      const nameOfStore = document.getElementById("nameOfStore").value;
      const streetAddress = document.getElementById("streetAddress").value;
      const cityName = document.getElementById("cityName").value;
      const state = document.getElementById("state").value;
      const zipCode = document.getElementById("zipCode").value;
      const stripeTerminalRegistrationCode = document.getElementById("stripeTerminalRegistrationCode").value.trim();

      const payloadLocation = {
        stripeID: connected_stripe_account_id,
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
      //console.log("registered location at: ", location);
      locationId = location["id"]

      const payloadReader = {
        terminalRegistrationCode: stripeTerminalRegistrationCode,
        connected_stripe_account_id: connected_stripe_account_id
      }

      // if registration code is simulated-wpe, its not live mode
      if (stripeTerminalRegistrationCode === "simulated-wpe") {
        simulation_mode = true;
      } else {
        simulation_mode = false;
      }
      const reader = await createReader(payloadReader);
      //console.log("registered reader: ", reader);
      readerId = reader["id"]
      let docRef;

      try {
        docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "terminals",stripeTerminalRegistrationCode)
        const doc_ = await getDoc(docRef);
  
        if (doc_.exists()) {
          console.log("Document exists!");
          throw new Error('Document already exists!');
        } else {
          docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "terminals",stripeTerminalRegistrationCode)
  
          // If the document doesn't exist, add a new one
          const dateTime = new Date().toISOString();
          const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

          const newDoc = {
            locationId: locationId,
            readerId: readerId,
            isActive: true,
            date: date
          };
      
          try {
            await setDoc(docRef, newDoc);  // We use setDoc since we're specifying the document ID (storeName)
            alert("Terminal registers successfully");
          } catch (error) {
            setError("Error adding document: ");
            throw new Error("")
          }      
        }
      } catch (error) {
        setError(`Error`);
        console.error(error);
      }

      
    } catch (error) {
      setError("Error in registerTerminal: " + error.message)
      console.error("Error in registerTerminal: ", error.message);
      throw new Error(error.message);

    } finally {
      registerTerminalButton.className = "btn btn-primary";
      registerTerminalButton.disabled = false;
    }


  }

  return (
    <>
      <form className="form-group">
        <div className="w-full mb-2" >
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2" htmlFor="streetAddress">
                Store Display Name
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                id="nameOfStore"
                type="text"
                placeholder= {storeDisplayName}
              />
            </div>
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2">
                Store Location Address:
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                id="streetAddress"
                type="text"
                placeholder="street sddress"
              />
            </div>
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2">
                City:
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="cityName"
                type="text"
                placeholder="city name"
              />
            </div>
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2">
                State:
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="state"
                type="text"
                placeholder="state"
              />
            </div>
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2">
                Zip Code:
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="zipCode"
                type="text"
                placeholder="zip code"
              />
            </div>
            <div className="w-full px-3">
              <label className="text-gray-700 mt-3 mb-2">
                Unique Stripe Terminal Registration code:
              </label>
              <input
                className="form-control appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="stripeTerminalRegistrationCode"
                type="text"
                placeholder="Unique Stripe Terminal Registration code"
              />
            </div>
          </div>
          <div style={{ color: 'red' }}>{error}</div>
          <div className="flex mt-3">
            <div style={{ width: "50%" }}></div>
            <div className="flex justify-end" style={{ margin: "auto", width: "50%" }}>
              <button id="register-terminal-button" onClick={registerTerminal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >Register POS Machine</button>

            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default PaymentComponent;