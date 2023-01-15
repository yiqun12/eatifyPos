import React from 'react'
import { useState } from 'react';
import './checkout.css';
import  CardSection from "../components/CardSection";
import  Checkout_com from "../components/Checkout";
import {Elements} from '@stripe/react-stripe-js';
import { useUserContext } from "../context/userContext";
import {loadStripe} from '@stripe/stripe-js';

const App = () => {
  
    let products = JSON.parse(localStorage.getItem("products"));
    

    return (
      
      <div className='max-w-[1240px] mx-auto p-4 '>
      <div className="app-container" style={{height:"100%"}}>
        <div className="row">
          <div className="col">
<Item products={products} />
          </div>
          <div className="col no-gutters" style={{height:"100%"}} >
            <Checkout />
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
return(
    <div className="item-container">
        {products.map((product) => (
            <div key={product.id} className="item">
          <div class="image-container">
  <img src={product.image} alt="" />
</div>
                <div className="item-image">

                <span className="item-price">{product.name} * {product.quantity}</span>
    <h2 className="item-price">${product.subtotal* product.quantity}</h2>

                </div>
            </div>
        ))}
    </div>
    )
  };
  
  const Checkout = (props) => {
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
    const promise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    return (
    <Elements stripe={promise}>
      <CardSection />
   <div className="checkout ">
      <div className="checkout-container" >
       <h3 className="heading-3">Credit card checkout</h3>
       <Input label="Cardholder's Name" type="text" name="name" />
       <Input label="Card Number" type="number" name="card_number" imgSrc="https://seeklogo.com/images/V/visa-logo-6F4057663D-seeklogo.com.png" />
        <div className="row">
          <div className="col">
            <Input label="Expiration Date" type="month" name="exp_date" />
          </div>
          <div className="col">
            <Input label="CVV" type="number" name="cvv" />
          </div>
        </div>
        <Button text="Place order" />
      </div>
   </div>
   </Elements>)
  };
  
  const Input = (props) => (
    <div className="input">
      <label>{props.label}</label>
      <div className="input-field">
        <input type={props.type} name={props.name} />
        <img src={props.imgSrc}/>
      </div>
    </div>
  );
  
  const Button = (props) => (
    <button className="checkout-btn" type="button">{props.text}</button>
  );
  
export default App