import React, { useState, useEffect } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import $ from 'jquery';
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { ReactComponent as PlusSvg } from '../pages/plus.svg';
import { ReactComponent as MinusSvg } from '../pages/minus.svg';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator


const Food = () => {


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
  const [TitleLogoNameContent,setTitleLogoNameContent]= useState(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"|| "[]"))[0]);
  useEffect(() => {
      // Get data from localStorage when component mounts
      const storedData = JSON.parse(localStorage.getItem("food_arrays") || "[]");
      setData(storedData);
      setTitleLogoNameContent(JSON.parse(sessionStorage.getItem("TitleLogoNameContent"))[0])
  }, [id]);


  const syncData = () => {
      const sessionData = sessionStorage.getItem("Food_arrays");
      if(sessionData) {
          localStorage.setItem("food_arrays", sessionData);
          setData(JSON.parse(sessionData)); // Update state
          setFoods(JSON.parse(sessionData))
          saveId(Math.random());

      } else {
          setData(JSON.parse(sessionData)); // Update state
          setFoods(JSON.parse(sessionData))
          saveId(Math.random());

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
  const [foodTypes, setFoodTypes] = useState([...new Set(JSON.parse(localStorage.getItem("Food_arrays")||"[]").map(item => item.category))]);
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
    let updatedArr = deleteById(JSON.parse(localStorage.getItem("food_arrays") || "[]"),id)
    reload(updatedArr)
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
    name: newItem.name || "Crusine Name",
    CHI: newItem.CHI || "菜品名称",
    subtotal: newItem.subtotal || "$0",
    category: newItem.category || "Name",
    Priority: newItem.Priority || "9999"
  };

  // Add the new item to the array
  let updatedArr = [...arr, newItemWithPlaceholders] 
  reload(updatedArr)
  // Clear the input fields
  setNewItem({
    name: "",
    CHI: "",
    subtotal: "",
    category: "",
    Priority: ""
  });
};

const updateItem = (id, updatedFields) => {
  const newItems = arr.map((item) => 
    item.id === id 
    ? {...item, ...updatedFields} 
    : item
  );

  reload(newItems);
};


console.log(arr)
function reload(updatedArr){
  setArr(updatedArr);
  setData(updatedArr); // Update state
  setFoods(updatedArr)
  localStorage.setItem("food_arrays",JSON.stringify(updatedArr))
  saveId(Math.random());
  setFoodTypes([...new Set(updatedArr.map(item => item.category))])
}
//Instruction:
//Click on the image to change:
//

  return (

    <div>
     
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      <div className='max-w-[1000px] m-auto px-4 '>
      {isMobile?TitleLogoNameContent.Address:""}
        <div className='flex mb-1' >
      <b style={{fontSize:"20px",color: 'blue',marginTop:"5px"}}>READ THE INSTRUCTION</b>      
      </div>

      <div className='flex'>
      <button
        onClick={handleEditShopInfoModalOpen}
        className="block text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg gray-sm px-3.5 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
        type="button">
        Edit Shop Info
      </button>
      <button 
        className="block text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-3.5 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        style={{ marginLeft:"auto",display: "inline-block" }}>
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
        style={{ marginLeft:"auto",display: "inline-block" }}>
          {t("Save Changes")}
        </button>
      </div>
      <div>

      {isModalOpen && (
        <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center">
          <div className="relative w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Shop Info
                </h3>
                <button
                  onClick={handleEditShopInfoModalClose}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className='px-4'>

              <img
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
      <FormControlLabel control={<Switch defaultChecked />} label="Support payment" />
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
      <b className='m-1'>SEARCH:</b>

      <div className='container_search'>
        <div className='searchInputWrapper'>
          <input
            className='searchInput'
            style={{ margin: '5px', maxWidth: '90%' }}
            type='text'
            placeholder='Search your food'
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
    <div style={{display: "flex",
    flexDirection: "column",
    width: "100%"}}>

      {/* bottom parent div */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
    <b className='m-1 mt-2'>SEARCH</b>
</div>
      <div style={{    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"}}>
        {/* bottom search bar */}
        
      <div className='container_search'>
        <div className='searchInputWrapper'>
          <input
            className='searchInput'
            style={{ margin: '5px', maxWidth: '90%' }}
            type='text'
            placeholder='Search your food'
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
            <div className={isMobile?'scrolling-wrapper-filter mt-2':"mb-2 mt-2 scrolling-wrapper-filter"} style={{borderBottom: "1px solid black"}}>
              
              <button onClick={() => setFoods(data)} className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2' style={{ display: "inline-block" }}><b>{t("All")}</b></button>

              {foodTypes.map((foodType) => (

                <button
                  key={foodType}
                  onClick={() => filterType(foodType)}
                  className='m-1 border-black-600 text-black-600 hover:bg-amber-500 hover:text-white border rounded-xl px-2 py-2'
                  style={{ display: "inline-block" }}>
                  <b>{t(foodType.charAt(0).toUpperCase() + foodType.slice(1))}</b>
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
      <div className="h-min overflow-hidden rounded-md">
        <img
          className="w-full h-[100px] hover:scale-150 scale-125 transition-all duration-500 cursor-pointer md:h-[125px] object-cover rounded-t-lg"
          src={"data:image/png;base64,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"}
        />
      </div>
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
            ENGLISH:
            <input
              type="text"
              name="name"
              placeholder={"Crusine Name"}
              value={newItem.name}
              onChange={handleInputChange}
            />
          </p>
          <p className="mb-1">CHINESE:</p>
          <input
            type="text"
            name="CHI"
            placeholder={"菜品名称"}
            value={newItem.CHI}
            onChange={handleInputChange}
          />
          <p className="mb-1">
            Price:{" "}
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
            Category:{" "}
            <input
              style={{ width: "50%" }}
              type="text"
              name="category"
              placeholder={"Name"}
              value={newItem.category}
              onChange={handleInputChange}
            />
          </p>
          <p className="mb-1">
            Priority:{" "}
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
              Add New
            </span>
          </div>
        </div>
      </div>
              </motion.div>
            {foods.map((item, index) => (
        <Item key={index} item={item} updateItem={updateItem} deleteFood_array={deleteFood_array} saveId={saveId} />

            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}



const Item = ({ item, updateItem, deleteFood_array, saveId }) => {
  const [inputData, setInputData] = useState(null);
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
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      key={item.id}
      className="border rounded-lg duration-500 cursor-pointer">
      <div className="h-min overflow-hidden rounded-md">
        <img className="w-full h-[100px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[125px] object-cover rounded-t-lg" src={item.image} />
      </div>
      <div className='flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full'>
        <div className="col-span-4" style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
          <div className="">
            <p className=' mb-1'>
              ENGLISH: 
              <input 
                type="text" 
                name="name" 
                placeholder={item.name} 
                value={inputData?.name || ""} 
                onChange={(e) => setInputData({ ...inputData, name: e.target.value })}
              />
            </p>
            <p className=' mb-1'>CHINESE: </p>
            <input 
              type="text" 
              name="CHI" 
              placeholder={item.CHI} 
              value={inputData?.CHI || ""} 
              onChange={(e) => setInputData({ ...inputData, CHI: e.target.value })}
            />
            <p className='mb-1'>Price: 
              <input 
                style={{width:"50%"}} 
                type="text" 
                name="subtotal" 
                placeholder={item.subtotal} 
                value={inputData?.subtotal || ""} 
                onChange={(e) => setInputData({ ...inputData, subtotal: e.target.value })}
              />
            </p>
            <p className='mb-1'>Category: 
              <input 
                style={{width:"50%"}} 
                type="text" 
                name="category" 
                placeholder={item.category} 
                value={inputData?.category || ""} 
                onChange={(e) => setInputData({ ...inputData, category: e.target.value })}
              />
            </p>
            <p className='mb-1'>Priority: 
              <input 
                style={{width:"50%"}} 
                type="text" 
                name="Priority" 
                placeholder={item.Priority} 
                value={inputData?.Priority || ""} 
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
                style={{ marginLeft:"auto", cursor: 'pointer' }}
                className="task-card__tag task-card__tag--design"
              >
                {t("Delete")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default Food