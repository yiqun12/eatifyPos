import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { db } from '../firebase/index'; // Make sure to import necessary functions
import { useUserContext } from "../context/userContext";
import { doc, updateDoc, arrayUnion, collection, setDoc, getDoc } from 'firebase/firestore';
import firebase from 'firebase/compat/app';

const PaymentComponent = ({ City, Address, State, ZipCode, storeDisplayName, storeID, connected_stripe_account_id }) => {
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

      const createLocationFunction = firebase.functions().httpsCallable('createLocation');
      const result = await createLocationFunction(formattedPayload);

      console.log("the response was okay:", result.data);
      return result.data;

    } catch (error) {
      setError("There was an error with createLocation: " + error.message);
      console.error("There was an error with createLocation:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }



  async function createReader(payloadReader) {
    try {
      const formattedPayload = {
        location_id: locationId,
        terminal_code: payloadReader.terminalRegistrationCode,
        connected_stripe_account_id: connected_stripe_account_id,
      };

      const registerReaderFunction = firebase.functions().httpsCallable('registerReader');
      const result = await registerReaderFunction(formattedPayload);

      console.log("the response was okay:", result.data);
      return result.data;

    } catch (error) {
      setError("There was an error with createReader: " + error.message);
      console.error("There was an error with createReader:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }


  // the onclick reactions

  async function registerTerminal() {

    let registerTerminalButton;
    registerTerminalButton = document.getElementById("register-terminal-button");
    registerTerminalButton.className = "loading";
    registerTerminalButton.disabled = true;
    registerTerminalButton.textContent = "Awaiting";
    try {
      //const stripeID = document.getElementById("stripeID").value;
      const nameOfStore = document.getElementById("nameOfStore").value || document.getElementById("nameOfStore").placeholder;
      const streetAddress = document.getElementById("streetAddress").value || document.getElementById("streetAddress").placeholder;
      const cityName = document.getElementById("cityName").value || document.getElementById("cityName").placeholder;
      const state = document.getElementById("state").value || document.getElementById("state").placeholder;
      const zipCode = document.getElementById("zipCode").value || document.getElementById("zipCode").placeholder;
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
          docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "terminals", stripeTerminalRegistrationCode)
          const doc_ = await getDoc(docRef);

          if (doc_.exists()) {
            console.log("Document exists!");
            throw new Error('Document already exists!');
          } else {
            docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "terminals", stripeTerminalRegistrationCode)

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
              setIsExpanded(false)
            } catch (error) {
              setError("Error adding document: ");
              throw new Error("")
            }
          }
        } catch (error) {
          setError(`Error`);
          console.error(error);
        }
        try {
          docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "kiosk", stripeTerminalRegistrationCode)
          const doc_ = await getDoc(docRef);

          if (doc_.exists()) {
            console.log("Document exists!");
            throw new Error('Document already exists!');
          } else {
            docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "kiosk", stripeTerminalRegistrationCode)

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
              setIsExpanded(false)
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
      });
  }, [])
  const [itemsKiosk, setItemsKiosk] = useState([])

  useEffect(() => {
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('TitleLogoNameContent')
      .doc(storeID)
      .collection('kiosk')
      .onSnapshot((snapshot) => {

        const terminalsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));


        setItemsKiosk(terminalsData.sort((a, b) => b.date.localeCompare(a.date)))
        console.log(terminalsData)
      });
  }, [])
  const formatDate = (dateString) => {
    const dateParts = dateString.split('-');
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    return formattedDate;
  };

  const [isExpanded, setIsExpanded] = useState(false);


  // State for the registration code and error message
  const [registrationCode, setRegistrationCode] = useState('');
  const [error_, setError_] = useState('');

  const registerTerminal_ = () => {
    // Check if the registration code is empty
    if (!registrationCode.trim()) {
      setError_('Stripe Terminal Registration code is required');
    } else {
      setError_('');
      registerTerminal()
      // Your code to handle the registration
    }
  };

  return (
    <div>

      <div className='mb-1' style={{ fontWeight: 'bold' }}>Available Front Desk Payment Terminal:</div>
      {items?.map((item, index) => (
        <div key={item.id}>
          <label className='flex'>
            POS Machine( {item.id}) No.{items.length - index} --- Added in {formatDate(item.date)}
          </label>
        </div>
      ))}
      <div className='mb-1' ><span style={{ fontWeight: 'bold' }}>Available Kiosk Payment Terminal:</span><span>(Tap to navigate to the kiosk page)</span></div>

      {itemsKiosk?.map((item, index) => (
        <div key={item.id}>
          <label className='flex'
            style={{ color: 'blue', "text-underline-offset": "4px", textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => window.location.href = `/store?store=${storeID}#${item.id}`}
          >
            POS Machine( {item.id}) No.{itemsKiosk.length - index} --- Added in {formatDate(item.date)}
          </label>
        </div>
      ))}

      <div>


        <div className="flex mt-3">
          <div style={{ width: "50%" }}></div>
          <div className="flex justify-end" style={{ margin: "auto", width: "50%" }}>
            {!isExpanded && (
              <button
                id="register-terminal-button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsExpanded(true)}
              >
                <i class="bi bi-arrows-expand me-2"></i>
                Register New POS Machine
              </button>
            )}

          </div>
        </div>

        {isExpanded && <form className="form-group">
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
                  translate="no"
                  placeholder={storeDisplayName}
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
                  translate="no"
                  placeholder={Address}
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
                  translate="no"
                  placeholder={City}
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
                  translate="no"
                  placeholder={State}
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
                  translate="no"
                  placeholder={ZipCode}
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
                  placeholder="Registration code from POS machine."
                  value={registrationCode}
                  translate="no"
                  onChange={e => setRegistrationCode(e.target.value)}
                />
              </div>
            </div>
            <div style={{ color: 'red' }}>{error_}</div>
            <div className="flex justify-end" >
              <button id="register-terminal-button" onClick={() => registerTerminal_()}
                className="ml-2 bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded" >Register Cashier POS Machine</button>
            </div>
          </div>
        </form>
        }
      </div>

    </div>
  );
}

export default PaymentComponent;