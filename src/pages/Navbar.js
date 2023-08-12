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


const Navbar = () => {

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
      const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
      setTotalPrice(total);
    }
    calculateTotalPrice();
    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      //  console.log(total)
      $('#cart').attr("data-totalitems", total);
      setTotalQuant(total);
    }
    calculateTotalQuant();

    uploadProductsToLocalStorage(products);
  }, [products, width]);

  const handleDeleteClick = (productId) => {
    setProducts((prevProducts) => {
      saveId(Math.random());  // generate a new id here
      return prevProducts.filter((product) => product.id !== productId);
    });
  }

  const handleAddProductClick = () => {
    setProducts((prevProducts) => [...prevProducts, {
      id: prevProducts.length + 1,
      quantity: 1,
      subtotal: 0,
      image: item_1_pic
    }]);
  }
  const handlePlusClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          saveId(Math.random());
          return {
            ...product,
            quantity: Math.min(product.quantity + 1, 99),
          };
        }
        saveId(Math.random());
        return product;
      });
    });
  };
  const handleMinusClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          // Constrain the quantity of the product to be at least 0
          let newQuantity = Math.max(product.quantity - 1, 1);
          saveId(Math.random());
          return {
            ...product,
            quantity: newQuantity,
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
    sessionStorage.setItem("products", JSON.stringify(products));
  };
  //display every item.
  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));
    //console.log("displayProductFunction")
    //console.log(products)
    // Create an empty array to store the products
    let productArray = [];

    // Loop through the array of products
    for (let i = 0; products != null && i < products.length; i++) {
      let product = products[i];
      // Push the product object to the array
      productArray.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        subtotal: product.subtotal,
        image: product.image,
      });
    }

    // Return the array of product objects
    return productArray;
  };
  //display one item by id.
  const displayProductInfo = (id) => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));

    // Find the product with the matching id
    let product = products.find((product) => product.id === id);

    // Display the product info
    // console.log(`Product ID: ${product.id}`);
    // console.log(`Product Name: ${product.name}`);
    // console.log(`Product Subtotal: ${product.subtotal}`);
    //  console.log(`Product Image: ${product.image}`);
    // console.log(`Product Times Clicked: ${product.timesClicked}`);
  };

  const handleLikeClick = (productId) => {
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            liked: !product.liked,
          };
        }
        return product;
      });
    });
  }
  const [inputConfirmed, setInputConfirmed] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    const safeQuantity = newQuantity ? Math.min(Math.max(parseInt(newQuantity, 10), 0), 99) : 0;

    setInputConfirmed(false);

    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: safeQuantity,
          };
        }
        return product;
      });
    });
  };

  const handleBlur = (product) => {
    setInputConfirmed(true);
    if (product.quantity === 0) {
      handleDeleteClick(product.id)
    }
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
    sessionStorage.setItem('products', JSON.stringify(products));
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

        sessionStorage.setItem('products', JSON.stringify(products));
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
  const handleLogin = async (googleData) => {
    const res = await fetch(url + '/api/google-login', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        token: googleData.tokenId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setLoginData(data);
    //console.log(data)
    sessionStorage.setItem('loginData', JSON.stringify(data));
    sessionStorage.setItem('picture', JSON.stringify(data.picture));
    sessionStorage.setItem('token', googleData.tokenId);
    sessionStorage.setItem('loginID', JSON.stringify(data.id))
    // console.log(document.cookie);
    window.location.reload(false);
  };
  const handleLogout = () => {
    axios.get(url + "/logout").then((response) => {//get logout for cookie 
      // delete cookies front end :)
      //document.cookie=document.cookie+";max-age=0";
      //document.cookie=document.cookie+";max-age=0";
      //console.log("clean cookie");
    });
    sessionStorage.removeItem('loginData');//remove sessionStorage data user name.
    sessionStorage.removeItem('loginID');
    sessionStorage.removeItem('picture');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('token');
    setLoginData(null);//empty the sessionStorage data
    window.location.reload(false);
  };
  const handleFailure = (response) => {
    //console.log("Fail to login", response)
  }

  const HandleCheckout = async () => {
    sessionStorage.setItem('products', JSON.stringify(products));
    // Get the products from local storage
    const lineItem = JSON.parse(sessionStorage.getItem('products'));

    // Create the line items array
    const lineItems = lineItem.map((product) => {
      return { price: product.id, quantity: product.quantity };
    });
    try {
      const response = await fetch('http://localhost:4242/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items: lineItems }),
      });
      const data = await response.json();

      // Redirect the user to the Checkout session URL
      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error(error);
    }
  };
  //const { promise } = useUserContext();

  const HandleCheckout_local_stripe = async () => {
    sessionStorage.setItem('products', JSON.stringify(products));
    window.location.href = '/Checkout'
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

      <a class="float" target="_blank">
        <a

          style={{ 'cursor': "pointer", "user-select": "none" }} onClick={openModal} className="nav__link">
          <i style={{
            color: 'transparent'
          }}
            className="material-icons nav__icon">home</i>
          <span style={{
            color: 'transparent'
          }} className="nav__text">
            1</span>                  <span style={{
              fontSize: '17px',
              color: 'transparent'
            }} className="nav__text ">
            1</span>

          <div id="cart"
            style={{ 'color' : '#444444' }}
            className="cart" data-totalitems={totalQuant} ref={btnRef} >
            <a className="email-link"><i style={{ "fontSize": "35px", 'color': '#444444' }}
              className="material-icons nav__icon">shopping_cart_checkout</i></a>
          </div>
        </a>
      </a>

      <div ref={modalRef} className="foodcart-modal modal">


        {/* popup content */}
        <div className="shopping-cart" >

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
                    <span class="text-right"> ${Math.round(100 * totalPrice) / 100}</span>
                  </button>
                </>
              }
            </div>
          </div>
          <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>

            {/* generates each food entry */}
            {products.map((product) => (
              // the parent div
              // can make the parent div flexbox
              <div key={product.id} className="item">

                {/* the delete button */}
                <div className="buttons">
                  <DeleteSvg className="delete-btn"
                    onClick={() => {
                      handleDeleteClick(product.id)
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
                    <span style={{ fontWeight: "bold", color: "black", width: "-webkit-fill-available" }}>{t(product.name)}</span>
                  </div>


                  {/* <div className="theset"> */}
                  {/* start of quantity (quantity = quantity text + buttons div) */}
                  <div className="quantity"
                    style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                    <span>${Math.round(100 * product.quantity * product.subtotal) / 100}</span>

                    {/* the add minus box set up */}
                    <div style={{ display: "flex" }}>

                      {/* the start of minus button set up */}
                      <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                        <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                          onClick={() => {
                            if (product.quantity === 1) {
                              handleDeleteClick(product.id);
                            } else {
                              handleMinusClick(product.id);
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
                            handlePlusClick(product.id)
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
      </div>
      {/**navbar */}

      <div className={!isMobile ? "max-w-[1000px] mx-auto justify-between sticky top-0 bg-white z-10" : "sticky top-0 z-10 justify-between bg-white"}>

        <div className="col-span-4 pl-4" style={{ cursor: "pointer", display: 'flex', alignItems: 'center' }} >
          <img onClick={event => window.location.href = '/'}
            src={JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Logo}
            alt=""
            style={{
              maxHeight: '60px',
              maxWidth: '60px',
              borderRadius: '50%',  // this makes the image round
              objectFit: 'cover',   // this makes the image co0ver the entire dimensions
              marginRight: '10px',   // added some margin to the right of the image
              marginTop: "5px"
            }} />
          <div className='flex' style={{ flexDirection: "column" }}>
            <span onClick={event => window.location.href = '/'} style={{ marginTop: "0px" }}>
              {JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Name}
            </span>
            {isMobile ? <></> : <div onClick={event => window.location.href = '/'}>{JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0].Address}</div>}


          </div>

          <div className='flex ml-auto pr-4'>

            <select class="selectpicker" data-width="fit" onChange={changeLanguage}>
              {/**如果选择中文，框显示成lang，如果是eng,框显示语言 */}
              <option value='en' data-content='<span class="flag-icon flag-icon-us"></span> English' selected={languageOption() == 'en' ? true : false}>English</option>
              <option value='ch' data-content='<span class="flag-icon flag-icon-mx"></span> Chinese' selected={languageOption() == 'ch' ? true : false}>中文</option>
            </select>
            {!user_loading?
            <button className="ml-3" onClick={event => window.location.href = '/account'} style={{ 'cursor': "pointer", 'top': '-10px', fontSize: "16px" }}> {user ? t("Account") : t("Login")}</button>
            :
            <>
            </>}
          </div>

        </div>

      </div>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

    </>
  )
}

export default Navbar