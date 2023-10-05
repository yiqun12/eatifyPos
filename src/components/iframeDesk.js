import React from 'react';
import './style.css';
import { useCallback, useState, useEffect } from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useMyHook } from '../pages/myHook';
import Button from '@mui/material/Button';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image
import plusSvg from '../pages/plus.svg';
import minusSvg from '../pages/minus.svg';
import { useRef } from "react";
import { data_ } from '../data/data.js'

import InStore_food from '../pages/inStore_food'
import InStore_shop_cart from '../pages/inStore_shop_cart'

function Iframe({ src, width, height }) {
    const iframeRef = useRef();


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
    }, [src]);

    return <iframe ref={iframeRef} title="Seat" width={width} height={height} />;
}

function App({ store }) {

    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);

    /**change app namne and logo */
    // const [faviconUrl, setFaviconUrl] = useState('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
    const handleOpenCashDraw = async () => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "open_cashdraw"), {
                date: date
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }



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

    // the selectedTable variable allows you to keep track which table you have selected
    const [selectedTable, setSelectedTable] = useState(null);
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


        } else if (event.data === "admin mode active") {
            setSelectedSeatMode("admin");
        } else if (event.data === "customer mode active") {
            setSelectedSeatMode("customer");
        } else if (event.data === "table_deselected") {
            setSelectedTable(null);
            console.log("Table deselected");
        }
        else if (event.data === 'buttonClicked') {
            console.log('Button clicked2!');
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
    const [products, setProducts] = useState([]);


    return (

        <div>

            {/* modal code for when table inside iframe is clicked in customer mode */}
            {isModalOpen && (
                <div id="addTableModal" className="modal fade show " role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-xl" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Table {selectedTable}</h5>
                                <button type="button" className="btn btn-primary" onClick={() => setModalOpen(false)}>Close</button>
                            </div>
                            <div className="modal-body">
                                {/* in the body of the modal contains the search food items functionality */}
                                <InStore_food store={store} selectedTable={selectedTable} ></InStore_food>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* beginning of the other code */}

            <div style={{ margin: "10px", display: "flex" }}>
                {true ?

                    <>
                        <header className="main-header" style={{ height: "100px" }}>

                            <div className="search-wrap">
                            </div>
                        </header>
                        <div >
                            <Iframe ref={iframeRef} src={`${process.env.PUBLIC_URL}/seat.html`} width="540px" height="800px" />
                        </div>

                        <section className="task-list" >
                            <div className="task-wrap" style={{ minHeight: '350px', overflowY: 'scroll' }}>
                                <div className={`task-card ${"task.checked" ? "task-card--done" : ""}`}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div>
                                            {/* open drawer here above the table info */}
                                            <a className="main-nav__link" style={{
                                                background: "#e1ecf4", display: "flex",
                                                justifyContent: "center",
                                                margin: "auto",
                                                width: "fit-content"
                                            }} onClick={handleOpenCashDraw}>
                                                <img src={icons8Drawer} alt="Icons8 Drawer" style={{ display: "inline-block" }} />
                                                {t("OPEN DRAWER")}
                                            </a>
                                            <InStore_shop_cart store={store} selectedTable={selectedTable} products={products} setProducts={setProducts}  ></InStore_shop_cart>
                                            <hr />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </section>

                        {/* test display for seat mode change */}
                        {/* <section className="task-list" style={{ marginTop: "275px" }}>

                                        <input
                                            type="text"
                                            name="inputData"
                                            placeholder={t("Search food items")}
                                            className="search-bar"
                                            style={{ marginLeft: "5px", height: '30px', width: "80%", marginBottom: "5px" }}
                                            onChange={(e) => {
                                                searchItemFromShopItem(e.target.value);
                                                setSearchData(e.target.value);
                                            }}
                                            value={searchData}
                                        />

                                        <div className="task-wrap" style={{ minHeight: '400px', maxHeight: '400px', overflowY: 'scroll' }}>
                                            {search_food.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (
                                                <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                                                            <img src={task.image} alt="" />
                                                        </div>
                                                        <div style={{ marginLeft: "10px" }}>{task.name}</div>
                                                        <span
                                                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                                            onClick={() => {
                                                                shopAdd(task.id);
                                                                saveId(Math.random());
                                                            }}
                                                            className="task-card__tag task-card__tag--marketing"
                                                        >
                                                            {t("Add")}
                                                        </span>

                                                    </div>



                                                </div>
                                            ))}
                                        </div>
                                    </section> */}

                    </>



                    :






                    null}
            </div>
        </div>

    );
}
export default App;


