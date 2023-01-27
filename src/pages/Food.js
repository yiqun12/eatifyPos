import React, { useState } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle} from 'react-icons/bs';
import './Food.css';
import chicken from './chicken.png';
import salad from './salad.png'
import burger from './burger.png'
import pizza from './pizza.png'
import all from './all_food.png'

const Food = () => {
    const data  = JSON.parse(localStorage.getItem("Food_arrays"))

    const [foods, setFoods] = useState(data);

    const filterType = (category) => {
        setFoods(
            data.filter((item) => {
                return item.category === category;
            })
        )
    }
    const filterPrice = (price) => {
        setFoods(
            data.filter((item) => {
                return item.price === price;
            })
        )
    }

    // timesClicked is an object that stores the number of times a item is clicked
    //const timesClicked = new Map();


    const divStyle = {
        color: 'black',
      };

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

    return (
        <div className='max-w-[1240px] m-auto px-4 py-12'>
            <h1 className='text-orange-600 font-bold text-4xl text-center'>
                Top Rated Menu Items
            </h1>
            <div className='flex flex-col lg:flex-row justify-between' style={{flexDirection: "column"}}>
                {/* Filter Type */}
                <div className='Type'>
                    <p className='font-bold text-gray-700'>Filter Type</p>
                    {/* <div className='flex justify-between flex-wrap'> */}
                    <div className='scrolling-wrapper-filter'>
                        <button onClick={() => setFoods(data)} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}><img style={{width: "40px", height: "40px", margin: "auto"}} src={all} alt=""/>All</button>
                        <button onClick={() => filterType('burger')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}><img style={{width: "40px", height: "40px", margin: "auto"}} src={burger} alt=""/>Burgers</button>
                        <button onClick={() => filterType('pizza')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}><img style={{width: "40px", height: "40px", margin: "auto"}} src={pizza} alt=""/>Pizza</button>
                        <button onClick={() => filterType('salad')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}><img style={{width: "40px", height: "40px", margin: "auto"}} src={salad} alt=""/>Salads</button>
                        <button onClick={() => filterType('chicken')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}><img style={{width: "40px", height: "40px", margin: "auto"}} src={chicken} alt=""/>Chicken</button>
                    </div>
                </div>

                {/* Filter Price */}
                <div className='Price'>
                    <p className='font-bold text-gray-700'>Filter Price</p>
                    {/* <div className='flex justify-between flex-wrap max-w-[390px] w-full'> */}
                    {/* <div className='flex justify-between flex-wrap w-full'> */}
                    <div className='scrolling-wrapper-filter'>
                        <button onClick={() => filterPrice('$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}>$</button>
                        <button onClick={() => filterPrice('$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}>$$</button>
                        <button onClick={() => filterPrice('$$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}>$$$</button>
                        <button onClick={() => filterPrice('$$$$')} className='m-1 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white border rounded-xl px-5 py-1' style={{display: "inline-block"}}>$$$$</button>
                    </div>
                </div>
            </div>

            {/* diplay food */}
            <AnimatePresence>
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4'>
                    {foods.map((item, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            key={item.id}
                            className="border shadow-lg rounded-lg hover:scale-105 duration-500 cursor-pointer">
                            <img className='w-full h-[150px] md:h-[200px] object-cover rounded-t-lg' src={item.image} alt={item.name}  />
                            <div className='flex justify-between px-2 py-4'>
                                <p>{item.name} <span>${item.subtotal}</span></p>
                                <Button
  variant="light"
  style={divStyle}
  onClick={(e) => updateLocalStorage(item.id, item.name, item.subtotal, item.image)}
>
  <BsPlusCircle />
</Button>
                            </div>

                            {/* This is Tony added code */}
                            {/* <Button variant="light" style={divStyle} onClick={() => printDescription(item.name)}> <AiFillPlusCircle/> </Button> */}
                
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </div>
    )
}

export default Food