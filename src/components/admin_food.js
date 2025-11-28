import React, { useState, useEffect, useRef, useCallback } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import './admin_food.css';
import Scanner from './ScanMenu';
import { useUserContext } from "../context/userContext";
import add_image from '../components/add_image.png';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import useDynamicAttributes from './useDynamicAttributes';
import pinyin from "pinyin";
import LazyLoad from 'react-lazy-load';


function convertToPinyin(text) {
  return pinyin(text, {
    style: pinyin.STYLE_NORMAL,
  }).join('');
}

const Food = ({ store }) => {
  const initialGlobal = [
    { "type": "外卖", "price": 0, "typeCategory": "要求添加" },
    { "type": "加酱料", "price": 0, "typeCategory": "要求添加" },
    { "type": "加饭", "price": 0, "typeCategory": "要求添加" },
    { "type": "加面", "price": 0, "typeCategory": "要求添加" },
    { "type": "加粉", "price": 0, "typeCategory": "要求添加" },
    { "type": "加米", "price": 0, "typeCategory": "要求添加" },
    { "type": "加肉", "price": 0, "typeCategory": "要求添加" },
    { "type": "加菜", "price": 0, "typeCategory": "要求添加" },
    { "type": "加辣", "price": 0, "typeCategory": "要求添加" },
    { "type": "加盐", "price": 0, "typeCategory": "要求添加" },
    { "type": "加油", "price": 0, "typeCategory": "要求添加" },
    { "type": "加醋", "price": 0, "typeCategory": "要求添加" },
    { "type": "加糖", "price": 0, "typeCategory": "要求添加" },
    { "type": "加葱", "price": 0, "typeCategory": "要求添加" },
    { "type": "加芫荽", "price": 0, "typeCategory": "要求添加" },
    { "type": "加蒜", "price": 0, "typeCategory": "要求添加" },
    { "type": "堂食", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要酱料", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要饭", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要面", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要粉", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要米", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要肉", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要菜", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要辣", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要盐", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要油", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要醋", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要糖", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要葱", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要芫荽", "price": 0, "typeCategory": "要求减少" },
    { "type": "不要蒜", "price": 0, "typeCategory": "要求减少" }
  ]
  const [global, setGlobal] = useState(initialGlobal);
  const [error, setError] = useState('');

  // --- Add state for Shift+Drag ---
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startIndex, setStartIndex] = useState(null); // Stores the *original* index
  const [currentHoverIndex, setCurrentHoverIndex] = useState(null); // Stores the *original* index
  const [startValue, setStartValue] = useState(null);
  // --- End of state for Shift+Drag ---

  // --- Add Refs for Auto-Scroll ---
  const modalScrollContainerRef = useRef(null); // Ref for the scrollable container
  const scrollIntervalRef = useRef({ id: null, direction: 'none' }); // Ref for the scroll interval timer
  // --- End of Refs for Auto-Scroll ---

  // --- Function to stop auto-scrolling (adjusted for new ref structure) ---
  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current.id) {
      clearInterval(scrollIntervalRef.current.id);
    }
    scrollIntervalRef.current = { id: null, direction: 'none' }; // Reset the ref
  }, []);

  const startScrolling = useCallback((direction) => {
    stopScrolling(); // 先确保停止任何现有滚动
    const scrollSpeed = 18;     // 调整后的速度
    const intervalTiming = 25;  // 调整后的间隔
    const container = modalScrollContainerRef.current;
    if (!container) return;

    const scrollAction = () => {
      if (!modalScrollContainerRef.current) { // 再次检查 container 是否存在
          stopScrolling();
          return;
      }
      if (direction === 'up') {
        modalScrollContainerRef.current.scrollTop -= scrollSpeed;
      } else if (direction === 'down') {
        modalScrollContainerRef.current.scrollTop += scrollSpeed;
      }
    };

    scrollIntervalRef.current = {
      id: setInterval(scrollAction, intervalTiming),
      direction: direction
    };
  }, [stopScrolling]); // 依赖 stopScrolling

  const handleChange = (index, field, value) => {
    // Use the original index when changing state
    const originalIndex = global.length - 1 - index; // Calculate original index
    const updatedGlobal = [...global];
    if (updatedGlobal[originalIndex]) { // Check if index is valid
        // Ensure price is stored as a number if it's the price field
        const newValue = field === 'price' ? (parseInt(value, 10) || 0) : value;
        updatedGlobal[originalIndex][field] = newValue;
        setGlobal(updatedGlobal);
    }
    if (error) setError('');
  };

  const saveGlobalChanges = async () => {
    // Validate for empty types or duplicate types
    const typeSet = new Set();
    for (const item of global) {
      if (!item.type.trim()) {
        setError('Error: Type cannot be empty.');
        return;
      }
      if (typeSet.has(item.type)) {
        setError('Error: Duplicate types are not allowed.');
        return;
      }
      typeSet.add(item.type);
    }

    try {
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
      await updateDoc(docRef, {
        globalModification: JSON.stringify(global)
      });
      console.log("Global changes saved.");
      setError('Changes saved successfully.');
    } catch (error) {
      setError(`Saving failed: ${error.message}`);
    }
  };

  const addNewItem = () => {
    // ... existing addNewItem function ...
    // Ensure new items are added correctly if global state is used
    const newItem = { type: "", price: 0, typeCategory: "要求添加" };
    // Add to the end, the reverse logic is only for display mapping
    setGlobal(prevGlobal => [...prevGlobal, newItem]);
  };

  const handleDelete = (index) => {
    // Use the original index when deleting
    const originalIndex = global.length - 1 - index; // Calculate original index
    const updatedGlobal = [...global];
    if (originalIndex >= 0 && originalIndex < updatedGlobal.length) { // Bounds check
        updatedGlobal.splice(originalIndex, 1);
        setGlobal(updatedGlobal);
    }
  };

  const {
    attributes,
    currentAttribute,
    setCurrentAttribute,
    currentVariation,
    setCurrentVariation,
    priceFormatError,
    addOrUpdateAttributeVariation,
    deleteVariation,
    deleteAttribute,
    toggleMultiSelect,
    resetAttributes, // Add this function from the hook
  } = useDynamicAttributes();
  useEffect(() => {
    // This effect will run whenever attributes state changes
    console.log('Attributes updated:', attributes);
    setNewItem({ ...newItem, attributesArr: attributes });
    //resetAttributes(transformJsonToInitialState(attributes))

  }, [attributes]); // Add attributes as a dependency
  const transformJsonToInitialState = (jsonObject) => {
    const initialState = {};

    for (const attributeName in jsonObject) {
      if (jsonObject.hasOwnProperty(attributeName)) {
        initialState[attributeName] = {
          isSingleSelected: jsonObject[attributeName].isSingleSelected,
          variations: jsonObject[attributeName].variations
        };
      }
    }

    return initialState;
  };

  /**
   *
  {
      "size": {
        "isSingleSelected": true,
        "variations": [
          {
            "type": "bg",
            "price": 2
          },
          {
            "type": "sm",
            "price": -1
          }
        ]
      },
      "more": {
        "isSingleSelected": false,
        "variations": [
          {
            "type": "more rice",
            "price": 1
          }
        ]
      }
    }
   */
  const formatPriceDisplay = (price) => {
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  const selectVariationForEdit = (attributeName, variation) => {
    setCurrentAttribute(attributeName);
    setCurrentVariation(variation);
  };

  const [isSingleSelect, setIsSingleSelect] = useState(true);

  const handleToggle = (attributeName, isSingle) => {
    toggleMultiSelect(attributeName, isSingle);  // Assuming toggleMultiSelect and attributeName come from props or somewhere else.
    setIsSingleSelect(isSingle);
  };


  const params = new URLSearchParams(window.location.search);
  const [selectedFoodType, setSelectedFoodType] = useState("");
  const [selectedName, setSelectedName] = useState('');
  const [selectedCHI, setSelectedCHI] = useState('');
  const handleNameChange = (event) => {
    setSelectedName(event.target.value);
  };

  // Function to handle the change in the CHI input
  const handleCHIChange = (event) => {
    setSelectedCHI(event.target.value);
  };
  const { user, user_loading } = useUserContext();

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
  // Initialize selectedOptions with an empty array
  const [selectedOptions, setSelectedOptions] = useState(['Morning', 'Afternoon', 'Evening']);
  // Define a function to toggle the selection of an option
  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      // If the option is already selected, remove it
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
      setNewItem({ ...newItem, availability: selectedOptions.filter((item) => item !== option) });

    } else {
      // If the option is not selected, add it
      setSelectedOptions([...selectedOptions, option]);
      setNewItem({ ...newItem, availability: option });

    }
    console.log(selectedOptions)
  };

  const [data, setData] = useState(JSON.parse(localStorage.getItem(store) || "[]"));

  const [foods, setFoods] = useState(data);
  if (!localStorage.getItem(store) || localStorage.getItem(store) === "") {
    localStorage.setItem(store, "[]");
  }



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
    saveId(Math.random());
  }, [products]);


  const displayAllProductInfo = () => {
    // Retrieve the array from local storage
    let products = JSON.parse(sessionStorage.getItem(store));
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
  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
  };
  const isBigPC = width >= 1280;
  const itemStyle = isMobile
    ? {
      minWidth: 'calc(100% - 10px)',
      maxWidth: 'calc(100% - 10px)', // 100% when width >= 1280
      margin: '5px',
      padding: '10px',
      paddingLeft: '0px',
      paddingRight: '0px',
      boxSizing: 'border-box',
    }
    : isBigPC
      ? {
        minWidth: 'calc(33% - 10px)', // 33% when width >= 1280
        maxWidth: 'calc(33% - 10px)', // 33% when width >= 1280
        margin: '5px',
        padding: '10px',
        paddingLeft: '0px',
        paddingRight: '0px',
        boxSizing: 'border-box',
      }
      : {
        minWidth: 'calc(50% - 10px)', // 50% for screens smaller than 1280 but not mobile
        maxWidth: 'calc(50% - 10px)', // 50% when width >= 1280
        margin: '5px',
        padding: '10px',
        paddingLeft: '0px',
        paddingRight: '0px',
        boxSizing: 'border-box',
      };
  useEffect(() => {
  }, [id]);

  useEffect(() => {
    // Get data from localStorage when component mounts
    const storedData = JSON.parse(localStorage.getItem(store) || "[]");
    setData(storedData);
  }, [id]);

  const updateKey = async () => {
    console.log("updateKey");
    // Reference to the specific document
    const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

    // Update the 'key' field to the value retrieved from localStorage
    await updateDoc(docRef, {
      key: localStorage.getItem(store)
    });
    localStorage.setItem("Old_" + store, localStorage.getItem(store));
    alert("Saved Successful");

  };


  const syncData = async () => {
    console.log("sync data")

    let sessionData;


    try {
      // Get a reference to the specific document with ID equal to store
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

      console.log("syncData1")
      // Fetch the document
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setGlobal(JSON.parse(docSnapshot.data().globalModification || [])); // Assuming the data structure includes `globalModification`
        // The document exists
        sessionData = docSnapshot.data()?.key;
        const { key, ...rest } = docSnapshot.data();
        JSON.parse(localStorage.getItem(store) || "[]")
        if (rest === undefined || rest === null) {
          // If rest is undefined or null, do something else (e.g., set an empty array as the value)
          localStorage.setItem("TitleLogoNameContent", JSON.stringify([]));
        } else {
          // If rest is not undefined or null, proceed with the original operations
          localStorage.setItem("TitleLogoNameContent", JSON.stringify(rest));
        }
        if (sessionData === undefined || sessionData === null) {
          // If rest is undefined or null, do something else (e.g., set an empty array as the value)
          localStorage.setItem("Old_" + store, JSON.stringify([]));
        } else {
          // If rest is not undefined or null, proceed with the original operations
          localStorage.setItem("Old_" + store, sessionData);
        }

        setArr(JSON.parse(sessionData));
        setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])
        setData(JSON.parse(sessionData)); // Update state
        setFoods(JSON.parse(sessionData))
        saveId(Math.random());
        //setArr(JSON.parse(sessionData));
        setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])

      } else {
        console.log("No document found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching the document:", error);
    }
    console.log("syncData1")
  }


  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();


  // for translations sake
  const [translationsMode_, settranslationsMode_] = useState("en");

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
  //      <b style={{fontSize:"20px",color: 'red'}}>ATTENTION: YOU ARE IN ADMIN MODE!</b>
  const [foodTypes, setFoodTypes] = useState([...new Set(JSON.parse(localStorage.getItem(store) || "[]").map(item => item.category))]);
  const [foodTypesCHI, setFoodTypesCHI] = useState([...new Set(JSON.parse(localStorage.getItem(store) || "[]").map(item => item.categoryCHI))]);

  const [expandDetails, setExpandDetails] = useState(false);
  const [expandOptions, setExpandOptions] = useState(false);


  function deleteById(arr, id) {
    return arr.filter(item => item.id !== id);
  }
  const deleteFood_array = async (id) => {
    console.log(id)
    let updatedArr = deleteById(JSON.parse(localStorage.getItem(store) || "[]"), id)

    reload(updatedArr)

  }

  const [newItem, setNewItem] = useState({
    name: "",
    CHI: "",
    subtotal: "",
    category: "",
    categoryCHI: "",
    availability: "",
    attributes: "",
    attributes2: "",
    attributesArr: ""
  });


  const [arr, setArr] = useState(JSON.parse(localStorage.getItem(store) || "[]"));

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewItem({ ...newItem, [name]: value.replace(/。/g, '.') }); // 替换所有中文句号为英文句号
};


  const handleAddNewItem = () => {
    // Generate a new UUID for the item
    const newItemId = uuidv4();

    // Check if the generated UUID already exists in the array
    const isDuplicateId = arr.some((item) => item.id === newItemId);

    // If a duplicate UUID is found, regenerate the UUID until it is unique
    if (isDuplicateId) {
      return handleAddNewItem(); // Recursively call the function to generate a new UUID
    }
    // Check if any input box is empty and use the placeholder values
    const newItemWithPlaceholders = {
      id: newItemId,
      image: previewUrl,
      name: newItem.name || "Enter Meal Name",
      CHI: newItem.CHI || "填写菜品名称",
      subtotal: newItem.subtotal || "1",
      category: selectedFoodType === "" ? newItem.category || "Temporary Use" : selectedFoodType,
      categoryCHI: newItem.categoryCHI || "类别",
      availability: newItem.availability || ['Morning', 'Afternoon', 'Evening'],
      attributes: newItem.attributes || [],
      attributes2: newItem.attributes2 || [],
      attributesArr: newItem.attributesArr || {}
    };

    // Add the new item to the array
    let updatedArr = [newItemWithPlaceholders, ...arr];
    reload(updatedArr)
    setSelectedOptions(['Morning', 'Afternoon', 'Evening']);
    resetAttributes(transformJsonToInitialState({}))


    console.log(updatedArr)
    // Clear the input fields
    setNewItem({
      name: "",
      CHI: "",
      image: "",
      subtotal: "",
      category: "",
      categoryCHI: "",
      availability: "",
      attributes: "",
      attributes2: "",
      attributesArr: ""
    });
  };

  const updateItem = (id, updatedFields) => {
    let target_category = null;
    const newItems = arr.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updatedFields };
        target_category = updatedItem.category;
        return updatedItem;
      }
      return item;
    });
    reload(newItems)

  };

  function reload(updatedArr) {
    setArr(updatedArr);
    setData(updatedArr); // Update state
    setFoods(updatedArr)

    localStorage.setItem(store, JSON.stringify(updatedArr))
    saveId(Math.random());
    setFoodTypes([...new Set(updatedArr.map(item => item.category))])
  }

  const [previewUrl, setPreviewUrl] = useState("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public");

  const handleFileChangeAndUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      //setUploadStatus('No file selected.');
      return;
    }

    // Show a preview of the selected file

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        //console.log(data.result.variants[0])
        setPreviewUrl(data.result.variants[0])
        //console.log(item)
        //setUploadStatus('Image uploaded successfully.');
      } else {
        //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      //setUploadStatus(`Error: ${error.message}`);
    }
  };


  const translateToChinese = async (text) => {
    try {
      const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {}, {
        params: {
          q: text,
          target: 'zh-CN',  // Translate to Spanish as an example. Adjust as needed.
          key: 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo'
        }
      });
      return (response.data.data.translations[0].translatedText)
      //setTranslatedText(response.data.data.translations[0].translatedText);
    } catch (error) {
      return ('Failed to translate text');
    }
  };

  const translateToEnglish = async (text) => {
    try {
      const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {}, {
        params: {
          q: text,
          target: 'en',  // Translate to English.
          key: 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo' // Note: It's not recommended to expose API keys in code like this.
        }
      });
      return (response.data.data.translations[0].translatedText)
      //setTranslatedText(response.data.data.translations[0].translatedText);
    } catch (error) {
      return ('Failed to translate text');
    }
  };
  /**scanner */

  //Instruction:
  //Click on the image to change:
  //
  useEffect(() => {
    //console.log("hellooooooooooooooooooooo")
    syncData();
  }, []);
  const [ChangeCategoryName, setChangeCategoryName] = useState(false);
  const [globalModal, setGlobalModal] = useState(false);
  const [SelectChangeCategoryName, setSelectChangeCategoryName] = useState('');
  const [categoryName, setCategoryName] = useState(''); // Initialize with an empty string
  const [showAdjustion, setShowAdjustion] = useState(false);

  const ChangeCategoryNameSubmit = () => {
    // Use the categoryName state variable here
    console.log('New category name:', categoryName)
    console.log(SelectChangeCategoryName)
    console.log(JSON.parse(localStorage.getItem(store)))

    const updatedData = JSON.parse(localStorage.getItem(store)).map((item) => {
      if (item.category === SelectChangeCategoryName) {
        return { ...item, category: categoryName };
      }
      return item;
    });
    //console.log(updatedData)
    reload(updatedData)
    setSelectedFoodType(categoryName)
    setSelectChangeCategoryName('');
    setCategoryName(''); // Initialize with an empty string


  };

  // --- Add useEffect for Shift+Drag event listeners ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false);
        // If shift is released during drag, finalize the drag
        if (isDragging) {
          stopScrolling(); // Stop scrolling when mouse is up
        }
      }
    };

    // Global mouseup handler to finalize drag and stop scrolling
    const handleMouseUpGlobal = () => {
        stopScrolling(); // Stop scrolling when mouse is up
        if (isDragging) {
            setIsDragging(false);
            // Use the stored original start/hover indexes
            if (startIndex !== null && currentHoverIndex !== null && startValue !== null) {
                const minIndex = Math.min(startIndex, currentHoverIndex);
                const maxIndex = Math.max(startIndex, currentHoverIndex);
                const priceValue = Number(startValue) || 0; // Ensure it's a number

                const updatedGlobal = global.map((item, index) => {
                    // Apply change if index is within the dragged range (using original indexes)
                    if (index >= minIndex && index <= maxIndex) {
                        return { ...item, price: priceValue };
                    }
                    return item;
                });
                setGlobal(updatedGlobal);
            }
            // Reset dragging state
            setStartIndex(null);
            setCurrentHoverIndex(null);
            setStartValue(null);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseup', handleMouseUpGlobal);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      stopScrolling(); // Ensure interval is cleared on unmount
    };
  }, [isDragging, global, startIndex, currentHoverIndex, startValue, stopScrolling, startScrolling]); // Added dependencies
  // --- End of useEffect for Shift+Drag ---

  // --- Shift+Drag handlers ---
  const handleMouseDown = (index, event) => { // Still triggered on input
      if (isShiftPressed) {
        event.preventDefault();
        const originalIndex = global.length - 1 - index;
        if (global[originalIndex]) {
            setIsDragging(true);
            setStartIndex(originalIndex);
            setCurrentHoverIndex(originalIndex);
            setStartValue(global[originalIndex]?.price ?? 0);
            // No longer starting scroll here
        }
      }
  };

  // handleMouseOver on input is now only for updating the hover index
  const handleInputMouseOver = (index) => {
      if (isDragging) {
          const originalIndex = global.length - 1 - index;
          setCurrentHoverIndex(originalIndex);
      }
  };

  // NEW: Mouse move handler on the scroll container
  const handleContainerMouseMove = (event) => {
      if (isDragging) {
          const container = modalScrollContainerRef.current;
          if (!container) return;

          const rect = container.getBoundingClientRect();
          const mouseY = event.clientY;
          const threshold = 45; // Trigger zone threshold
          let requiredDirection = 'none';

          if (mouseY < rect.top + threshold) {
            requiredDirection = 'up';
          } else if (mouseY > rect.bottom - threshold) {
            requiredDirection = 'down';
          }

          // Start/stop scrolling only if the required direction changes
          if (requiredDirection !== scrollIntervalRef.current.direction) {
            if (requiredDirection === 'none') {
              stopScrolling();
            } else {
              startScrolling(requiredDirection);
            }
          }
          // If direction is the same, do nothing, interval continues
      }
  };
  // --- End of Shift+Drag handlers ---

  return (

    <div>
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-xxz5vNXM/dz2Uk5KA02wmbzm9KpPL5Sgt1JwBrJZ4tUfS5B/R5F/h5A5J7J5C5P9i" crossorigin="anonymous" />

      </Helmet>


      <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
      </link>
      <div className="mr-1 flex justify-between mt-3">
        <div onClick={() => {
          syncData();
        }}
          className="mb-2 btn d-inline-flex btn-sm btn-neutral">

          <span>
            <i class="fa fa-refresh"></i> Refresh Data</span>
        </div>
        <div onClick={updateKey} className="mb-2 btn d-inline-flex btn-sm btn-primary">
          <span className="pe-2">
            <i class="bi bi-bookmarks"></i>
          </span>
          <span
          >
            {"Save Changes"}
          </span>
        </div>
      </div>
      <div className="mr-1 flex justify-between mt-1">


        <div onClick={() => { setChangeCategoryName(true) }} className="mb-2 btn d-inline-flex btn-sm btn-info">
          <span className="pe-2">
            <i class="bi bi-bookmarks"></i>
          </span>
          <span
          >
            {"Rename Category"}
          </span>
        </div>

        <div className="block">
          <Scanner
              reload={reload}
              setFoods={setFoods}
              store={store}
              t={t} // Pass translation function
              isButton={true} // Render as a button on large screens
          />
        </div>
      </div>
      <div className="mr-1 flex justify-between mt-1" onClick={() => {
        setGlobalModal(true)

      }}>
        <div className="mb-2 btn d-inline-flex btn-sm btn-danger">
          <span className="pe-2">
            <i class="bi bi-gear-wide-connected"></i>
          </span>
          <span>
            Add Global Changes
          </span>
        </div>
      </div>

      {globalModal && (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl max-h-full mt-20">
            <div className="relative bg-white rounded-lg border-black shadow ">
              <div className="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 className="text-l font-semibold text-gray-900">
                  {t("Global Food Customization Option Manager")}
                </h3>
                <button onClick={() => {
                  setGlobalModal(false)
                }} style={{ fontSize: '24px', lineHeight: '1', color: 'black', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', position: 'absolute', top: '15px', right: '20px' }}>
                  &times;
                </button>
              </div>
               {/* Assign the ref to the scrollable container and add styles */}
               <div className="px-4 py-2 bg-yellow-100 text-sm text-gray-700 rounded mb-2">
                 <i className="fas fa-info-circle mr-1"></i> Press Shift key to modify prices in bulk
               </div>

              <div ref={modalScrollContainerRef} className="p-4 overflow-y-auto" style={{ maxHeight: '70vh' }} onMouseMove={handleContainerMouseMove}>
                {error && <p className="mb-4 text-red-500">{error}</p>}
                <button
                  onClick={addNewItem}
                  className="mb-4 mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add New Item
                </button>
                <button
                  onClick={saveGlobalChanges}
                  className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Global Save
                </button>
                <div className="overflow-x-auto relative">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="py-3 px-6">Type</th>
                        <th scope="col" className="py-3 px-6">Price</th>
                        <th scope="col" className="py-3 px-6">Type Category</th>
                        <th scope="col" className="py-3 px-6">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Keep the .reverse() for display order */}
                      {[...global].reverse().map((item, index) => {
                         // Calculate original index for styling check & handlers
                         const originalIndex = global.length - 1 - index;
                         // Calculate selection state for visual feedback (using original indexes)
                         const isSelected = isDragging && startIndex !== null && currentHoverIndex !== null &&
                                           originalIndex >= Math.min(startIndex, currentHoverIndex) &&
                                           originalIndex <= Math.max(startIndex, currentHoverIndex);
                         return (
                           <tr key={originalIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"> {/* Use originalIndex for key if stable */}
                             <td className="py-4 px-6">
                               <input
                                 type="text"
                                 value={item.type} // Displaying reversed item's value
                                 onChange={(e) => handleChange(index, 'type', e.target.value)} // Pass reversed index
                                 className="text-black"
                               />
                             </td>
                             <td className="py-4 px-6">
                               <input
                                 type="number"
                                 value={item.price} // Displaying reversed item's value
                                 onChange={(e) => handleChange(index, 'price', e.target.value)} // Pass reversed index, parse happens in handleChange
                                 // Apply dynamic styling based on original index check
                                 className={`text-black ${isSelected ? 'bg-blue-200' : ''}`}
                                 // Add Shift+Drag handlers, passing reversed index and event
                                 onMouseDown={(e) => handleMouseDown(index, e)}
                                 onMouseOver={() => handleInputMouseOver(index)}
                                 style={{ cursor: isShiftPressed ? 'ns-resize' : 'auto' }} // Change cursor
                               />
                             </td>
                             <td className="py-4 px-6">
                               <input
                                 type="text"
                                 value={item.typeCategory} // Displaying reversed item's value
                                 onChange={(e) => handleChange(index, 'typeCategory', e.target.value)} // Pass reversed index
                                 className="text-black"
                               />
                             </td>
                             <td className="py-4 px-6 text-center">
                               {/* Pass reversed index to handleDelete */}
                               <button onClick={() => handleDelete(index)}>
                                 <svg className="w-6 h-6 text-red-500 hover:text-red-700" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                   <path d="M6 18L18 6M6 6l12 12"></path>
                                 </svg>
                               </button>
                             </td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='m-auto '>
        <div className='hstack gap-2  mt-2'>
          <form className="w-full w-lg-full">
            <div className='input-group input-group-sm input-group-inline shadow-none'>
              <span className='input-group-text pe-2 rounded-start-pill'>
                <i className='bi bi-search'></i>
              </span>
              {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                <input
                  translate="no"
                  class="form-control text-base shadow-none rounded-end-pill" placeholder="Search for items..."
                  type="text"
                  value={selectedCHI}
                  onChange={handleCHIChange}
                  style={{ fontSize: '16px' }}

                />
                :
                <input
                  translate="no"
                  class="form-control text-base shadow-none rounded-end-pill" placeholder="Search for items..."
                  type="text"
                  value={selectedName}
                  onChange={handleNameChange}
                  style={{ fontSize: '16px' }}

                />
              }


              {/* <input  translate="no"  class="form-control text-sm shadow-none rounded-end-pill" placeholder="Search for items..." onChange={handleSearchChange}>
              </input> */}
            </div>
          </form >
        </div>
        {ChangeCategoryName && (
          <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl max-h-full mt-20">
              <div className="relative bg-white rounded-lg border-black shadow ">
                <div className="flex items-start justify-between p-4 border-b rounded-t ">
                  <h3 className="text-l font-semibold text-gray-900">
                    {t("Please choose the food category you want to rename:")}
                  </h3>
                  <button onClick={() => {
                    setChangeCategoryName(false)
                    setSelectChangeCategoryName('');
                    setCategoryName(''); // Initialize with an empty string
                  }} style={{ fontSize: '24px', lineHeight: '1', color: 'black', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', position: 'absolute', top: '15px', right: '20px' }}>
                    &times;
                  </button>
                </div>
                <div className='p-4 pt-3 flex flex-row flex-wrap'>
                  {foodTypes.map((foodType) => (
                    <button
                      onClick={() => { setSelectChangeCategoryName(foodType) }}
                      key={foodType}
                      className={`m-2 btn border-black text-black-600 rounded-xl px-2 py-2`}
                      style={{ display: 'inline-flex', textUnderlineOffset: '0.5em' }}
                    >
                      <div>
                        {foodType && foodType.length > 1
                          ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                          : ''}
                      </div>
                    </button>
                  ))}
                </div>
                <h3 className=" p-4 text-l font-semibold text-gray-900">
                  {t("Please provide the new name for the food category:")}
                </h3>
                <div>
                  <input
                    className="m-4 shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="foodCategory"
                    type="text"
                    placeholder={SelectChangeCategoryName === "" ? "Enter the new category name" : SelectChangeCategoryName}
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  <a
                    onClick={() => {
                      ChangeCategoryNameSubmit();
                      // You can pass categoryName or use it in your ChangeCategoryName function
                      setChangeCategoryName(false)
                    }}
                    className="btn d-inline-flex btn-sm btn-primary"
                  >
                    <span>{t("Confirm")}</span>
                  </a>
                </div>
                <br></br>
              </div>
            </div>
          </div>
        )}
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type' >

            {/* end of the top */}
            <div ref={scrollingWrapperRef} className={`mt-2 ${isMobile ? 'scrolling-wrapper-filter' : ''} mb-0`}>

              <button onClick={() => {
                setSelectedFoodType("");
              }}
                className={`m-0 border-black-600 text-black-600 rounded-xl px-2 py-2 ${selectedFoodType === "" ? 'underline' : ''}`}
                style={{ display: "inline-block", textUnderlineOffset: '0.5em' }}><div>{t("All")}</div></button>
              {
                foodTypes.map((foodType) => (
                  <button
                    key={foodType}
                    onClick={() => {
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

        {/* Table Start Item Hint */}
        <div className='mt-3 mb-3 p-3' style={{ 
          backgroundColor: '#e7f3ff', 
          borderLeft: '4px solid #2196F3',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-info-circle-fill text-blue-600" style={{ fontSize: '1.2rem', flexShrink: 0 }}></i>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <strong style={{ marginRight: '6px' }}>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? 
                "开台功能提示：" : 
                "Table Start Feature:"
              }</strong>
              <span>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? 
                "请确保创建一个中文名称包含\"开台\"的商品（例如：\"开台xx\"、\"xx开台\" 等），价格设为 0。该商品将用于开台计时功能。" : 
                "Please ensure you create an item with Chinese name (CHI field) containing '开台' (e.g., '开台xx', 'xx开台'), set price to 0. This item is required for the table timing feature."
              }</span>
            </div>
          </div>
        </div>

        <LazyLoad height={762}>


          {/* diplay food */}
          <div style={containerStyle}>
            <div style={itemStyle}>


              <div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={""}
                className="">

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <div
                    style={{
                      width: '80px',
                    }}>
                    <label className='cursor-pointer'
                      style={{ display: 'block', width: '100%' }}

                    >
                      <input
                        type="file"
                        onChange={handleFileChangeAndUpload}
                        style={{ display: 'none' }} // hides the input
                        translate="no"
                      />

                      <img
                        className="h-[80px] w-[80px] transition-all object-cover rounded-md"
                        src={previewUrl}
                        loading="lazy"
                      />
                    </label>
                  </div>
                  <div style={{ width: 'calc(100% - 80px)' }}>  {/* adjust width */}
                    <div className=' text-md font-semibold'>

                      <div className="mb-1 flex ml-2 items-center">
                        <input
                          className='text-md font-semibold'
                          type="text"
                          name="name"
                          placeholder={t("Enter Meal Name")}
                          value={newItem.name}
                          onChange={handleInputChange}
                          translate="no"
                        />
                        <span onClick={async () => {  //Auto Fill Chinese
                          let translatedText = "Enter Meal Name";
                          if (newItem.name) {
                            translatedText = newItem.name;
                          }
                          try {
                            const chineseTranslation = await translateToChinese(translatedText);
                            setNewItem({ ...newItem, CHI: chineseTranslation });
                          } catch (error) {
                            console.error("Translation error:", error);
                          }

                        }}
                          className={`cursor-pointer text-black ml-auto notranslate`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(CN)")}</span></span>

                      </div>
                      <div className="mb-1 ml-2 flex  items-center">
                        <input
                          className='text-md font-semibold'
                          type="text"
                          name="CHI"
                          placeholder={"填写菜品名称"}
                          value={newItem.CHI}
                          onChange={handleInputChange}
                          translate="no"
                        />

                        <span onClick={async () => {  // Auto Fill English
                          let translatedText = "填写菜品名称";
                          if (newItem.CHI) {
                            translatedText = newItem.CHI;
                          }
                          try {
                            const EnglishTranslation = await translateToEnglish(translatedText);
                            setNewItem({ ...newItem, name: EnglishTranslation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') });
                          } catch (error) {
                            console.error("Translation error:", error);
                          }
                        }}
                          className={`cursor-pointer text-black ml-auto notranslate`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span className='notranslate'>&nbsp;{t("(EN)")}</span></span>

                      </div>

                    </div>
                  </div>

                </div>
                <div className=' d-block text-md font-semibold'>
                  <div className='flex'>
                    <div>
                      <div>
                        <span className='text-black'>
                          {t("Category: ")}
                        </span>
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          type="text" name="category"
                          placeholder={selectedFoodType === "" ? "Temporary Use" : selectedFoodType}
                          value={selectedFoodType === "" ? newItem.category : selectedFoodType}
                          onChange={handleInputChange}
                          translate="no" />
                      </div>
                      <div>
                        <span className='text-black'>
                          {t("Price: $ ")}

                        </span>
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          type="text"
                          name="subtotal"
                          placeholder={"1"}
                          value={newItem.subtotal}
                          onChange={handleInputChange}
                          translate="no"
                        />
                      </div>
                    </div>

                  </div>


                  {expandDetails ? <div>

                    <div>
                      <p className="mb-1">
                        <span className='text-black'>
                          {" Options:"}
                        </span>
                      </p>
                      {expandOptions ? <div><div className='d-block text-md font-semibold'>
                        <button onClick={() => setShowAdjustion(!showAdjustion)}
                          className="btn d-inline-flex d-inline-flex btn-sm btn-light">
                          Edit Dish Revision Category
                        </button>
                        {
                          showAdjustion ? (
                            <>
                              <div className='flex'>
                                <span className='text-black'>
                                  Dish Revise Category:&nbsp;
                                </span>
                                <input
                                  className='text-md font-semibold'
                                  style={{ width: "50%" }}
                                  value={currentAttribute}
                                  onChange={(e) => setCurrentAttribute(e.target.value)}
                                  placeholder="Size"
                                  translate="no"
                                />
                              </div>
                              <small className='text-blue-500'>default: 'Option' (E.g.: Portion Size)</small>
                            </>
                          ) : null
                        }



                        <div className='flex'>

                          <span className='text-black'>
                            Dish Revise Details:&nbsp;
                          </span>

                          <input
                            className='text-md font-semibold'
                            style={{ width: "50%" }}
                            value={currentVariation.type}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, type: e.target.value })}
                            placeholder=" Big"
                            translate="no"
                          />
                        </div>
                        <small className='text-blue-500'>E.g.: Big</small>
                        <div className='flex'>

                          <span className='text-black'>
                            {t("Price: $ ")}

                          </span>

                          <input
                            className='text-md font-semibold'
                            style={{ width: "50%" }}
                            value={currentVariation.price}
                            onChange={(e) => setCurrentVariation({ ...currentVariation, price: e.target.value })}
                            placeholder="1"
                            translate="no"
                          />
                        </div>
                        <div className='text-red-700'>
                          {priceFormatError && <span>{priceFormatError}</span>}

                        </div>

                      </div></div> : <div></div>}

                      <div className='flex'>
                        <a
                          onClick={() => {
                            if (!expandOptions) {
                              setExpandOptions(true);
                            } else {
                              resetAttributes(transformJsonToInitialState(attributes))
                              addOrUpdateAttributeVariation();
                            }
                          }}
                          className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-warning"
                        >
                          <span>
                            {!expandOptions ? "Adjust Dish Revision Option" : "Confirm"}
                          </span>
                        </a>
                      </div>

                      {Object.entries(attributes).map(([attributeName, attributeDetails]) => (
                        <div key={attributeName}>
                          <p className="mb-1">
                            <span onClick={() => setCurrentAttribute(attributeName)} className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                              {attributeName} &nbsp;
                            </span>
                            <div className="custom-control custom-switch" style={{ display: "inline-block", verticalAlign: "middle" }}>
                              <input
                                className='form-check-input'
                                type="checkbox"
                                style={{ marginRight: "5px" }}
                                checked={!attributeDetails.isSingleSelected}
                                onChange={(e) => handleToggle(attributeName, !e.target.checked)}
                                translate="no"
                              />
                            </div>
                            {" Multi-Select"} { }
                          </p>

                          <div className='flex flex-wrap'>
                            {attributeDetails.variations.map((variation, idx) => (
                              <div>
                                <div key={idx}>
                                  <div onClick={() => selectVariationForEdit(attributeName, variation)} className='mb-1 mr-1 mt-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                                    {variation.type}({formatPriceDisplay(variation.price)})
                                    <span onClick={() => deleteVariation(attributeName, idx)} style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                                      <i className="fas fa-times"></i>
                                    </span>
                                  </div>
                                </div>

                              </div>
                            ))}
                          </div>

                        </div>
                      ))}


                    </div>

                    <div className='mb-3'>
                      <p className="mb-1">
                        <span className='text-black'>

                          Time Range Availability:
                        </span>

                      </p>
                      <div className="flex">
                        {['Morning', 'Afternoon', 'Evening'].map((timeOfDay) => (
                          <div
                            key={timeOfDay}
                            className={`mr-1 cursor-pointer relative rounded-lg px-2.5 h-8 flex items-center justify-center font-semibold text-xs leading-none tracking-wider text-uppercase text-black whitespace-nowrap ${selectedOptions.includes(timeOfDay) ? 'bg-blue-200' : 'bg-white'
                              }`}
                            onClick={() => toggleOption(timeOfDay)}
                          >
                            {timeOfDay}
                            {selectedOptions.includes(timeOfDay) && (
                              <span className="absolute top-0 right-0 cursor-pointer">
                                {/* Ensure FontAwesomeIcon component is correctly imported to use it here */}
                                <FontAwesomeIcon icon={faTimes} />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>


                    </div></div> :
                    <div className='mb-2'></div>}

                </div>

                <div className={`flex justify-between`}>

                  <a onClick={() => setExpandDetails(!expandDetails)} // Use an arrow function to toggle the state
                    className="btn d-inline-flex d-inline-flex btn-sm btn-light">

                    <span>
                      {expandDetails ? "Hide Details" : "Edit Details"}
                    </span>
                  </a>
                  <div>


                    <a onClick={() => handleAddNewItem(!expandDetails)} className="btn d-inline-flex btn-sm btn-success">
                      <span className="pe-2">
                        <i class="bi bi-pencil"></i>
                      </span>
                      <span>
                        {t("Add New")}
                      </span>
                    </a>
                  </div>

                </div>


              </div>
            </div>

            <React.Fragment>
              {foods
                // Filter by selected food category
                .filter(food => selectedFoodType === "" || food.category === selectedFoodType)
                // Filter by name, if provided
                .filter(food => selectedName === "" || food.name.toLowerCase().includes(selectedName.toLowerCase()))
                // Filter by CHI, if provided
                .filter(food => {
                  if (selectedCHI === "") {
                    return true;
                  }
                  const pinyinCHI = convertToPinyin(food.CHI).toLowerCase();
                  return food.CHI.includes(selectedCHI) || pinyinCHI.includes(selectedCHI.toLowerCase());
                })
                .filter(item => !(item?.name === "Enter Meal Name" && item?.CHI === "填写菜品名称"))
                ?.map((item, index) => (

                  <div style={itemStyle}>


                    <Item selectedFoodType={selectedFoodType} key={index} translateToChinese={translateToChinese} translateToEnglish={translateToEnglish} item={item} updateItem={updateItem} deleteFood_array={deleteFood_array} id={id} saveId={saveId} foodTypes={foodTypes}
                      fullItems={arr}
                    />

                  </div>
                ))}
            </React.Fragment>


          </div>
        </LazyLoad>

      </div>

    </div> // This should be the closing tag of the outermost div in the return statement
  )
}



const Item = ({ selectedFoodType, item, updateItem, deleteFood_array, saveId, id, translateToEnglish, translateToChinese, foodTypes, fullItems }) => {
  const [showAdjustion, setShowAdjustion] = useState(false);

  const {
    attributes,
    currentAttribute,
    setCurrentAttribute,
    currentVariation,
    setCurrentVariation,
    priceFormatError,
    addOrUpdateAttributeVariation,
    deleteVariation,
    deleteAttribute,
    toggleMultiSelect,
    resetAttributes, // Add this function from the hook
  } = useDynamicAttributes();

  useEffect(() => {
    //console.log('Attributes updated:', item);
    updateItem(item.id, { ...item, attributesArr: attributes })
  }, [attributes]); // Add attributes as a dependency

  const transformJsonToInitialState = (jsonObject) => {
    const initialState = {};

    for (const attributeName in jsonObject) {
      if (jsonObject.hasOwnProperty(attributeName)) {
        initialState[attributeName] = {
          isSingleSelected: jsonObject[attributeName].isSingleSelected,
          variations: jsonObject[attributeName].variations
        };
      }
    }

    return initialState;
  };


  /**
   *
  {
      "size": {
        "isSingleSelected": true,
        "variations": [
          {
            "type": "bg",
            "price": 2
          },
          {
            "type": "sm",
            "price": -1
          }
        ]
      },
      "more": {
        "isSingleSelected": false,
        "variations": [
          {
            "type": "more rice",
            "price": 1
          }
        ]
      }
    }
   */
  const formatPriceDisplay = (price) => {
    return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
  };

  const selectVariationForEdit = (attributeName, variation) => {
    setCurrentAttribute(attributeName);
    setCurrentVariation(variation);
  };

  const [isSingleSelect, setIsSingleSelect] = useState(true);

  const handleToggle = (attributeName, isSingle) => {
    toggleMultiSelect(attributeName, isSingle);  // Assuming toggleMultiSelect and attributeName come from props or somewhere else.
    setIsSingleSelect(isSingle);
  };


  const [imgGallery, setImgGallery] = useState([]);
  const [isGenChi, setGenChi] = useState(false);
  const [isModalGeneratePicOpen, setModalGeneratePicOpen] = useState(false);

  const [width, setWidth] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width <= 768;

  const [previewUrl, setPreviewUrl] = useState(add_image)
  // Initialize selectedOptions with an empty array
  //const [selectedOptions, setSelectedOptions] = useState([]);
  // Define a function to toggle the selection of an option

  const toggleOption = (option) => {
    if (item.availability.includes(option)) {
      // If the option is already selected, remove it
      //setSelectedOptions(selectedOptions.filter((item) => item !== option));
      //console.log(item)
      updateItem(item.id, { ...item, availability: item.availability.filter((item) => item !== option) })

    } else {
      //console.log(option)
      // If the option is not selected, add it
      //setSelectedOptions([...selectedOptions, option]);

      //console.log(item)
      updateItem(item.id, { ...item, availability: [...item.availability, option] })

    }
  };
  const [expandDetails, setExpandDetails] = useState(false);
  const [expandOptions, setExpandOptions] = useState(false);

  const handleFileChangeAndUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      //setUploadStatus('No file selected.');
      return;
    }

    // Show a preview of the selected file

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        //console.log(data.result.variants[0])
        setPreviewUrl(data.result.variants[0])
        //console.log(item)
        updateItem(item.id, { ...item, image: data.result.variants[0] })
        //setUploadStatus('Image uploaded successfully.');
      } else {
        //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      //setUploadStatus(`Error: ${error.message}`);
    }
  };
  const generatePic = async (item) => {
    setPreviewUrl(add_image)
    try {
      const myFunction = firebase.functions().httpsCallable('generatePic');
      const result = await myFunction({ CHI: item.CHI, name: item.name });
      let ARRimage = result.data.result
      console.log(ARRimage.length)
      setImgGallery(ARRimage)
      //console.log(result.data.result)
      //return(result.data.result)
      //setResponse(result);
    } catch (error) {
      setImgGallery([])
      //console.log([])

      //return []
    }
  };
  const selectPic = (pic_url, item) => {
    //console.log(item)
    updateItem(item.id, { ...item, image: pic_url })
    handleModalGeneratePicClose()
  }


  const handleModalGeneratePicOpen = (item) => {
    //console.log(item)
    setModalGeneratePicOpen(true);
  };

  const handleModalGeneratePicClose = () => {
    setModalGeneratePicOpen(false);
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
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  return (
    <div>
      {isCategoryModalOpen && (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl max-h-full mt-20">
            <div className="relative bg-white rounded-lg border-black shadow">
              <div className="flex items-start justify-between p-4 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900 ">
                  {t("Select the category that you would like to change into")}
                </h3>
                <button onClick={() => { setCategoryModalOpen(false) }} style={{ fontSize: '24px', lineHeight: '1', color: 'black', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', position: 'absolute', top: '15px', right: '20px' }}>
                  &times;
                </button>
              </div>
              <div className='p-4 pt-3 flex flex-row flex-wrap'>
                {foodTypes.map((foodType) => (
                  <button
                    key={foodType}
                    onClick={() => {
                      updateItem(item.id, { ...item, category: foodType })
                    }}
                    className={`m-2 btn border-black text-black-600 rounded-xl px-2 py-2`}
                    style={{ display: 'inline-flex', textUnderlineOffset: '0.5em' }}
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
          </div>
        </div>

      )}
      {isModalGeneratePicOpen && (
        <div id="defaultModal"
          className={`${isMobile ? " w-full " : "w-[700px]"} fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50`}>
          <div className="relative w-full max-w-2xl max-h-full mt-20">
            <div className="relative bg-white rounded-lg border-black shadow">
              <div className="flex items-start justify-between p-4 border-b rounded-t ">
                <h3 className="text-xl font-semibold text-gray-900 ">
                  {t("We recommend these pictures for")} <span className='notranslate'>{item.name} {item.CHI}</span>
                </h3>
                <button
                  onClick={handleModalGeneratePicClose}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center ">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("Close modal")}</span>
                </button>
              </div>
              <div className='p-4 pt-3 '>


                <div className="flex flex-wrap gap-2">
                  <label className="border border-gray-300 cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <input
                      type="file"
                      onChange={handleFileChangeAndUpload}
                      style={{ display: "none" }} // 隐藏文件输入框
                      translate="no"
                    />
                    <img
                      className=" h-[80px] w-[80px]  object-cover"
                      src={previewUrl || "https://via.placeholder.com/150"} // 占位图
                      alt="Uploaded preview"
                      loading="lazy"
                    />
                  </label>

                  {/* 固定图片 */}
                  <label className="border border-gray-300 cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      className=" h-[80px] w-[80px]  object-cover"
                      src="https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/eaac003d-724b-483e-ac29-d44db0513600/public"
                      alt="Preset image"
                      loading="lazy"
                      onClick={() =>
                        selectPic(
                          "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public",
                          item
                        )
                      }
                    />
                  </label>
                  {imgGallery.map((gen_img, index) => (
                    <div
                      key={index}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="border rounded-lg h-[80px] w-[80px] cursor-pointer flex-shrink-0"
                    >
                      <div className="h-min overflow-hidden rounded-md">
                        <img
                          loading="lazy"
                          className="h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-t-lg"
                          src={gen_img}
                          onClick={() => {
                            selectPic(gen_img, item);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>


              </div>


            </div>
          </div>
        </div>
      )}
      <div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        key={""}
        className="">

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <div
            style={{
              width: '80px',
            }}>
            <label className='cursor-pointer'
              style={{ display: 'block', width: '100%' }}
            >
              <img
                className="h-[80px] w-[80px] transition-all object-cover rounded-md"
                src={item.image}
                loading="lazy"
                onClick={() => {
                  handleModalGeneratePicOpen();
                  generatePic(item);
                }}
              />
            </label>
          </div>

          <div style={{ width: 'calc(100% - 80px)' }}>  {/* adjust width */}
            <div className='text-md font-semibold '>

              <div className="mb-1 mt-1 ml-2 flex  items-center">
                <input
                  className='text-md font-semibold'
                  type="text"
                  name="name"
                  placeholder={item.name}
                  value={item?.name}
                  onChange={(e) => {
                    updateItem(item.id, { ...item, name: e.target.value })
                  }}
                  translate="no" />



                <span onClick={async () => {  // Auto Fill English
                  let translatedText = "";
                  if (item?.name) {
                    translatedText = item.name;
                  } else {
                    //console(item.name)
                    translatedText = item.name;
                  }
                  try {
                    const ChineseTranslation = await translateToChinese(translatedText);
                    updateItem(item.id, { ...item, CHI: ChineseTranslation })

                  } catch (error) {
                    console.error("Translation error:", error);
                  }
                }}
                  className={`cursor-pointer text-black ml-auto notranslate`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(CN)")}</span></span>

              </div>
              <div className="mb-1 flex ml-2 items-center">
                <input
                  className='text-md font-semibold'
                  type="text"
                  name="CHI"
                  placeholder={item.CHI}
                  value={item?.CHI}
                  onChange={(e) => {
                    updateItem(item.id, { ...item, CHI: e.target.value })
                  }}
                  translate="no"
                />


                <span onClick={async () => {  // Auto Fill English
                  let translatedText = "";
                  if (item?.CHI) {

                    translatedText = item.CHI;
                  } else {
                    translatedText = item.CHI;
                  }
                  try {
                    const EnglishTranslation = await translateToEnglish(translatedText);
                    updateItem(item.id, { ...item, name: EnglishTranslation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') })

                  } catch (error) {
                    console.error("Translation error:", error);
                  }

                }}
                  className={`cursor-pointer text-black ml-auto notranslate`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span className='notranslate'>&nbsp;{t("(EN)")}</span></span>

              </div>

            </div>
          </div>

        </div>
        <div className='d-block text-md font-semibold'>
          <div className='flex'>
            <div>
              <div>
                <span className='text-black'>
                  {t("Category: ")}
                </span>
                {selectedFoodType === "" ?
                  <input
                    className='text-md font-semibold'
                    style={{ width: "50%" }}
                    type="text"
                    name="category"
                    placeholder={item.category}
                    value={item?.category}
                    onChange={(e) => {
                      updateItem(item.id, { ...item, category: e.target.value })
                    }}
                    translate="no"
                  />
                  :
                  <span onClick={(e) => {
                    setCategoryModalOpen(true)
                  }} className='text-md font-semibold text-black' style={{ width: "50%" }} >{item.category}</span>
                }


              </div>
              <div>
                <span className='text-black'>
                  {t("Price: $ ")}

                </span>
                <input
                  className='text-md font-semibold'
                  style={{ width: "50%" }}
                  type="text"
                  name="subtotal"
                  placeholder={item.subtotal}
                  value={item?.subtotal}
                  onChange={(e) => {//To do: 这里需要一些防呆验证 for cases like说enter-1 或者2.33333 或者abc 或者空白
                    updateItem(item.id, { ...item, subtotal: e.target.value })
                  }}
                  translate="no"
                />
              </div>
              <div className='flex'>

                <input
                  className='form-check-input'
                  type="checkbox"
                  style={{ marginRight: "5px" }}
                  // Set checkbox state, treating undefined as false
                  checked={item?.isValid || false}
                  onChange={(e) => {
                    // Handle the change event to toggle the isFeatured state
                    const isChecked = e.target.checked;
                    console.log('Featured status:', isChecked);

                    // Assuming updateItem is a function to update the item in your state or backend
                    updateItem(item.id, { ...item, isValid: isChecked });
                  }}
                  translate="no"
                />
                {/* {fullItems.filter(item => item.isValid === true).length}
                {String(item.isValid)} */}
                <span className="font-size: 16px; font-weight: bold">
                  Currently Unavailable
                </span>
              </div>

              <div className="flex ">
                {item.category !== "Temporary Use" && fullItems.filter(item => item.isFeatured === true).length < 10 && item.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public"
                  ?
                  <div
                    className="custom-control custom-switch"
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  >
                    <input
                      className='form-check-input'
                      type="checkbox"
                      style={{ marginRight: "5px" }}
                      // Set checkbox state, treating undefined as false
                      checked={item?.isFeatured || false}
                      onChange={(e) => {
                        // Handle the change event to toggle the isFeatured state
                        const isChecked = e.target.checked;
                        console.log('Featured status:', isChecked);

                        // Assuming updateItem is a function to update the item in your state or backend
                        updateItem(item.id, { ...item, isFeatured: isChecked });
                      }}
                      translate="no"
                    />
                    {/* <span className='notranslate'>
                  {fullItems.filter(item => item.isFeatured === true).length}
                  {String(item.isFeatured)}
                </span> */}
                    <span className="font-size: 16px; font-weight: bold">Strongly recommend
                    </span>
                    <div>
                      <span className="font-size: 14px">You can add up to 10 strongly recommended food items with images.</span>
                    </div>

                    {/* <p>{fullItems.filter(item => item.isFeatured === true).length}</p> */}
                  </div>
                  :
                  item.isFeatured === true && item.image !== "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public" ? <div
                    className="custom-control custom-switch"
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  >
                    <input
                      className='form-check-input'
                      type="checkbox"
                      style={{ marginRight: "5px" }}
                      // Set checkbox state, treating undefined as false
                      checked={item?.isFeatured || false}
                      onChange={(e) => {
                        // Handle the change event to toggle the isFeatured state
                        const isChecked = e.target.checked;
                        console.log('Featured status:', isChecked);

                        // Assuming updateItem is a function to update the item in your state or backend
                        updateItem(item.id, { ...item, isFeatured: isChecked });
                      }}
                      translate="no"
                    />
                    {/* <span className='notranslate'>
                {fullItems.filter(item => item.isFeatured === true).length}
                {String(item.isFeatured)}
              </span> */}
                    <span className="font-size: 16px; font-weight: bold">Strongly recommend
                    </span>
                    <div>
                      <span className="font-size: 14px">You can add up to 10 strongly recommended food items with images.</span>
                    </div>

                    {/* <p>{fullItems.filter(item => item.isFeatured === true).length}</p> */}
                  </div> : <></>
                }
              </div>

            </div>

          </div>



          {expandDetails ? <div>

            <div>
              <p className="mb-1">
                <span className='text-black'>
                  {" Options:"}
                </span>
              </p>
              {expandOptions ? <div><div className='d-block text-md font-semibold'>
                <button onClick={() => setShowAdjustion(!showAdjustion)}
                  className="btn d-inline-flex d-inline-flex btn-sm btn-light">
                  Edit Dish Revision Category
                </button>
                {
                  showAdjustion ? (
                    <div>
                      <div className='flex'>

                        <span className='text-black'>
                          Dish Revise Category:&nbsp;

                        </span>
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          value={currentAttribute}
                          onChange={(e) => setCurrentAttribute(e.target.value)}
                          placeholder="Size"
                          translate="no"
                        />
                      </div>
                      <small className='text-blue-500'>default: 'Option'(E.g.: Portion Size)</small>
                    </div>
                  ) : null
                }


                <div className='flex'>

                  <span className='text-black'>
                    Dish Revise Details:&nbsp;

                  </span>

                  <input
                    className='text-md font-semibold'
                    style={{ width: "50%" }}
                    value={currentVariation.type}
                    onChange={(e) => setCurrentVariation({ ...currentVariation, type: e.target.value })}
                    placeholder="BG"
                    translate="no"
                  />
                </div>
                <small className='text-blue-500'>E.g.: Big</small>

                <div className='flex'>

                  <span className='text-black'>
                    {t("Price: $ ")}

                  </span>

                  <input
                    className='text-md font-semibold'
                    style={{ width: "50%" }}
                    value={currentVariation.price}
                    onChange={(e) => setCurrentVariation({ ...currentVariation, price: e.target.value })}
                    placeholder="1"
                    translate="no"
                  />
                </div>
                <div className='text-red-700'>
                  {priceFormatError && <span>{priceFormatError}</span>}

                </div>

              </div></div> : <div></div>}

              <div className='flex'>
                <a
                  onClick={() => {
                    if (!expandOptions) {
                      setExpandOptions(true);
                    } else {
                      resetAttributes(transformJsonToInitialState(item.attributesArr));// init
                      addOrUpdateAttributeVariation();
                    }
                  }}
                  className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-warning"
                >
                  <span>
                    {!expandOptions ? "Adjust Dish Revision Option" : "Confirm"}
                  </span>
                </a>
              </div>

              {Object.entries(item.attributesArr).map(([attributeName, attributeDetails]) => (
                <div key={attributeName}>
                  <p className="mb-1">
                    <span onClick={() => setCurrentAttribute(attributeName)} className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                      {attributeName} &nbsp;
                    </span>
                    <div className="custom-control custom-switch" style={{ display: "inline-block", verticalAlign: "middle" }}>

                      <input
                        className='form-check-input'
                        type="checkbox"
                        style={{ marginRight: "5px" }}
                        checked={!attributeDetails.isSingleSelected}
                        onChange={(e) => handleToggle(attributeName, !e.target.checked)}
                        translate="no"
                      />
                    </div>
                    {" Multi-Select"} { }
                  </p>

                  <div className='flex flex-wrap'>
                    {attributeDetails.variations.map((variation, idx) => (
                      <div>
                        <div key={idx}>
                          <div onClick={() => selectVariationForEdit(attributeName, variation)} className='mb-1 mr-1 mt-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                            {variation.type}({formatPriceDisplay(variation.price)})
                            <span onClick={() => deleteVariation(attributeName, idx)} style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                              <i className="fas fa-times"></i>
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))}


            </div>

            <div className='mb-3'>
              <p className="mb-1">
                <span className='text-black'>

                  Time Range Availability:
                </span>

              </p>
              <div className="flex">
                {['Morning', 'Afternoon', 'Evening'].map((period) => (
                  <div
                    key={period}
                    className={`mr-1 cursor-pointer relative rounded-lg px-2.5 h-8 flex items-center justify-center font-semibold text-xs leading-none tracking-wider uppercase text-black whitespace-nowrap ${item.availability.includes(period) ? 'bg-blue-200' : 'bg-white'
                      }`}
                    onClick={() => toggleOption(period)}
                  >
                    {period}
                    {item.availability.includes(period) && (
                      <span className="absolute top-0 right-0 cursor-pointer">
                        {/* Ensure FontAwesomeIcon component is correctly imported to use it here */}
                        <FontAwesomeIcon icon={faTimes} />
                      </span>
                    )}
                  </div>
                ))}
              </div>


            </div></div> : <div className='mb-2'></div>}



        </div>

        <div className={`flex justify-between`}>
          <a onClick={() => setExpandDetails(!expandDetails)} // Use an arrow function to toggle the state
            className="btn d-inline-flex d-inline-flex btn-sm btn-light">

            <span>
              {expandDetails ? "Hide Details" : "Edit Details"}
            </span>
          </a>

          <a onClick={() => {
            deleteFood_array(item.id);
            saveId(Math.random());
          }} className="btn d-inline-flex btn-sm btn-danger">
            <span className="pe-2">
              <i class="bi bi-trash"></i>
            </span>
            <span>
              {t("Delete")}
            </span>
          </a>
        </div>


      </div>

    </div>

  );
};




export default Food
