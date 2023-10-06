import React, { useState, useEffect, useRef } from 'react'
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
import { db } from '../firebase/index';
import { doc, getDoc } from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid';

const Food = ({ store, selectedTable }) => {
  //const params = new URLSearchParams(window.location.search);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  const [count, setCount] = useState(0);  // Set up a state

  const handleAttributeSelect = (attributeName, variationType, id, count) => {

    // Create a copy of the selectedAttributes state
    const updatedSelectedAttributes = { ...selectedAttributes };

    if (selectedFoodItem.attributesArr[attributeName].isSingleSelected) {
      // If isSingleSelected is true, set the selected variation as a string
      updatedSelectedAttributes[attributeName] = variationType;
    } else {
      // If isSingleSelected is false, allow multiple selections as an array
      if (!updatedSelectedAttributes[attributeName]) {
        // If the attribute is not selected yet, initialize it as an array
        updatedSelectedAttributes[attributeName] = [variationType];
      } else {
        // If the attribute is already selected, add or remove from the array
        if (updatedSelectedAttributes[attributeName].includes(variationType)) {
          updatedSelectedAttributes[attributeName] = updatedSelectedAttributes[attributeName].filter(
            (selected) => selected !== variationType
          );
        } else {
          updatedSelectedAttributes[attributeName] = [
            ...updatedSelectedAttributes[attributeName],
            variationType,
          ];
        }

        // If the array becomes empty after modification, delete it from the object
        if (updatedSelectedAttributes[attributeName].length === 0) {
          delete updatedSelectedAttributes[attributeName];
        } else {
          // Sort the array if it is not empty
          updatedSelectedAttributes[attributeName].sort();
        }
      }
    }

    // Update the state with the new selected attributes
    setSelectedAttributes(updatedSelectedAttributes);

    // After updating selectedAttributes, recalculate the total price
    const newTotalPrice = TotalAttributePrice(updatedSelectedAttributes, selectedFoodItem.attributesArr);
    setTotalPrice(newTotalPrice);
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    const product = products.find((product) => product.id === id && product.count === count);
    console.log(product)
    console.log(parseFloat(searchSpeicalFoodQuantity(id, count)))

    product.attributeSelected = updatedSelectedAttributes
    product.itemTotalPrice = Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) / 100)
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

  };


  // Function to calculate the total price based on selected attributes
  const TotalAttributePrice = (selectedAttributes, attributesArr) => {
    let total = 0;

    for (const attributeName in selectedAttributes) {
      const selectedVariations = selectedAttributes[attributeName];
      const attributeDetails = attributesArr[attributeName];

      if (attributeDetails.isSingleSelected) {
        // For single selection attributes, find the selected variation and add its price
        const selectedVariation = attributeDetails.variations.find(
          (variation) => variation.type === selectedVariations
        );
        if (selectedVariation) {
          total += selectedVariation.price;
        }
      } else {
        // For multiple selection attributes, iterate through selected variations
        selectedVariations.forEach((selectedVariation) => {
          const variation = attributeDetails.variations.find(
            (variation) => variation.type === selectedVariation
          );
          if (variation) {
            total += variation.price;
          }
        });
      }
    }

    return total;
  };


  //const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  //console.log(store)

  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(window.location.search);

  const storeValue = store

  console.log(storeValue)

  const [data, setData] = useState([]);
  const [storeInfo, setStoreInfo] = useState({});
  const [foodTypes, setFoodTypes] = useState([]);
  const [foodTypesCHI, setFoodTypesCHI] = useState([]);
  //const [storeOpenTime, setStoreOpenTime] = useState( );
  const localStorageId = sessionStorage.getItem('TitleLogoNameContent');
  const formatPriceDisplay = (price) => {
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };
  const [storeOpenTime, setStoreOpenTime] = useState(sessionStorage.getItem('TitleLogoNameContent') !== null ? JSON.parse(JSON.parse(sessionStorage.getItem('TitleLogoNameContent')).Open_time) : { "0": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "1": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "2": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "3": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "4": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "5": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "6": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" }, "7": { "timeRanges": [{ "openTime": "xxxx", "closeTime": "2359" }], "timezone": "ET" } });

  const fetchPost = async (name) => {
    const docRef = doc(db, "TitleLogoNameContent", name);

    try {
      // Fetch the document
      const docSnapshot = await getDoc(docRef);
      console.log(docSnapshot)
      // Check if a document was found
      if (docSnapshot.exists()) {
        // The document exists
        const docData = docSnapshot.data();

        // Save the fetched data to sessionStorage
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(docData));
        setStoreOpenTime(JSON.parse(docData.Open_time))
        // Assuming you want to store the key from the fetched data as "Food_arrays"
        sessionStorage.setItem("Food_arrays", docData.key);
        setData(JSON.parse(docData.key))
        setFoods(JSON.parse(docData.key))
        setStoreInfo(docData)
        setFoodTypes([...new Set(JSON.parse(docData.key).map(item => item.category))])
        setFoodTypesCHI([...new Set(JSON.parse(docData.key).map(item => item.categoryCHI))])
        console.log(JSON.parse(docData.key))
        console.log([...new Set(JSON.parse(docData.key).map(item => item.category))])
        //const foodTypes = [...new Set(JSON.parse(sessionStorage.getItem("Food_arrays")).map(item => item.category))];

        // Check if the stored item is empty or non-existent, and handle it
        if (!sessionStorage.getItem("Food_arrays") || sessionStorage.getItem("Food_arrays") === "") {
          sessionStorage.setItem("Food_arrays", "[]");
        }
        // window.location.reload();
      } else {
        sessionStorage.setItem("Food_arrays", "[]");


        // window.location.reload();
        setData([])
        setFoods([])

        console.log("No document found with the given name.");
      }
    } catch (error) {
      sessionStorage.setItem("Food_arrays", "[]");

      setData([])
      setFoods([])

      console.error("Error fetching the document:", error);
    }
  }

  useEffect(() => {
    fetchPost(storeValue);
    //console.log("hello")
  }, []); // <-- Empty dependency array

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

  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
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
      $('#cart').addClass('pulse');
    }, 200);

    setTimeout(() => {
      cart.removeClass('pulse');
    }, 0);
  };

  const scrollingWrapperRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        scrollingWrapperRef.current.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    const wrapper = scrollingWrapperRef.current;
    wrapper.addEventListener('wheel', handleWheel);

    // Cleanup event listener when the component unmounts
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty dependency array means this useEffect runs once when component mounts


  /**drop food */

  //const data = JSON.parse(sessionStorage.getItem("Food_arrays"))

  const [foods, setFoods] = useState([]);
  const [selectedFoodType, setSelectedFoodType] = useState(null);


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
  const filterTypeCHI = (categoryCHI) => {
    setFoods(
      data.filter((item) => {
        return item.categoryCHI === categoryCHI;
      })
    )
  }
  const filternameCHI = (CHI) => {
    setFoods(
      data.filter((item) => {
        return item.CHI.includes(CHI);
      })
    )
  }
  const [input, setInput] = useState("");

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (sessionStorage.getItem("Google-language").includes("Chinese")) {
      filternameCHI(event.target.value);

    } else {
      filtername(event.target.value);

    }
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();


  const divStyle = {
    color: 'black',
  };

  const addSpecialFood = (id, name, subtotal, image, attributeSelected, count) => {

    // Check if the array exists in local storage
    if (localStorage.getItem(store + "-" + selectedTable) === null) {
      // If it doesn't exist, set the value to an empty array
      localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
    }
    if (!localStorage.getItem(store + "-" + selectedTable)) {
      // If it doesn't exist, set the value to an empty array
      localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
    }
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));

    // Find the product with the matching id
    //let product = products.find((product) => product.id === id);
    const product = products?.find((product) => product.id === id && product.count === count);

    // If the product exists, update its name, subtotal, image, and timesClicked values
    if (product) {
      product.name = name;
      product.subtotal = subtotal;
      product.image = image;
      product.quantity++;
      product.attributeSelected = attributeSelected;
      product.count = count;
      product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) / 100)
    } else {
      // If the product doesn't exist, add it to the array
      products?.unshift({ id: id, name: name, subtotal: subtotal, image: image, quantity: 1, attributeSelected: attributeSelected, count: count, itemTotalPrice: subtotal });
    }



    //product.itemTotalPrice= Math.round(100 *((parseFloat(totalPrice)+parseFloat(product.subtotal))*parseFloat(product.quantity))/ 100)
    console.log(product)
    // Update the array in local storage
    localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));

    const calculateTotalQuant = () => {
      const total = products?.reduce((acc, product) => acc + (product.quantity), 0);
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };


  const deleteSpecialFood = (id, count, attributeSelected) => {
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));

    if (products && products.length > 0) {
      // Find the index of the product with the given id
      //const productIndex = products.findIndex((item) => item.id === id);
      let productIndex = products.findIndex((product) => product.id === id && product.count === count);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {
        products[productIndex].quantity -= 1;

        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0) {
          console.log("delete now")
          products.splice(productIndex, 1);
          localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
          hideModal()
          return
        }
        const product = products.find((product) => product.id === id && product.count === count);

        product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) / 100)
        // Save the updated array in local storage
        localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
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
  const searchSpeicalFoodQuantity = (id, count) => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    const product = products.find((product) => product.id === id && product.count === count);
    // If the product is not found or the quantity is less than or equal to 0, return 0
    return product ? product.quantity : 0;
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
  //const foodTypes = [...new Set(JSON.parse(sessionStorage.getItem("Food_arrays")).map(item => item.category))];

  // for businessHours
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
  const [selectedFoodItem, setSelectedFoodItem] = useState('')
  const [isOpen, setIsOpen] = useState(false);
  const [isModalVisible, setModalVisibility] = useState(false);

  // Function to show the modal
  const showModal = (item) => {
    const randomNum = uuidv4()
    setCount(randomNum);  // Increment the count every time the modal is opened
    setModalVisibility(true);
    setSelectedAttributes({})
    setTotalPrice(0);
    addSpecialFood(item.id, item.name, item.subtotal, item.image, {}, randomNum)
    //const [selectedAttributes, setSelectedAttributes] = useState({});
    //const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  }

  // Function to hide the modal
  const hideModal = () => {
    setModalVisibility(false);
  }

  useEffect(() => {
    // Function to update the store status
    function updateStoreStatus() {
      setIsOpen(isWithinTimeRange(storeOpenTime));
    }

    // Call the updateStoreStatus function initially to set the store status
    updateStoreStatus();

    // Update the store status every minute (you can adjust the interval if needed)
    const intervalId = setInterval(updateStoreStatus, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (false) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {


    return (

      <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
        {isModalVisible && (
          <div id={count} className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl max-h-full ">
              <div className="relative bg-white rounded-lg border-black shadow dark:bg-gray-700">
                <div className="flex items-start justify-between p-1 border-b rounded-t dark:border-gray-600">
                  <button
                    onClick={hideModal}  // Updated to use hideModal
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                    <span className="sr-only">{t("Close modal")}</span>
                  </button>
                </div>
                <div className='flex justify-between'>
                  <img loading="lazy" class="w-full h-[120px] transition-all cursor-pointer object-cover" src={selectedFoodItem.image} alt={selectedFoodItem.name} />
                </div>
                <div className='p-4 pt-3'>
                  <div>
                    {selectedFoodItem?.name}
                  </div>
                  {Object.entries(selectedFoodItem.attributesArr).map(([attributeName, attributeDetails]) => (
                    <div key={attributeName}>
                      <p className="mb-1">
                        <span className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                          {attributeName} {attributeDetails.isSingleSelected ? "(Choose 1)" : ""}
                        </span>
                      </p>

                      <div className='flex flex-wrap'>
                        {attributeDetails.variations.map((variation, idx) => (
                          <div key={idx}>
                            <div
                              className={`mb-1 mr-1 mt-1 ${attributeDetails.isSingleSelected
                                ? selectedAttributes[attributeName] === variation.type
                                  ? 'selected-variation'
                                  : ''
                                : selectedAttributes[attributeName]?.includes(variation.type)
                                  ? 'selected-variation'
                                  : ''
                                }`}
                              style={{
                                position: 'relative',
                                background: attributeDetails.isSingleSelected
                                  ? selectedAttributes[attributeName] === variation.type
                                    ? 'rgb(207, 238, 227)' // Selected background color
                                    : 'white' // Not selected background color (white)
                                  : selectedAttributes[attributeName]?.includes(variation.type)
                                    ? 'rgb(207, 238, 227)' // Selected background color
                                    : 'white', // Not selected background color (white)
                                border: attributeDetails.isSingleSelected ||
                                  (selectedAttributes[attributeName]?.includes(variation.type))
                                  ? '1px solid black' // Add a black border when background is white
                                  : '1px solid black', // No border when background is colored
                                borderRadius: '8px',
                                padding: '10px 10px 10px 10px',
                                height: '32px',
                                fontFamily: "Suisse Int'l",
                                fontStyle: 'normal',
                                fontWeight: 600,
                                fontSize: '12px',
                                lineHeight: '12px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                color: 'black',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleAttributeSelect(attributeName, variation.type, selectedFoodItem.id, count)}
                            >
                              {variation.type}({formatPriceDisplay(variation.price)})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* <pre>{JSON.stringify(selectedAttributes, null, 2)}</pre>
                  <div>{searchSpeicalFoodQuantity(selectedFoodItem.id, count)}</div> */}
                </div>
                <div className='p-4 pt-3 flex justify-between'>
                  <div>
                    ${Math.round(100 * ((parseFloat(selectedFoodItem.subtotal) + parseFloat(totalPrice)) * parseFloat(searchSpeicalFoodQuantity(selectedFoodItem.id, count)))) / 100}
                  </div>
                  {searchSpeicalFoodQuantity(selectedFoodItem.id, count) == 0 ?
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
                              addSpecialFood(selectedFoodItem.id, selectedFoodItem.name, selectedFoodItem.subtotal, selectedFoodItem.image, selectedAttributes, count);
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
                                deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes);
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
                              {searchSpeicalFoodQuantity(selectedFoodItem.id, count)}
                            </span>

                          </span>


                          <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                            <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                              onClick={() => {
                                handleDropFood();
                                addSpecialFood(selectedFoodItem.id, selectedFoodItem.name, selectedFoodItem.subtotal, selectedFoodItem.image, selectedAttributes, count);
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
            </div>
          </div>
        )}
        <div className='max-w-[1000px] m-auto px-4 '>
          <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
            {/* Filter Type */}
            <div className='Type' >
              {/* <div className='flex justify-between flex-wrap'> */}

              {/* web mode */}

              <>

                <div className='flex' style={{ justifyContent: 'space-between', alignItems: 'center' }}>

                  <div className="mt-2 flex justify-center bg-gray-200 h-10 rounded-md pl-2 w-full items-center">
                    <input
                      type="search"
                      className='flex bg-transparent p-2 w-full focus:outline-none text-black'
                      placeholder={t('Search Food Item')}
                      onChange={handleInputChange}
                    />
                    <FiSearch size={5} className="bg-black text-white p-[10px] h-10 rounded-md w-10 font-bold" />
                  </div>
                </div>
              </>

              {/* end of the top */}
              <div ref={scrollingWrapperRef} className="mt-2 scrolling-wrapper-filter mb-0">

                <button onClick={() => {
                  setFoods(data)
                  setSelectedFoodType(null);
                }}
                  className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 ${selectedFoodType === null ? 'underline' : ''}`}
                  style={{ display: "inline-block", textUnderlineOffset: '0.5em' }}><div>{t("All")}</div></button>

                {
                  translationsMode_ === 'ch'
                    ? foodTypesCHI.map((foodType) => (
                      <button
                        key={foodType}
                        onClick={() => {
                          filterTypeCHI(foodType);
                          setSelectedFoodType(foodType);
                        }}
                        className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 ${selectedFoodType === foodType ? 'underline' : ''
                          }`}
                        style={{ display: 'inline-block', textUnderlineOffset: '0.5em' }}
                      >
                        <div>
                          {foodType && foodType.length > 1
                            ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                            : ''}
                        </div>
                      </button>
                    ))
                    : foodTypes.map((foodType) => (
                      <button
                        key={foodType}
                        onClick={() => {
                          filterType(foodType);
                          setSelectedFoodType(foodType);
                        }}
                        className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 ${selectedFoodType === foodType ? 'underline' : ''
                          }`}
                        style={{ display: 'inline-block', textUnderlineOffset: '0.5em' }}
                      >
                        <div>
                          {foodType && foodType.length > 1
                            ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                            : ''}
                        </div>
                      </button>
                    ))
                }

              </div>
            </div>

          </div>

          {/* diplay food */}
          <AnimatePresence>
            <div className={isMobile ? 'grid grid-cols-1 gap-3 pt-2' : 'grid lg:grid-cols-2 gap-3'} style={{
              gridTemplateRows: `repeat(1, 1fr)`,
              gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)'
            }}>
              {foods.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key={item.id}
                  className=" rounded-lg cursor-pointer">
                  <div className='flex'>
                    <div style={{ width: "40%" }}>
                      <div class="h-min overflow-hidden rounded-md">
                        <img loading="lazy" class="w-full h-[80px] hover:scale-125 transition-all cursor-pointer md:h-[95px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                      </div>
                    </div>
                    <div style={{ width: "60%" }}>
                      <div className='flex-row px-2 pb-1 w-full'>

                        {/* parent div of title + quantity and button parent div */}
                        <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div className="col-span-4 ">
                            <p className=' mb-1'>{translationsMode_ === "ch" ? item.CHI : item.name}</p>
                          </div>

                          {/* parent div of the quantity and buttons */}

                          {/* ^ end of parent div of quantity and button */}
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "10px"
                          }}>
                            <div className="col-span-2" style={{
                              display: "flex",
                              flexDirection: "column",
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
                                      showModal(item); setSelectedFoodItem(item);;

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
                            </div>

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
}

export default Food