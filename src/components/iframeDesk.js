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

function App() {

    const [Food_arrays, setFood_arrays] = useState(JSON.parse(sessionStorage.getItem("Food_arrays")));
    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);
    useEffect(() => {
        setFood_arrays(JSON.parse(sessionStorage.getItem("Food_arrays")));
    }, [id]);
    const [selectedItem, setSelectedItem] = useState('Order');

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
    const handleAdminCheckout = async () => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }

        //console.log(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
        const food_array = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")));
        const matched_food_array = food_array.map(({ id, quantity }) => {
            const matched_food = JSON.parse(sessionStorage.getItem("Food_arrays")).find(foodItem => foodItem.id === id);
            return { ...matched_food, quantity };
        });

        console.log(matched_food_array);
        const total_ = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
            return accumulator + task.quantity * task.subtotal;
        }, 0).toFixed(2)
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "success_payment"), {
                dateTime: date,
                receiptData: JSON.stringify(matched_food_array),
                //charges.data[0].billing_details.name = "DineIn"
                amount: total_ * 100,
                amount_received: total_ * 100,
                user_email: "Admin@gmail.com",
                charges: {
                    data: [
                        {
                            billing_details: { name: "DineIn" }
                        }
                    ]
                }
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const [searchData, setSearchData] = useState([]);



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


    const [revenueData, setRevenueData] = useState([
        { date: '3/14/2023', revenue: 30 }
    ]);




    const moment = require('moment');

    const fetchPost = async () => {
        console.log("fetchPost2");
        await getDocs(collection(db, "success_payment")).then((querySnapshot) => {
            const newData = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            newData.sort((a, b) =>
                moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
                moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
            );

            const newItems = []; // Declare an empty array to hold the new items

            newData.forEach((item) => {
                const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
                    .subtract(7, "hours")
                    .format("M/D/YYYY h:mma");
                const newItem = {
                    id: item.id.substring(0, 4), // use only the first 4 characters of item.id as the value for the id property
                    receiptData: item.receiptData,
                    date: formattedDate,
                    email: item.user_email,
                    dineMode: item.isDinein,
                    status: "pending",
                    total: parseInt(item.amount_received) / 100,
                    name: item.charges.data[0].billing_details.name,
                };
                newItems.push(newItem); // Push the new item into the array
            });
            console.log(newItems); // Log the array to the console or do whatever you want with it


            // Create an object to store daily revenue totals
            const dailyRevenue = {};

            // Loop through each receipt and sum up the total revenue for each date
            newItems.forEach(receipt => {
                // Extract the date from the receipt
                const date = receipt.date.split(' ')[0];
                //console.log(receipt)
                // Extract the revenue from the receipt (for example, by parsing the receiptData string)
                const revenue = receipt.total; // replace with actual revenue calculation
                // Add the revenue to the dailyRevenue object for the appropriate date
                if (dailyRevenue[date]) {
                    dailyRevenue[date] += revenue;
                } else {
                    dailyRevenue[date] = revenue;
                }
            });
            console.log("hello")
            // Convert the dailyRevenue object into an array of objects with date and revenue properties
            const dailyRevenueArray = Object.keys(dailyRevenue).map(date => {
                return {
                    date: date,
                    revenue: dailyRevenue[date]
                };
            });

            // Example output: [{date: '3/14/2023', revenue: 10}, {date: '3/13/2023', revenue: 10}, {date: '3/4/2023', revenue: 10}]
            console.log(dailyRevenueArray);
            console.log(revenueData);
            setRevenueData(dailyRevenueArray)

        });
    };





    useEffect(() => {
        fetchPost();
    }, [])


    //REVENUE CHART 31 DAYS FROM NOW
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // 7 days ago

    const filteredData = revenueData.filter((dataPoint) => {
        const dataPointDate = new Date(dataPoint.date);
        return dataPointDate >= oneWeekAgo && dataPointDate <= today;
    });



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

    const messageHandler = useCallback((event) => {
        if (event.data === 'buttonClicked') {
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
    }, [src, selectedItem]);

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

    //const [shopItem, setShopItem] = useState(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []);
    const [tableItem, setTableItem] = useState([]);

    //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))

    const shopAdd = (id) => {
        if (sessionStorage.getItem("tableMode") == "table-NaN") {
            return
        }
        const foodItem = Food_arrays.find(item => item.id === id);
        const dictArray = {
            id: id,
            name: foodItem.name,
            category: foodItem.category,
            image: foodItem.image,
            price: foodItem.price,
            subtotal: foodItem.subtotal,
            quantity: 1
        };
        console.log(dictArray);
        // Check if shopItem exists in sessionStorage

        // Retrieve the shopItem array from sessionStorage

        const shopItem = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []

        // Check if the id already exists in the shopItem array
        const idExists = shopItem.some(item => item.id === dictArray.id);

        if (!idExists) {
            // If the id does not exist, add the dictArray object to the shopItem array
            shopItem.push(dictArray);
            // Save the updated shopItem array back to sessionStorage
            sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(shopItem))
            //sessionStorage.setItem('shopItem', JSON.stringify(shopItem));
            //setShopItem(shopItem)
        } else {
            clickedAdd(id)
        }

        saveId(Math.random());
        //searchItemFromShopItem("cheese")
        //search
    }
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
    const [cheeseItems_, setCheeseItems_] = useState(JSON.parse(sessionStorage.getItem('Food_arrays')) || []);
    const searchItemFromShopItem = (input) => {
        const shopItem_ = JSON.parse(sessionStorage.getItem('Food_arrays')) || [];

        // Filter the items that have "cheese" in their name
        const cheeseItems = shopItem_.filter(item => item.name.toLowerCase().includes(input));

        // Return the cheeseItems array
        console.log(cheeseItems)
        setCheeseItems_(cheeseItems)
        saveId(Math.random());
    }

    let search_food = !searchData ? Food_arrays : cheeseItems_;

    return (

                <div>
                <a className="main-nav__link" style={{ background: "#e1ecf4", display: "inline-block" }} onClick={handleOpenCashDraw}>
                                    <img src={icons8Drawer} alt="Icons8 Drawer" style={{ display: "inline-block" }} />
                                    {t("OPEN DRAWER")}
                                </a>
                    { selectedItem === 'Order' ?

                                <>
                                    <header className="main-header" style={{ height: "100px" }}>

                                        <div className="search-wrap">
                                        </div>
                                    </header>
                                    <div style={{ marginTop: "-100px" }}>
                                        <Iframe src={`${process.env.PUBLIC_URL}/seat.html`} width="540px" height="800px" />
                                    </div>

                                    <section className="task-list" style={{ marginTop: "-100px" }}>
                                        <div className="task-wrap" style={{ minHeight: '350px', maxHeight: '350px', overflowY: 'scroll' }}>
                                            <div className={`task-card ${"task.checked" ? "task-card--done" : ""}`}>
                                                <div style={{ display: "flex", alignItems: "center" }}>



                                                    <div>


                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "5px" }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '10px' }}>
                                                                {sessionStorage.getItem("tableMode") === "table-NaN" ? (
                                                                    <>Did not select table</>
                                                                ) : (
                                                                    <>{sessionStorage.getItem("tableMode")}</>
                                                                )}
                                                            </span>
                                                            <Button variant="contained" onClick={handleAdminCheckout}>
                                                                {t("Checkout")} $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                    return accumulator + task.quantity * task.subtotal;
                                                                }, 0) * 1.086).toFixed(2)}
                                                            </Button>
                                                        </div>
                                                        <hr />

                                                        {sessionStorage.getItem(sessionStorage.getItem("tableMode")) == "[]" ? <>Void</> : <></>}

                                                        {JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).map((task) => (
                                                            <div
                                                                key={task.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    width: '100%',
                                                                }}
                                                            >
                                                                <div style={{ width: "175px" }}>
                                                                    <div style={{ marginLeft: '10px' }}>{task.name}</div>
                                                                    <div style={{ marginLeft: '10px' }}>
                                                                        <span>${task.subtotal} x {task.quantity} = ${task.quantity * task.subtotal}</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="quantity" style={{ marginRight: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', paddingTop: '5px', height: 'fit-content' }}>
                                                                        <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: 'flex', borderLeft: '1px solid', borderTop: '1px solid', borderBottom: '1px solid', borderRadius: '12rem 0 0 12rem', height: '30px' }}>
                                                                            <button className="plus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => {
                                                                                if (task.quantity === 1) {
                                                                                    deleteItem(task.id);
                                                                                    saveId(Math.random());
                                                                                } else {
                                                                                    clickedMinus(task.id);
                                                                                    saveId(Math.random());
                                                                                }
                                                                            }}>
                                                                                <img style={{ margin: '0px', width: '10px', height: '10px' }} src={minusSvg} alt="" />
                                                                            </button>
                                                                        </div>
                                                                        <span type="text" style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid', borderBottom: '1px solid', display: 'flex', padding: '0px' }}>{task.quantity}</span>
                                                                        <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: 'flex', borderRight: '1px solid', borderTop: '1px solid', borderBottom: '1px solid', borderRadius: '0 12rem 12rem 0', height: '30px' }}>
                                                                            <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => {
                                                                                clickedAdd(task.id)
                                                                                saveId(Math.random());
                                                                            }}>
                                                                                <img style={{ margin: '0px', width: '10px', height: '10px' }} src={plusSvg} alt="" />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                </div>



                                                            </div>
                                                        ))}
                                                        <div>
                                                            <hr />
                                                            <div>Subtotal: $ {JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0).toFixed(2)}</div>

                                                            <div>Tax: $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0) * 0.086).toFixed(2)}</div>

                                                            <div>Total: $ {(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
                                                                return accumulator + task.quantity * task.subtotal;
                                                            }, 0) * 1.086).toFixed(2)}</div>

                                                        </div>
                                                    </div>


                                                </div>



                                            </div>
                                        </div>
                                    </section>
                                    <section className="task-list" style={{ marginTop: "275px" }}>

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
                                    </section>

                                </>



                                :






                                        null}

                </div>

    );
}
export default App;


