import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import chicken from './chicken.png';
import salad from './salad.png'
import burger from './burger.png'
import pizza from './pizza.png'
import all from './all_food.png'
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import plusSvg from './plus.svg';
import minusSvg from './minus.svg';
import NumberAnimation from "./Html2";


const Food = () => {


  const [numbers, setNumbers] = useState([0, 0, 0]);

  const incrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num + 1 : num))
    );
  };

  const decrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num - 1 : num))
    );
  };


  

  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('quantity');
  }, []);

  
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
  const [products, setProducts] = useState([
  ]);

  useEffect(() => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    // Update the products state with the array of products
    setProducts(productArray);
  }, []);

  useEffect(() => {
    saveId(Math.random());
  }, [products]);

  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem("products"));
    //console.log("displayProductFunction")
    //console.log(products)
    // Create an empty array to store the products
    let productArray = [];

    // Loop through the array of products
    for (let i = 0; products != null && i < products.length; i++) {
      let product = products[i];
      // Push the product object to the array
      productArray.push({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        subtotal: product.subtotal,
        image: product.image,
      });
    }

    // Return the array of product objects
    return productArray;
  };

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

  const SearchQuantity = (id) => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem("products"));
    // Check if the products array exists
    if (products && products.length > 0) {
      // Find the product with the given id
      const product = products.find((item) => item.id === id);

      // If the product is found and has a quantity greater than 0, return the quantity
      if (product && product.quantity && product.quantity > 0) {
        //console.log("hello " + product.quantity)
        return product.quantity;
      }
    }
    //console.log("hello 0")
    // If the product is not found or the quantity is less than or equal to 0, return 0
    return 0;
  };

  //console.log(SearchQuantity("3RSAYzckSkrxP8hikiuN"))

  const handleDeleteClick = (id) => {
    let products = JSON.parse(localStorage.getItem("products"));
    console.log(products);

    if (products && products.length > 0) {
      // Find the index of the product with the given id
      const productIndex = products.findIndex((item) => item.id === id);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {
        products[productIndex].quantity -= 1;

        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0) {
          products.splice(productIndex, 1);
        }

        // Save the updated array in local storage
        localStorage.setItem("products", JSON.stringify(products));
      }

    }
    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();

    saveId(Math.random());
  };


  const updateLocalStorage = (id, name, subtotal, image) => {
    console.log(id, name, subtotal, image);
    //print()
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
              <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("All")}</button>
              <button onClick={() => filterType('GRILLED SEAFOOD')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("GRILLED SEAFOOD")}</button>
              <button onClick={() => filterType('DRINKS')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("DRINKS")}</button>
              <button onClick={() => filterType('GRILLED VEGETABLE')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("GRILLED VEGETABLE")}</button>
              <button onClick={() => filterType('TINFOIL')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("TINFOIL")}</button>
              <button onClick={() => filterType('Special Fruit Drinks')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("Special Fruit Drinks")}</button>
              <button onClick={() => filterType('BBQ')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("BBQ")}</button>
              <button onClick={() => filterType('RICE/NOODLES/BREAD')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("RICE/NOODLES/BREAD")}</button>
              <button onClick={() => filterType('HOTPOT SOUP BASE')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("HOTPOT SOUP BASE")}</button>
              <button onClick={() => filterType('Meat ingredients')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("Meat ingredients")}</button>
              <button onClick={() => filterType('Vegetable ingredients')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("Vegetable ingredients")}</button>
              <button onClick={() => filterType('RICE/NOODLES/BREAD')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("RICE/NOODLES/BREAD")}</button>
              <button onClick={() => filterType('Chinese Kung Fu Steamed Rice')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("Chinese Kung Fu Steamed Rice")}</button>
              <button onClick={() => filterType('CONGEE')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("CONGEE")}</button>
              <button onClick={() => filterType('HOUSE SPECIAL')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("HOUSE SPECIAL")}</button>
              <button onClick={() => filterType('SAUCE')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("SAUCE")}</button>
              <button onClick={() => filterType('STIR DISH')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("STIR DISH")}</button>
              <button onClick={() => filterType('Night Snack Only')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}>{t("Night Snack Only")}</button>
              {/* <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={all} alt="" />{t("All")}</button>
              <button onClick={() => filterType('burger')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={burger} alt="" />{t("Burgers")}</button>
              <button onClick={() => filterType('pizza')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={pizza} alt="" />{t("Pizza")}</button>
              <button onClick={() => filterType('salad')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={salad} alt="" />{t("Salads")}</button>
              <button onClick={() => filterType('chicken')} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-5 py-1' style={{ display: "inline-block" }}><img style={{ width: "40px", height: "40px", margin: "auto" }} src={chicken} alt="" />{t("Chicken")}</button> */}
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-4'>
            {foods.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={item.id}
                className="border shadow-sm rounded-lg duration-500 cursor-pointer max-h-[150px]">
                <div class="overflow-hidden rounded-md flex">
                  <div class="w-1/3 max-h-[150px]">

                    <div class="overflow-hidden rounded-md flex shadow-md" style={{ margin: "10px" }}>
                      <div
                        class="hover:scale-125 duration-500 cursor-pointer h-full overflow-hidden flex w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.image})`,
                          minHeight: "128px",
                          maxHeight: "130px",
                        }}
                      ></div>
                    </div>

                  </div>
                  <div class="w-2/3 pl-2">

                  <div className="flex flex-col w-full h-full">
      <div className="w-98 h-1/4 bg-blue-500 mr-2">
        {/* Your content for the blue half goes here */}
        <div className="col-span-4 row-span-3">
                        <p>{t(item.name)} </p>
                      </div>
      </div>
      <div className="w-98 h-2/6 bg-pink-500 mr-2 overflow-auto">
  {item.description}
  {/* Your content for the green half goes here */}
