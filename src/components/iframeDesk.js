import React from 'react';
import './style.css';
import { useCallback, useState, useEffect } from 'react';
import { collection, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, deleteField } from "firebase/firestore";
import { db } from '../firebase/index';
import { useMyHook } from '../pages/myHook';
import Button from '@mui/material/Button';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image
import plusSvg from '../pages/plus.svg';
import minusSvg from '../pages/minus.svg';
import { useRef } from "react";
import { data_ } from '../data/data.js'
import firebase from 'firebase/compat/app';

import InStore_food from '../pages/inStore_food'
import InStore_shop_cart from '../pages/inStore_shop_cart'
import { useUserContext } from "../context/userContext";
import Dnd_Test from '../pages/dnd_test';
import { onSnapshot, query } from 'firebase/firestore';
import { forwardRef, useImperativeHandle } from 'react';


// Create a CSS class to hide overflow
const bodyOverflowHiddenClass = 'body-overflow-hidden';

const Iframe = forwardRef(({ src, width, height, storeName, title }, ref) => {
    const iframeRef = useRef();
    console.log("title", title)

    const sendMessage = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
        }
    };

    useImperativeHandle(ref, () => ({
        sendMessage,
    }));
    useEffect(() => {
        iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
    }, [title]);

    useEffect(() => {
        const fetchHtml = async () => {
            try {
                const response = await fetch(src);
                const html = await response.text();
                iframeRef.current.contentWindow.document.open();
                iframeRef.current.contentWindow.document.write(html);
                iframeRef.current.contentWindow.document.close();
            } catch (error) {
                console.error('Error fetching HTML:', error);
            }
        };

        fetchHtml();
    }, []);
    useEffect(() => {
        // existing fetchHtml logic...

        iframeRef.current.onload = () => {
            iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
        };
    }, []);
    //width
    return <iframe ref={iframeRef} title="Seat" width={width} height={height} />;
});

