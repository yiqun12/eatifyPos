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

import barchar_logo from './file_barchar.png';
import files_icon from './files_icon.png';
import calendar_logo from './calendar_logo.png';
import store_icon from './store_icon.png';

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

  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
  }
  const { user, user_loading } = useUserContext();
  console.log(user)
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
  const [showSection, setShowSection] = useState("sales");


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
            status: item.status === "succeeded" ? "Paid Online" : "Handle Instore",
            total: parseFloat(item.metadata.total),
            tableNum: item.tableNum,
            metadata: item.metadata
          };
          newItems.push(newItem); // Push the new item into the array
        });
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
        console.log('read your mom');

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
  const oneWeekAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000); // 7 days ago

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
  return (
    <>
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
      <div className='max-w-[1000px] mx-auto p-0'>
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
                      {t("Business Overview")}
                    </a>

                    {storelist?.map((data, index) => (
                      <a
                        key={index} // or use `data.id` if each id is unique
                        href={`#${data.id}`}
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === `#${data.id}` ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => {
                          handleTabClick(e, `#${data.id}`);
                          setActiveStoreTab(data.id);
                          setShowSection('sales');
                        }}
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
                          className="feather feather-home mr-2"
                        >
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        {data.Name}
                      </a>
                    ))}
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
                        className="feather feather-settings mr-2"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06c.5.5 1.2.6 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>

                      {t("Other Setting")}
                    </a>
                  </nav>
                </div>
              </div>
            </div>
            <div className="col-md-9 p-0">
              <div className="card" style={{ "borderRadius": "0" }}>
                <div className="card-header border-bottom mb-3 d-flex d-md-none" style={{ "borderRadius": "0" }}>
                  <ul
                    className="nav nav-tabs card-header-tabs nav-gap-x-1"
                    role="tablist"
                  >
                    <li style={{ width: "25%" }} className="nav-item">
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
                    <li style={{ width: "25%" }} className="nav-item">
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
                    {storelist?.map((data, index) => (
                      <li key={index} style={{ width: "25%" }} className="nav-item">
                        <a
                          href={`#${data.id}`}
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === `#${data.id}` ? 'active' : ''}`}
                          onClick={(e) => {
                            handleTabClick(e, `#${data.id}`);
                            setActiveStoreTab(data.id);
                            setShowSection('sales');

                          }}    >
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
                            className="feather feather-home mr-2"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                        </a>
                      </li>
                    ))}

                    <li style={{ width: "25%" }} className="nav-item">
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
                          className="feather feather-settings mr-2"
                        >
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06c.5.5 1.2.6 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                      </a>
                    </li>

                  </ul>
                </div>
                <div id="card_element" className="card-body tab-content" ref={elementRef}>
                  {user_loading ?
                    <div>
                      Loading...
                    </div>
                    : <>
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
                          <h6>{t("BUSINESS OVERVIEW")}</h6>
                          <hr />

                          <hr />

                          <b x="20" y="30" fill="#000" style={{ 'fontSize': '17px' }}>
                            Revenue earned on a daily basis over a period of 5 days
                          </b>

                        </div>


                      ) : null}
                      {storelist?.map((data, index) => (
                        activeTab === `#${data.id}` ? (
                          <div className="tab-pane-active" id="History">

                            <h6>{data.Name}</h6>
                            <hr />
                            <div className='flex' style={isMobile ? { justifyContent: 'space-between' } : {}}>
                              <button
                                className="mt-2 btn mr-2"
                                style={{ "border": "2px solid #cc9966" }}

                                onClick={() => setShowSection('sales')}
                              >
                                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  {(() => <Dashboard_chart style={{ maxWidth: '80px', maxHeight: '80px' }} />)()}


                                  Sales Data
                                </div>
                              </button>
                              <button
                                className="mt-2 btn mr-2"
                                style={{ "border": "2px solid #cc9966" }}

                                onClick={() => setShowSection('store')}
                              >
                                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  {(() => <Todo_icon style={{ maxWidth: '80px', maxHeight: '80px' }} />)()}

                                  Store Data
                                </div>
                              </button>
                              <button
                                className="mt-2 btn"
                                style={{ "border": "2px solid #cc9966" }}

                                onClick={() => setShowSection('menu')}
                              >
                                <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                                  {(() => <Menu_icon style={{ maxWidth: '80px', maxHeight: '80px' }} />)()}

                                  Menu Data
                                </div>
                              </button>
                            </div>


                            <hr />
                            {showSection === 'store' ? <>
                            <div className='flex' >

                              Store Name : INPUT
                              </div>

                            <div className='flex' >
                            Address : INPUT
                            </div>
                            <div className='flex' >
                              <div>
                                <div>
                                  <FormGroup>
                                    <FormControlLabel control={<Switch defaultChecked />} label={t("Show Store Front")}  />
                                  </FormGroup>
                                </div>
                              </div>
                            </div>
                            <div className='flex' >
                              <div style={{ width: "50%" }}>
                              <FormGroup>
                                    <FormControlLabel control={<Switch defaultChecked />} label={t("Support Payment")} />
                                  </FormGroup>
                              </div>
                              
                              <div className="flex justify-end" style={{ margin: "auto", width: "50%" }}>
                              <a href="https://connect.stripe.com/oauth/authorize?redirect_uri=https://connect.stripe.com/hosted/oauth&client_id=ca_NRqE7CXgaiYMc6p4Q5opvaOQ9AbqW33o&state=onbrd_OUg7Zk5piPAsBUKev36hdp68HO&response_type=code&scope=read_write&stripe_user[country]=US" class="stripe-connect"><span>Connect with</span></a>
                              </div>
                            </div>          

                            <div className='flex' >
                              <div>
                                <div>
                                  <FormGroup>
                                    <FormControlLabel control={<Switch defaultChecked />} label={t("Support Pay Later")}  />
                                  </FormGroup>
                                </div>
                              </div>
                            </div>

                            <div>Request Store Verification</div>
                            <div>Request Shipping Support</div>
                            <div>Request Shipping Deliver</div>
                            <hr />
                            <div>Generate QR code</div>

                            <div>Operating Hours:</div>

</>:<></>
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
                                  Tips : $

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
                                        name: 'Tips', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
                                          name: 'Tips', value: Math.round(orders?.filter(order => selectedDate ? new Date(order.date.split(' ')[0]).getTime() == selectedDate.getTime() : true).reduce(
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
      </div>
    </>
  )
}

export default Account