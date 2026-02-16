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
    //console.log("title", title)

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

function App({ isModalOpen, setModalOpen, setSelectedTable, selectedTable, setIsVisible, store, acct, TaxRate }) {

    const [divWidth, setDivWidth] = useState(0);
    const divRef = useRef();

    const [title, setTitle] = useState(0);

    const [iframeHeight, setIframeHeight] = useState(0); // Start with a default value

    useEffect(() => {
        // Function to update height based on the viewport
        const updateHeight = () => {
            const vhInPx = window.innerHeight; // 100vh equivalent in pixels
            setIframeHeight(vhInPx - 50); // Set the state to this value (reduced from 100px to 50px)
        };

        // Calculate height on mount
        updateHeight();

        // Listen to resize events to adjust the height dynamically
        window.addEventListener('resize', updateHeight);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, []); // Empty dependency array means this effect will only run on mount and unmount


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

    // 添加监听localStorage变化，自动刷新iframe
    useEffect(() => {
        if (iframeRef.current) {
            // 当localStorage变化可能影响桌子显示时，刷新iframe
            iframeRef.current.sendMessage();
        }
    }, [id]); // id来自useMyHook，会在localStorage变化时更新

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


            const createPaymentIntent = firebase.functions().httpsCallable('createPaymentIntent');

            const response2 = await createPaymentIntent({
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
            setIsVisible(false)
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
                await setDoc(docRefTable_, { product: "[]" }, { merge: true });//initialize the table but no update on the main. 
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
    const isMobile = width <= 768;

    const [view, setView] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    const [OpenChangeAttributeModal, setOpenChangeAttributeModal] = useState(false);

    const cleanProductData = (products) => {
        if (!products) {
            return [];
        }

        return products.map(product => {
            const cleanedProduct = { ...product };
            if (cleanedProduct.attributeSelected) {
                cleanedProduct.attributeSelected = { ...cleanedProduct.attributeSelected };
            }

            if (cleanedProduct.attributeSelected && cleanedProduct.attributeSelected['开台商品']) {
                const tableItems = cleanedProduct.attributeSelected['开台商品'];

                const cleanedTableItems = tableItems.map(item => {
                    if (typeof item === 'string' && item.startsWith('开台时间-')) {
                        const parts = item.split('-');
                        const timestamp = parseInt(parts[parts.length - 1], 10);
                        if (!isNaN(timestamp)) {
                            const date = new Date(timestamp);
                            const hours = date.getHours().toString().padStart(2, '0');
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const formattedTime = `${hours}:${minutes}`;
                            const lang = localStorage.getItem("Google-language");
                            if (lang?.includes("Chinese") || lang?.includes("中")) {
                                return `开台时间: ${formattedTime}`;
                            } else {
                                return `Start Time: ${formattedTime}`;
                            }
                        }
                    }
                    return item;
                }).filter((item, index, arr) => arr.indexOf(item) === index);

                cleanedProduct.attributeSelected = {
                    ...cleanedProduct.attributeSelected,
                    '开台商品': cleanedTableItems
                };
            }

            return cleanedProduct;
        });
    };

    const SetTableIsSent = async (table_name, product) => {
        try {
            if (localStorage.getItem(table_name) === product) {
                return
            }
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docData = { product: product, date: date };
            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "TableIsSent", table_name);
            await setDoc(docRef, docData);

        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const SendToKitchen = async () => {
        console.log(selectedTable)
        console.log(store)
        // Add logic to save start time if it doesn't exist
        const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
        const currentCart = localStorage.getItem(`${store}-${selectedTable}`);
        if (!localStorage.getItem(startTimeKey) && currentCart && currentCart !== '[]') {
            localStorage.setItem(startTimeKey, Date.now().toString());
            console.log(`Saved start time for ${selectedTable}: ${startTimeKey}`);
        }
        try {
            if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
                if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
                    console.log("//no item in the array no item isSent.")
                    return //no item in the array no item isSent.
                } else {//delete all items
                }
            }
            const isSentData = JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent") || '[]');
            const currentData = JSON.parse(localStorage.getItem(store + "-" + selectedTable) || '[]');
            compareArrays(cleanProductData(isSentData), cleanProductData(currentData))

            const cartForSetTable = localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]";
            SetTableIsSent(store + "-" + selectedTable + "-isSent", JSON.stringify(cleanProductData(JSON.parse(cartForSetTable))))

        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    async function compareArrays(array1, array2) {//array1 isSent array2 is full array
        const array1ById = Object.fromEntries(array1.map(item => [item.count, item]));
        const array2ById = Object.fromEntries(array2.map(item => [item.count, item]));
        const add_array = []
        const delete_array = []
        for (const [count, item1] of Object.entries(array1ById)) {
            const item2 = array2ById[count];
            if (item2) {
                // If item exists in both arrays
                if (item1.quantity > item2.quantity) {
                    console.log('Deleted trigger:', {
                        ...item1,
                        quantity: item1.quantity - item2.quantity,
                        itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
                    });
                    delete_array.push({
                        ...item1,
                        quantity: item1.quantity - item2.quantity,
                        itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
                    })

                } else if (item1.quantity < item2.quantity) {
                    console.log('Added trigger:', {
                        ...item2,
                        quantity: item2.quantity - item1.quantity,
                        itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
                    });
                    add_array.push({
                        ...item2,
                        quantity: item2.quantity - item1.quantity,
                        itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
                    })
                }
            } else {
                // If item exists in array 1 but not in array 2
                console.log('Deleted trigger:', item1);
                delete_array.push(item1)
            }
        }

        for (const [count, item2] of Object.entries(array2ById)) {
            const item1 = array1ById[count];
            if (!item1) {
                // If item exists in array 2 but not in array 1
                console.log('Added trigger:', item2);
                add_array.push(item2)
            }
        }
        const promises = [];//make them call at the same time

        if (add_array.length !== 0) {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const addPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
                date: date,
                data: add_array,
                selectedTable: selectedTable
            }).then(docRef => {
                console.log("Document written with ID: ", docRef.id);
            });
            promises.push(addPromise);
        }

        if (delete_array.length !== 0) {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const deletePromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
                date: date,
                data: delete_array,
                selectedTable: selectedTable
            }).then(docRef => {
                console.log("DeleteSendToKitchen Document written with ID: ", docRef.id);
            });
            promises.push(deletePromise);
        }

        // Execute both promises in parallel
        Promise.all(promises).then(() => {
            console.log("All operations completed");
        }).catch(error => {
            console.error("Error in executing parallel operations", error);
        });
    }



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





                    {/* split_payment modal ends here */}

                    <div className='flex flex-col' style={{ alignItems: 'flex-start' }}>

                        <div style={{ margin: "10px", display: "flex" }} >
                            <div style={isMobile ? { position: 'static' } : { position: 'relative' }}>

                                <Iframe
                                    className="notranslate" key={changeEvent}
                                    ref={iframeRef} src={`${process.env.PUBLIC_URL}/seat.html`} width={(divWidth) + "px"} height={`${iframeHeight}px`} storeName={store}
                                    title={title} />

                                {isModalOpen && (
                                    <div id="addTableModal" className="modal fade show" role="dialog" style={{

                                        display: 'block', position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,1)', overflow: 'hidden'
                                    }}>
                                        <div role="document" className='m-2' style={{ overflowY: 'hidden' }}>
                                            <div className="modal-content" style={{ overflowY: 'hidden', /* Add scrollbar styles inline */ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                                                <div className="modal-header flex items-center justify-between p-4" style={{
                                                    borderBottom: '1px solid #dee2e6',
                                                    backgroundColor: '#f8f9fa' // 标题栏使用非常浅的灰色
                                                }}>
                                                    <div>
                                                        <h3
                                                            className="notranslate text-red-600 m-0">
                                                            {selectedTable}
                                                        </h3>
                                                    </div>
                                                    <div>
                                                        {!isPC && (
                                                            <button
                                                                onClick={() => {
                                                                    setView(true)
                                                                }}
                                                                className="btn btn-sm btn-outline-secondary mx-1 text-black border-black ">
                                                                View Orders
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (!isPC && view === true) {
                                                                    setView(false)
                                                                } else {
                                                                    setModalOpen(false);
                                                                    setIsVisible(true)
                                                                }
                                                                SendToKitchen();

                                                            }}
                                                            className="btn btn-sm btn-primary mx-1" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}>
                                                            Print and Back
                                                        </button>
                                                    </div>
                                                </div>
                                                {!isPC ?
                                                    <div key={view} className="modal-body p-0" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                                                        <div >
                                                            {view === true ?
                                                                <div>
                                                                    {/* Mobile shopping cart layout */}
                                                                    <div style={{
                                                                        padding: '1rem',
                                                                        borderBottom: '1px solid #dee2e6',
                                                                        marginBottom: '0.5rem'
                                                                    }}>
                                                                                                                                <InStore_shop_cart
                                                            OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                            setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                            store={store}
                                                            acct={acct}
                                                            selectedTable={selectedTable}
                                                            isAllowed={isAllowed}
                                                            setIsAllowed={setIsAllowed}
                                                            openSplitPaymentModal={openSplitPaymentModal}
                                                            TaxRate={TaxRate}
                                                            startTime={`1744625303617`}
                                                            isViewOrdersMode={true}
                                                        />
                                                                    </div>
                                                                    {/* Mobile menu layout */}
                                                                    <div style={{
                                                                        backgroundColor: '#ffffff', // White background
                                                                        padding: '1rem'
                                                                    }}>
                                                                        <InStore_food
                                                                            setIsVisible={setIsVisible}
                                                                            OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                            setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                            isAllowed={isAllowed}
                                                                            setIsAllowed={setIsAllowed}
                                                                            store={store} selectedTable={selectedTable}
                                                                            view={view}
                                                                            TaxRate={TaxRate}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div style={{
                                                                    backgroundColor: '#ffffff', // White background
                                                                    padding: '1rem'
                                                                }}>
                                                                    <InStore_food
                                                                        setIsVisible={setIsVisible}
                                                                        OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                        setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                        isAllowed={isAllowed}
                                                                        setIsAllowed={setIsAllowed}
                                                                        store={store} selectedTable={selectedTable}
                                                                        view={view}
                                                                        TaxRate={TaxRate}
                                                                    />
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>


                                                    :
                                                    <div className="modal-body flex p-0" style={{ minHeight: 'calc(100vh - 120px)' }} >

                                                        <div
                                                            className={`${isPC ? 'w-2/3' : 'w-1/2'}`} style={{
                                                                backgroundColor: '#ffffff', // 菜单区保持白色
                                                                padding: '1rem',
                                                                borderRight: '1px solid #dee2e6' // 稍明显的灰色分隔线
                                                            }}>
                                                            <InStore_food
                                                                setIsVisible={setIsVisible}
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} selectedTable={selectedTable}
                                                                view={view}
                                                                TaxRate={TaxRate}
                                                            />
                                                        </div>
                                                        <div className={`${isPC ? 'w-1/3' : 'w-1/2'} bg-gray-100`} >
                                                            <InStore_shop_cart
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} acct={acct} selectedTable={selectedTable}
                                                                openSplitPaymentModal={openSplitPaymentModal}
                                                                TaxRate={TaxRate}
                                                                startTime={`1744625303617`}

                                                            ></InStore_shop_cart>
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