function App({ store, acct }) {

    const [divWidth, setDivWidth] = useState(0);
    const divRef = useRef();

    const [title, setTitle] = useState(0);



    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            // Assuming you are observing only one element
            const { width } = entries[0].contentRect;
            console.log(width)
            setDivWidth(width);
        });

        if (divRef.current) {
            resizeObserver.observe(divRef.current);
        }

        // Clean up function to stop observing the element when the component unmounts
        return () => {
            if (divRef.current) {
                resizeObserver.unobserve(divRef.current);
            }
        };
    }, []); // Empty dependency array means this effect will only run on mount and unmount


    const syncData = async () => {
        console.log("sync data")

        let sessionData;

        try {
            // Get a reference to the specific document with ID equal to store
            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

            // Fetch the document
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                // The document exists
                sessionData = docSnapshot.data().key;
                const { key, ...rest } = docSnapshot.data();
                localStorage.setItem("TitleLogoNameContent", JSON.stringify(rest));
                console.log("rest")
                console.log(rest.restaurant_seat_arrangement)
                localStorage.setItem(store + '_restaurant_seat_arrangement', rest.restaurant_seat_arrangement)
                setTitle(Math.random())
                saveId(Math.random());
            }

        } catch (error) {
            console.error("Error fetching the document:", error);
        }

    }



    useEffect(() => {
        syncData();
    }, []);

    const { user, user_loading } = useUserContext();

    const buttonStyles = {
        // Converting global and element styles to React's inline style
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        color: 'inherit',
        margin: '0',
        overflow: 'visible',
        textTransform: 'none',
        cursor: 'pointer',
        WebkitAppearance: 'button',

        // .btn styles
        display: 'inline-block',
        padding: '6px 12px',
        marginBottom: '0',
        fontWeight: '400',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        touchAction: 'manipulation',
        background: 'none',
        border: '1px solid transparent',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.42857143',
        // .btn-primary styles
        color: '#fff',
        backgroundColor: '#eea236',
        borderColor: '#eea236',

        // .btn-group-vertical>.btn, .btn-group>.btn styles
        position: 'relative',
        float: 'left',

        // .btn-group>.btn:first-child styles
        marginLeft: '12px',

        // .btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle) styles
        // Note: Pseudo selectors like :not, :last-child, etc. can't be directly translated to inline styles.
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
    };

    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);

    // for translate
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
        // const trans = sessionStorage.getItem("translations")
        //console.log(trans)
        //console.log(sessionStorage.getItem("translationsMode"))

        if (trans != null) {
            if (sessionStorage.getItem("translationsMode") != null) {
                // return the translated text with the right mode
                if (trans[text] != null) {
                    if (trans[text][sessionStorage.getItem("translationsMode")] != null)
                        return trans[text][sessionStorage.getItem("translationsMode")]
                }
            }
        }
        // base case to just return the text if no modes/translations are found
        return text
    }

    if (!sessionStorage.getItem("tableMode")) {
        sessionStorage.setItem("tableMode", "table-NaN");
    }
    if (!sessionStorage.getItem("table-NaN")) {
        sessionStorage.setItem("table-NaN", "[]");
    }
    if (!sessionStorage.getItem(sessionStorage.getItem("tableMode"))) {
        sessionStorage.setItem("table-NaN", "[]");
        sessionStorage.setItem("tableMode", "table-NaN");
    }

    const [src, setSrc] = useState(window.PUBLIC_URL + "/seat.html");
    const iframeRef = useRef(null);
    const [changeEvent, setChangeEvent] = useState("seat");


    const handleClick = () => {
        iframeRef.current.sendMessage();
        //setChangeEvent(changeEvent+1)
    };

    const SetTableInfo = async (table_name, product) => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

            const docData = { product: product, date: date };

            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
            await setDoc(docRef, docData);
            //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(product))))
            //localStorage.setItem(table_name, product)

        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    async function processPayment() {
        console.log("processPayment");

        try {
            const processPaymentFunction = firebase.functions().httpsCallable('processPayment');

            const response = await processPaymentFunction({
                keepWarm: true
            });

            console.log("the response was okay");
            return response.data;
        } catch (error) {
            console.error("There was an error with processPayment:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }



    async function cancel() {
        console.log("cancel");
        try {
            const cancelActionFunction = firebase.functions().httpsCallable('cancelAction');

            const response = await cancelActionFunction({
                keepWarm: true
            });

            console.log("the response was okay");
            return response.data;

        } catch (error) {
            console.error("There was an error with cancel:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }
    // the selectedTable variable allows you to keep track which table you have selected
    const [selectedTable, setSelectedTable] = useState("null");
    const [selectedSeatMode, setSelectedSeatMode] = useState("customer");
    // the below messageHandler + useEffect() below allows for communication from iframe to parent window
    const messageHandler = useCallback((event) => {
        // console.log(event.data);

        // the code serves to communicate with the iframe
        if (event.data.includes('selected_table')) {
            // Extract the table number after the colon and trim any whitespace
            const tableNumber = event.data.split('selected_table')[1].trim();

            // Set the table number to the selectedTable state
            setSelectedTable(tableNumber);
            console.log(tableNumber);
            setModalOpen(true);

            if (localStorage.getItem(store + "-" + tableNumber) === null) {
                // If it doesn't exist, set the value to an empty array
                //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
                SetTableInfo(store + "-" + tableNumber, JSON.stringify([]))
            }
            if (!localStorage.getItem(store + "-" + tableNumber)) {
                // If it doesn't exist, set the value to an empty array
                //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
                SetTableInfo(store + "-" + tableNumber, JSON.stringify([]))
            }
            processPayment()//kepp the cloud function warm and get ready
            cancel()//kepp the cloud function warm and get ready
        } else if (event.data === "admin mode active") {
            setSelectedSeatMode("admin");
        } else if (event.data === "customer mode active") {
            setSelectedSeatMode("customer");
            //synOldLayOut(store)
        } else if (event.data === "save mode active") {
            setSelectedSeatMode("customer");
            handleFormSubmit(store)
        } else if (event.data === "table_deselected") {
            setSelectedTable("null");
            saveId(Math.random());
            console.log(event.data)
            console.log("Table deselected");
        }
        else if (event.data === 'reload') {
            synOldLayOut(store)
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', messageHandler);

        // Remove the event listener when the component is unmounted
        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, [messageHandler]);


    useEffect(() => {
        if (iframeRef.current) {
            iframeRef.current.src = src;
        }
    }, [src]);

    //listen to table
    useEffect(() => {
        const handleIframeMessage = event => {
            const selectedNumber = event.data;
            listenNumber(selectedNumber);
        };
        window.addEventListener("message", handleIframeMessage);
        return () => {
            window.removeEventListener("message", handleIframeMessage);
        };
    }, []);
    //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
    function listenNumber(number) {
        var tableName = "table-" + parseInt(number);
        if (tableName == "table-NaN") {
            return
        }

        console.log(tableName)
        if (!sessionStorage.getItem(tableName)) {
            // Create the table if it does not exist
            console.log("creating table ", number);
            sessionStorage.setItem(tableName, "[]");
        } else {
            // Switch to the existing table
            var tableMode = sessionStorage.getItem("tableMode");
            if (tableMode == null) {
                // If tableMode does not exist, create it and set the selected table number
                sessionStorage.setItem("tableMode", tableName);
            } else {
                // If tableMode exists, update it with the selected table number
                sessionStorage.setItem("tableMode", tableName);
            }
        }
        sessionStorage.setItem("tableMode", tableName);
        saveId(Math.random());
    }

    /**admin shopping cart */
    const [count, setCount] = useState(0);

    // Function to update the state
    const reRenderDiv = () => {
        setCount(prevCount => prevCount + 1); // This will trigger a re-render
    };

    const clickedAdd = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the item in the cartItems array with the matching id
        const item = cartItems.find(item => item.id === id);

        // If the item is found, increase its quantity by 1
        if (item) {
            item.quantity += 1;
        }
        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
        // Return the updated cartItems array
        //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
    }
    const clickedMinus = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the item in the cartItems array with the matching id
        const item = cartItems.find(item => item.id === id);

        // If the item is found and its quantity is greater than 1, decrease its quantity by 1
        if (item && item.quantity > 1) {
            item.quantity -= 1;
        }
        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
        // Return the updated cartItems array
        //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
    }
    const deleteItem = (id) => {
        const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
        // Find the index of the item in the cartItems array with the matching id
        const index = cartItems.findIndex(item => item.id === id);

        // If the item is found, remove it from the cartItems array using the splice() method
        if (index !== -1) {
            cartItems.splice(index, 1);
        }

        console.log(cartItems)
        sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
    }

    const [isModalOpen, setModalOpen] = useState(false);
    function compareLayouts(layout1, layout2) {
        const getTableNames = (layout) => layout.table.map(t => t.tableName);
        const tableNames1 = getTableNames(layout1);
        const tableNames2 = getTableNames(layout2);

        const added = tableNames2.filter(name => !tableNames1.includes(name)).map(name => ({ name, change: 'added' }));
        const deleted = tableNames1.filter(name => !tableNames2.includes(name)).map(name => ({ name, change: 'deleted' }));

        return [...added, ...deleted];
    }

    const synOldLayOut = async (store) => {
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
        const old_layout = await getDoc(docRef)
        //console.log("hello")
        localStorage.setItem(store + "_restaurant_seat_arrangement", old_layout.data().restaurant_seat_arrangement)
        setTitle(Math.random())
        handleClick()
        saveId(Math.random());
    }

    const handleFormSubmit = async (store) => {

        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
        const old_layout = await getDoc(docRef)
        const combined = compareLayouts(JSON.parse(old_layout.data().restaurant_seat_arrangement), JSON.parse(localStorage.getItem(store + "_restaurant_seat_arrangement")))
        console.log(combined)
        combined.forEach(async (item) => {
            if (item.change === 'added') {
                console.log("added")
                const docRefTable_ = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", store + "-" + item.name)
                // Corrected the syntax for concatenating `store` and `item.id`
                await setDoc(docRefTable_, { product: "[]" }, { merge: true });
                console.log(`Added: ${item.name}`);
            } else if (item.change === 'deleted') {
                // Corrected the syntax here as well
                await deleteDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", store + "-" + item.name));
                console.log(`Deleted: ${item.name}`);
            }
        });
        //console.log(compareLayouts(JSON.parse(old_layout.data().restaurant_seat_arrangement), JSON.parse(localStorage.getItem(store + "_restaurant_seat_arrangement"))))

        // Update the 'key' field to the value retrieved from localStorage
        await updateDoc(docRef, {
            restaurant_seat_arrangement: localStorage.getItem(store + "_restaurant_seat_arrangement")

        });
        alert("Updated Successful");
    };

    // for split payment modal

    const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);

    const openSplitPaymentModal = () => {
        setIsSplitPaymentModalOpen(true);
        // Add a CSS class to disable body scroll
        document.body.classList.add('bodyOverflowHiddenClass');
    };

    const closeSplitPaymentModal = () => {
        setIsSplitPaymentModalOpen(false);
        // Remove the CSS class to enable body scroll
        document.body.classList.remove('bodyOverflowHiddenClass');
    };
    // const [currentTime, setCurrentTime] = useState(new Date());

    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 100); // Update every 100 milliseconds

    //     return () => {
    //         clearInterval(intervalId);
    //     };
    // }, []);
    const [width, setWidth] = useState(window.innerWidth - 64);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth - 64);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isPC = width >= 1024;

    const [view, setView] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    const [OpenChangeAttributeModal, setOpenChangeAttributeModal] = useState(false);





    return (

        <div ref={divRef}>

            <style>
                {`
          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
            </style>
            {/* beginning of the other code */}

            {true ?

                <div>

                    {isSplitPaymentModalOpen && (
                        <div
                            id="addDiscountModal"
                            className="modal fade show"
                            role="dialog"
                            style={{
                                display: 'block',
                                position: 'fixed', // Set to 'fixed' to make it stay fixed on the screen
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                backgroundColor: 'rgba(255,255,255,1)',
                                overflow: 'auto', // Use 'hidden' to prevent the modal itself from scrolling
                                zIndex: '9999',
                            }}
                        >
                            <div
                                className="modal-dialog modal-xl"
                                role="document"
                                style={{
                                    height: "80vh",
                                    margin: 'auto', // Center the modal on the screen
                                    position: 'relative', // Add relative positioning
                                }}
                            >
                                <div className="modal-content" style={{ overflowY: 'hidden' }}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Split Payment</h5>
                                    </div>
                                    <div className="modal-body">
                                        <div>Main column will be divided equally between groups, each group sums its items separately</div>
                                        {/* Set a maxHeight for the modal body */}
                                        <Dnd_Test />
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={closeSplitPaymentModal}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* split_payment modal ends here */}

                    <div className='flex flex-col' style={{ alignItems: 'flex-start' }}>

                        <div style={{ margin: "10px", display: "flex" }} >
                            <div style={{ position: 'relative' }}>


                                <Iframe className="notranslate" key={changeEvent}
                                    ref={iframeRef} src={`${process.env.PUBLIC_URL}/seat.html`} width={(divWidth) + "px"} height="800px" storeName={store}
                                    title={title} />
                                {isModalOpen && (
                                    <div id="addTableModal" className="modal fade show" role="dialog" style={{ display: 'block', position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,1)', overflow: 'hidden' }}>
                                        <div role="document" style={{ overflowY: 'hidden' }}>
                                            <div className="modal-content" style={{ overflowY: 'hidden', /* Add scrollbar styles inline */ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                                                <div className="modal-header flex p-0 pb-3">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        {!isPC ?
                                                            <a
                                                                onClick={() => {
                                                                    setView(true)
                                                                }}
                                                                class="btn d-inline-flex btn-sm btn-secondary mx-1">
                                                                <span>View {selectedTable} Orders</span>
                                                            </a>

                                                            :
                                                            <div className='text-lg'>Dining table : {selectedTable}</div>
                                                        }

                                                    </div>
                                                    {!isPC ? <a
                                                        onClick={() => {
                                                            if (view === true) {
                                                                setView(false)
                                                            } else {
                                                                setModalOpen(false);
                                                            }
                                                        }}
                                                        class="btn d-inline-flex btn-sm btn-primary mx-1">
                                                        <span>Back</span>
                                                    </a> : <a
                                                        onClick={() => {
                                                            setModalOpen(false);
                                                        }}
                                                        class="btn d-inline-flex btn-sm btn-primary mx-1">
                                                        <span>Back</span>
                                                    </a>

                                                    }

                                                </div>
                                                {!isPC ?
                                                    <div key={view} className="modal-body p-0">
                                                        <div >
                                                            {view === true ?
                                                                <div>
                                                                    <InStore_shop_cart
                                                                        OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                        setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                        store={store}
                                                                        acct={acct}
                                                                        selectedTable={selectedTable}
                                                                        isAllowed={isAllowed}
                                                                        setIsAllowed={setIsAllowed}
                                                                        openSplitPaymentModal={openSplitPaymentModal}
                                                                    />
                                                                    <InStore_food
                                                                        OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                        setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                        isAllowed={isAllowed}
                                                                        setIsAllowed={setIsAllowed}
                                                                        store={store} selectedTable={selectedTable}
                                                                        view={view}
                                                                    />
                                                                </div>
                                                                :
                                                                <InStore_food
                                                                    OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                    setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                    isAllowed={isAllowed}
                                                                    setIsAllowed={setIsAllowed}
                                                                    store={store} selectedTable={selectedTable} />
                                                            }
                                                        </div>
                                                    </div>


                                                    :
                                                    <div className="modal-body flex p-0" >

                                                        <div className='w-1/2'>
                                                            <InStore_food
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} selectedTable={selectedTable}></InStore_food>
                                                        </div>
                                                        <div className='w-1/2'>
                                                            <InStore_shop_cart
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} acct={acct} selectedTable={selectedTable} openSplitPaymentModal={openSplitPaymentModal}  ></InStore_shop_cart>
                                                        </div>
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* 
                            <div>
                            </div> */}
                        </div>
                    </div>

                </div>
                :
                null
            }
        </div >

    );
}
export default App;

