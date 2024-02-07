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
import { useUserContext } from "../context/userContext";
import { setDoc } from "firebase/firestore";
//setModalVisibility
import { v4 as uuidv4 } from 'uuid';
import pinyin from "pinyin";


function convertToPinyin(text) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL,
  }).join('');
}

const Food = ({ OpenChangeAttributeModal, setOpenChangeAttributeModal, setIsAllowed, isAllowed, store, selectedTable }) => {
  //const params = new URLSearchParams(window.location.search);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [totalPrice, setTotalPrice] = useState(0); // State to store the total price
  const [count, setCount] = useState(0);  // Set up a state
  const [priceError, setPriceError] = useState("");  // Set up a state
  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      const docData = { product: product, date: date };

      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);
      //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(product))))
      //localStorage.setItem(table_name, product)

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };


  const handleAttributeSelect = (attributeName, variationType, id, count, updateSelectedAttributes) => {
    let updatedSelectedAttributes;

    if (Object.keys(updateSelectedAttributes).length === 0) {
      updatedSelectedAttributes = { ...selectedAttributes };

    } else {
      updatedSelectedAttributes = { ...updateSelectedAttributes };

    }

    // Create a copy of the selectedAttributes state
    //const updatedSelectedAttributes = { ...selectedAttributes };

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
    const newTotalPrice = TotalAttributePrice(updatedSelectedAttributes, selectedFoodItem.attributesArr);
    const products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
    const product = products.find((product) => product.id === id && product.count === count);
    console.log(Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity)) / 100) >= 0)
    if (Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100 >= 0) {
      setTotalPrice(newTotalPrice);
      // Update the state with the new selected attributes
      setSelectedAttributes(updatedSelectedAttributes);

      // After updating selectedAttributes, recalculate the total price
      console.log(product)
      console.log(parseFloat(searchSpeicalFoodQuantity(id, count)))

      product.attributeSelected = updatedSelectedAttributes
      product.itemTotalPrice = Math.round(100 * ((parseFloat(newTotalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
      //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products))
      SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
    }


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
    return JSON.parse(localStorage.getItem(store + "-" + selectedTable));
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
        if (CHI === "") {
          return true;
        }
        const pinyinCHI = convertToPinyin(item.CHI).toLowerCase();
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


  const divStyle = {
    color: 'black',
  };
  const { user, user_loading } = useUserContext();
  const addSpecialFood = (id, name, subtotal, image, attributeSelected, count, CHI, item, availability, attributesArr, quant) => {

    // Check if the array exists in local storage
    if (localStorage.getItem(store + "-" + selectedTable) === null) {
      // If it doesn't exist, set the value to an empty array
      //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
      SetTableInfo(store + "-" + selectedTable, JSON.stringify([]))
    }
    if (!localStorage.getItem(store + "-" + selectedTable)) {
      // If it doesn't exist, set the value to an empty array
      //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
      SetTableInfo(store + "-" + selectedTable, JSON.stringify([]))
    }
    // Retrieve the array from local storage
    console.log('bbbbb')
    console.log(store)
    console.log(selectedTable)
    console.log(localStorage.getItem(store + "-" + selectedTable))
    console.log(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));

    // Find the product with the matching id
    //let product = products.find((product) => product.id === id);
    const product = products?.find((product) => product.id === id && product.count === count);
    console.log(attributeSelected)
    // If the product exists, update its name, subtotal, image, and timesClicked values
    if (product) {
      product.name = name;
      product.subtotal = subtotal;
      product.image = image;
      product.quantity++;
      product.attributeSelected = attributeSelected;
      product.count = count;
      product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100;
      product.CHI = CHI;
      product.availability = availability
      product.attributesArr = attributesArr
    }
    else {
      // If the product doesn't exist, add it to the array
      products?.unshift({ attributesArr: attributesArr, availability: availability, id: id, name: name, subtotal: subtotal, image: image, quantity: quant ? quant : 1, attributeSelected: attributeSelected, count: count, itemTotalPrice: Math.round(100 * subtotal) / 100, CHI: CHI });
    }
    //product.itemTotalPrice= Math.round(100 *((parseFloat(totalPrice)+parseFloat(product.subtotal))*parseFloat(product.quantity))/ 100)
    console.log(product)
    // Update the array in local storage
    //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
    //SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))

    if (!item || !item.attributesArr) {
      SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
      return;
    }
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(products)));


  };


  const deleteSpecialFood = (id, count, attributeSelected, isDelete) => {
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));

    if (products && products.length > 0) {
      // Find the index of the product with the given id
      //const productIndex = products.findIndex((item) => item.id === id);
      let productIndex = products.findIndex((product) => product.id === id && product.count === count);

      // If the product is found, decrement its quantity
      if (productIndex !== -1) {

        products[productIndex].quantity -= 1;
        if (isDelete === 0) {//0 means false
          console.log("delete now")
          products.splice(productIndex, 1);
          //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
          SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
          saveId(Math.random());
          setModalVisibility(false);
          handleRemoveAllCustomVariants();
          return
          //hideModal()
        }
        // If the quantity becomes 0, remove the product from the array
        if (products[productIndex].quantity <= 0) {
          console.log("delete now")
          products.splice(productIndex, 1);
          //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
          SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
          saveId(Math.random());
          setModalVisibility(false);
          handleRemoveAllCustomVariants();
          //hideModal()
          return
        }
        const product = products.find((product) => product.id === id && product.count === count);
        console.log(products[productIndex])
        console.log(product)
        product.itemTotalPrice = Math.round(100 * ((parseFloat(totalPrice) + parseFloat(product.subtotal)) * parseFloat(product.quantity))) / 100
        // Save the updated array in local storage
        //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(products));
        SetTableInfo(store + "-" + selectedTable, JSON.stringify(products))
      }

    }
    //SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
    saveId(Math.random());
  };
  const searchSpeicalFoodQuantity = (id, count) => {
    // Retrieve the array from local storage
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable));
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
  //const foodTypes = ['burger', 'pizza', 'salad', 'chicken'];
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
  const [OpenChangeAttributeTrigger, setOpenChangeAttributeTrigger] = useState(false);

  useEffect(() => {
    // Place your side-effect logic here.
    // For example, if OpenChangeAttributeModal is a function you want to call:
    if (OpenChangeAttributeModal === false) {
      //init
    } else {
      showModal(OpenChangeAttributeModal)
      setOpenChangeAttributeTrigger(true)
      
      //open one
    }

  }, [OpenChangeAttributeModal]); // An empty dependency array means this effect runs once after the initial render

  // Function to show the modal
  const showModal = (item) => {
    const randomNum = uuidv4()
    setSelectedFoodItem(item);
    setCount(randomNum);  // Increment the count every time the modal is opened
    setSelectedAttributes({})
    setTotalPrice(0);

    addSpecialFood(item.id, item.name, item.subtotal, item.image, {}, randomNum, item.CHI, null, item.availability, item.attributesArr, item.quantity)
    setModalVisibility(true);
    saveId(Math.random());
    console.log("hello")

    //const [selectedAttributes, setSelectedAttributes] = useState({});
    //const [totalPrice, setTotalPrice] = useState(0); // State to store the total price

    // Add a CSS class to disable body scroll
    // document.body.style.overflow = 'hidden';
    // document.documentElement.style.overflow = 'hidden';
  }

  // Function to hide the modal
  const hideModal = () => {
    setModalVisibility(false);
    handleRemoveAllCustomVariants();
    //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
    saveId(Math.random)

  }
  // const groupedItems = groupAndSumItems(items);
  // console.log("groupedItems:")
  // console.log(groupedItems);

  function groupAndSumItems(items) {
    const groupedItems = {};
    items.reverse();
    items.forEach(item => {
      // Create a unique key based on id and JSON stringified attributes
      const key = `${item.id}-${JSON.stringify(item.attributeSelected)}`;

      if (!groupedItems[key]) {
        // If this is the first item of its kind, clone it (to avoid modifying the original item)
        groupedItems[key] = { ...item };
      } else {
        // If this item already exists, sum up the quantity and itemTotalPrice
        groupedItems[key].quantity += item.quantity;
        //groupedItems[key].itemTotalPrice += item.itemTotalPrice;
        groupedItems[key].itemTotalPrice = Math.round((groupedItems[key].itemTotalPrice + item.itemTotalPrice) * 100) / 100;

        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
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
  const [customVariant, setCustomVariant] = useState({ name: '外卖TakeOut', price: '0' });

  const handleAddCustomVariant = (name, priceString, count, id) => {
    const price = parseFloat(priceString) || 0;  // Convert price to number here

    if (!name || isNaN(priceString)) {
      alert('Please enter a valid name and price');
      return;
    }

    const updatedFoodItem = { ...selectedFoodItem };
    const updatedAttributes = { ...selectedAttributes };

    if (!updatedFoodItem.attributesArr['Customized Option']) {
      updatedFoodItem.attributesArr['Customized Option'] = {
        isSingleSelected: false,
        variations: [],
      };
    }

    const existingVariantIndex = updatedFoodItem.attributesArr['Customized Option'].variations.findIndex(
      (variation) => variation.type === name
    );

    if (existingVariantIndex !== -1) {
      // Update price if variant already exists
      updatedFoodItem.attributesArr['Customized Option'].variations[existingVariantIndex].price = price;
    } else {
      // Add new variant if it doesn't exist
      updatedFoodItem.attributesArr['Customized Option'].variations.push({
        type: name,
        price: price,
      });
    }

    // Automatically select the new or updated variant
    updatedAttributes['Customized Option'] = updatedAttributes['Customized Option'] || [];
    if (!updatedAttributes['Customized Option'].includes(name)) {
      updatedAttributes['Customized Option'].push(name);

    }
    console.log("handleAttributeSelecthandleAttributeSelecthandleAttributeSelecthandleAttributeSelect")
    console.log('Customized Option', name, id, count, {})
    handleAttributeSelect('Customized Option', name, id, count, {})
    setSelectedFoodItem(updatedFoodItem);
    setSelectedAttributes(updatedAttributes);
    setTotalPrice(TotalAttributePrice(updatedAttributes, updatedFoodItem.attributesArr));
    setCustomVariant({ name: '外卖TakeOut', price: 0 }); // Reset custom variant input

  };

  const handleRemoveAllCustomVariants = () => {
    const updatedFoodItem = { ...selectedFoodItem };
    const updatedAttributes = { ...selectedAttributes };

    if (updatedFoodItem.attributesArr['Customized Option']) {
      delete updatedFoodItem.attributesArr['Customized Option'];
      delete updatedAttributes['Customized Option'];

      setSelectedFoodItem(updatedFoodItem);
      setSelectedAttributes(updatedAttributes);
      setTotalPrice(TotalAttributePrice(updatedAttributes, updatedFoodItem.attributesArr));
    } else {
      //alert('No custom variants to remove');
    }
  };
  const [dynamicHeight, setDynamicHeight] = useState('55vh');

  useEffect(() => {
    // Function to calculate the dynamic height
    const updateHeight = () => {
      if (scrollingWrapperRef.current) {
        const wrapperHeight = scrollingWrapperRef.current.offsetHeight; // Get the height of the scrolling wrapper
        const viewportHeight = window.innerHeight; // Get the viewport height
        const dynamicHeightValue = `calc(55vh - ${wrapperHeight}px)`; // Calculate the dynamic height
        setDynamicHeight(dynamicHeightValue); // Set the dynamic height
      }
    };

    // Call updateHeight initially and also on window resize
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', updateHeight);
  }, [scrollingWrapperRef, isMobile]); // Add isMobile to the dependency array if the layout changes with it

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

                <div className='p-4 pt-3'>
                  <div className='flex justify-between'>
                    <h4 class="notranslate">
                      {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(selectedFoodItem?.CHI) : (selectedFoodItem?.name)}
                    </h4>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="customVariantName" className="form-label">Explanation for the Updated Ingredients of the Dish
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="customVariantName"
                      placeholder="Enter the reason of the price change"
                      value={customVariant.name}
                      onChange={(e) => setCustomVariant({ ...customVariant, name: e.target.value })}
                      translate="no"
                    />
                    <small id="customVariantNameHelp" className="form-text text-muted">
                      Indicate any change in the dish's price, for example, if no price change then enter 0
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="customVariantPrice" className="form-label">Price</label>
                    <input
                      type="text"
                      className="form-control"
                      id="customVariantPrice"
                      placeholder="Enter the price of the custom variant (can be negative)"
                      value={customVariant.price}
                      onChange={(e) => setCustomVariant({ ...customVariant, price: e.target.value })}
                      translate="no"
                    />
                    <small id="customVariantPriceHelp" className="form-text text-muted">
                      Enter a positive or negative number for the price adjustment.
                    </small>
                  </div>

                  <button
                    className="btn btn-primary mb-3"
                    type="button"
                    onClick={() => handleAddCustomVariant(customVariant.name, customVariant.price, count, selectedFoodItem?.id)}
                  >
                    Add Dish Revise (Default:<span
                      className='notranslate'>{customVariant.name}</span> )
                  </button>



                  {Object.keys(selectedFoodItem?.attributesArr).length > 0 && (
                    <div>
                      Choose the Revise: (Green-highlighted revise are already chosen)
                    </div>
                  )}
                  {Object.entries(selectedFoodItem?.attributesArr).map(([attributeName, attributeDetails]) => (

                    <div key={attributeName}>
                      <p className="mb-1">
                        <span className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                          {attributeName} {attributeDetails.isSingleSelected ? "(Choose 1)" : "Select All That Apply"}
                        </span>
                      </p>

                      <div className='flex flex-wrap'>
                        {attributeDetails.variations.map((variation, idx) => (
                          <div key={idx}>
                            <div
                              className={`mb-1 mr-1 mt-1 btn btn-light ${attributeDetails.isSingleSelected
                                ? selectedAttributes[attributeName] === variation.type
                                  ? 'selected-variation bg-success text-white'
                                  : ''
                                : selectedAttributes[attributeName]?.includes(variation.type)
                                  ? 'selected-variation bg-success text-white'
                                  : ''
                                }`}
                              style={{
                                position: 'relative',
                                fontFamily: "Suisse Int'l",
                                fontStyle: 'normal',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleAttributeSelect(attributeName, variation.type, selectedFoodItem.id, count, {})}
                            >

                              <span class="notranslate">
                                {variation.type}
                              </span>
                              <span class="notranslate">
                                ({formatPriceDisplay(variation.price)})
                              </span>
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


                    <span class="text-lg notranslate">
                      ${(Math.round(100 * ((parseFloat(selectedFoodItem.subtotal) + parseFloat(totalPrice)) * parseFloat(searchSpeicalFoodQuantity(selectedFoodItem.id, count)))) / 100).toFixed(2)}
                    </span>
                    {priceError}

                  </div>
                  <div>
                    <span>
                      {OpenChangeAttributeTrigger ?
                        null
                        :
                        <div>
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 1);
                                //saveId(Math.random());
                              }}
                            >
                              Delete
                            </button>
                            <span className="mx-4 notranslate text-lg font-bold">
                              {searchSpeicalFoodQuantity(selectedFoodItem.id, count)}
                            </span>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                addSpecialFood(selectedFoodItem.id, selectedFoodItem.name, selectedFoodItem.subtotal, selectedFoodItem.image, selectedAttributes, count, selectedFoodItem.CHI, null, selectedFoodItem.availability, selectedFoodItem.attributesArr);
                                saveId(Math.random());
                              }}
                            >
                              Add
                            </button>
                          </div>

                        </div>

                      }
                    </span>
                  </div>

                </div>
                <div className="flex justify-between p-4 ">

                  <button type="button" onClick={() => {
                    deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 0);
                    setOpenChangeAttributeTrigger(false);
                    setOpenChangeAttributeModal(false)
                  }} className="btn btn-danger">Cancel</button>
                  <button type="button" className="btn btn-success" onClick={() => {
                    if (OpenChangeAttributeTrigger === false) {
                      hideModal();
                    } else {
                      function sortObject(obj) {
                        return Object.keys(obj).sort().reduce((result, key) => {
                          result[key] = obj[key];
                          return result;
                        }, {});
                      }

                      function compareObjects(obj1, obj2) {
                        const sortedObj1 = sortObject(obj1);
                        const sortedObj2 = sortObject(obj2);

                        const serializedObj1 = JSON.stringify(sortedObj1);
                        const serializedObj2 = JSON.stringify(sortedObj2);

                        return serializedObj1 === serializedObj2;
                      }

                      if (compareObjects(selectedFoodItem.attributeSelected, selectedAttributes)) {//no attr changes
                        deleteSpecialFood(selectedFoodItem.id, count, selectedAttributes, 0);
                        setOpenChangeAttributeTrigger(false);
                        setOpenChangeAttributeModal(false)
                        
                      } else {
                        deleteSpecialFood(selectedFoodItem.id, selectedFoodItem.count, selectedAttributes, 0);//delete old one
                        setOpenChangeAttributeTrigger(false);
                        setOpenChangeAttributeModal(false)
                      }
                    }


                  }}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        )
        }
        <div className='m-auto '>
          <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
            {/* Filter Type */}
            <div className='Type' >
              {/* <div className='flex justify-between flex-wrap'> */}

              {/* web mode */}

              <div>

                <div className='flex' style={{ justifyContent: 'space-between', alignItems: 'center' }}>

                  <div className="mt-2 flex justify-center bg-gray-200 h-10 rounded-md pl-2 w-full items-center">
                    <input
                      type="search"
                      className='flex bg-transparent p-2 w-full focus:outline-none text-black'
                      placeholder={t('Search Food Item')}
                      onChange={handleInputChange}
                      translate="no"
                    />
                    <FiSearch size={5} className="bg-black text-white p-[10px] h-10 rounded-md w-10 font-bold" />
                  </div>
                </div>
              </div>

              {/* end of the top */}
              <div ref={scrollingWrapperRef} className={`mt-2 ${isMobile ? 'scrolling-wrapper-filter' : ''} mb-0`}

              >

                <button onClick={() => {
                  setFoods(data)
                  setSelectedFoodType(null);
                }}
                  className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 text-lg ${selectedFoodType === null ? 'underline' : ''}`}
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
                        className={`m-0 border-black-600 text-black-600 rounded-xl text-lg px-2 py-2 ${selectedFoodType === foodType ? 'underline' : ''
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
                        className={`m-0 border-black-600 text-black-600 text-lg rounded-xl px-2 py-2 ${selectedFoodType === foodType ? 'underline' : ''
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
            <div className='grid grid-cols-1 gap-3 pt-2 ' style={{
              gridTemplateRows: `repeat(1, 1fr)`,
              gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)',
              overflowY: 'auto',
              maxHeight: dynamicHeight
            }}>
              {foods.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  key={item.id}
                  onClick={() => {

                    if (!isAllowed) {

                      if (Object.keys(item.attributesArr).length > 0) {
                        showModal(item);
                      } else {
                        const randomNum = uuidv4()
                        setCount(randomNum);  // Increment the count every time the modal is opened
                        setSelectedAttributes({})
                        setTotalPrice(0);
                        addSpecialFood(item.id, item.name, item.subtotal, item.image, {}, randomNum, item.CHI, item, item.availability, item.attributesArr)
                        //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
                        //console.log("helllllllllllllllllllllllllllllllllllllo")
                        //console.log(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable))))
                        //SetTableInfo(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(localStorage.getItem(store + "-" + selectedTable)))))
                      }
                    } else {
                      showModal(item);

                    }
                  }}

                  className=" border border-black rounded cursor-pointer">
                  <div className='flex'>
                    <div style={{ width: "100%" }}>
                      <div className='flex-row px-2 pb-1 w-full'>

                        {/* parent div of title + quantity and button parent div */}
                        <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div className="col-span-4 ">
                            <p class="notranslate">

                              {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(item?.CHI) : (item?.name)}
                            </p>                          </div>

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
                              <span className='notranslate'>
                                ${(Math.round(item.subtotal * 100) / 100).toFixed(2)}
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
      </div >
    )
  }
}

export default Food