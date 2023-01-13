import React from 'react'
import {data} from '../data/data.js'

const Card = () => {

    function getRandomNumbers(n) {
        var numbers = Array.from({length: n}, (_, i) => i);
        var randomNumbers = [];
        for (var i = 0; i < 3; i++) {
            var randomIndex = Math.floor(Math.random() * numbers.length);
            randomNumbers.push(numbers[randomIndex]);
            numbers.splice(randomIndex, 1);
        }
        return randomNumbers;
    }

    // console.log(data.length)
    var itemNumbers = getRandomNumbers(data.length)
    console.log(itemNumbers) 

    /////////////////////////////////////////////////////////////

    // from Food.js to update the food cart
    const updateLocalStorage = (id, name, subtotal, image) => {
        console.log(id, name, subtotal, image);
      
        // Check if the array exists in local storage
        if (localStorage.getItem("products") === null) {
          // If it doesn't exist, set the value to an empty array
          localStorage.setItem("products", JSON.stringify([]));
        }
      
        // Retrieve the array from local storage
        let products = JSON.parse(localStorage.getItem("products"));
      
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
        localStorage.setItem("products", JSON.stringify(products));
      };
      /////////////////////////////////////////////////////////////////////

    
      var item1 = data[itemNumbers[0]]
      var item2 = data[itemNumbers[1]]
      var item3 = data[itemNumbers[2]]




  return (
    <div className='max-w-[1240px] mx-auto p-4 py-12 grid md:grid-cols-3 gap-6'>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
            <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
                <p className=' font-bold text-2xl px-2 pt-4'>{item1.name}</p>
                <p className='px-2'>Through 8/26</p>
                <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md' onClick={(e) => updateLocalStorage(item1.id, item1.name, item1.subtotal, item1.image)}>Order Now</button>
            </div>
            <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src={item1.image} alt="" />
        </div>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
            <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
                <p className=' font-bold text-2xl px-2 pt-4'>{item2.name}</p>
                <p className='px-2'>Through 8/26</p>
                <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md' onClick={(e) => updateLocalStorage(item2.id, item2.name, item2.subtotal, item2.image)}>Order Now</button>
            </div>
            <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src={item2.image} alt="" />
        </div>
        <div className='rounded-xl relative hover:scale-105 duration-500 cursor-pointer'>
            <div className='absolute w-full h-full bg-black/50 rounded-xl text-white'>
                <p className=' font-bold text-2xl px-2 pt-4'>{item3.name}</p>
                <p className='px-2'>Through 8/26</p>
                <button className='border border-white bg-white text-black mx-2 rounded-xl px-5 py-1 absolute bottom-4 shadow-md' onClick={(e) => updateLocalStorage(item3.id, item3.name, item3.subtotal, item3.image)}>Order Now</button>
            </div>
            <img className='max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl' src={item3.image} alt="" />
        </div>
    </div>
  )
}

export default Card