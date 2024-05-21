
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import { Elements } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import Dashboard from "../components/dashboard";
import { useUserContext } from "../context/userContext";
import { useRef, useEffect } from 'react';
//import './html.css';
import { MyHookProvider, useMyHook } from './myHook';
import Hero from './Hero';

import './SwitchToggle.css';
import applepay from '../components/applepay.png';
import amex from '../components/amex.png';
import visa from '../components/visa.png';
import discover from '../components/discover.png';
import wechatpay from '../components/wechatpay.png';

import alipay from '../components/alipay.png';
import { useMemo } from 'react';
import { db } from '../firebase/index';
import { query, where, limit, doc, onSnapshot } from "firebase/firestore";
import firebase from 'firebase/compat/app';

const App = () => {

  const params = new URLSearchParams(window.location.search);
  const checkDirectoryselfCheckout = () => {
    const path = window.location.pathname; // Get the current URL path
    const store = params.get('store')?.trim(); // Get 'store' parameter and trim any spaces
    const table = params.get('table')?.trim(); // Get 'table' parameter and trim any spaces
    if (path.includes('/selfCheckout') && store && table) {
      return true
    } else {
      return false
    }
  };

  // Example usage of the checkDirectory function
  const directoryType = checkDirectoryselfCheckout();
  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  // console.log(store)
  // console.log(store + "-" + sessionStorage.getItem('table'))
  /**re-render everytime button clicked from shopping cart */
  const { id, saveId } = useMyHook(null);


  useEffect(() => {
    const table = sessionStorage.getItem('table'); // Assuming 'table' value is correctly set in sessionStorage
    if (!store || !table) {
      console.log(store)
      console.log(table)
      console.error("Store or Table is not defined");
      return;
    }
    if (!directoryType) {
      return
    }
    console.log("executing")
    const docRef = firebase.firestore()
      .collection('TitleLogoNameContent')
      .doc(store)
      .collection('Table')
      .doc(`${store}-${table}`);

    const unsubscribe = docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        console.log(data.product)
        setProducts(directoryType ? JSON.parse(data.product) : JSON.parse(sessionStorage.getItem(store)))
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
  }, [store]);


  const [products, setProducts] = useState(JSON.parse(sessionStorage.getItem(store)));

  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);
  /**check if its too small */
  const [cardidth, setCardidth] = useState(0);

  function handleWindowSizeChange() {
    const card2Header = document.getElementById('card2-header');
    setCardidth(card2Header.offsetWidth);
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    const card2Header = document.getElementById('card2-header');
    //setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const isTooSmall = cardidth <= 270;

  //fetch data from local stroage products.
  const [totalPrice, setTotalPrice] = useState(products?.length ? products.reduce((acc, item) => parseFloat(acc) + (parseFloat(item?.itemTotalPrice) || 0), 0) : 0);


  useEffect(() => {
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products?.length ? products.reduce((acc, item) => parseFloat(acc) + (parseFloat(item?.itemTotalPrice) || 0), 0) : 0
      //console.log(total)
      //console.log(products)
      setTotalPrice(total);
    }
    //console.log(totalPrice)
    calculateTotalPrice();
  }, [products]);


  // tips calculation: in the parent App since needs to be carried in Item() and Checkout() 

  // Add state for tip selection and calculation
  const [selectedTip, setSelectedTip] = useState({ type: "percent", value: "0%" });
  const [tips, setTips] = useState(null);

  // Calculate the tip amount
  const calculateTip = () => {
    if (selectedTip.type === "percent") {
      const percentage = parseInt(selectedTip.value, 10) / 100;
      setTips(Math.round(100 * totalPrice * percentage) / 100);
      return Math.round(100 * totalPrice * percentage) / 100;

    } else {

      // for the "other" tip section, removes the $ if present
      let result = selectedTip.value;
      console.log("before $ remove: " + result)

      if (result.includes("$")) {
        result = result.replace(/\$/g, ""); // Remove dollar sign if it is present
      }

      setTips(Math.round(100 * result) / 100);
      console.log("result " + result);
      console.log("tips:" + tips);
      return result; // assuming value is in USD for fixed type
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (totalPrice === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [totalPrice]);

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      if (trans != null && translationsMode != null) {
        if (trans[text] != null && trans[text][translationsMode] != null) {
          return trans[text][translationsMode];
        }
      }

      return text;
    };
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")]);
  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";
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

  return (

    <div className='mx-auto p-2 max-w-[1200px] '>
      {isLoading ?
        <div>{t("Cart is empty... Please Redirect back to home page")}
          <button
            onClick={event => {
              if (storeFromURL !== '' && storeFromURL !== null) {
                if (isKiosk) {
                  window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
                } else {
                  window.location.href = `/store?store=${storeFromURL}`;
                }

              } else {
                window.location.href = '/';
              }
            }}
            class="text-blue-500 underline bg-white focus:outline-none font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2">
            Click here to redirect
          </button>
        </div> :

        <div className="app-container" style={{ height: "100%" }}>
          <div className="row">
            {isMobile ?
              <div className="col" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
                <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
                {/* <Item products={products} totalPrice={totalPrice} /> */}
                {/* <Checkout totalPrice={totalPrice} /> */}
              </div>
              :
              <React.Fragment>
                <div className="ml-5 col" >
                  <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
                </div>
                <div className="mr-5 col no-gutters" style={{ height: "100%" }} >
                  <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
                </div>
              </React.Fragment>
            }

          </div>
        </div>
      }

    </div>
  );
};
/**                    <img src={product.image} style ={{    width: '100px',
  height: '100px',
  'object-fit': 'cover'}}/> */
