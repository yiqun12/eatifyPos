import React, { useState, useEffect, useRef } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import $ from 'jquery';
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { FiSearch } from 'react-icons/fi';

import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import './admin_food.css';
import Scanner from './ScanMenu';
import Checklist from '../pages/Checklist'
import { query, where, limit } from "firebase/firestore";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useUserContext } from "../context/userContext";
import add_image from '../components/add_image.png';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Food = ({ store }) => {

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
  //const  store  = params.get('store') ? params.get('store').toLowerCase() : "";
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
      flex: 1,
      minWidth: 'calc(100% - 10px)',
      margin: '5px',
      padding: '10px',
      paddingLeft: '0px',
      paddingRight: '0px',
      boxSizing: 'border-box',
    }
    : {
      flex: 1,
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

  async function updateKey() {
    // Reference to the specific document
    const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

    //const docRef = doc(db, "stripecustoemr", uid, "titlelogonameconet", store);

    // Update the 'key' field to the value 1
    await updateDoc(docRef, {
      key: localStorage.getItem(store)
    });
  }


  const syncData = async () => {

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
      } else {
        console.log("No document found with the given ID.");
      }
    } catch (error) {
      console.error("Error fetching the document:", error);
    }


    if (sessionData) {
      localStorage.setItem(store, sessionData);
      setData(JSON.parse(sessionData)); // Update state
      setFoods(JSON.parse(sessionData))
      saveId(Math.random());
      setArr(JSON.parse(sessionData));
      setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])
    } else {
      setData(JSON.parse(sessionData)); // Update state
      setFoods(JSON.parse(sessionData))
      saveId(Math.random());
      setArr(JSON.parse(sessionData));
      setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])
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
    if (translationsMode_ === "ch") {
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
    Priority: "",
    categoryCHI: ""
  });
  //modal
  const [TitleLogoNameContent, setTitleLogoNameContent] = useState(JSON.parse(localStorage.getItem("TitleLogoNameContent" || "[]")));
  useEffect(() => {

    setTitleLogoNameContent(JSON.parse(localStorage.getItem("TitleLogoNameContent")))
  }, [id]);

  useEffect(() => {
    syncData()
  }, []);

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
      name: newItem.name || "Empty",
      CHI: newItem.CHI || "空的",
      subtotal: newItem.subtotal || "1",
      category: newItem.category || (categoryState === null ? "Classic" : categoryState),
      categoryCHI: newItem.categoryCHI || "类别",
      Priority: newItem.Priority || "9999"
    };

    // Add the new item to the array
    let updatedArr = [newItemWithPlaceholders, ...arr];
    reload(updatedArr)
    if (categoryState === null) {

    } else {
      setFoods(
        updatedArr.filter((item) => {
          return item.category === categoryState;
        })
      )
    }
    // Clear the input fields
    setNewItem({
      name: "",
      CHI: "",
      image: "",
      subtotal: "",
      category: "",
      Priority: "",
      categoryCHI: ""
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

  const [previewUrl, setPreviewUrl] = useState(add_image);

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
        //setInputData({ ...inputData, image: data.result.variants[0] })
        //console.log(item)
        //updateItem(item.id, { ...inputData, image: data.result.variants[0] })
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

  const handleClickName = async (e) => {
    e.preventDefault();
    console.log(e.target.name.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    updateDoc(docRef, { Name: e.target.name.value })
      .then(() => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log(newData)
        newData[0].Name = e.target.name.value
        localStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
        saveId(Math.random());
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });

  }
  const handleClickAddress = async (e) => {
    e.preventDefault();
    console.log(e.target.address.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    updateDoc(docRef, { Address: e.target.address.value })
      .then(() => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log(newData)
        newData[0].Address = e.target.address.value
        localStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
        saveId(Math.random());
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });


  }

  /**scanner */

  //Instruction:
  //Click on the image to change:
  //

  return (

    <div className='max-w-[1597px] '>
      <Helmet>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Helmet>

      {isModalOpen && (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center mt-20">
          <div className="relative w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Edit Shop Info")}
                </h3>
                <button
                  onClick={handleEditShopInfoModalClose}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                  </svg>
                  <span className="sr-only">{t("Close modal")}</span>
                </button>
              </div>
              <div className='px-4'>

                <form onSubmit={handleClickName} style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label={TitleLogoNameContent.Name}
                    name="name"
                    autoComplete="name"
                    autoFocus
                    style={{ width: "50%" }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{ width: "50%", marginLeft: "5%", height: "56px" }}
                  >
                    {t("Update Name")}
                  </Button>
                </form>

                <form onSubmit={handleClickAddress} style={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="address"
                    label={TitleLogoNameContent.Address}
                    name="address"
                    autoComplete="address"
                    autoFocus
                    style={{ width: "50%" }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{ width: "50%", marginLeft: "5%", height: "56px" }}
                  >
                    {t("Update Address")}
                  </Button>
                </form>

              </div>
              <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              </div>
            </div>
          </div>
        </div>
      )}
      <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
      </link>
      <div className="flex justify-between mt-3">
        <Scanner setFoods={setFoods} store={store} />

        <a href="#" className="btn d-inline-flex btn-sm btn-primary mx-1">
          <span className="pe-2">
            <i class="bi bi-bookmarks"></i>
          </span>
          <span onClick={updateKey()}>
            {"Save Changes"}
          </span>
        </a>
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
            {/* <div className='flex justify-between flex-wrap'> */}



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
          <div style={containerStyle}>
            <div style={itemStyle}>


              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={""}
                className="duration-500">

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: '70px',
                  }}>
                    <label className=''
                      style={{ backgroundColor: "rgba(246,246,248,1)", display: 'block', width: '100%' }}

                    >
                      <input
                        type="file"
                        onChange={handleFileChangeAndUpload}
                        style={{ display: 'none' }} // hides the input
                      />

                      <img
                        className="h-[70px] w-[70px] transition-all duration-500 object-cover rounded-md"
                        src={previewUrl}
                        loading="lazy"
                      />
                    </label>
                  </div>

                  <div style={{ width: 'calc(100% - 70px)' }}>  {/* adjust width */}
                    <div className='ml-2 text-md font-semibold'>

                      <div className="mb-1 flex  items-center">
                        {t("Dish:")}&nbsp;
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          type="text"
                          name="name"
                          placeholder={t("Empty")}
                          value={newItem.name}
                          onChange={handleInputChange}
                        />
                        <span
                          style={{ cursor: "pointer", backgroundColor: "#ffc05e", marginTop: "2px", marginBottom: "5px" }}//blue
                          className={`task-card__tag task-card__tag--marketing ${isMobile ? 'ml-auto' : ''}`}
                          onClick={async () => {  //Auto Fill Chinese
                            let translatedText = "Empty";
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

                        >{t("Fill (CH)")}</span>
                      </div>
                      <div className="mb-1 flex  items-center">
                        {t("菜品:")}&nbsp;
                        <input
                          className='text-md font-semibold'
                          style={{ width: "50%" }}
                          type="text"
                          name="CHI"
                          placeholder={"空的"}
                          value={newItem.CHI}
                          onChange={handleInputChange}
                        />
                        <span
                          style={{ cursor: "pointer", backgroundColor: "#ffc05e", marginTop: "2px", marginBottom: "5px" }}//blue
                          className={`task-card__tag task-card__tag--marketing ${isMobile ? 'ml-auto' : ''}`}

                          onClick={async () => {  // Auto Fill English
                            let translatedText = "空的";
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
                        >{t("Fill (EN)")}</span>
                      </div>

                    </div>
                  </div>

                </div>
                <div className='ml-2 d-block text-md font-semibold'>
                  <div>
                    {t("Category: ")}
                    <input
                      className='text-md font-semibold'
                      style={{ width: "50%" }}
                      type="text" name="category" placeholder={(categoryState === null ? "Classic" : categoryState)} value={newItem.category} onChange={handleInputChange} />

                  </div>
                  <div>

                    {t("Price: $ ")}
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

                  <p className="mb-1">
                    {"Priority"}:{" "}
                    <input
                      className='text-md font-semibold'
                      style={{ width: "50%" }}
                      type="text"
                      name="Priority"
                      placeholder={"9999"}
                      value={newItem.Priority}
                      onChange={handleInputChange}
                    />
                  </p>
                  <div>
                    <p className="mb-1">
                      {"Availability:"}
                    </p>
                    <div className='flex'>
                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        All Day
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faTimes} />
                        </span>
                      </div>
                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Morning
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faTimes} />
                        </span>
                      </div>
                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Afternoon
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faTimes} />
                        </span>
                      </div>

                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        Evening
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faTimes} />
                        </span>
                      </div>
                    </div>

                  </div>
                  <div>
                    <p className="mb-1">
                      {"Attributes:"}
                    </p>
                    <div className='flex mb-2'>
                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(213, 245, 224)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        {"Sm(-2)"}
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <i className="fas fa-times"></i>
                        </span>
                      </div>
                      <div className='mr-1' style={{ position: 'relative', background: 'rgb(213, 245, 224)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        {"Mid(0)"}
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <i className="fas fa-times"></i>
                        </span>
                      </div>

                      <div className='mr-1 ' style={{ position: 'relative', background: 'rgb(213, 245, 224)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                        {"Bg(+2)"}
                        <span style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                          <i className="fas fa-times"></i>
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
                
                <div className={`flex ${isMobile ? 'justify-between' : ''}`}>
                  <div>
                    <span

                      style={{ cursor: "pointer" }}
                      className="task-card__tag mb-2 ml-2 task-card__tag--marketing"
                      onClick={handleAddNewItem}
                    >
                      {t("Add New")}
                    </span>
                  </div>
                  {!isMobile?
                                    <div style={{width: 'calc(50% - 13px)'}}>
                                    </div>:<></>
                  }


                  <div className='justify-end'>
                    <span
                      style={{ cursor: 'pointer', backgroundColor: "#ffc05e", }}

                      className="task-card__tag task-card__tag--design"
                    >
                      {t("Edit Details")}
                    </span>
                  </div>

                </div>


              </motion.div>
            </div>
            {foods.map((item, index) => (
              <div style={itemStyle}>
                <Item key={index} translateToChinese={translateToChinese} translateToEnglish={translateToEnglish} item={item} updateItem={updateItem} deleteFood_array={deleteFood_array} saveId={saveId} />

              </div>


            ))}

          </div>

        </AnimatePresence>
      </div>
    </div >
  )
}



const Item = ({ item, updateItem, deleteFood_array, saveId, translateToEnglish, translateToChinese }) => {
  const [imgGallery, setImgGallery] = useState([]);
  const [isGenChi, setGenChi] = useState(false);
  const [isModalGeneratePicOpen, setModalGeneratePicOpen] = useState(false);
  const [inputData, setInputData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(add_image)

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
        setInputData({ ...inputData, image: data.result.variants[0] })
        //console.log(item)
        updateItem(item.id, { ...inputData, image: data.result.variants[0] })
        //setUploadStatus('Image uploaded successfully.');
      } else {
        //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
      }
    } catch (error) {
      //setUploadStatus(`Error: ${error.message}`);
    }
  };
  const generatePic = async (pic_name) => {
    //console.log(isGenChi)
    //console.log(pic_name)
    setPreviewUrl(add_image)
    try {
      const myFunction = firebase.functions().httpsCallable('generatePic');
      const result = await myFunction({ name: pic_name });
      setImgGallery(result.data.result)
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
    setInputData({ ...inputData, image: pic_url })
    //console.log(item)
    updateItem(item.id, { ...inputData, image: pic_url })
    handleModalGeneratePicClose()
    //updateItem({ ...inputData, image: pic_url })
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
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center mt-20">
          <div className="relative w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("Here are the images we've selected for you")}
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
              <div className='p-4 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-3'>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="border rounded-lg duration-500 cursor-pointer">


                  <label className=''
                    style={{ backgroundColor: "rgba(246,246,248,1)" }}>
                    <input
                      type="file"
                      onChange={handleFileChangeAndUpload}
                      style={{ display: 'none' }} // hides the input
                    />

                    <img
                      className=" h-[70px] md:h-[90px] w-[70px] md:w-[90px] hover:scale-125 transition-all duration-500 cursor-pointer object-cover rounded-t-lg"
                      src={previewUrl} // you can use a default placeholder image
                      loading="lazy"
                    />
                  </label>


                </motion.div>
                {imgGallery.slice(0, -1).map(gen_img => (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="border rounded-lg duration-500 cursor-pointer">
                    <div className="h-min overflow-hidden rounded-md">
                      <img loading="lazy" className=" h-[70px] md:h-[90px] w-[70px] md:w-[90px] hover:scale-125 transition-all duration-500 cursor-pointer  object-cover rounded-t-lg " src={gen_img}
                        onClick={() => {
                          selectPic(gen_img, item)
                        }}
                      />
                    </div>
                  </motion.div>
                ))
                }

              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  className="block text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  style={{ display: "inline-block", marginBottom: "20px" }}
                  onClick={() => {
                    if (isGenChi) {
                      generatePic(item.CHI);
                      setGenChi(false);
                    } else {
                      generatePic(item.name);
                      setGenChi(true);
                    }
                  }}
                >
                  {isGenChi ? t("New pictures for ") + item.CHI : t("New pictures for ") + item.name}

                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        key={item.id}
        className="duration-500 cursor-pointer">
        <div className='flex'>
          <div className="overflow-hidden rounded-md">
            <img loading="lazy" className="h-[70px] md:h-[90px] w-[70px] md:w-[90px] mt-3 transition-all duration-500 object-cover rounded-md" src={item.image}
              onClick={() => {
                handleModalGeneratePicOpen();
                if (isGenChi) {
                  generatePic(item.CHI);
                  setGenChi(false);
                } else {
                  generatePic(item.name);
                  setGenChi(true);
                }
                //setInputData(null); // reset input data
              }}
            />
          </div>
          <div >
            <div className='flex justify-between px-2 py-2 pb-1 w-full'>
              <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className='flex'>
                  <div style={{ width: "50%" }}>
                    <p className=' mb-1'>
                      <input
                        type="text"
                        name="name"
                        placeholder={item.name}
                        value={inputData?.name !== undefined ? inputData.name : item.name}
                        onChange={(e) => setInputData({ ...inputData, name: e.target.value })}
                      />
                    </p>
                  </div>

                  <div className="flex justify-end" style={{ "width": "50%" }}>
                    <span
                      style={{ cursor: "pointer", backgroundColor: "#6C757D", marginTop: "2px", marginBottom: "5px" }}
                      className="task-card__tag task-card__tag--marketing"
                      onClick={async () => {  // Auto Fill English
                        let translatedText = "";
                        if (inputData?.name) {
                          //console(inputData?.name)
                          translatedText = inputData.name;
                        } else {
                          //console(item.name)
                          translatedText = item.name;
                        }
                        try {
                          const ChineseTranslation = await translateToChinese(translatedText);
                          setInputData({ ...inputData, CHI: ChineseTranslation });
                          updateItem(item.id, { ...inputData, CHI: ChineseTranslation })

                        } catch (error) {
                          console.error("Translation error:", error);
                        }
                      }}
                    >{t("Fill (CN)")}</span>
                  </div>

                </div>

                <div className='flex'>
                  <div style={{ width: "50%" }} >
                    <input
                      type="text"
                      name="CHI"
                      placeholder={item.CHI}
                      value={inputData?.CHI !== undefined ? inputData.CHI : item.CHI}
                      onChange={(e) => setInputData({ ...inputData, CHI: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end" style={{ "width": "50%" }}>

                    <span
                      style={{ cursor: "pointer", backgroundColor: "#6C757D", marginTop: "2px", marginBottom: "5px" }}
                      className="task-card__tag task-card__tag--marketing"

                      onClick={async () => {  // Auto Fill English
                        let translatedText = "";
                        if (inputData?.CHI) {

                          translatedText = inputData.CHI;
                        } else {
                          translatedText = item.CHI;
                        }
                        try {
                          const EnglishTranslation = await translateToEnglish(translatedText);
                          setInputData({ ...inputData, name: EnglishTranslation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') });
                          updateItem(item.id, { ...inputData, name: EnglishTranslation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') })

                        } catch (error) {
                          console.error("Translation error:", error);
                        }

                      }}
                    >{t("Fill (EN)")}</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>


        <div className='mr-2 ml-2 mt-2'>

          <div className='flex'>
            <div style={{ "width": "50%" }}>

              <p className='mb-1'>{t("Category")}:
                <input
                  style={{ width: "50%" }}
                  type="text"
                  name="category"
                  placeholder={item.category}
                  value={inputData?.category !== undefined ? inputData.category : item.category}
                  onChange={(e) => setInputData({ ...inputData, category: e.target.value })}
                />
              </p>
            </div>

          </div>

          <p className='mb-1'>{t("Priority")}:
            <input
              style={{ width: "50%" }}
              type="text"
              name="Priority"
              placeholder={item.Priority}
              value={inputData?.Priority !== undefined ? inputData.Priority : item.Priority}
              onChange={(e) => setInputData({ ...inputData, Priority: e.target.value })}
            />
          </p>
          <p className='mb-1'>{t("Price: $ ")}
            <input
              style={{ width: "50%" }}
              type="text"
              name="subtotal"
              placeholder={item.subtotal}
              value={inputData?.subtotal !== undefined ? inputData.subtotal : item.subtotal}
              onChange={(e) => setInputData({ ...inputData, subtotal: e.target.value })}
            />
          </p>
          <div className='flex' >
            <span
              style={{ cursor: 'pointer' }}
              className="task-card__tag  mb-2  task-card__tag--marketing"
              onClick={() => {
                updateItem(item.id, inputData);
                setInputData(null); // reset input data
              }}
            >
              {t("Update")}
            </span>
            <span
              onClick={() => {
                deleteFood_array(item.id);
                saveId(Math.random());
              }}
              style={{ marginLeft: "auto", cursor: 'pointer' }}
              className="task-card__tag task-card__tag--design"
            >
              {t("Delete")}
            </span>
          </div>
        </div>

      </motion.div>
    </>

  );
};


export default Food



