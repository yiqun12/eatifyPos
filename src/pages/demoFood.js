import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';
import { FiSearch } from 'react-icons/fi';
import TextField from '@mui/material/TextField';
import Button_ from '@mui/material/Button'
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import {  doc, updateDoc, arrayUnion } from "firebase/firestore";

import BusinessHoursTable from './BusinessHoursTable.js'

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

  useEffect(() => {
    // Call the displayAllProductInfo function to retrieve the array of products from local storage
    let productArray = displayAllProductInfo();
    // Update the products state with the array of products
    setProducts(productArray);
  }, []);

  const [products, setProducts] = useState([
  ]);

  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  useEffect(() => {
    saveId(Math.random());
  }, [products]);
  const [DemoStorename, setDemoStore] = useState('demo');

  const handleDemoStoreNameChange = (event) => {
    setDemoStore(event.target.value);
  };
  const { user, user_loading } = useUserContext();

  const handleDemoStoreNameSubmit = async (event) => {
      
      event.preventDefault();
      console.log('Form submitted with name:', DemoStorename);
      const storeName = DemoStorename
      const address = "no address"
      const Open_time = "null"
      const data = localStorage.getItem("food_arrays")
  // First, check for duplicates
  const storeCollection = collection(db, "TitleLogoNameContent");
  const q = query(storeCollection, where("Name", "==", storeName));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // If a document with the same storeName is found
    alert("Store name duplicated!");
    return;
  }
  
  // If no duplicates are found, add the new document
  const newDoc = {
    Name: storeName,
    Address: address,
    Open_time: Open_time,
    key: data
  };
  
  try {
    await addDoc(storeCollection, newDoc);
    const userDoc = doc(db, "stripe_customers", user.uid);  // Assuming your collection name is "users"
    try {
      await updateDoc(userDoc, {
        storelist: arrayUnion(storeName)
      });
      window.location.href = "/store?store="+storeName;
    } catch (error) {
      console.error("Error updating storelist: ", error);
    }
    console.log("Document added successfully!");
  } catch (error) {
    console.error("Error adding document: ", error);
  }
     // console.log(data)
    };
    
    console.log(user.uid)
  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));
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

  /**dorp food */


  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;
  const handleDropFood = (category) => {
    //console.log("hello")
    /**shake */
    const cart = $('#cart');
    setTimeout(() => {
      $('#cart').addClass('rotate');
    }, 200);

    setTimeout(() => {
      cart.removeClass('rotate');
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

  const data = JSON.parse(localStorage.getItem("food_arrays"))

  const [foods, setFoods] = useState(data);

  const filterType = (category) => {
    setFoods(
      data.filter((item) => {
        return item.category === category;
      })
    )
  }
  const filtername = (name) => {
    setFoods(
      data.filter((item) => {
        return item.name.toLowerCase().includes(name.toLowerCase());
      })
    )
  }
  const [input, setInput] = useState("");

  const handleInputChange = (event) => {
    setInput(event.target.value);
    filtername(event.target.value);
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();


  const divStyle = {
    color: 'black',
  };
  const SearchQuantity = (id) => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem("products"));
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
  const handleDeleteClick = (id) => {
    let products = JSON.parse(sessionStorage.getItem("products"));
    //console.log(products);

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
        sessionStorage.setItem("products", JSON.stringify(products));
      }

    }
    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();

    saveId(Math.random());
  };
  const updateLocalStorage = (id, name, subtotal, image) => {
    //  console.log(id, name, subtotal, image);

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
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };
  const [translationsMode_, settranslationsMode_] = useState("en");
  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")
    settranslationsMode_(sessionStorage.getItem("translationsMode"))
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
  const foodTypes = translationsMode_==='ch'?[...new Set(JSON.parse(localStorage.getItem("food_arrays")).map(item => item.categoryCHI))]:[...new Set(JSON.parse(localStorage.getItem("food_arrays")).map(item => item.category))];

  // for businessHours
  const businessHours = JSON.parse(sessionStorage.getItem("businessHours"))
  // getting today's date
  const tempDate = new Date();
  const currentWeekday = tempDate.getDay();

  function parseTime(timeStr) {
    if (timeStr == "xxxx") {
      return { closed: true }
    }

    // console.log("timeString")
    const [hourStr, minuteStr] = timeStr.match(/\d{2}/g);
    // console.log(hourStr + " " + minuteStr)
    return {
      hours: parseInt(hourStr),
      minutes: parseInt(minuteStr),
      closed: false
    };
  }

  // grabs a timeStr and convert to 12 hr format such as "10:30AM"
  function convertTo12HourFormat(timeStr) {

    // console.log("timeStr in 12 hr: " + JSON.stringify(timeStr))
    const timeObj = parseTime(timeStr)
    if (timeObj.closed) {
      return 'Closed';
    }

    let hours = timeObj.hours;
    let minutes = timeObj.minutes;

    // Determine if it's AM or PM
    let period = 'AM';
    if (hours >= 12 && hours != 24) {
      period = 'PM';

      // Convert from 24 hour time to 12 hour time
      if (hours > 12) {
        hours = hours - 12;
      }
    } else if (hours === 0) {
      // Adjust for 00:xx time
      hours = 12;
    } else if (hours == 24) {
      hours = 0;
    }

    // Return the formatted time string
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  }


  // currentDayData is basically businessHours
  function isWithinTimeRange(currentDayData) {
    const offset = JSON.parse(sessionStorage.getItem("timezoneOffsets"));
    const offsetHours = parseInt(offset["hours"]);
    const offsetMinutes = parseInt(offset["minutes"]);

    const now = new Date();
    now.setHours(now.getHours() - offsetHours);
    now.setMinutes(now.getMinutes() - offsetMinutes);
    // console.log(now.toUTCString())

    const currentUTCDay = now.getUTCDay(); // Get the current day of the week in UTC (0-6)

    // console.log("currentUTCDay: ", currentUTCDay)
    // console.log(currentDayData[currentUTCDay])
    const { timeRanges, timezone } = currentDayData[currentUTCDay];

    var result = false;
    // const timeRanges = data[day].timeRanges;
    for (const range of timeRanges) {
      const openTime = range.openTime;
      const closeTime = range.closeTime;
      // loop through all the time ranges for the day to see if we are within range
      const openTimeParsed = parseTime(openTime);
      const closeTimeParsed = parseTime(closeTime);

      // if the opening Hours is "xxxx", it is closed for today
      if (openTimeParsed.closed == true) {
        result = false;
        break;
      }

      const openDate = new Date(now);
      openDate.setUTCHours(openTimeParsed.hours);
      openDate.setUTCMinutes(openTimeParsed.minutes);
      // console.log(openDate.toUTCString())

      const closeDate = new Date(now);
      closeDate.setUTCHours(closeTimeParsed.hours);
      closeDate.setUTCMinutes(closeTimeParsed.minutes);
      // console.log(openDate.toUTCString())

      if (closeDate <= openDate) {
        // Add 1 day to the closeDate in UTC
        closeDate.setUTCDate(closeDate.getUTCDate() + 1);
      }

      result = (now >= openDate && now <= closeDate);
      if (result == true) {
        break;
      }
    }
    return result;
  }

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Function to update the store status
    function updateStoreStatus() {
      setIsOpen(isWithinTimeRange(businessHours));
    }

    // Call the updateStoreStatus function initially to set the store status
    updateStoreStatus();

    // Update the store status every minute (you can adjust the interval if needed)
    const intervalId = setInterval(updateStoreStatus, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


  return (

    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      <div className='max-w-[1000px] m-auto px-4 '>
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type' >
            {/* <div className='flex justify-between flex-wrap'> */}

            {/* web mode */}
            <form onSubmit={handleDemoStoreNameSubmit} style={{ display: "flex", alignItems: "center" }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"  // I've used "Name" directly as you didn't provide the value of TitleLogoNameContent.Name
                name="name"
                autoComplete="name"
                autoFocus
                value={DemoStorename}
                onChange={handleDemoStoreNameChange}
                style={{ width: "50%" }}
            />
            <Button_
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                style={{ width: "50%", marginLeft: "5%", height: "56px" }}
            >
                Make it a real store
            </Button_>
        </form>
            {/* end of the top */}
            <div className="mt-2 scrolling-wrapper-filter">

              <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-gray-100	 hover:text-black border rounded-xl px-2 py-2' style={{ display: "inline-block" }}><div>{t("All")}</div></button>

              {foodTypes.map((foodType) => (

                <button
                  key={foodType}
                  onClick={() => filterType(foodType)}
                  className='m-1 border-black-600 text-black-600 hover:bg-gray-100 hover:text-black border rounded-xl px-2 py-2'
                  style={{ display: "inline-block" }}>
                  <div>

                  {foodType && foodType.length>1?t(foodType.charAt(0).toUpperCase() + foodType.slice(1)):""}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* diplay food */}
        <AnimatePresence>
          <div className={isMobile ? 'grid grid-cols-1 gap-3 pt-2' : 'grid lg:grid-cols-2 gap-3'}>
            {foods.map((item, index) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={item.id}
                className=" rounded-lg duration-500 cursor-pointer">
                <div className='flex'>
                  <div style={{ width: "40%" }}>
                    <div class="h-min overflow-hidden rounded-md">
                      <img loading="lazy" class="w-full h-[80px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[95px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                    </div>
                  </div>
                  <div style={{ width: "60%" }}>
                    <div className='flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full'>

                      {/* parent div of title + quantity and button parent div */}
                      <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div className="col-span-4">
                          <p className=' mb-1'>{translationsMode_ === "ch" ? item.CHI : item.name}</p>
                        </div>

                        {/* parent div of the quantity and buttons */}
                        <div style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: "10px"
                        }}>
                          <div className="col-span-2" style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                          }}>
                            <p style={{ marginBottom: "0" }}>
                              <span>
                                ${item.subtotal}
                              </span>
                            </p>
                          </div>
                          <div className="col-span-2 flex justify-end">

                            {SearchQuantity(item.id) == 0 ?
                              <>
                                <div className="quantity"
                                  style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop: "-17px", paddingTop: "20px", height: "fit-content", display: "flex", justifyContent: "flex-end" }} >

                                  <div
                                    className="black_hover"
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
                                        handleDropFood();
                                        updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                        saveId(Math.random());
                                      }}
                                    >
                                      <PlusSvg
                                        style={{
                                          margin: '0px',
                                          width: '10px',
                                          height: '10px',
                                        }}
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

                                    style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '80px', marginTop: "-18px", paddingTop: "20px", height: "fit-content" }}>
                                    <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                                      <button

                                        className="plus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                        onClick={() => {
                                          handleDeleteClick(item.id);
                                          //saveId(Math.random());
                                        }}

                                      >
                                        <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
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


                                    <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                                      <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                                        onClick={() => {
                                          handleDropFood();
                                          updateLocalStorage(item.id, item.name, item.subtotal, item.image);
                                          saveId(Math.random());
                                        }}
                                      >
                                        <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </>

                            }
                          </div>

                        </div>
                        {/* ^ end of parent div of quantity and button */}
                      </div>
                      {/* ^ end of parent div of title + quantity and buttons */}
                    </div>
                    {/* This is Tony added code */}
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