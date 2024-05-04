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

const Navbar = () => {
  // Constants for the timeout and debounce time
  const FIVE_MINS = 1 * 30 * 1000; // 5 minutes in milliseconds
  const GENERAL_DEBOUNCE_TIME = 500; // 500 milliseconds

  // Function to be called when user is idle
  const handleOnUserIdle = () => {
    setOpenModalTimer(true)
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
          pageLanguage: "en",
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

  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const { logoutUser } = useUserContext();
  const { user, user_loading } = useUserContext();

  const location = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);

  //console.log(user)
  ///shopping cart products
  const [products, setProducts] = useState(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []);

  const [totalQuant, setTotalQuant] = useState(0);
  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products
    let height = 100;
    if (width > 575) {
      if (products && products.length > 0) {
        if (products.length < 5) {
          height = products.length * 123 + 100; // 123 is the height of each product element and 100 is the top and bottom margin of the shopping cart
        } else {
          height = 5 * 123 + 140; // set height to show only the first 5 items and the shopping cart header
        }
      }
    } else {

      height = (products?.length || 0) * 123 + 100;
    }

    //console.log("product changed")
    // Update the height of the shopping cart element
    const shoppingCart = document.querySelector('.shopping-cart');

    if (shoppingCart && shoppingCart.style) {
      shoppingCart.style.height = `${height}px`;
    }
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

  const openModal = () => {
    setShoppingCartOpen(true)
    setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))
    modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
  };

  const closeModal = () => {
    //console.log(products)
    modalRef.current.style.display = 'none';
    setShoppingCartOpen(false)
    setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))

  };
  const modalRef2 = useRef(null);
  const btnRef2 = useRef(null);
  const spanRef2 = useRef(null);
  const queryParams = new URLSearchParams(location.search);
  const tableValue = params.get('table') ? params.get('table') : "";

  if (tableValue === "") {
    if (sessionStorage.getItem('table')) {//存在过
      sessionStorage.setItem('table', tableValue)
      sessionStorage.setItem('isDinein', true)
    } else {//不存在
      sessionStorage.setItem('table', tableValue)
      sessionStorage.setItem('isDinein', false)
    }
  } else {
    sessionStorage.setItem('table', tableValue)
    sessionStorage.setItem('isDinein', true)
  }
  const storeFromURL_modal = params.get('modal') ? params.get('modal').toLowerCase() : "";
  const [openModal2, setOpenModal2] = useState(storeFromURL_modal === 'true');
  const [openModalTimer, setOpenModalTimer] = useState(false);


  useEffect(() => {
    // Get the modal
    const modal = modalRef.current;

    // Get the button that opens the modal
    const btn = btnRef.current;

    // Get the <span> element that closes the modal
    const span = spanRef.current;

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }
  }, [products]);// pass `products` as a dependency
  //This will ensure that the useEffect hook is re-run every time the products value changes, and the latest value will be saved to local storage.
  //google login button functions

  const storeValue = params.get('store') ? params.get('store').toLowerCase() : ""; // should give "parkasia"
  if (!sessionStorage.getItem(storeValue)) {
    sessionStorage.setItem(storeValue, JSON.stringify([]));
  }
  //console.log(storeValue)
  //console.log(tableValue)
  const HandleCheckout_local_stripe = async () => {
    if (isKiosk) {
      window.location.href = '/Checkout' + "?store=" + storeValue + kioskHash
    } else if (!sessionStorage.getItem("table")) {
      window.location.href = '/Checkout' + "?store=" + storeValue
    } else {
      window.location.href = '/Checkout' + "?store=" + storeValue + "&" + "table=" + sessionStorage.getItem("table")
    }
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

      {((location.pathname.includes('/store'))&&!shoppingCartOpen ) && (
        <a className="float">
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

      {(openModalTimer && isKiosk && location.pathname.includes('/Checkout')) && (
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

      )}

      <div ref={modalRef} className="foodcart-modal modal">


        {/* popup content */}
        <div className="shopping-cart" >

          {/* shoppig cart */}
          <div className="title" style={{ height: '80px' }}>


            <DeleteSvg className="delete-btn" style={{ 'postion': 'absolute', float: 'right', cursor: 'pointer', margin: '0' }} ref={spanRef} onClick={closeModal}></DeleteSvg>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {totalPrice === 0 ?
                <div>
                  <div style={{ marginTop: "5px", }}>
                    <span>
                      <i style={{ fontSize: "35px" }} className="bi bi-cart-check"></i>
                      <span >&nbsp;{t("Your cart is currently empty.")}</span>
                    </span>
                  </div>
                </div>
                :
                <button
                  style={{ width: "80%", border: "0px", margin: "auto" }}
                  class="w-900 mx-auto border-0 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-between"
                  onClick={HandleCheckout_local_stripe}>
                  <span class="text-left">                  <span >
                    {isMobile ?

                      <></>
                      : <FontAwesomeIcon icon={faCreditCard} />
                    }
                  </span>
                    <span> &nbsp;Checkout Order
                    </span>
                  </span>

                  <span class="text-right notranslate"> ${(Math.round(100 * totalPrice) / 100).toFixed(2)} </span>
                </button>
              }
            </div>
          </div>
          <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>

            {/* generates each food entry */}
            {products?.map((product) => (
              // the parent div
              // can make the parent div flexbox
              <div key={product.count} className="item">

                {/* the delete button */}
                <div className="buttons">
                  <DeleteSvg className="delete-btn"
                    onClick={() => {
                      handleDeleteClick(product.id, product.count)
                    }}></DeleteSvg>
                  {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}
                </div>
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
                      <div class='notranslate text-black text-lg ' style={{ color: "black", width: "-webkit-fill-available" }}>
                        {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product.CHI) : (product.name)}
                      </div>

                      <div>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>

                    </div>
                  </div>

                  {/* <div className="theset"> */}
                  {/* start of quantity (quantity = quantity text + buttons div) */}
                  <div className="quantity p-0"
                    style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className='notranslate'>${(Math.round(product.itemTotalPrice*100)/100).toFixed(2)}</div>

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
                    </div>
                    { /* end of the add minus setup*/}
                  </div>

                  {/* end of quantity */}
                </div>

                {/* end of name + quantity parent div*/}
              </div>

            ))}

          </div>
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
              <div className='mt-2' id="google_translate_element"></div>

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