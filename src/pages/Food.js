

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
import { query, where, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import LazyLoad from 'react-lazy-load';
import firebase from 'firebase/compat/app';

import BusinessHoursTable from './BusinessHoursTable.js'
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import pinyin from "pinyin";
import { faList } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import { handleOpenModal } from '../pages/Navbar';
import { RemoveScroll } from 'react-remove-scroll';

import { getGlobalDirectoryType } from '../pages/Navbar';

import myImage from '../components/check-mark.png';  // Import the image

function convertToPinyin(text) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL,
  }).join('');
}
let globalFailedItem = "";


const customMarkerIcon = L.icon({
  iconUrl: 'http://simpleicon.com/wp-content/uploads/map-marker-1.png',
  iconSize: [40, 40], // making the icon a square of 40x40 pixels
  iconAnchor: [20, 40], // adjust based on the actual anchor point of your icon
  popupAnchor: [0, -40] // adjust based on where you want the popup to appear
});

const Food = () => {
  
  const directoryType = getGlobalDirectoryType();

  async function processPayment() {
    console.log("processPayment");

    try {
      const processPaymentFunction = firebase.functions().httpsCallable('processPayment');

      const response = await processPaymentFunction({
        keepWarm: true
      });
      const createPaymentIntent = firebase.functions().httpsCallable('createPaymentIntent');

      const response2 = await createPaymentIntent({
        keepWarm: true
      });
      console.log("the response was okay");
      return response.data;
    } catch (error) {
      console.error("There was an error with processPayment:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }



  async function cancel() {
    console.log("cancel");
    try {
      const cancelActionFunction = firebase.functions().httpsCallable('cancelAction');

      const response = await cancelActionFunction({
        keepWarm: true
      });

      console.log("the response was okay");
      return response.data;

    } catch (error) {
      console.error("There was an error with cancel:", error.message);
      throw error; // rethrow to handle it outside of the function or display to user
    }
  }

  //processPayment()//kepp the cloud function warm and get ready
  //cancel()//kepp the cloud function warm and get ready
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");


  const [failedItem, setFailedItem] = useState("");
  globalFailedItem = failedItem;

  useEffect(() => {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        //console.log(url.hash)
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        return false;
      }
    };

    // Call the checkUrlFormat function and log the result
    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  const [divHeight, setDivHeight] = useState('calc(100vh - 100px)');

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
    product.itemTotalPrice = Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100

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
        //setFoods(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use"))
        setStoreInfo(docData)
        setFoodTypes([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.category))])
        setFoodTypesCHI([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.categoryCHI))])


        setFoods(
          JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").filter((item) => {
            return item.category === [...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.category))][0];
          })
        )
        setSelectedFoodType([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.category))][0]);

        console.log([...new Set(JSON.parse(docData.key).filter(item => item.category !== "Temporary Use").map(item => item.category))])
        // console.log(JSON.parse(docData.key))
        // console.log([...new Set(JSON.parse(docData.key).map(item => item.category))])

        // Check if the stored item is empty or non-existent, and handle it
        if (!sessionStorage.getItem("Food_arrays") || sessionStorage.getItem("Food_arrays") === "") {
          sessionStorage.setItem("Food_arrays", "[]");
        }
        // window.location.reload();      } else {
        // No document found
        console.log("No such document!");
      } else {
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
    if (!isMobile) { return }
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

    if (isKiosk) {
      processPayment()//kepp the cloud function warm and get ready
      cancel()//kepp the cloud function warm and get ready
    }

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
      product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
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

        product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
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
  const modalRef = useRef(null);
  const openModalList = () => {
    modalRef.current.style.display = 'block';
    // Retrieve the array from local storage
  };

  const [isPopupVisible, setPopupVisible] = useState(false);

  const handleImageClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    setPopupVisible(true); // 显示大图弹窗
  };

  const handleClosePopup = () => {
    setPopupVisible(false); // 关闭弹窗
  };

  const closeModalList = () => {

    modalRef.current.style.display = 'none';


  };
  function isWeChatBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('micromessenger');
  }

  if (false) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {


    return (

      <div style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/uber-move-text"></link>
        {/* <>hello{String(directoryType)}</> */}
        {isOpen && (
          <div className="modal-backdrop" style={{ pointerEvents: 'none' }}>

            <div className="modal-content_ flex notranslate">
              <img className='mr-2'
                src={myImage}  // Use the imported image here
                alt="Description"
                style={{
                  width: '30px',
                  height: '30px',
                  pointerEvents: 'auto'  // Optionally enable clicks just on the image

                }}
              />
              Added
            </div>
          </div>
        )}

        <div ref={modalRef} className="foodcart-modal modal">


          {/* popup content */}
          <div className="shopping-cart" >
            <div className='title pb-1 border-0'>

              <div className=' flex justify-end mb-2'>


                <DeleteSvg className="delete-btn " style={{ cursor: 'pointer', margin: '0' }} onClick={closeModalList}></DeleteSvg>
              </div>
              {/* shoppig cart */}

            </div>
            <div style={width > 575 ? { overflowY: "auto", borderBottom: "1px solid #E1E8EE" } : { overflowY: "auto", borderBottom: "1px solid #E1E8EE" }}>
              <div className={` ${!isMobile ? "mx-4 my-2" : "mx-4 my-2"}`} >

                <div style={{ width: "-webkit-fill-available" }}>
                  <div className="description" style={{ width: "-webkit-fill-available" }}>

                    <div className='' style={{ width: "-webkit-fill-available" }}>
                      <div
                        style={{ color: "black", width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
                      >
                        {foodTypes.slice().reverse().map((foodType) => (
                          <button
                            key={foodType}
                            onClick={() => {
                              filterType(foodType);
                              setSelectedFoodType(foodType);
                              closeModalList()
                            }}

                            className={`border-black-600 rounded-xl px-2 py-2 text-xl ${selectedFoodType === foodType ? 'bg-gray-200 text-black-600' : 'text-gray-600'}`}
                            style={{ width: "100%", display: 'block', textUnderlineOffset: '0.5em', textAlign: 'left' }}
                          >
                            <div className='text-xl F'>
                              {foodType && foodType.length > 1
                                ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                                : ''}
                            </div>
                          </button>
                        ))}
                      </div>


                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>


        {isModalVisible && (
          <div className="fixed inset-0 z-50 flex justify-center bg-black bg-opacity-50 p-4 overflow-x-hidden overflow-y-auto">
            <div className="relative w-full max-w-2xl max-h-full">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg ">

                <div className="flex justify-between">
                  {/* Conditional rendering for image with a more relevant placeholder */}
                  {selectedFoodItem.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ?
                    <img loading="lazy" class={`${isMobile ? " h-[150px] " : "h-[200px]"} w-full transition-all cursor-pointer object-cover rounded-t-lg`} src={selectedFoodItem.image} alt={selectedFoodItem.name} />
                    :
                    null

                  }
                </div>

                <div className="p-4 ">
                  <h3 className="notranslate text-xl font-semibold">
                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(selectedFoodItem?.CHI) : selectedFoodItem?.name}
                  </h3>


                  {/* Attributes Section */}
                  <div>

                    {Object.entries(selectedFoodItem?.attributesArr)?.map(([attributeName, attributeDetails]) => (
                      <div key={attributeName} className="my-2">
                        <p className="mb-1 text-xl">
                          {attributeName} {attributeDetails.isSingleSelected ? "(Choose 1)" : ""}
                        </p>
                        <div className="flex flex-wrap">
                          {attributeDetails.variations.map((variation, idx) => (
                            <div key={idx} className={`mb-1 mr-1 mt-1 p-2 border rounded-lg text-xl cursor-pointer ${attributeDetails.isSingleSelected ? (selectedAttributes[attributeName] === variation.type ? 'bg-green-300 border-green-300' : 'bg-white border-gray-300') : (selectedAttributes[attributeName]?.includes(variation.type) ? 'bg-green-300 border-green-300' : 'bg-white border-green-300')} hover:bg-green-300`}
                              onClick={() => handleAttributeSelect(attributeName, variation.type, selectedFoodItem.id, count)}>
                              {variation.type}({formatPriceDisplay(variation.price)})
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  </div>

                  <div className="flex justify-between mt-4">
                    <span class="notranslate text-xl notranslate ">
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
          <div className={!isMobile ? '' : 'px-3'}>
            {/* end of the top */}
            <div className='' style={{ background: 'rgba(255,255,255,0.9)', }} >
              <div className='flex'>

                {isMobile ?


                  <h5 className='notranslate font-bold text-xl'>

                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(storeInfo?.storeNameCHI) : (storeInfo?.Name)}
                  </h5> :
                  <h1 className='notranslate font-bold text-xl'>

                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(storeInfo?.storeNameCHI) : (storeInfo?.Name)}
                  </h1>
                }
                {!isMobile && !isKiosk && (
                  <div className='ml-auto w-1/2 max-w-[500px]'>


                    <div className='hstack gap-2  mt-2'>
                      <form className="w-full w-lg-full">
                        <div className='input-group input-group-sm input-group-inline shadow-none'>
                          <span className='input-group-text pe-2 rounded-start-pill'>
                            <i className='bi bi-search'></i>
                          </span>

                          <input
                            type="search"
                            className="form-control text-sm shadow-none rounded-end-pill"
                            placeholder={t('Search Food Item')}
                            value={input}
                            onChange={handleInputChange}
                            translate="no"
                            style={{ fontSize: '16px' }}
                          />

                        </div>
                      </form >
                    </div>
                  </div>)
                }
              </div>
              <BusinessHoursTable></BusinessHoursTable>
              {isMobile && (
                <div>


                  <div className='hstack gap-2 mt-2'>
                    <form className="w-full w-lg-full">
                      <div className='input-group input-group-sm input-group-inline shadow-none'>
                        <span className='input-group-text pe-2 rounded-start-pill'>
                          <i className='bi bi-search'></i>
                        </span>

                        <input
                          type="search"
                          className="form-control text-sm shadow-none rounded-end-pill"
                          placeholder="Search for items..."
                          placeholder={t('Search Food Item')}
                          onChange={handleInputChange}
                          translate="no"
                          style={{ fontSize: '16px' }}
                        />

                      </div>
                    </form>
                  </div>

                </div>)
              }
              <div className='mt-2 text-lg'>
                ★★★★★ Strongly Recommend:
              </div>


              <div className='mt-1'>
                <div ref={scrollingWrapperRef} className="relative mt-2 scrolling-wrapper-filter">

                  {Object.values(data.filter(item => item.isFeatured === true)).filter(item => !(item?.name === "Enter Meal Name" && item?.CHI === "填写菜品名称")).sort((a, b) => (b.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public") - (a.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public")).sort((a, b) => b.name.length - a.name.length).map((item, index) => (

                    <button
                      onClick={() => {
                        if (directoryType) {
                          setFailedItem(item); // Set the failed item immediately

                          setTimeout(() => {
                            handleOpenModal();
                          }, 10);
                        } else {
                          setSelectedFoodItem(item);
                          if (isKiosk) {
                            processPayment()//kepp the cloud function warm and get ready
                            cancel()//kepp the cloud function warm and get ready
                          }

                          showModal(item);
                          handleDropFood();
                        }
                        setInput("")


                      }}
                      key={index}
                      className="h-full border-black-600 rounded-xl text-gray-600 transition duration-200 ease-in-out space-x-2 flex flex-col justify-start items-start"
                      style={{ display: 'inline-block', textUnderlineOffset: '0.5em', width: '190px' }}
                    >
                      <div className='m-2 rounded-lg relative'>
                        <div className='absolute w-[160px] h-[90px] flex flex-col justify-start items-start'>
                          <span className="notranslate bg-green-700 text-white rounded-lg m-1 p-1">
                            <span className="text-base align-baseline">$</span>
                            <span className="text-xl">{Math.floor(item.subtotal)}.</span>
                            <span className="text-base align-baseline">{(item.subtotal % 1).toFixed(2).substring(2)}</span>
                          </span>
                        </div>

                        <div className='absolute w-[160px] h-[90px] flex flex-col justify-end items-end'>
                          <div className="black_hover" style={{
                            padding: '4px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            display: "flex",
                            border: "1px solid",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            backgroundColor: 'white'
                          }}>
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
                              {/* Assuming PlusSvg is a component that renders a plus icon */}
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
                          <img loading="lazy" className="w-[190px] h-[100px] transition-all cursor-pointer object-cover border-0" src={item.image} alt="" />
                          :
                          <img className="w-[190px] h-[100px] transition-all cursor-pointer object-cover border-0" src={'https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/89cb3a8a-0904-4774-76c9-3ffaa41c5200/public'} alt="White placeholder" />
                        }
                      </div>
                      <div className="text-align-top" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start' }}>
                        <span className="block whitespace-normal overflow-hidden" style={{ maxWidth: '170px' }}>

                          {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? item?.CHI : item?.name}
                        </span>
                      </div>
                    </button>

                  ))}

                </div>
              </div>



              <div className='rounded-lg text-lg'>
                {isMobile && (
                  <>
                    {/* <div
                      className="m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg absolute z-10 left-0 scroll-gradient-left"
                      style={{ pointerEvents: 'none' }}
                    >
                      &nbsp;
                    </div> */}

                    <div
                      className="m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg absolute z-10 right-0 scroll-gradient-right"
                      style={{ pointerEvents: 'none' }}
                    >
                      &nbsp;
                    </div>
                  </>
                )}
                {isMobile && (
                  <div className='flex'>

                    <div onClick={() => {
                      openModalList()
                    }} className="mt-2 m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg ">
                      <FontAwesomeIcon icon={faList} />
                    </div>
                    <div ref={scrollingWrapperRef}
                      className={`relative mt-2 scrolling-wrapper-filter`}>


                      {/* <button onClick={() => {
                        setFoods(data)
                        setSelectedFoodType(null);
                      }}
                        className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg  ${selectedFoodType === null ? 'underline' : ''}`}
                        style={{ display: "inline-block", textUnderlineOffset: '0.5em' }}><div>{t("All")}</div></button> */}

                      {foodTypes.map((foodType) => (
                        <button
                          key={foodType}
                          onClick={() => {
                            filterType(foodType);
                            setSelectedFoodType(foodType);

                          }}
                          className={`border-black-600 rounded-xl px-2 py-2 ${selectedFoodType === foodType ? 'underline text-black-600' : 'text-gray-600'}`}
                          style={{ display: 'inline-block', textUnderlineOffset: '0.5em' }}
                        >
                          <div>
                            {foodType && foodType.length > 1
                              ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                              : ''}
                          </div>
                        </button>
                      ))}

                    </div>

                  </div>
                )}


              </div>
            </div>
          </div>

        </div>

        <div
          className='mt-1 flex m-auto px-4 flex-grow-1 relative min-h-screen w-full'>
          {/* Sidebar */}
          {!isMobile && (
            <aside style={{
              maxHeight: 'calc(100vh - 350px)'
            }} className='ml-2 h-full w-72 p-4 absolute top-0 left-0 z-20 pt-0 overflow-y-auto'>
              <ul className="space-y-2">
                {foodTypes.map((foodType) => (
                  <li
                    key={foodType}
                    onClick={() => {
                      filterType(foodType);
                      setSelectedFoodType(foodType);
                      if (isKiosk) {
                        processPayment()//kepp the cloud function warm and get ready
                        cancel()//kepp the cloud function warm and get ready
                      }
                      setInput("")
                    }}

                    className={`text-xl border-black-600 rounded-xl px-2 py-2 cursor-pointer ${selectedFoodType === foodType ? 'bg-gray-200 text-black-600' : 'text-gray-600'}`}
                    style={{ width: "100%", display: 'block', textUnderlineOffset: '0.5em', textAlign: 'left' }}
                  >
                    <div>
                      {foodType && foodType.length > 1
                        ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                        : ''}
                    </div>
                  </li>
                ))}
                {/* <li className="cursor-pointer hover:bg-gray-200 p-2 rounded-md">Option 1</li>
            <li className="cursor-pointer hover:bg-gray-200 p-2 rounded-md">Option 2</li>
            <li className="cursor-pointer hover:bg-gray-200 p-2 rounded-md">Option 3</li> */}
              </ul>
            </aside>
          )}



          {/* diplay food */}
          <div className={`${!isMobile ? 'ml-72' : ''} flex-grow overflow-y-auto`}>

            <div className='mt-2'>
              <LazyLoad height={762}>
                <AnimatePresence>
                  <div className={
                    isMobile ? 'grid grid-cols-1 gap-2 pt-2' :
                      isPC ? 'grid lg:grid-cols-3 gap-2' :
                        'grid lg:grid-cols-2 gap-2'
                  }
                    style={{
                      overflowY: 'auto',
                      maxHeight: isMobile ? isWeChatBrowser() ? 'calc(100vh - 480px)' : 'calc(100vh - 480px)' : 'calc(100vh - 350px)'
                    }}> {/* group food by category */}
                    {Object.values(foods.sort((a, b) => {
                      return foodTypes.indexOf(a.category) - foodTypes.indexOf(b.category);
                    }).reduce((acc, food) => ((acc[food.category] = acc[food.category] || []).push(food), acc), {})).flat().filter(item => !(item?.name === "Enter Meal Name")).sort((a, b) => (b.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public") - (a.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public")).map((item, index) => (
                      <div>

                        <motion.div
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          key={item.id}
                          onClick={() => {
                            if (directoryType) {
                              setFailedItem(item); // Set the failed item immediately

                              setTimeout(() => {
                                handleOpenModal();
                              }, 10);
                            } else {
                              setSelectedFoodItem(item);
                              if (isKiosk) {
                                processPayment()//kepp the cloud function warm and get ready
                                cancel()//kepp the cloud function warm and get ready
                              }

                              showModal(item);
                              handleDropFood();
                            }


                          }}
                          className=" rounded-lg cursor-pointer">
                          <div className='flex'>
                            {item.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ?
                              <div style={{ width: "40%" }}>
                                <div class="h-min overflow-hidden rounded-md">
                                  <img loading="lazy" class="w-full h-[80px] hover:scale-125 transition-all cursor-pointer md:h-[95px] object-cover rounded-t-lg"

                                    src={item.image} alt={item.name} />

                                </div>
                              </div>
                              : null
                            }

                            <div style={{ width: "100%" }}>
                              <div className='flex justify-between px-2 pb-1 grid grid-cols-4 w-full'>

                                {/* parent div of title + quantity and button parent div */}
                                <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                  <div className="col-span-4">
                                    <span class="notranslate text-xl">
                                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? item?.CHI : item?.name}
                                    </span >
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
                                      flexDirection: "column",
                                      justifyContent: "center",
                                      alignItems: "center"
                                    }}>
                                      <div className="flex" style={{ marginBottom: "0" }}>
                                        <span className="notranslate">
                                          <span className="text-base align-baseline">
                                            $
                                          </span>
                                          <span className="text-xl">
                                            {Math.floor(item.subtotal)}.
                                          </span>
                                          <span className="text-base align-baseline">
                                            {(item.subtotal % 1).toFixed(2).substring(2)}
                                          </span>
                                        </span>


                                        {item.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ?
                                          <span
                                            className={`inline-flex items-center space-x-1 px-1 py-0.5 rounded bg-orange-500 text-white text-sm align-middle`}
                                            style={{ marginLeft: "8px" }}
                                          >
                                            <span className="font-medium">Top-rated</span>
                                          </span>
                                          : null
                                        }
                                      </div>

                                    </div>
                                    <div className="col-span-2 flex justify-end">

                                      <div className="quantity"
                                        style={{ margin: '0px', display: 'flex', whiteSpace: 'nowrap', width: '50px', marginTop: "-17px", paddingTop: "20px", height: "fit-content", display: "flex", justifyContent: "flex-end" }} >

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
                                  {/* ^ end of parent div of quantity and button */}
                                </div>
                                {/* ^ end of parent div of title + quantity and buttons */}
                              </div>
                              {/* This is Tony added code */}
                            </div>
                          </div>



                        </motion.div>

                      </div>



                    ))}
                  </div>
                </AnimatePresence>
              </LazyLoad>

            </div>
          </div>


        </div>
      </div>

    )
  }
}

export default Food


export const getGlobalFailedItem = () => globalFailedItem;
