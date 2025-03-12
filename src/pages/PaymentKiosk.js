import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUserContext } from "../context/userContext";
import { useState, useEffect } from 'react';
import { doc, addDoc, collection, setDoc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firebase/index';
import myImage from '../components/check-mark.png';
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { lookup } from 'zipcode-to-timezone';

const PaymentComponent = ({ openCheckout, storeID, chargeAmount, connected_stripe_account_id, receipt_JSON, selectedTable, service_fee, forceCancel }) => {
    function getTimeZoneByZip(zipCode) {
        // Use the library to find the timezone ID from the ZIP code
        const timeZoneId = lookup(zipCode);
    
        // Check if the timezone ID is in our timeZones list
        return timeZoneId;
      }
      //console.log("timezone")
      //console.log(getTimeZoneByZip("94133"))//"America/Los_Angeles"
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
            const functions = getFunctions();
            const createPaymentIntentFunction = httpsCallable(functions, 'createPaymentIntent');
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
            throw error;
        }
    }

    async function processPayment(amount) {
        console.log("processPayment");
        try {
            const functions = getFunctions();
            const processPaymentFunction = httpsCallable(functions, 'processPayment');

            const response = await processPaymentFunction({
                reader_id: selectedId,
                payment_intent_id: paymentIntentId,
                connected_stripe_account_id: connected_stripe_account_id,
                amount: amount
            });

            console.log("the response was okay");
            return response.data;
        } catch (error) {
            console.error("There was an error with processPayment:", error.message);
            throw error;
        }
    }

    async function cancel(readerId) {
        console.log("cancel");
        try {
            const functions = getFunctions();
            const cancelActionFunction = httpsCallable(functions, 'cancelAction');

            const response = await cancelActionFunction({
                reader_id: readerId,
                connected_stripe_account_id: connected_stripe_account_id,
                storeID: storeID
            });

            console.log("the response was okay");
            return response.data;

        } catch (error) {
            throw error;
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
        const docRef = doc(db, 'stripe_customers', user?.uid, 'TitleLogoNameContent', storeID, 'kiosk', currentHash?.slice(1));
        
        getDoc(docRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const readId = data.readerId;
                    setSelectedId(readId);
                    cancelPayment(readId);
                } else {
                    console.log("No such document!");
                }
            })
            .catch(error => {
                console.error("Error getting document:", error);
            });
    }, [currentHash, openCheckout]);


    useEffect(() => {
        const q = query(
            collection(db, 'stripe_customers', user?.uid, 'TitleLogoNameContent', storeID, 'success_payment'),
            where('id', '==', intent),
            where('status', '==', 'succeeded')
        );

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            const newTerminalsData = snapshot.docs.map((doc) => ({
                docuId: doc.id,
                ...doc.data(),
            }));

            console.log("hello");
            console.log(newTerminalsData);
            if (newTerminalsData.length > 0) {
                setReceived(true);
                const dateTime = new Date().toISOString();
                const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
                
                // Add documents to collections
                addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "SendToKitchen"), {
                    date: date,
                    data: JSON.parse(receipt_JSON),
                    selectedTable: selectedTable
                })
                .then(docRef => {
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(error => {
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
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(error => {
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
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                });

                setDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "PendingDineInOrder", newTerminalsData[0].docuId), {
                    store: storeID,
                    stripe_account_store_owner: user.uid,
                    items: JSON.parse(receipt_JSON),
                    date: parseDateUTC(date,getTimeZoneByZip(JSON.parse(sessionStorage.getItem("TitleLogoNameContent")).ZipCode)),
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

        return () => unsubscribe();
    }, [intent]);


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