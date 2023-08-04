//import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useEffect } from 'react';
//import Checkout from "../components/Checkout";
import PayFullhistory from "./PayFullhistory";
import { Elements } from '@stripe/react-stripe-js';
import { useUserContext } from "../context/userContext";
import { useMyHook } from '../pages/myHook';
import Checkout from "./Checkout_acc";
import './style.css';
import { useCallback } from 'react';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image
import plusSvg from '../pages/plus.svg';
import minusSvg from '../pages/minus.svg';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Row, Col, Container } from "react-bootstrap"
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { data_ } from '../data/data.js'
import ReactResizeDetector from 'react-resize-detector';
import { PieChart, Pie, Cell } from 'recharts';
const theme = createTheme();

const Account = () => {
  const [width2, setWidth2] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    setWidth2(elementRef.current.offsetWidth);

    const handleResize = () => {
      setWidth2(elementRef.current.offsetWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up after the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //////////////////////////////////////////////
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;
  const { promise, logoutUser } = useUserContext();
  //console.log(promise)
  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
  }
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    setActiveTab(window.location.hash);
  }, []);
  function removeFromLocalStorage() {
    sessionStorage.removeItem('products');
    sessionStorage.removeItem('Food_arrays');
  }
  //google login button functions

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
    //console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
          if (trans[text][sessionStorage.getItem("translationsMode")] != null)
            return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    }
    // base case to just return the text if no modes/translations are found
    return text
  }

  const [orders, setOrders] = useState();
  const [Food_array, setFood_array] = useState("");
  const [Food_arrays, setFood_arrays] = useState(JSON.parse(sessionStorage.getItem("Food_arrays")));

  const [selectedItem, setSelectedItem] = useState('Order');

  function handleItemClick(item) {
    setSelectedItem(item);
    saveId(Math.random())
    console.log(selectedItem)
  }
  /**change app namne and logo */
  const [faviconUrl, setFaviconUrl] = useState('https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/LUwithShield-CMYK.svg/1200px-LUwithShield-CMYK.svg.png');
  const [pageTitle, setPageTitle] = useState("Title1");
  const handleOpenCashDraw = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "open_cashdraw"), {
        date: date
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const handleAdminCheckout = async () => {
    if (sessionStorage.getItem("tableMode") == "table-NaN") {
      return
    }

    //console.log(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
    const food_array = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")));
    const matched_food_array = food_array.map(({ id, quantity }) => {
      const matched_food = JSON.parse(sessionStorage.getItem("Food_arrays")).find(foodItem => foodItem.id === id);
      return { ...matched_food, quantity };
    });

    console.log(matched_food_array);
    const total_ = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))).reduce((accumulator, task) => {
      return accumulator + task.quantity * task.subtotal;
    }, 0).toFixed(2)
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "success_payment"), {
        dateTime: date,
        receiptData: JSON.stringify(matched_food_array),
        //charges.data[0].billing_details.name = "DineIn"
        amount: total_ * 100,
        amount_received: total_ * 100,
        user_email: "Admin@gmail.com",
        charges: {
          data: [
            {
              billing_details: { name: "DineIn" }
            }
          ]
        }
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const handleClickLogo = async (e) => {
    e.preventDefault();
    console.log(e.target.logo.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    await updateDoc(docRef, { Logo: e.target.logo.value });
    // refresh session storage data and redirect
    const newData = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }));
    sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
  }
  const handleClickName = async (e) => {
    e.preventDefault();
    console.log(e.target.name.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    await updateDoc(docRef, { Name: e.target.name.value });
    // refresh session storage data and redirect
    const newData = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }));
    sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
  }
  const handleClickAddress = async (e) => {
    e.preventDefault();
    console.log(e.target.address.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    await updateDoc(docRef, { Address: e.target.address.value });
    // refresh session storage data and redirect
    const newData = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }));
    sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
  }
  const handleClickTime = async (e) => {
    e.preventDefault();
    console.log(e.target.time.value);
    const querySnapshot = await getDocs(collection(db, "TitleLogoNameContent"));
    const docSnapshot = querySnapshot.docs[0];
    const docRef = doc(db, 'TitleLogoNameContent', docSnapshot.id);
    await updateDoc(docRef, { Open_time: e.target.time.value });
    // refresh session storage data and redirect
    const newData = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }));
    sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
  }

  const updateFavicon = () => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = `${faviconUrl}?t=${Date.now()}`;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**change app namne and logo */


  //for the add
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [subtotal, setSubtotal] = useState("");
  //for the add
  //for the update
  const [updateId, setUpdateId] = useState('');
  const [updateName, setUpdateName] = useState('');
  const [updateCategory, setUpdateCategory] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [updatePrice, setUpdatePrice] = useState('');
  const [updateSubtotal, setUpdateSubtotal] = useState('');
  // for json update

  /* stringify data
  // [{"id":"price_1MJTkrFOhUhkkYOhL4UIti6Z","name":"Ceasar Salad","category":"salad","image":"https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"2"},{"id":"price_1MJTlDFOhUhkkYOhbkBbKREK","name":"Bacon Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$","subtotal":"3"},{"id":"price_1MJTlfFOhUhkkYOh0hVnh4ib","name":"Mushroom Burger","category":"burger","image":"https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGJ1cmdlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=1400&q=60","price":"$$","subtotal":"4"},{"id":"price_1MJTlvFOhUhkkYOhK9M6CIhT","name":"Loaded Burger","category":"burger","image":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$","subtotal":"5"},{"id":"price_1MJTmHFOhUhkkYOhqNKAtICv","name":"Wings","category":"chicken","image":"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"6"},{"id":"price_1MJTmUFOhUhkkYOhLrfJCvPt","name":"Supreme Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1604382355076-af4b0eb60143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8N3x8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"7"},{"id":"price_1MJTmyFOhUhkkYOhwRXs0fFv","name":"Meat Lovers","category":"pizza","image":"https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHBpenphfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"8"},{"id":"price_1MJTnGFOhUhkkYOhPh3eAAuk","name":"Chicken Tenders","category":"chicken","image":"https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"9"},{"id":"price_1MJTnVFOhUhkkYOhYfbsRz3J","name":"Kale Salad","category":"salad","image":"https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c2FsYWQlMjBjZWFzYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"10"},{"id":"price_1MJTnkFOhUhkkYOhbBfiLpoG","name":"Double Cheeseburger","category":"burger","image":"https://images.unsplash.com/photo-1607013251379-e6eecfffe234?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2Vyc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60","price":"$$$$","subtotal":"12"},{"id":"price_1MJTo0FOhUhkkYOhUWpPQMyj","name":"Chicken Kabob","category":"chicken","image":"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGNoaWNrZW4lMjBmb29kfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60","price":"$$$","subtotal":"13"},{"id":"price_1MJToHFOhUhkkYOhrwh3DnFN","name":"Fruit Salad","category":"salad","image":"https://images.unsplash.com/photo-1564093497595-593b96d80180?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZnJ1aXQlMjBzYWxhZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"14"},{"id":"price_1MJToVFOhUhkkYOhtGfbubON","name":"Feta & Spinnach","category":"pizza","image":"https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8cGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$","subtotal":"15"},{"id":"price_1MJTokFOhUhkkYOhdVrB44HD","name":"Baked Chicken","category":"chicken","image":"https://images.unsplash.com/photo-1594221708779-94832f4320d1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMGZvb2R8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"16"},{"id":"price_1MJTp0FOhUhkkYOhWfwVHIuU","name":"Cheese Pizza","category":"pizza","image":"https://images.unsplash.com/photo-1548369937-47519962c11a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8Y2hlZXNlJTIwcGl6emF8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$","subtotal":"17"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVLT","name":"Loaded Salad","category":"salad","image":"https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWR8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60","price":"$$$$","subtotal":"18"},{"id":"price_1MJTpGFOhUhkkYOhzMtHrVL2","name":"1/4lb Cheese Deluxe","category":"burger","image":"https://s7d1.scene7.com/is/image/mcdonalds/DC_202201_4282_QuarterPounderCheeseDeluxe_Shredded_832x472:product-header-desktop?wid=830&hei=458&dpr=off","price":"$$$$","subtotal":"19"}]
  */

  const [inputData, setInputData] = useState([]);
  const [searchData, setSearchData] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInputData(event.target.inputData.value);
    console.log(inputData)
    let temp = data_
    console.log(temp)//convert string to json.
    for (let i = 0; i < temp.length; i++) {
      console.log(temp[i])
      console.log(addJson_array(temp[i].name, temp[i].category, temp[i].image, temp[i].price, temp[i].subtotal))
    }
    await getDocs(collection(db, "food_data"))
      .then((querySnapshot) => {
        console.log("read card")
        const newData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        console.log(JSON.stringify(newData))
        sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
      })
    saveId(Math.random())
  }

  const addJson_array = async (name, category, image, price, subtotal) => {
    try {
      const docRef = await addDoc(collection(db, "food_data"), {
        name: name,
        category: category,
        image: image,
        price: "$",
        subtotal: subtotal,
      });
      console.log("Document written with ID: ", docRef.id);


    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  //for json update
  const handleUpdateForm = (id) => {
    setUpdateId(id);
    setUpdateName(Food_arrays.find(item => item.id === id).name);
    setUpdateCategory(Food_arrays.find(item => item.id === id).category);
    setUpdateImage(Food_arrays.find(item => item.id === id).image);
    setUpdatePrice(Food_arrays.find(item => item.id === id).price);
    setUpdateSubtotal(Food_arrays.find(item => item.id === id).subtotal);

  }
  //for the update
  const addFood_array = async (updatedFood_array) => {

    console.log(updatedFood_array)
    try {
      const docRef = await addDoc(collection(db, "food_data"), {
        name: updatedFood_array.name,
        category: updatedFood_array.category,
        image: updatedFood_array.image,
        price: updatedFood_array.price,
        subtotal: updatedFood_array.subtotal,
      });
      console.log("Document written with ID: ", docRef.id);
      await getDocs(collection(db, "food_data"))
        .then((querySnapshot) => {
          const newData = querySnapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }));
          console.log(JSON.stringify(newData))
          sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
        })
      saveId(Math.random())
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const updateFood_array = async (id, updatedFood_array) => {
    //(id, updatedFood_array).preventDefault();

    try {
      await updateDoc(doc(db, "food_data", id), updatedFood_array);
      console.log("Document updated with ID: ", id);
      await getDocs(collection(db, "food_data"))
        .then((querySnapshot) => {
          const newData = querySnapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }));
          console.log(JSON.stringify(newData))
          sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
        })
      saveId(Math.random())
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteFood_array = async (id) => {
    console.log(id)
    try {
      await deleteDoc(doc(db, "food_data", id));
      console.log("Document deleted with ID: ", id);
      await getDocs(collection(db, "food_data"))
        .then((querySnapshot) => {
          const newData = querySnapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }));
          console.log(JSON.stringify(newData))
          sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
        })
      saveId(Math.random())
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }
  //Food_arrays = 
  // margin: auto;
  // max-width: 1240px;
  // display: grid;
  // justify-self: center;
  // justify-content: center;
  // align-items: stretch;


  const [revenueData, setRevenueData] = useState([
    { date: '1/1/1900', revenue: 1 }
  ]);
  const [inputName, setInputName] = useState("");


  const autoFill = () => {
    const sampleData = {
      name: inputName,
      category: inputName,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj1Sw9a8ELg0JzttUaXnY5ZVEuxH_bG_PmqmygfLbpFHxD3H-W&s",
      price: "100",
      subtotal: "200"
    }
    console.log(inputName)
    
    setUpdateName(sampleData.name);
    setName(sampleData.name);
  
    setUpdateCategory(sampleData.category);
    setCategory(sampleData.category);
  
    setUpdateImage(sampleData.image);
    setImage(sampleData.image);
  
    setUpdatePrice(sampleData.price);
    setPrice(sampleData.price);
  
    setUpdateSubtotal(sampleData.subtotal);
    setSubtotal(sampleData.subtotal);
  };


  const moment = require('moment');

  const fetchPost = async () => {
    console.log("fetchPost2");
    await getDocs(collection(db, "success_payment")).then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      newData.sort((a, b) =>
        moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
        moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
      );

      const newItems = []; // Declare an empty array to hold the new items

      newData.forEach((item) => {
        const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
          .subtract(4, "hours")
          .format("M/D/YYYY h:mma");
        const newItem = {
          id: item.id.substring(0, 5), // use only the first 4 characters of item.id as the value for the id property
          receiptData: item.receiptData,
          date: formattedDate,
          email: item.user_email,
          dineMode: item.metadata.isDine,
          status: item.status==="succeeded"?"Paid Online":"Handle Instore",
          total: parseFloat(item.metadata.total),
          name: "table A",
          metadata: item.metadata
        };
        newItems.push(newItem); // Push the new item into the array
      });
      setOrders(newItems)
      console.log(newItems); // Log the array to the console or do whatever you want with it


      // Create an object to store daily revenue totals
      const dailyRevenue = {};

      // Loop through each receipt and sum up the total revenue for each date
      newItems.forEach(receipt => {
        // Extract the date from the receipt
        const date = receipt.date.split(' ')[0];
        //console.log(receipt)
        // Extract the revenue from the receipt (for example, by parsing the receiptData string)
        const revenue = receipt.total; // replace with actual revenue calculation
        // Add the revenue to the dailyRevenue object for the appropriate date
        if (dailyRevenue[date]) {
          dailyRevenue[date] += revenue;
        } else {
          dailyRevenue[date] = revenue;
        }
      });
      console.log("hello")
      // Convert the dailyRevenue object into an array of objects with date and revenue properties
      const dailyRevenueArray = Object.keys(dailyRevenue).map(date => {
        return {
          date: date,
          revenue: Math.round(dailyRevenue[date] * 100) / 100
        };
      });

      // Example output: [{date: '3/14/2023', revenue: 10}, {date: '3/13/2023', revenue: 10}, {date: '3/4/2023', revenue: 10}]
      console.log(dailyRevenueArray);
      console.log(revenueData);

      setRevenueData(dailyRevenueArray)

    });
  };





  useEffect(() => {
    fetchPost();
  }, [])



  const [expandedOrderIds, setExpandedOrderIds] = useState([]);

  const toggleExpandedOrderId = (orderId) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
    } else {
      setExpandedOrderIds([...expandedOrderIds, orderId]);
    }
  };
  //REVENUE CHART 31 DAYS FROM NOW
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000); // 7 days ago

  const filteredData = revenueData.filter((dataPoint) => {
    const dataPointDate = new Date(dataPoint.date);
    return dataPointDate >= oneWeekAgo && dataPointDate <= today;
  });
  const sortedData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({ ...item, date: (new Date(item.date).getMonth() + 1) + '/' + new Date(item.date).getDate() }));

  console.log(sortedData)

  if (!sessionStorage.getItem("tableMode")) {
    sessionStorage.setItem("tableMode", "table-NaN");
  }
  if (!sessionStorage.getItem("table-NaN")) {
    sessionStorage.setItem("table-NaN", "[]");
  }
  if (!sessionStorage.getItem(sessionStorage.getItem("tableMode"))) {
    sessionStorage.setItem("table-NaN", "[]");
    sessionStorage.setItem("tableMode", "table-NaN");
  }

  const [src, setSrc] = useState(window.PUBLIC_URL + "/seat.html");
  const [initialSrc, setInitialSrc] = useState(window.PUBLIC_URL + "/seat.html");
  const [isLoading, setIsLoading] = useState(false); // added state variable
  const iframeRef = useRef(null);

  const messageHandler = useCallback((event) => {
    if (event.data === 'buttonClicked') {
      console.log('Button clicked2!');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', messageHandler);

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [messageHandler]);

  useEffect(() => {
    if (iframeRef.current) {
      setInitialSrc(iframeRef.current.src);
    }
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      setIsLoading(true); // set isLoading to true when the iframe starts loading
      iframeRef.current.src = src;
    }
  }, [src, selectedItem]);

  //listen to table
  useEffect(() => {
    const handleIframeMessage = event => {
      const selectedNumber = event.data;
      listenNumber(selectedNumber);
    };
    window.addEventListener("message", handleIframeMessage);
    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, []);
  //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))
  function listenNumber(number) {
    var tableName = "table-" + parseInt(number);
    if (tableName == "table-NaN") {
      return
    }

    console.log(tableName)
    if (!sessionStorage.getItem(tableName)) {
      // Create the table if it does not exist
      console.log("creating table ", number);
      sessionStorage.setItem(tableName, "[]");
    } else {
      // Switch to the existing table
      var tableMode = sessionStorage.getItem("tableMode");
      if (tableMode == null) {
        // If tableMode does not exist, create it and set the selected table number
        sessionStorage.setItem("tableMode", tableName);
      } else {
        // If tableMode exists, update it with the selected table number
        sessionStorage.setItem("tableMode", tableName);
      }
    }
    sessionStorage.setItem("tableMode", tableName);
    saveId(Math.random());
  }

  /**admin shopping cart */

  //const [shopItem, setShopItem] = useState(JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []);
  const [tableItem, setTableItem] = useState([]);

  //JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode")))

  const shopAdd = (id) => {
    if (sessionStorage.getItem("tableMode") == "table-NaN") {
      return
    }
    const foodItem = Food_arrays.find(item => item.id === id);
    const dictArray = {
      id: id,
      name: foodItem.name,
      category: foodItem.category,
      image: foodItem.image,
      price: foodItem.price,
      subtotal: foodItem.subtotal,
      quantity: 1
    };
    console.log(dictArray);
    // Check if shopItem exists in sessionStorage

    // Retrieve the shopItem array from sessionStorage

    const shopItem = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []

    // Check if the id already exists in the shopItem array
    const idExists = shopItem.some(item => item.id === dictArray.id);

    if (!idExists) {
      // If the id does not exist, add the dictArray object to the shopItem array
      shopItem.push(dictArray);
      // Save the updated shopItem array back to sessionStorage
      sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(shopItem))
      //sessionStorage.setItem('shopItem', JSON.stringify(shopItem));
      //setShopItem(shopItem)
    } else {
      clickedAdd(id)
    }

    saveId(Math.random());
    //searchItemFromShopItem("cheese")
    //search
  }
  const clickedAdd = (id) => {
    if (sessionStorage.getItem("tableMode") == "table-NaN") {
      return
    }
    const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
    // Find the item in the cartItems array with the matching id
    const item = cartItems.find(item => item.id === id);

    // If the item is found, increase its quantity by 1
    if (item) {
      item.quantity += 1;
    }
    console.log(cartItems)
    sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
    // Return the updated cartItems array
    //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
  }
  const clickedMinus = (id) => {
    if (sessionStorage.getItem("tableMode") == "table-NaN") {
      return
    }
    const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
    // Find the item in the cartItems array with the matching id
    const item = cartItems.find(item => item.id === id);

    // If the item is found and its quantity is greater than 1, decrease its quantity by 1
    if (item && item.quantity > 1) {
      item.quantity -= 1;
    }
    console.log(cartItems)
    sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
    // Return the updated cartItems array
    //sessionStorage.setItem('shopItem', JSON.stringify(cartItems));
  }
  const deleteItem = (id) => {
    const cartItems = JSON.parse(sessionStorage.getItem(sessionStorage.getItem("tableMode"))) || []
    // Find the index of the item in the cartItems array with the matching id
    const index = cartItems.findIndex(item => item.id === id);

    // If the item is found, remove it from the cartItems array using the splice() method
    if (index !== -1) {
      cartItems.splice(index, 1);
    }

    console.log(cartItems)
    sessionStorage.setItem(sessionStorage.getItem("tableMode"), JSON.stringify(cartItems));
  }
  const [cheeseItems_, setCheeseItems_] = useState(JSON.parse(sessionStorage.getItem('Food_arrays')) || []);
  const searchItemFromShopItem = (input) => {
    const shopItem_ = JSON.parse(sessionStorage.getItem('Food_arrays')) || [];

    // Filter the items that have "cheese" in their name
    const cheeseItems = shopItem_.filter(item => item.name.toLowerCase().includes(input));

    // Return the cheeseItems array
    console.log(cheeseItems)
    setCheeseItems_(cheeseItems)
    saveId(Math.random());
  }

  let search_food = !searchData ? Food_arrays : cheeseItems_;
  const dateNow = (new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getDate().toString().padStart(2, '0') + '/' + new Date().getFullYear()
  const [selectedDate, setSelectedDate] = useState(new Date(dateNow));

  const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FF8042'];

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <>
      <Elements stripe={promise}>
        <div className='max-w-[1000px] mx-auto p-0 pt-4'>
          <div className="container">
            <div className="row gutters-sm">
              <div className="col-md-3 d-none d-md-block">
                <div className="card">
                  <div className="card-body">
                    <nav className="nav flex-column nav-pills nav-gap-y-1">
                      <a
                        href="#profile"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#profile' || activeTab === '' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#profile')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-user mr-2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                        {t("Profile")}
                      </a>

                      <a
                        href="#Revenue_Chart"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#Revenue_Chart' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#Revenue_Chart')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-credit-card mr-2"
                        >
                          <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
                          <line x1={1} y1={10} x2={23} y2={10} />
                        </svg>
                        {t("Revenue Chart")}
                      </a>
                      <a
                        href="#History"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#History' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#History')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-clock mr-2"
                        >
                          <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {t("History")}
                      </a>
                      <a
                        href="#Menu_Setting"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#Menu_Setting' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#Menu_Setting')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-clock mr-2"
                        >
                          <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {t("Menu Setting")}
                      </a>
                      <a
                        href="#Favicon_Setting"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#Favicon_Setting' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#Favicon_Setting')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-clock mr-2"
                        >
                          <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {t("Other Setting")}
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
              <div className="col-md-9">
                <div className="card">
                  <div className="card-header border-bottom mb-3 d-flex d-md-none">
                    <ul
                      className="nav nav-tabs card-header-tabs nav-gap-x-1"
                      role="tablist"
                    >
                      <li className="nav-item">
                        <a
                          href="#profile"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#profile' || activeTab === '' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#profile')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-user"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx={12} cy={7} r={4} />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#Revenue_chart"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#Revenue_Chart' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#Revenue_Chart')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-credit-card"
                          >
                            <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
                            <line x1={1} y1={10} x2={23} y2={10} />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#History"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#History' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#History')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-clock mr-2"
                          >
                            <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#Menu_Setting"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#Menu_Setting' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#Menu_Setting')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-clock mr-2"
                          >
                            <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#Favicon_Setting"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#Favicon_Setting' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#Favicon_Setting')}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-clock mr-2"
                          >
                            <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </a>
                      </li>

                    </ul>
                  </div>
                  <div id="card_element" className="card-body tab-content" ref={elementRef}>

                    {activeTab === '#profile' || activeTab === '' ? (

                      <div className="tab-pane active" id="profile">
                        <h6>{t("PROFILE")}</h6>
                        <hr />
                        <h6 className="flex items-center">
                          <i className="material-icons">person</i>
                          {user ? user.displayName : ""}
                          <button style={{ "margin-left": "auto" }}
                            onClick={() => {
                              logoutUser();
                              removeFromLocalStorage();
                            }}
                            type="button"
                            className="btn btn-primary">
                            {t("sign out")}
                          </button>
                        </h6>
                        <div className="form-group">
                            <label htmlFor="bio">{(user) ? user.email : ""}</label>
                          </div>
                          <hr />
                          <h6>{t("Payment Method: ")}</h6>
                          <Checkout />
                          <h6>{t("Order History: ")}</h6>
                                <PayFullhistory />
                      </div>
                    ) : null}

                    {activeTab === '#Revenue_Chart' ? (
                      <div className="tab-pane-active" id="Revenue_Chart">
                        <h6>{t("REVENUE CHART")}</h6>
                        <hr />
                        <b x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                          Revenue earned on a daily basis over a period of 5 days
                        </b>
                        <br></br>
                        <div style={{ marginLeft: '-25px' }}>
                          <BarChart className="chart" width={width2 - 10} height={300} data={sortedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8884d8" />
                          </BarChart>
                        </div>

                      </div>


                    ) : null}
                    {activeTab === '#History' ? (

                      <div className="tab-pane-active" id="History">

                        <h6>{t("HISTORY SETTINGS")}</h6>
                        <hr />



                        <div className={isMobile ? "flex" : 'flex'}>
                          <div style={isMobile ? { width: "50%" } : { width: "50%" }}>
                            <h6 x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                              Revenue : $

                              {
                                Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                  (accumulator, receipt) => {
                                    accumulator.tips += parseFloat(receipt.metadata.tips);
                                    accumulator.tax += parseFloat(receipt.metadata.tax);
                                    accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                    accumulator.total += parseFloat(receipt.total);
                                    return accumulator;
                                  },
                                  { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                ).total * 100) / 100

                              }
                            </h6>
                            <h6 x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                              Tips : $

                              {
                                Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                  (accumulator, receipt) => {
                                    accumulator.tips += parseFloat(receipt.metadata.tips);
                                    accumulator.tax += parseFloat(receipt.metadata.tax);
                                    accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                    accumulator.total += parseFloat(receipt.total);
                                    return accumulator;
                                  },
                                  { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                ).tips * 100) / 100

                              }
                            </h6>
                            <b style={{ marginBottom: "25px" }}>Select a date</b>
                            <br />
                            <input
                              type="date"
                              style={{ marginTop: "5px", marginBottom: "10px", "width": "120px" }}
                              value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ""}
                              onChange={(event) => {
                                setSelectedDate(new Date(event.target.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")));
                              }}
                            />

                            <div>
                              <button className="btn btn-info mb-2" onClick={() => setSelectedDate(new Date(dateNow))}>{isMobile ? "Today's Orders" : "Display Today's Orders"}</button>

                            </div>

                            <div>
                              <button className="btn btn-primary" onClick={() => setSelectedDate(null)}>{isMobile ? "All Orders" : "Display All Orders"}</button>

                            </div>


                          </div>









                          <div style={isMobile ? { "width": "50%" } : {}}>

                            <PieChart width={isMobile ? width2 / 2 : 300} height={250}>
                              <Pie
                                cx={80} // Move the pie to the left by adjusting the cx value
                                data={[
                                  {
                                    name: 'Tips', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                      (accumulator, receipt) => {
                                        accumulator.tips += parseFloat(receipt.metadata.tips);
                                        accumulator.tax += parseFloat(receipt.metadata.tax);
                                        accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                        accumulator.total += parseFloat(receipt.total);
                                        return accumulator;
                                      },
                                      { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                    ).tips * 100) / 100
                                  },
                                  {
                                    name: 'Tax', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                      (accumulator, receipt) => {
                                        accumulator.tips += parseFloat(receipt.metadata.tips);
                                        accumulator.tax += parseFloat(receipt.metadata.tax);
                                        accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                        accumulator.total += parseFloat(receipt.total);
                                        return accumulator;
                                      },
                                      { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                    ).tax * 100) / 100
                                  },
                                  {
                                    name: 'Subtotal', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                      (accumulator, receipt) => {
                                        accumulator.tips += parseFloat(receipt.metadata.tips);
                                        accumulator.tax += parseFloat(receipt.metadata.tax);
                                        accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                        accumulator.total += parseFloat(receipt.total);
                                        return accumulator;
                                      },
                                      { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                    ).subtotal * 100) / 100
                                  }]}
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={75}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {
                                  [
                                    {
                                      name: 'Tips', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                        (accumulator, receipt) => {
                                          accumulator.tips += parseFloat(receipt.metadata.tips);
                                          accumulator.tax += parseFloat(receipt.metadata.tax);
                                          accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                          accumulator.total += parseFloat(receipt.total);
                                          return accumulator;
                                        },
                                        { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                      ).tips * 100) / 100
                                    },
                                    {
                                      name: 'Tax', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                        (accumulator, receipt) => {
                                          accumulator.tips += parseFloat(receipt.metadata.tips);
                                          accumulator.tax += parseFloat(receipt.metadata.tax);
                                          accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                          accumulator.total += parseFloat(receipt.total);
                                          return accumulator;
                                        },
                                        { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                      ).tax * 100) / 100
                                    },
                                    {
                                      name: 'Subtotal', value: Math.round(orders.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                        (accumulator, receipt) => {
                                          accumulator.tips += parseFloat(receipt.metadata.tips);
                                          accumulator.tax += parseFloat(receipt.metadata.tax);
                                          accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                          accumulator.total += parseFloat(receipt.total);
                                          return accumulator;
                                        },
                                        { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                      ).subtotal * 100) / 100
                                    }].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                }
                              </Pie>
                              <Tooltip />
                              {isMobile ? <Legend verticalAlign="top" /> : <Legend layout="vertical" align="right" verticalAlign="top" />}

                            </PieChart>
                          </div>







                        </div>


                        {isMobile ? <hr class="opacity-50 border-t-2 border-black-1000" /> : <></>}

                        <table
                          className="shop_table my_account_orders"
                          style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            borderSpacing: "6px", // added CSS
                          }}
                        >
                          <thead>
                            <tr>
                              <th className="order-number" style={isMobile ? {} : { width: "10%" }}>Order</th>
                              <th className="order-name" style={isMobile ? {} : { width: "30%" }}>Name</th>
                              <th className="order-status" style={isMobile ? {} : { width: "10%" }}>Status</th>
                              <th className="order-total" style={isMobile ? {} : { width: "10%" }}>Total</th>
                              <th className="order-dine-mode" style={isMobile ? {} : { width: "10%" }}>Service</th>
                              <th className="order-date" style={isMobile ? {} : { width: "15%" }}>Time</th>
                              <th className="order-details" style={isMobile ? {} : { width: "15%" }}>Detail</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders
                              .filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true)
                              .map((order) => (

                                <React.Fragment key={order.id}>

                                  <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                    <td className="order-number" data-title="OrderID"><a >{order.id}</a></td>
                                    <td className="order-name" data-title="Name" style={{ whiteSpace: "nowrap" }}>{order.name}</td>
                                    <td className="order-status" data-title="Status" style={{ whiteSpace: "nowrap" }}>{order.status}</td>
                                    <td className="order-total" data-title="Total" style={{ whiteSpace: "nowrap" }}><span className="amount">{"$" + order.total}</span></td>
                                    <td className="order-dine-mode" data-title="Service" style={{ whiteSpace: "nowrap" }}>{order.dineMode}</td>
                                    <td className="order-date" data-title="Time" style={{ whiteSpace: "nowrap" }}>
                                      <time dateTime={order.date} title={order.date} nowrap>
                                        {order.date.replace(/\/\d{4}/, '')}
                                      </time>
                                    </td>
                                    <td className="order-details" style={{ whiteSpace: "nowrap" }} data-title="Details">
                                      <button onClick={() => toggleExpandedOrderId(order.id)} style={{ cursor: "pointer" }}>
                                        {expandedOrderIds.includes(order.id) ? "Hide Details" : "View Details"}
                                      </button>
                                    </td>
                                  </tr>
                                  {expandedOrderIds.includes(order.id) && (
                                    <tr>
                                      <td colSpan={8} style={{ padding: "10px" }}>
                                        <div className="receipt">
                                          <p>{order.name}</p>
                                          <p>{order.email}</p>
                                          <p>{order.date}</p>
                                          {JSON.parse(order.receiptData).map((item, index) => (
                                            <div className="receipt-item" key={item.id}>
                                              <p>{item.name} x {item.quantity} @ $ {item.subtotal} each = $ {Math.round(item.quantity * item.subtotal * 100) / 100}</p>
                                            </div>
                                          ))}
                                          <p>Subtotal: $ {order.metadata.subtotal}</p>
                                          <p>Tax: $ {order.metadata.tax}</p>
                                          <p>Tips: $ {order.metadata.tips}</p>
                                          <p>Total: $ {order.metadata.total}</p>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {isMobile ? <hr class="opacity-50 border-t-2 border-black-1000" /> : <></>}
                                </React.Fragment>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    {activeTab === '#Menu_Setting' ? (

                      <div className="tab-pane-active" id="Menu_Setting">
                        <h6>{t("MENU SETTING")}</h6>
                        <hr />
                        {isMobile ?

                          <>
                            <div>Pick an item</div>
                            <section className="task-list" >
                              <div className="task-wrap" style={{ minHeight: '200px', maxHeight: '200px', overflowY: 'scroll', marginBottom: "10px" }}>
                                {Food_arrays.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (


                                  <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                                        <img src={task.image} alt="" />
                                      </div>
                                      <div style={{ marginLeft: "10px" }}>{task.name}</div>
                                    </div>
                                    <span style={{ cursor: 'pointer' }}
                                      onClick={() => handleUpdateForm(task.id)}
                                      className="task-card__tag task-card__tag--marketing">{t("Edit")}</span>
                                    <span className="task-card__option">
                                      <span style={{ cursor: 'pointer' }}
                                        onClick={() => deleteFood_array(task.id)}
                                        className="task-card__tag task-card__tag--design">{t("Delete")}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </section>
                          </>

                          : <></>}

                        <div>Modify Your Item</div>
                        <div className='flex'>

                          <div style={isMobile ? {} : { width: "55%" }}>
                            <ThemeProvider theme={theme} >
                              <Container component="main" style={{ padding: "0px" }}>
                                <CssBaseline />
                                <Box
                                  sx={{
                                    marginTop: 0,

                                    marginLeft: 0,

                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Box component="form" noValidate sx={{ mt: 1 }}>

                                    <Grid container >

                                      <div className='flex' style={{ width: "100%" }}>
                                        <div style={{ width: "45%", marginRight: "5%" }}>
                                          <div>
                                          <Button
  fullWidth
  variant="contained"
  sx={{ mt: 0, mb: 0, padding: "15px" }}
  onClick={autoFill}
>
  {t("Auto fill")}
</Button>
                                          </div>

                                          <TextField
        margin="normal"
        required
        fullWidth
        id="Name"
        label={t("Name")}
        name="Name"
        autoComplete="Name"
        autoFocus
        value={inputName}
        onChange={(e) => {
          setInputName(e.target.value);
          setName(e.target.value);
          setUpdateName(e.target.value);
        }}
      />
                                        </div>
                                        <div style={{ width: "50%", height: "125px", padding: "0px", borderRadius: '0.625rem' }} class="image-container">
                                          <img src={updateImage} alt="" />
                                        </div>

                                      </div>

                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="Category"
                                        label={t("Category")}
                                        name="Category"
                                        autoComplete="Category"
                                        autoFocus
                                        value={updateCategory}
                                        onChange={(e) => {
                                          setUpdateCategory(e.target.value);
                                          setCategory(e.target.value);
                                        }}
                                      />

                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="Image"
                                        label={t("Image")}
                                        name="Image"
                                        autoComplete="Image"
                                        autoFocus
                                        value={updateImage}
                                        onChange={(e) => {
                                          setUpdateImage(e.target.value);
                                          setImage(e.target.value);
                                        }}
                                      />
                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="Price"
                                        label={t("Price")}
                                        name="Price"
                                        autoComplete="Price"
                                        autoFocus
                                        value={updatePrice}
                                        onChange={(e) => {
                                          setUpdatePrice(e.target.value);
                                          setPrice(e.target.value);
                                        }}
                                      />
                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="Subtotal"
                                        label={t("Subtotal")}
                                        name="Subtotal"
                                        autoComplete="Subtotal"
                                        autoFocus
                                        value={updateSubtotal}
                                        onChange={(e) => {
                                          setUpdateSubtotal(e.target.value);
                                          setSubtotal(e.target.value);
                                        }}
                                      />

                                    </Grid>
                                    <Grid container>

                                      <Button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          updateFood_array(updateId, { name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                                        }}
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 1, mb: 1, padding: "15px" }}
                                      >
                                        {t("Update Food")}
                                      </Button>
                                      <Button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          addFood_array({ name: updateName, category: updateCategory, image: updateImage, price: updatePrice, subtotal: updateSubtotal })
                                        }}
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 1, mb: 1, padding: "15px" }}
                                      >
                                        {t("Add New Food")}
                                      </Button>

                                    </Grid>

                                  </Box>
                                </Box>
                              </Container>

                            </ThemeProvider>
                          </div>
                          {
                            isMobile ?

                              <></>
                              :
                              <section className="task-list" style={{ width: "45%" }} >
                                <div className="task-wrap" style={{ minHeight: '750px', maxHeight: '750px', overflowY: 'scroll' }}>
                                  {Food_arrays.sort((a, b) => (a.name > b.name) ? 1 : -1).map((task) => (


                                    <div className={`task-card ${task.checked ? "task-card--done" : ""}`}>
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <div style={{ width: "50px", height: "50px", padding: "5px" }} class="image-container">
                                          <img src={task.image} alt="" />
                                        </div>
                                        <div style={{ marginLeft: "10px" }}>{task.name}</div>
                                      </div>
                                      <span style={{ cursor: 'pointer' }}
                                        onClick={() => handleUpdateForm(task.id)}
                                        className="task-card__tag task-card__tag--marketing">{t("Edit")}</span>
                                      <span className="task-card__option">
                                        <span style={{ cursor: 'pointer' }}
                                          onClick={() => deleteFood_array(task.id)}
                                          className="task-card__tag task-card__tag--design">{t("Delete")}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </section>
                          }

                        </div>
                      </div>

                    ) : null}
                    {activeTab === '#Favicon_Setting' ? (

                      <div className="tab-pane-active" id="Favicon_Setting">
                        <h6>{t("OTHER SETTING")}</h6>
                        <hr />

                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <form onSubmit={handleClickTime} style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id="time"
                              label={t("Enter Time")}
                              name="time"
                              autoComplete="time"
                              autoFocus
                              style={{ width: "60%" }}
                            />
                            <Button
                              fullWidth
                              type="submit"
                              variant="contained"
                              sx={{ mt: 3, mb: 2 }}
                              style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                            >
                              {t("Change Time")}
                            </Button>
                          </form>
                          <form onSubmit={handleClickLogo} style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id="logo"
                              label={t("Enter Logo")}
                              name="logo"
                              autoComplete="logo"
                              autoFocus
                              style={{ width: "60%" }}
                            />
                            <Button
                              fullWidth
                              type="submit"
                              variant="contained"
                              sx={{ mt: 3, mb: 2 }}
                              style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                            >
                              {t("Change Logo")}
                            </Button>
                          </form>
                          <form onSubmit={handleClickAddress} style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id="address"
                              label={t("Enter Address")}
                              name="address"
                              autoComplete="address"
                              autoFocus
                              style={{ width: "60%" }}
                            />
                            <Button
                              fullWidth
                              type="submit"
                              variant="contained"
                              sx={{ mt: 3, mb: 2 }}
                              style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                            >
                              {t("Change Address")}
                            </Button>
                          </form>
                          <form onSubmit={handleClickName} style={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id="name"
                              label={t("Enter Name")}
                              name="name"
                              autoComplete="name"
                              autoFocus
                              style={{ width: "60%" }}
                            />
                            <Button
                              fullWidth
                              type="submit"
                              variant="contained"
                              sx={{ mt: 3, mb: 2 }}
                              style={{ width: "30%", marginLeft: "10px", height: "56px" }}
                            >
                              {t("Change Name")}
                            </Button>
                          </form>
                        </div>
                      </div>

                    ) : null}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Elements>
    </>
  )
}

export default Account