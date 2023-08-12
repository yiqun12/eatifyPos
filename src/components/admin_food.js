import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import $ from 'jquery';
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

const Food = () => {

  
  if (!localStorage.getItem("food_arrays") || localStorage.getItem("food_arrays") === "") {
    localStorage.setItem("food_arrays", "[]");
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
  const [data, setData] = useState(JSON.parse(localStorage.getItem("food_arrays") || "[]"));
  useEffect(() => {
  }, [id]);
  const [TitleLogoNameContent, setTitleLogoNameContent] = useState(JSON.parse(sessionStorage.getItem("TitleLogoNameContent" || "[]"))[0]);
  useEffect(() => {
    // Get data from localStorage when component mounts
    const storedData = JSON.parse(localStorage.getItem("food_arrays") || "[]");
    setData(storedData);
    setTitleLogoNameContent(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0])
  }, [id]);


  const syncData = () => {
    const sessionData = sessionStorage.getItem("Food_arrays");
    if (sessionData) {
      localStorage.setItem("food_arrays", sessionData);
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

  const handleSearchChange = (event) => {
    setInput(event.target.value);
    filtername(event.target.value);
  }
  // timesClicked is an object that stores the number of times a item is clicked
  //const timesClicked = new Map();


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
  //const foodTypes = ['burger', 'pizza', 'salad', 'chicken'];
  //      <b style={{fontSize:"20px",color: 'red'}}>ATTENTION: YOU ARE IN ADMIN MODE!</b>
  const [foodTypes, setFoodTypes] = useState([...new Set(JSON.parse(localStorage.getItem("food_arrays") || "[]").map(item => item.category))]);
  //console.log(JSON.parse(localStorage.getItem("food_arrays")))



  const [isModalOpen, setModalOpen] = useState(false);

  const handleEditShopInfoModalOpen = () => {
    setModalOpen(true);
  };

  const handleEditShopInfoModalClose = () => {
    setModalOpen(false);
  };
  const handleClickLogo = async (e) => {
    e.preventDefault();
    console.log(e.target.logo.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    updateDoc(docRef, { Logo: e.target.logo.value })
      .then(() => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log(newData)
        newData[0].Logo = e.target.logo.value
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
        saveId(Math.random());
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });


  }
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
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
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
        sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
        saveId(Math.random());
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });


  }
  function deleteById(arr, id) {
    return arr.filter(item => item.id !== id);
  }
  const deleteFood_array = async (id) => {
    console.log(id)
    let updatedArr = deleteById(JSON.parse(localStorage.getItem("food_arrays") || "[]"), id)

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
    Priority: ""
  });

  const [arr, setArr] = useState(JSON.parse(localStorage.getItem("food_arrays") || "[]"));

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
      image:previewUrl,
      name: newItem.name || "Cuisine Name",
      CHI: newItem.CHI || "菜品名称",
      subtotal: newItem.subtotal || "$0",
      category: newItem.category || (categoryState === null ? "Popular" : categoryState),
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
      image:"",
      subtotal: "",
      category: "",
      Priority: ""
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
    localStorage.setItem("food_arrays", JSON.stringify(updatedArr))
    saveId(Math.random());
    setFoodTypes([...new Set(updatedArr.map(item => item.category))])
  }

