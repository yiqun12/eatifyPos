
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import CardSection from "../components/CardSection";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import Dashboard from "../components/dashboard";
import { useUserContext } from "../context/userContext";
import { useRef, useEffect } from 'react';
//import './html.css';
import { MyHookProvider, useMyHook } from './myHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import './SwitchToggle.css';

const App = () => {
  /**re-render everytime button clicked from shopping cart */
  const { id, saveId } = useMyHook(null);
  let products = JSON.parse(sessionStorage.getItem("products"));
  useEffect(() => {
    products = JSON.parse(sessionStorage.getItem("products"));
  }, [id]);
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
    setCardidth(card2Header.offsetWidth);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const isTooSmall= cardidth <= 270;

  //fetch data from local stroage products.
  //console.log(sessionStorage.getItem("products"))
  const [totalPrice, setTotalPrice] = useState(products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0));
  useEffect(() => {
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
      //console.log(total)
      //console.log(products)
      setTotalPrice(total);
    }
    //console.log(totalPrice)
    calculateTotalPrice();
  }, [products]);

  return (

    <div className='max-w-[1000px] mx-auto p-4 '>
      <div className="app-container" style={{ height: "100%"}}>
        <div className="row">
        {isMobile?
                <div className="col" style={{paddingLeft:0,paddingRight:0}}>
                <Item products={products} totalPrice={totalPrice} />
                <Checkout totalPrice={totalPrice} />
              </div>
      :  
      <>
      <div className="col" >
      <Item products={products} totalPrice={totalPrice} />
    </div>
    <div className="col no-gutters" style={{ height: "100%" }} >
      <Checkout totalPrice={totalPrice} />
    </div>
    </>
      }

        </div>
      </div>
    </div>
  );
};
/**                    <img src={product.image} style ={{    width: '100px',
  height: '100px',
  'object-fit': 'cover'}}/> */
const Item = (props) => {
  //const { id, saveId } = useMyHook(null);
  //const [totalPrice, setTotalPrice] = useState(0);
  let products = JSON.parse(sessionStorage.getItem("products"));
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
  }, [id]);

  const { totalPrice } = props;
  //console.log(props.products)
  const [isDinein, setIsDinein] = useState(true);
  sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
  //console.log(isDinein)
  const handleToggle = () => {
    setIsDinein(!isDinein);
    //console.log(isDinein)
    sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
    saveId(Math.random())
  };

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

    
  
  return (
    <div className="card2 mb-50">
      <div className="col d-flex">
        {/** 
        <span className="text-muted" id="orderno">
          order #546924
        </span>*/}
      </div>
      <div className="gap">
        <div className="col-2 d-flex mx-auto" />

        <div className="title" style={{
          "paddingLeft": "0", "paddingRight": "0",
          margin: "auto", "marginLeft": "0", "marginRight": "0",
          "paddingBottom": "40px"
        }}>
          <div className="toggle-group" style={{
            "paddingLeft": "0", "paddingRight": "0",
            margin: "auto", "marginLeft": "0", "marginRight": "0",
          }} >


            <div className="row">
              <div className="col flex items-start">
                {isDinein ? (
                  <span className="text-black select-none text-2xl">DINE</span>
                ) : (
                  <span className="text-black select-none text-2xl">TAKE</span>
                )}
              </div>
              <div className="col d-flex justify-content-end">
                <input
                  style={{ "display": " none" }}
                  type="checkbox"
                  name="on-off-switch"
                  id="on-off-switch"
                  tabIndex="1"
                  checked={isDinein}
                  onChange={handleToggle}
                />
                <label style={{
                  "paddingLeft": "0",
                  margin: "auto", "marginLeft": "0",
                  "width": "63px",
                  "height": "30px"
                }} htmlFor="on-off-switch">

                </label>
                <div className="onoffswitch pull-right" aria-hidden="true">
                  <div className="onoffswitch-label">

                    <div className="onoffswitch-inner"></div>
                    <div className="onoffswitch-switch">
                      {isDinein ? (
                        <FontAwesomeIcon icon={faUtensils} />
                      ) : (
                        <FontAwesomeIcon icon={faShoppingBag} />
                      )}
                    </div>

                  </div>

                </div>
              </div>
            </div>{" "}

          </div>
        </div>
      </div>

      <div className="main">
        <span id="sub-title">
          <p>
            <b>{t("Payment Summary")}</b>
          </p>
        </span>
        {products.map((product, index) => {
          return (
            <div className="row row-main" key={index}>
              <div className="col-3">
                <div style={{ width: '65px', height: '65px', marginTop: '-10px' }} class="image-container">
                  <img src={product.image} alt="" />
                </div>
              </div>
              <div className="col-6">
                <div className="row d-flex">
                  <p>
                    <b>{t(product.name)}</b>
                  </p>
                </div>
                <div className="row d-flex">
                  <p className="text-muted">@ ${product.subtotal} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>$ {Math.round(100*(product.quantity * product.subtotal))/100 } </b>
                </p>
              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${Math.round(100*totalPrice)/100}</b>
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  )
};

const Checkout = (props) => {
  const { loading } = useUserContext();
  const { totalPrice } = props;
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
  
  return (
    <div className="checkout ">
      <div className="checkout-container" >
        {loading ? <h2>{t("Loading Payment")}...</h2> : <> <Dashboard totalPrice={totalPrice} /> </>}
      </div>
    </div>
  )
};

const Input = (props) => (
  <div className="input">
    <label>{props.label}</label>
    <div className="input-field">
      <input type={props.type} name={props.name} />
      <img src={props.imgSrc} />
    </div>
  </div>
);

const Button = (props) => (
  <button className="checkout-btn" type="button">{props.text}</button>
);

export default App