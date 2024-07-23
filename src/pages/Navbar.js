import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import './cartcheckout.css';
import './float.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import E_logo from './E_logo.png'
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
import Receipt from '../pages/Receipt'
import OrderHasReceived from '../pages/OrderHasReceived'
import cartImage from './shopcart.png';
import ringBell from './ringBell.png';
import useNetworkStatus from '../components/useNetworkStatus';
import { useIdleTimer } from "react-idle-timer";
import CountdownTimer from './CountdownTimer'; // Adjust the import path as needed
import Eshopingcart from '../components/e-shopingcart.png';  // Import the image
import Dashboard from "../components/dashboard";
import { db } from '../firebase/index';
import { query, where, limit, doc, onSnapshot } from "firebase/firestore";
import firebase from 'firebase/compat/app';

const Navbar = () => {
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);
  const { signInWithGoogle, signInWithGuest } = useUserContext();

  const handleTip = (percentage) => {
    const tip = Math.round(100 * totalPrice * (percentage / 100)) / 100;
    setTipAmount(tip.toFixed(2));
  };
  function stringTofixed(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
  }
  const handleCustomTip = () => {

    setTipAmount(parseFloat(!isNaN(customTip) && customTip.trim() !== "" ? customTip : 0).toFixed(2));
    setShowCustomTipInput(false);  // Optionally hide the input again after adding custom tip
  };

  const toggleCustomTipInput = () => {
    setShowCustomTipInput(!showCustomTipInput);
  };
  // Constants for the timeout and debounce time
  const FIVE_MINS = 1 * 30 * 1000; // 5 minutes in milliseconds
  const GENERAL_DEBOUNCE_TIME = 500; // 500 milliseconds

  // Function to be called when user is idle
  const handleOnUserIdle = () => {
    setOpenModalTimer(true)
  };
  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    // Check if the input is either empty or a positive number (including zero)
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setCustomTip(value);
    }
  };
  // Setting up the idle timer with a timeout and debounce
  useIdleTimer({
    timeout: FIVE_MINS, // time in milliseconds until the user is considered idle
    onIdle: handleOnUserIdle, // function to call when the user is idle
    debounce: GENERAL_DEBOUNCE_TIME // debounce time in milliseconds to wait before setting idle
  });



  const { isOnline } = useNetworkStatus();

  const googleTranslateElementInit = () => {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          includedLanguages: "en,zh-CN",
          autoDisplay: false
        },
        "google_translate_element"
      );
    } else {
      console.error('Google Translate not initialized correctly');
    }
  };


  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.translate) {
      googleTranslateElementInit();
      return;
    }

    var addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    addScript.onerror = function () {
      console.error('Failed to load the Google Translate script');
    };
    document.body.appendChild(addScript);
    window.googleTranslateElementInit = googleTranslateElementInit;
  }, []);
  const params = new URLSearchParams(window.location.search);

  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {

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

  const isMobile = width <= 768;


  const { logoutUser } = useUserContext();
  const { user, user_loading } = useUserContext();

  const location = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);

  //console.log(user)
  ///shopping cart products
  const [products, setProducts] = useState(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []);

  const [totalQuant, setTotalQuant] = useState(0);
  useEffect(() => {

    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products?.reduce((acc, item) => item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0);
      //console.log(total)
      setTotalPrice(total);
    }
    calculateTotalPrice();
    const calculateTotalQuant = () => {
      const total = products?.reduce((acc, product) => acc + (product.quantity), 0);
      //  console.log(total)
      $('#cart').attr("data-totalitems", total);
      setTotalQuant(total);
    }
    calculateTotalQuant();

    sessionStorage.setItem(store, JSON.stringify(products));
  }, [products, width]);

  const handleDeleteClick = (productId, count) => {
    setProducts((prevProducts) => {
      return prevProducts.filter((product) => product.count !== count);
    });
  }


  const handlePlusClick = (productId, targetCount) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && product.count === targetCount) {
          return {
            ...product,
            itemTotalPrice: Math.round(100 * product.itemTotalPrice / (product.quantity) * (Math.min(product.quantity + 1, 99))) / 100,
            quantity: Math.min(product.quantity + 1, 99),
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
          // Constrain the quantity of the product to be at least 0
          return {
            ...product,
            quantity: Math.max(product.quantity - 1, 1),
            itemTotalPrice: Math.round(100 * product.itemTotalPrice / (product.quantity) * (Math.max(product.quantity - 1, 1))) / 100,
          };
        }
        return product;
      });
    });
  };

  // modal. 
  const modalRef = useRef(null);
  const btnRef = useRef(null);
  const spanRef = useRef(null);
  const [shoppingCartOpen, setShoppingCartOpen] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0); // State to store the container height


  const openModal = () => {
    if (user) {
      //window.location.href = "/";
    } else {
      return
      //signInWithGuest()
    }
    setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))
    modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
  };

  const closeModal = () => {
    //console.log(products)
    if (openCheckout && directoryType === true) {
      setOpenCheckout(false)
    } else {
      modalRef.current.style.display = 'none';
      setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))
      setOpenCheckout(false)
    }

  };
  const btnRef2 = useRef(null);
  const spanRef2 = useRef(null);
  const queryParams = new URLSearchParams(location.search);
  const tableValue = params.get('table') ? params.get('table') : "";


  const [isDineIn, setIsDineIn] = useState(false);

  useEffect(() => {
    if (tableValue === "") {
      setIsDineIn(false)
      sessionStorage.setItem('table', tableValue)
    } else {
      sessionStorage.setItem('table', tableValue)
      setIsDineIn(true)
    }
  }, []); // Dependency array to re-run effect if 'name' changes

  const storeFromURL_modal = params.get('modal') ? params.get('modal').toLowerCase() : "";
  const [openModal2, setOpenModal2] = useState(storeFromURL_modal === 'true');
  const [openModalTimer, setOpenModalTimer] = useState(false);
  const { loading } = useUserContext();

  const [loadedAcct, setLoadedAcct] = useState(false);
  const [directoryType, setDirectoryType] = useState(false);

  useEffect(() => {
    const table = sessionStorage.getItem('table'); // Assuming 'table' value is correctly set in sessionStorage
    if (!store || !table) {
      console.log(store)
      console.log(table)
      console.error("Store or Table is not defined");
      return;
    }
    if (!user) {
      return
    }
    console.log("executing")
    const docRef = firebase.firestore()
      .collection('TitleLogoNameContent')
      .doc(store)
      .collection('TableIsSent')
      .doc(`${store}-${table}-isSent`);

    const unsubscribe = docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        console.log(data.product)

        sessionStorage.setItem("ReceiptDataDineIn", data.product)
        if (JSON.parse(data.product).length > 0) {
          setDirectoryType(true)
          openModal()

          setProducts(directoryType ? JSON.parse(data.product) : JSON.parse(sessionStorage.getItem(store)))
        }
      } else {
        console.log("No such document!");
      }
    }, err => {
      console.error("Error getting document:", err);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [user,directoryType]);

  useEffect(() => {
    const path = window.location.pathname; // Get the current URL path

    // Check if name is provided to avoid errors
    if (!path.includes('/store')) {
      return
    }
    const docRef = doc(db, "TitleLogoNameContent", store);
    // Set up the real-time subscription
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        console.log("Document data:", docSnapshot.data());
        const docData = docSnapshot.data();
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(docData));
        setLoadedAcct(true); // Assuming setLoadedAcct updates state to indicate data is loaded
      } else {
        console.log("No document found with the given name.");
      }
    }, (error) => {
      console.error("Error fetching the document:", error);
    });

    // Cleanup function to unsubscribe from the document when the component unmounts
    return () => unsubscribe();
  }, []); // Dependency array to re-run effect if 'name' changes


  //This will ensure that the useEffect hook is re-run every time the products value changes, and the latest value will be saved to local storage.
  //google login button functions

  const storeValue = params.get('store') ? params.get('store').toLowerCase() : ""; // should give "parkasia"
  if (!sessionStorage.getItem(storeValue)) {
    sessionStorage.setItem(storeValue, JSON.stringify([]));
  }
  const [openCheckout, setOpenCheckout] = useState(false);

  //console.log(storeValue)
  //console.log(tableValue)
  const HandleCheckout_local_stripe = async () => {

    setOpenCheckout(true)

    // if (isKiosk) {
    //   window.location.href = '/Checkout' + "?store=" + storeValue + kioskHash
    // } else if (!sessionStorage.getItem("table")) {
    //   window.location.href = '/Checkout' + "?store=" + storeValue
    // } else {
    //   window.location.href = '/Checkout' + "?store=" + storeValue + "&" + "table=" + sessionStorage.getItem("table")
    // }
  };
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = () => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Change this to control how long the text stays visible before fading out
  };
  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
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
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");
  useEffect(() => {
    // Get the modal
    const modal = modalRef.current;

    // When the user clicks anywhere outside of the modal, close it

    window.onclick = (event) => {
      if (event.target === modal && directoryType === false) {
        modal.style.display = "none";
      }
    }

  }, [directoryType]);// pass `products` as a dependency
  useEffect(() => {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        //console.log(url.hash)
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        return false;
      }
    };

    // Call the checkUrlFormat function and log the result
    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []); // Empty dependency array means this effect runs only once after the initial render
  // Example usage of the checkDirectory function;


  useEffect(() => {
    const path = window.location.pathname; // Get the current URL path

    const store = params.get('store')?.trim(); // Get 'store' parameter and trim any spaces
    const table = params.get('table')?.trim(); // Get 'table' parameter and trim any spaces
    console.log("checkDirectoryselfCheckout")
    console.log(path.includes('/store') && store && table && store.length > 0 && table.length > 0)
    if (store && table && store.length > 0 && table.length > 0) {
    } else {
      return
    }
    const docRef = firebase.firestore()
      .collection('TitleLogoNameContent')
      .doc(store)
      .collection('Table')
      .doc(`${store}-${table}`);

    const unsubscribe = docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        console.log("exist")
        console.log(data.product)
        //setProducts(directoryType ? JSON.parse(data.product) : JSON.parse(sessionStorage.getItem(store)))
        sessionStorage.setItem("ReceiptDataDineIn", data.product)

        saveId(Math.random());
      } else {
        console.log("No such document!");
      }
    }, err => {
      console.error("Error getting document:", err);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [openCheckout]);

  if (localStorage.getItem("Google-language") && localStorage.getItem("Google-language") !== null) {
  } else {
    localStorage.setItem("Google-language", "Select Language");
  }
  // the below code checks for language option changes with the google translate widget
  $(document).ready(function () {
    function listenToTranslateWidget() {
      if ($('.goog-te-combo').length) {
        $('.goog-te-combo').on('change', function () {
          let language = $("select.goog-te-combo option:selected").text();
          console.log(language);
          if (localStorage.getItem("Google-language") && localStorage.getItem("Google-language") !== null && language !== localStorage.getItem("Google-language")) {
            localStorage.setItem("Google-language", language);
            saveId(Math.random());  // generate a new id here
          }

        });
      } else {
        // If the widget is not yet loaded, wait and try again.
        setTimeout(listenToTranslateWidget, 1000); // Try again in 1 second
      }
    }

    listenToTranslateWidget();
  });

  if (location.pathname.includes('/testing_food')) {
    return (<div></div>)
  }

  function groupAndSumItems(items) {
    items.reverse();
    const groupedItems = {};

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


  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";




  return (

    <div>
      <style>
        {`
          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
      </style>

      {((location.pathname.includes('/store')) && !shoppingCartOpen) && (
        <a className="float" style={{ zIndex: "1000" }}>
          <a
            style={{ 'cursor': "pointer", "user-select": "none" }} onClick={openModal}>

            <div id="cart"
              style={{ width: "60px", height: "60px", 'color': '#444444' }}
              className="cart" data-totalitems={totalQuant} >

              <img src={cartImage} alt="Shopping Cart" />

            </div>
          </a>
        </a>
      )}

      {(/\/account/.test(location.pathname) && new URLSearchParams(location.hash.split('?')[1]).has('store')) && (
        <a className="float ">
          <a
            style={{ 'cursor': "pointer", "user-select": "none" }} onClick={() => { window.location.hash = `cards?store=${store}`; }}>

            <div id="ringbell"
              style={{ width: "60px", height: "60px", 'color': '#444444' }}
              className="ringbell" data-totalitems={totalQuant} >

              <img src={ringBell} alt="ringBell" />

            </div>
          </a>
        </a>
      )}

      {openModal2 && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl max-h-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg ">


              <div className="p-4">
                <div className='flex justify-between'>
                  You can view latest order here: (Take a screenshot if needed)
                  <DeleteSvg
                    className="cursor-pointer"
                    ref={spanRef2}
                    onClick={() => setOpenModal2(false)}
                  />
                </div>
                <OrderHasReceived />
                <Receipt />
              </div>

              <div className="flex justify-end space-x-2 p-4">

                <button onClick={() => setOpenModal2(false)}
                  // Updated to use hideModal
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
                  Confirm
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* {(openModalTimer && isKiosk) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-8">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inactive Alert</h2>
            <p className="text-gray-700 mb-6">
              It seems like you have been inactive for 30 seconds. Are you still on the page?
              This will automatically redirect to the main page in <CountdownTimer /> seconds.
            </p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={event => {
                  setOpenModalTimer(false)
                }}
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out">
                Yes, I Still Need More Time
              </button>
              <button className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                onClick={event => {
                  window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
                }}
              >
                No, Redirect Back To The Main Page Now
              </button>
            </div>
          </div>
        </div>

      )} */}

      <div ref={modalRef} className="foodcart-modal modal">


        {/* popup content */}
        <div className="shopping-cart" >

          {/* shoppig cart */}
          {!openCheckout ?
            <React.Fragment>
              <div className="title pb-1">

                <div className=' flex justify-end mb-2'>
                  {!directoryType ?
                    <DeleteSvg className="delete-btn " style={{ cursor: 'pointer', margin: '0' }} ref={spanRef} onClick={closeModal}></DeleteSvg>
                    : null}
                </div>


                <div className='flex' style={{ justifyContent: "space-between" }}>
                  <Hero directoryType={directoryType} isDineIn={isDineIn} setIsDineIn={setIsDineIn} className="mr-auto" style={{ marginBottom: "5px" }}>
                  </Hero>
                  {!directoryType ? null :
                    <div className='mt-2' id="google_translate_element"></div>}
                </div>
                {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { }}>show unpaid</button> */}
                <div className='flex' style={{ justifyContent: "space-between" }}>
                  <div>
                    {isKiosk ?
                      null :
                      <span className='flex' id="sub-title">
                        <div className='flex'>

                          {sessionStorage.getItem('table') != null && sessionStorage.getItem('table') != "" ?
                            <b >
                              <b style={{ borderRadius: "3px" }}>
                                Your dining table number is&nbsp;
                                <span className='notranslate'>
                                  {sessionStorage.getItem('table')}
                                </span>
                                &nbsp;
                              </b>
                              &nbsp;
                            </b> :
                            <b>You did not select dining table</b>

                          }

                        </div>

                      </span>
                    }
                    {directoryType ?
                      <div className='text-base'>
                        There is an unpaid order at this dining table that has already been sent to the kitchen. Please settle the existing bill before proceeding with other activities.</div>
                      : null
                    }
                    <div className='text-base'>Scroll down to checkout</div>

                  </div>

                  {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => { setDirectoryType(true) }}>Paid for order in this table</button> */}
                </div>
              </div>
              <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>

                {/* generates each food entry */}
                {products?.map((product) => (
                  // the parent div
                  // can make the parent div flexbox
                  <div key={product.count} className={` ${!isMobile ? "mx-4 my-2" : "mx-4 my-2"}`} >

                    {/* the delete button */}
                    {/* <div className="buttons">
                  <DeleteSvg className="delete-btn"
                    onClick={() => {
                      handleDeleteClick(product.id, product.count)
                    }}></DeleteSvg>
                </div> */}
                    {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}

                    {/* the image */}
                    {/* <div className="image">
                  <div class="image-container" >
                    <img style={{ marginLeft: '-7px' }} src={product.image} alt="" />
                  </div>
                </div> */}

                    {/* the name + quantity parent div*/}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "-webkit-fill-available" }}>
                      {/* the name */}
                      <div className="description" style={{ width: "-webkit-fill-available" }}>

                        <div className='flex-row' style={{ width: "-webkit-fill-available" }}>
                          <div class='notranslate text-black text-lg font-bold flex' style={{ justifyContent: "space-between", color: "black", width: "-webkit-fill-available" }}>
                            <div>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product.CHI) : (product.name)}
                            </div>
                            {!directoryType ? <div style={{ display: "flex" }}>

                              {/* the start of minus button set up */}
                              <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                                <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                  onClick={() => {
                                    if (product.quantity === 1) {
                                      handleDeleteClick(product.id, product.count);
                                    } else {
                                      handleMinusClick(product.id, product.count)
                                      //handleMinusClick(product.id);
                                    }
                                  }}>
                                  <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                                </button>
                              </div>
                              {/* the end of minus button set up */}

                              { /* start of the quantity number */}
                              <span
                                class="notranslate"
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
                            </div> : null


                            }

                          </div>

                          <div>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>

                        </div>
                      </div>

                      {/* <div className="theset"> */}
                      {/* start of quantity (quantity = quantity text + buttons div) */}
                      <div className="text-lg quantity p-0"
                        style={{ marginRight: "0px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div className='span'>
                          <div className="text-muted notranslate">@ ${
                            (Math.round(100 * product.itemTotalPrice / product.quantity) / 100).toFixed(2)
                          } {t("each")} x {product.quantity}</div>
                        </div>
                        {/* Using a pseudo-element to create a dashed line */}
                        <div className="dashed-line "></div>
                        <div className='notranslate'>${(Math.round(product.itemTotalPrice * 100) / 100).toFixed(2)}</div>
                      </div>

                      {/* end of quantity */}
                    </div>

                    {/* end of name + quantity parent div*/}
                  </div>

                ))}
                {totalPrice !== 0 ?
                  <div className={`total ${!isMobile ? "mx-4 my-2" : "mx-4 my-2"}`}>
                    <div className="row">
                      <div className="col">
                        <b> {t("Subtotal")}:</b>
                      </div>
                      <div className="col d-flex justify-content-end notranslate">
                        <b>${(Math.round(100 * totalPrice) / 100).toFixed(2)}

                        </b>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <b> {t("Tax")} 	&#40;8.25%&#41;:</b>
                      </div>
                      <div className="col d-flex justify-content-end notranslate">
                        <b>${(Math.round(100 * totalPrice * 0.0825) / 100).toFixed(2)}
                        </b>
                      </div>
                    </div>
                    {isDineIn ?
                      <div>
                        <div className="row">
                          <div className="col">
                            <b> {t("Service Fee (15%):")}</b>
                          </div>
                          <div className="col d-flex justify-end notranslate">
                            <b>${(Math.round(100 * totalPrice * 0.15) / 100).toFixed(2)}
                            </b>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col">
                            <div> {t("A service charge is applied only for dining in.")}</div>
                          </div>
                        </div>
                      </div>
                      : <div></div>
                    }
                    <div className="flex">
                      <div style={{ marginBottom: "5px" }}>
                        {
                          isDineIn ?
                            <b> {t("Extra Gratuity:")}</b> : <b> {t("Gratuity:")}</b>

                        }
                        <b className='notranslate'>({stringTofixed(parseFloat(tipAmount) / parseFloat(totalPrice) * 100)}%)</b>

                      </div>
                      <div className="notranslate col d-flex justify-content-end">
                        <b className='notranslate'>${stringTofixed(tipAmount)}</b>

                      </div>
                    </div>
                    <div>
                      {!isDineIn ? (
                        <div className="flex space-x-2 mb-2">
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(15)}>15%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(18)}>18%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(20)}>20%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleCustomTipInput}>Other</button>

                        </div>
                      ) : (
                        <div className="flex space-x-2 mb-2">
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(0)}>0%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(3)}>3%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleTip(5)}>5%</button>
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleCustomTipInput}>Other</button>

                        </div>
                      )}
                      {showCustomTipInput && (
                        <div className="my-2">
                          <input
                            type="number"
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={customTip}
                            onChange={handleCustomTipChange}
                            placeholder="Enter gratuity amount"
                          />
                          <button className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full" onClick={handleCustomTip}>
                            Add Gratuity Amount</button>
                        </div>
                      )}


                    </div>

                    <div className="row">
                      <div className="col">
                        <b> {t("Total Amount")}:</b>
                      </div>
                      <div className="notranslate col d-flex justify-content-end">
                        <b>
                          ${stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * 1.0825)
                            + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                          )

                          }
                        </b>
                      </div>

                    </div>
                  </div> : null}
                <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between' }}>

                  {totalPrice === 0 ?
                    <div className='mx-4'>
                      <div style={{ marginTop: "5px", }}>
                        <span>
                          <i style={{ fontSize: "35px" }} className="bi bi-cart-check"></i>
                          <span >&nbsp;{t("Your cart is currently empty.")}</span>
                        </span>
                      </div>
                    </div>
                    :
                    <button
                      style={{ width: "100%", border: "0px", margin: "auto" }}
                      class="rounded-md mx-4 border-0 text-white bg-orange-700 hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-between"
                      onClick={HandleCheckout_local_stripe}>
                      <span class="text-left">
                        <span >
                          <FontAwesomeIcon icon={faCreditCard} />
                        </span>
                        <span> &nbsp;Checkout Order
                        </span>
                      </span>

                      <span class="text-right notranslate">
                        ${stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * 1.0825)
                          + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                        )
                        }
                      </span>
                    </button>
                  }


                </div>


              </div>
            </React.Fragment> : null
          }


          {loading && !loadedAcct ? <h2>{t("Loading Payment")}...</h2> :
            <div>
              {openCheckout ?
                <React.Fragment>

                  <div className="title pb-1 flex justify-end ml-auto pb-1" style={{ "borderBottom": "0" }}>
                    <DeleteSvg className="delete-btn " style={{ cursor: 'pointer', margin: '0' }}
                      ref={spanRef} onClick={closeModal}>
                    </DeleteSvg>
                  </div>
                  {loading && !loadedAcct ? <h2>{t("Loading Payment")}...</h2> :
                    <div>
                      <Dashboard directoryType={directoryType} isDineIn={isDineIn} totalPrice={stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * 1.0825)
                        + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                      )
                      } />
                    </div>}

                </React.Fragment>

                : <div></div>
              }

            </div>}
        </div>

      </div>
      {/**navbar */}
      <div className={`pb-2 sticky top-0 z-20 ${!isMobile ? "mx-auto justify-between" : "justify-between"}`}>
        <div >
          {/* Your navbar content here */}
          <div className="col-span-4 pl-4 lg:ml-10 lg:mr-10" style={{ cursor: "pointer", display: 'flex', alignItems: 'center' }} >
            {isOnline ?
              <React.Fragment>
                <img

                  onClick={event => {
                    if (storeFromURL !== '' && storeFromURL !== null) {
                      if (isKiosk) {
                        window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
                      } else {
                        window.location.href = `/store?store=${storeFromURL}`;
                      }
                      if (!sessionStorage.getItem("table")) {
                        window.location.href = `/store?store=${storeFromURL}`
                      } else {
                        window.location.href = `/store?store=${storeFromURL}&table=${sessionStorage.getItem("table")}`
                      }
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  src={Eshopingcart}
                  style={{
                    maxHeight: '30px',
                    maxWidth: '30px',
                    objectFit: 'cover',   // this makes the image co0ver the entire dimensions
                  }} />
                <span onClick={event => {
                  if (storeFromURL !== '' && storeFromURL !== null) {
                    if (isKiosk) {
                      window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
                    } else {
                      window.location.href = `/store?store=${storeFromURL}`;
                    }
                    if (!sessionStorage.getItem("table")) {
                      window.location.href = `/store?store=${storeFromURL}`
                    } else {
                      window.location.href = `/store?store=${storeFromURL}&table=${sessionStorage.getItem("table")}`
                    }
                  } else {
                    window.location.href = '/';
                  }
                }} className='notranslate text-black text-xl font-bold'>
                  EatifyDash
                </span>
              </React.Fragment>
              : null}

            <div className='flex ml-auto pr-4 '>
              {!directoryType ?
                <div className='mt-2' id="google_translate_element"></div>
                : null}
              {((location.pathname.includes('/store')) || (location.pathname.includes('/Checkout'))) && (

                <button
                  className="ml-3"
                  onClick={() => setOpenModal2(true)}
                  style={{ cursor: "pointer", top: '-10px', fontSize: "20px" }}
                >
                  <i className="bi bi-file-earmark-text"></i>
                  {isMobile ?
                    <span></span> : <span>Notes</span>

                  }

                </button>
              )}
              {/* {((location.pathname.includes('/store'))) && (
                <>
                  <div id="cart"
                    style={{ position: 'relative', width: "", height: "", 'color': '#444444' }}
                    className="cart" data-totalitems={totalQuant} onClick={openModal} >

                    <div

                      style={{ fontSize: "20px" }}
                    >

                      <i className="bi bi-cart"></i>
                    </div>
                  </div>
                  <div onClick={openModal} style={{ fontSize: "20px", marginTop: "10px", marginleft: "-28px" }} >
                    {isMobile ?
                      <span></span> : <span>Shopping Cart</span>

                    }</div>

                </>


              )} */}
              {
                !isKiosk && (
                  !user_loading ? (
                    isOnline ? (
                      <button
                        className="ml-3"
                        onClick={(event) => {
                          // Determine the redirection URL based on the storeFromURL value
                          const redirectUrl = storeFromURL ? `/account?store=${storeFromURL}` : '/account';
                          window.location.href = redirectUrl;
                        }}
                        style={{ cursor: "pointer", top: '-10px', fontSize: "20px" }}
                      >
                        <i className="bi bi-person"></i>
                        <span>
                          {user ?
                            (isMobile ? "" : "Account")
                            :
                            (isMobile ? "" : "LogIn")
                          }
                        </span>
                      </button>
                    ) : null
                  ) : (
                    <div>Loading...</div>
                  )
                )
              }



            </div>

          </div>

        </div>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </div>
    </div>
  )
}

export default Navbar