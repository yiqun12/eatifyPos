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
  const foodTypes = [...new Set(JSON.parse(sessionStorage.getItem("Food_arrays")).map(item => item.category))];
//      <b style={{fontSize:"20px",color: 'red'}}>ATTENTION: YOU ARE IN ADMIN MODE!</b>

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
    setData(updatedArr); // Update state
    setFoods(updatedArr)
    localStorage.setItem("food_arrays",JSON.stringify(updatedArr))
    saveId(Math.random());
}

const [newItem, setNewItem] = useState({
  ENG: "",
  CHI: "",
  price: "",
  category: "",
  Priority: ""
});

const [arr, setArr] = useState([
  {
    "name": "57. Chicken with Broccoli",
    "subtotal": "11.95",
    "category": "Chicken2",
    "price": "$",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0Ri77UdjzjJUUQPY91xVe64rMlMq9F3_xtpJjEVDlQ6OjJXQf&s",
    "id": "0ckPtNNUqeabhX239Jvn"
  },
  {
    "category": "Beef",
    "name": "54. Hunan Beef",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoa2jPZ1Nk1Hhvd4elpPtOJzJE-cf4g1dTWbM41MRybWfpi20&s",
    "price": "$",
    "subtotal": "12.95",
    "id": "0gdZu2xWpM46mYrC3jVG"
  }
]);

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
  setArr(updatedArr);
  setData(updatedArr); // Update state
  setFoods(updatedArr)
  localStorage.setItem("food_arrays",JSON.stringify(updatedArr))
  saveId(Math.random());
  // Clear the input fields
  setNewItem({
    ENG: "",
    CHI: "",
    price: "",
    category: "",
    Priority: ""
  });
};
console.log(arr)
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
          src={""}
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
              name="ENG"
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
              name="price"
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
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={item.id}
                className="border rounded-lg duration-500 cursor-pointer">
                <div class="h-min overflow-hidden rounded-md">
                  <img class="w-full h-[100px] hover:scale-125 transition-all duration-500 cursor-pointer md:h-[125px] object-cover rounded-t-lg" src={item.image} alt={item.name} />
                </div>
                <div className='flex justify-between px-2 py-2 pb-1 grid grid-cols-4 w-full'>

{/* parent div of title + quantity and button parent div */}
<div className="col-span-4" style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
<div className="">
  <p className=' mb-1'>ENGLISH: 
  <input type="text" name="ENG" placeholder={item.name} />
  </p>
  <p className=' mb-1'>CHINESE: </p>
  <input type="text" name="2ndLANG" placeholder={item.CHI} />
  <p className='mb-1'>Price: <input style={{width:"50%"}}type="text" name="price" placeholder={item.subtotal} /></p>
  <p className='mb-1'>Category: <input style={{width:"50%"}}type="text" name="category" placeholder={item.category} /></p>
  <p className='mb-1'>Priority: <input style={{width:"50%"}}type="text" name="Priority" placeholder={"0"} /></p>
  <div className='flex' >
  <span style={{ cursor: 'pointer' }}
            className="task-card__tag task-card__tag--marketing">{t("Update")}</span>
                                            <span                                 onClick={() => {
                                  deleteFood_array(item.id)
                                  saveId(Math.random());
                                }}
                                            style={{ marginLeft:"auto", cursor: 'pointer' }}
                                                className="task-card__tag task-card__tag--design">{t("Delete")}
                                                </span>
                                                </div>
</div>
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