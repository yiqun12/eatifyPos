
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


const App = () => {
  
  let products = JSON.parse(localStorage.getItem("products"));
  //console.log(localStorage.getItem("products"))
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    //maybe add a line here...
    const calculateTotalPrice = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
      setTotalPrice(total);
    }
    calculateTotalPrice();
  }, [products]);

  return (

    <div className='max-w-[1240px] mx-auto p-4 '>
      <div className="app-container" style={{ height: "100%" }}>
        <div className="row">
          <div className="col">
            <Item products={products} totalPrice={totalPrice} />
          </div>
          <div className="col no-gutters" style={{ height: "100%" }} >
            <Checkout totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </div>
  );
};
/**                    <img src={product.image} style ={{    width: '100px',
  height: '100px',
  'object-fit': 'cover'}}/> */
const Item = (props) => {

  const [products, setProducts] = useState(props.products);
  const { totalPrice } = props;
  console.log(products)

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
        <div style={{'text-align': "center"}}>
  <div className="title" style={{margin: "auto"}}>Thank you!</div>
  </div>
      </div>

      <div className="main">
        <span id="sub-title">
          <p>
            <b>Payment Summary</b>
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
                    <b>{product.name}</b>
                  </p>
                </div>
                <div className="row d-flex">
                  <p className="text-muted">@ ${product.subtotal} each x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>${product.subtotal * product.quantity}</b>
                </p>
              </div>
            </div>
          );
        })}
        <hr />
        <div className="total">
          <div className="row">
            <div className="col">
              <b> Total:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${totalPrice}</b>
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
  return (
    <div className="checkout ">
      <div className="checkout-container" >
        {loading ? <h2>Loading Payment...</h2> : <> <Dashboard totalPrice={totalPrice} /> </>}
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