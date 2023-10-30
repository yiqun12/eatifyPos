import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { json, useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import './cartcheckout.css';
import './float.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard, faGift, faDollarSign, faUsers, faPencilAlt, faTimes, faArrowRight, faPrint } from '@fortawesome/free-solid-svg-icons';
import logo_transparent from './logo_transparent.png'
//import { flexbox } from '@mui/system';
import "./navbar.css";
import { useMyHook } from './myHook';
import teapotImage from './teapot.png';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';
import logo_fork from './logo_fork.png'
import Hero from './Hero'
import cuiyuan from './cuiyuan.png'
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import cartImage from './shopcart.png';
import "./inStore_shop_cart.css";
import PaymentComponent2 from "../pages/PaymentComponent2";

import Dnd_Test from './dnd_test';

const Navbar = ({ store, selectedTable, acct, openSplitPaymentModal }) => {
  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  /**listen to localtsorage */
  console.log("products")
  console.log(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
  const { user, user_loading } = useUserContext();

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    setProducts(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
    //console.log('Component B - ID changed:', id);
  }, [id]);


  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);
  const [tips, setTips] = useState('');
  const [discount, setDiscount] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [totalQuant, setTotalQuant] = useState(0);
  //console.log(totalQuant)
  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = (Array.isArray(products) ? products : []).reduce((acc, item) => item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0);
      console.log(total)
      setTotalPrice(total);
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))

      setFinalPrice((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
      //console.log((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
    }
    calculateTotalPrice();;
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

  }, [products, width, tips, discount]);


  const handleDeleteClick = (productId, count) => {
    setProducts((prevProducts) => {
      const productToDelete = prevProducts.find((product) => product.count === count);
      if (productToDelete) {
        console.log('Product before deletion:', productToDelete);
      }
      return prevProducts.filter((product) => product.count !== count);
    });
  }



  const handlePlusClick = (productId, targetCount) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && product.count === targetCount) {
          return {
            ...product,
            quantity: Math.min(product.quantity + 1, 99),
            itemTotalPrice: Math.round(100 * product.itemTotalPrice / (product.quantity) * (Math.min(product.quantity + 1, 99))) / 100,
          };
        }
        return product;
      });
    });
  };

  const handleMinusClick = (productId, targetCount) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && product.count === targetCount) {
          const newQuantity = Math.max(product.quantity - 1, 0);
          console.log({ ...product,
            quantity: 1,
            itemTotalPrice: newQuantity > 0 ? Math.round(100 * product.itemTotalPrice / product.quantity) / 100 : 0,          
          });

          return {
            ...product,
            quantity: newQuantity,
            itemTotalPrice: newQuantity > 0 ? Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100 : 0,
          };
        }
        return product;
      });
    });

  };
  



  // for translations sake
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      //console.log(trans)
      //console.log(translationsMode)

      if (trans != null) {
        if (translationsMode != null) {
          if (trans[text] != null) {
            if (trans[text][translationsMode] != null) {
              return trans[text][translationsMode]
            }
          }
        }
      }

      return text
    }
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")])


  const MerchantReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const CustomerReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CustomerReceipt"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  
function updateOrder(orders, orderId, values) {
  if (orders[orderId]) {
    orders[orderId].isSent = values;
    console.log(`Order ${orderId} has been updated.`);
  } else {
    console.log(`Order ${orderId} does not exist.`);
  }
}

