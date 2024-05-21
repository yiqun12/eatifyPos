

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
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase/index';
import { useParams } from 'react-router-dom';
import { query, where, limit, doc, getDoc,onSnapshot  } from "firebase/firestore";
import LazyLoad from 'react-lazy-load';

import BusinessHoursTable from './BusinessHoursTable.js'
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import pinyin from "pinyin";

import myImage from '../components/check-mark.png';  // Import the image

function convertToPinyin(text) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL,
  }).join('');
}


const customMarkerIcon = L.icon({
  iconUrl: 'http://simpleicon.com/wp-content/uploads/map-marker-1.png',
  iconSize: [40, 40], // making the icon a square of 40x40 pixels
  iconAnchor: [20, 40], // adjust based on the actual anchor point of your icon
  popupAnchor: [0, -40] // adjust based on where you want the popup to appear
});

const Food = () => {


  const [divHeight, setDivHeight] = useState('calc(100vh - 100px)');
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "scroll"
    };
  }, []);
  useEffect(() => {
    const updateHeight = () => {
      const screenHeight = window.innerHeight;
      const newHeight = `${screenHeight - 100}px`;
      setDivHeight(newHeight);
    };

    // Call updateHeight on mount and add resize event listener
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  const position = [40.597826, -73.992173]; // Latitude and longitude for 168 28th Avenue, Brooklyn, NY 11214

  //const params = new URLSearchParams(window.location.search);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  const [count, setCount] = useState(0);  // Set up a state

  const handleAttributeSelect = (attributeName, variationType, id, count) => {

    // Create a copy of the selectedAttributes state
    const updatedSelectedAttributes = { ...selectedAttributes };

    console.log(updatedSelectedAttributes[attributeName])
    if (selectedFoodItem.attributesArr[attributeName].isSingleSelected) {
      // If isSingleSelected is true, set the selected variation as a string
      if (updatedSelectedAttributes[attributeName] === null) {
        updatedSelectedAttributes[attributeName] = variationType;
      }
      if (updatedSelectedAttributes[attributeName] === variationType) {
        delete updatedSelectedAttributes[attributeName];

      } else {
        updatedSelectedAttributes[attributeName] = variationType;
      }


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
    console.log(newTotalPrice)
    const products = JSON.parse(sessionStorage.getItem(store));
    const product = products.find((product) => product.id === id && product.count === count);
    console.log(product)
    console.log(products)

    // console.log(parseFloat(searchSpeicalFoodQuantity(id, count)))

    product.attributeSelected = updatedSelectedAttributes
    product.itemTotalPrice = Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) )/ 100

    console.log(JSON.stringify(products))



    sessionStorage.setItem(store, JSON.stringify(products));
    saveId(Math.random());

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


  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(window.location.search);

  const storeValue = params.get('store') ? params.get('store').toLowerCase() : "";
  const store = params.get('store') ? params.get('store').toLowerCase() : "";



  if (!sessionStorage.getItem(store)) {
    // If 'abc' doesn't exist, set a default value
    sessionStorage.setItem(store, '[]');
  }
  if (sessionStorage.getItem(store) === null) {
    // If 'abc' doesn't exist, set a default value
    sessionStorage.setItem(store, '[]');
  }
  //console.log(user_loading)

  //const data = 

  const [data, setData] = useState([]);
  const [storeInfo, setStoreInfo] = useState({});
  const [foodTypes, setFoodTypes] = useState([]);
  const [foodTypesCHI, setFoodTypesCHI] = useState([]);
  //const [storeOpenTime, setStoreOpenTime] = useState( );
  const localStorageId = sessionStorage.getItem('TitleLogoNameContent');
  const formatPriceDisplay = (price) => {
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };
  const fetchPost = (name) => {
    const docRef = doc(db, "TitleLogoNameContent", name);
  
    // Subscribe to document updates
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        // The document exists
        const docData = docSnapshot.data();
        console.log(docData);
        // Save the fetched data to sessionStorage
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(docData));
        //setStoreOpenTime(JSON.parse(docData.Open_time))
        // Assuming you want to store the key from the fetched data as "Food_arrays"
        sessionStorage.setItem("Food_arrays", JSON.stringify(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use")));
        setData(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use"))
        setFoods(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use"))
        setStoreInfo(docData)
        setFoodTypes([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.category))])
        setFoodTypesCHI([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.categoryCHI))])
        // console.log(JSON.parse(docData.key))
        // console.log([...new Set(JSON.parse(docData.key).map(item => item.category))])

        // Check if the stored item is empty or non-existent, and handle it
        if (!sessionStorage.getItem("Food_arrays") || sessionStorage.getItem("Food_arrays") === "") {
          sessionStorage.setItem("Food_arrays", "[]");
        }
        // window.location.reload();      } else {
        // No document found
        console.log("No such document!");
      }else{
        sessionStorage.setItem("Food_arrays", "[]");


        // window.location.reload();
        setData([])
        setFoods([])

        console.log("No document found with the given name.");
      }
    }, (error) => {
      // Handle any errors
      console.log("Error getting document:", error);
      sessionStorage.setItem("Food_arrays", "[]");

      setData([])
      setFoods([])

    });
  
    return unsubscribe; // Call this function to unsubscribe from updates when needed
  }


  useEffect(() => {
    fetchPost(storeValue);
    //console.log("hello")
  }, []); // <-- Empty dependency array

  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setAnimationClass('quantity');
  }, []);


  const [products, setProducts] = useState([
  ]);
  useEffect(() => {
    setProducts(JSON.parse(sessionStorage.getItem(store)) ?? []);
  }, []);

  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  useEffect(() => {
    saveId(Math.random());
  }, [products]);


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
  const isPC = width >= 1280;
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
        // Convert the item's CHI to Pinyin
        const pinyinCHI = convertToPinyin(item.CHI).toLowerCase();

        // Check if the input CHI matches either the original CHI or its Pinyin
        return item.CHI.includes(CHI) || pinyinCHI.includes(CHI.toLowerCase());
      })
    );

  }
  const [input, setInput] = useState("");

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")) {
      filternameCHI(event.target.value);

    } else {
      filtername(event.target.value);

    }
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();

  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, []);

  const divStyle = {
    color: 'black',
  };

  const addSpecialFood = (id, name, subtotal, image, attributeSelected, count, CHI) => {

    // Check if the array exists in local storage
    if (sessionStorage.getItem(store) === null) {
      // If it doesn't exist, set the value to an empty array
      sessionStorage.setItem(store, JSON.stringify([]));
    }

    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem(store));
    // Find the product with the matching id
    const product = products?.find((product) => product.id === id && product.count === count);
    // If the product exists, update its name, subtotal, image, and timesClicked values
    if (product) {
      product.name = name;
      product.subtotal = subtotal;
      product.image = image;
      product.quantity++;
      product.attributeSelected = attributeSelected;
      product.count = count;
      product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) )/ 100
      product.CHI = CHI
    } else {
      // If the product doesn't exist, add it to the array
      products?.unshift({ id: id, name: name, subtotal: subtotal, image: image, quantity: 1, attributeSelected: attributeSelected, count: count, itemTotalPrice: parseFloat(subtotal), CHI: CHI });
    }

    // Update the array in local storage
    sessionStorage.setItem(store, JSON.stringify(products));
    setProducts(products)
    const calculateTotalQuant = () => {
      const total = products.reduce((acc, product) => acc + (product.quantity), 0);
      // console.log(total)
      $('#cart').attr("data-totalitems", total);
    }
    calculateTotalQuant();
  };


  const deleteSpecialFood = (id, count, attributeSelected, isDeleted) => {
    let products = JSON.parse(sessionStorage.getItem(store));

    if (products && products.length > 0) {
      // Find the index of the product with the given id
      //const productIndex = products.findIndex((item) => item.id === id);
      let productIndex = products.findIndex((product) => product.id === id && product.count === count);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {
        products[productIndex].quantity -= 1;

        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0 || isDeleted === 0) {
          console.log("delete now")
          products.splice(productIndex, 1);
          sessionStorage.setItem(store, JSON.stringify(products));
          const calculateTotalQuant = () => {
            const total = products.reduce((acc, product) => acc + (product.quantity), 0);
            // console.log(total)
            $('#cart').attr("data-totalitems", total);
          }
          calculateTotalQuant();

          saveId(Math.random());
          hideModal()
          return
        }
        const product = products.find((product) => product.id === id && product.count === count);

        product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) )/ 100
        // Save the updated array in local storage
        sessionStorage.setItem(store, JSON.stringify(products));
        setProducts(products)

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
    let products = JSON.parse(sessionStorage.getItem(store));
    const product = products?.find((product) => product.id === id && product.count === count);
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
  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 600); // Automatically close after 3 seconds
  };
  const [isModalVisible, setModalVisibility] = useState(false);

  // Function to show the modal
  const showModal = (item) => {
    const randomNum = uuidv4()
    setCount(randomNum);  // Increment the count every time the modal is opened
    if (Object.keys(item.attributesArr).length > 0) {
      setModalVisibility(true);
    } else {
      openModal()
    }
    setSelectedAttributes({})
    setTotalPrice(0);
    addSpecialFood(item.id, item.name, item.subtotal, item.image, {}, randomNum, item.CHI)
    //const [selectedAttributes, setSelectedAttributes] = useState({});
    //const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  }

  // Function to hide the modal
  const hideModal = () => {
    setModalVisibility(false);
  }

  if (false) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {


    return (

      <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
        {isOpen && (
          <div className="modal-backdrop">

            <div className="modal-content_ flex">
              <img className='mr-2'
                src={myImage}  // Use the imported image here
                alt="Description"
                style={{
                  width: '30px',
                  height: '30px',
                }}
              />
              Added
            </div>
          </div>
        )}
        {isModalVisible && (
          <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-50 p-4 overflow-x-hidden overflow-y-auto">
            <div className="relative w-full max-w-2xl max-h-full">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg ">

                <div className="flex justify-between">
                  {/* Conditional rendering for image with a more relevant placeholder */}
                  {selectedFoodItem.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ?
                    <img loading="lazy" class="w-full h-[120px] transition-all cursor-pointer object-cover rounded-lg" src={selectedFoodItem.image} alt={selectedFoodItem.name} />
                    :
                    <img loading="lazy" class="w-full h-[120px] transition-all cursor-pointer object-cover rounded-lg"
                      src={'https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/89cb3a8a-0904-4774-76c9-3ffaa41c5200/public'} alt="White placeholder" />

                  }
                </div>

                <div className="p-4 ">
                  <h3 className="notranslate text-lg font-semibold">
                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(selectedFoodItem?.CHI) : selectedFoodItem?.name}
                  </h3>

                  {/* Attributes Section */}
                  {Object.entries(selectedFoodItem?.attributesArr)?.map(([attributeName, attributeDetails]) => (
                    <div key={attributeName}>
                      <div className='flex flex-wrap'>
                        {Object.entries(selectedFoodItem?.attributesArr)?.map(([attributeName, attributeDetails]) => (
                          <div key={attributeName} className="my-2">
                            <p className="mb-1 font-medium">
                              {attributeName} {attributeDetails.isSingleSelected ? "(Choose 1)" : ""}
                            </p>
                            <div className="flex flex-wrap">
                              {attributeDetails.variations.map((variation, idx) => (
                                <div key={idx} className={`mb-1 mr-1 mt-1 p-2 border rounded-lg cursor-pointer ${attributeDetails.isSingleSelected ? (selectedAttributes[attributeName] === variation.type ? 'bg-green-300 border-green-300' : 'bg-white border-gray-300') : (selectedAttributes[attributeName]?.includes(variation.type) ? 'bg-green-300 border-green-300' : 'bg-white border-green-300')} hover:bg-green-300`}
                                  onClick={() => handleAttributeSelect(attributeName, variation.type, selectedFoodItem.id, count)}>
                                  {variation.type}({formatPriceDisplay(variation.price)})
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between mt-4">
                    <span class="notranslate font-medium notranslate">
                      ${(Math.round(100 * ((parseFloat(selectedFoodItem.subtotal) + parseFloat(totalPrice)) * parseFloat(searchSpeicalFoodQuantity(selectedFoodItem.id, count)))) / 100).toFixed(2)}
                    </span>
                    {/* Quantity Selector */}
                    <div>
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
                                deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 1);
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

                            <span class="notranslate">
                              {searchSpeicalFoodQuantity(selectedFoodItem.id, count)}
                            </span>

                          </span>


                          <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                            <button className="minus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                              onClick={() => {

                                addSpecialFood(selectedFoodItem.id, selectedFoodItem.name, selectedFoodItem.subtotal, selectedFoodItem.image, selectedAttributes, count, selectedFoodItem.CHI);
                              }}
                            >
                              <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 p-4">
                  <button onClick={() => { deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 0); }} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800">
                    Cancel
                  </button>
                  <button onClick={() => {
                    hideModal();
                    openModal()
                  }
                  }  // Updated to use hideModal
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 text-white">
                    Confirm
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
        <div className='sticky top-0 z-20 lg:ml-10 lg:mr-10'>
          {/* Filter Type */}
          <div className='px-3' >
            {/* end of the top */}
            <div className='' style={{ background: 'rgba(255,255,255,0.9)', }} >
              <div className='flex'>

                <div>
                  <h5 className='notranslate px-2 font-bold '>

                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(storeInfo?.storeNameCHI) : (storeInfo?.Name)}
                  </h5>
                  <BusinessHoursTable></BusinessHoursTable>
                </div>
                <div className='ml-auto w-1/2 max-w-[500px]'>

                  <div className="m-2 flex justify-center bg-gray-200 h-10 rounded-md items-center">
                    <input
                      type="search"
                      className='flex bg-transparent p-2 focus:outline-none text-black'
                      placeholder={t('Search Food Item')}
                      onChange={handleInputChange}
                      translate="no"
                    />
                    <FiSearch size={5} className="bg-black text-white p-[10px] h-10 rounded-md w-10 font-bold" />
                  </div>
                </div>
              </div>

              <div ref={scrollingWrapperRef} className={`mt-2 ${isMobile ? 'scrolling-wrapper-filter' : ''} mb-2 rounded-lg`}>

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

        </div>
        <div style={{ backgroundColor: "#eef0f2" }
        }
          className='m-auto px-4 flex-grow-1 overflow-y-auto relative min-h-screen w-full'>

          {/* <div
            className="absolute inset-0 bg-cover bg-center "

          >

          </div> */}

          {/* diplay food */}
          <div className='lg:ml-10 lg:mr-10 mt-3'>
            <LazyLoad height={762}>
              <AnimatePresence>
                <div className={
                  isMobile ? 'grid grid-cols-1 gap-3 pt-2' :
                    isPC ? 'grid lg:grid-cols-4 gap-3' :
                      'grid lg:grid-cols-2 gap-3'
                }
                  style={{
                    overflowY: 'auto',
                    maxHeight: "calc(100vh - 300px)",
                  }}> {/* group food by category */}
                  {Object.values(foods.reduce((acc, food) => ((acc[food.category] = acc[food.category] || []).push(food), acc), {})).flat().map((item, index) => (


                    <motion.div

                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      key={item.id}
                      onClick={() => {
                        setSelectedFoodItem(item);;
                        showModal(item);
                        handleDropFood();
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                      }} className="z-200 border rounded-lg cursor-pointer">
                      <div className=' flex'>

                        <div style={{ width: 'calc(100% - 90px)' }}>
                          <div className='flex justify-between px-2 pb-1 grid grid-cols-4 w-full z-20'>

                            {/* parent div of title + quantity and button parent div */}
                            <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                              <div className="col-span-4">
                                <h3 className="notranslate text-lg font-semibold">
                                  {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? item?.CHI : item?.name}
                                </h3 >
                              </div>

                              {/* parent div of the quantity and buttons */}
                              <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: "10px"
                              }}>
                                <div className="col-span-2 text-lg" style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center"
                                }}>
                                  <p style={{ marginBottom: "0" }}>
                                    <span className='notranslate'>
                                   ${(Math.round(item.subtotal*100)/100).toFixed(2)}

                                    </span>
                                  </p>

                                </div>

                              </div>
                              {/* ^ end of parent div of quantity and button */}
                            </div>
                            {/* ^ end of parent div of title + quantity and buttons */}
                          </div>
                          {/* This is Tony added code */}
                        </div>
                        <div class="h-min overflow-hidden rounded-md flex justify-end">

                          <div className='m-2 rounded-lg max-h-[220px] relative'>
                            <div className='absolute w-[80px] h-[80px] flex flex-col justify-end items-end'>
                              <div
                                className="black_hover "
                                style={{
                                  padding: '4px',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  display: "flex",
                                  border: "1px solid", // Adjust the border
                                  borderRadius: "50%", // Set borderRadius to 50% for a circle
                                  width: "30px", // Make sure width and height are equal
                                  height: "30px",
                                  backgroundColor: 'white' // Set the background color to white
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
                            {item.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ?
                              <img loading="lazy" class="w-[80px] h-[80px] transition-all cursor-pointer object-cover border-0 " src={item.image} />
                              :
                              <img class="w-[80px] h-[80px] transition-all cursor-pointer object-cover border-0 " src={'https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/89cb3a8a-0904-4774-76c9-3ffaa41c5200/public'} alt="White placeholder" />

                            }
                          </div>

                        </div>
                      </div>



                    </motion.div>

                  ))}
                </div>
              </AnimatePresence>
            </LazyLoad>

          </div>

        </div>
      </div>
    )
  }
}

export default Food