</div>
      <div className="w-98 h-1/6 bg-yellow-500 mr-2">
        {/* Your content for the green half goes here */}
      </div>
      <div className="w-98 h-1/4 flex mr-2">
  <div className="w-1/3 h-full bg-red-500">
    {/* Your content for the red half goes here */}
    <span style={{fontSize:"25px"}}>$ {item.subtotal}</span>
  </div>
  <div className="w-2/3 h-full bg-green-500">
    {/* Your content for the green half goes here */}
    <div className="flex justify-end col-span-4 row-span-1">
                        {SearchQuantity(item.id) == 0 ?
                          <>
                            <div className="quantity"
                              style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop:"-17px", paddingTop: "20px", height: "fit-content", display: "flex", justifyContent: "flex-end" }} >

                              <div
                                style={{
                                  padding: '4px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  display: "flex",
                                  border: "1px solid", // Adjust the border
                                  borderRadius: "50%", // Set borderRadius to 50% for a circle
                                  width: "30px", // Make sure width and height are equal
                                  height: "30px",

                                }}
                              >
                                <button
                                  className="minus-btn"
                                  type="button"
                                  name="button"
                                  style={{
                                    marginTop: '0px',
                                    width: '20px',
                                    height: '20px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: "flex",
                                  }}
                                  onClick={() => {
                                    updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                    saveId(Math.random());
                                  }}
                                >
                                  <img
                                    style={{
                                      margin: '0px',
                                      width: '10px',
                                      height: '10px',
                                    }}
                                    src={plusSvg}
                                    alt=""
                                  />
                                </button>
                              </div>
                            </div>
                          </>
                          :
                          <>
<div
      className={animationClass}
      style={{
        margin: '0px',
        display: 'flex',
        whiteSpace: 'nowrap',
        width: '80px',
        marginTop: '-18px',
        paddingTop: '20px',
        height: 'fit-content',
      }}
    >
                            <div className="quantity"
                              style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop:"-18px", paddingTop: "20px", height: "fit-content" }}>
                              <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                                <button

                                  className="plus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                  onClick={() => {

                                    handleDeleteClick(item.id);
                                    //saveId(Math.random());
                                  }}

                                >
                                  <img style={{ margin: '0px', width: '10px', height: '10px' }} src={minusSvg} alt="" />
                                </button>
                              </div>
                              <span
                              
                                type="text"
                                style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                              >
                                
                                <span >
                                {SearchQuantity(item.id)}
                                </span>
                              
                              </span>

                              
                              <div style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                                <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                  onClick={() => {
                                    updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                    saveId(Math.random());
                                  }}
                                >
                                  <img style={{ margin: '0px', width: '10px', height: '10px' }} src={plusSvg} alt="" />
                                </button>
                              </div>
                            </div>
                            
    </div>



                            
                            </>

                        }

                      </div>
  </div>
</div>


    </div>





                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Food

