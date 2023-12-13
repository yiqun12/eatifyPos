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
import './stripeButton.css';
import { useCallback } from 'react';
import { collection, doc, addDoc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useRef } from "react";
import { onSnapshot, query } from "firebase/firestore";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { data_ } from '../data/data.js'
import { PieChart, Pie, Cell } from 'recharts';
import {
  LineChart,
  Line,
} from 'recharts';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import QRCode from 'qrcode.react';
import firebase from 'firebase/compat/app';
import ChangeTimeForm from "../pages/ChangeTimeForm"
import Dropdown from 'react-bootstrap/Dropdown';
import DemoFood from '../pages/demoFood'
import StripeConnectButton from '../components/StripeConnectButton'
import PaymentComponent from "../pages/PaymentComponent";

import barchar_logo from './file_barchar.png';
import files_icon from './files_icon.png';
import calendar_logo from './calendar_logo.png';
import store_icon from './store_icon.png';
import Admin_food from '../components/admin_food'
import IframeDesk from '../components/iframeDesk'
import Test_Notification_Page from "../pages/Test_Notification_Page.js";

import myImage from './check-mark.png';  // Import the image

import { ReactComponent as Dashboard_chart } from './dashboard_chart.svg';
import { ReactComponent as Todo_icon } from './todo_icon.svg';
import { ReactComponent as Menu_icon } from './menu_icon.svg';
import file_icon from './file_icon.png';
import styled from '@emotion/styled';



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
  }, [elementRef]);

  //////////////////////////////////////////////
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    console.log(window.innerWidth)
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;

  const isPC = width >= 1024;
  console.log(isPC)
  const { promise, logoutUser } = useUserContext();

  const [activeTab, setActiveTab] = useState('');
  const [activeStoreTab, setActiveStoreTab] = useState('');
  const [storeName_, setStoreName_] = useState('');
  const [storeID, setStoreID] = useState('');
  const [storeOpenTime, setStoreOpenTime] = useState('');
  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    if (!storeID) return;
    const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table");

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      clearDemoLocalStorage()
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
        localStorage.setItem(doc.id, doc.data().product);
      });
      console.log("docs");
      console.log(docs);
      setDocuments(docs);
    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [storeID]); // Dependencies for useEffect
  function clearDemoLocalStorage() {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);

    // Loop through the keys
    for (let key of keys) {
      // Check if the key includes 'demo'
      if (key.includes(storeID + "-")) {
        // Remove the item from localStorage
        if (key.includes("-isSent")) {

        } else {
          localStorage.removeItem(key);
        }

      }
    }
  }
  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
  }
  const { user, user_loading } = useUserContext();
  //console.log(user)
  useEffect(() => {
    setActiveTab(window.location.hash);
  }, []);
  function removeFromLocalStorage() {
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

  const [orders, setOrders] = useState([]);
  const [showSection, setShowSection] = useState('');


  const [revenueData, setRevenueData] = useState([
    { date: '1/1/1900', revenue: 1 }
  ]);


  const moment = require('moment');
  const [storelist, setStorelist] = useState([]);
  // console.log(orders)

  const fetchPost = async () => {
    if (activeStoreTab !== '') {
      console.log(activeStoreTab)
      console.log(user.uid)
    } else {
      return
    }

    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('TitleLogoNameContent')
      .doc(activeStoreTab)
      .collection('success_payment')
      .onSnapshot((snapshot) => {

        const newData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        console.log(newData)
        newData.sort((a, b) =>
          moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
          moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
        );
        const newItems = []; // Declare an empty array to hold the new items

        newData.forEach((item) => {
          const formattedDate = moment(item.dateTime, "YYYY-MM-DD-HH-mm-ss-SS")
            .subtract(8, "hours")
            .format("M/D/YYYY h:mma");
          console.log("formattedDate")
          console.log(formattedDate)
          const newItem = {
            id: item.id.substring(0, 4), // use only the first 4 characters of item.id as the value for the id property
            receiptData: item.receiptData,
            date: formattedDate,
            email: item.user_email,
            dineMode: item.metadata.isDine,
            status: item.powerBy,
            total: parseFloat(item.metadata.total),
            tableNum: item.tableNum,
            metadata: item.metadata
          };
          newItems.push(newItem); // Push the new item into the array
        });
        console.log("hello")
        console.log(newItems)
        setOrders(newItems)
        saveId(Math.random())
        console.log(orders)
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
        // Convert the dailyRevenue object into an array of objects with date and revenue properties
        const dailyRevenueArray = Object.keys(dailyRevenue).map(date => {
          return {
            date: date,
            revenue: Math.round(dailyRevenue[date] * 100) / 100
          };
        });
        //  console.log("hello", dailyRevenueArray)
        // Example output: [{date: '3/14/2023', revenue: 10}, {date: '3/13/2023', revenue: 10}, {date: '3/4/2023', revenue: 10}]
        setRevenueData(dailyRevenueArray)

      });
    console.log("fetchPost2");

  };

  useEffect(() => {
    if (activeStoreTab !== '') {
      fetchPost();
    }

  }, [activeStoreTab])


  useEffect(() => {
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('TitleLogoNameContent')
      .onSnapshot((snapshot) => {

        const storeData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        console.log(storeData)
        setStorelist(storeData.reverse())
      });
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
  const oneWeekAgo = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000); // 7 days ago

  const filteredData = revenueData?.filter((dataPoint) => {
    const dataPointDate = new Date(dataPoint.date);
    return dataPointDate >= oneWeekAgo && dataPointDate <= today;
  });
  const sortedData = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({ ...item, date: (new Date(item.date).getMonth() + 1) + '/' + new Date(item.date).getDate() }));

  // console.log(sortedData)

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


  const dateNow = (new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getDate().toString().padStart(2, '0') + '/' + new Date().getFullYear()
  const [selectedDate, setSelectedDate] = useState(new Date(dateNow));
  const [showChart, setShowChart] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FF8042'];

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
  //modal
  const [TitleLogoNameContent, setTitleLogoNameContent] = useState(JSON.parse(sessionStorage.getItem("TitleLogoNameContent" || "[]")));
  useEffect(() => {
    setTitleLogoNameContent(JSON.parse(sessionStorage.getItem("TitleLogoNameContent")))
  }, [id]);

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
  // Rename state variables
  const [formValues, setFormValues] = useState({
    storeName: '',
    storeNameCHI: '',
    city: '',
    picture: '',
    physical_address: '',
    State: '',
    ZipCode: '',
    Phone: ''
  });

  // Rename function for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const [previewUrl, setPreviewUrl] = useState('');

  // Rename function for file input change
  const handleFileInputChange = async (e) => {
    //const file = e.target.files[0];
    setPreviewUrl("https://media3.giphy.com/media/MydKZ8HdiPWALc0Lqf/giphy.gif")

    const selectedFile = e.target.files[0];
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
        console.log(data.result.variants[0])
        setPreviewUrl(data.result.variants[0])
        setFormValues({
          ...formValues,
          picture: data.result.variants[0],
        });
      } else {
      }
    } catch (error) {
    }


  };



  // using the below to control if suboption popping and popping out depending on which store is selected on the side bar
  const [activeStoreId, setActiveStoreId] = useState(null);
  // Rename function for form submission
  const handleFormSubmit = async (e, name, storeNameCHI, address, image, id, physical_address, State, ZipCode, Phone) => {

    e.preventDefault();
    // Here you can access formValues and perform actions like sending it to a server
    console.log(formValues);
    console.log(id)
    const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", id);

    // Update the 'key' field to the value retrieved from localStorage
    await updateDoc(docRef, {
      Name: formValues.storeName !== '' ? formValues.storeName : name,
      storeNameCHI: formValues.storeNameCHI !== '' ? formValues.storeNameCHI : storeNameCHI,
      Image: formValues.picture !== '' ? formValues.picture : image,
      Address: formValues.city !== '' ? formValues.city : address,
      Phone: formValues.Phone !== '' ? formValues.Phone : Phone,
      ZipCode: formValues.ZipCode !== '' ? formValues.ZipCode : ZipCode,
      State: formValues.State !== '' ? formValues.State : State,
      physical_address: formValues.physical_address !== '' ? formValues.physical_address : physical_address,
    });
    alert("Updated Successful");
  };
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    setNotificationData([
    ]);
  }, [storeID])


  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    if (!storeID) return;
    const collectionRef = collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', storeID, 'PendingDineInOrder');

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ orderId: doc.id, ...doc.data() });
      });

      console.log("PendingDineInOrder");
      console.log(docs);

      setNotificationData(docs)
      setDocuments(docs);
    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [storeID]); // Dependencies for useEffect


  // for the hashtage # check in URL and then redirect to correct location
  useEffect(() => {
    function handleHashChange() {
      const hashValue = window.location.hash;
      console.log("hashvalue: ", hashValue)
      // example URL http://localhost:3000/account#code?store=dnd21
      // example hash value #code?store=dnd21

      // Split the hash value by the "?" character
      const parts = hashValue.split('?');

      // The part before the "?" mark will be in parts[0]
      const partBeforeQuestionMark = parts[0];

      console.log("Part before '?': ", partBeforeQuestionMark);

      // The part before the "?" mark will be in parts[0]
      const partAfterQuestionMark = parts[1];

      console.log("Part after '?': ", partAfterQuestionMark);

      // hashRedirect(hashValue);
      switch (partBeforeQuestionMark) {
        case '#createStore':
          redirectCreateStore(hashValue);
          break;
        case '#person':
          redirectPerson();
          break;
        case '#charts':
          redirectCharts(partAfterQuestionMark);
          break;
        case '#book':
          redirectMenuBook(partAfterQuestionMark);
          break;
        case '#code':
          redirectCode(partAfterQuestionMark);
          break;
        case '#cards':
          redirectCards(partAfterQuestionMark);
          break;
        case '#settings':
          redirectSettings(partAfterQuestionMark);
          break;
        // Add more cases for other hash values as needed...

        // this default is for the storeName cases
        default:
          hashRedirect(hashValue);
          break;
      }
    }


    // Define a function to fetch storelist and return it as a promise
    // this allows you to wait until storelist is set and use it in functions instead of empty []
    function fetchStorelist() {
      return new Promise((resolve, reject) => {
        const unsubscribe = firebase
          .firestore()
          .collection('stripe_customers')
          .doc(user.uid)
          .collection('TitleLogoNameContent')
          .onSnapshot((snapshot) => {
            const storeData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            console.log(storeData);
            resolve(storeData.reverse());
            unsubscribe(); // Unsubscribe from the snapshot listener once data is fetched
          });
      });
    }

    // these redirects are to simulate the click of the 6 tab options of each store
    function redirectPerson() {

      setShowSection('')
    }

    async function redirectCharts(partAfterQuestionMark) {
      // Check if partAfterQuestionMark is like store=dnd21
      if (partAfterQuestionMark.includes('store=')) {
        // Split partAfterQuestionMark by '=' to get the store value
        const parts = partAfterQuestionMark.split('=');

        // The second part of the resulting array (parts[1]) will be the store value
        const storeValue = parts[1];

        console.log("Store Value:", storeValue);

        try {
          const storelist = await fetchStorelist();
          console.log("storelist: ", storelist);

          // Find the index of the object whose .Name matches storeValue
          const index = storelist.findIndex(data => data.id === storeValue);

          if (index !== -1) {
            // The object was found, you can access it using storelist[index]
            const selectedStore = storelist[index];

            // Now, you can perform actions with the selected store object
            console.log("Selected Store:", selectedStore);

            // Example of using the selected store object
            setActiveTab(`#${selectedStore.id}`);
            setActiveStoreTab(selectedStore.id);
            setStoreName_(selectedStore.Name);
            setStoreID(selectedStore.id);
            setActiveStoreId(selectedStore.id)
            setStoreOpenTime(selectedStore.Open_time)
          } else {
            // The object with the specified Name was not found in the array
            console.log("Store not found in storelist");
          }
        } catch (error) {
          console.error("Error fetching storelist:", error);
        }
      }
      setShowSection('sales')
    }

    async function redirectMenuBook(partAfterQuestionMark) {
      // Check if partAfterQuestionMark is like store=dnd21
      if (partAfterQuestionMark.includes('store=')) {
        // Split partAfterQuestionMark by '=' to get the store value
        const parts = partAfterQuestionMark.split('=');

        // The second part of the resulting array (parts[1]) will be the store value
        const storeValue = parts[1];

        console.log("Store Value:", storeValue);

        try {
          const storelist = await fetchStorelist();
          console.log("storelist: ", storelist);

          // Find the index of the object whose .Name matches storeValue
          const index = storelist.findIndex(data => data.id === storeValue);

          if (index !== -1) {
            // The object was found, you can access it using storelist[index]
            const selectedStore = storelist[index];

            // Now, you can perform actions with the selected store object
            console.log("Selected Store:", selectedStore);

            // Example of using the selected store object
            setActiveTab(`#${selectedStore.id}`);
            setActiveStoreTab(selectedStore.id);
            setStoreName_(selectedStore.Name);
            setStoreID(selectedStore.id);
            setActiveStoreId(selectedStore.id)
            setStoreOpenTime(selectedStore.Open_time)
          } else {
            // The object with the specified Name was not found in the array
            console.log("Store not found in storelist");
          }
        } catch (error) {
          console.error("Error fetching storelist:", error);
        }
      }
      setShowSection('menu')
    }

    async function redirectCards(partAfterQuestionMark) {
      // Check if partAfterQuestionMark is like store=dnd21
      if (partAfterQuestionMark.includes('store=')) {
        // Split partAfterQuestionMark by '=' to get the store value
        const parts = partAfterQuestionMark.split('=');

        // The second part of the resulting array (parts[1]) will be the store value
        const storeValue = parts[1];

        console.log("Store Value:", storeValue);

        try {
          const storelist = await fetchStorelist();
          console.log("storelist: ", storelist);

          // Find the index of the object whose .Name matches storeValue
          const index = storelist.findIndex(data => data.id === storeValue);

          if (index !== -1) {
            // The object was found, you can access it using storelist[index]
            const selectedStore = storelist[index];

            // Now, you can perform actions with the selected store object
            console.log("Selected Store:", selectedStore);

            // Example of using the selected store object
            setActiveTab(`#${selectedStore.id}`);
            setActiveStoreTab(selectedStore.id);
            setStoreName_(selectedStore.Name);
            setStoreID(selectedStore.id);
            setActiveStoreId(selectedStore.id)
            setStoreOpenTime(selectedStore.Open_time)
          } else {
            // The object with the specified Name was not found in the array
            console.log("Store not found in storelist");
          }
        } catch (error) {
          console.error("Error fetching storelist:", error);
        }
      }
      setShowSection('stripeCard')
    }

    // Modify redirectCode to use async/await with the fetchStorelist function
    async function redirectCode(partAfterQuestionMark) {
      // Check if partAfterQuestionMark is like store=dnd21
      if (partAfterQuestionMark.includes('store=')) {
        // Split partAfterQuestionMark by '=' to get the store value
        const parts = partAfterQuestionMark.split('=');

        // The second part of the resulting array (parts[1]) will be the store value
        const storeValue = parts[1];

        console.log("Store Value:", storeValue);

        try {
          const storelist = await fetchStorelist();
          console.log("storelist: ", storelist);

          // Find the index of the object whose .Name matches storeValue
          const index = storelist.findIndex(data => data.id === storeValue);

          if (index !== -1) {
            // The object was found, you can access it using storelist[index]
            const selectedStore = storelist[index];

            // Now, you can perform actions with the selected store object
            console.log("Selected Store:", selectedStore);

            // Example of using the selected store object
            setActiveTab(`#${selectedStore.id}`);
            setActiveStoreTab(selectedStore.id);
            setStoreName_(selectedStore.Name);
            setStoreID(selectedStore.id);
            setActiveStoreId(selectedStore.id)
            setStoreOpenTime(selectedStore.Open_time)
          } else {
            // The object with the specified Name was not found in the array
            console.log("Store not found in storelist");
          }
        } catch (error) {
          console.error("Error fetching storelist:", error);
        }
      }
      setShowSection('qrCode');
    }

    async function redirectSettings(partAfterQuestionMark) {
      // Check if partAfterQuestionMark is like store=dnd21
      if (partAfterQuestionMark.includes('store=')) {
        // Split partAfterQuestionMark by '=' to get the store value
        const parts = partAfterQuestionMark.split('=');

        // The second part of the resulting array (parts[1]) will be the store value
        const storeValue = parts[1];

        console.log("Store Value:", storeValue);

        try {
          const storelist = await fetchStorelist();
          console.log("storelist: ", storelist);

          // Find the index of the object whose .Name matches storeValue
          const index = storelist.findIndex(data => data.id === storeValue);

          if (index !== -1) {
            // The object was found, you can access it using storelist[index]
            const selectedStore = storelist[index];

            // Now, you can perform actions with the selected store object
            console.log("Selected Store:", selectedStore);

            // Example of using the selected store object
            setActiveTab(`#${selectedStore.id}`);
            setActiveStoreTab(selectedStore.id);
            setStoreName_(selectedStore.Name);
            setStoreID(selectedStore.id);
            setActiveStoreId(selectedStore.id)
            setStoreOpenTime(selectedStore.Open_time)
          } else {
            // The object with the specified Name was not found in the array
            console.log("Store not found in storelist");
          }
        } catch (error) {
          console.error("Error fetching storelist:", error);
        }
      }
      setShowSection('store')
    }

    // this redirect takes you to the store creation settings/page
    function redirectCreateStore() {
      setShowSection('');
      setActiveTab('#Revenue_Chart');
      setStoreName_('');
    }

    function hashRedirect(hashValue) {
      // console.log('Called function for #example1');
      // handleTabClick(e, `#${data.id}`);
      const valueWithoutHash = hashValue.substring(1);

      console.log(storelist);
      // handleTabClick(e, `#${data.id}`);

      // setActiveTab(tabHref);
      // setActiveStoreTab(data.id);
      // setShowSection('sales');
      // setStoreName_(data.Name);
      // setStoreID(data.id);
      // setStoreOpenTime(data.Open_time);
      // setShowSection('store')

      setActiveTab(hashValue);
      setActiveStoreTab(valueWithoutHash);
      setStoreName_(valueWithoutHash);
      setStoreID(valueWithoutHash);
      setActiveStoreId(valueWithoutHash);

      // if there is a new store, use the default open time
      const default_Open_time = `{"0":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"1":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"2":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"3":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"4":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"5":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"6":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"},"7":{"timeRanges":[{"openTime":"0000","closeTime":"2359"}],"timezone":"ET"}}`;

      // checks if the store Name is already in the list of stores already created
      const foundObject = storelist.find(item => item.Name === valueWithoutHash);

      // if so, then use the time saved before
      if (foundObject) {
        // Do something with the found object
        setStoreOpenTime(foundObject.Open_time);
      } else {
        // else use the default settings
        setStoreOpenTime(default_Open_time);
      }

      setShowSection('store')
      // const pathWithoutHash = window.location.pathname + window.location.search;
      // history.push(pathWithoutHash);

      // store.id = store.Name
      // store.Open_time = `{"0":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"1":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"2":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"3":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"4":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"5":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"6":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"7":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"}}`


      console.log("Hello hasRedirect works: ", valueWithoutHash);
    }

    // Call the function on mount to check initial hash value
    handleHashChange();

    // Listen to the hash change
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup the listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // passes in the data for the notification child and updates as the value changes (this is to be loaded in as data from cloud)
  const [notificationData, setNotificationData] = useState([]);

  // lifting the variable of # under review from the Test_notication_Page component lists
  const [numberReviewVariable, setNumberReviewVariable] = useState(notificationData ? notificationData.length : 0);


  useEffect(() => {
    // console.log("numberReviewVariable has been updated:", numberReviewVariable);
    // Perform any additional logic in the parent component when the number changes
    setNumberReviewVariable(notificationData.length);
  }, [notificationData]);



  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };


  return (
    <div>

      <div>
        <style>
          {`
          /* Webpixels CSS */
          @import url(https://unpkg.com/@webpixels/css@1.1.5/dist/index.css);

          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
        </style>
        &nbsp;
        {isPC ?
          <button onClick={toggleVisibility}>
            {isVisible ? <div>
              <button>
                <i class="bi bi-backspace"> Hide Side Menu </i>
              </button>
            </div> :

              <div>

                <button>
                  <i class="bi bi-bookmarks"> Open Side Menu </i>
                </button>
              </div>
            }
          </button>
          :
          <div></div>
        }
        <div className="d-flex flex-column flex-lg-row h-lg-full bg-surface-secondary">

          {isVisible && (
            <div>
              {isPC ? <nav
                className="navbar navbar-vertical show z-0 h-lg-screen navbar-expand-lg px-0 py-3 navbar-light bg-white border-bottom border-bottom-lg-0 border-end-lg"
                id="navbarVertical"
              >

                <div className="container-fluid" style={{ minHeight: "0px" }}>

                  <button
                    className={`mt-2 btn mr-2 ml-2 ${activeTab === '#profile' ? 'border-black' : ''}`}
                    onClick={(e) => {
                      handleTabClick(e, '#profile')
                      setActiveStoreId("")
                      window.history.pushState({}, '', '/account');
                    }
                    }
                  >
                    <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: 'currentColor' }} class="bi bi-person" viewBox="0 0 16 16">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                        </svg>
                      </i>
                      Account
                    </div>
                  </button>
                  <button
                    className={`mt-2 btn mr-2 ml-2 ${activeTab === '#Revenue_Chart' ? 'border-black' : ''}`}
                    onClick={(e) => {
                      setShowSection('');
                      handleTabClick(e, '#Revenue_Chart');
                      setStoreName_('');
                      setActiveStoreId('')
                      window.location.hash = 'createStore'

                    }}
                  >
                    <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-pencil"></i>

                      {" Create Store"}
                    </div>
                  </button>
                  {storelist?.map((data, index) => (
                    <div>                <div
                      className={`mt-2 btn mr-2 ml-2 ${activeTab === `#${data.id}` ? 'border-black' : ''}`}
                      onClick={(e) => {
                        handleTabClick(e, `#${data.id}`);
                        setActiveStoreTab(data.id);
                        setShowSection('sales');
                        setStoreName_(data.Name);
                        setStoreID(data.id);
                        setActiveStoreId(data.id)
                        setStoreOpenTime(data.Open_time)
                        window.location.hash = `charts?store=${data.id}`;
                      }}
                    >
                      <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <i class="bi bi-house"> {data.id}</i>

                      </div>
                    </div>

                      {activeStoreId === data.id && (
                        <ul className={`nav nav-tabs mt-4 overflow-x border-0 flex flex-col`}>
                          <div>
                            <li className={`nav-item p-0`} style={{ width: "80%", margin: "auto", borderColor: "transparent !important" }}
                              onClick={() => {
                                setShowSection('sales')
                                window.location.hash = `charts?store=${data.id}`;
                              }}>
                              <a className={`d-flex align-items-center pt-0 nav-link ${showSection === `sales` ? 'active' : ''}`} style={{ marginLeft: "0", border: "0px" }}>
                                <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line" viewBox="0 0 16 16">
                                    <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
                                  </svg>
                                </i>
                                <span style={{ marginLeft: "5%" }}>Daily Revenue</span>
                              </a>
                            </li>
                            <li className={`nav-item p-0`}
                              onClick={() => {
                                setShowSection('menu')
                                window.location.hash = `book?store=${data.id}`;
                              }}
                              style={{ width: "80%", margin: "auto" }}
                            >
                              <a className={`d-flex align-items-center pt-0 nav-link ${showSection === `menu` ? 'active' : ''}`} style={{ border: "0px" }}>
                                <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-3" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z" />
                                  </svg>
                                </i>
                                <span style={{ marginLeft: "5%" }}>Menu Settings</span>

                              </a>

                            </li>

                            <li className={`nav-item p-0`} onClick={() => {
                              setShowSection('qrCode')
                              window.location.hash = `code?store=${data.id}`
                            }} style={{ width: "80%", margin: "auto" }}>
                              <a className={`d-flex align-items-center pt-0 nav-link ${showSection === `qrCode` ? 'active' : ''}`} style={{ border: "0px" }}>
                                <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-columns-gap" viewBox="0 0 16 16">
                                    <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
                                  </svg>
                                </i>
                                <span style={{ marginLeft: "5%" }}>Dine In Ordering</span>
                              </a>
                            </li>
                            <li className={`nav-item p-0`}
                              onClick={() => {
                                setShowSection('stripeCard')
                                window.location.hash = `cards?store=${data.id}`;
                              }}
                              style={{ width: "80%", margin: "auto" }}
                            >
                              <a className={`d-flex align-items-center pt-0 nav-link ${showSection === `stripeCard` ? 'active' : ''}`} style={{ border: "0px" }}>
                                <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-right-dots" viewBox="0 0 16 16">
                                    <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z" />
                                    <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                  </svg>
                                </i>
                                <span style={{ marginLeft: "5%" }}>Notification <span
                                  style={{
                                    display: 'inline-flex', // changed from 'flex' to 'inline-flex'
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: 'blue',
                                    borderRadius: '50%',
                                    color: 'white',
                                    fontSize: '10px',
                                    verticalAlign: 'middle' // added to vertically center the circle
                                  }}
                                >
                                  {numberReviewVariable}
                                </span> </span>
                              </a>

                            </li>
                            <li className={`nav-item border-b-0 p-0`}
                              onClick={() => {
                                setShowSection('store')
                                window.location.hash = `settings?store=${data.id}`;
                              }}
                              style={{ width: "80%", margin: "auto", border: "0px" }}
                            >
                              <a className={`d-flex align-items-center pt-0 nav-link ${showSection === `store` ? 'active' : ''}`} style={{ marginRight: "0", border: "0px" }}>
                                <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                  </svg>
                                </i>

                                <span style={{ marginLeft: "5%" }}>Store Settings</span>

                              </a>

                            </li>
                          </div>


                        </ul>)
                      }


                    </div>


                  ))}


                  <button
                    className={`mt-2 btn mr-2 ml-2`}
                    onClick={(e) => {
                      logoutUser();
                      removeFromLocalStorage();
                    }
                    }
                  >
                    <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-box-arrow-left"></i>

                      {" Sign Out"}
                    </div>
                  </button>

                </div>
              </nav> : <div></div>}
            </div>
          )}

          <div className="h-screen flex-grow-1 overflow-y-lg-auto" style={{
            backgroundColor: 'white', // Set the background color to white
          }}>
            {!isPC ?
              <header className="bg-surface-primary border-bottom pt-0">
                <div className="container-fluid">
                  <div className="mb-npx">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-0 mt-2" style={{ "cursor": "pointer" }}>
                        <h1 className="h2 ls-tight active">
                          {activeTab === `#profile` || storeName_ === '' ? 'Account' : storeName_}

                        </h1>
                      </div>
                      <div className="text-sm-end">
                        <div className="mx-n1">

                          <a className="btn d-inline-flex btn-sm btn-outline-primary mx-1">
                            <span className="pe-2">
                              <i className="bi bi-box-arrow-left"></i>
                            </span>
                            <span
                              onClick={() => {
                                logoutUser();
                                removeFromLocalStorage();
                              }}>
                              {t("Sign Out")}
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div class="mt-2 mb-2">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="neutral"
                          id="dropdown-basic"
                          className='btn d-inline-flex btn-sm btn-neutral border-base mr-1'
                          style={{ alignItems: 'center', backgroundColor: "#f7f7f7" }}
                        >
                          <span className="pe-2">
                            <i class="bi bi-house"></i>
                          </span>
                          <span>{"Edit Store"}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {
                            storelist && storelist.length > 0 ?
                              storelist.map((data, index) => (
                                <Dropdown.Item
                                  onClick={(e) => {
                                    handleTabClick(e, `#${data.id}`);
                                    setActiveStoreTab(data.id);
                                    setShowSection('sales');
                                    setStoreName_(data.Name);
                                    setStoreID(data.id);
                                    setActiveStoreId(data.id)
                                    setStoreOpenTime(data.Open_time)
                                    window.location.hash = `charts?store=${data.id}`;
                                  }}
                                >
                                  {data.id}
                                </Dropdown.Item>
                              )) :
                              <Dropdown.Item onClick={(e) => e.preventDefault()}>No Store Available</Dropdown.Item>
                          }
                        </Dropdown.Menu>
                      </Dropdown>


                      <a
                        onClick={(e) => {
                          setShowSection('');
                          handleTabClick(e, '#Revenue_Chart');
                          setStoreName_('');
                          setActiveStoreId('')
                          window.location.hash = 'createStore'
                        }}
                        class="btn d-inline-flex btn-sm btn-primary mx-1">
                        <span class=" pe-2">
                          <i className="bi bi-pencil"></i>

                        </span>
                        <span> {"Create Store"}</span>
                      </a>
                    </div>

                    <ul className={`nav nav-tabs mt-4 overflow-x border-0 ${isMobile ? 'd-flex justify-content-between' : ''}`}>
                      <li className={`nav-item p-0`}
                        onClick={(e) => {
                          handleTabClick(e, '#profile')
                          setActiveStoreId("")
                          window.history.pushState({}, '', '/account');
                        }
                        }
                      >
                        <a className={`pt-0 nav-link ${(activeTab === '#profile' || activeTab === '') && isPC ? 'active' : ''}`}>
                          <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: isPC ? 'white' : 'currentColor' }} class="bi bi-person" viewBox="0 0 16 16">
                              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                            </svg>
                          </i>
                        </a>

                      </li>
                      {activeTab === `#profile` || storeName_ === '' || isPC ?

                        <div></div> :

                        <>
                          <li className={`nav-item p-0`}
                            onClick={() => {
                              setShowSection('sales')
                              window.location.hash = `charts?store=${storeID}`;
                            }}
                          >
                            <a className={`pt-0 nav-link ${showSection === `sales` ? 'active' : ''}`}>
                              <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-line" viewBox="0 0 16 16">
                                  <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
                                </svg>
                              </i>
                            </a>

                          </li>
                          <li className={`nav-item p-0`}
                            onClick={() => {
                              setShowSection('menu')
                              window.location.hash = `book?store=${storeID}`;
                            }}

                          >
                            <a className={`pt-0 nav-link ${showSection === `menu` ? 'active' : ''}`}>
                              <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: isPC ? 'white' : 'currentColor' }} class="bi bi-diagram-3" viewBox="0 0 16 16">
                                  <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z" />
                                </svg>
                              </i>
                            </a>

                          </li>

                          <li className={`nav-item p-0`} onClick={() => {
                            setShowSection('qrCode')
                            window.location.hash = `code?store=${storeID}`
                          }}>
                            <a className={`pt-0 nav-link ${showSection === `qrCode` ? 'active' : ''}`}>
                              <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: isPC ? 'white' : 'currentColor' }} class="bi bi-columns-gap" viewBox="0 0 16 16">
                                  <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
                                </svg>
                              </i>
                            </a>
                          </li>
                          <li className={`nav-item p-0`}
                            onClick={() => {
                              setShowSection('stripeCard')
                              window.location.hash = `cards?store=${storeID}`;
                            }}                      >
                            <a className={`pt-0 nav-link ${showSection === `stripeCard` ? 'active' : ''}`}>
                              <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: isPC ? 'white' : 'currentColor' }} class="bi bi-chat-right-dots" viewBox="0 0 16 16">
                                  <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z" />
                                  <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                </svg>
                              </i>
                            </a>

                          </li>
                          <li className={`nav-item p-0`}
                            onClick={() => {
                              setShowSection('store')
                              window.location.hash = `settings?store=${storeID}`;
                            }}

                          >
                            <a className={`pt-0 nav-link ${showSection === `store` ? 'active' : ''}`}>
                              <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" style={{ fill: isPC ? 'white' : 'currentColor' }} class="bi bi-gear" viewBox="0 0 16 16">
                                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                </svg>
                              </i>
                            </a>

                          </li>

                        </>}



                    </ul>
                  </div>
                </div>
              </header>
              :
              <div></div>}

            <div style={{ "borderRadius": "0" }}>

              <div id="card_element" style={{
                backgroundColor: 'white', // Set the background color to white
              }} className={`card-body tab-content pt-0`} ref={elementRef}>
                {user_loading ?
                  <div>
                    Loading...
                  </div>
                  : <div>
                    {activeTab === '#profile' || activeTab === '' ? (

                      <div className="tab-pane active mt-4" id="profile">

                        <a class="nav-link d-flex align-items-center p-0">

                          <div>
                            <span class="d-block text-md font-semibold">
                              <i class="bi bi-person"></i>
                              {" "}

                              {user ? user.displayName : ""}
                            </span>
                            <span class="d-block text-sm text-muted font-regular">
                              <i class="bi bi-envelope"></i>
                              {" "}

                              {(user) ? user.email : ""}

                            </span>
                          </div>

                        </a>
                        <h5>{t("Past Orders:")}</h5>
                        <PayFullhistory />
                      </div>
                    ) : null}

                    {activeTab === '#Revenue_Chart' ? (
                      <div className="tab-pane-active" id="Revenue_Chart">
                        {/*create your store*/}
                        <DemoFood />
                      </div>


                    ) : null}

                    {storelist?.map((data, index) => (
                      activeTab === `#${data.id}` ? (
                        <div className="tab-pane-active" id="History">

                          {showSection === 'menu' ? <div>

                            <Admin_food store={data.id} />
                          </div> : <div></div>
                          }
                          {showSection === 'qrCode' ? <div>

                            <IframeDesk store={data.id} acct={data.stripe_store_acct}></IframeDesk>

                            {/* <QRCode value={"google.com"} /> */}
                            <hr />
                          </div> : <div></div>
                          }
                          {showSection === 'stripeCard' ? <div>
                            <Test_Notification_Page storeID={data.id} reviewVar={numberReviewVariable} setReviewVar={setNumberReviewVariable} sortedData={notificationData} setSortedData={setNotificationData} />
                          </div> : <div></div>
                          }

                          {showSection === 'store' ? <div>
                            <div className=''>
                              <div className='mx-auto '>
                                <div className='mt-3 rounded-lg w-full  max-h-[200px] relative'>
                                  <div className='rounded-lg absolute  w-full h-full max-h-[200px] bg-black/40 text-gray-200 flex flex-col justify-center'>
                                    <h1 className='px-4 text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-justify'><span className='text-orange-500'>{data.Name}</span></h1>
                                    <h1 className='px-4 text-white font-bold'>@{data.Address}</h1>
                                  </div>
                                  <img
                                    className="rounded-lg w-full max-h-[200px] object-cover"
                                    src={(previewUrl !== '') ? previewUrl : data?.Image}
                                    alt="#"
                                  />
                                </div>
                              </div>
                            </div>
                            <form className="w-full mb-2" onSubmit={(e) => handleFormSubmit(e, data?.Name, data?.storeNameCHI, data?.Address, data?.Image, data?.id, data?.physical_address, data?.State, data?.ZipCode, data?.Phone)}>
                              <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="storeName">
                                    Store Display Name
                                  </label>
                                  <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                    id="storeName"
                                    type="text"
                                    name="storeName"
                                    value={formValues.storeName}
                                    onChange={handleInputChange}
                                    placeholder={data?.Name}
                                  />
                                </div>
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="storeNameCHI">
                                    Store Display Name in Second Language (Optional)
                                  </label>
                                  <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                    id="storeNameCHI"
                                    type="text"
                                    name="storeNameCHI"
                                    value={formValues.storeNameCHI}
                                    onChange={handleInputChange}
                                    placeholder={data?.storeNameCHI}
                                  />
                                </div>
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="physical_address">
                                    Display Address
                                  </label>
                                  <input
                                    className=
                                    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="physical_address"
                                    type="text"
                                    name="physical_address"
                                    value={formValues.physical_address}
                                    onChange={handleInputChange}
                                    placeholder={data?.physical_address}
                                  />
                                </div>
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="city">
                                    Display City
                                  </label>
                                  <input
                                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={formValues.city}
                                    onChange={handleInputChange}
                                    placeholder={data?.Address}
                                  />
                                </div>

                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="State">
                                    State
                                  </label>
                                  <input
                                    className=
                                    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="State"
                                    type="text"
                                    name="State"
                                    value={formValues.State}
                                    onChange={handleInputChange}
                                    placeholder={data?.State}
                                  />
                                </div>
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="ZipCode">
                                    Zip Code
                                  </label>
                                  <input
                                    className=
                                    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="ZipCode"
                                    type="text"
                                    name="ZipCode"
                                    value={formValues.ZipCode}
                                    onChange={handleInputChange}
                                    placeholder={data?.ZipCode}
                                  />
                                </div>
                                <div className="w-full px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="Phone">
                                    Phone
                                  </label>
                                  <input
                                    className=
                                    "appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    id="Phone"
                                    type="text"
                                    name="Phone"
                                    value={formValues.Phone}
                                    onChange={handleInputChange}
                                    placeholder={data?.Phone}
                                  />
                                </div>
                              </div>
                              <div className="mb-6">
                                <label htmlFor="formFileLg" className="mb-2 inline-block text-neutral-700 dark:text-neutral-200">
                                  Upload Your Store Front Here
                                </label>
                                <input
                                  className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                                  id="formFileLg"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileInputChange}
                                />
                              </div>

                              <div className="flex mt-3">
                                <div style={{ width: "50%" }}></div>
                                <div className="flex justify-end" style={{ margin: "auto", width: "50%" }}>
                                  <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </form>



                            <hr />
                            <div className=' mb-6' >

                              {data?.stripe_store_acct === "" ?
                                <div>
                                  <div className='mb-1'>Online Payment Options:</div>

                                  <div>
                                    <StripeConnectButton store={data.id} user={user.uid}></StripeConnectButton>

                                  </div></div>

                                :
                                <div>
                                  <div className='mb-1'>Online Payment Options:</div>

                                  <div className='mb-1' style={{ display: 'flex' }}>

                                    <img className='mr-2'
                                      src={myImage}  // Use the imported image here
                                      alt="Description"
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                      }}
                                    />
                                    You already connect with Stripe to receive online payment!
                                  </div>

                                  <PaymentComponent City={data?.Address} Address={data?.physical_address} State={data?.State} storeDisplayName={data?.Name} ZipCode={data?.ZipCode} storeID={data?.id} connected_stripe_account_id={data?.stripe_store_acct} />
                                </div>
                              }
                            </div>
                            <hr />


                            <div>Operating Hours:</div>
                            <ChangeTimeForm storeID={storeID} storeOpenTime={storeOpenTime} />


                          </div> : <div></div>
                          }


                          {showSection === 'sales' ? <div>
                            <div className="flex mt-3">
                              <div className={`w-50 ${isMobile ? 'mobile-class' : 'desktop-class'}`}>
                                <div className="d-flex align-items-center mb-2">
                                  <div className="ms-2" style={{ fontWeight: 'bold', fontSize: '13px' }}>Select a date (e.g. today)</div>
                                </div>
                                <input
                                  style={{ width: "150px" }}
                                  type="date"
                                  className="form-control form-control-sm mb-2"
                                  value={selectedDate ? selectedDate.toISOString().slice(0, 10) : ''}
                                  onChange={(event) => {
                                    setSelectedDate(
                                      new Date(event.target.value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1'))
                                    );
                                  }}
                                />
                                <div>
                                  <button
                                    onClick={() => setSelectedDate(new Date(dateNow))}
                                    className="btn btn-sm btn-primary d-flex align-items-center mx-1 mb-2"
                                  >
                                    <i className="bi bi-calendar2-check pe-2"></i>
                                    <span>Today's Orders</span>
                                  </button>
                                  <button
                                    onClick={() => setSelectedDate(null)}
                                    className="btn btn-sm btn-secondary d-flex align-items-center mx-1 mb-2"
                                  >
                                    <i className="bi bi-calendar-range pe-2"></i>
                                    <span>List All Orders</span>
                                  </button>
                                  <button
                                    onClick={() => setShowChart(!showChart)}
                                    className="btn btn-sm btn-info d-flex align-items-center mx-1 mb-2"
                                  >
                                    <i className={`bi ${!showChart ? 'bi-bar-chart' : 'bi-eye-slash'} pe-2`}></i>
                                    <span>{!showChart ? 'Show Chart' : 'Hide Chart'}</span>
                                  </button>
                                </div>
                              </div>

                              <div style={isMobile ? { "width": "50%" } : {}}>

                                <PieChart width={isMobile ? width2 / 2 : 300} height={250}>
                                  <Pie
                                    cx={80} // Move the pie to the left by adjusting the cx value
                                    data={[
                                      {
                                        name: 'Subtotal', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                          (accumulator, receipt) => {
                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                            accumulator.total += parseFloat(receipt.total);
                                            return accumulator;
                                          },
                                          { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                        ).subtotal * 100) / 100
                                      },

                                      {
                                        name: 'Tax', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
                                          (accumulator, receipt) => {
                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                            accumulator.total += parseFloat(receipt.total);
                                            return accumulator;
                                          },
                                          { tips: 0, tax: 0, subtotal: 0, total: 0 }
                                        ).tax * 100) / 100
                                      }, {
                                        name: 'Gratuity', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                    ]}
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={75}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {
                                      [
                                        {
                                          name: 'Gratuity', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                          name: 'Tax', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                          name: 'Subtotal', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                  {isMobile ? (
                                    <Legend verticalAlign="top" content={renderLegend} />
                                  ) : (
                                    <Legend layout="vertical" align="right" verticalAlign="top" content={renderLegend} />
                                  )}
                                </PieChart>


                              </div>

                            </div>
                            {showChart ?
                              <div>
                                <hr></hr>
                                <LineChart className="chart" width={width2 - 75} height={250} data={sortedData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                                </LineChart>

                              </div> :

                              <div></div>
                            }
                            {isMobile ? <hr class="opacity-50 border-t-2 border-black-1000" /> : <hr class="opacity-50 border-t-2 border-black-1000" />}

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
                                  <th className="order-number" style={isMobile ? {} : { width: "10%" }}>Order ID</th>
                                  <th className="order-name" style={isMobile ? {} : { width: "10%" }}>Dining Table</th>
                                  <th className="order-status" style={isMobile ? {} : { width: "30%" }}>Status</th>
                                  <th className="order-total" style={isMobile ? {} : { width: "10%" }}>Total</th>
                                  <th className="order-date" style={isMobile ? {} : { width: "25%" }}>Time</th>
                                  <th className="order-details" style={isMobile ? {} : { width: "15%" }}>Detail</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true)?.map((order) => (

                                  <React.Fragment key={order.id}>

                                    <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                      <td className="order-number notranslate" data-title="OrderID"><a >{order.id}</a></td>
                                      <td className="order-name notranslate" data-title="Name" style={{ whiteSpace: "nowrap" }}>{order.tableNum === "" ? "Takeout" : order.tableNum}</td>
                                      <td className="order-status" data-title="Status" style={{ whiteSpace: "nowrap" }}>{order.status}</td>
                                      <td className="order-total" data-title="Total" style={{ whiteSpace: "nowrap" }}><span className="amount">{"$" + order.total}</span></td>
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
                                                <p>
                                                {sessionStorage.getItem("Google-language")?.includes("Chinese") || sessionStorage.getItem("Google-language")?.includes("中") ? t(item?.CHI) : (item?.name)}
                                                 x {item.quantity} @ ${item.subtotal} each = ${Math.round(item.quantity * item.subtotal * 100) / 100}</p>
                                              </div>
                                            ))}
                                            <p>Subtotal: $ {order.metadata.subtotal}</p>
                                            <p>Tax: $ {order.metadata.tax}</p>
                                            <p>Gratuity: $ {order.metadata.tips}</p>
                                            <p>Total: $ {order.metadata.total}</p>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                            : <div></div>
                          }

                        </div>
                      ) : null
                    ))}
                    {activeTab === '#Favicon_Setting' ? (

                      <div className="tab-pane-active" id="Favicon_Setting">
                        <h6>{t("OTHER SETTING")}</h6>
                        <hr />


                      </div>

                    ) : null}
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}


const renderLegend = (props) => {
  const { payload } = props;
  let revenue = 0;
  payload.forEach(entry => {
    revenue += entry.payload.value;
  });

  return (
    <ul>
      {revenue !== 0 ? (
        <div>
          <li key="revenue" style={{ fontWeight: 'bold', fontWeight: 'bold', fontSize: '13px' }}>
            Revenue (${revenue.toFixed(2)})
          </li>
          {payload.map((entry, index) => (
            <li key={`item-${index}`} style={{ color: entry.color, fontWeight: 'bold', fontSize: '13px' }} >
              {entry.value} (${entry.payload.value.toFixed(2)})
            </li>
          ))}

        </div>
      ) : (
        <li key="revenue">
          No Business Data On Selected Date
        </li>
      )}

    </ul>
  );
};

export default Account

