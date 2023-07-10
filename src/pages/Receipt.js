
import React from 'react'
import { useState } from 'react';
import './checkout.css';
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import { useEffect } from 'react';
//import './html.css';
import { useMyHook } from './myHook';
import './SwitchToggle.css';
import moment from 'moment';

const App = () => {

  //const sessionId = location.search.replace('?session_id=', '');
  /**re-render everytime button clicked from shopping cart */
  const { id, saveId } = useMyHook(null);
  let products = JSON.parse(JSON.parse(sessionStorage.getItem('collection_data')).receipt_data)
  useEffect(() => {
    products = JSON.parse(JSON.parse(sessionStorage.getItem('collection_data')).receipt_data)
  }, [id]);

  //fetch data from local stroage products.
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

    <div className='max-w-[500px] mx-auto p-4 '>
      <div className="app-container" style={{ height: "100%" }}>
        <div className="row">
          <div className="col">
            <Item products={products} totalPrice={totalPrice} />
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
  //const { id, saveId } = useMyHook(null);
  //const [totalPrice, setTotalPrice] = useState(0);
  let products = JSON.parse(JSON.parse(sessionStorage.getItem('collection_data')).receipt_data)

  const { totalPrice } = props;
  //console.log(props.products)
  const [isModeOne, setIsModeOne] = useState(true);

  const handleToggle = () => {
    setIsModeOne(!isModeOne);
  };
// console.log(products)
 //console.log()
 //console.log(JSON.parse(sessionStorage.getItem('collection_data')).time)


    // for translations sake
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
      // const trans = sessionStorage.getItem("translations")
      //console.log(trans)
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
    <div className="card2 mb-50" >
      <div className="col d-flex">
        {/** 
        <span className="text-muted" id="orderno">
          order #546924
        </span>*/}
      </div>
      <div className="gap">
        <div className="col-2 d-flex mx-auto" />
        
        <b className="text-black text-2xl">{JSON.parse(sessionStorage.getItem('collection_data')).isDinein} ({t("PAID")})</b>
        <span className="block text-black text-sm">{t("Name")}: {JSON.parse(sessionStorage.getItem('collection_data')).pay_name}
        
        </span>
        <span className="block text-black text-sm">{t("Order ID")}: {JSON.parse(sessionStorage.getItem('collection_data')).document_id}</span>
        <span className="block text-black text-sm">{  moment(JSON.parse(sessionStorage.getItem('collection_data')).time, "YYYY-MM-DD-HH-mm-ss-SS").utcOffset(-8).format("MMMM D, YYYY h:mm a")}</span>
      </div>
      <div className="main">
        <span id="sub-title">
          <br>
          </br>
        </span>
        {products.map((product, index) => {
          return (
            <div className="row row-main" key={index}>
              <div className="col-9">
                <div className="row d-flex">
                    <b>{index+1}.{t(product.name)}</b>
                </div>
                <div className="row d-flex">
                  <p className="text-muted  mb-0 pb-0">@ ${product.subtotal} {t("each")} x {product.quantity}</p>
                </div>
              </div>
              <div className="col-3 d-flex justify-content-end">
                <p>
                  <b>${Math.round(100 * product.subtotal * product.quantity)/100}</b>
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
              <b>${JSON.parse(sessionStorage.getItem('collection_data')).subtotal}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tax")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${JSON.parse(sessionStorage.getItem('collection_data')).tax}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Tips")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${JSON.parse(sessionStorage.getItem('collection_data')).tips}</b>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <b> {t("Total")}:</b>
            </div>
            <div className="col d-flex justify-content-end">
              <b>${JSON.parse(sessionStorage.getItem('collection_data')).total}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};


export default App