import React from 'react'
import { useState } from 'react';
import './checkout.css';


const App = () => {
  let products = JSON.parse(localStorage.getItem("products"));

  return (
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
  );
};

const Item = (props) => {
const [products, setProducts] = useState(props.products);
return(
  <div className="item-container">
      {products.map((product) => (
          <div key={product.id} className="item">
                              <img src={product.image} style ={{    width: '100px',
  height: '100px',
  'object-fit': 'cover'}}/>
              <div className="item-image">

  <h2 className="item-price">${product.subtotal}</h2>
                     <h4 className="item-quantity">Quantity: {product.quantity}</h4>

              </div>
          </div>
      ))}
  </div>
  )
};

const Checkout = (props) => (
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
);

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