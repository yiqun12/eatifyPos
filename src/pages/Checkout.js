
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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
    //setCardidth(card2Header.offsetWidth);
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


  // tips calculation: in the parent App since needs to be carried in Item() and Checkout() 

    // Add state for tip selection and calculation
    const [selectedTip, setSelectedTip] = useState({type: "percent", value: "15%"});
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
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);  // wait for 2 seconds before redirecting
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

  return (

    <div className='max-w-[1000px] mx-auto p-2 '>
      {isLoading?
    <>{t("Cart is empty... Redirecting back to home page")}</>:
    
    <div className="app-container" style={{ height: "100%"}}>
    <div className="row">
    {isMobile?
            <div className="col" style={{paddingLeft:0,paddingRight:0}}>
            <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
            <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
            {/* <Item products={products} totalPrice={totalPrice} /> */}
            {/* <Checkout totalPrice={totalPrice} /> */}
          </div>
  :  
  <>
  <div className="col" >
  <Item products={products} totalPrice={totalPrice} selectedTip={selectedTip} tips={tips} setSelectedTip={setSelectedTip} calculateTip={calculateTip} />
  {/* <Item products={products} totalPrice={totalPrice} /> */}
</div>
<div className="col no-gutters" style={{ height: "100%" }} >
  <Checkout totalPrice={totalPrice} tips={tips} calculateTip={calculateTip} />
  {/* <Checkout totalPrice={totalPrice} /> */}
</div>
</>
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
  //const { id, saveId } = useMyHook(null);
  //const [totalPrice, setTotalPrice] = useState(0);
  let products = JSON.parse(sessionStorage.getItem("products"));
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
  }, [id]);

  const { totalPrice } = props;
  const tax_rate = 0.06;

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
  const {selectedTip, setSelectedTip, calculateTip, tips } = props;
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
    <div className="card2 mb-50" style={!isMobile?{"box-shadow":'rgba(0, 0, 0, 0.08) -20px 1 20px -10px'}:{"box-shadow":'rgba(0, 0, 0, 0.08) 20px -10px -20px -10px'}}>

      <div className="main">
        <span className='flex' id="sub-title">
          <div className='flex'>

          {sessionStorage.getItem('table')!=null && sessionStorage.getItem('table')!=""?
                <b >
                <b style={{backgroundColor: "red", borderRadius: "3px",padding: "3px",color: "white",}}>
                      {sessionStorage.getItem('table')} 
                </b>
                &nbsp; 
                </b>:
                <></>

}
            <b> {t("Summary")}
            
            </b>
          </div>

            <Hero style={{"marginBottom":"5px"}}>
            </Hero>

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
              <b> {t("Subtotal")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>$ {Math.round(100*totalPrice)/100}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")} 	&#40;6%&#41;:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>$ {Math.round(100*totalPrice*tax_rate)/100}</b>
            </div>
          </div>
          <div className="row">
            <div className="col" style={{marginBottom:"5px"}}>
              <b> {t("Tips")}:</b>
            </div>

        {/* for the buttons arrangement */}
            <div className="flex justify-between">
          

      <Button type="percent" value="15%">15%</Button>
      <Button type="percent" value="18%">18%</Button>
      <Button type="percent" value="20%">20%</Button>

        {!showInput && <Button type="other">{t("Other")}</Button>}
      {showInput && <input 
        type="tel"
        min="0"
        className={`tips ${selectedTip?.type === "other" ? 'border border-solid border-black' : ''}`}
        placeholder={t("Other")}
        value={(parseFloat(selectedTip?.value || 0)).toFixed(2)}
        onChange={e => {
          let inputValue = e.target.value;
          let centValue = (parseFloat(inputValue.replace('.', '')) || 0);
          centValue = centValue / 100;
          setSelectedTip({type: "other", value: centValue.toString()});
        }}
        style={{textAlign: 'center', width: '20%'}}
      />}
        {/* <Button type="other" value="5">Other</Button>
        <input 
          type="number"
          min="0"
          className={`btn ${selectedTip.type === "other" ? 'border border-solid border-black' : ''}`}
          placeholder="Other" 
          onChange={e => {
            // setOtherValue(e.target.value);
            setSelectedTip({type: "other", value: e.target.value});
          }}
          onClick={e => {
            // setOtherValue(e.target.value);
            setSelectedTip({type: "other", value: e.target.value});
          }}
          style={{textAlign: 'center'}}
        /> */}


         {/* For demonstration, added a fixed value button */}

      {/* <button className="btn border border-solid border-black">
        15%
      </button>
      <button className="btn">
        18%
      </button>
      <button className="btn">
        20%
      </button>
      <button className="btn">
        other
      </button> */}
            </div>
 
 <div className="col d-flex justify-content-end">
              <b>$ {calculateTip()}</b>
              {/* <b>$ {Math.round(100*totalPrice*0.15)/100}</b> */}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>$ {Math.round(100*(totalPrice*(1+tax_rate) + tips))/100}</b>
            </div>
            <div style={{ display: 'flex',marginTop:"10px" }}>
<img style={{height: '35px', width: 'auto'}} src={discover} alt="Discover" />

  <img style={{height: '35px', width: 'auto',marginLeft:"15px"}} src={visa} alt="Visa" />
</div>
<div style={{ display: 'flex',marginTop:"5px"  }}>
<img style={{height: '35px', width: 'auto'}} src={applepay} alt="Apple Pay" />
<img style={{height: '30px', width: 'auto', marginLeft:"10px"}} src={wechatpay} alt="wechatpay" />
<img style={{height: '30px', width: 'auto', marginLeft:"15px"}} src={alipay} alt="alipay" />
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
  const tax_rate = 0.06;

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
        {loading ? <h2>{t("Loading Payment")}...</h2> : <> <Dashboard totalPrice={Math.round(100*(totalPrice*(1+tax_rate) + tips))/100} /> </>}
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