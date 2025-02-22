import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserContext } from "../context/userContext";
import { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import myImage from '../components/check-mark.png';  // Import the image
import { doc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase/index'; // Make sure to import necessary functions
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

const PaymentComponent = ({ openCheckout, storeID, chargeAmount, connected_stripe_account_id, receipt_JSON, selectedTable, service_fee, forceCancel }) => {
    console.log("hello")
    const [currentHash, setCurrentHash] = useState(window.location.hash ? window.location.hash : "abc");

    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash);
        };
        console.log(currentHash)
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []); // Empty array means this effect runs only on mount and unmount
    useEffect(() => {
        if (selectedId !== "") {
            cancel(selectedId)

        } else {
            console.log("hey")
        }
        console.log(chargeAmount)
    }, [chargeAmount]); // Empty array means this effect runs only on mount and unmount
    //console.log(currentHash)
    // State to store the error message
    const [received, setReceived] = useState(false);

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
                discount: 0,
                service_fee: service_fee,
                mode: "kiosk"
            });

            console.log("the response was okay");
            return response.data;

        } catch (error) {
            console.error("There was an error with createPaymentIntent:", error.message);
            //setError("There was an error with createPaymentIntent:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }
    //To Do: set Error

    async function processPayment(amount) {
        console.log("processPayment");
        try {
            const processPaymentFunction = firebase.functions().httpsCallable('processPayment');

            const response = await processPaymentFunction({
                reader_id: selectedId,
                payment_intent_id: paymentIntentId,
                connected_stripe_account_id: connected_stripe_account_id,
                amount: amount//tipping base on this amount
            });

            console.log("the response was okay");
            return response.data;
        } catch (error) {
            //setError("There was an error with processPayment:", error.message);
            console.error("There was an error with processPayment:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }



    async function cancel(readerId) {
        console.log("cancel");
        try {
            const cancelActionFunction = firebase.functions().httpsCallable('cancelAction');

            const response = await cancelActionFunction({
                reader_id: readerId,
                connected_stripe_account_id: connected_stripe_account_id,
                storeID: storeID
            });

            console.log("the response was okay");
            return response.data;

        } catch (error) {
            // setError("There was an error with cancel:", error.message);
            // console.error("There was an error with cancel:", error.message);
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
        console.log("chargeamount")
        console.log(chargeAmount)

        try {
            let amount = Math.round(chargeAmount * 100);
            const paymentIntent = await createPaymentIntent(amount, receipt_JSON);
            console.log("payment intent: ", paymentIntent);
            paymentIntentId = paymentIntent["id"];
            //const reader = await processPayment(amount);
            const reader = await processPayment(amount);
            console.log("payment processed at reader: ", reader);

            if (simulation_mode == true) {
                // const simulatedPayment = await simulatePayment();
                // console.log("simulated payment at: ", simulatedPayment);
            }
            console.log("intents" + paymentIntentId);
            setIntent(paymentIntentId);

        } catch (error) {
            console.error("Error in makePayment: ", error.message);
            //setError("Error in makePayment: ", error.message);

        } finally {
            createPaymentButton.className = "btn btn-primary";
            createPaymentButton.disabled = false;
            createPaymentButton.textContent = originalButtonText; // Reset button text
        }
    }


    useEffect(() => {
        console.log(currentHash?.slice(1));
        firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user?.uid)
            .collection('TitleLogoNameContent')
            .doc(storeID)
            .collection('kiosk')
            .doc(currentHash?.slice(1))
            .get()
            .then((snapshot) => {
                if (snapshot.exists) {
                    const data = snapshot.data(); // Get the document data
                    const readId = data.readerId; // Assuming 'readId' is the field you want

                    // Now you can use the readId for something, like setting state
                    setSelectedId(readId); // As an example, if you want to set it as selectedId
                    // console.log(readId); // Log the readId or do something with it
                    cancelPayment(readId)
                } else {
                    console.log("No such document!");
                }
            })
            .catch(error => {
                console.error("Error getting document:", error);
            });

        // Since there's no subscription, no need to return a cleanup function here
    }, [currentHash, openCheckout]); // Include dependencies here


    useEffect(() => {
        const unsubscribe = firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user?.uid)
            .collection('TitleLogoNameContent')
            .doc(storeID)
            .collection('success_payment')
            .where('id', '==', intent)
            .where('status', '==', 'succeeded')
            .onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
                const newTerminalsData = snapshot.docs.map((doc) => ({
                    docuId: doc.id, // This will include the document ID in the resulting object
                    ...doc.data(),
                }));

                console.log("hello");
                console.log(newTerminalsData);
                if (newTerminalsData.length === 0) {

                    // newTerminalsData is an empty array
                    //console.log("newTerminalsData is empty");
                } else {
                    setReceived(true)
                    const dateTime = new Date().toISOString();
                    const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
                    // Add a document to the collection
                    addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "SendToKitchen"), {
                        date: date,
                        data: JSON.parse(receipt_JSON),
                        selectedTable: selectedTable
                    })
                        .then(docRef => {
                            // This function is called when the document has been successfully written to the database
                            console.log("Document written with ID: ", docRef.id);
                        })
                        .catch(error => {
                            // This function is called when there's an error adding the document
                            console.error("Error adding document: ", error);
                        });
                    addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "CustomerReceipt"), {
                        date: date,
                        data: JSON.parse(receipt_JSON),
                        selectedTable: selectedTable,
                        discount: 0,
                        service_fee: service_fee,
                        total: chargeAmount,
                    })
                        .then(docRef => {
                            // This function is called when the document has been successfully written to the database
                            console.log("Document written with ID: ", docRef.id);
                        })
                        .catch(error => {
                            // This function is called when there's an error adding the document
                            console.error("Error adding document: ", error);
                        });
                    addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "MerchantReceipt"), {
                        date: date,
                        data: JSON.parse(receipt_JSON),
                        selectedTable: selectedTable,
                        discount: 0,
                        service_fee: service_fee,
                        total: chargeAmount,
                    })
                        .then(docRef => {
                            // This function is called when the document has been successfully written to the database
                            console.log("Document written with ID: ", docRef.id);
                        })
                        .catch(error => {
                            // This function is called when there's an error adding the document
                            console.error("Error adding document: ", error);
                        });
                    setDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "PendingDineInOrder", newTerminalsData[0].docuId), {
                        store: storeID,
                        stripe_account_store_owner: user.uid,
                        items: JSON.parse(receipt_JSON),
                        date: parseDateUTC(date,'America/Los_Angeles'),
                        amount: chargeAmount,
                        Status: "Paid", // Assuming "NO USE" is a comment and not part of the value
                        table: selectedTable,
                        username: "kiosk",
                    }).then(() => {
                        sessionStorage.removeItem(storeID);

                        window.location.href = '/store?store=' + storeID + '&order=' + newTerminalsData[0].docuId + '&modal=true' + currentHash
                    }).catch((error) => {
                        console.error("Error writing document: ", error);

                    });
                }
            });

        // Return a cleanup function to unsubscribe from the snapshot listener when the component unmounts
        return () => unsubscribe();
    }, [intent]); // Remove the empty dependency array to listen to real-time changes


    async function cancelPayment(readerId) {
        console.log("cancel")
        try {
            const reader = await cancel(readerId);
            console.log("canceled payment at: ", reader);
        } catch (error) {
            console.log()
            // setError("Error in Reset Terminal. ", error.message);
            console.error("Error in Reset Terminal. ", error);
        } finally {

        }
    }


    return (
        <>

            {(received) ?

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
                </div> :
                <div>
                    <button
                        id="create-payment-button"
                        onClick={makePayment}
                        name="pay"
                        class="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium px-5 py-2.5 text-center mr-2 mb-2"
                        style={{ "borderRadius": "0.2rem", width: "100%" }}
                    >
                        <div> &nbsp;Pay by Kiosk
                        </div>
                    </button>
                </div>
            }
            {error && <p style={{ color: 'red' }}>Ask the staff for help if you cannot pay by credit card reader: {error}</p>}

        </>
    );
}

export default PaymentComponent;