function resetOrder(orders, orderId) {
  if (orders[orderId]) {
    orders[orderId].isPaid = false;
    orders[orderId].isSent = [];
    console.log(`Order ${orderId} has been updated.`);
  } else {
    console.log(`Order ${orderId} does not exist.`);
  }
}


  const SendToKitchen = async () => {

    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
      const Orders = JSON.parse(localStorage.getItem('TableState_'+store))
      console.log("abc",Orders)
      updateOrder(Orders,selectedTable,localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
      localStorage.setItem('TableState_'+store,JSON.stringify(Orders))
      console.log(Orders)
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const OpenCashDraw = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "OpenCashDraw"), {
        date: date,
        data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const CashCheckOut = async (extra) => {
    let extra_tip = 0
    if(extra !== null){
      extra_tip=extra.toFixed(2)
    }
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(finalPrice * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(finalPrice * 100),
        application: "",
        application_fee_amount: 0,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret: "pi_none",
        confirmation_method: "automatic",
        created: 0,
        currency: "usd",
        customer: null,
        dateTime: date,
        description: null,
        id: "pi_none",
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_none",
        livemode: true,
        metadata: {
          discount: discount===""?0:discount,
          isDine: true,
          service_fee: tips===""?0:tips,
          subtotal: Math.round(100 * totalPrice) / 100,
          tax: Math.round(100 * totalPrice * 0.0825) / 100,
          tips:  Math.round(100 * extra_tip) / 100 ,
          total: finalPrice,
        }, // Assuming an empty map converts to an empty object
        next_action: null,
        object: "payment_intent",
        on_behalf_of: null,
        payment_method: "pm_none",
        payment_method_configuration_details: null,
        payment_method_options: {}, // Assuming an empty map converts to an empty object
        card_present: {}, // Assuming an empty map converts to an empty object
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
        payment_method_types: ["Handle_Instore"],
        powerBy: "Handle Instore",
        processing: null,
        receiptData: localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]",
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        store: store,
        storeOwnerId: user.uid,
        stripe_store_acct: acct,
        tableNum: selectedTable,
        transfer_data: null,
        transfer_group: null,
        uid: user.uid,
        user_email: user.email,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // handling the add tips logic + modal

  // Add a new state for the modal
  const [isTipsModalOpen, setTipsModalOpen] = useState(false);

  const [selectedTipPercentage, setSelectedTipPercentage] = useState(null);

  const [customPercentage, setCustomPercentage] = useState("");

  // Create a function to open the modal
  const handleAddTipClick = () => {
    setTipsModalOpen(true);
  };

  const handleCancelTip = () => {
    setTips("");  // reset the tips value

    setSelectedTipPercentage("");
    setTipsModalOpen(false);  // close the modal
  };

  const handlePercentageTip = (percentage) => {
    // If the value is less than 0, set it to 0 (or any other default value)
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedTip = totalPrice * percentage;
    setTips(calculatedTip.toFixed(2)); // This will keep the tip value to two decimal places
    setSelectedTipPercentage(percentage);
  }

  const handleCustomPercentageChange = (e) => {
    let value = e.target.value;
    // If the value is less than 0, set it to 0 (or any other default value)
    if (value < 0) {
      value = 0;
    }
    setCustomPercentage(value);
    const calculatedTip = totalPrice * (Number(value) / 100);
    setTips(calculatedTip.toFixed(2));
    setSelectedTipPercentage(null);
  }

  // the modal and logic for discounts
  // const [discount, setDiscount] = useState('');  //declared ontop
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState(null);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");

  const handleAddDiscountClick = () => {
    setDiscountModalOpen(true);
  };

  const handleCancelDiscount = () => {
    setDiscount('');  // reset the discount value
    setDiscountModalOpen(false);  // close the modal
  };

  const applyDiscount = (value) => {
    if (value < 0) {
      value = 0;
    }
    setDiscount(value);
  };

  const handleDiscountPercentage = (percentage) => {
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedDiscount = totalPrice * percentage;
    setDiscount(calculatedDiscount.toFixed(2));
    setSelectedDiscountPercentage(percentage);
  }

  const handleCustomDiscountPercentageChange = (e) => {
    let value = e.target.value;
    if (value < 0) {
      value = 0;
    }
    setCustomDiscountPercentage(value);
    const calculatedDiscount = totalPrice * (Number(value) / 100);
    setDiscount(calculatedDiscount.toFixed(2));
    setSelectedDiscountPercentage(null);
  }


  const [isMyModalVisible, setMyModalVisible] = useState(false);
  const [received, setReceived] = useState(false)
  const [isPaymentClick, setIsPaymentClick] = useState(false)

  const myStyles = {
    overlayStyle: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isMyModalVisible ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStyle: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '4px',
      width: '80%',
      position: 'relative',
    },
    closeBtnStyle: {
      position: 'absolute',
      right: '10px',
      top: '10px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
    }
  };
  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState(null);
  const [extra, setExtra] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const openUniqueModal = () => setUniqueModalOpen(true);
  const closeUniqueModal = () => setUniqueModalOpen(false);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleCustomAmountChange = (event) => {
    setCustomAmount(event.target.value);
  };

  const calculateResult = () => {
    const x = parseInt(inputValue);
    if (!isNaN(x) && x > 10) {
      setResult(x - 10);
    } else {
      alert("Please enter a number greater than 10");
    }
  };

  const calculateExtra = (percentage) => {
    const extraAmount = (10 * percentage) / 100;
    setExtra(extraAmount);
    setFinalResult(10 + extraAmount);
  };

  const calculateCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount)) {
      setExtra(amount);
      setFinalResult(10 + amount);
    } else {
      alert("Please enter a valid number");
    }
  };

  const uniqueModalStyles = {
    overlayStyle: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isUniqueModalOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStyle: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    closeBtnStyle: {
      position: 'absolute',
      right: '10px',
      top: '10px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
    },
    inputStyle: {
      width: '100%',
      padding: '12px',
      boxSizing: 'border-box',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    buttonStyle: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px',
    },
  };
  const [isCustomAmountVisible, setCustomAmountVisible] = useState(false);

  const toggleCustomAmountVisibility = () => {
    setCustomAmountVisible(!isCustomAmountVisible);
  };


  // handles the delete and updates localStorage
  // for initialization: Call getItem localStorage to get `${storeID}_restaruant_seat_arrangement`
  // then grab all the table names and construct an object structure: {A1: {ispaid: boolean, isSent: products }, A2: ....,......}, A1 & A2 are table names from seat arrangement
  // make a delete functionality...
  // update the tableState_ storeID

