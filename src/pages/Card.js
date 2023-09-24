
//import {data} from '../data/data.js'
import React, { useState,useEffect } from 'react'
import { useMyHook } from './myHook';


const Card = () => {
  const params = new URLSearchParams(window.location.search);

  const  store  = params.get('store') ? params.get('store').toLowerCase() : "";
  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  console.log(store)
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  /**click show add */
  const [clicked, setClicked] = useState(false);
  useEffect(() => {
    let timeoutId;
    if (clicked) {
      timeoutId = setTimeout(() => setClicked(false), 1200);
    }
    return () => clearTimeout(timeoutId);
  }, [clicked]);
  /**other */  
  const data  = JSON.parse(sessionStorage.getItem("Food_arrays"))
  

   // console.log("Card printed once")
    function getRandomNumbers(n) {
        var numbers = Array.from({length: n}, (_, i) => i);
        var randomNumbers = [];
        for (var i = 0; i < 2; i++) {
            var randomIndex = Math.floor(Math.random() * numbers.length);
            randomNumbers.push(numbers[randomIndex]);
            numbers.splice(randomIndex, 1);
        }
        return randomNumbers;
    }

    // console.log(data.length)
    if(data != null){
        var itemNumbers = getRandomNumbers(data.length)}
    // console.log(itemNumbers) 
    // console.log(itemNumbers)  

    /////////////////////////////////////////////////////////////

    // from Food.js to update the food cart
    const updateLocalStorage = (id, name, subtotal, image) => {
      //  console.log(id, name, subtotal, image);
      
        // Check if the array exists in local storage
        if (sessionStorage.getItem(store) === null) {
          // If it doesn't exist, set the value to an empty array
          sessionStorage.setItem(store, JSON.stringify([]));
        }
      
        // Retrieve the array from local storage
        let products = JSON.parse(sessionStorage.getItem(store));
      
        // Find the product with the matching id
        let product = products.find((product) => product.id === id);
      
        // If the product exists, update its name, subtotal, image, and timesClicked values
        if (product) {
          product.name = name;
          product.subtotal = subtotal;
          product.image = image;
          product.quantity++;
        } else {
          // If the product doesn't exist, add it to the array
          products.push({ id: id, name: name, subtotal: subtotal, image: image, quantity: 1 });
        }
      
        // Update the array in local storage
        sessionStorage.setItem(store, JSON.stringify(products));
      };
      /////////////////////////////////////////////////////////////////////

    
      var item1 = data[itemNumbers[0]]
      var item2 = data[itemNumbers[1]]
      //var item3 = data[itemNumbers[2]]

        // for translations sake
      const trans = JSON.parse(sessionStorage.getItem("translations"))
      const t = (text) => {
        // const trans = sessionStorage.getItem("translations")
        //console.log(trans)
        //console.log(sessionStorage.getItem("translationsMode"))

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
    <div>


    <div className='max-w-[1000px] mx-auto p-2 py-12 grid md:grid-cols-1 gap-6'>

        <div className='rounded-xl relative hover:scale-105 cursor-pointer'>
            <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
                <p className=' font-bold text-2xl px-2 pt-4'>{[t('Guess you would like:'), <br />, t(item1.name)]}</p>
                <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md' 
                onClick={() =>  
                  window.location.href = '/Reservation'
                  //updateLocalStorage(item1.id, item1.name, item1.subtotal, item1.image)
                  }>{t("Make a reservation")}</button>
            </div>
            <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src={item1.image} alt="" />
        </div>

    </div>
    </div>
  )
}

export default Card