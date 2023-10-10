import React, { useState, useEffect, useRef } from 'react'
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

const Food = ({ store }) => {

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
  useEffect(() => {
    resetAttributes(transformJsonToInitialState({}));
  }, []);
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
  const [selectedFoodType, setSelectedFoodType] = useState(null);
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

  const tableValue = params.get('table') ? params.get('table').toUpperCase() : "";
  console.log(store)
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
    justifyContent: 'space-between',
  };
  const itemStyle = isMobile
    ? {
      minWidth: 'calc(100% - 10px)',
      margin: '5px',
      padding: '10px',
      paddingLeft: '0px',
      paddingRight: '0px',
      boxSizing: 'border-box',
    }
    : {
      minWidth: 'calc(50% - 10px)',
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
    alert("Saved Successful");

  };


  const syncData = async () => {
    console.log("sync data")

    let sessionData;

    try {
      // Get a reference to the specific document with ID equal to store
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

      // Fetch the document
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        // The document exists
        sessionData = docSnapshot.data().key;
        const { key, ...rest } = docSnapshot.data();
        localStorage.setItem("TitleLogoNameContent", JSON.stringify(rest));
        //alert("refreshed successfully")
        localStorage.setItem(store, sessionData);
        setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])
        setData(JSON.parse(sessionData)); // Update state
        setFoods(JSON.parse(sessionData))
        setArr(JSON.parse(sessionData));
        saveId(Math.random());

      } else {
        console.log("No document found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching the document:", error);
    }

  }


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
  const filterCHI = (CHI) => {
    setFoods(
      data.filter((item) => {
        return item.CHI.includes(CHI);
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

  const [input, setInput] = useState("");

  const handleSearchChange = (event) => {
    setInput(event.target.value);
    if (sessionStorage.getItem("Google-language")?.includes("Chinese")) {
      filterCHI(event.target.value);

    } else {
      filtername(event.target.value);

    }
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
    if (categoryState === null) {

    } else {
      setFoods(
        updatedArr.filter((item) => {
          return item.category === categoryState;
        })
      )
    }
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
  console.log(newItem)
  //modal
  const [TitleLogoNameContent, setTitleLogoNameContent] = useState(JSON.parse(localStorage.getItem("TitleLogoNameContent" || "[]")));
  useEffect(() => {

    setTitleLogoNameContent(JSON.parse(localStorage.getItem("TitleLogoNameContent")))
  }, [id]);



  const [arr, setArr] = useState(JSON.parse(localStorage.getItem(store) || "[]"));

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewItem({ ...newItem, [name]: value });
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
      name: newItem.name || "Blank",
      CHI: newItem.CHI || "空白的",
      subtotal: newItem.subtotal || "1",
      category: newItem.category || (categoryState === null ? "Classic" : categoryState),
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
    if (categoryState === null) {

    } else {
      setFoods(
        updatedArr.filter((item) => {
          return item.category === categoryState;
        })
      )
    }

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
  const [categoryState, setCategoryState] = useState(null);

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
    if (categoryState === null) {

    } else {
      setFoods(
        newItems.filter((item) => {
          return item.category === target_category;
        })
      )
    }
    //filterType(target_category)
    //console.log(target_category)
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
  const [isModalOpen, setModalOpen] = useState(false);
  const handleEditShopInfoModalOpen = () => {
    setModalOpen(true);
  };

  const handleEditShopInfoModalClose = () => {
    setModalOpen(false);
  };

  /**scanner */

  //Instruction:
  //Click on the image to change:
  //
  useEffect(() => {
    //console.log("hellooooooooooooooooooooo")
    syncData();
    //syncData();
  }, []);
  return (

    <div className='max-w-[1597px] '>
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-xxz5vNXM/dz2Uk5KA02wmbzm9KpPL5Sgt1JwBrJZ4tUfS5B/R5F/h5A5J7J5C5P9i" crossorigin="anonymous" />

      </Helmet>


      <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
      </link>
      <div className="mr-1 flex justify-between mt-3">
        <Scanner reload={reload} setFoods={setFoods} store={store} />

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
      <div onClick={() => {
        syncData();
        //syncData();
      }}
        className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-neutral">

        <span>
          <i class="fa fa-refresh"></i> Refresh Data                     </span>
      </div>


      <div className='m-auto '>
        <div className='hstack gap-2  mt-2'>
          <form className="w-full w-lg-full">
            <div className='input-group input-group-sm input-group-inline shadow-none'>
              <span className='input-group-text pe-2 rounded-start-pill'>
                <i className='bi bi-search'></i>
              </span>
              <input class="form-control text-sm shadow-none rounded-end-pill" placeholder="Search for items..." onChange={handleSearchChange}>
              </input>
            </div>
          </form >
        </div>

        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type' >

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
                      <span className='text-black'>

                        {t("Dish:")}&nbsp;
                      </span>

                      <input
                        className='text-md font-semibold'
                        style={{ width: "50%" }}
                        type="text"
                        name="name"
                        placeholder={t("Blank")}
                        value={newItem.name}
                        onChange={handleInputChange}
                      />
                      <span onClick={async () => {  //Auto Fill Chinese
                        let translatedText = "Blank";
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
                        className={`cursor-pointer text-black ml-auto`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(CN)")}</span></span>

                    </div>
                    <div className="mb-1 ml-2 flex  items-center">
                      <span className='text-black'>

                        {t("菜品:")}&nbsp;
                      </span>
                      <input
                        className='text-md font-semibold'
                        style={{ width: "40%" }}
                        type="text"
                        name="CHI"
                        placeholder={"空白的"}
                        value={newItem.CHI}
                        onChange={handleInputChange}
                      />

                      <span onClick={async () => {  // Auto Fill English
                        let translatedText = "空白的";
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
                        className={`cursor-pointer text-black ml-auto`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(EN)")}</span></span>

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
                        type="text" name="category" placeholder={(categoryState === null ? "Classic" : categoryState)} value={newItem.category} onChange={handleInputChange} />

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
                      />
                    </div>
                  </div>

                </div>


                {expandDetails ? <>

                  <div>
                    <p className="mb-1">
                      <span className='text-black'>
                        {" Options:"}
                      </span>
                    </p>
                    {expandOptions ? <><div className='d-block text-md font-semibold'>
                      <div className='flex'>

                        <span className='text-black'>
                          {t("Attributes Type: ")}

                        </span>
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          value={currentAttribute}
                          onChange={(e) => setCurrentAttribute(e.target.value)}
                          placeholder=" Size"
                        />                </div>

                      <div className='flex'>

                        <span className='text-black'>
                          {t("Variation Type: ")}

                        </span>
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          value={currentVariation.type}
                          onChange={(e) => setCurrentVariation({ ...currentVariation, type: e.target.value })}
                          placeholder=" Big"
                        />                </div>

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
                        />
                      </div>
                      <div className='text-red-700'>
                        {priceFormatError && <span>{priceFormatError}</span>}

                      </div>

                    </div></> : <></>}

                    <div className='flex'>
                      <a
                        onClick={() => {
                          if (!expandOptions) {
                            setExpandOptions(true);
                          } else {
                            addOrUpdateAttributeVariation();
                          }
                        }}
                        className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-light"
                      >
                        <span>
                          {"Add or Update Option"}
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
                            />
                          </div>
                          {" Multi-Select"} { }
                        </p>

                        <div className='flex flex-wrap'>
                          {attributeDetails.variations.map((variation, idx) => (
                            <>
                              <div key={idx}>
                                <div onClick={() => selectVariationForEdit(attributeName, variation)} className='mb-1 mr-1 mt-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                                  {variation.type}({formatPriceDisplay(variation.price)})
                                  <span onClick={() => deleteVariation(attributeName, idx)} style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                                    <i className="fas fa-times"></i>
                                  </span>
                                </div>
                              </div>

                            </>
                          ))}
                        </div>

                      </div>
                    ))}


                  </div>

                  <div className='mb-3'>
                    <p className="mb-1">
                      <span className='text-black'>

                        {"Availability:"}
                      </span>

                    </p>
                    <div className='flex'>

                      <div className='mr-1 cursor-pointer'
                        onClick={() => toggleOption('Morning')}
                        style={{ position: 'relative', background: selectedOptions.includes('Morning') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Morning
                        {selectedOptions.includes('Morning') && (
                          <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faTimes} />
                          </span>
                        )}
                      </div>
                      <div className='mr-1 cursor-pointer'
                        onClick={() => toggleOption('Afternoon')}

                        style={{ position: 'relative', background: selectedOptions.includes('Afternoon') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Afternoon
                        {selectedOptions.includes('Afternoon') && (
                          <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faTimes} />
                          </span>
                        )}
                      </div>

                      <div className='mr-1 cursor-pointer'
                        onClick={() => toggleOption('Evening')}
                        style={{ position: 'relative', background: selectedOptions.includes('Evening') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Evening
                        {selectedOptions.includes('Evening') && (
                          <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faTimes} />
                          </span>
                        )}
                      </div>
                    </div>

                  </div></> :
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


                  <a onClick={handleAddNewItem} className="btn d-inline-flex btn-sm btn-success">
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
          {foods.map((item, index) => (
            <div style={itemStyle}>
              <Item key={index} translateToChinese={translateToChinese} translateToEnglish={translateToEnglish} item={item} updateItem={updateItem} deleteFood_array={deleteFood_array} id={id} saveId={saveId} />

            </div>
          ))}

        </div>

      </div>
    </div >
  )
}



const Item = ({ item, updateItem, deleteFood_array, saveId, id, translateToEnglish, translateToChinese }) => {

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
    console.log('Attributes updated:', item);
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
  useEffect(() => {

    resetAttributes(transformJsonToInitialState(item.attributesArr));// init
  }, []);

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
      console.log(option)
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
      const resultCHI = await myFunction({ name: item.CHI });
      const result = await myFunction({ name: item.name });
      let ARRimageCHI = resultCHI.data.result
      let ARRimage = result.data.result

      setImgGallery(ARRimage.concat(ARRimageCHI))
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

  return (
    <>
      {isModalGeneratePicOpen && (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl max-h-full ">
            <div className="relative bg-white rounded-lg border-black shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("We recommend these pictures...")}
                </h3>
                <button
                  onClick={handleModalGeneratePicClose}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("Close modal")}</span>
                </button>
              </div>
              <div className='p-4 pt-3 flex justify-between'>
                <div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="border rounded-lg h-[80px] w-[80px] cursor-pointer"
                  // The inline style for motion.div changes based on isMobile
                  style={
                    isMobile
                      ? { display: "block", margin: "auto" }
                      : {}
                  }
                >
                  <label
                    className=''
                    style={{ backgroundColor: "rgba(246,246,248,1)" }}>
                    <input
                      type="file"
                      onChange={handleFileChangeAndUpload}
                      style={{ display: 'none' }} // hides the input
                    />
                    <img
                      className=" h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-t-lg"
                      src={previewUrl} // you can use a default placeholder image
                      loading="lazy"
                    />
                  </label>
                </div>
                {imgGallery.slice(0, 3).map(gen_img => (
                  <div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="border rounded-lg h-[80px] w-[80px] cursor-pointer"
                    // The inline style for motion.div changes based on isMobile
                    style={
                      isMobile
                        ? { display: "block", margin: "auto", marginTop: "10px" }
                        : {}
                    }
                  >
                    <div className="h-min overflow-hidden rounded-md">
                      <img loading="lazy" className=" h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-t-lg" src={gen_img}
                        onClick={() => {
                          selectPic(gen_img, item)
                        }}
                      />
                    </div>
                  </div>
                ))}

              </div>
              <div className='p-4 pt-3 flex justify-between'>
                {imgGallery.slice(3, 7).map(gen_img => (
                  <div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="border rounded-lg h-[80px] w-[80px] cursor-pointer"
                    // The inline style for motion.div changes based on isMobile
                    style={
                      isMobile
                        ? { display: "block", margin: "auto", marginTop: "10px" }
                        : {}
                    }
                  >
                    <div className="h-min overflow-hidden rounded-md">
                      <img loading="lazy" className=" h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-t-lg" src={gen_img}
                        onClick={() => {
                          selectPic(gen_img, item)
                        }}
                      />
                    </div>
                  </div>
                ))}
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
            <div className='text-md font-semibold'>

              <div className="mb-1 ml-2 flex  items-center">
                <input
                  className='text-md font-semibold'
                  type="text"
                  name="name"
                  placeholder={item.name}
                  value={item?.name}
                  onChange={(e) => {
                    updateItem(item.id, { ...item, name: e.target.value })
                  }} />



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
                  className={`cursor-pointer text-black ml-auto`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(CN)")}</span></span>

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
                  className={`cursor-pointer text-black ml-auto`} style={{ display: 'flex', alignItems: 'center', position: 'relative', background: 'rgb(244, 229, 208)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-translate" viewBox="0 0 16 16"><path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022H6.18z" /><path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" /></svg><span>&nbsp;{t("(EN)")}</span></span>

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
                />

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
                />
              </div>
            </div>

          </div>



          {expandDetails ? <>

            <div>
              <p className="mb-1">
                <span className='text-black'>
                  {" Options:"}
                </span>
              </p>
              {expandOptions ? <><div className='d-block text-md font-semibold'>
                <div className='flex'>

                  <span className='text-black'>
                    {t("Attributes Type: ")}

                  </span>
                  <input
                    className='text-md font-semibold'
                    style={{ width: "50%" }}
                    value={currentAttribute}
                    onChange={(e) => setCurrentAttribute(e.target.value)}
                    placeholder="Size"
                  />                </div>

                <div className='flex'>

                  <span className='text-black'>
                    {t("Variation Type: ")}

                  </span>
                  <input
                    className='text-md font-semibold'
                    style={{ width: "50%" }}
                    value={currentVariation.type}
                    onChange={(e) => setCurrentVariation({ ...currentVariation, type: e.target.value })}
                    placeholder="BG"
                  />                </div>

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
                  />
                </div>
                <div className='text-red-700'>
                  {priceFormatError && <span>{priceFormatError}</span>}

                </div>

              </div></> : <></>}

              <div className='flex'>
                <a
                  onClick={() => {
                    if (!expandOptions) {
                      setExpandOptions(true);
                    } else {
                      addOrUpdateAttributeVariation();
                    }
                  }}
                  className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-light"
                >
                  <span>
                    {"Add or Update Option"}
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
                      />
                    </div>
                    {" Multi-Select"} { }
                  </p>

                  <div className='flex flex-wrap'>
                    {attributeDetails.variations.map((variation, idx) => (
                      <>
                        <div key={idx}>
                          <div onClick={() => selectVariationForEdit(attributeName, variation)} className='mb-1 mr-1 mt-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                            {variation.type}({formatPriceDisplay(variation.price)})
                            <span onClick={() => deleteVariation(attributeName, idx)} style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                              <i className="fas fa-times"></i>
                            </span>
                          </div>
                        </div>

                      </>
                    ))}
                  </div>

                </div>
              ))}


            </div>

            <div className='mb-3'>
              <p className="mb-1">
                <span className='text-black'>

                  {"Availability:"}
                </span>

              </p>
              <div className='flex'>

                <div className='mr-1 cursor-pointer'
                  onClick={() => toggleOption('Morning')}
                  style={{ position: 'relative', background: item.availability.includes('Morning') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                  Morning
                  {item.availability.includes('Morning') && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>
                <div className='mr-1 cursor-pointer'
                  onClick={() => toggleOption('Afternoon')}

                  style={{ position: 'relative', background: item.availability.includes('Afternoon') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                  Afternoon
                  {item.availability.includes('Afternoon') && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>

                <div className='mr-1 cursor-pointer'
                  onClick={() => toggleOption('Evening')}
                  style={{ position: 'relative', background: item.availability.includes('Evening') ? 'rgb(208, 229, 253)' : 'white', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                  Evening
                  {item.availability.includes('Evening') && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>
              </div>

            </div></> : <div className='mb-2'></div>}



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

    </>

  );
};


export default Food


