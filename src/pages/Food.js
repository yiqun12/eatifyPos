import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import chicken from './Chicken.png';
import salad from './salad.png'
import burger from './burger.png'
import pizza from './pizza.png'
import all from './all_food.png'
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';

const Food = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  /**dorp food */



  const charSet = [
    {
      "pizza": pizza,
      "salad": salad,
      "burger": burger,
      "chicken": chicken
    }
  ];

  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDropFood = (category) => {
    //console.log("hello")
    /**shake */
    const cart = $('#cart');
    const newCartTotal = cartTotal + 1;
    setCartTotal(newCartTotal);//update cart bubble

    setTimeout(() => {
      $('#cart').addClass('shake');
    }, 400);

    setTimeout(() => {
      cart.removeClass('shake');
    }, 0);
    /**
    const left = Math.floor(Math.random() * width);
    const emoji = charSet[0][category]
    const add = `<img class="emoji" style="left: ${left}px;" src="${emoji}"/>`;
    $(add).appendTo(".container").animate(
      {
        top: $(document).height()
      },
      3500,
      function () {
        $(this).remove();
      }
    );drop */
  };
  /**drop food */

  const [cartTotal, setCartTotal] = useState(
    parseInt(sessionStorage.getItem('cartTotal')) || 0
  );

  useEffect(() => {
    sessionStorage.setItem('cartTotal', cartTotal);
  }, [cartTotal]);

  /**drop food */

  const data = JSON.parse(sessionStorage.getItem("Food_arrays"))

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
    if (sessionStorage.getItem("products") === null) {
      // If it doesn't exist, set the value to an empty array
      sessionStorage.setItem("products", JSON.stringify([]));
    }

    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));

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
      products.unshift({ id: id, name: name, subtotal: subtotal, image: image, quantity: 1 });

    }

    // Update the array in local storage
    sessionStorage.setItem("products", JSON.stringify(products));

    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };

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
  //const foodTypes = ['burger', 'pizza', 'salad', 'chicken'];
  const foodTypes = [...new Set(JSON.parse(sessionStorage.getItem("Food_arrays")).map(item => item.category))];

  return (
    <div>

      <div className='max-w-[1000px] m-auto px-4 '>
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type'>
            {/* <div className='flex justify-between flex-wrap'> */}
            <div className='scrolling-wrapper-filter mt-4' >
              <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("All")}</button>
              {foodTypes.map((foodType) => (
      <button 
        key={foodType} 
        onClick={() => filterType(foodType)} 
        className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
        style={{ display: "inline-block" }}
      >
        {t(foodType.charAt(0).toUpperCase() + foodType.slice(1))}
      </button>
    ))}
            </div>
          </div>

          {/* Filter Price
                                        <div className='Price'>
                        <div className='scrolling-wrapper-filter'>
                            <button onClick={() => filterPrice('$')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>$1-$10</button>
                            <button onClick={() => filterPrice('$$')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>$11-$20</button>
                            <button onClick={() => filterPrice('$$$')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>$21-$30</button>
                            <button onClick={() => filterPrice('$$$$')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>$31-$40</button>
                        </div>
                    </div> */}

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
                className="border rounded-lg duration-500 cursor-pointer">
                <div class="h-min overflow-hidden rounded-md">
                  <img class="w-full h-[150px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[200px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                </div>
                <div className='flex justify-between px-2 py-4 grid grid-cols-4'>
<div className="col-span-4">
  <p className=' mb-2'>{t(item.name)}</p>
</div>
<div className="col-span-2">
  <p>
    <span>
      ${item.subtotal}
    </span>
    </p>
</div>
                  <div className="col-span-2 flex justify-end">

                      <Button
                        variant="light"
                        style={{ width: '28px', height: '28px', padding: '0', margin: '0', ...divStyle }}
                        onClick={() => {
                          updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                          handleDropFood(item.category);
                          saveId(Math.random());
                        }}                                    >
                        <BsPlusCircle style={{ margin: 'auto' }} />
                      </Button>
                  </div>

                </div>

                {/* This is Tony added code */}
                {/* <Button variant="light" style={divStyle} onClick={() => printDescription(item.name)}> <AiFillPlusCircle/> </Button> */}

              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Food