/**
 * 
  function init_local_storage_TableState_StoreID(StoreID) {
    const tableStateKey = `TableState_${StoreID}`;
    const seatArrangementKey = `${StoreID}_restaurant_seat_arrangement`;
  
    // Check if the table state is available in localStorage
    const tableState = localStorage.getItem(tableStateKey);
  
    if (tableState !== null) {
      // Table state found, return or use it as needed
      return tableState;
    } else {
      // Table state not found, try to get it from seat arrangement localStorage
      const seatArrangementData = localStorage.getItem(seatArrangementKey);
  
      if (seatArrangementData !== null) {
        // Extract tableNames from seatArrangementData (assuming it's in JSON format)
        try {
          const seatArrangement = JSON.parse(seatArrangementData);
          const tables = seatArrangement["table"];
          
          if (Array.isArray(tables)) {
            // Extract all the table names
            const tableNames = tables.map(table => table.tableName);
            
            // Log the table names
            console.log("Table Names:", tableNames);
            const result = tableNames.reduce((acc, cur) => {
              acc[cur.toLowerCase()] = { isPaid: false, isSent: [] };
              return acc;
          }, {});
            console.log(result)
            
          } else {
            console.error("Invalid table data in seat arrangement.");
          }
        } catch (error) {
          console.error("Error parsing seat arrangement data:", error);
        }
      } else {
        console.log(`No data found in localStorage for ${tableStateKey} or ${seatArrangementKey}`);
      }
    }
  }

  init_local_storage_TableState_StoreID(store)
 */


  return (

    <>
      <>

        {/* popup content */}
        <div className="shopping-cart1" style={{ margin: "auto", height: "fit-content" }}>
          {/* shoppig cart */}
          <div className="title " style={{ height: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>


              <div>
                <div style={{ marginTop: "15px" }}>
                  <span>
                    <span>{`Your selected table is ${selectedTable}`}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-row">
            <div className='flex flex-col w-2/3' style={width > 575 ? { overflowY: "auto", maxHeight: "500px" } : { overflowY: "auto", maxHeight: "500px" }}>

              {/* generates each food entry */}
              {(Array.isArray(products) ? products : []).map((product) => (
                // the parent div
                // can make the parent div flexbox
                <div>
                  <div key={product.count} className="item">
                    {/* the delete button */}
                    <div className="buttons">
                      <DeleteSvg className="delete-btn"
                        onClick={() => {
                          handleDeleteClick(product.id, product.count)
                        }}></DeleteSvg>
                      {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}
                    </div>

                    {/* the name + quantity parent div*/}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "-webkit-fill-available" }}>
                      {/* the name */}
                      <div className='flex-row' style={{ width: "-webkit-fill-available" }}>
                        <div style={{ fontWeight: "bold", color: "black", width: "-webkit-fill-available" }}>
                          <span class="notranslate">

                            {sessionStorage.getItem("Google-language")?.includes("Chinese")||sessionStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                          </span>
                        </div>

                        <div>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>

                      </div>

                      <div className="quantity p-0"
                        style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div className='notranslate'>${product.itemTotalPrice}</div>

                        </div>
                        {/* the add minus box set up */}
                        <div style={{ display: "flex" }}>

                          {/* the start of minus button set up */}
                          <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                            <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                              onClick={() => {
                                if (product.quantity === 1) {
                                  handleDeleteClick(product.id, product.count);
                                } else {
                                  handleMinusClick(product.id, product.count)
                                }
                              }}>
                              <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                            </button>
                          </div>
                          {/* the end of minus button set up */}

                          { /* start of the quantity number */}
                          <span
                            className='notranslate'
                            type="text"
                            style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                          >{product.quantity}</span>
                          { /* end of the quantity number */}

                          { /* start of the add button */}
                          <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                            <button className="plus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                              onClick={() => {
                                handlePlusClick(product.id, product.count)
                              }}>
                              <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                            </button>
                          </div>
                          { /* end of the add button */}
                        </div>
                        { /* end of the add minus setup*/}
                      </div>

                      {/* end of quantity */}
                    </div>

                    {/* end of name + quantity parent div*/}
                  </div>
                </div>

              ))}

            </div>
            <div className="flex flex-col w-1/3">
              {/* the modal for tips */}
              {isTipsModalOpen && (
                <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Service Fee</h5>
                      </div>
                      <div className="modal-body">
                        <div className="row mb-3">
                          <button
                            type="button"
                            className={`btn col ${selectedTipPercentage === 0.15 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handlePercentageTip(0.15)}
                          >
                            15%
                          </button>

                          <button
                            type="button"
                            className={`btn col ${selectedTipPercentage === 0.18 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handlePercentageTip(0.18)}
                          >
                            18%
                          </button>

                          <button
                            type="button"
                            className={`btn col ${selectedTipPercentage === 0.20 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handlePercentageTip(0.20)}
                          >
                            20%
                          </button>
                          
                          <div className="col">
                            <input
                              type="number"
                              placeholder="%"
                              min="0"  // Add this line
                              value={customPercentage}
                              onChange={handleCustomPercentageChange}
                              className="form-control tips-no-spinners"  // Added the 'no-spinners' class
                            />
                          </div>
                        </div>
                        <input
                          type="number"
                          min="0"  // Add this line
                          placeholder="Enter tip amount"
                          value={tips}
                          className="form-control tips-no-spinners"  // Added the 'no-spinners' class
                          onChange={(e) => {
                            let value = e.target.value;
                            if (value < 0) {
                              value = 0;
                            }
                            setTips(value);
                            setSelectedTipPercentage(null);
                          }}
                          onFocus={() => setSelectedTipPercentage(null)}
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => handleCancelTip()}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={() => setTipsModalOpen(false)}>Add Service Fee</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDiscountModalOpen && (
                <div id="addDiscountModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Discount</h5>
                      </div>
                      <div className="modal-body">
                        <div className="row mb-3">
                          {/* Percentage options */}
                          <button
                            type="button"
                            className={`btn col ${selectedDiscountPercentage === 0.10 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDiscountPercentage(0.10)}
                          >
                            10%
                          </button>
                          <button
                            type="button"
                            className={`btn col ${selectedDiscountPercentage === 0.20 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDiscountPercentage(0.20)}
                          >
                            20%
                          </button>
                          <button
                            type="button"
                            className={`btn col ${selectedDiscountPercentage === 0.30 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleDiscountPercentage(0.30)}
                          >
                            30%
                          </button>
                          <div className="col">
                            <input
                              type="number"
                              placeholder="%"
                              min="0"
                              value={customDiscountPercentage}
                              onChange={handleCustomDiscountPercentageChange}
                              className="form-control discounts-no-spinners"
                            />
                          </div>
                        </div>
                        {/* Discount amount input */}
                        <input
                          type="number"
                          min="0"
                          placeholder="Enter discount amount"
                          value={discount}
                          className="form-control discounts-no-spinners"
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (value < 0 || isNaN(value)) {
                              value = 0;
                            }
                            applyDiscount(value);
                            setSelectedDiscountPercentage(null);
                          }}
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCancelDiscount}>Cancel</button>
                        <button type="button" className="btn btn-primary" onClick={() => setDiscountModalOpen(false)}>Apply Discount</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              <a
                onClick={handleAddTipClick}
                className="mt-3 btn btn-sm btn-success mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faGift} />
                </span>
                <span>{t("Add Service Fee")}</span>
              </a>

              <a
                onClick={handleAddDiscountClick}
                className="mt-3 btn btn-sm btn-danger mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPencilAlt} />
                </span>
                <span>{t("Add Discount")}</span>
              </a>

              <a
                onClick={() => setMyModalVisible(true)}
                className="mt-3 btn btn-sm btn-primary mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faCreditCard} />
                </span>
                <span>{t("Card Pay")}</span>
              </a>
              <div className="MyApp">

                <div style={myStyles.overlayStyle}>
                  <div style={myStyles.modalStyle}>
                    <button style={myStyles.closeBtnStyle} onClick={() => { setMyModalVisible(false); setReceived(false) }}>X</button>
                    <PaymentComponent2 setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store} chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} />
                  </div>
                </div>
              </div>
              <a
                onClick={() => { OpenCashDraw();openUniqueModal() }}
                className="mt-3 btn btn-sm btn-primary mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faDollarSign} />
                </span>
                <span>{t("Cash Pay")}</span>
              </a>
              <div style={uniqueModalStyles.overlayStyle}>
        <div style={uniqueModalStyles.modalStyle} className="p-4 rounded-lg">
          <button style={uniqueModalStyles.closeBtnStyle} onClick={closeUniqueModal}>
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4">Cash Pay</h2>
          <p className="mb-2">Cash On Delivery</p>
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            style={uniqueModalStyles.inputStyle}
            className="mb-4 p-2 w-full border rounded-md"
          />
          <button
            onClick={calculateResult}
            style={uniqueModalStyles.buttonStyle}
            className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
          >
            Calculate Give Back Cash
          </button>
          {result !== null && (
  <p className="mb-4">
    Give Back Cash : {extra !== null ? (result - extra).toFixed(2) : result}
  </p>
)}

