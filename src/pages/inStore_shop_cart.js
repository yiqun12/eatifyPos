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
import { faCreditCard, faGift, faDollarSign, faShare, faPencilAlt, faTimes, faExchangeAlt, faArrowRight, faPrint } from '@fortawesome/free-solid-svg-icons';
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
import { collection, doc, setDoc, addDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { onSnapshot, query } from 'firebase/firestore';

import { db } from '../firebase/index';
import cartImage from './shopcart.png';
import "./inStore_shop_cart.css";
import PaymentComponent2 from "../pages/PaymentComponent2";
import Dnd_Test from '../pages/dnd_test';
import { isMobile } from 'react-device-detect';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ setIsAllowed, isAllowed, store, selectedTable, acct, openSplitPaymentModal }) => {
  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  const { user, user_loading } = useUserContext();

  const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    setProducts(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
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
  const [extra, setExtra] = useState(0);

  const toggleAllowance = () => {
    console.log(isAllowed)
    setIsAllowed(!isAllowed);
  };
  const [tableProductInfo, setTableProductInfo] = useState('[]');
  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };


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
    calculateTotalPrice();
    console.log("change price")
    console.log(tableProductInfo)
    //TO DO: get a better sync. this would write in database twice and this code is not working in mobile unless you get in the shopping cart.
    //GetTableProductInfo(store + "-" + selectedTable)
  }, [products, width, tips, discount, extra]);


  const handleDeleteClick = (productId, count) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    // Optional: Logging the product to be deleted
    const productToDelete = products.find((product) => product.id === productId && product.count === count);
    if (productToDelete) {
      console.log('Product before deletion:', productToDelete);
    }

    // Filter out the product to be deleted
    const updatedProducts = products.filter((product) => !(product.id === productId && product.count === count));

    // Update the table information with the new set of products
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
  };

  const handlePlusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = product.quantity + 1;
        const newTotalPrice = Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));

  };


  const handleMinusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = Math.max(product.quantity - 1, 0);
        const newTotalPrice = newQuantity > 0 ? Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100 : 0;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
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

  const listOrder = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "listOrder"), {
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

    try {
      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
          return //no item in the array no item isSent.
        } else {//delete all items
        }
      }
      if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {//nothing isSent
        const dateTime = new Date().toISOString();
        const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
          date: date,
          data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
          selectedTable: selectedTable
        });
        console.log("Document written with ID: ", docRef.id);
        SetTableIsSent(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")
        //localStorage.setItem(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")
      } else {//partially is sent
        compareArrays(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(store + "-" + selectedTable)))
        SetTableIsSent(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")
        //localStorage.setItem(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")

      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const [arr, setArr] = useState([]);

  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    console.log("docs");

    const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table");

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });

      });
      //setCheckProduct(docs)
      setArr(docs.map(element => element.id.slice((store + "-").length)))


    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Dependencies for useEffect

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
    if (add_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
        date: date,
        data: add_array,
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    }

    if (delete_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
        date: date,
        data: delete_array,
        selectedTable: selectedTable
      });
      console.log("DeleteSendToKitchen Document written with ID: ", docRef.id);
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
      extra_tip = Math.round(extra * 100) / 100
    }
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
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
          total: Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100,
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
      setProducts([]);
      setExtra(0)
      setInputValue("")
      setDiscount("")
      setTips("")

      SetTableInfo(store + "-" + selectedTable, "[]")
      SetTableIsSent(store + "-" + selectedTable + "-isSent", "[]")
      //localStorage.setItem(store + "-" + selectedTable + "-isSent", "[]")
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
  const [isChangeTableModal, setChangeTableModal] = useState(false);

  const openUniqueModal = () => setUniqueModalOpen(true);
  const closeUniqueModal = () => setUniqueModalOpen(false);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleCustomAmountChange = (event) => {
    setCustomAmount(event.target.value);
  };

  const calculateResult = () => {
    const x = parseFloat(inputValue);
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

  const calculateCustomAmount = (customAmoun_t) => {
    let amount;
    amount = parseFloat(customAmoun_t)
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
  function groupAndSumItems(items) {
    const groupedItems = {};
    items.reverse();
    items.forEach(item => {
      // Create a unique key based on id and JSON stringified attributes
      const key = `${item.id}-${JSON.stringify(item.attributeSelected)}`;

      if (!groupedItems[key]) {
        // If this is the first item of its kind, clone it (to avoid modifying the original item)
        groupedItems[key] = { ...item };
      } else {
        // If this item already exists, sum up the quantity and itemTotalPrice
        groupedItems[key].quantity += item.quantity;
        groupedItems[key].itemTotalPrice += item.itemTotalPrice;
        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
  }

  const mergeProduct = async (table_name) => {
    SetTableInfo_(`${store}-${table_name}`, JSON.stringify(groupAndSumItems(
      [...JSON.parse(localStorage.getItem(`${store}-${selectedTable}`)), ...JSON.parse(localStorage.getItem(`${store}-${table_name}`))]
    )))
    SetTableInfo_(`${store}-${selectedTable}`, JSON.stringify([]))
    SetTableIsSent(`${store}-${table_name}-isSent`, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(store + "-" + table_name + "-isSent")))))
    //localStorage.setItem(`${store}-${table_name}-isSent`,JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")),JSON.parse(localStorage.getItem(store + "-" + table_name + "-isSent")))))
    SetTableIsSent(`${store}-${selectedTable}-isSent`, JSON.stringify([]))
    //localStorage.setItem(`${store}-${selectedTable}-isSent`,JSON.stringify([]))

  };

  const SetTableInfo_ = async (table_name, product, id) => {
    try {

      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // console.log("Products from instroe_shop_cart", products)
  return (

    <div>
      <div class=''>
        <div className="flex w-full">
          <div style={{ overflowY: 'auto', maxHeight: '700px' }} className={`flex-grow  ${!isMobile ? 'm-6' : 'm-2'}`}>
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
              onClick={() => { setChangeTableModal(true) }}
              className="mt-3 btn btn-sm btn-link mx-1 border-black"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? <div></div> :
                <span className="pe-2">
                  <FontAwesomeIcon icon={faShare} />
                </span>
              }
              <span>{t("Change Dining Desk")}</span>
            </a>
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
              onClick={() => { SendToKitchen(); }}
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
              onClick={() => { listOrder(); }}
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
              onClick={() => { setSplitPaymentModalOpen(true); SendToKitchen() }}
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
              onClick={() => { setMyModalVisible(true); SendToKitchen() }}
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
              onClick={() => { OpenCashDraw(); openUniqueModal(); SendToKitchen() }}
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
            {(extra !== null && extra !== 0) && (
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
                    <p className="mb-2">Enter the Cash Received</p>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={handleChange}
                      style={uniqueModalStyles.inputStyle}
                      className="mb-4 p-2 w-full border rounded-md"
                      translate="no"
                    />
                    <button
                      onClick={calculateResult}
                      style={uniqueModalStyles.buttonStyle}
                      className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      Calculate Give Back Cash
                    </button>
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
                      <button onClick={() => { calculateExtra(0); setCustomAmountVisible(false) }} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        0
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
                            onClick={() => calculateCustomAmount(customAmount)}
                            className="bg-orange-500 text-white p-2 rounded-md w-1/3"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {(extra !== null && extra !== 0) && (
                      <p className="">Gratuity: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                    )}
                    <p className="mt-1">Receivable Payment: <span className='notranslate'>${finalPrice}</span> </p>

                    {result !== null && (
                      <div>
                        <p className="mt-1 mb-4 ">
                          Give Back Cash :

                          <span className='notranslate'>${Math.round((result - finalPrice) * 100) / 100}</span>
                        </p>
                        <button
                          onClick={() => {
                            setCustomAmount(Math.round((result - finalPrice) * 100) / 100); calculateCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                            CashCheckOut(Math.round((result - finalPrice) * 100) / 100);
                            closeUniqueModal();
                          }}
                          style={uniqueModalStyles.buttonStyle}
                          className="mt-2 mb-2 bg-green-500 text-white px-4 py-2 rounded-md w-full"
                        >
                          Put give back cash as Gratuity and Checkout Order
                        </button>

                      </div>
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
              style={{
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: '90%', width: '90%', height: "90%", margin: '0 auto', marginTop: '20px' }}
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
                    <Dnd_Test store={store} acct={acct} selectedTable={selectedTable} key={dndTestKey} main_input={products} />
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>

          )
          }

          {isChangeTableModal && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Dining Desk to Merge</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setChangeTableModal(false); }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">
                    {arr.map((option) => (

                      <button
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => { mergeProduct(option) }}
                      >
                        {option}
                      </button>

                    ))}
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

                    <PaymentComponent2 setDiscount={setDiscount} setTips={setTips} setExtra={setExtra} setInputValue={setInputValue} setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store} chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} totalPrice={Math.round(totalPrice*100)} />

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
                      <button onClick={() => handlePercentageTip(0.25)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                      {/* <input
                        type="number"
                        placeholder="Enter percent"
                        min="0"  // Add this line
                        value={customPercentage}
                        onChange={handleCustomPercentageChange}
                        className="px-4 py-2 ml-2 form-control tips-no-spinners"  // Added the 'no-spinners' class
                        translate="no" 
                      /> */}
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
                      translate="no"
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
                      <button onClick={() => handleDiscountPercentage(0.15)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        15%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.20)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.25)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter discount amount"
                      value={discount}
                      className="form-control discounts-no-spinners"
                      translate="no"
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