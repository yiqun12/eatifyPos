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

import cartImage from './shopcart.png';

const Navbar = ({ store }) => {

  const googleTranslateElementInit = () => {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,zh-CN,zh-TW",
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
  const [products, setProducts] = useState([
  ]);


  useEffect(() => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    // Update the products state with the array of products
    setProducts(productArray);
  }, []);


  const [totalQuant, setTotalQuant] = useState(0);
  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products
    let height = 100;
    if (width > 575) {
      if (products && products.length > 0) {
        if (products.length < 4) {
          height = products.length * 123 + 100; // 123 is the height of each product element and 100 is the top and bottom margin of the shopping cart
        } else {
          height = 3 * 123 + 140; // set height to show only the first 3 items and the shopping cart header
        }
      }
    } else {

      height = products.length * 123 + 100; // 123 is the height of each product element and 100 is the top and bottom margin of the shopping cart
    }

    //console.log("product changed")
    // Update the height of the shopping cart element
    document.querySelector('.shopping-cart').style.height = `${height}px`;
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products?.reduce((acc, item) => item && item.itemTotalPrice ? acc + item.itemTotalPrice : acc, 0);
      console.log(total)
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

    uploadProductsToLocalStorage(products);
  }, [products, width]);

  const handleDeleteClick = (productId, count) => {
    setProducts((prevProducts) => {
      saveId(Math.random());  // generate a new id here
      return prevProducts.filter((product) => product.id !== productId || product.count !== count);
    });
  }  

  const handlePlusClick = (productId, targetCount) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && product.count === targetCount) {
          saveId(Math.random());
          return {
            ...product,
            itemTotalPrice:Math.round(100 *  product.itemTotalPrice/(product.quantity)*(Math.min(product.quantity + 1, 99)) ) / 100,
            quantity: Math.min(product.quantity + 1, 99),
          };
        }
        saveId(Math.random());
        return product;
      });
    });
  };
  
  const handleMinusClick = (productId,targetCount) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId && product.count === targetCount) {
          // Constrain the quantity of the product to be at least 0
          saveId(Math.random());
          return {
            ...product,
            quantity: Math.max(product.quantity - 1, 1),
            itemTotalPrice:Math.round(100 *  product.itemTotalPrice/(product.quantity)*(Math.max(product.quantity - 1, 1)) ) / 100,
          };
        }
        saveId(Math.random());
        return product;
      });
    });
    uploadProductsToLocalStorage(products);

  };
  const uploadProductsToLocalStorage = (products) => {
    // Set the products array in local storage
    sessionStorage.setItem(store, JSON.stringify(products));
  };
  //display every item.
  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem(store));

    // Return the array of product objects
    return products;
  };

  // modal. 
  const modalRef = useRef(null);
  const btnRef = useRef(null);
  const spanRef = useRef(null);
  const openModal = () => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    //console.log(productArray)
    // Update the products state with the array of products
    setProducts(productArray);
    modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
  };

  const closeModal = () => {
    //console.log(products)
    modalRef.current.style.display = 'none';
  };

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

        sessionStorage.setItem(store, JSON.stringify(products));
        modal.style.display = "none";
      }
    }
  }, [products]);// pass `products` as a dependency
  //This will ensure that the useEffect hook is re-run every time the products value changes, and the latest value will be saved to local storage.
  //google login button functions
  const [loginData, setLoginData] = useState(
    sessionStorage.getItem('loginData')
      ? JSON.parse(sessionStorage.getItem('loginData'))
      : null
  );
  const url = "http://localhost:8080"

  const queryParams = new URLSearchParams(location.search);
  const storeValue = queryParams.get('store'); // should give "parkasia"
  const tableValue = queryParams.get('table'); // should give "A3"
  if (!sessionStorage.getItem(storeValue)) {
    sessionStorage.setItem(storeValue, JSON.stringify([]));
}
  //console.log(storeValue)
  //console.log(tableValue)
  const HandleCheckout_local_stripe = async () => {
    sessionStorage.setItem(store, JSON.stringify(products));
    window.location.href = '/Checkout' + "?store=" + storeValue + "&" + "table=" + sessionStorage.getItem("table")
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


  const changeLanguage = (e) => {
    var languageCode = e.target.value
    sessionStorage.setItem("translationsMode", languageCode)
    saveId(Math.random())
    // if (languageCode == "ch")
    // console.log(languageCode)
  }

  const languageOption = () => {
    //console.log(sessionStorage.getItem("translationsMode"))
    if (sessionStorage.getItem("translationsMode") == null)
      return 'en'
    else
      return sessionStorage.getItem("translationsMode")
  }


  return (

    <>



        {/* popup content */}
        <div className="shopping-cart" style={{margin: "auto"}}>

          {/* shoppig cart */}
          <div className="title" style={{ height: '80px' }}>


            <DeleteSvg className="delete-btn" style={{ 'postion': 'absolute', float: 'right', cursor: 'pointer', margin: '0' }} ref={spanRef} onClick={closeModal}></DeleteSvg>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {totalPrice === 0 ?
                <div>
                  <div style={{ marginTop: "15px" }}>
                    <span>
                      <i style={{ fontSize: "35px" }} className="material-icons nav__icon">shopping_cart_checkout</i>
                      <span >&nbsp;{t("Your cart is currently empty.")}</span>
                    </span>


                  </div>
                </div>
                :
                <>
                  <button
                    style={{ width: "80%", border: "0px", margin: "auto" }}
                    class="w-900 mx-auto border-0 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-between"
                    onClick={HandleCheckout_local_stripe}>

                    <span class="text-left">
                      <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                      {t("Checkout")} </span>
                    <span class="text-right"> ${Math.round(100 * totalPrice) / 100 } </span>
                  </button>
                </>
              }
            </div>
          </div>
          <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>

            {/* generates each food entry */}
            {products?.map((product) => (
              // the parent div
              // can make the parent div flexbox
              <div key={product.id} className="item">

                {/* the delete button */}
                <div className="buttons">
                  <DeleteSvg className="delete-btn"
                    onClick={() => {
                      handleDeleteClick(product.id,product.count)
                    }}></DeleteSvg>
                  {/* <span className={`like-btn ${product.liked ? 'is-active' : ''}`} onClick = {() => handleLikeClick(product.id)}></span> */}
                </div>
                {/* the image */}
                <div className="image">
                  <div class="image-container" >
                    <img style={{ marginLeft: '-7px' }} src={product.image} alt="" />
                  </div>
                </div>

                {/* the name + quantity parent div*/}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "-webkit-fill-available" }}>
                  {/* the name */}
                  <div className="description" style={{ width: "-webkit-fill-available" }}>

                    <div className='flex-row' style={{ width: "-webkit-fill-available" }}>
                      <div style={{ fontWeight: "bold", color: "black", width: "-webkit-fill-available" }}>{t(product.name)}</div>

                      <div>{Object.entries(product.attributeSelected).map(([key, value]) => (Array.isArray(value) ? value.join(' ') : value)).join(' ')}</div>

                    </div>                  </div>

                  {/* <div className="theset"> */}
                  {/* start of quantity (quantity = quantity text + buttons div) */}
                  <div className="quantity p-0"
                    style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                    <div>
                    <div>${product.itemTotalPrice}</div>

                    </div>
                    {/* the add minus box set up */}
                    <div style={{ display: "flex" }}>

                      {/* the start of minus button set up */}
                      <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                        <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                          onClick={() => {
                            if (product.quantity === 1) {
                              handleDeleteClick(product.id,product.count);
                            } else {
                              handleMinusClick(product.id,product.count)
                              //handleMinusClick(product.id);
                            }
                          }}>
                          <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                        </button>
                      </div>
                      {/* the end of minus button set up */}

                      { /* start of the quantity number */}
                      <span
                        type="text"
                        style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                      >{product.quantity}</span>
                      { /* end of the quantity number */}

                      { /* start of the add button */}
                      <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                        <button className="plus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                          onClick={() => {
                            handlePlusClick(product.id,product.count)
                            saveId(Math.random());
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
    </>
  )
}

export default Navbar