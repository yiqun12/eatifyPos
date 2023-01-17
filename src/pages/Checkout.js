
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import  CardSection from "../components/CardSection";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.css'; 
import './group_list.css';
import Dashboard from "../components/dashboard";
import { useUserContext } from "../context/userContext";
import { useRef, useEffect } from 'react';


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
      <div className="app-container" style={{height:"100%"}}>
        <div className="row">
          <div className="col">
<Item products={products} totalPrice={totalPrice} />
          </div>
          <div className="col no-gutters" style={{height:"100%"}} >
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
return(
    <div className="item-container">
      <h1>Total price: {totalPrice}</h1>
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
    const { loading  } = useUserContext();
    const { totalPrice } = props;
    return (
   <div className="checkout ">
      <div className="checkout-container" >
       <h3 className="heading-3">Credit card checkout</h3>
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
        <img src={props.imgSrc}/>
      </div>
    </div>
  );
  
  const Button = (props) => (
    <button className="checkout-btn" type="button">{props.text}</button>
  );
  
export default App