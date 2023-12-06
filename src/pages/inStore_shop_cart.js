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
import { faCreditCard, faGift, faDollarSign, faUsers, faPencilAlt, faTimes, faExchangeAlt, faArrowRight, faPrint } from '@fortawesome/free-solid-svg-icons';
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
import Dnd_Test from '../pages/dnd_test';
import { isMobile } from 'react-device-detect';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ setIsAllowed, isAllowed, store, selectedTable, acct, openSplitPaymentModal }) => {
  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  /**listen to localtsorage */
  //console.log("products")
  //console.log(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
  const { user, user_loading } = useUserContext();

  const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);

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
  const [extra, setExtra] = useState(null);

  const toggleAllowance = () => {
    console.log(isAllowed)
    setIsAllowed(!isAllowed);
  };
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

      setFinalPrice((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
      //console.log((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
    }
    calculateTotalPrice();;
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

  }, [products, width, tips, discount, extra]);


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
          console.log({
            ...product,
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
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
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
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }




  const SendToKitchen = async () => {

    try {
      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
          return
        } else {
          compareArrays(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), [])
          localStorage.setItem(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")
        }
      }
      if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
        const dateTime = new Date().toISOString();
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
          date: date,
          data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
          selectedTable: selectedTable
        });
        console.log("Document written with ID: ", docRef.id);
        localStorage.setItem(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")
      } else {
        compareArrays(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(store + "-" + selectedTable)))
        localStorage.setItem(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")

      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function compareArrays(array1, array2) {
    const array1ById = Object.fromEntries(array1.map(item => [item.count, item]));
    const array2ById = Object.fromEntries(array2.map(item => [item.count, item]));

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
          const dateTime = new Date().toISOString();
          const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
          const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
            date: date,
            data: [{
              ...item1,
              quantity: item1.quantity - item2.quantity,
              itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
            }],
            selectedTable: selectedTable
          });
          console.log("Document written with ID: ", docRef.id);

        } else if (item1.quantity < item2.quantity) {
          console.log('Added trigger:', {
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          });
          const dateTime = new Date().toISOString();
          const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
          const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
            date: date,
            data: [{
              ...item2,
              quantity: item2.quantity - item1.quantity,
              itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
            }],
            selectedTable: selectedTable
          });
          console.log("Document written with ID: ", docRef.id);
        }
      } else {
        // If item exists in array 1 but not in array 2
        console.log('Deleted trigger:', item1);
        const dateTime = new Date().toISOString();
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
          date: date,
          data: [item1],
          selectedTable: selectedTable
        });
        console.log("Document written with ID: ", docRef.id);

      }
    }

    for (const [count, item2] of Object.entries(array2ById)) {
      const item1 = array1ById[count];
      if (!item1) {
        // If item exists in array 2 but not in array 1
        console.log('Added trigger:', item2);
        const dateTime = new Date().toISOString();
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
          date: date,
          data: [item2],
          selectedTable: selectedTable
        });
        console.log("Document written with ID: ", docRef.id);
      }
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
    if (extra !== null) {
      extra_tip = extra.toFixed(2)
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
          discount: discount === "" ? 0 : discount,
          isDine: true,
          service_fee: tips === "" ? 0 : tips,
          subtotal: Math.round(100 * totalPrice) / 100,
          tax: Math.round(100 * totalPrice * 0.0825) / 100,
          tips: Math.round(100 * extra_tip) / 100,
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
        payment_method_types: ["Paid_by_Cash"],
        powerBy: "Paid by Cash",
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
      localStorage.setItem(store + "-" + selectedTable, "[]"); setProducts([]);
      localStorage.setItem(store + "-" + selectedTable + "-isSent", "[]")

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
    if (!isNaN(x) && x > finalPrice) {
      setResult(x);
    } else {
      alert("Please enter a number greater than total amount: $" + finalPrice);
    }
  };

  const calculateExtra = (percentage) => {
    const extraAmount = (finalPrice * percentage) / 100;
    setExtra(extraAmount);
    setFinalResult(finalPrice + extraAmount);
  };

  const calculateCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount)) {
      setExtra(amount);
      setFinalResult(finalPrice + amount);
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
      right: '30px',
      top: '0',
      background: 'none',
      border: 'none',
      fontSize: '48px',
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

  const isPC = width >= 1024;


  // these dndTestKey allows the dnd_test to reset by switching to a different key
  const [dndTestKey, setDndTestKey] = useState(0); // initial key set to 0

  const resetDndTest = () => {
    setDndTestKey(prevKey => prevKey + 1); // increment key to force re-render
  };


  // console.log("Products from instroe_shop_cart", products)
  return (

    <div>
      <div class=''>
        <div className="flex w-full">
          <div className={`flex-grow ${!isMobile ? 'm-6' : 'm-2'}`}>
            {(Array.isArray(products) ? products : []).map((product) => (

              // the parent div
              // can make the parent div flexbox
              <div>
                <div className='flex'>
                  <DeleteSvg className='mt-2 ml-1 mr-2'
                    onClick={() => {
                      handleDeleteClick(product.id, product.count)
                    }}></DeleteSvg>
                  <div className='flex justify-between w-full'>
                    <div className={`${!isMobile ? 'text-lg' : ''} notranslate`}>

                      {sessionStorage.getItem("Google-language")?.includes("Chinese") || sessionStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)} x {product.quantity}
                    </div>

                  </div>


                </div>
                <div className='items-center'>
                  <div>
                    <span class="notranslate">
                      {Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}
                    </span>
                  </div>

                  <div className="quantity p-0"
                    style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className={`${!isMobile ? 'text-lg' : ''} notranslate`}>

                        ${product.itemTotalPrice}
                      </div>

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
                <hr></hr>
              </div>

            ))}
          </div>
          <div className='flex flex-col space-y-2'>
            <a
              onClick={toggleAllowance}
              className={`mt-3 btn btn-sm ${isAllowed ? 'btn-light' : 'btn-dark'} mx-1`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? null : (
                <span className="pe-2">
                  <FontAwesomeIcon icon={isAllowed ? faToggleOn : faToggleOff} />
                </span>
              )}
              <span>{isAllowed ? 'Turn off Price Change' : 'Turn on Price Change'}</span>
            </a>

            <a
              onClick={handleAddTipClick}
              className="mt-3 btn btn-sm btn-success mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPencilAlt} />
                </span>
              }
              <span>{t("Add Service Fee")}</span>
            </a>

            <a
              onClick={handleAddDiscountClick}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faGift} />
                </span>
              }
              <span>{t("Add Discount")}</span>
            </a>

            <a
              onClick={SendToKitchen}
              className="mt-3 btn btn-sm btn-light mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              }
              <span>{t("Send to kitchen")}</span>
            </a>

            <a
              onClick={() => { CustomerReceipt(); MerchantReceipt(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPrint} />
                </span>
              }
              <span>{t("Print Order")}</span>
            </a>

            <a
              onClick={() => { CustomerReceipt(); MerchantReceipt(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faPrint} />
                </span>
              }
              <span>{t("Merchant Receipt")}</span>
            </a>

            <a
              onClick={() => { setSplitPaymentModalOpen(true) }}
              className="mt-3 btn btn-sm btn-warning mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faExchangeAlt} />
                </span>
              }


              <span>{t("Split Payment")}</span>
            </a>

            <a
              onClick={() => setMyModalVisible(true)}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> : <span className="pe-2">
                <FontAwesomeIcon icon={faCreditCard} />
              </span>
              }
              <span>{t("Card Pay")}</span>
            </a>

            <a
              onClick={() => { OpenCashDraw(); openUniqueModal() }}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faDollarSign} />
                </span>
              }
              <span>{t("Cash Pay")}</span>
            </a>

            <div className={`text-right ${!isMobile ? 'text-lg' : ''}`}>Subtotal: <span className='notranslate'>${Math.round(100 * totalPrice) / 100}</span> </div>

            {discount && (
              <div className={`text-right ${!isMobile ? 'text-lg' : ''}`}>Discount: <span className='notranslate'>-${discount} </span></div>
            )}

            {tips && (
              <div className={`text-right ${!isMobile ? 'text-lg' : ''}`}>Service Fee: <span className='notranslate'>${tips}</span> </div>
            )}
            {extra !== null && (
              <div className={`text-right ${!isMobile ? 'text-lg' : ''} `}>Gratuity: <span className='notranslate'>{Math.round((extra) * 100) / 100} </span></div>
            )}
            <div className={`text-right ${!isMobile ? 'text-lg' : ''} `}>Tax(8.25%): <span className='notranslate'>${(Math.round(100 * totalPrice * 0.0825) / 100)}</span>    </div>
            <div className={`text-right ${!isMobile ? 'text-lg' : ''} `}>Total Amount: <span className='notranslate'>${finalPrice}</span> </div>
          </div>
        </div>




        <div>


        </div>


      </div>
      {/* popup content */}
      <div style={{ margin: "auto", height: "fit-content" }}>

        <div className="flex flex-col flex-row">
          {isUniqueModalOpen && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="text-2xl font-semibold mb-4">Cash Pay</h2>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setUniqueModalOpen(false); }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">
                    <p className="mb-4 mt-4">Gratuity:</p>
                    <div className="flex justify-between mb-4">
                      <button onClick={() => { calculateExtra(15); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => { calculateExtra(18); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => { calculateExtra(20); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={toggleCustomAmountVisibility} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        Other
                      </button>
                    </div>

                    {isCustomAmountVisible && (
                      <div>
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
                            className="bg-orange-500 text-white p-2 rounded-md w-1/3"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="mb-2">Enter the Cash Received</p>
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
                    {extra !== null && (
                      <p className="">Gratuity: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                    )}
                    <p className="mt-1">Final Payment: <span className='notranslate'>${finalPrice}</span> </p>

                    {result !== null && (
                      <p className="mt-1 mb-4 ">
                        Give Back Cash :

                        <span className='notranslate'>${extra !== null ? Math.round((result - finalPrice) * 100) / 100 : result}</span>
                      </p>
                    )}
                    <button
                      onClick={() => { CashCheckOut(extra); closeUniqueModal(); }}
                      style={uniqueModalStyles.buttonStyle}
                      className="mt-2 mb-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      Checkout Order
                    </button>
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}
          {isSplitPaymentModalOpen && (
            <div
              id="addTipsModal"
              className="modal fade show"
              role="dialog"
              style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: '90%', width: '90%', height: "90%", margin: '0 auto' }}
              >
                <div className="modal-content">
                  <div className="modal-header">
                  <Button variant="danger" style={{ marginTop: "auto" }} onClick={resetDndTest}>
                       Reset
                    </Button>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setSplitPaymentModalOpen(false); }}>
                      &times;
                    </button>
                  </div>
                  <div
                    className="modal-body pt-0"
                    style={{ overflowX: 'auto', maxWidth: '100%' }}
                  >
                    <Dnd_Test key={dndTestKey} main_input={products} />
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>

          )
          }
          {isMyModalVisible && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select your POS Machine:</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setMyModalVisible(false); setReceived(false) }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">

                    <PaymentComponent2 setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store} chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} />

                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}


          {isMyModalVisible && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select your POS Machine:</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setMyModalVisible(false); setReceived(false) }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">

                    <PaymentComponent2 setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store} chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} />

                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* the modal for tips */}
          {isTipsModalOpen && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Service Fee</h5>
                  </div>
                  <div className="modal-body">

                    <div className="flex justify-between mb-4">
                      <button onClick={() => handlePercentageTip(0.15)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => handlePercentageTip(0.18)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => handlePercentageTip(0.20)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>

                      <input
                        type="number"
                        placeholder="Enter percent"
                        min="0"  // Add this line
                        value={customPercentage}
                        onChange={handleCustomPercentageChange}
                        className="px-4 py-2 ml-2 form-control tips-no-spinners"  // Added the 'no-spinners' class
                      />
                    </div>
                    <input
                      type="number"
                      min="0"  // Add this line
                      placeholder="Enter serivce fee by amount"
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
                    <div className="flex justify-between mb-4">
                      <button onClick={() => handleDiscountPercentage(0.10)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        10%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.20)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        20%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.30)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        30%
                      </button>
                      <input
                        type="number"
                        placeholder="Enter percent"
                        min="0"
                        value={customDiscountPercentage}
                        onChange={handleCustomDiscountPercentageChange}
                        className="px-4 py-2 ml-2 form-control discounts-no-spinners"
                      />
                    </div>
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
                    <button type="button" className="btn btn-primary" onClick={() => setDiscountModalOpen(false)}>Add Discount</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  )
}

export default Navbar