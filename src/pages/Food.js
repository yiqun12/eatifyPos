import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import Appetizer from './Appetizer.png';
import House_Specialties from './House_Specialties.png';
import Soup from './Soup.png';
import Fried_Rice from './Fried_Rice.png';
import Lo_Mein from './Lo_Mein.png';
import Mei_Fun from './Mei_Fun.png';
import Chow_Mein from './Chow_Mein.png';
import Shrimp from './Shrimp.png';
import Beef from './Beef.png';
import Chicken from './Chicken.png';
import Vegetables from './Vegetables.png';
import Chef_Specialties from './Chef_Specialties.png';
import Combination_Platters from './Combination_Platters.png';
import Lunch_Special from './Lunch_Special.png';
import Side_Order from './Side_Order.png';
import Tasty_Yogurt from './Tasty_Yogurt.png';
import Fruity_Yogurt from './Fruity_Yogurt.png';
import Tasty_Milk_Tea from './Tasty_Milk_Tea.png';
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
      "Appetizer": Appetizer,
      "House_Specialties": House_Specialties,
      "Soup": Soup,
      "Fried_Rice": Fried_Rice,
      "Lo_Mein": Lo_Mein,
      "Mei_Fun": Mei_Fun,
      "Chow_Mein": Chow_Mein,
      "Shrimp": Shrimp,
      "Beef": Beef,
      "Chicken": Chicken,
      "Vegetables": Vegetables,
      "Chef_Specialties": Chef_Specialties,
      "Combination_Platters": Combination_Platters,
      "Lunch_Special": Lunch_Special,
      "Side_Order": Side_Order,
      "Tasty_Yogurt": Tasty_Yogurt,
      "Fruity_Yogurt": Fruity_Yogurt,
      "Tasty_Milk_Tea": Tasty_Milk_Tea
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
    /**drop */
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
    );
  };
  /**drop food */

  const [cartTotal, setCartTotal] = useState(
    parseInt(localStorage.getItem('cartTotal')) || 0
  );

  useEffect(() => {
    localStorage.setItem('cartTotal', cartTotal);
  }, [cartTotal]);

  /**drop food */

  const data = JSON.parse(localStorage.getItem("Food_arrays"))

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

    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };

  // for translations sake
  const trans = JSON.parse(localStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(localStorage.getItem("translations"))
    const translationsMode = localStorage.getItem("translationsMode")
  
    return (text) => {
      if (trans != null && translationsMode != null) {
        if (trans[text] != null && trans[text][translationsMode] != null) {
          return trans[text][translationsMode];
        }
      }
  
      return text;
    };
  }, [localStorage.getItem("translations"), localStorage.getItem("translationsMode")]);

  return (
    <div>

      <div className='max-w-[1000px] m-auto px-4 '>
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type'>
            {/* <div className='flex justify-between flex-wrap'> */}
            <div className='scrolling-wrapper-filter' >
              <button onClick={() => setFoods(data)} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={all} alt="" />{t("All")}</button>
              <button onClick={() => filterType('Appetizer')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Appetizer} alt="" />{t("Appetizer")}</button>
              <button onClick={() => filterType('House_Specialties')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={House_Specialties} alt="" />{t("House Specialties")}</button>
              <button onClick={() => filterType('Soup')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Soup} alt="" />{t("Soup")}</button>
              <button onClick={() => filterType('Fried_Rice')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Fried_Rice} alt="" />{t("Fried Rice")}</button>
              <button onClick={() => filterType('Lo_Mein')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Lo_Mein} alt="" />{t("Lo Mein")}</button>
              <button onClick={() => filterType('Mei_Fun')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Mei_Fun} alt="" />{t("Mei Fun")}</button>
              <button onClick={() => filterType('Chow_Mein')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Chow_Mein} alt="" />{t("Chow Mein")}</button>
              <button onClick={() => filterType('Shrimp')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Shrimp} alt="" />{t("Shrimp")}</button>
              <button onClick={() => filterType('Beef')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Beef} alt="" />{t("Beef")}</button>
              <button onClick={() => filterType('Chicken')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Chicken} alt="" />{t("Chicken")}</button>
              <button onClick={() => filterType('Vegetables')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Vegetables} alt="" />{t("Vegetables")}</button>
              <button onClick={() => filterType('Chef_Specialties')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Chef_Specialties} alt="" />{t("Chef's Specialties")}</button>
              <button onClick={() => filterType('Combination_Platters')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Combination_Platters} alt="" />{t("Combination Platters")}</button>
              <button onClick={() => filterType('Lunch_Special')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Lunch_Special} alt="" />{t("Lunch Special")}</button>
              <button onClick={() => filterType('Side_Order')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Side_Order} alt="" />{t("Side Order")}</button>
              <button onClick={() => filterType('Tasty_Yogurt')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Tasty_Yogurt} alt="" />{t("Tasty Yogurt")}</button>
              <button onClick={() => filterType('Fruity_Yogurt')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Fruity_Yogurt} alt="" />{t("Fruity Yogurt")}</button>
              <button onClick={() => filterType('Tasty_Milk_Tea')} 
              className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' 
              style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={Tasty_Milk_Tea} alt="" />{t("Tasty Milk Tea")}</button>

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
                className="border shadow-lg rounded-lg duration-500 cursor-pointer">
                <div class="h-min overflow-hidden rounded-md">
                  <img class="w-full h-[150px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[200px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                </div>
                <div className='flex justify-between px-2 py-4 grid grid-cols-4'>
                  <div className="col-span-3">
                    <p>{t(item.name)} <span>${item.subtotal}</span></p>
                  </div>
                  <div className="col-span-1">
                    <div className="container"
                      style={{

                        padding: '0', width: '38px', height: '38px'
                      }}>
                      <Button
                        variant="light"
                        style={{ width: '38px', height: '38px', padding: '0', margin: '0', ...divStyle }}
                        onClick={() => {
                          updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                          handleDropFood(item.category);
                          saveId(Math.random());
                        }}                                    >
                        <BsPlusCircle style={{ margin: 'auto' }} />
                      </Button>
                    </div>
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