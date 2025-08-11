import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { useLocation, useNavigate } from 'react-router-dom';
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
import PaymentKiosk from "../pages/PaymentKiosk";
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import Logo from '../components/Logo';
import { DateTime } from 'luxon';

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
import { query, where, limit, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import firebase from 'firebase/compat/app';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc } from "firebase/firestore";
import { FaTrash } from 'react-icons/fa';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { getGlobalFailedItem } from '../pages/Food';
import { lookup } from 'zipcode-to-timezone';

import useGeolocation from '../components/useGeolocation';
import Terminal from '../components/Terminal';
import useSharedCart from '../hooks/useSharedCart';
import ActiveUsersIndicator from '../components/ActiveUsersIndicator';
// 定义一个变量来存储全局函数
let handleOpenModalGlobal = () => {
  console.error("handleOpenModal has not been initialized.");
};
let globalDirectoryType = false;



const Navbar = () => {
  const failedItem = getGlobalFailedItem();
  const [timeZone, setTimeZone] = useState(getTimeZoneByZip("11214")); // Default to Eastern Time Zone
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(''); // Add state for current time display

  function getTimeZoneByZip(zipCode) {
    // Use the library to find the timezone ID from the ZIP code
    const timeZoneId = lookup(zipCode);

    // Check if the timezone ID is in our timeZones list
    return timeZoneId;
  }

  // Add useEffect to update the time every second
  useEffect(() => {
    const updateClock = () => {
      try {
        const now = DateTime.now().setZone(timeZone);
        // 用 .toFormat 自定义 token
        const formatted = now.toFormat('M/d HH:mm:ss');
        setCurrentTimeDisplay(formatted);
      } catch (error) {
        console.error("Invalid timezone, using local time:", error);
        const now = DateTime.now();
        const formatted = now.toFormat('M/d HH:mm:ss');
        setCurrentTimeDisplay(formatted);
      }
    };


    updateClock(); // Initial update
    const timerId = setInterval(updateClock, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, [timeZone]); // Re-run effect if timeZone changes


  const { user, user_loading } = useUserContext();
  const [loadingContact, setLoadingContact] = useState(true);
  const [activeAddressId, setActiveAddressId] = useState(null);
  const [addNewAdress, setAddNewAdress] = useState(false);

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
    const path = window.location.pathname; // Get the current URL path
    console.log("user: ", user)
    function removeTranslateElement() {
      // 1. 清空容器
      const container = document.getElementById('google_translate_element');
      if (container) {
        container.innerHTML = '';
      }

      // 2. 移除翻译脚本
      const scripts = Array.from(document.getElementsByTagName('script'));
      scripts.forEach((s) => {
        if (s.src.includes('translate_a/element.js')) {
          s.parentNode.removeChild(s);
        }
      });

      // 3. 清理全局对象
      if (window.google && window.google.translate) {
        delete window.google.translate;
      }
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    }


    if (user === null) {
      removeTranslateElement()
      return;
    }

    console.log("1 widget")
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
  }, [user]);
  const params = new URLSearchParams(window.location.search);

  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table') : "";
  
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);




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

  const location = useLocation();
  const navigate = useNavigate();  // To modify the URL without a page refresh
  // Function to toggle the 'modal' parameter in the URL
  const toggleModal = () => {
    const searchParams = new URLSearchParams(location.search); // Get current URL search params
    const currentModalValue = searchParams.get('modal'); // Get the current 'modal' value

    searchParams.set('modal', 'false'); // Update the 'modal' parameter

    // Preserve the hash in the URL
    const currentHash = location.hash;

    // Update the URL with the modified search params and hash
    navigate({
      pathname: location.pathname,
      search: searchParams.toString(), // Convert the search params back to a string
      hash: currentHash // Include the current hash in the URL
    });
  };

  const [totalPrice, setTotalPrice] = useState(0);

  //console.log(user)
  ///shopping cart products
  
  // Check if this is a customer scan-to-order scenario vs admin/backend scenario
  // Admin scenario: has localStorage data with products (backend already placed order)
  // Customer scenario: no localStorage data or empty (fresh scan)
  const hasExistingLocalData = store && localStorage.getItem(store + "-" + tableValue) && 
    JSON.parse(localStorage.getItem(store + "-" + tableValue)).length > 0;
  
  const isCustomerScanOrder = store && tableValue && 
    store.trim() !== '' && tableValue.trim() !== '' && 
    !hasExistingLocalData; // Only use shared cart if no existing backend order
  
  // Use shared cart for customer scan-to-order, fallback to original localStorage for admin scenarios
  const sharedCart = useSharedCart(isCustomerScanOrder ? store : null, isCustomerScanOrder ? tableValue : null);
  
  // Products state - prioritize existing localStorage data (admin orders), then shared cart, then empty
  const [products, setProducts] = useState(() => {
    // First priority: existing localStorage data (admin placed orders)
    if (hasExistingLocalData) {
      return JSON.parse(localStorage.getItem(store + "-" + tableValue));
    }
    // Second priority: shared cart for customer scan orders
    if (isCustomerScanOrder && sharedCart.isSharedCart) {
      return sharedCart.products;
    }
    // Fallback: sessionStorage or empty
    return sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : [];
  });

  const [totalQuant, setTotalQuant] = useState(0);
  
  // Sync shared cart products to local state (only for customer scan orders)
  useEffect(() => {
    if (isCustomerScanOrder && sharedCart.isSharedCart && !sharedCart.loading && !hasExistingLocalData) {
      setProducts(sharedCart.products);
    }
  }, [sharedCart.products, sharedCart.loading, sharedCart.isSharedCart, isCustomerScanOrder, hasExistingLocalData]);
  
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

    // Only update sessionStorage for non-shared cart scenarios
    if (!isCustomerScanOrder || !sharedCart.isSharedCart) {
      sessionStorage.setItem(store, JSON.stringify(products));
    }
  }, [products, width, isCustomerScanOrder, sharedCart.isSharedCart]);

  const handleDeleteClick = (productId, count) => {
    // Use shared cart function only for customer scan orders without existing data
    if (isCustomerScanOrder && sharedCart.isSharedCart && !hasExistingLocalData) {
      sharedCart.handleDeleteClick(productId, count);
    } else {
      setProducts((prevProducts) => {
        return prevProducts.filter((product) => product.count !== count);
      });
    }
  }


  const handlePlusClick = (productId, targetCount) => {
    // Use shared cart function only for customer scan orders without existing data
    if (isCustomerScanOrder && sharedCart.isSharedCart && !hasExistingLocalData) {
      sharedCart.handlePlusClick(productId, targetCount);
    } else {
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
    }
  };

  const handleMinusClick = (productId, targetCount) => {
    // Use shared cart function only for customer scan orders without existing data
    if (isCustomerScanOrder && sharedCart.isSharedCart && !hasExistingLocalData) {
      sharedCart.handleMinusClick(productId, targetCount);
    } else {
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
    }
  };

  // modal. 
  const modalRef = useRef(null);
  const btnRef = useRef(null);
  const spanRef = useRef(null);
  const [shoppingCartOpen, setShoppingCartOpen] = useState(false);

  const openModal = () => {
    if (user) {
      console.log(user)
      //window.location.href = "/";
    } else {
      return
    }
    
    // Load products from appropriate source
    if (hasExistingLocalData) {
      // Admin placed order - use localStorage
      setProducts(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + tableValue))));
    } else if (isCustomerScanOrder && sharedCart.isSharedCart) {
      // Customer scan order - use shared cart
      setProducts(groupAndSumItems(sharedCart.products));
    } else {
      // Fallback - use sessionStorage
      setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))
    }
    modalRef.current.style.display = 'block';
    setShoppingCartOpen(true)
    // Retrieve the array from local storage
  };

  handleOpenModalGlobal = openModal;

  const [forceCancel, setForceCancel] = useState(0); // State to store the container height

  const closeModal = () => {
    //console.log(products)
    if (totalPrice === 0) {
      setShoppingCartOpen(false)
    }
    if (openCheckout && directoryType === true) {
      setOpenCheckout(false)

    } else {

      modalRef.current.style.display = 'none';
      setShoppingCartOpen(false)

      // Load products from appropriate source when closing modal
      if (hasExistingLocalData) {
        // Admin placed order - use localStorage
        setProducts(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + tableValue))));
      } else if (isCustomerScanOrder && sharedCart.isSharedCart) {
        // Customer scan order - use shared cart
        setProducts(groupAndSumItems(sharedCart.products));
      } else {
        // Fallback - use sessionStorage
        setProducts(groupAndSumItems(sessionStorage.getItem(store) !== null ? JSON.parse(sessionStorage.getItem(store)) : []))
      }
      setOpenCheckout(false)
      setAddNewAdress(false)
      setSuccessMessage('')
    }

  };
  const btnRef2 = useRef(null);
  const spanRef2 = useRef(null);
  const queryParams = new URLSearchParams(location.search);


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
    let unsubscribe = () => { };

    const init = async () => {
      try {
        const path = window.location.pathname; // Get the current URL path
        const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";
        console.log("sssssssssss")
        if (path.includes('/account')) {
          handleHashChange()
          function handleHashChange() {
            const hashValue = window.location.hash;
            console.log("hashvalue: ", hashValue)
            // example URL http://localhost:3000/account#code?store=dnd21
            // example hash value #code?store=dnd21

            // Split the hash value by the "?" character
            const parts = hashValue.split('?');

            // The part before the "?" mark will be in parts[0]
            const partBeforeQuestionMark = parts[0];

            console.log("Part before '?': ", partBeforeQuestionMark);

            // The part before the "?" mark will be in parts[0]
            const partAfterQuestionMark = parts[1];

            console.log("Part after '?': ", partAfterQuestionMark);

            // hashRedirect(hashValue);
            switch (partBeforeQuestionMark) {
              case '#createStore':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#person':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#charts':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#book':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#code':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#cards':
                redirectCharts(partAfterQuestionMark)
                break;
              case '#settings':
                redirectCharts(partAfterQuestionMark)
                break;
              // Add more cases for other hash values as needed...

              // this default is for the storeName cases
              default:
                break;
            }
          }
          function fetchStorelist() {
            return new Promise((resolve, reject) => {
              const colRef = collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent');
              const unsubscribe = onSnapshot(colRef,
                (snapshot) => {
                  const storeData = snapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                  }));
                  console.log("sssssssss")
                  console.log(storeData);
                  resolve(storeData.reverse());  // Resolve the promise with the data
                },
                (error) => {
                  reject(error);  // Reject the promise if there's an error
                }
              );

              return () => unsubscribe();  // Return a function to unsubscribe when no longer needed
            });
          }

          async function redirectCharts(partAfterQuestionMark) {
            // Check if partAfterQuestionMark is like store=dnd21
            if (partAfterQuestionMark.includes('store=')) {
              // Split partAfterQuestionMark by '=' to get the store value
              const parts = partAfterQuestionMark.split('=');

              // The second part of the resulting array (parts[1]) will be the store value
              const storeValue = parts[1];

              console.log("Store Value:", storeValue);

              try {
                const storelist = await fetchStorelist();
                console.log("storelist: ", storelist);

                // Find the index of the object whose .Name matches storeValue
                const index = storelist.findIndex(data => data.id === storeValue);

                if (index !== -1) {
                  // The object was found, you can access it using storelist[index]
                  const selectedStore = storelist[index];

                  // Now, you can perform actions with the selected store object
                  console.log("Selected Store:", selectedStore);
                  setTimeZone(getTimeZoneByZip(selectedStore.ZipCode))

                } else {
                  // The object with the specified Name was not found in the array
                  console.log("Store not found in storelist");
                }
              } catch (error) {
                console.error("Error fetching storelist:", error);
              }
            }
          }

        }
      } catch (err) {
        console.error("Error getting document:", err);
      }
    };

    init();

    return () => {
      // 清理订阅或副作用
      unsubscribe();
    };
  }, []);

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
    const path = window.location.pathname; // Get the current URL path

    if (path.includes('/account')) {
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

        //sessionStorage.setItem("ReceiptDataDineIn", data.product)
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
  }, [user, directoryType]);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
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
  const [pickup, setPickup] = useState(true);

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
        setShoppingCartOpen(false)
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

  const [showInputs, setShowInputs] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryID, setDeliveryID] = useState('');

  const [dropoffAddress, setDropoffAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [dropoffPhoneNumber, setDropoffPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const [deliveryContacts, setDeliveryContacts] = useState([]);
  const deleteDeliveryContact = async (contactId) => {
    try {
      const contactDoc = doc(db, "stripe_customers", user.uid, "deliveryContact", contactId);
      await deleteDoc(contactDoc);
      console.log("Document successfully deleted!");
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };
  // useEffect hook to listen for updates on the collection
  useEffect(() => {
    console.log("isauwojsaio")

    if (pickup) {
      return
    }

    if (user && user.uid) {
      const unsubscribe = onSnapshot(collection(db, "stripe_customers", user.uid, "deliveryContact"), (snapshot) => {
        const contacts = [];
        snapshot.forEach(doc => {
          contacts.push({ id: doc.id, ...doc.data() });
        });
        console.log(contacts)
        setDeliveryContacts(contacts.sort((a, b) => b.modifiedAt.seconds - a.modifiedAt.seconds));
        if (contacts.length === 0) {
          setDropoffPhoneNumber('');
          setZipCode('');
          setState('');
          setCity('');
          setDropoffAddress('');
          setActiveAddressId(null);  // Set this to null at the end after clearing other states                                  
          setAddNewAdress(true)
        }
        console.log("Updated contacts: ", contacts);
        setActiveAddressId(contacts[0]?.id); // Set the first contact as active initially
        setDropoffPhoneNumber(contacts[0].dropoffPhoneNumber);
        setZipCode(contacts[0].zipCode);
        setState(contacts[0].state);
        setCity(contacts[0].city);
        setDropoffAddress(contacts[0].dropoffAddress);
        setLoadingContact(false);
      }, (error) => {
        setLoadingContact(false);
        console.error("Failed to subscribe to collection changes: ", error);
      });

      return () => unsubscribe(); // Cleanup subscription
    }
  }, [user, pickup]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("deliveryContacts has changed:", deliveryContacts);
    // Perform any additional actions here when deliveryContacts changes

  }, [deliveryContacts]); // This effect runs whenever deliveryContacts changes

  const handleClickDelivery = () => {
    setShowInputs(!showInputs);
    setPickup(!pickup)
    setSuccessMessage(''); // Reset success message when showing inputs again
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateAddress = (address) => {
    const addressRegex = /^\d+\s[A-z]+\s[A-z]+/;
    return address;
    return addressRegex.test(address);
  };
  const validateZipCode = (zipCode) => {
    const zipCodeRegex = /^\d{5}(-\d{4})?$/; // Validates standard 5-digit or 9-digit ZIP codes
    return zipCodeRegex.test(zipCode);
  };

  const validateCity = (city) => {
    const cityRegex = /^[a-zA-Z\s]+$/; // Validates that city contains only letters and spaces
    return cityRegex.test(city);
  };

  const validateState = (state) => {
    const stateRegex = /^[a-zA-Z\s]+$/; // Validates that state contains only letters and spaces
    return stateRegex.test(state);
  };

  const handleSubmitDelivery = async () => {
    setIsSubmitting(true); // Disable the button when the submission starts
    let validationErrors = {};
    if (!city) {
      validationErrors.city = 'City cannot be empty';
    } else if (!validateCity(city)) {
      validationErrors.city = 'Invalid city format. Only letters and spaces are allowed';
    }
    if (!zipCode) {
      validationErrors.zipCode = 'ZIP Code cannot be empty';
    } else if (!validateZipCode(zipCode)) {
      validationErrors.zipCode = 'Invalid ZIP Code format. Use 5 or 9 digits (e.g., 12345 or 12345-6789)';
    }
    if (!state) {
      validationErrors.state = 'State cannot be empty';
    } else if (!validateState(state)) {
      validationErrors.state = 'Invalid state format. Only letters and spaces are allowed';
    }

    if (!dropoffAddress) {
      validationErrors.dropoffAddress = 'Dropoff Address cannot be empty';
    } else if (!validateAddress(dropoffAddress)) {
      validationErrors.dropoffAddress = 'Invalid address format';
    }

    if (!dropoffPhoneNumber) {
      validationErrors.dropoffPhoneNumber = 'Dropoff Phone Number cannot be empty';
    } else if (!validatePhoneNumber(dropoffPhoneNumber)) {
      validationErrors.dropoffPhoneNumber = 'Invalid phone number format. Example: 4155552671';
    }


    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage(''); // Ensure success message is hidden if there are errors
      if (activeAddressId === null && deliveryContacts.length > 0 && !addNewAdress) {
        setSuccessMessage('No delivery address box selected. Please choose a delivery address box to proceed.'); // Ensure success message is hidden if there are errors
      }
      setIsSubmitting(false); // Re-enable the button if an exception occurs

      return;
    }

    setErrors({});
    setSuccessMessage('');

    console.log({
      dropoff_address: dropoffAddress,
      dropoff_phone_number: dropoffPhoneNumber,
      dropoff_instructions: "Please Call or Text " + formatPhoneNumber(dropoffPhoneNumber) + " when you are here",
    });

    const currency = 'usd';
    function formatAmountForStripe(amount, currency) {
      return zeroDecimalCurrency(amount, currency) ? amount : Math.round(amount * 100);
    }
    function zeroDecimalCurrency(amount, currency) {
      let numberFormat = new Intl.NumberFormat(['en-US'], {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
      });
      const parts = numberFormat.formatToParts(amount);
      let zeroDecimalCurrency = true;
      for (let part of parts) {
        if (part.type === 'decimal') {
          zeroDecimalCurrency = false;
        }
      }
      return zeroDecimalCurrency;
    }
    console.log(dropoffAddress + " " + city + " " + state);
    const transformedItems = JSON.parse(sessionStorage.getItem(store)).map(item => ({
      name: item.name + " " + item.CHI + " " + Object.entries(item.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' '),
      quantity: item.quantity,
      external_id: item.id
    }));
    console.log(transformedItems);
    console.log(user.uid)
    function formatPhoneNumber(number) {
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }

    console.log("addNewAdress")
    console.log(addNewAdress)

    try {
      const myFunction = firebase.functions().httpsCallable('requestQuoteDoordash');
      const uid = uuidv4()
      console.log("helloooo")
      console.log(dropoffAddress + " " + city + " " + state + " " + zipCode)
      const response = await myFunction({
        storeNickName: JSON.parse(sessionStorage.getItem("TitleLogoNameContent")).Name + " " + JSON.parse(sessionStorage.getItem("TitleLogoNameContent")).storeNameCHI,
        uid: uid,
        dropOffUserId: user.uid,
        dropoff_address: dropoffAddress + " " + city + " " + state + " " + zipCode,
        dropoff_phone_number: dropoffPhoneNumber,
        dropoff_instructions: "Please Call or Text " + formatPhoneNumber(dropoffPhoneNumber) + " when you are here",
        tips: Math.round(stringTofixed(tipAmount) * 100),
        items: transformedItems,
        businessId: JSON.parse(sessionStorage.getItem("TitleLogoNameContent")).storeOwnerId,
        storeId: store,
        orderValue: Math.round(parseFloat(totalPrice).toFixed(2) * 100),
      });

      if (response.data.message) {//error
        setSuccessMessage((JSON.stringify(response.data)) || '');
      } else {
        if (addNewAdress && activeAddressId != null) {//edit
          try {
            const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "deliveryContact"), {
              dropoffAddress,
              city,
              state,
              zipCode,
              dropoffPhoneNumber,
              modifiedAt: serverTimestamp() // This adds the timestamp
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (error) {
            console.error("Error adding document: ", error);
          }
          try {
            const contactDoc = doc(db, "stripe_customers", user.uid, "deliveryContact", activeAddressId);
            await deleteDoc(contactDoc);
            console.log("Document successfully deleted!");
          } catch (error) {
            console.error("Error removing document: ", error);
          }
        } else if (!addNewAdress && activeAddressId != null) {//use existing address
          try {
            const contactDoc = doc(db, "stripe_customers", user.uid, "deliveryContact", activeAddressId);
            await updateDoc(contactDoc, {
              modifiedAt: serverTimestamp()  // Update only the modifiedAt field
            });
            console.log("Document successfully deleted!");
          } catch (error) {
            console.error("Error removing document: ", error);
          }
        } else {//use new address
          try {
            const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "deliveryContact"), {
              dropoffAddress,
              city,
              state,
              zipCode,
              dropoffPhoneNumber,
              modifiedAt: serverTimestamp() // This adds the timestamp
            });
            console.log("Document written with ID: ", docRef.id);
          } catch (error) {
            console.error("Error adding document: ", error);
          }
        }

        setDeliveryFee(response.data.fee)
        setDeliveryID(response.data.external_delivery_id)

        HandleCheckout_local_stripe()

      }
    } catch (error) {
      console.error('Error requesting quote:', error);
      // Handle the error appropriately
    }
    setIsSubmitting(false); // Re-enable the button if an exception occurs

    // Add any other logic you need to handle the form submission
  };
  const [location2, getLocation] = useGeolocation();

  function checkGeolocation() {
    console.log("hello")
    getLocation().then((newLocation) => {
      console.log(newLocation.latitude, newLocation.longitude);
      async function getAddress(lat, lng, apiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        try {
          const response = await fetch(`${url}?latlng=${lat},${lng}&key=${apiKey}`);
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
          } else {
            return "No address found for the given coordinates.";
          }
        } catch (error) {
          return `Error: ${error.message}`;
        }
      }

      // Example usage
      const latitude = newLocation.latitude;
      const longitude = newLocation.longitude;
      const apiKey = "AIzaSyCzQFlkWHAXd9NUcxXA2Xl7eCj6lM_w6Ww"; // Replace with your API key

      getAddress(latitude, longitude, apiKey)
        .then(address => {
          const addressParts = address.split(", ");
          const [street, city, stateZip] = addressParts;
          const [state, zipCode] = stateZip.split(" ");

          console.log(address)
          // setFormValues({
          //   ...formValues,
          //   ["physical_address"]: street.trim(),
          //   ["city"]: city.trim(),
          //   ["State"]: state.trim(),
          //   ["ZipCode"]: zipCode.trim(),
          // });
          setDropoffAddress(street.trim());
          setZipCode(zipCode.trim());
          setState(state.trim());
          setCity(city.trim());

          //alert(address + " added successfully!"); // Alert message for successful upload
        })
        .catch(err => console.error(err));

    });
  }


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
    if (path.includes('/account')) {
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
        //sessionStorage.setItem("ReceiptDataDineIn", data.product)

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



  globalDirectoryType = directoryType;



  return (

    <div>
      <style>
        {`
          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}

      </style>

      {((location.pathname.includes('/store'))) && (
        <a className="float"

        > {/* Fixed z-index to zIndex */}
          <a
            style={{ 'cursor': "pointer", "user-select": "none" }} onClick={openModal}>

            <div id="cart"
              style={{ width: "60px", height: "60px", 'color': '#444444', position: 'relative' }}
              className="cart" data-totalitems={totalQuant} >

              <img src={cartImage} alt="Shopping Cart" />
              
              {/* Show active users indicator for shared cart (only for customer scan orders) */}
              {/* {isCustomerScanOrder && sharedCart.isSharedCart && !hasExistingLocalData && (
                <ActiveUsersIndicator
                  activeUsers={sharedCart.activeUsers}
                  isOnline={sharedCart.isOnline}
                  isSharedCart={true}
                  currentUserId={sharedCart.cartManager?.userId}
                  style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '-60px',
                    minWidth: '120px'
                  }}
                />
              )} */}

            </div>
          </a>
        </a>
      )}

      {(/\/account/.test(location.pathname) && new URLSearchParams(location.hash.split('?')[1]).has('store')) && (
        <a className="floatBell ">
          <a
            style={{ 'cursor': "pointer", "user-select": "none" }} onClick={() => {
              window.location.hash = `cards?store=${new URLSearchParams(window.location.hash.split('?')[1]).get('store')}`;
            }}>

            <div id="ringbell"
              style={{ width: "60px", height: "60px", 'color': '#444444' }}
              className="ringbell" data-totalitems={totalQuant} >

              <img src={ringBell} alt="ringBell" />

            </div>
          </a>
        </a>
      )}

      {openModal2 && (
        <div className="fixed inset-0 z-[9999] flex justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-2xl max-h-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg ">


              <div className="p-4">
                <div className='flex justify-between'>
                  You can view latest order here: (Take a screenshot if needed)
                  <DeleteSvg
                    className="cursor-pointer"
                    ref={spanRef2}
                    onClick={() => {
                      setOpenModal2(false); // First, close the modal
                      toggleModal();        // Then, toggle the modal parameter in the URL
                    }}
                  />
                </div>
                <OrderHasReceived />
                <Receipt />
              </div>

              <div className="flex justify-end space-x-2 p-4">

                <button onClick={() => {
                  setOpenModal2(false); // First, close the modal
                  toggleModal();        // Then, toggle the modal parameter in the URL
                }}

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 px-4 py-8">
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

      <div ref={modalRef} className="foodcart-modal modal" >

        {/* popup content */}
        <div className="shopping-cart" style={{ overflow: "auto" }}>
          {/* shoppig cart */}
          {!openCheckout ?
            <React.Fragment>
              <div className="title pb-1">

                <div className=' flex justify-end mb-2'>

                  {!showInputs && (
                    <DeleteSvg
                      className="delete-btn"
                      style={{ cursor: 'pointer', margin: '0' }}
                      ref={spanRef}
                      onClick={closeModal}
                    />
                  )}

                  {showInputs && (
                    <DeleteSvg
                      className="delete-btn"
                      style={{ cursor: 'pointer', margin: '0' }}
                      ref={spanRef}
                      onClick={() => {
                        handleClickDelivery();
                        setDropoffPhoneNumber('');
                        setZipCode('');
                        setState('');
                        setCity('');
                        setDropoffAddress('');
                        setActiveAddressId(null); // Clear the state
                        setDeliveryFee(0);
                        setAddNewAdress(false);
                        setSuccessMessage('');
                      }}
                    />
                  )}


                </div>


                <div className='flex' style={{ justifyContent: "space-between" }}>
                  <Hero isKiosk={isKiosk} directoryType={directoryType} isDineIn={isDineIn} setIsDineIn={setIsDineIn} className="mr-auto" style={{ marginBottom: "5px" }}>
                  </Hero>
                </div>
                {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => { }}>show unpaid</button> */}
                <div className='flex' style={{ justifyContent: "space-between" }}>
                  <div>
                    {isKiosk ?
                      null :
                      <span className='flex' id="sub-title">
                        <div className='flex'>

                          {sessionStorage.getItem('table') != null && sessionStorage.getItem('table') != "" ?
                            <div>
                              <div >
                                <b style={{ borderRadius: "3px" }}>
                                  Your dining table number is&nbsp;
                                  <span className='notranslate'>
                                    {sessionStorage.getItem('table')}
                                  </span>
                                  &nbsp;
                                </b>
                                &nbsp;
                              </div>
                              <div>
                              </div>
                            </div>
                            :
                            <div>
                              <div>

                                <b>You are currently in takeout mode.</b>
                              </div>

                            </div>
                          }

                        </div>

                      </span>
                    }
                    {failedItem ?
                      <span class='text-red-700'>
                        <span className='notranslate'>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(failedItem.CHI) : (failedItem.name)}
                        </span>
                        &nbsp;Failed to add
                      </span>
                      :
                      <span></span>}
                    {directoryType ?
                      <div className='text-base'>
                        An unpaid order has been sent to the kitchen. Please settle the bill before ordering again.</div>
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
                {
                  pickup ? (products?.map((product) => (
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

                  ))
                  ) : null
                }
                {totalPrice !== 0 && pickup ?

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
                        <b> {t("Tax")} 	&#40;{JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate}%&#41;:</b>
                      </div>

                      <div className="col d-flex justify-content-end notranslate">
                        <b>${(Math.round(100 * totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1)) / 100).toFixed(2)}
                        </b>
                      </div>
                    </div>
                    {!isKiosk && (
                      isDineIn ? (
                        <div>
                          <div className="row">
                            <div className="col">
                              <b>{t("Service Fee (15%):")}</b>
                            </div>
                            <div className="col d-flex justify-end notranslate">
                              <b>${(Math.round(100 * totalPrice * 0.15) / 100).toFixed(2)}</b>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col">
                              <div>{t("A service charge is applied only for dining in.")}</div>
                            </div>
                          </div>
                        </div>
                      ) : null
                    )}


                    {isKiosk ? null :
                      <div>
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
                          {pickup ? (
                            !isDineIn ? (
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
                            )
                          ) : null}

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
                                Add Cash Gratuity Amount
                              </button>
                            </div>
                          )}
                        </div>
                      </div>}
                    {isKiosk ?
                      <div className="row">
                        <div className="col">
                          <b> {t("Total Amount")}:</b>
                        </div>
                        <div className="notranslate col d-flex justify-content-end">
                          <b>
                            ${parseFloat(stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))))
                            }
                          </b>
                        </div>

                      </div>
                      :
                      <div className="row">
                        <div className="col">
                          <b> {t("Total Amount")}:</b>
                        </div>
                        <div className="notranslate col d-flex justify-content-end">
                          <b>
                            ${stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))
                              + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                            )

                            }
                          </b>
                        </div>

                      </div>
                    }

                  </div> : null}
                <div className="mb-3" >

                  {totalPrice === 0 ?
                    <div className='mx-4'>
                      <div style={{ marginTop: "5px", }}>
                        <span>
                          <i style={{ fontSize: "35px" }} className="bi bi-cart-check"></i>
                          <span >&nbsp;{t("Your cart is currently empty.")}</span>
                        </span>
                        {
                          isKiosk ?
                            <div style={{ display: "none" }}>
                              <PaymentKiosk
                                openCheckout={shoppingCartOpen}
                                receipt_JSON={JSON.stringify(products)}
                                storeID={store}
                                chargeAmount={parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))}
                                connected_stripe_account_id={
                                  JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.stripe_store_acct
                                }
                                service_fee={0}
                                selectedTable={isDineIn ? "堂食DineIn" : "外卖TakeOut"}
                              />
                            </div> : null
                        }
                      </div>
                    </div>
                    :
                    <div class=" mx-4">
                      {pickup && !isKiosk ?
                        <button
                          style={{ width: "100%", border: "0px", margin: "auto" }}
                          class="rounded-md border-0 text-white bg-orange-700 hover:bg-orange-800 focus:outline-none focus:ring-4 focus:ring-orange-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-between"
                          onClick={HandleCheckout_local_stripe}>
                          <span class="text-left">
                            <span >
                              <FontAwesomeIcon icon={faCreditCard} />
                            </span>
                            <span> &nbsp;Pickup/Dine-In Only
                            </span>
                          </span>

                          <span class="text-right notranslate">
                            ${stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))
                              + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                            )
                            }
                          </span>
                        </button> : null

                      }
                      {
                        isKiosk ?
                          <PaymentKiosk openCheckout={shoppingCartOpen} receipt_JSON={JSON.stringify(products)}
                            storeID={store} chargeAmount={parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))} connected_stripe_account_id={JSON.parse(sessionStorage.getItem("TitleLogoNameContent")).stripe_store_acct}
                            service_fee={0} selectedTable={isDineIn ? '堂食DineIn' : "外卖TakeOut"}
                            forceCancel={forceCancel}
                          /> : null
                      }

                      {!isKiosk && !isDineIn && (
                        !showInputs ? (
                          <div>
                            <button
                              style={{ width: "100%", border: "0px", margin: "auto" }}
                              className="rounded-md border-0 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex"
                              onClick={() => {
                                handleClickDelivery();
                              }}

                            >
                              <span >
                                <FontAwesomeIcon icon={faTruck} />
                              </span>
                              <span> &nbsp;Request Food Delivery
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className='flex justify-between'>
                              {
                                addNewAdress ?
                                  <button
                                    className="mt-2 rounded-md border-0 text-white bg-red-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium text-sm px-2.5 py-2.5 text-center mr-2 mb-2 flex"

                                    onClick={() => {
                                      checkGeolocation()
                                    }}
                                  >
                                    Detect Location
                                  </button>
                                  :
                                  <button
                                    style={{ border: "0px" }}
                                    className="mt-2 rounded-md border-0 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium text-sm px-2.5 py-2.5 text-center mr-2 mb-2 flex"
                                    onClick={() => {
                                      setDropoffPhoneNumber('');
                                      setZipCode('');
                                      setState('');
                                      setCity('');
                                      setDropoffAddress('');
                                      setActiveAddressId(null);  // Set this to null at the end after clearing other states                                  
                                      setAddNewAdress(true)
                                    }}
                                  >
                                    Add New Address
                                  </button>
                              }

                              <button
                                style={{ border: "0px" }}
                                className="mt-2 rounded-md border-0 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-2.5 py-2.5 text-center mb-2 flex"
                                onClick={() => {
                                  handleClickDelivery();
                                  setDropoffPhoneNumber('');
                                  setZipCode('');
                                  setState('');
                                  setCity('');
                                  setDropoffAddress('');
                                  setActiveAddressId(null);  // Set this to null at the end after clearing other states
                                  setDeliveryFee(0)
                                  setAddNewAdress(false);
                                  setSuccessMessage('')
                                }}

                              >
                                Back
                              </button>
                            </div>
                            {loadingContact ?
                              null
                              :
                              <div className="grid grid-cols-1 gap-2 mb-2">
                                {deliveryContacts.map((address) => (
                                  <div
                                    key={address.id}
                                    className={`p-2 bg-white rounded border transition-all duration-300 
                                    ${activeAddressId === address.id ? 'border-gray-300' : 'border-gray-300'}`}
                                    onClick={() => {
                                      // Handle the click event on the whole box
                                      // if (activeAddressId === address.id) {
                                      //   setActiveAddressId(null);
                                      // } else {
                                      //   setDropoffPhoneNumber(address.dropoffPhoneNumber);
                                      //   setZipCode(address.zipCode);
                                      //   setState(address.state);
                                      //   setCity(address.city);
                                      //   setDropoffAddress(address.dropoffAddress);
                                      //   setActiveAddressId(address.id);
                                      // }
                                      setDropoffPhoneNumber(address.dropoffPhoneNumber);
                                      setZipCode(address.zipCode);
                                      setState(address.state);
                                      setCity(address.city);
                                      setDropoffAddress(address.dropoffAddress);
                                      setActiveAddressId(address.id);
                                      setAddNewAdress(false)
                                    }}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <div className='flex'>
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={activeAddressId === address.id}
                                            readOnly
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevents the checkbox click from stopping the parent div's onClick
                                            }}
                                          />
                                        </label>
                                        <span className="text-black text-md notranslate">{address.dropoffAddress}</span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents the setActiveAddressId from triggering when the button is clicked
                                          deleteDeliveryContact(address.id);
                                        }}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>
                                    <span className="notranslate text-gray-500 text-sm block mb-1">
                                      {address.city}, {address.state} {address.zipCode}
                                    </span>
                                    <div className=" flex justify-between items-center mb-1">
                                      <span className="text-gray-500 text-sm notranslate">Phone: {address.dropoffPhoneNumber}</span>
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents the setActiveAddressId from triggering when the button is clicked
                                          setAddNewAdress(true)
                                          setDropoffPhoneNumber(address.dropoffPhoneNumber);
                                          setZipCode(address.zipCode);
                                          setState(address.state);
                                          setCity(address.city);
                                          setDropoffAddress(address.dropoffAddress);
                                          setActiveAddressId(address.id);
                                        }}
                                        className="cursor-pointer px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                                        <FontAwesomeIcon icon={faEdit} />
                                        <span>&nbsp;Edit</span>
                                      </div>
                                    </div>

                                  </div>
                                ))}
                              </div>



                            }


                          </div>
                        )
                      )}


                      {((!loadingContact && showInputs && !deliveryContacts.length > 0) || (showInputs && addNewAdress)) && (
                        <div>
                          <div className="mb-2">
                            <label htmlFor="dropoffAddress" className="block text-sm font-medium text-gray-700">
                              Delivery Street
                            </label>
                            <input
                              type="text"
                              id="dropoffAddress"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={dropoffAddress}
                              onChange={(e) => setDropoffAddress(e.target.value)}
                            />
                            {errors.dropoffAddress && <p className="text-red-500 text-xs mt-1">{errors.dropoffAddress}</p>}
                          </div>

                          <div className="mb-2">
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                          </div>

                          <div className="mb-2">
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                              State
                            </label>
                            <input
                              type="text"
                              id="state"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                            />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                          </div>
                          <div className="mb-2">
                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              id="zipCode"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value)}
                            />
                            {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p >}
                          </div>
                          <div className="mb-2">
                            <label htmlFor="dropoffPhoneNumber" className="block text-sm font-medium text-gray-700">
                              Contact Phone Number
                            </label>
                            <input
                              type="text"
                              id="dropoffPhoneNumber"
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={dropoffPhoneNumber}
                              onChange={(e) => setDropoffPhoneNumber(e.target.value)}
                            />
                            {errors.dropoffPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.dropoffPhoneNumber}</p>}
                          </div>

                        </div>
                      )}
                      {showInputs && (
                        <button
                          style={{ borderRadius: "0.2rem", width: "100%" }}
                          class="rounded-md border-0 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-between"
                          onClick={handleSubmitDelivery}
                          disabled={isSubmitting}
                        >
                          <span class="text-left">
                            <span >
                              <FontAwesomeIcon icon={faCreditCard} />
                            </span>

                            <span>Order Total: ${stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))
                              + parseFloat(isDineIn ? totalPrice * 0.15 : 0)
                            )
                            } + delivery</span>

                          </span>

                        </button>)

                      }

                      {successMessage && (
                        <div className='text-red'>
                          Error:
                          {successMessage}
                        </div>

                      )}
                    </div>

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
                      <Dashboard
                        dropoffAddress={dropoffAddress}
                        products={products}
                        deliveryID={deliveryID} deliveryFee={deliveryFee} directoryType={directoryType} isDineIn={isDineIn} totalPrice={stringTofixed(parseFloat(tipAmount) + parseFloat(totalPrice * (Number(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))?.TaxRate) / 100 + 1))
                          + parseFloat(isDineIn ? totalPrice * 0.15 : 0) + (deliveryFee / 100)
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
          <div className="col-span-4 pl-4 lg:pl-0 lg:ml-10 lg:mr-10" style={{ cursor: "pointer", display: 'flex', alignItems: 'center' }} >
            {isOnline ?
              <React.Fragment>



                <div
                  onClick={event => {
                    if (isKiosk) {
                      window.location.reload();

                    } else {
                      if (window.location.hash.slice(1).split('?')[0] === 'code') {

                      } else {
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
                      }
                    }


                  }}
                  className="flex-shrink-0 flex items-center">
                  <Logo />
                </div>
              </React.Fragment>
              : null}

            <div className='flex ml-auto pr-4 '>
              <div className='flex mt-1'>
                {user ?
                  <div className='' id="google_translate_element"></div>
                  : null
                }
              </div>

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


              {((location.pathname.includes('/store'))) && (
                <button
                  className="ml-3"
                  onClick={() => openModal()}
                  style={{ cursor: "pointer", top: '-10px', fontSize: "20px" }}
                >
                  <i className="bi bi-cart"></i>
                  {isMobile ?
                    <span></span> : <span className='notranslate'>
                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t("购物车") : ("Cart")}
                    </span>

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

              {!isMobile &&
                <Terminal timeZone={timeZone} />
              }

              {
                !isKiosk && (
                  !user_loading ? (
                    isOnline ? (
                      <button
                        className="ml-3 mt-1"
                        onClick={(event) => {
                          if (window.location.hash.slice(1).split('?')[0] === 'code') {
                          } else {
                            // Determine the redirection URL based on the storeFromURL value
                            const redirectUrl = storeFromURL ? `/account?store=${storeFromURL}` : '/account';
                            window.location.href = redirectUrl;
                          }

                        }}
                        style={{ cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", height: "32px" }}
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

              {!isMobile && window.location.pathname.includes('/account') && user ?
                <div className="ml-3 mt-1" style={{ cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", gap: "6px", height: "32px" }}>
                  <i className="bi bi-calendar3"></i>
                  <span
                    className="ml-1 notranslate">
                    {currentTimeDisplay}
                  </span>
                </div>
                :
                <div></div>

              }


            </div>

          </div>

        </div>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </div>
    </div >
  )
}

export const handleOpenModal = () => handleOpenModalGlobal();
export const getGlobalDirectoryType = () => globalDirectoryType;

export default Navbar

