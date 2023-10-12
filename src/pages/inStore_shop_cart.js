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
import { faCreditCard, faGift, faMoneyBillWave, faUsers, faPencilAlt, faTimes, faArrowRight, faPrint } from '@fortawesome/free-solid-svg-icons';
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

const Navbar = ({ store, selectedTable,acct }) => {
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
  const [tips, setTips] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

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
      setFinalPrice((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))) / 100))
      console.log((Math.round(100 * (total * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))) / 100))
    }
    calculateTotalPrice();;
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

  }, [products, width,tips]);


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

  const [isMyModalVisible, setMyModalVisible] = useState(false);

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

  return (

    <>
      <>

        {/* popup content */}
        <div className="shopping-cart1" style={{ margin: "auto", height: "fit-content" }}>
          {/* shoppig cart */}
          <div className="title " style={{ height: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>


              {totalPrice === 0 ?
                <div>
                  <div style={{ marginTop: "15px" }}>
                    {selectedTable === null ?
                      <span>No table is selected</span> :
                      <span>&nbsp;{`Table ${selectedTable} is empty.`}</span>

                    }
                  </div>
                </div>
                :
                <div>
                  <div style={{ marginTop: "15px" }}>
                    <span>
                      <span>{`Your selected table is ${selectedTable}`}</span>
                    </span>
                  </div>
                </div>
              }
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
            <div className="flex flex-col w-1/3">
              {/* the modal for tips */}
              {isTipsModalOpen && (
                <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Tip</h5>
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
                            className={`btn col ${selectedTipPercentage === 0.20 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handlePercentageTip(0.20)}
                          >
                            20%
                          </button>

                          <button
                            type="button"
                            className={`btn col ${selectedTipPercentage === 0.25 ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handlePercentageTip(0.25)}
                          >
                            25%
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
                        <button type="button" className="btn btn-primary" onClick={() => setTipsModalOpen(false)}>Add Tip</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <a
                onClick={handleAddTipClick}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#4CAF50" }}> {/* Green for Add tip */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faGift} /> &nbsp;
                </span>
                <span >{t("Add tip")}{" "}</span>
              </a>

              <a
                onClick={() => setMyModalVisible(true)}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#2196F3" }}> {/* Blue for Card Pay */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faCreditCard} /> &nbsp;
                </span>
                <span>{t("Card Pay")}{" "}</span>
              </a>
        <div className="MyApp">

            <div style={myStyles.overlayStyle}>
                <div style={myStyles.modalStyle}>
                    <button style={myStyles.closeBtnStyle} onClick={() => setMyModalVisible(false)}>X</button>
                    <PaymentComponent2  storeID = {store} chargeAmount={finalPrice}  connected_stripe_account_id={"acct_1NhfrBD7rxr1kqtN"} />
                </div>
            </div>
        </div>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#2196F3" }}> {/* Blue for Cash Pay */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} /> &nbsp;
                </span>
                <span>{t("Cash Pay")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#FF9800" }}> {/* Orange for Split Payment */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faUsers} /> &nbsp;
                </span>
                <span>{t("Split Payment")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#00695C" }}> {/* Teal for Customize Price */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faPencilAlt} /> &nbsp;
                </span>
                <span>{t("Customize Price")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#9C27B0" }}> {/* Purple for Send to Kitchen */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faArrowRight} /> &nbsp;
                </span>
                <span>{t("Send to kitchen")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#9E9E9E" }}> {/* Gray for Print Receipt */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faPrint} /> &nbsp;
                </span>
                <span>{t("Print Receipt")}{" "}</span>
              </a>

              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#9E9E9E" }}> {/* Gray for Print Merchant Copy */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faPrint} /> &nbsp;
                </span>
                <span>{t("Print Merchant Copy")}{" "}</span>
              </a>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#9E9E9E" }}> {/* Gray for Print Merchant Copy */}
                <span class=" pe-2">
                  <FontAwesomeIcon icon={faPrint} /> &nbsp;
                </span>
                <span>{t("Print Customer Copy")}{" "}</span>
              </a>
              <a
                onClick={(e) => { }}
                class="mt-3 btn btn-sm btn-primary mx-1"
                style={{ backgroundColor: "#F44336" }}> {/* Gray for Print Merchant Copy */}

                <span class=" pe-2">
                  <FontAwesomeIcon icon={faTimes} /> &nbsp;
                </span>
                <span>{t("Delete Order")}{" "}</span>
              </a>
              <br></br>
              <>

                <div class="text-right notranslate">Subtotal: ${Math.round(100 * totalPrice) / 100} </div>

                {tips && (
                  <div class="text-right notranslate">Tips: ${tips} </div>
                )}
                <div class="text-right notranslate">Tax(8.25%): ${(Math.round(100 * totalPrice * 0.0825) / 100)}    </div>
                <div class="text-right notranslate">Total: ${(Math.round(100 * (totalPrice * 1.0825 + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))) / 100)} </div>
              </>
            </div>
          </div>


        </div>
      </>
    </>
  )
}

export default Navbar