<p className="mb-4">Gratuity:</p>
          <div className="flex justify-between mb-4">
            <button onClick={() => calculateExtra(15)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mr-2">
              15%
            </button>
            <button onClick={() => calculateExtra(18)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mx-1">
              18%
            </button>
            <button onClick={() => calculateExtra(20)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
              20%
            </button>
            <button onClick={toggleCustomAmountVisibility} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full ml-2">
              Other
            </button>
          </div>

          {isCustomAmountVisible && (
            <>
              <p className="mb-2">Custom Gratuity:</p>
              <div className="flex">
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  style={uniqueModalStyles.inputStyle}
                  className="p-2 w-full border rounded-md mr-2"
                />
                <button
                  onClick={calculateCustomAmount}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md w-1/3"
                >
                  Add
                </button>
              </div>
            </>
          )}

          {extra !== null && (
            <p className="mt-4">Gratuity Amount: {extra.toFixed(2)}</p>
          )}
          
           <button
                           onClick={() => { CashCheckOut(extra) }}

            style={uniqueModalStyles.buttonStyle}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
          >
            Confirm
          </button>
        </div>

      </div>
              {/* <a
                onClick={(e) => { openSplitPaymentModal() }}
                className="mt-3 btn btn-sm btn-warning mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faUsers} />
                </span>
                <span>{t("Split Payment")}</span>
              </a> */}

              <a
                onClick={SendToKitchen}
                className="mt-3 btn btn-sm btn-info mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
                <span>{t("Send to kitchen")}</span>
              </a>

              <a
                onClick={MerchantReceipt}
                className="mt-3 btn btn-sm btn-secondary mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPrint} />
                </span>
                <span>{t("Merchant Receipt")}</span>
              </a>

              <a
                onClick={CustomerReceipt}
                className="mt-3 btn btn-sm btn-secondary mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPrint} />
                </span>
                <span>{t("Customer Receipt")}</span>
              </a>

              <a

                onClick={(e) => {}}
                className="mt-3 btn btn-sm btn-danger mx-1">
                <span className="pe-2">
                  <FontAwesomeIcon icon={faTimes} />
                </span>
                <span>{t("Finish Order")}</span>
              </a>


              <br></br>
              <>

                <div class="text-right notranslate">Subtotal: ${Math.round(100 * totalPrice) / 100} </div>

                {discount && (
                  <div class="text-right notranslate">Discount: -${discount} </div>
                )}

                {tips && (
                  <div class="text-right notranslate">Service Fee: ${tips} </div>
                )}
                <div class="text-right notranslate">Tax(8.25%): ${(Math.round(100 * totalPrice * 0.0825) / 100)}    </div>
                <div class="text-right notranslate">Total: ${finalPrice} </div>
              </>
            </div>
          </div>


        </div>
      </>
    </>
  )
}

export default Navbar