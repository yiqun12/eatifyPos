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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { data_ } from '../data/data.js'
import { PieChart, Pie, Cell } from 'recharts';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import QRCode from 'qrcode.react';
import firebase from 'firebase/compat/app';
import ChangeTimeForm from "../pages/ChangeTimeForm"
import DemoCreateStore from '../components/demoCreateStore'
import Dropdown from 'react-bootstrap/Dropdown';
import DemoFood from '../pages/demoFood'
import StripeConnectButton from '../components/StripeConnectButton'

import barchar_logo from './file_barchar.png';
import files_icon from './files_icon.png';
import calendar_logo from './calendar_logo.png';
import store_icon from './store_icon.png';
import Admin_food from '../components/admin_food'
import IframeDesk from '../components/iframeDesk'

import myImage from './check-mark.png';  // Import the image

import { ReactComponent as Dashboard_chart } from './dashboard_chart.svg';
import { ReactComponent as Todo_icon } from './todo_icon.svg';
import { ReactComponent as Menu_icon } from './menu_icon.svg';
import file_icon from './file_icon.png';



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

  const [activeTab, setActiveTab] = useState('');
  const [activeStoreTab, setActiveStoreTab] = useState('');
  const [storeName_, setStoreName_] = useState('');
  const [storeID, setStoreID] = useState('');
  const [storeOpenTime, setStoreOpenTime] = useState('');

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

  const [orders, setOrders] = useState();
  const [showSection, setShowSection] = useState('');


  const [revenueData, setRevenueData] = useState([
    { date: '1/1/1900', revenue: 1 }
  ]);


  const moment = require('moment');
  const [storelist, setStorelist] = useState([]);


  const fetchPost = async () => {
    if (activeStoreTab !== '') {
      console.log(activeStoreTab)
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
            status: item.status === "succeeded" ? "Paid Online" : "Instore Payment",
            total: parseFloat(item.metadata.total),
            tableNum: item.tableNum,
            metadata: item.metadata
          };
          newItems.push(newItem); // Push the new item into the array
        });
        console.log("hello" + newItems)
        setOrders(newItems)
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
        console.log("hello", dailyRevenueArray)
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
    city: '',
    picture: '',
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


  // Rename function for form submission
  const handleFormSubmit = async (e, name, address, image, id) => {
    e.preventDefault();
    // Here you can access formValues and perform actions like sending it to a server
    console.log(formValues);
    console.log(id)
    const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", id);

    // Update the 'key' field to the value retrieved from localStorage
    await updateDoc(docRef, {
      Name: formValues.storeName !== '' ? formValues.storeName : name,
      Image: formValues.picture !== '' ? formValues.picture : image,
      Address: formValues.city !== '' ? formValues.city : address,

    });
    alert("Updated Successful");
  };

  // for the hashtage # check in URL and then redirect to correct location
  useEffect(() => {
    function handleHashChange() {
      const hashValue = window.location.hash;
      // hashRedirect(hashValue);
      switch (hashValue) {
        case '#createStore':
          redirectCreateStore(hashValue);
          break;
        case '#person':
          redirectPerson();
          break;
        case '#charts':
          redirectCharts();
          break;
        case '#book':
          redirectMenuBook();
          break;
        case '#code':
          redirectCode();
          break;
        case '#cards':
          redirectCards();
          break;
        case '#settings':
          redirectSettings();
          break;
        // Add more cases for other hash values as needed...

        // this default is for the storeName cases
        default:
          hashRedirect(hashValue);
          break;
      }
    }

    // these redirects are to simulate the click of the 6 tab options of each store
    function redirectPerson() {
      setShowSection('')
    }

    function redirectCharts() {
      setShowSection('sales')
    }
    function redirectMenuBook() {
      setShowSection('menu')
    }
    function redirectCards() {
      setShowSection('stripeCard')
    }
    function redirectCode() {
      setShowSection('qrCode')
    }
    function redirectSettings() {
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
      const default_Open_time = `{"0":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"1":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"2":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"3":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"4":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"5":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"6":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"},"7":{"timeRanges":[{"openTime":"xxxx","closeTime":"2359"}],"timezone":"ET"}}`;

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



  // using the below to control if suboption popping and popping out depending on which store is selected on the side bar
  const [activeStoreId, setActiveStoreId] = useState(null);

  return (
    <>

      <div>
        <style>
          {`
          /* Webpixels CSS */
          @import url(https://unpkg.com/@webpixels/css@1.1.5/dist/index.css);

          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
        </style>

        <div className="d-flex flex-column flex-lg-row h-lg-full bg-surface-secondary">
          <nav
            className={`navbar ${isMobile ? "d-none" : ""} show navbar-vertical h-lg-screen navbar-expand-lg px-0 py-3 navbar-light bg-white border-bottom border-bottom-lg-0 border-end-lg`}
            id="navbarVertical"
          >

            <div className={`container-fluid `} style={{ "minHeight": "0px" }}>
            <button
                className={`mt-2 btn mr-2 ${activeTab === '#profile' ? 'border-black' : ''}`}
                onClick={(e) => handleTabClick(e, '#profile')}
              >
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                  Account
                </div>
              </button>
              <button
                className={`mt-2 btn mr-2 ${activeTab === '#Revenue_Chart' ? 'border-black' : ''}`}
                onClick={(e) => handleTabClick(e, '#Revenue_Chart')}
              >
                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                  Add New Store
                </div>
              </button>
              {storelist?.map((data, index) => (
                // <div>
                // <button
                //   className={`mt-2 btn mr-2 ${activeTab === `#${data.id}` ? 'border-black' : ''}`}
                //   onClick={(e) => {
                //     handleTabClick(e, `#${data.id}`);
                //     setActiveStoreTab(data.id);
                //     setShowSection('sales');
                //     setStoreName_(data.Name);
                //   }}
                // >
                //   <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                //     {data.Name}
                //   </div>
                // </button>
                // </div>
                <div
                  // className={`mt-2 btn mr-2`}
                  onClick={(e) => {
                    handleTabClick(e, `#${data.id}`);
                    setActiveStoreTab(data.id);
                    setShowSection('sales');
                    setStoreName_(data.Name);
                    setActiveStoreId(data.id)
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column"
                }}
                >
                  <div className={`mt-2 btn ${activeTab === `#${data.id}` ? 'border-black' : ''}`} style={{ alignItems: 'center', justifyContent: 'center', marginLeft: "2px", marginRight:"2px" }}>
                    {data.Name}
                  </div>

                  {activeStoreId === data.id && (
                  <ul className={`nav nav-tabs mt-4 overflow-x border-0 ${isMobile ? 'd-flex justify-content-between' : ''}`} style={{justifyContent:"inherit"}}>
                    {/* <li className={`nav-item p-0`}
                      onClick={(e) => {
                        handleTabClick(e, '#profile');
                        setShowSection('')
                        window.location.hash = `person`;
                      }}
                    >
                      <a className={`pt-0 nav-link ${activeTab === '#profile' || activeTab === '' ? 'active' : ''}`}>
                        <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                          </svg>
                        </i>
                      </a>

                    </li> */}

                      <>
                        <li className={`nav-item p-0`}
                          onClick={() => {setShowSection('sales')
                          window.location.hash = `charts`;}}
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
                          onClick={() => {setShowSection('menu')
                          window.location.hash = `book`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `menu` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            </i>
                          </a>

                        </li>

                        <li className={`nav-item p-0`} onClick={() => {setShowSection('qrCode')
                         window.location.hash = `code`;}}>
                          <a className={`pt-0 nav-link ${showSection === `qrCode` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                                <path d="M2 2h2v2H2V2Z" />
                                <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z" />
                                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z" />
                                <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z" />
                                <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z" />
                              </svg>
                            </i>
                          </a>
                        </li>
                        <li className={`nav-item p-0`}
                          onClick={() => { setShowSection('stripeCard')
                          window.location.hash = `cards`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `stripeCard` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-credit-card" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
                                <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
                              </svg>
                            </i>
                          </a>

                        </li>
                        <li className={`nav-item p-0`}
                          onClick={() => {setShowSection('store')
                          window.location.hash = `settings`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `store` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                              </svg>
                            </i>
                          </a>

                        </li>
                      </>


                  </ul>)
}
                </div>
              ))}
            </div>
          </nav>
          <div className="h-screen flex-grow-1 overflow-y-lg-auto" style={{
            backgroundColor: 'white', // Set the background color to white
          }}>
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
                            {t("Sign out")}
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
                          <i className="bi bi-pencil"></i>
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
                                  setStoreOpenTime(data.Open_time)
                                }}
                              >
                                {data.Name}
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
                      }}
                      class="btn d-inline-flex btn-sm btn-primary mx-1">
                      <span class=" pe-2">
                        <i class="bi bi-house"></i>
                      </span>
                      <span> {"Create Store"}</span>
                    </a>
                  </div>


                  {/* <ul className={`nav nav-tabs mt-4 overflow-x border-0 ${isMobile ? 'd-flex justify-content-between' : ''}`}>
                    <li className={`nav-item p-0`}
                      onClick={(e) => {
                        handleTabClick(e, '#profile');
                        setShowSection('')
                        window.location.hash = `person`;
                      }}
                    >
                      <a className={`pt-0 nav-link ${activeTab === '#profile' || activeTab === '' ? 'active' : ''}`}>
                        <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                          </svg>
                        </i>
                      </a>

                    </li>
                    {activeTab === `#profile` || storeName_ === '' ?

                      <></> :

                      <>
                        <li className={`nav-item p-0`}
                          onClick={() => {setShowSection('sales')
                          window.location.hash = `charts`;}}
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
                          onClick={() => {setShowSection('menu')
                          window.location.hash = `book`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `menu` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book" viewBox="0 0 16 16">
                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                              </svg>
                            </i>
                          </a>

                        </li>

                        <li className={`nav-item p-0`} onClick={() => {setShowSection('qrCode')
                         window.location.hash = `code`;}}>
                          <a className={`pt-0 nav-link ${showSection === `qrCode` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                                <path d="M2 2h2v2H2V2Z" />
                                <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z" />
                                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z" />
                                <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z" />
                                <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z" />
                              </svg>
                            </i>
                          </a>
                        </li>
                        <li className={`nav-item p-0`}
                          onClick={() => { setShowSection('stripeCard')
                          window.location.hash = `cards`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `stripeCard` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-credit-card" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
                                <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
                              </svg>
                            </i>
                          </a>

                        </li>
                        <li className={`nav-item p-0`}
                          onClick={() => {setShowSection('store')
                          window.location.hash = `settings`;}}
                        >
                          <a className={`pt-0 nav-link ${showSection === `store` ? 'active' : ''}`}>
                            <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                              </svg>
                            </i>
                          </a>

                        </li>

                      </>}



                  </ul> */}
                </div>
              </div>
            </header>
            <div style={{ "borderRadius": "0" }}>

              <div id="card_element" style={{
                backgroundColor: 'white', // Set the background color to white
              }} className={`card-body tab-content pt-0`} ref={elementRef}>
                {user_loading ?
                  <div>
                    Loading...
                  </div>
                  : <>
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
                        <Checkout />
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

                          {showSection === 'menu' ? <>

                            <Admin_food store={data.id} />
                          </> : <></>
                          }
                          {showSection === 'qrCode' ? <>

                            <IframeDesk store={data.id} ></IframeDesk>
               
                            {/* <QRCode value={"google.com"} /> */}
                            <hr />
                          </> : <></>
                          }
                          {showSection === 'stripeCard' ? <>


                            <div className='flex mt-3' >
                              <div style={{ width: "10%" }}>
                              </div>
                              <div className="flex justify-end" style={{ margin: "auto", width: "90%" }}>
                                <button class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                                  Request Store Verification
                                </button>
                              </div>
                            </div>

                            <div className='flex' >
                              <FormGroup>
                                <FormControlLabel control={<Switch defaultChecked />} label={t("Support Payment")} />
                              </FormGroup>
                            </div>

                            <div className='flex' >
                              <FormGroup>
                                <FormControlLabel control={<Switch defaultChecked />} label={t("Support Pay Later")} />
                              </FormGroup>
                            </div>
                            <div className='flex mt-3' >
                              <div style={{ width: "30%" }}>
                              </div>
                              <div className="flex justify-end" style={{ margin: "auto", width: "70%" }}>
                                <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                  Save Payment Options
                                </button>                                </div>
                            </div>
                          </> : <></>
                          }

                          {showSection === 'store' ? <>
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
                            <form className="w-full mb-2" onSubmit={(e) => handleFormSubmit(e, data?.Name, data?.Address, data?.Image, data?.id)}>
                              <div className="flex flex-wrap -mx-3 mb-6">
                                <div className="w-full md:w-1/2 px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="storeName">
                                    Store Name
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
                                <div className="w-full md:w-1/2 px-3">
                                  <label className="text-gray-700 mt-3 mb-2" htmlFor="city">
                                    City
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
                              </div>
                              <div className=' mb-6' >

                                {data?.stripe_store_acct === "" ?
                                  <>
                                    <div className='mb-3'>Receive Payment Options:</div>

                                    <div>
                                      <StripeConnectButton store={data.id} user={user.uid}></StripeConnectButton>

                                    </div></>

                                  :
                                  <>
                                    <div style={{ display: 'flex' }}>

                                      <img className='mr-2'
                                        src={myImage}  // Use the imported image here
                                        alt="Description"
                                        style={{
                                          width: '30px',
                                          height: '30px',
                                        }}
                                      />
                                      You already connect with Stripe to receive payment!
                                    </div>

                                  </>
                                }
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


                            <div>Operating Hours:</div>
                            <ChangeTimeForm storeID={storeID} storeOpenTime={storeOpenTime} />


                          </> : <></>
                          }


                          {showSection === 'sales' ? <>
                            <div className={isMobile ? "flex" : 'flex'}>
                              <div style={isMobile ? { width: "50%" } : { width: "50%" }}>
                                <h6 x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                                  Revenue : $

                                  {
                                    Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                  Gratuity : $

                                  {
                                    Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  {isMobile ? <img style={{ height: "30px" }} src={calendar_logo} alt="Calendar Logo" /> : <></>}
                                  <b>Select a date: { } </b>
                                </div>
                                <input
                                  type="date"
                                  style={{ marginTop: "5px", marginBottom: "10px", "width": "120px" }}
                                  value={selectedDate ? selectedDate.toISOString().slice(0, 10) : "mm/dd/yyyy"}
                                  onChange={(event) => {
                                    setSelectedDate(new Date(event.target.value.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2/$3/$1")));
                                  }}
                                />

                                <div>
                                  <button
                                    className="mt-2 btn"
                                    style={{ "border": "2px solid #cc9966" }}
                                    onClick={() => setSelectedDate(new Date(dateNow))}                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img
                                        className='m-0 scale-150'
                                        style={{ height: '30px' }}
                                        src={file_icon}
                                        alt="Description"
                                      /> {"\u00A0List Today Orders"}
                                    </div>
                                  </button>
                                </div>

                                <div>
                                  <button
                                    className="mt-2 btn"
                                    style={{ "border": "2px solid #cc9966" }}

                                    onClick={() => setSelectedDate(null)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img
                                        className='m-0 scale-150'
                                        style={{ height: '30px' }}
                                        src={files_icon}
                                        alt="Description"
                                      />{"\u00A0List All Orders"}
                                    </div>
                                  </button>
                                </div>

                                <div>
                                  <button
                                    className="mt-2 btn"
                                    style={{ "border": "2px solid #cc9966" }}

                                    onClick={() => setShowChart(!showChart)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <img
                                        className='m-0 scale-150'
                                        style={{ height: '30px' }}
                                        src={barchar_logo}
                                        alt="Description"
                                      />
                                      {!showChart ? '\u00A0Show Chart' : '\u00A0Hide Chart'}
                                    </div>
                                  </button>
                                </div>

                              </div>

                              <div style={isMobile ? { "width": "50%" } : {}}>

                                <PieChart width={isMobile ? width2 / 2 : 300} height={250}>
                                  <Pie
                                    cx={80} // Move the pie to the left by adjusting the cx value
                                    data={[
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
                                  {isMobile ? <Legend verticalAlign="top" /> : <Legend layout="vertical" align="right" verticalAlign="top" />}

                                </PieChart>
                              </div>

                            </div>
                            {showChart ?
                              <>
                                <hr />
                                <BarChart className="chart" width={width2 - 10} height={300} data={sortedData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="revenue" fill="#8884d8" />
                                </BarChart>

                              </> :

                              <></>
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
                                  <th className="order-number" style={isMobile ? {} : { width: "10%" }}>Order</th>
                                  <th className="order-name" style={isMobile ? {} : { width: "10%" }}>Table</th>
                                  <th className="order-status" style={isMobile ? {} : { width: "30%" }}>Status</th>
                                  <th className="order-total" style={isMobile ? {} : { width: "10%" }}>Total</th>
                                  <th className="order-dine-mode" style={isMobile ? {} : { width: "10%" }}>Service</th>
                                  <th className="order-date" style={isMobile ? {} : { width: "15%" }}>Time</th>
                                  <th className="order-details" style={isMobile ? {} : { width: "15%" }}>Detail</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true)?.map((order) => (

                                  <React.Fragment key={order.id}>

                                    <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                      <td className="order-number" data-title="OrderID"><a >{order.id}</a></td>
                                      <td className="order-name" data-title="Name" style={{ whiteSpace: "nowrap" }}>{order.tableNum === "" ? "Takeout" : order.tableNum}</td>
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
                          </>
                            : <></>
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
                  </>}
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  )
}

export default Account


