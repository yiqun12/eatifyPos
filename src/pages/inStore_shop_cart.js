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
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import cartImage from './shopcart.png';

const Navbar = ({ store, selectedTable }) => {
  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  /**listen to localtsorage */


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

  const [totalPrice, setTotalPrice] = useState(0);

  const [totalQuant, setTotalQuant] = useState(0);
  //console.log(totalQuant)
  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products
    let height = 700;

    // Update the height of the shopping cart element
    document.querySelector('.shopping-cart').style.height = `${height}px`;
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = (Array.isArray(products) ? products : []).reduce((acc, item) => item && item.itemTotalPrice ? acc + item.itemTotalPrice : acc, 0);
      console.log(total)
      setTotalPrice(total);
    }
    calculateTotalPrice();;
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

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
  const HandleCheckout_local_stripe = async () => {
  };

  return (

    <>
      <>
        {/* popup content */}
        <div className="shopping-cart1" style={{ margin: "auto" }}>
          {/* shoppig cart */}
          <div className="title " style={{ height: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>


              {totalPrice === 0 ?
                <div>
                  <div style={{ marginTop: "15px" }}>
                    <span>
                      <i style={{ fontSize: "35px" }} className="material-icons nav__icon">shopping_cart_checkout</i>
                      <span>&nbsp;{`Table ${selectedTable} is empty.`}</span>
                    </span>
                  </div>
                </div>
                :
                <>
                </>
              }
            </div>
          </div>
          <div className="flex flex-col flex-row">
            <div className="flex flex-col w-1/3">

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Checkout")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Print Receipt")}{" "}</span>
              </a>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Split Payment")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Customize Price")}{" "}</span>
              </a>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Send to kitchen")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Print Merchant Copy")}{" "}</span>
              </a>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1">
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Print Customer Copy")}{" "}</span>
              </a>
          </div>


          <div className='flex flex-col w-2/3' style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>

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
                  {/* the image */}
                  <div className="image">
                    <div class="image-container" >
                      <img style={{ marginLeft: '-7px' }} src={product.image} alt="" />
                    </div>
                  </div>


                  {/* the name + quantity parent div*/}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "-webkit-fill-available" }}>
                    {/* the name */}
                    <div className='flex-row' style={{ width: "-webkit-fill-available" }}>
                      <div style={{ fontWeight: "bold", color: "black", width: "-webkit-fill-available" }}>
                        <span class="notranslate">

                          {sessionStorage.getItem("Google-language")?.includes("Chinese") ? t(product?.CHI) : (product?.name)}
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
          </div>

          {totalPrice === 0 ?
<></>
                :
                <>
                  
                    <span class="text-right notranslate"> ${Math.round(100 * totalPrice) / 100} </span>
                    <span class="text-right notranslate"> 8.25% ${Math.round(100 * totalPrice) / 100 * 1.0825} </span>
                </>
              }
        </div>
      </>
    </>
  )
}

export default Navbar