const [previewUrl, setPreviewUrl] = useState("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/62c46944-13ab-4dac-0f3d-1cde91df8100/public")

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


  //Instruction:
  //Click on the image to change:
  //

  return (

    <div>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      <div className='max-w-[1000px] m-auto px-4 '>
        {isMobile ? TitleLogoNameContent.Address : ""}
        <div className='flex mb-1' >
          <b style={{ fontSize: "20px", color: 'blue', marginTop: "5px" }}>{t("READ THE INSTRUCTION")}</b>
        </div>

        <div className='flex'>
          <button
            onClick={handleEditShopInfoModalOpen}
            className="block text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg gray-sm px-3.5 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            type="button">
            {t("Edit Shop Info")}
          </button>
          <button
            className="block text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            style={{ marginLeft: "auto", display: "inline-block" }}>
            {t("Scan Menu")}
          </button>

        </div>
        <div className='flex mt-2'>

          <button
            onClick={() => {
              syncData();
              saveId(Math.random());

            }}
            className="block text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            style={{ display: "inline-block" }}>
            {t("Sync Menu")}
          </button>
          <button
            className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            style={{ marginLeft: "auto", display: "inline-block" }}>
            {t("Save Changes")}
          </button>
        </div>
        <div>
          


        {isModalOpen && (
          <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center mt-20">
            <div className="relative w-full max-w-2xl max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
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

                  <img loading="lazy"
                    src={TitleLogoNameContent.Logo}
                    alt=""
                    style={{
                      maxHeight: '60px',
                      maxWidth: '60px',
                      borderRadius: '50%',  // this makes the image round
                      objectFit: 'cover',   // this makes the image co0ver the entire dimensions
                      marginRight: '10px',   // added some margin to the right of the image
                      marginTop: "5px"
                    }} />
                  <FormGroup>
                    <FormControlLabel control={<Switch defaultChecked />} label={t("Support payment")} />
                  </FormGroup>
                  <form onSubmit={handleClickLogo} style={{ display: "flex", alignItems: "center" }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="logo"
                      label={TitleLogoNameContent.Logo}
                      name="logo"
                      autoComplete="logo"
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
                      {t("Update Logo")}
                    </Button>
                  </form>

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
      </div>
      <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
        {/* Filter Type */}
        <div className='Type' >
          {/* <div className='flex justify-between flex-wrap'> */}

          {/* web mode */}
          {!isMobile && (
            <div className='flex'>
              <div
                className='flex'
                style={{
                  width: '70%',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <b className='m-1'>{t("SEARCH:")}</b>

                <div className='container_search'>
                  <div className='searchInputWrapper'>
                    <input
                      className='searchInput'
                      style={{ margin: '5px', maxWidth: '90%' }}
                      type='text'
                      placeholder={t('Search your food')}
                      value={input}
                      onChange={handleSearchChange}
                    />
                    <i className='searchInputIcon fa fa-search'></i>
                  </div>
                </div>
              </div>

            </div>
          )}


          {isMobile && (
            <div className='flex'>
              {/* parent div of top and bottom div */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%"
              }}>

                {/* bottom parent div */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <b className='m-1 mt-2'>{t("SEARCH")}</b>
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between"
                }}>
                  {/* bottom search bar */}

                  <div className='container_search'>
                    <div className='searchInputWrapper'>
                      <input
                        className='searchInput'
                        style={{ margin: '5px', maxWidth: '90%' }}
                        type='text'
                        placeholder={t('Search your food')}
                        value={input}
                        onChange={handleSearchChange}
                      />
                      <i className='searchInputIcon fa fa-search'></i>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* end of the top */}
          <div className={isMobile ? 'scrolling-wrapper-filter mt-2' : "mb-2 mt-2 scrolling-wrapper-filter"} style={{ borderBottom: "1px solid black" }}>

            <button onClick={() => {
              setFoods(data)
              setCategoryState(null);

            }} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2' style={{ display: "inline-block" }}><b>{t("All")}</b></button>

            {foodTypes.map((foodType) => (

              <button
                key={foodType}
                onClick={() => {
                  filterType(foodType);
                  setCategoryState(foodType);
                }}
                className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2'
                style={{ display: "inline-block" }}>
                <b>{foodType}</b>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* diplay food */}
      <AnimatePresence>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 pt-3'>
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            key={""}
            className="border rounded-lg duration-500 cursor-pointer">
            <label className='h-min overflow-hidden rounded-md'
                style={{backgroundColor:"rgba(246,246,248,1)", display: 'block', width: '100%'}}

            >
                <input 
                    type="file" 
                    onChange={handleFileChangeAndUpload}
                    style={{ display: 'none' }} // hides the input
                />
                
                    <img 
        className="w-full h-[100px] md:h-[125px] hover:scale-125 transition-all duration-500 cursor-pointer object-cover rounded-t-lg"
        src={previewUrl} 
                        loading="lazy"
                    />
            </label>
            <div className="flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full">
              <div
                className="col-span-4"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <p className="mb-1">
                  {t("ENGLISH")}:
                  <input
                    type="text"
                    name="name"
                    placeholder={t("Crusine Name")}
                    value={newItem.name}
                    onChange={handleInputChange}
                  />
                </p>
                <span
                  style={{ cursor: "pointer", backgroundColor: "blue", marginTop: "2px", marginBottom: "5px" }}
                  className="task-card__tag task-card__tag--marketing"
                  onClick={async () => {  //Auto Fill Chinese
                    let translatedText = "Cuisine Name";
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

                >{t("Auto Fill Chinese")}</span>
                <p className="mb-1">{t("CHINESE")}:</p>
                <input
                  type="text"
                  name="CHI"
                  placeholder={"菜品名称"}
                  value={newItem.CHI}
                  onChange={handleInputChange}
                />
                <span
                  style={{ cursor: "pointer", backgroundColor: "blue", marginTop: "2px", marginBottom: "5px" }}
                  className="task-card__tag task-card__tag--marketing"

                  onClick={async () => {  // Auto Fill English
                    let translatedText = "菜品";
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
                >{t("Auto Fill English")}</span>

                <p className="mb-1">
                  {t("Price")}:{" "}
                  <input
                    style={{ width: "50%" }}
                    type="text"
                    name="subtotal"
                    placeholder={"$0"}
                    value={newItem.subtotal}
                    onChange={handleInputChange}
                  />
                </p>
                <p className="mb-1">
                  {t("Category")}:{" "}
                  <input
                    style={{ width: "50%" }}
                    type="text"
                    name="category"
                    placeholder={(categoryState === null ? "Popular" : categoryState)}
                    value={newItem.category}
                    onChange={handleInputChange}
                  />
                </p>
                <p className="mb-1">
                  {t("Priority")}:{" "}
                  <input
                    style={{ width: "50%" }}
                    type="text"
                    name="Priority"
                    placeholder={"9999"}
                    value={newItem.Priority}
                    onChange={handleInputChange}
                  />
                </p>

                <div className="flex">
                  <span
                    style={{ cursor: "pointer" }}
                    className="task-card__tag task-card__tag--marketing"
                    onClick={handleAddNewItem}
                  >
                    {t("Add New")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
          {foods.map((item, index) => (
            <Item key={index} translateToChinese={translateToChinese} translateToEnglish={translateToEnglish} item={item} updateItem={updateItem} deleteFood_array={deleteFood_array} saveId={saveId} />

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
const [previewUrl, setPreviewUrl] = useState("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/62c46944-13ab-4dac-0f3d-1cde91df8100/public")

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
    setPreviewUrl("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/62c46944-13ab-4dac-0f3d-1cde91df8100/public")
    try {
      const myFunction = firebase.functions().httpsCallable('generatePic');
      const result = await myFunction({ name: pic_name});
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
  const selectPic = (pic_url,item) => {
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


<label className='h-min overflow-hidden rounded-md'
                style={{backgroundColor:"rgba(246,246,248,1)", display: 'block', width: '100%'}}>               
                <input 
                    type="file" 
                    onChange={handleFileChangeAndUpload}
                    style={{ display: 'none' }} // hides the input
                />
                
                    <img 
        className="w-full h-[100px] md:h-[125px] hover:scale-125 transition-all duration-500 cursor-pointer object-cover rounded-t-lg"
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
        <img loading="lazy" className="w-full h-[100px] md:h-[125px]  hover:scale-125 transition-all duration-500 cursor-pointer  object-cover rounded-t-lg " src={gen_img}
    onClick={() => {selectPic(gen_img,item)
    }}
        />
      </div>
      </motion.div>
      ))
      }
      
        </div>    
        <div style={{ display: 'flex', justifyContent: 'center'}}>
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
{isGenChi ? t("New pictures for ") +item.CHI : t("New pictures for ") + item.name }

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
      className="border rounded-lg duration-500 cursor-pointer">
      <div className="h-min overflow-hidden rounded-md">
        <img loading="lazy" className="w-full h-[100px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[125px] object-cover rounded-t-lg " src={item.image}
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
      <div className='flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full'>
        <div className="col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <p className=' mb-1'>
            {t("ENGLISH")}:
            <input
              type="text"
              name="name"
              placeholder={item.name}
              value={inputData?.name || item.name}
              onChange={(e) => setInputData({ ...inputData, name: e.target.value })}
            />

          </p>
          <span
            style={{ cursor: "pointer", backgroundColor: "blue", marginTop: "2px", marginBottom: "5px" }}
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
          >{t("Auto Fill Chinese")}</span>
          <p className=' mb-1'>{t("CHINESE")}: </p>
          <input
            type="text"
            name="CHI"
            placeholder={item.CHI}
            value={inputData?.CHI || item.CHI}
            onChange={(e) => setInputData({ ...inputData, CHI: e.target.value })}
          />
          <span
            style={{ cursor: "pointer", backgroundColor: "blue", marginTop: "2px", marginBottom: "5px" }}
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
          >{t("Auto Fill English")}</span>
          <p className='mb-1'>{t("Price")}:
            <input
              style={{ width: "50%" }}
              type="text"
              name="subtotal"
              placeholder={item.subtotal}
              value={inputData?.subtotal || item.subtotal}
              onChange={(e) => setInputData({ ...inputData, subtotal: e.target.value })}
            />
          </p>
          <p className='mb-1'>{t("Category")}:
            <input
              style={{ width: "50%" }}
              type="text"
              name="category"
              placeholder={item.category}
              value={inputData?.category || item.category}
              onChange={(e) => setInputData({ ...inputData, category: e.target.value })}
            />
          </p>
          <p className='mb-1'>{t("Priority")}:
            <input
              style={{ width: "50%" }}
              type="text"
              name="Priority"
              placeholder={item.Priority}
              value={inputData?.Priority || item.Priority}
              onChange={(e) => setInputData({ ...inputData, Priority: e.target.value })}
            />
          </p>
          <div className='flex' >
            <span
              style={{ cursor: 'pointer' }}
              className="task-card__tag task-card__tag--marketing"
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
      </div>
    </motion.div>
    </>
   
  );
};


export default Food