const Item = (props) => {
  const params = new URLSearchParams(window.location.search);

  const store = params.get('store') ? params.get('store').toLowerCase() : "";

  //let products = JSON.parse(sessionStorage.getItem(store));
  const [products, setProducts] = useState(JSON.parse(sessionStorage.getItem(store)));
  const checkDirectoryselfCheckout = () => {
    const path = window.location.pathname; // Get the current URL path
    const store = params.get('store')?.trim(); // Get 'store' parameter and trim any spaces
    const table = params.get('table')?.trim(); // Get 'table' parameter and trim any spaces
    if (path.includes('/selfCheckout') && store && table) {
      return true
    } else {
      return false
    }
  };

  // Example usage of the checkDirectory function
  const directoryType = checkDirectoryselfCheckout();
  useEffect(() => {
    const table = sessionStorage.getItem('table'); // Assuming 'table' value is correctly set in sessionStorage
    if (!store || !table) {
      console.log(store)
      console.log(table)
      console.error("Store or Table is not defined");
      return;
    }
    console.log("executing")
    if (!directoryType) {
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
        console.log(data.product)
        setProducts(directoryType ? JSON.parse(data.product) : JSON.parse(sessionStorage.getItem(store)))
        sessionStorage.setItem("ReceiptDataDineIn", data.product)
      } else {
        console.log("No such document!");
      }
    }, err => {
      console.error("Error getting document:", err);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [store]);

  const { id, saveId } = useMyHook(null);
  const [isDinein, setIsDinein] = useState(sessionStorage.getItem("isDinein"));
  useEffect(() => {
    setIsDinein(sessionStorage.getItem("isDinein"))
    //console.log("saijowsaw")
    //console.log(sessionStorage.getItem("isDinein"))
  }, [id]);

  const { totalPrice } = props;
  const tax_rate = 0.0825;

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //  console.log(trans)
    // console.log(sessionStorage.getItem("translationsMode"))

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

  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);
  /**check if its too small */
  const [cardidth, setCardidth] = useState(0);

  function handleWindowSizeChange() {
    const card2Header = document.getElementById('card2-header');
    setCardidth(card2Header.offsetWidth);
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    const card2Header = document.getElementById('card2-header');
    //setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;


  // for handling tips (default at 18%)
  const { selectedTip, setSelectedTip, calculateTip, tips } = props;
  const [showInput, setShowInput] = useState(false);
  // const [selectedTip, setSelectedTip] = useState(null);

  const handleOtherButtonClick = () => {
    setShowInput(true);
    setSelectedTip({ type: "other", value: "0" });
  };

  const handlePercentButtonClick = (percent) => {
    setShowInput(false);
    setSelectedTip({ type: "percent", value: percent });
  };
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


  const Button = ({ children, type }) => (
    <button
      // className={`btn ${selectedTip?.value === children ? 'border border-solid border-black' : ''}`}
      className={`tips btn-outline-none shadow-none ${selectedTip?.value === children ? 'border border-solid border-black' : ''}`}
      onClick={() => type === 'other' ? handleOtherButtonClick() : handlePercentButtonClick(children)}
    >
      {children}
    </button>
  );


  return (
    <div className="card2 mb-50" style={!isMobile ? { "box-shadow": 'rgba(0, 0, 0, 0.08) -20px 1 20px -10px' } : { "box-shadow": 'rgba(0, 0, 0, 0.08) 20px -10px -20px -10px' }}>

      <div className="main">

        {products?.map((product, index) => {
          return (
            <div className="row row-main my-2" key={index}>
              {/* <div className="col-3">
                <div style={{ width: '65px', height: '65px' }} class="image-container">
                  <img src={product.image} alt="" />
                </div>
              </div> */}
              <div className="col-12">
                <div className="row d-flex ">
                  <p className='m-0 pb-0'>
                    <b class="notranslate">
                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                    </b>

                  </p>
                </div>

                <div className="row d-flex">
                  <p className='m-0 pb-0'>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</p>
                </div>

                <div className="d-flex justify-between font-lg">
                  <div className="text-muted notranslate">@ ${

                    (Math.round(100 * product.itemTotalPrice / product.quantity) / 100).toFixed(2)
                  } {t("each")} x {product.quantity}</div>
                  <div className='notranslate'><b>${(Math.round(100 * product.itemTotalPrice) / 100).toFixed(2)}
                  </b></div>
                </div>

              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
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
              <b>${(Math.round(100 * totalPrice * tax_rate) / 100).toFixed(2)}
              </b>
            </div>
          </div>
          {sessionStorage.getItem("isDinein") === "true" ?
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


          <div className="row">
            <div className="notranslate col d-flex justify-content-end">
              <b>$abc</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total Amount")}:</b>
            </div>
            <div className="notranslate col d-flex justify-content-end">
              <b>${(Math.round(100 * (totalPrice * (1 + tax_rate) + tips + (sessionStorage.getItem("isDinein") === "true" ? totalPrice * 0.15 : 0))) / 100).toFixed(2)}</b>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
};

const Checkout = (props) => {
  const { loading } = useUserContext();
  // const { totalPrice } = props;
  const { totalPrice, tips } = props;
  const tax_rate = 0.0825;

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //    console.log(trans)
    //    console.log(sessionStorage.getItem("translationsMode"))

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
  const params = new URLSearchParams(window.location.search);
  const store = params.get('store') ? params.get('store').toLowerCase() : "";
  const [loadedAcct, setLoadedAcct] = useState(false);


  useEffect(() => {
    // Check if name is provided to avoid errors

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


  return (
    <div className="checkout">
      <div className="checkout-container" >
        {loading && !loadedAcct ? <h2>{t("Loading Payment")}...</h2> :
          <div>
            <Dashboard totalPrice={Math.round(100 * (totalPrice * (1 + tax_rate) + tips + (sessionStorage.getItem("isDinein") === "true" ? totalPrice * 0.15 : 0))) / 100} />
          </div>}
      </div>
    </div>
  )
};

const Input = (props) => (
  <div className="input">
    <label>{props.label}</label>
    <div className="input-field">
      <input type={props.type} name={props.name} translate="no" />
      <img src={props.imgSrc} />
    </div>
  </div>
);

const Button = (props) => (
  <button className="checkout-btn" type="button">{props.text}</button>
);

export default App