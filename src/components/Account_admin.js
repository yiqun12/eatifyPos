//import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useEffect, useRef } from 'react';

//import Checkout from "../components/Checkout";
import PayFullhistory from "./PayFullhistory";
import { Elements } from '@stripe/react-stripe-js';
import { useUserContext } from "../context/userContext";
import { useMyHook } from '../pages/myHook';
import Checkout from "./Checkout_acc";
import './style.css';
import './stripeButton.css';
import { useCallback } from 'react';
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from '../firebase/index';
import { onSnapshot, query } from "firebase/firestore";
import mySound from '../pages/new_order_english.mp3'; // Replace with your sound file's path
import mySound_CHI from '../pages/new_order_chinese.mp3'; // Replace with your sound file's path
import dingDong from '../components/ding-dong-sound.mp3'; // Replace with your sound file's path
import $ from 'jquery';
import useGeolocation from './useGeolocation';
import QRCode from 'qrcode.react'; // import QRCode component
import useNetworkStatus from './useNetworkStatus';
import PhoneVerificationPopup from '../pages/SmsVerificatioin';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';
import { data_ } from '../data/data.js'
import { PieChart, Pie, Cell } from 'recharts';
import {
    LineChart,
    Line,
} from 'recharts';
import firebase from 'firebase/compat/app';
import ChangeTimeForm from "../pages/ChangeTimeForm"
import Dropdown from 'react-bootstrap/Dropdown';
import DemoFood from '../pages/demoFood'
import StripeConnectButton from '../components/StripeConnectButton'
import TerminalRegister from "../pages/TerminalRegister";
import DatePicker from 'react-datepicker';
import zhCN from 'date-fns/locale/zh-CN'; // for Simplified Chinese
import { format, addDays } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth } from 'date-fns';
import { registerLocale, setDefaultLocale } from "react-datepicker";
import ScrollableFeed from 'react-scrollable-feed'
import barchar_logo from './file_barchar.png';
import files_icon from './files_icon.png';
import calendar_logo from './calendar_logo.png';
import store_icon from './store_icon.png';
import Admin_food from '../components/admin_food'
import IframeDesk from '../components/iframeDesk'
import Test_Notification_Page from "../pages/Test_Notification_Page.js";
import ItemSalesAnalytics from './ItemSalesAnalytics'; // 添加物品销量分析组件

import myImage from './check-mark.png';  // Import the image
import LazyLoad from 'react-lazy-load';

import Eshopingcart from './e-shopingcart.png';  // Import the image

import { ReactComponent as Dashboard_chart } from './dashboard_chart.svg';
import { ReactComponent as Todo_icon } from './todo_icon.svg';
import { ReactComponent as Menu_icon } from './menu_icon.svg';
import file_icon from './file_icon.png';
import styled from '@emotion/styled';
import { format12Oclock, addOneDayAndFormat, convertDateFormat, parseDate, parseDateUTC } from '../comonFunctions';
import { el } from 'date-fns/locale';
import e from 'cors';
import { json } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointer, faL } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { lookup } from 'zipcode-to-timezone';
import EmailVerificationModal from './EmailVerificationModal'; // Import the new modal
import ChartPasswordModal from './ChartPasswordModal'; // Import the chart password modal
import { lightenColor, getStoreColor } from '../utils/lightenColor';

registerLocale('zh-CN', zhCN);



// Initialize Firebase Functions
const sendVerificationCodeFunction = firebase.functions().httpsCallable('sendVerificationCode');
const verifyCodeAndSavePasswordFunction = firebase.functions().httpsCallable('verifyCodeAndSavePassword');


const Account = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [timeZone, setTimeZone] = useState('America/New_York'); // Default to Eastern Time Zone
    // --- Password Management State --- >
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newEmployeePassword, setNewEmployeePassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showAdminPassword, setShowAdminPassword] = useState(false); // Add state for admin password visibility
    const [showEmployeePassword, setShowEmployeePassword] = useState(false); // Add state for employee password visibility
    const [verificationCodeInput, setVerificationCodeInput] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);

    // --- Email Verification State ---
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [modalError, setModalError] = useState('');
    const [modalInfo, setModalInfo] = useState('');

    // --- Password Status Check State ---
    const [passwordsExist, setPasswordsExist] = useState(null); // null: unknown, true: exist, false: not set
    const [showPasswordInputs, setShowPasswordInputs] = useState(false);
    const [isCheckingPasswordStatus, setIsCheckingPasswordStatus] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    // Define U.S. time zones
    const timeZones = {
        "America/New_York": "Eastern",
        "America/Chicago": "Central",
        "America/Denver": "Mountain",
        "America/Los_Angeles": "Pacific",
        "America/Anchorage": "Alaska",
        "Pacific/Honolulu": "Hawaii"
    };

    function getTimeZoneByZip(zipCode) {
        // Use the library to find the timezone ID from the ZIP code
        const timeZoneId = lookup(zipCode);

        // Check if the timezone ID is in our timeZones list
        return timeZoneId;
    }
    //console.log("timezone")
    //console.log(getTimeZoneByZip("94133"))//"America/Los_Angeles"
    // Get the equivalent time for UTC 0:00 in the selected time zone

    const handleTimeZoneChange = (zone) => setTimeZone(zone);
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [isJointAdvertised, setIsJointAdvertised] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // 在Account组件内部顶部的状态定义处添加以下状态
    const [isChartPasswordModalOpen, setIsChartPasswordModalOpen] = useState(false);
    const [isChartPasswordVerified, setIsChartPasswordVerified] = useState(false);

    const handlePasswordSubmit = (password) => {
        if (password === '123') {
            setIsPasswordCorrect(true);
            setIsJointAdvertised(!isJointAdvertised);
            setShowModal(false);
        } else {
            alert('Incorrect password, please enter the correct password to join the program.');
        }
    };


    const toggleAdvertisingProgram = async (e) => {
        if (!isPasswordCorrect) {
            setShowModal(true);
        } else {
            setIsJointAdvertised(!isJointAdvertised);
            const isChecked = e.target.checked;
            const documentRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);

            try {
                // Update the `dailyPayout` field based on checkbox status
                await updateDoc(documentRef, { isJointAdvertised: isChecked });
                console.log(isChecked);
            } catch (error) {
                console.error("Error updating document:", error);
            }
        }
    };
    const handleCheckboxChange = async (e) => {
        const isChecked = e.target.checked;
        const documentRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);

        try {
            // Update the `dailyPayout` field based on checkbox status
            await updateDoc(documentRef, { dailyPayout: isChecked });
            console.log(isChecked);
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    const fetchSingleBalance = async (Charge_ID, account_ID) => {
        try {
            const myFunction = firebase.functions().httpsCallable('fetchSingleBalance');
            const response = await myFunction({
                Charge_ID,
                account_ID,
            });

            return response.data
        } catch (error) {
            //return []
        }
    };
    // let result = await fetchSingleBalance('ch_3Of86QBUAXdEY4mJ2T9MBbRr', 'acct_1OWU8KBUAXdEY4mJ');
    // console.log("fetchSingleBalance")
    // console.log(result)

    // useEffect(() => {
    //   const fetchData = async () => {

    //     try {
    //       let result = await fetchSingleBalance('ch_3Of86QBUAXdEY4mJ2T9MBbRr', 'acct_1OWU8KBUAXdEY4mJ');
    //       console.log("fetchSingleBalance")
    //       console.log(result)
    //     } catch (error) {
    //       // Error handling if generateJSON fails
    //     }
    //   };

    //   fetchData();
    // }, []); // Empty dependency array means this effect will only run once after the initial render


    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "scroll"
        };
    }, []);
    const { isOnline } = useNetworkStatus();
    const isMobileOrTablet = useMobileAndTabletCheck();
    function useMobileAndTabletCheck() {
        const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

        useEffect(() => {
            let check = false;
            (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
            setIsMobileOrTablet(check);
        }, []);

        return isMobileOrTablet;
    }
    const generateQRLink = (item) => {
        const tableParam = item.split('-'); // This will split the string into an array
        const prefix = tableParam[0]; // This will be 'demo'
        const suffix = tableParam[1]; // This will be 'a2'
        return `https://7dollar.delivery/store?store=${prefix}&table=${suffix}`;
    };
    const generateQRLinkSelfCheckout = (item) => {
        const tableParam = item.split('-'); // This will split the string into an array
        const prefix = tableParam[0]; // This will be 'demo'
        const suffix = tableParam[1]; // This will be 'a2'
        return `https://7dollar.delivery/selfCheckout?store=${prefix}&table=${suffix}`;
    };
    const [bounds, setBounds] = useState(null);
    const [error, setError] = useState('');

    const params = new URLSearchParams(window.location.search);

    const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";

    const translations = [
        { input: "Add Cash Tips", output: "现金小费" },
        { input: "Paid by Cash", output: "现金支付" },
        { input: "POS Machine", output: "POS机" },
        { input: "Unpaid", output: "未付" },
        { input: "Online App", output: "在线应用程序" },
        { input: "Cash Gratuity", output: "现金小费" },
        { input: "Gratuity", output: "小费" },
        { input: "Revenue", output: "收入" },
        { input: "Subtotal", output: "小计" },
        { input: "Tax", output: "税" },
        { input: "Service Fee", output: "信用卡小费" },
        { input: "Discount", output: "折扣" },
        { input: "Canceled", output: "取消送厨" },
        { input: "Sales Analytics", output: "销量分析" },

    ];
    function translate(input) {
        const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
        return translation ? translation.output : "Translation not found";
    }
    // This function plays the sound
    const playSound = () => {

        // Create Audio objects for both sounds
        const dingDongSound = new Audio(dingDong);
        const mySoundSound = new Audio(mySound);

        // Play the dingDong sound
        dingDongSound.play();

        // Set a timeout to play the second sound after 0.03 seconds (30 milliseconds)
        setTimeout(() => {
            mySoundSound.play();
        }, 30);
    };

    const playSound_CHI = () => {
        // Create Audio objects for both sounds
        const dingDongSound = new Audio(dingDong);
        const mySoundSound = new Audio(mySound_CHI);

        // Play the dingDong sound
        dingDongSound.play();

        // Set a timeout to play the second sound after 0.03 seconds (30 milliseconds)
        setTimeout(() => {
            mySoundSound.play();
        }, 30);
    };


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
    const [showSyncButton, setShowSyncButton] = useState(false);


    const isPC = width >= 1024;
    const { promise, logoutUser } = useUserContext();

    const [activeTab, setActiveTab] = useState('');
    const [activeStoreTab, setActiveStoreTab] = useState('');
    const [storeName_, setStoreName_] = useState('');
    const [storeCHI, setStoreCHI_] = useState('');
    const [AmericanTimeZone, setAmericanTimeZone] = useState("America/Los_Angeles");
    const [cutoffTime, setCutoffTime] = useState(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE));

    const [storeID, setStoreID] = useState('');
    const [storeOpenTime, setStoreOpenTime] = useState('');
    const [docIds, setDocIds] = useState([]);
    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "Table");
        // clearDemoLocalStorage();
        // Listen for changes in the collection
        const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
            //
            snapshot.docChanges().forEach((change) => {
                const doc = change.doc;
                const docId = change.doc.id; // Extract the document ID

                if (change.type === "added" || change.type === "modified") {
                    // Check if the docId is not already in the state array to avoid duplicates
                    if (!docIds.includes(docId)) {
                        // Update the state with the new docId, ensuring uniqueness
                        setDocIds(prevDocIds => [...new Set([...prevDocIds, docId])]);
                    }
                    localStorage.setItem(doc.id, doc.data().product);
                } else if (change.type === "removed") {
                    setDocIds(prevDocIds => prevDocIds.filter(id => id !== docId));
                    // localStorage.removeItem(doc.id);
                }
            });

            saveId(Math.random());
        }, (error) => {
            // Handle any errors
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect


    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "TableIsSent");

        // Listen for changes in the collection
        const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const doc = change.doc;
                if (change.type === "added" || change.type === "modified") {
                    console.log("Document changed:", doc.data().product);
                    localStorage.setItem(doc.id, doc.data().product);
                } else if (change.type === "removed") {
                    console.log("Document removed:", doc.id);
                    localStorage.removeItem(doc.id);
                }
            });
            // Uncomment the following line if necessary
            // saveId(Math.random());
        }, (error) => {
            // Handle any errors
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect


    function round2digt(n) {
        return Math.round(n * 100) / 100
    }
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
    function clearDemoIsSentLocalStorage() {
        // Get all keys in localStorage
        const keys = Object.keys(localStorage);

        // Loop through the keys
        for (let key of keys) {
            // Check if the key includes 'demo'
            if (key.includes(storeID + "-")) {
                // Remove the item from localStorage
                if (key.includes("-isSent")) {
                    localStorage.removeItem(key);

                } else {
                }

            }
        }
    }
    const MerchantReceipt = async (store, stringify_JSON, discount, selectedTable, service_fee, finalPrice, tips) => {
        console.log(store, stringify_JSON, discount, selectedTable, service_fee, finalPrice)
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
                date: date,
                //data: localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [],
                data: JSON.parse(stringify_JSON),
                selectedTable: selectedTable,
                discount: discount,
                service_fee: service_fee,
                total: roundToTwoDecimals(roundToTwoDecimals(finalPrice) - roundToTwoDecimals(tips)),
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    const handleTabClick = (e, tabHref) => {
        e.preventDefault();
        setActiveTab(tabHref);
    }



    function fanyi(input) {
        return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input
    }
    const { user, user_loading } = useUserContext();
    //console.log(user)
    useEffect(() => {
        setActiveTab(window.location.hash);
    }, []);
    function removeFromLocalStorage() {
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
    const epochDate = parseDate(format12Oclock((new Date("2023-11-30T00:00:00")).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone);
    const [startDate, setStartDate] = useState(parseDate(format12Oclock((new Date(Date.now())).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone));
    const [endDate, setEndDate] = useState(null);
    const [cancelOrder, setCancelOrder] = useState(null);

    useEffect(() => {
        // Ensure endDate is defined and startDate is before endDate
        if (endDate && startDate < endDate) {
            setShowChart(true);
        } else {
            setShowChart(false);
        }
    }, [startDate, endDate]); // Depend on both startDate and endDate

    // useEffect(() => {
    //   getMonthDates(((format12Oclock((new Date(Date.now())).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })))))
    // }, []);
    const [isPickerOpenEndDay, setIsPickerOpenEndDay] = useState(false);

    const [isPickerOpenStartDay, setIsPickerOpenStartDay] = useState(false);
    const [isPickerOpenMonth, setIsPickerOpenMonth] = useState(false);

    const getMonthDates = (inputDate) => {
        function formatDate_(year, month, day) {
            const date = new Date(year, month, day);
            const formattedYear = date.getFullYear();
            const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            const formattedDay = date.getDate().toString().padStart(2, '0');
            const hours = '00';
            const minutes = '00';
            const seconds = '00';
            // Parse the custom date format
            const date_ = moment.tz(`${formattedYear}${formattedMonth}${formattedDay}${hours}${minutes}${seconds}`, "YYYYMMDDHHmmss", AmericanTimeZone);

            // Format the date in the desired output
            const losAngelesDate = date_.format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');
            // console.log(new Date(losAngelesDate))
            return new Date(losAngelesDate);
        }
        // Parse the input date string
        const year = parseInt(inputDate.substring(0, 4), 10);
        const month = parseInt(inputDate.substring(5, 7), 10) - 1; // Subtract 1 because months are 0-indexed in JavaScript Date
        // console.log("getMonthDates")
        // console.log(formatDate_(year, month, 1))
        // console.log(formatDate_(year, month + 1, 0))
        // console.log(year, month, 1)

        // Create a new date object for the first day of the month
        const firstDayOfMonth = new Date(year, month, 1);

        // Create a new date object for the last day of the month
        const lastDayOfMonth = new Date(year, month + 1, 0);
        //2024-01-31T05:00:00.000Z

        setStartDate(formatDate_(year, month, 1).toISOString());
        //console.log(firstDayOfMonth.toISOString())
        setEndDate(formatDate_(year, month + 1, 0).toISOString());
        //console.log(lastDayOfMonth.toISOString())
    };

    const getSeason = (inputDate, quarter) => {
        function formatDate_(year, month, day) {
            const date = new Date(year, month, day);
            const formattedYear = date.getFullYear();
            const formattedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            const formattedDay = date.getDate().toString().padStart(2, '0');
            const hours = '00';
            const minutes = '00';
            const seconds = '00';
            // Parse the custom date format
            const date_ = moment.tz(`${formattedYear}${formattedMonth}${formattedDay}${hours}${minutes}${seconds}`, "YYYYMMDDHHmmss", AmericanTimeZone);

            // Format the date in the desired output
            const losAngelesDate = date_.format('ddd MMM DD YYYY HH:mm:ss [GMT]Z (zz)');
            // console.log(new Date(losAngelesDate))
            return new Date(losAngelesDate);
        }
        // Parse the input date string
        const year = parseInt(inputDate.substring(0, 4), 10);
        const month = parseInt(inputDate.substring(5, 7), 10) - 1; // Subtract 1 because months are 0-indexed in JavaScript Date

        //2024-01-31T05:00:00.000Z
        if (quarter === "Q1") {
            setStartDate(formatDate_(year, 0, 1).toISOString());
            setEndDate(formatDate_(year, 2, 31).toISOString());
        } else if (quarter === "Q2") {
            setStartDate(formatDate_(year, 3, 1).toISOString());
            setEndDate(formatDate_(year, 5, 30).toISOString());
        } else if (quarter === "Q3") {
            setStartDate(formatDate_(year, 6, 1).toISOString());
            setEndDate(formatDate_(year, 8, 30).toISOString());
        } else if (quarter === "Q4") {
            setStartDate(formatDate_(year, 9, 1).toISOString());
            setEndDate(formatDate_(year, 11, 31).toISOString());
        } else if (quarter === "lastQ1") {
            setStartDate(formatDate_(year - 1, 0, 1).toISOString());
            setEndDate(formatDate_(year - 1, 2, 31).toISOString());
        } else if (quarter === "lastQ2") {
            setStartDate(formatDate_(year - 1, 3, 1).toISOString());
            setEndDate(formatDate_(year - 1, 5, 30).toISOString());
        } else if (quarter === "lastQ3") {
            setStartDate(formatDate_(year - 1, 6, 1).toISOString());
            setEndDate(formatDate_(year - 1, 8, 30).toISOString());
        } else if (quarter === "lastQ4") {
            setStartDate(formatDate_(year - 1, 9, 1).toISOString());
            setEndDate(formatDate_(year - 1, 11, 31).toISOString());
        }


        //console.log(lastDayOfMonth.toISOString())
    };


    const wrapperRef = useRef(null);

    const handleChangeStartDay = (date) => {
        setStartDate(date);
    };

    const handleChangeEndDay = (date) => {
        setEndDate(date);
    };

    const handleMonthChange = (date) => {
        getMonthDates(((format12Oclock((new Date(date.getFullYear(), date.getMonth(), 2)).toLocaleString("en-US", { timeZone: AmericanTimeZone })))))
    };

    const formatDate = (date) => {
        if (!date) return '';
        return format(date, "yyyy-MM-dd'-00-00-00-00'");
    };

    const getOutput = () => {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = endDate ? formatDate(addDays(endDate, 1)) : formatDate(addDays(startDate, 1));
        //setEndDate(endDate ? addDays(endDate, 1) : addDays(startDate, 1))
        return `from ${formattedStartDate} to ${formattedEndDate}`;
    };

    // Click outside logic
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsPickerOpenStartDay(false);
                setIsPickerOpenEndDay(false);
                setIsPickerOpenMonth(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const moment = require('moment');
    const [storelist, setStorelist] = useState([]);
    // console.log(orders)

    function subtractHours(dateStr, hours) {
        let parts = dateStr.split('-');
        let date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
        date.setHours(date.getHours() - hours);

        return date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + '-' +
            ('0' + date.getHours()).slice(-2) + '-' +
            ('0' + date.getMinutes()).slice(-2) + '-' +
            ('0' + date.getSeconds()).slice(-2) + '-00';
    }


    const [selectedTime, setSelectedTime] = useState("00-00"); // Default value as 00-00

    // Generate time options with a 30-minute interval
    const generateTimeOptions = () => {
        const times = [];
        for (let hours = 0; hours < 24; hours++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                times.push(formattedTime);
            }
        }
        return times;
    };

    const handleChange = (event) => {
        const timeWithHyphen = event.target.value.replace(":", "-");
        setSelectedTime(timeWithHyphen);
    };

    const timeOptions = generateTimeOptions();

    const [currentTime, setCurrentTime] = useState("23-59"); // Default value as 00-00

    // Generate an array of time strings with 30-minute intervals
    const createTimeOptions = () => {
        const timeIntervals = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                timeIntervals.push(formattedTime);
            }
        }
        return timeIntervals;
    };

    const handleTimeChange = (event) => {
        const formattedTimeWithHyphen = event.target.value.replace(":", "-");
        setCurrentTime(formattedTimeWithHyphen);
    };

    const timeIntervalOptions = createTimeOptions();


    const fetchPostAll = async () => {
        if (activeStoreTab !== '') {
            console.log(activeStoreTab)
            console.log(user.uid)
        } else {
            return
        }
        if (showSection !== 'sales') {
            //return
        }
        const start_ = convertDateFormat(startDate)
        console.log("startDate")
        console.log(start_)
        console.log("endDate")
        const end_ = convertDateFormat(endDate ? addDays(endDate, 1) : addDays(startDate, 1))
        console.log(end_)
        console.log("2025-04-30-06-55-56-30" < end_)//true
        console.log("2025-04-30-06-55-56-30" >= start_)//true

        const paymentsQueryDelete = query(
            collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', activeStoreTab, 'DeletedSendToKitchen'),
            where('date', '>=', convertDateFormat(startDate)),
            where('date', '<', convertDateFormat(endDate ? addDays(endDate, 1) : addDays(startDate, 1)))
        );

        onSnapshot(paymentsQueryDelete, async (snapshot) => {
            const newData = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
                receiptData: JSON.stringify(doc.data().data),
                tableNum: doc.data().selectedTable,
                total: Math.round(doc.data().data.reduce((acc, item) => acc + parseFloat(item.itemTotalPrice), 0) * 100) / 100
            }));

            newData.sort(
                (a, b) =>
                    moment(b.date, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() -
                    moment(a.date, "YYYY-MM-DD-HH-mm-ss-SS").valueOf()
            );
            console.log("new added");

            const newItems = newData.map((item) => {
                const formattedDate = parseDateUTC(item.date, AmericanTimeZone);
                return {
                    ...item,
                    date: formattedDate,
                    status: "Canceled"
                };
            });
            console.log("cancelOrder")
            console.log(newItems)
            setCancelOrder(newItems)
            //setOrders(newItems);
        });
        function addTimeToDateTime(datetimeStr, timeStr) {

            // Parse the datetime string
            function parseCustomDateTime(input) {
                const parts = input.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
                const day = parseInt(parts[2], 10);
                const hours = parseInt(parts[3], 10);
                const minutes = parseInt(parts[4], 10);
                const seconds = parseInt(parts[5], 10);
                return new Date(year, month, day, hours, minutes, seconds);
            }

            // Format the Date object into the custom datetime string
            function formatCustomDateTime(date, timeStr) {
                console.log("addTimeToDateTime")
                console.log(timeStr === "23-59")

                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                if (timeStr === "23-59") {
                    return `${year}-${month}-${day}-${hours}-${minutes}-59-99`;
                }
                return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-00`;
            }

            // Parse the time string
            const timeParts = timeStr.split('-');
            const additionalHours = parseInt(timeParts[0], 10);
            const additionalMinutes = parseInt(timeParts[1], 10);

            // Get the datetime object from the datetime string
            const date = parseCustomDateTime(datetimeStr);

            // Add the time from the time string
            date.setHours(date.getHours() + additionalHours);
            date.setMinutes(date.getMinutes() + additionalMinutes);

            // Return the formatted new datetime string
            return formatCustomDateTime(date, timeStr);
        }

        console.log("bbbbbbbbbbbbb")

        // Construct query
        const paymentsQuery = query(
            collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', activeStoreTab, 'success_payment'),
            where('dateTime', '>=', addTimeToDateTime(convertDateFormat(startDate), selectedTime)),
            where('dateTime', '<', addTimeToDateTime(convertDateFormat(endDate ? endDate : startDate), currentTime))
        );


        console.log(addTimeToDateTime(convertDateFormat(endDate ? addDays(endDate, 0) : addDays(startDate, 1)), currentTime))
        console.log(addTimeToDateTime(convertDateFormat(startDate), selectedTime))
        onSnapshot(paymentsQuery, async (snapshot) => {
            console.log("new adde2");
            const newData = snapshot.docs.map(doc => ({
                ...doc.data(),
                intent_ID: doc.data().id,
                id: doc.id,
            }));
            // console.log("new added");
            // console.log(newData)

            newData.sort((a, b) => moment(b.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf() - moment(a.dateTime, "YYYY-MM-DD-HH-mm-ss-SS").valueOf());

            const newItems = [];



            // const balancePromises = newData.map(async item => {
            //   let balanceResult = null;
            //   if (item.latest_charge !== "ch_none") {
            //     balanceResult = await fetchSingleBalance(item.latest_charge, item.stripe_store_acct);
            //   }
            //   return { ...item, balanceResult };
            // });

            // const itemsWithBalances = await Promise.all(balancePromises);

            // for (const item of itemsWithBalances) {
            //   if (item.latest_charge !== "ch_none") {
            //     console.log("FetchSingleBalance result:", item.balanceResult,
            //       item.id, item.stripe_store_acct, item.dateTime,
            //       item.latest_charge
            //     );
            //   }
            // }


            newData.forEach(item => {
                // console.log("sawsssssssss")
                // console.log(item.dateTime)
                const formattedDate = parseDateUTC(item.dateTime, AmericanTimeZone)
                console.log(item.metadata)
                if (item.id.length) if (item && item.id && item.id.length === 36) {
                    item.metadata.total = parseFloat(item.metadata.total) - item.metadata.service_fee
                    item.metadata.tip = 0
                    item.metadata.service_fee = 0
                    // Your code here
                }
                const newItem = {
                    id: item.id,
                    receiptData: item.receiptData,
                    date: formattedDate,
                    email: item.user_email,
                    dineMode: item.metadata.isDine,
                    status: item.powerBy,
                    total: parseFloat(item.metadata.total),
                    tableNum: item.tableNum,
                    metadata: item.metadata,
                    store: item.store,
                    intent_ID: item.intent_ID,
                    Charge_ID: item.latest_charge,
                    transaction_json: item.transaction_json,
                };

                if (!(newItem.total === 0 && newItem.receiptData === "[]")) {
                    if (newItem.receiptData === "[]" && newItem.status === "POS Machine") {
                        console.log(newItem.receiptData)
                        console.log(newItem.intent_ID)
                        getDoc(doc(db, 'intent', newItem.intent_ID)).then(documentSnapshot => {
                            console.log(documentSnapshot.data())
                            if (documentSnapshot.exists()) {
                                const data = documentSnapshot.data();
                                if (data.receipt_JSON !== '[]') {
                                    updateDoc(doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', activeStoreTab, 'success_payment', newItem.id), {
                                        receiptData: data.receipt_JSON
                                    }).then(() => {
                                        console.log("Document successfully updated!");
                                    }).catch(error => {
                                        console.error("Error updating document: ", error);
                                    });
                                }
                            } else {
                                console.log('Document does not exist!');
                            }
                        }).catch(error => {
                            console.error("Error getting document:", error);
                        });
                    }
                    newItems.push(newItem);
                }
            });
            setOrders(newItems);
            console.log(123123123213)
            console.log(newItems)
            saveId(Math.random());
            // console.log(cancelOrder)
            const dailyRevenue = {};
            newItems.forEach(receipt => {
                const date = receipt.date.split(' ')[0];
                const revenue = receipt.total;
                // console.log(receipt)
                // console.log(receipt.total)
                // console.log(revenue)
                if (dailyRevenue[date]) {
                    dailyRevenue[date] += revenue;
                } else {
                    dailyRevenue[date] = revenue;
                }
                console.log(dailyRevenue[date])
            });

            const dailyRevenueArray = Object.keys(dailyRevenue).map(date => ({
                date: date,
                revenue: Math.round(dailyRevenue[date] * 100) / 100
            }));

            setRevenueData(dailyRevenueArray);
        });

        console.log("fetchPost2");

    };

    useEffect(() => {
        if (activeStoreTab !== '') {
            fetchPostAll();
        }

    }, [activeStoreTab, endDate, startDate, currentTime, selectedTime])


    useEffect(() => {
        const colRef = collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent');
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const storeData = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            console.log("storeData")
            console.log(storeData);

            setStorelist(storeData.reverse());
        }, (error) => {
            console.error("Error fetching data: ", error);
        });

        // Cleanup function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, []); // Ensure db and user.uid are in the dependency array if they might change

    const [expandedOrderIds, setExpandedOrderIds] = useState([]);
    function daysBetweenDates(dateString1, dateString2) {
        // Parse the date strings into Date objects
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);

        // Calculate the difference in time in milliseconds
        let timeDiff = Math.abs(date2.getTime() - date1.getTime());

        // Ensure the time difference is at least one day
        const oneDayInMillis = 1000 * 3600 * 24;
        if (timeDiff < oneDayInMillis) {
            timeDiff = oneDayInMillis;
        }

        // Convert the time difference from milliseconds to days
        const daysDiff = timeDiff / oneDayInMillis;

        return daysDiff;
    }

    const toggleExpandedOrderId = (orderId) => {
        if (expandedOrderIds.includes(orderId)) {
            setExpandedOrderIds(expandedOrderIds.filter(id => id !== orderId));
        } else {
            setExpandedOrderIds([...expandedOrderIds, orderId]);
        }
    };
    //REVENUE CHART 31 DAYS FROM NOW
    //const today = new Date("2023-12-19");

    const sortedData = revenueData.sort((a, b) => new Date(a.date) - new Date(b.date)).map(item => ({ ...item, date: (new Date(item.date).getMonth() + 1) + '/' + new Date(item.date).getDate() }));


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

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [purpose, setPurpose] = useState('login'); // 直接使用 useState

    // 固定的用户列表
    const users = [
        { phonenumber: '9294614214', username: '群' },
        { phonenumber: '9876543210', username: 'Bob' },
        { phonenumber: '5556667777', username: 'Charlie' }
    ];

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setIsPopupOpen(false);
    };

    const dateNow = (new Date().getMonth() + 1).toString().padStart(2, '0') + '/' + new Date().getDate().toString().padStart(2, '0') + '/' + new Date().getFullYear()
    // Existing state for the selected date
    const [showChart, setShowChart] = useState(false);



    const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#9e2820', '#000000'];

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

    const [isModalOpen, setModalOpen] = useState(false);


    // Rename state variables
    const [formValues, setFormValues] = useState({
        storeName: '',
        storeNameCHI: '',
        city: '',
        picture: '',
        physical_address: '',
        Description: '',
        TaxRate: '',
        State: '',
        ZipCode: '',
        Phone: ''
    });

    // Rename function for form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(name)
        console.log(value)
        // 特别为 'TaxRate' 字段进行数字验证
        if (name === 'TaxRate') {
            if (/^\d*\.?\d*$/.test(value) || value === "") { // 允许数字和小数点
                setFormValues({
                    ...formValues,
                    [name]: value
                });
                setError(''); // 清除错误信息
            } else {
                setError('Please enter a valid number for the tax rate.'); // 显示错误信息
            }
        } else {
            // 其他字段不进行数字验证
            setFormValues({
                ...formValues,
                [name]: value
            });
        }
    };
    const [previewUrl, setPreviewUrl] = useState('');

    // Rename function for file input change
    const handleFileInputChange = async (e) => {
        //const file = e.target.files[0];
        setPreviewUrl("https://media3.giphy.com/media/MydKZ8HdiPWALc0Lqf/giphy.gif")
        console.log("hehe")
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
            console.log(error)
        }


    };



    // using the below to control if suboption popping and popping out depending on which store is selected on the side bar
    const [activeStoreId, setActiveStoreId] = useState(null);
    // Rename function for form submission
    const handleFormSubmit = async (e, name, storeNameCHI, address, image, id, physical_address, Description, TaxRate, State, ZipCode, Phone) => {

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
            Description: formValues.Description !== '' ? formValues.Description : Description,
            TaxRate: formValues.TaxRate !== '' ? formValues.TaxRate : TaxRate,
        });
        alert("Updated Successful");
        setShowSyncButton(false)

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
            const isInitial = snapshot.metadata.hasPendingWrites === false && snapshot.metadata.fromCache === false;
            const docs = [];
            snapshot.forEach((doc) => {
                docs.push({ orderId: doc.id, ...doc.data() });
            });

            console.log("PendingDineInOrder");
            console.log(docs);
            snapshot.docChanges().forEach((change) => {
                if (!isInitial && (change.type === "added" || change.type === "modified")) {
                    if (change.doc.data().isConfirm === false) {
                        if (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")) {
                            playSound_CHI()
                        } else {
                            playSound()
                        }
                    }
                }
            });
            function sortArrayByTime(arr) {
                // Sorting the array first by status and then by time
                arr.sort((a, b) => {
                    // Prioritize 'delivery' status
                    if (a.Status === 'Delivery' && b.Status !== 'Delivery') {
                        return -1; // a comes first
                    } else if (a.Status !== 'Delivery' && b.Status === 'Delivery') {
                        return 1; // b comes first
                    }

                    // If both have the same status or neither is 'delivery', sort by date
                    let dateA = new Date(a.date);
                    let dateB = new Date(b.date);
                    return dateB - dateA; // Sorting in descending order (latest to oldest)
                });

                return arr;
            }



            setNotificationData(sortArrayByTime(docs.filter(order => order.isConfirm === false)))
            setDocuments(docs.filter(order => order.isConfirm === false));
        }, (error) => {
            // Handle any errors
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect

    const [previousHash, setPreviousHash] = useState(window.location.hash);
    const [alertModal, setAlertModal] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            const currentHash = window.location.hash;
            // Retrieve items from localStorage
            const oldData = localStorage.getItem("Old_" + storeID);
            const newData = localStorage.getItem(storeID);

            // Parse the JSON strings into objects
            const oldArray = JSON.parse(oldData);
            const newArray = JSON.parse(newData);

            // Function to sort arrays (adjust based on your data's structure)
            function sortArray(array) {
                return array.sort();
            }

            // Sort both arrays
            const sortedOldArray = sortArray(oldArray);
            const sortedNewArray = sortArray(newArray);

            // Function to compare two arrays deeply
            function areArraysEqual(arr1, arr2) {
                if (arr1.length !== arr2.length) return false;
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] !== arr2[i]) return false;
                }
                return true;
            }

            // Compare the sorted arrays
            const isEqual = areArraysEqual(sortedOldArray, sortedNewArray);
            // Check if the previous hash was '#cards' and the current hash is different
            if (previousHash.includes('#book') && currentHash !== '#book') {
                if (localStorage.getItem("Old_" + storeID) === localStorage.getItem(storeID)) {

                } else {
                    setAlertModal(true)

                }
                //alert('You have navigated away from #book');
            }

            // Update the previous hash state
            setPreviousHash(currentHash);
        };

        // Add event listener for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [previousHash, storeID]);

    const updateKey = async () => {
        console.log("updateKey");
        // Reference to the specific document
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);

        // Update the 'key' field to the value retrieved from localStorage
        await updateDoc(docRef, {
            key: localStorage.getItem(storeID)
        });
        alert("Saved Successful");

    };

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
                    //setIsVisible(false)
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
                const colRef = collection(db, 'stripe_customers', user.uid, 'TitleLogoNameContent');
                const unsubscribe = onSnapshot(colRef,
                    (snapshot) => {
                        const storeData = snapshot.docs.map((doc) => ({
                            ...doc.data(),
                            id: doc.id,
                        }));
                        console.log(storeData);
                        resolve(storeData.reverse());  // Resolve the promise with the data
                    },
                    (error) => {
                        reject(error);  // Reject the promise if there's an error
                    }
                );

                return () => unsubscribe();  // Return a function to unsubscribe when no longer needed
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
                        setStoreCHI_(selectedStore.storeNameCHI);
                        setAmericanTimeZone(getTimeZoneByZip(selectedStore.ZipCode))
                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(selectedStore.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))

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
                        setStoreCHI_(selectedStore.storeNameCHI)
                        setAmericanTimeZone(getTimeZoneByZip(selectedStore.ZipCode))
                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(selectedStore.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))

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
                        setStoreCHI_(selectedStore.storeNameCHI)
                        setAmericanTimeZone(getTimeZoneByZip(selectedStore.ZipCode))
                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(selectedStore.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))

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
                        setStoreCHI_(selectedStore.storeNameCHI)
                        setAmericanTimeZone(getTimeZoneByZip(selectedStore.ZipCode))
                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(selectedStore.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))

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
                        setStoreCHI_(selectedStore.storeNameCHI)
                        setAmericanTimeZone(getTimeZoneByZip(selectedStore.ZipCode))
                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(selectedStore.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))
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
            setStoreCHI_('')
            setAmericanTimeZone(setAmericanTimeZone(getTimeZoneByZip("94133")))//dont change, this is for init
            setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE))
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
            setStoreName_('');
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
    // Initialize state with 0 seconds
    const [seconds, setSeconds] = useState(0);
    const isLocalHost = !isMobile;

    useEffect(() => {
        // Set up an interval that updates the `seconds` state every second
        const interval = setInterval(() => {
            const ringbell = $('#ringbell');
            if (numberReviewVariable === 0) {

            } else {
                setTimeout(() => {
                    $('#ringbell').addClass('shake');
                }, 200);

                setTimeout(() => {
                    ringbell.removeClass('shake');
                }, 0);
                // if (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")) {
                //   playSound_CHI()
                // } else {
                //   playSound()
                // }
            }


            setSeconds(prevSeconds => prevSeconds + 1);
        }, 2000);

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, [numberReviewVariable]); // Empty dependency array means this effect runs only once on mount

    useEffect(() => {
        // console.log("numberReviewVariable has been updated:", numberReviewVariable);
        // Perform any additional logic in the parent component when the number changes
        setNumberReviewVariable(notificationData.length);
        $('#ringbell').attr("data-totalitems", notificationData.length);

    }, [notificationData]);

    const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);
    const [modalStore, setModalStore] = useState('');
    const [modalID, setModalID] = useState('');
    const [modalTips, setModalTips] = useState('');
    const [modalTotal, setModalTotal] = useState('');
    const [modalSubtotal, setModalSubtotal] = useState('');

    // 添加物品销量分析模态框状态
    const [isItemAnalyticsModalOpen, setItemAnalyticsModalOpen] = useState(false);

    const [isVisible, setIsVisible] = useState(!isMobile);

    const toggleVisibility = () => {

        setIsVisible(!isVisible);

    };
    const [divHeight, setDivHeight] = useState('calc(100vh - 100px)');

    useEffect(() => {
        const updateHeight = () => {
            const screenHeight = window.innerHeight;
            const newHeight = `${screenHeight - 60}px`;
            setDivHeight(newHeight);
        };

        // Call updateHeight on mount and add resize event listener
        updateHeight();
        window.addEventListener('resize', updateHeight);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', updateHeight);
    }, []);
    function deleteDocument(docId) {
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "success_payment", docId);
        deleteDoc(docRef)
            .then(() => {
                console.log("Document successfully deleted!");
            })
            .catch((error) => {
                console.error("Error removing document: ", error);
            });
    }

    const [tipAmount, setTipAmount] = useState('');
    async function bankReceipt(Charge_ID, id, date) {
        console.log(Charge_ID);
        const bankReceiptFunction = firebase.functions().httpsCallable('bankReceipt');
        console.log(JSON.parse(localStorage.getItem("TitleLogoNameContent" || "[]"))?.stripe_store_acct)
        try {
            const result = await bankReceiptFunction({ Charge_ID: Charge_ID, docId: id, displayDate: date, acct: JSON.parse(localStorage.getItem("TitleLogoNameContent" || "[]"))?.stripe_store_acct });
            console.log('Result:', result.data.paymentCharge);
            console.log('data:', result.data.paymentCharge);

            // Handle the successful response here
            return result.data.Charge_ID;
        } catch (error) {
            console.error('Error calling bankReceipt:', error);
            // Handle errors here
            throw error;
        }
    }

    // Function to handle the change in input
    const handleTipChange = (event) => {
        let value = event.target.value.replace(/。/g, '.'); // 替换所有中文句号为英文句号
        setTipAmount(value);
    };

    function roundToTwoDecimals(n) {
        return Math.round(n * 100) / 100;
    }
    function roundToTwoDecimalsTofix(n) {
        return (Math.round(n * 100) / 100).toFixed(2);
    }
    // Function to handle the confirm action
    const handleConfirm = async () => {
        console.log(modalStore)
        console.log(modalID)
        // Here you can use the tipAmount for whatever you need
        console.log('tipAmount amount is:', tipAmount);
        console.log('Tip amount is:', modalTips);
        console.log('total amount is:', modalTotal);
        let tipsUpdated = roundToTwoDecimals(roundToTwoDecimals(tipAmount) + roundToTwoDecimals(modalTips))
        let totalUpdated = roundToTwoDecimals(roundToTwoDecimals(modalTotal) - roundToTwoDecimals(modalTips) + roundToTwoDecimals(tipsUpdated))
        // Add additional actions here
        console.log(tipsUpdated)
        console.log(totalUpdated)
        try {
            setSplitPaymentModalOpen(false)
            // Update document here
            const paymentDocRef = doc(db, 'stripe_customers', user.uid, 'TitleLogoNameContent', modalStore, 'success_payment', modalID);
            await updateDoc(paymentDocRef, {
                amount: Math.round(totalUpdated * 100),
                amount_received: Math.round(totalUpdated * 100),
                'metadata.total': totalUpdated,
                'metadata.tips': tipsUpdated
            });

            // Log success with document ID and latest data
            console.log(`Success: Document ${modalID} updated with data:`);
            setModalStore(''); setModalID(''); setModalTips(''); setModalTotal('')
            setTipAmount('')
            // Wait a bit after each update
            //await new Promise(resolve => setTimeout(resolve, 1000)); // waits for 1 second
        } catch (error) {
            // Log failure with document ID and error
            console.error(`Failed: Document ${modalID} update error:`, error);
        }

    };
    function handlePrint() {
        console.log("osjaopwiajsojwaosw")
        console.log(docIds)
        sendMessageToIframes('PrintQRcode', docIds)
    }
    const [order_status, setOrder_status] = useState("");
    const [order_table, setOrder_table] = useState("");
    const OpenCashDraw = async () => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
            const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "OpenCashDraw"), {
                date: date,
                data: [],
                selectedTable: 'Cash Drawer'
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    const [location, getLocation] = useGeolocation();
    function checkGeolocation() {
        getLocation().then((newLocation) => {
            console.log(newLocation.latitude, newLocation.longitude);
            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);
            async function getAddress(lat, lng, apiKey) {
                const url = `https://maps.googleapis.com/maps/api/geocode/json`;
                try {
                    const response = await fetch(`${url}?latlng=${lat},${lng}&key=${apiKey}`);
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        return data.results[0].formatted_address;
                    } else {
                        return "No address found for the given coordinates.";
                    }
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }

            // Example usage
            const latitude = newLocation.latitude;
            const longitude = newLocation.longitude;
            const apiKey = "AIzaSyCzQFlkWHAXd9NUcxXA2Xl7eCj6lM_w6Ww"; // Replace with your API key

            getAddress(latitude, longitude, apiKey)
                .then(address => {
                    const addressParts = address.split(", ");
                    const [street, city, stateZip] = addressParts;
                    const [state, zipCode] = stateZip.split(" ");


                    setFormValues({
                        ...formValues,
                        ["physical_address"]: street.trim(),
                        ["city"]: city.trim(),
                        ["State"]: state.trim(),
                        ["ZipCode"]: zipCode.trim(),
                    });
                    alert(address + " added successfully!"); // Alert message for successful upload
                })
                .catch(err => console.error(err));


            // Update the lat and long fields within the latNlong map
            updateDoc(docRef, {
                "latNlong.lat": newLocation.latitude,
                "latNlong.long": newLocation.longitude
            }).then(() => {
                console.log("Document successfully updated with new latitude and longitude");

            }).catch((error) => {
                console.error("Error updating document: ", error);
                alert("Error updating document. Please try again."); // Optionally, alert the user in case of an error.

            });
        });
    }
    const [iframeAllowed, setIframeAllowed] = useState(false);
    const iframeRef1 = useRef(null);
    const broadcastChannel = new BroadcastChannel('iframe_presence_channel');

    // Function to send a message to the iframe
    const sendMessageToIframes = (type, data) => {
        const message = { type, json: data };

        // Send message if the iframe is allowed and the reference points to the iframe element
        if (iframeAllowed && iframeRef1.current) {
            iframeRef1.current.contentWindow.postMessage(message, 'http://localhost:3001');
        }
    };

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'iframe_exists') {
                // Another instance has an iframe, do not allow this instance to create one
                setIframeAllowed(false);
            }
        };

        broadcastChannel.addEventListener('message', handleMessage);
        broadcastChannel.postMessage('does_iframe_exist');

        const timeoutId = setTimeout(() => {
            setIframeAllowed(true);
            broadcastChannel.postMessage('iframe_exists');
        }, 1); // Adjust timeout as necessary

        return () => {
            clearTimeout(timeoutId);
            broadcastChannel.removeEventListener('message', handleMessage);
            broadcastChannel.close();
        };
    }, []);

    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "listOrder");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    sendMessageToIframes('listOrder', change.doc.data())
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect

    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "OpenCashDraw");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    sendMessageToIframes('OpenCashDraw', change.doc.data())
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect

    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "SendToKitchen");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    sendMessageToIframes('SendToKitchen', change.doc.data())
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect
    const divRef = useRef(null);

    const handleScroll = () => {
        const element = divRef.current;
        // Check if the scroll position is at the bottom
        const threshold = 1;
        // Check if the scroll position is within the threshold from the bottom
        const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + threshold;

        if (atBottom) {
            console.log(atBottom)
            handleLoadMore()
        }

    };

    useEffect(() => {
        const div = divRef.current;
        if (div) {
            div.addEventListener('scroll', handleScroll);

            // Cleanup the event listener when the component unmounts
            return () => {
                div.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);
    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "DeletedSendToKitchen");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    sendMessageToIframes('DeletedSendToKitchen', change.doc.data())
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect

    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "CustomerReceipt");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && (change.doc.data().date > date)) {
                    const index = storelist.findIndex(data => data.id === storeID);

                    if (index !== -1) {
                        // The object was found, you can access it using storelist[index]
                        const selectedStore = storelist[index];

                        // Now, you can perform actions with the selected store object

                        let jsonObject = change.doc.data();
                        jsonObject.storeId = selectedStore.id;
                        jsonObject.storeName = selectedStore.Name;
                        jsonObject.storeAddress = selectedStore.physical_address;
                        jsonObject.Description = selectedStore.Description;
                        jsonObject.TaxRate = selectedStore.TaxRate;
                        jsonObject.storeState = selectedStore.State;
                        jsonObject.storeZipCode = selectedStore.ZipCode;
                        jsonObject.storePhone = selectedStore.Phone;
                        jsonObject.storeNameCHI = selectedStore.storeNameCHI;
                        jsonObject.storeCityAddress = selectedStore.Address;
                        sendMessageToIframes('CustomerReceipt', jsonObject)
                    }
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect
    // Function to generate chunks of data
    function* createChunkGenerator(itemList = [], chunkSize = 100) {
        let chunkCount = 0;

        while (itemList.length > 0) {
            chunkCount++;
            yield {
                chunkCount,
                itemList: itemList.splice(0, chunkSize),
            };
        }
    }

    // State to manage the displayed orders based on filters
    const [displayedOrders, setDisplayedOrders] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // Assume initially that there might be no data

    // useRef to persist the chunk generator
    const chunkGeneratorRef = useRef(null);

    // Filter and set displayed orders based on status and table number
    useEffect(() => {
        console.log("Filter and set displayed orders based on status and table number")
        if (!cancelOrder) {
            return
        }
        if (!orders) {
            return
        }
        // Function to convert a time string to a Date object
        function parseTime(timeString) {
            // Assuming the time string is in local time and adding '20' to convert 'YY' to 'YYYY'
            return new Date('20' + timeString);
        }
        const filteredOrders = orders.concat(cancelOrder)?.sort((a, b) => parseTime(b.date) - parseTime(a.date))?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table));
        setDisplayedOrders(filteredOrders);
        setItems([])
    }, [orders, order_status, order_table, cancelOrder]);

    // Initialize the chunk generator and load the initial set of items
    useEffect(() => {
        chunkGeneratorRef.current = createChunkGenerator([...displayedOrders], 100);
        const initialChunk = chunkGeneratorRef.current.next();
        if (!initialChunk.done) {
            setItems(initialChunk.value.itemList);
            setLoading(false); // Update loading state based on content availability
        } else {
            setLoading(true); // No data to load
        }
    }, [displayedOrders]);

    // Handle loading more items
    const handleLoadMore = () => {
        if (!chunkGeneratorRef.current) {
            return;
        }

        const chunk = chunkGeneratorRef.current.next();
        if (!chunk.done) {
            setItems(prevItems => [...prevItems, ...chunk.value.itemList]);

        } else {
            setLoading(true); // When no more data to load, hide the button
        }
    };

    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "MerchantReceipt");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && (change.doc.data().date > date)) {
                    const index = storelist.findIndex(data => data.id === storeID);

                    if (index !== -1) {
                        // The object was found, you can access it using storelist[index]
                        const selectedStore = storelist[index];

                        // Now, you can perform actions with the selected store object

                        let jsonObject = change.doc.data();
                        jsonObject.storeId = selectedStore.id;
                        jsonObject.storeName = selectedStore.Name;
                        jsonObject.storeAddress = selectedStore.physical_address;
                        jsonObject.Description = selectedStore.Description;
                        jsonObject.TaxRate = selectedStore.TaxRate;
                        jsonObject.storeState = selectedStore.State;
                        jsonObject.storeZipCode = selectedStore.ZipCode;
                        jsonObject.storePhone = selectedStore.Phone;
                        jsonObject.storeNameCHI = selectedStore.storeNameCHI;
                        jsonObject.storeCityAddress = selectedStore.Address;
                        sendMessageToIframes('MerchantReceipt', jsonObject)
                    }
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect


    useEffect(() => {
        // Ensure the user is defined
        if (!user || !user.uid) return;
        if (!storeID) return;

        // Assuming you convert your date to a Firestore compatible timestamp or keep it in a comparable string format
        let dateTime = new Date().toISOString();
        let date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
        const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID, "bankReceipt");

        // Adjust the query to include a condition for the `date` field
        const q = query(collectionRef, where("date", ">", date));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && (change.doc.data().date > date)) {
                    const index = storelist.findIndex(data => data.id === storeID);

                    if (index !== -1) {
                        // The object was found, you can access it using storelist[index]
                        const selectedStore = storelist[index];

                        // Now, you can perform actions with the selected store object

                        let jsonObject = change.doc.data();
                        jsonObject.storeId = selectedStore.id;
                        jsonObject.storeName = selectedStore.Name;
                        jsonObject.storeAddress = selectedStore.physical_address;
                        jsonObject.Description = selectedStore.Description;
                        jsonObject.TaxRate = selectedStore.TaxRate;
                        jsonObject.storeState = selectedStore.State;
                        jsonObject.storeZipCode = selectedStore.ZipCode;
                        jsonObject.storePhone = selectedStore.Phone;
                        jsonObject.storeNameCHI = selectedStore.storeNameCHI;
                        jsonObject.storeCityAddress = selectedStore.Address;
                        sendMessageToIframes('bankReceipt', jsonObject)
                    }
                }
            });
        }, (error) => {
            console.error("Error getting documents:", error);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [storeID]); // Dependencies for useEffect
    let displayIndex = 1;
    const [selectedTableIframe, setSelectedTableIframe] = useState("null");
    const [isModalOpenIframe, setModalOpenIframe] = useState(false);

    const [isPasswordOpen, setPasswordOpen] = useState(false);

    const handleSavePasswordSettings = async () => {
        // Step 1: Validate inputs and Trigger sending the code
        setPasswordError('');
        setPasswordSuccess('');
        setModalError('');
        setModalInfo('');
        // Don't setShowCodeInput(false); - We now use isEmailModalOpen

        // Basic frontend validation
        // if (!newAdminPassword || !newEmployeePassword) {
        //     setPasswordError("Both admin and employee passwords must be provided.");
        //     return;
        // }
        if ((newAdminPassword && newAdminPassword.length < 6) || (newEmployeePassword && newEmployeePassword.length < 6)) {
            setPasswordError("Passwords must be at least 6 characters long.");
            return;
        }

        console.warn("SECURITY WARNING: Attempting to trigger email sending. Ensure backend credentials are secure!");

        setIsSendingCode(true);
        setModalError('');
        setModalInfo('');
        setPasswordError(''); // Clear main errors before sending

        try {
            const result = await sendVerificationCodeFunction({});
            console.log("Send code function result:", result);
            setModalInfo(`Verification code sent to ${user.email}. Please check your inbox.`);
            setIsEmailModalOpen(true);
        } catch (error) {
            console.error("Error sending verification code:", error);
            setPasswordError(`Failed to send verification code: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCodeAndSave = async (codeInput) => {
        // Step 2: Verify code (passed from modal) and save
        setModalError(''); // Clear modal error
        setModalInfo(''); // Clear modal info
        setPasswordSuccess(''); // Clear main success message

        if (!codeInput || codeInput.length !== 6) {
            setModalError("Please enter the 6-digit verification code.");
            return; // Keep modal open
        }

        setIsVerifyingCode(true);
        try {
            const payload = {
                storeId: storeID,
                newAdminPassword,
                newEmployeePassword,
                verificationCode: codeInput, // Use code passed from modal
            };
            // Call the Cloud Function to verify the code and save passwords
            const result = await verifyCodeAndSavePasswordFunction(payload);
            console.log("Verify and save function result:", result);

            setPasswordSuccess(result.data.message || "Passwords updated successfully!");
            // Reset fields, close modal, and reset password existence check state
            setNewAdminPassword('');
            setNewEmployeePassword('');
            setIsEmailModalOpen(false);
            setPasswordsExist(true); // Assume passwords now exist
            setShowPasswordInputs(false); // Hide inputs again after successful reset

        } catch (error) {
            console.error("Error verifying code or saving password:", error);
            setModalError(`Verification or save failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsVerifyingCode(false);
        }
    };

    // --- Effect to check if passwords exist when store settings are shown ---
    useEffect(() => {
        const checkPasswordStatus = async () => {
            if (showSection === 'store' && storeID && user?.uid) {
                console.log(`Checking password status for store: ${storeID}`);
                setIsCheckingPasswordStatus(true);
                setPasswordsExist(null); // Reset while checking
                setShowPasswordInputs(false); // Hide inputs initially
                setPasswordError(''); // Clear previous errors
                setPasswordSuccess('');

                const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeID);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().adminPasswordHash) {
                        console.log("Passwords exist for this store.");
                        setPasswordsExist(true);
                        setShowPasswordInputs(false); // Keep inputs hidden initially
                    } else {
                        console.log("Passwords do NOT exist (or document missing). Enabling setup.");
                        setPasswordsExist(false);
                        setShowPasswordInputs(true); // Show inputs for initial setup
                    }
                } catch (error) {
                    console.error("Error checking password status:", error);
                    setPasswordError("Could not check current password status.");
                    setPasswordsExist(null); // Indicate error/unknown state
                    setShowPasswordInputs(false);
                } finally {
                    setIsCheckingPasswordStatus(false);
                }
            } else {
                // Reset when not viewing store settings or storeID/user changes
                setPasswordsExist(null);
                setShowPasswordInputs(false);
                setIsCheckingPasswordStatus(false);
            }
        };

        checkPasswordStatus();
    }, [storeID, showSection, user?.uid]); // Rerun if store, section, or user changes


    return (
        <div>
            <EmailVerificationModal
                isOpen={isEmailModalOpen}
                onClose={() => {
                    setIsEmailModalOpen(false);
                    setModalError(''); // Clear errors when manually closing
                    setModalInfo('');
                }}
                email={user?.email}
                onSubmit={handleVerifyCodeAndSave} // Pass the handler
                isLoading={isVerifyingCode} // Pass verifying state as isLoading
                error={modalError} // Pass modal-specific error
                success={modalInfo} // Pass modal-specific info/success message
            />

            {iframeAllowed ?
                <iframe
                    ref={iframeRef1} // Correct reference used here
                    src="http://localhost:3001"
                    title="Localhost Iframe 1"
                    width="0"
                    height="0"        >

                </iframe>
                :

                <div >
                    {
                        storeID !== '' && (
                            <div style={{
                                backgroundColor: '#FFEB3B',
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {
                                    (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")) ? (
                                        <div style={{ maxWidth: '60%', fontSize: '16px', lineHeight: '1.5' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '5px' }}></i>
                                            由于已经打开新的管理页面，这个页面打印机驱动接口已被自动终止。
                                        </div>
                                    ) : (
                                        <div style={{ maxWidth: '60%', fontSize: '16px', lineHeight: '1.5' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '5px' }}></i>
                                            Due to the recent opening of new administrative pages, the printer driver interface on this page has been automatically terminated.
                                        </div>
                                    )
                                }
                                <button onClick={() => window.location.reload()} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#9E9E9E',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    <i className="bi bi-arrow-clockwise" style={{ marginRight: '5px' }}></i>
                                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? '重新加载打印机驱动接口。' : 'Click here to Refresh Driver'}
                                </button>
                            </div>
                        )
                    }

                </div>

            }
            <div>
                <style>
                    {`
          /* Webpixels CSS */
          @import url(https://unpkg.com/@webpixels/css@1.1.5/dist/index.css);

          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
                </style>
                {isSplitPaymentModalOpen && (
                    <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
                        <div style={{
                            position: 'fixed',
                            zIndex: 1000,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '40px',
                            boxSizing: 'border-box',
                            maxWidth: '500px',
                            width: '80%'
                        }}>
                            <div style={{
                                marginBottom: '30px',
                                textAlign: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#333'
                            }}>
                                Add Extra Gratuity
                            </div>
                            <label htmlFor="tipAmount" style={{
                                marginRight: '10px',
                                marginBottom: '10px',
                                fontSize: '17px',
                                fontWeight: '500',
                                color: '#555'
                            }}>Gratuity Amount:</label>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginBottom: '30px'
                            }}>

                                <input
                                    type="number"
                                    id="tipAmount"
                                    name="tipAmount"
                                    value={tipAmount}
                                    onChange={handleTipChange}
                                    min="0"
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        width: '100%',
                                        fontSize: '16px'
                                    }}
                                />
                                <div className="flex justify-between mt-4 w-100">
                                    <button onClick={() => { setTipAmount(roundToTwoDecimals(roundToTwoDecimals(modalSubtotal) * 0.15)) }} style={{
                                        background: 'purple',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32%',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}>
                                        15%
                                    </button>
                                    <button onClick={() => { setTipAmount(roundToTwoDecimals(roundToTwoDecimals(modalSubtotal) * 0.18)) }} style={{
                                        background: 'purple',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32%',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        margin: '0 4%'
                                    }}>
                                        18%
                                    </button>
                                    <button onClick={() => { setTipAmount(roundToTwoDecimals(roundToTwoDecimals(modalSubtotal) * 0.20)) }} style={{
                                        background: 'purple',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: '32%',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}>
                                        20%
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <button
                                    onClick={() => {
                                        setTipAmount('');
                                        setSplitPaymentModalOpen(false);
                                    }} style={{
                                        background: '#f44336', // Red background for cancel
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirm()}
                                    style={{
                                        background: '#4CAF50', // Green background for confirm
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '500'
                                    }}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>

                )}
                {alertModal && (
                    <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-[9999] w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
                        <div style={{
                            position: 'fixed',
                            zIndex: 1000,
                            top: '30%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '40px',
                            boxSizing: 'border-box',
                            maxWidth: '500px',
                            width: '80%'
                        }}>
                            <div style={{
                                marginBottom: '30px',
                                textAlign: 'center',
                                fontSize: '28px',
                                fontWeight: '600',
                                color: '#333'
                            }}>
                                Warning from Menu Settings:
                            </div>
                            <div style={{
                                fontSize: '20px',
                                textAlign: 'center',
                                marginBottom: '40px',
                                color: '#555',
                                lineHeight: '1.5'
                            }}>
                                You may have unsaved changes in the Menu Settings. Do you want to save your changes?
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}>
                                <button
                                    onClick={() => { setAlertModal(false); localStorage.setItem(storeID, localStorage.getItem("Old_" + storeID)) }}
                                    style={{
                                        background: '#f44336', // Red background for cancel
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={() => { setAlertModal(false); updateKey() }}
                                    style={{
                                        background: '#4CAF50', // Green background for confirm
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: '500'
                                    }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>

          </div>
        )}
        {isPC ?
          <div className="d-flex justify-acontent-between mx-3 ">
            {/* <button onClick={toggleVisibility}>
              {!isVisible ?
                <div>

                  <button>
                    <i class="bi bi-bookmarks">  </i>
                    Open Side Menu
                  </button>

                </div> :

                <div>
                </div>
              }
            </button> */}
            {/* {//
              (previousHash.includes('#charts') && storeID !== '') || (previousHash.includes('#code') && storeID !== '') ?
                <div>
                  <button
                    onClick={(e) => {
                      OpenCashDraw()
                    }}
                    className="btn btn-sm btn-info mr-5">
                    <i className="bi bi-cash-stack pe-2"></i>
                    Open Cash Drawer
                  </button>
                </div>
                :
                null
            } */}

          </div>
          :
          <div></div>
        }
        <div className="d-flex flex-column flex-lg-row h-lg-full bg-surface-secondary">

          {/* Removed (isVisible || !isPC) && condition from here */}
          <div style={{ position: 'relative', height: isPC ? divHeight : 'unset' }}>
            {isPC && isModalOpenIframe === false ? (
              <>
                <nav
                  className="navbar navbar-vertical navbar-expand-lg px-0 py-3 navbar-light bg-gray-100 border-end shadow-sm overflow-auto"
                  id="navbarVertical"
                  style={{
                    minWidth: isVisible ? '250px' : '70px',
                    width: isVisible ? '250px' : '70px',
                    transition: 'width 0.3s ease',
                    height: `calc(${divHeight} - 50px)`, // Subtract the height of the bottom button
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    position: 'relative'
                  }}
                >
                  <div className="container-fluid" style={{
                    padding: "5px 10px 10px 10px", // Adjust bottom padding
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    justifyContent: 'flex-start'
                  }}>
                    {/* Removed toggle button from here */}

                    {isOnline && (
                      <button
                        className="mt-2 btn w-100 mb-2 btn-primary text-white shadow-sm"
                        onClick={(e) => {
                          handleTabClick(e, '#profile')
                          setActiveStoreTab('');
                          setShowSection('');
                          setStoreName_('');
                          setStoreCHI_('')
                          setAmericanTimeZone(getTimeZoneByZip("94133"))//dont change this is for init
                          setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE))
                          setActiveStoreId('')
                          setStoreOpenTime('')
                          setStoreID('');

                          if (storeFromURL !== '' && storeFromURL !== null) {
                            window.history.pushState(null, '', `/account?store=${storeFromURL}`);
                          } else {
                            window.history.pushState(null, '', '/account');
                          }
                        }}
                      >
                        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: isVisible ? 'row' : 'column' }}>
                          <i className="bi bi-person scale-125" style={{ display: 'inline-block', verticalAlign: 'middle' }}></i>
                          {isVisible && <span style={{ marginLeft: "5px" }}>Account</span>}
                        </div>
                      </button>
                    )}

                    {isOnline && (


                      <button
                      onClick={(e) => {
                        setActiveStoreTab('');
                          setShowSection('');
                          setStoreID('');
                          setStoreName_('');
                          setStoreCHI_('')
                          setAmericanTimeZone(getTimeZoneByZip("94133"))//dont change this is for init
                          setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE))
                          setActiveStoreId('')
                          setStoreOpenTime('')
                          setActiveTab('#profile')
                          window.location.hash = 'createStore'
                      }}
                      className="btn w-100 mb-2 btn-success text-white shadow-sm hover:bg-success-dark"
                      >
                      <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: isVisible ? 'row' : 'column' }}>
                          <i className="bi bi-plus-circle scale-125" style={{ display: 'inline-block', verticalAlign: 'middle' }}></i>
                          {isVisible && <span style={{ marginLeft: "5px" }}>Create Store</span>}
                        </div>
                      </button>
                    )}

                    <div className={`store-selector mt-3 ${isVisible ? '' : 'd-none'}`}>
                      <h6 className='text-muted text-uppercase text-xs font-weight-bold mb-2 px-3'>
                        Select Store:
                      </h6>
                    </div>

                    <div className="store-list mt-2">
                      {storelist?.map((data, index) => (
                        <div style={{ display: 'contents' }} key={data.id}>
                          <button
                            className={`mb-2 btn w-100 ${activeTab === `#${data.id}` ? 'shadow-sm' : ''}`}
                            style={{
                              background: 'white',
                              color: '#333',
                              border: activeTab === `#${data.id}`
                                ? `2px solid ${getStoreColor(index)}`
                                : 'none',
                              borderLeft: activeTab === `#${data.id}` ? `4px solid ${getStoreColor(index)}` : '',
                              textAlign: 'left',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              position: 'relative'
                            }}
                            onClick={(e) => {
                              handleTabClick(e, `#${data.id}`);
                              setActiveStoreTab(data.id);
                              setShowSection('sales');
                              setStoreName_(data.Name);
                              setStoreCHI_(data.storeNameCHI)
                              setAmericanTimeZone(getTimeZoneByZip(data.ZipCode))
                              setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(data.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))
                              setStoreID(data.id);
                              setActiveStoreId(data.id)
                              setStoreOpenTime(data.Open_time)
                              window.location.hash = `charts?store=${data.id}`;
                            }}
                          >
                            <div style={{
                              alignItems: 'center',
                              justifyContent: isVisible ? 'space-between' : 'center',
                              display: 'flex',
                              flexDirection: isVisible ? 'row' : 'column',
                              width: '100%'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flex: 1,
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: getStoreColor(index),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  marginRight: isVisible ? '8px' : '0',
                                  flexShrink: 0
                                }}>
                                  {data.Name.charAt(0).toUpperCase()}
                                </div>
                                {isVisible && (
                                  <span className="notranslate" style={{
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                      data.storeNameCHI : data.Name
                                    }
                                  </span>
                                )}
                              </div>
                              {isVisible && activeTab === `#${data.id}` && (
                                <i className="bi bi-chevron-down ms-2" style={{ fontSize: '0.9rem', color: '#666' }}></i>
                              )}
                              {isVisible && activeTab !== `#${data.id}` && (
                                <i className="bi bi-chevron-right ms-2" style={{ fontSize: '0.9rem', color: '#666' }}></i>
                              )}
                            </div>
                          </button>

                          {activeStoreId === data.id && isVisible && (
                            <ul className={`nav nav-tabs mt-2 mb-3 overflow-x border-0 flex flex-col`}
                               style={{
                                 paddingLeft: '15px',
                                 borderLeft: `2px solid ${getStoreColor(index)}`,
                                 marginLeft: '10px'
                               }}
                            >
                              <div>
                                <li className={`nav-item p-1`} style={{ width: "95%", margin: "auto", borderColor: "transparent !important" }}
                                  onClick={() => {
                                    setShowSection('sales')
                                    window.location.hash = `charts?store=${data.id}`;
                                  }}>
                                  <a className={`d-flex align-items-center nav-link rounded-md ${showSection === `sales` ? 'active bg-light' : ''}`}
                                     style={{
                                       marginLeft: "0",
                                       border: "0px",
                                       padding: '8px 12px',
                                       transition: 'all 0.2s ease'
                                     }}
                                  >
                                    <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-line" viewBox="0 0 16 16">
                                        <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-5 0v-3H2v3h2z" />
                                      </svg>
                                    </i>
                                    <span style={{ marginLeft: "5%" }}>Daily Revenue</span>
                                  </a>
                                </li>

                                <li className={`nav-item p-1`} onClick={() => {
                                  setShowSection('qrCode')
                                  window.location.hash = `code?store=${data.id}`
                                }} style={{ width: "95%", margin: "auto" }}>
                                  <a className={`d-flex align-items-center nav-link rounded-md ${showSection === `qrCode` ? 'active bg-light' : ''}`}
                                     style={{
                                       border: "0px",
                                       padding: '8px 12px',
                                       transition: 'all 0.2s ease'
                                     }}
                                  >
                                    <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-columns-gap" viewBox="0 0 16 16">
                                        <path d="M6 1v3H1V1h5zM1 0a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H1zm14 12v3h-5v-3h5zm-5-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-5zM6 8v7H1V8h5zM1 7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H1zm14-6v7h-5V1h5zm-5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1h-5z" />
                                      </svg>
                                    </i>
                                    <span style={{ marginLeft: "5%" }}>Dine In Ordering</span>
                                  </a>
                                </li>

                                <li className={`nav-item p-1`}
                                  onClick={() => {
                                    setShowSection('stripeCard')
                                    window.location.hash = `cards?store=${data.id}`;
                                  }}
                                  style={{ width: "95%", margin: "auto" }}
                                >
                                  <a className={`d-flex align-items-center nav-link rounded-md ${showSection === `stripeCard` ? 'active bg-light' : ''}`}
                                     style={{
                                       border: "0px",
                                       padding: '8px 12px',
                                       transition: 'all 0.2s ease'
                                     }}
                                  >
                                    <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-right-dots" viewBox="0 0 16 16">
                                        <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z" />
                                        <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                      </svg>
                                    </i>
                                    <span style={{ marginLeft: "5%" }}>Notification&nbsp;<span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '15px',
                                        height: '15px',
                                        backgroundColor: 'blue',
                                        borderRadius: '50%',
                                        color: 'white',
                                        fontSize: '10px',
                                        verticalAlign: 'middle'
                                      }}
                                    >
                                      <span className='notranslate'>
                                        {numberReviewVariable}
                                      </span>
                                    </span>
                                    </span>
                                  </a>
                                </li>

                                {!isOnline ? null :
                                  <React.Fragment>
                                    <li className={`nav-item p-1`}
                                      onClick={() => {
                                        setShowSection('menu')
                                        window.location.hash = `book?store=${data.id}`;
                                      }}
                                      style={{ width: "95%", margin: "auto" }}
                                    >
                                      <a className={`d-flex align-items-center nav-link rounded-md ${showSection === `menu` ? 'active bg-light' : ''}`}
                                         style={{
                                           border: "0px",
                                           padding: '8px 12px',
                                           transition: 'all 0.2s ease'
                                         }}
                                      >
                                        <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-diagram-3" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z" />
                                          </svg>
                                        </i>
                                        <span style={{ marginLeft: "5%" }}>Menu Settings</span>
                                      </a>
                                    </li>

                                    {isOnline && (
                                      <li className={`nav-item border-b-0 p-1`}
                                        onClick={() => {
                                          setShowSection('store')
                                          window.location.hash = `settings?store=${data.id}`;
                                        }}
                                        style={{ width: "95%", margin: "auto", border: "0px" }}
                                      >
                                        <a className={`d-flex align-items-center nav-link rounded-md ${showSection === `store` ? 'active bg-light' : ''}`}
                                           style={{
                                             marginRight: "0",
                                             border: "0px",
                                             padding: '8px 12px',
                                             transition: 'all 0.2s ease'
                                           }}
                                        >
                                          <i className="scale-125 p-0 m-0" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                                              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                            </svg>
                                          </i>
                                          <span style={{ marginLeft: "5%" }}>Store Settings</span>
                                        </a>
                                      </li>
                                    )}
                                  </React.Fragment>
                                }
                              </div>
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 底部收缩按钮 - 真正固定在底部，不跟滚动 */}
                  <button
                    onClick={toggleVisibility}
                    style={{
                      position: 'fixed',
                      bottom: '0',
                      left: '0',
                      width: isVisible ? '250px' : '70px',
                      height: '50px',
                      padding: '0',
                      border: 'none',
                      borderTop: '1px solid #dee2e6',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0',
                      transition: 'all 0.3s ease',
                      zIndex: 1000,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e9ecef';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                  >
                    <i className={`bi bi-chevron-${isVisible ? 'left' : 'right'}`} 
                       style={{ fontSize: '16px' }}></i>
                  </button>
                </nav>
              </>
            ) : ( <div></div> )}
          </div>

                    <div className="flex-grow-1 overflow-y-auto "
                        ref={divRef}
                        style={{
                            backgroundColor: 'white',
                            ...(isMobile ? { height: divHeight } : {}), // 只有是Mobile才加height
                            ...(isModalOpenIframe && isPC ? { zIndex: 1400 } : {}), // 如果开了modal且是PC，才加zIndex
                        }}>
                        {!isPC ?
                            <header className="bg-surface-primary border-bottom pt-0">
                                <div className="container-fluid">
                                    <div className="mb-npx">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="mb-0 mt-2" style={{ "cursor": "pointer" }}>
                                                <h1 className="h2 ls-tight active">
                                                    {activeTab === `#profile` || storeName_ === '' ? 'Account' :
                                                        <span className='notranslate'>
                                                            {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                storeCHI : storeName_
                                                            }
                                                        </span>}

                                                </h1>
                                            </div>

                                            {activeTab === `#profile` || storeName_ === '' ?
                                                <div className="text-sm-end">
                                                    <div className="mx-n1">

                                                        <a className="btn d-inline-flex btn-sm btn-secondary mx-1"
                                                            onClick={() => {
                                                                logoutUser();
                                                                removeFromLocalStorage();
                                                            }}>
                                                            <span className="">
                                                                <i className="bi bi-exclamation-triangle"></i>
                                                            </span>
                                                            <span
                                                            >
                                                                {t("Sign Out")}
                                                            </span>

                                                        </a>
                                                    </div>
                                                </div> : null
                                            }

                                        </div>

                                        <div className="mt-2 mb-2 d-flex" style={{ display: 'flex', alignItems: 'center' }}>
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
                                                    <span>{"Select Store"}</span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu
                                                    className='notranslate'>
                                                    {
                                                        storelist && storelist.length > 0 ?
                                                            storelist.map((data, index) => (
                                                                <Dropdown.Item
                                                                    class="notranslate"
                                                                    onClick={(e) => {
                                                                        handleTabClick(e, `#${data.id}`);
                                                                        setActiveStoreTab(data.id);
                                                                        setShowSection('sales');
                                                                        setStoreName_(data.Name);
                                                                        setStoreCHI_(data.storeNameCHI)
                                                                        setAmericanTimeZone(getTimeZoneByZip(data.ZipCode))
                                                                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup(data.ZipCode)).toLocaleString(DateTime.TIME_SIMPLE))
                                                                        setStoreID(data.id);
                                                                        setActiveStoreId(data.id)
                                                                        setStoreOpenTime(data.Open_time)
                                                                        window.location.hash = `charts?store=${data.id}`;
                                                                    }}
                                                                >
                                                                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                        data.storeNameCHI : data.Name
                                                                    }
                                                                </Dropdown.Item>
                                                            )) :
                                                            null
                                                    }
                                                    <Dropdown.Item onClick={(e) => {
                                                        setActiveStoreTab('');
                                                        setShowSection('');
                                                        setStoreName_('');
                                                        setStoreCHI_('')
                                                        setAmericanTimeZone(getTimeZoneByZip("94133"))//dont change, this is for init
                                                        setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE))
                                                        setStoreID('');
                                                        setActiveStoreId('')
                                                        setStoreOpenTime('')
                                                        setActiveTab('#profile')
                                                        window.location.hash = 'createStore'
                                                    }}>
                                                        <i className="bi bi-pencil"></i>
                                                        &nbsp;Create Store

                                                    </Dropdown.Item>

                                                </Dropdown.Menu>
                                            </Dropdown>


                                            {/* <a

                        class="btn d-inline-flex btn-sm btn-primary mx-1">
                        <span >
                          <i className="bi bi-pencil"></i>
                        </span>
                        <span> {"Create Store"}</span>
                      </a> */}
                                            <a
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent the default anchor action
                                                    window.location.reload(); // Reload the page
                                                }} className="btn d-inline-flex btn-sm btn-danger mx-1">
                                                <i className="bi bi-arrow-clockwise"></i>&nbsp;Refresh </a>
                                            <div>

                                            </div>
                                        </div>

                                        <ul className={`nav nav-tabs mt-4 overflow-x border-0 ${isMobile ? 'd-flex justify-content-between' : ''}`}>
                                            <li className={`nav-item p-0`}
                                                onClick={(e) => {
                                                    handleTabClick(e, '#profile')
                                                    setActiveStoreTab('');
                                                    setShowSection('');
                                                    setStoreID('');

                                                    setStoreName_('');
                                                    setStoreCHI_('')
                                                    setAmericanTimeZone(getTimeZoneByZip("94133"))//dont change, this is for init
                                                    setCutoffTime(DateTime.utc().set({ hour: 0, minute: 0 }).setZone(lookup("94133")).toLocaleString(DateTime.TIME_SIMPLE))
                                                    setActiveStoreId('')
                                                    setStoreOpenTime('')
                                                    if (storeFromURL !== '' && storeFromURL !== null) {
                                                        // Use pushState to change the URL without reloading the page
                                                        window.history.pushState(null, '', `/account?store=${storeFromURL}`);
                                                    } else {
                                                        window.history.pushState(null, '', '/account');
                                                    }
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
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-right-dots" viewBox="0 0 16 16">
                                                                    <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z" />
                                                                    <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                                                </svg>
                                                            </i>
                                                        </a>

                                                    </li>
                                                    {isOnline ?
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

                                                        </li> : null}
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

                                                                </>
                                                            }



                                        </ul>
                                    </div>
                                </div>
                            </header>
                            :
                            <div></div>}

                        <div style={{ "borderRadius": "0" }}>

                            <div style={{
                                backgroundColor: 'white', // Set the background color to white
                            }} className={`card-body tab-content pt-0 pb-0`} ref={elementRef}>
                                {user_loading ?
                                    <div>
                                        Loading...
                                    </div>
                                    : <div>
                                        {activeTab === '#profile' || activeTab === '' ? (

                                            <div className="tab-pane active mt-4" id="profile">
                                                <div className='flex justify-between'>
                                                    <div>

                                                        <a class="nav-link d-flex align-items-center p-0">
                                                            <div>
                                                                <span class="d-block text-md font-semibold notranslate">
                                                                    <i class="bi bi-person"></i>
                                                                    {" "}

                                                                    {user ? user.displayName : ""}
                                                                </span>
                                                                <span class="d-block text-base text-muted font-regular notranslate">
                                                                    <i class="bi bi-envelope"></i>
                                                                    {" "}

                                                                    {(user) ? user.email : ""}

                                                                </span>
                                                                <span class="d-block text-base text-muted font-regular notranslate">
                                                                    <i class="bi bi-person-badge"></i>
                                                                    {" id: "}

                                                                    {(user) ? user.uid : ""}

                                                                </span>
                                                            </div>


                                                        </a>
                                                    </div>
                                                    {isPC ?
                                                        <div>

                                                            <a className="btn d-inline-flex btn-sm btn-danger mx-1"
                                                                onClick={() => {
                                                                    logoutUser();
                                                                    removeFromLocalStorage();
                                                                }}>
                                                                <span className="">
                                                                    <i className="bi bi-exclamation-triangle"></i>
                                                                </span>
                                                                <span
                                                                >
                                                                    {t("Sign Out")}
                                                                </span>

                                                            </a>
                                                        </div> : null}
                                                </div>

                                                <h4>{t("Past Spending History:")}</h4>
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
                                                    <div style={{ display: showSection === 'qrCode' ? 'block' : 'none' }}>

                                                        <IframeDesk isModalOpen={isModalOpenIframe} setModalOpen={setModalOpenIframe} setSelectedTable={setSelectedTableIframe} selectedTable={selectedTableIframe} setIsVisible={setIsVisible} store={data.id} acct={data.stripe_store_acct}
                                                            TaxRate={data.TaxRate}
                                                        ></IframeDesk>
                                                        {/* Assuming you want the QRCode hidden or shown together with IframeDesk, otherwise adjust the condition as needed */}
                                                    </div>

                                                    {showSection === 'stripeCard' ? <div>
                                                        <Test_Notification_Page storeID={data.id}
                                                            reviewVar={numberReviewVariable}
                                                            setReviewVar={setNumberReviewVariable}
                                                            sortedData={notificationData}
                                                            setSortedData={setNotificationData} />
                                                    </div> : <div></div>
                                                    }

                                                    {showSection === 'store' ? <div className="p-4">
                                                        {/* Store Information Card */}
                                                        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
                                                        {/* <div className=''>
                              <div className='mx-auto '>
                                <div className='mt-3 rounded-lg w-full  max-h-[200px] relative'>
                                  <img
                                    className="rounded-lg w-full max-h-[200px] object-cover"
                                    src={(previewUrl !== '') ? previewUrl : data?.Image}
                                    alt="#"
                                  />
                                </div>
                              </div>
                            </div> */}
                                                        <div className="mt-1 max-w-lg rounded-lg overflow-hidden flex">
                                                            <div className="w-2/3 p-1">
                                                                <h3 className="font-bold text-xl text-gray-900 notranslate">{data?.Name}</h3>
                                                                <p className="font-semibold text-gray-800 notranslate">{data?.storeNameCHI}</p>
                                                                <p className="text-gray-700 font-semibold mt-2 notranslate">{data?.Description}</p>
                                                                <p className="text-gray-700 font-semibold mt-2">Tax Rate: {data?.TaxRate}%</p>
                                                                <p className="text-gray-700 text-sm mt-1 notranslate">{data?.physical_address}, {data?.Address}, {data?.City}, {data?.State} {data?.ZipCode}</p>
                                                                <p className="text-gray-700 text-sm mt-1 notranslate">Phone: {data?.Phone}</p>
                                                                <p className="text-blue-600 hover:text-blue-800 font-semibold mt-1 notranslate cursor-pointer hover:underline break-all" onClick={() => window.open(`https://7dollar.delivery/store?store=${storeID}`, "_blank", "noopener,noreferrer")}
                                                                >
                                                                    {`7dollar.delivery/store?store=${storeID}`}
                                                                </p>
                                                            </div>
                                                            <div className="w-1/3 flex flex-col items-center justify-center">
                                                                <div className="qrCodeItem my-2 flex flex-col items-center space-y-2">
                                                                    <QRCode value={`https://7dollar.delivery/store?store=${storeID}`} size={100} />
                                                                </div>

                                                            </div>
                                                        </div>
                                                        {!showSyncButton && (
                                                            <button onClick={() => setShowSyncButton(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded translate-none mt-4">
                                                                Edit Store Info
                                                            </button>
                                                        )}
                                                        </div>






                                                        {showSyncButton ?
                                                            <div>
                                                                <div className="mt-2 flex ">


                                                                    <button onClick={() => checkGeolocation()} className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                                        <i class="bi bi-geo-alt-fill me-2"></i>
                                                                        Auto Fill Address
                                                                    </button>
                                                                </div>
                                                                <form
                                                                    style={{

                                                                        width: isMobile ? '100%' : '45%'
                                                                    }}
                                                                    className="mb-2" onSubmit={(e) => handleFormSubmit(e, data?.Name, data?.storeNameCHI, data?.Address, data?.Image, data?.id, data?.physical_address, data?.Description, data?.TaxRate, data?.State, data?.ZipCode, data?.Phone)}>
                                                                    <div className="flex flex-wrap -mx-3 mb-6">
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="storeName">
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
                                                                                translate="no"
                                                                            />
                                                                        </div>

                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="storeNameCHI">
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
                                                                                translate="no"
                                                                            />

                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="Description">
                                                                                Business Description
                                                                            </label>
                                                                            <input
                                                                                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
                                                                                id="Description"
                                                                                type="text"
                                                                                name="Description"
                                                                                value={formValues.Description}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.Description}
                                                                                translate="no"
                                                                            />
                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="TaxRate">
                                                                                Tax Rate (%)
                                                                            </label>
                                                                            <input
                                                                                className={`appearance-none block w-full bg-gray-200 text-gray-700 border ${error ? 'border-red-500' : 'border-gray-300'} rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white`}
                                                                                id="TaxRate"
                                                                                type="text"
                                                                                name="TaxRate"
                                                                                value={formValues.TaxRate}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.TaxRate}
                                                                                translate="no"
                                                                            />
                                                                            {error && <p className="text-red-500 text-xs italic">{error}</p>}
                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="physical_address">
                                                                                Street
                                                                            </label>
                                                                            <input
                                                                                className=
                                                                                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                id="physical_address"
                                                                                type="text"
                                                                                name="physical_address"
                                                                                value={formValues.physical_address}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.physical_address}
                                                                                translate="no"
                                                                            />
                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="city">
                                                                                City
                                                                            </label>
                                                                            <input
                                                                                className="no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                id="city"
                                                                                type="text"
                                                                                name="city"
                                                                                value={formValues.city}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.Address}
                                                                                translate="no"
                                                                            />
                                                                        </div>

                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="State">
                                                                                State
                                                                            </label>
                                                                            <input
                                                                                className=
                                                                                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                id="State"
                                                                                type="text"
                                                                                name="State"
                                                                                value={formValues.State}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.State}
                                                                                translate="no"
                                                                            />
                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="ZipCode">
                                                                                Zip Code
                                                                            </label>
                                                                            <input
                                                                                className=
                                                                                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                id="ZipCode"
                                                                                type="text"
                                                                                name="ZipCode"
                                                                                value={formValues.ZipCode}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.ZipCode}
                                                                                translate="no"
                                                                            />
                                                                        </div>
                                                                        <div className="w-full px-3">
                                                                            <label style={{ fontWeight: 'bold' }} className="text-gray-700 mt-3 mb-2" htmlFor="Phone">
                                                                                Phone
                                                                            </label>
                                                                            <input
                                                                                className=
                                                                                "no translate appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                                                                id="Phone"
                                                                                type="text"
                                                                                name="Phone"
                                                                                value={formValues.Phone}
                                                                                onChange={handleInputChange}
                                                                                placeholder={data?.Phone}
                                                                                translate="no"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex mt-3">
                                                                        <div style={{ width: "50%" }}></div>
                                                                        <div className="flex justify-end" style={{ margin: "auto", width: "50%" }}>

                                                                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                                                <i className="bi bi-house me-2" style={{ color: "#FFFFFF" }}></i>
                                                                                Submit
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div> : <></>

                                                        }

                                                        {/* Three Cards Responsive Flex Container (no grid) */}
                                                        <div className="flex flex-wrap -mx-2 mb-6">
                                                            {/* Password Management Card */}
                                                            <div className="px-2 mb-4 flex-1 min-w-[320px]">
                                                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-full">
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            Password Management:
                                                        </div>
                                                        <div className="flex justify-start">
                                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                                onClick={() => setPasswordOpen(true)}
                                                            >
                                                                <i class="bi bi-printer-fill me-2"></i>
                                                                Reset Password</button>

                                                        </div>
                                                        {isPasswordOpen && (
                                                            <>

                                                                {/* Loading State */}
                                                                {isCheckingPasswordStatus && (
                                                                    <div className="text-center text-gray-500">
                                                                        Checking password status...
                                                                    </div>
                                                                )}

                                                                {/* Error/Success Messages */}
                                                                {passwordError && !isCheckingPasswordStatus && <div className="alert alert-danger">{passwordError}</div>}
                                                                {passwordSuccess && !isCheckingPasswordStatus && <div className="alert alert-success">{passwordSuccess}</div>}

                                                                {/* Show Reset Button if passwords exist and inputs are hidden */}
                                                                {passwordsExist === true && !showPasswordInputs && !isCheckingPasswordStatus && (
                                                                    <button
                                                                        className="btn btn-warning"
                                                                        onClick={() => {
                                                                            setShowPasswordInputs(true);
                                                                            setPasswordSuccess('');
                                                                        }}
                                                                    >
                                                                        Reset Admin/Employee Passwords
                                                                    </button>
                                                                )}

                                                                <hr />

                                                                {/* Inform user if status is unknown or initial check failed */}
                                                                {passwordsExist === null && !isCheckingPasswordStatus && !passwordError && (
                                                                    <div className="text-center text-gray-500 mt-3">
                                                                        Could not determine password status.
                                                                    </div>
                                                                )}



                                                                {/* Show Inputs & Send Code Button if allowed */}
                                                                {showPasswordInputs && !isCheckingPasswordStatus && (
                                                                    <>
                                                                        <div className="mb-3">
                                                                            <label htmlFor="newAdminPassword" className="form-label">{t('New Admin Password (min. 6 characters)')}</label>
                                                                            <div className={`input-group w-full`}>
                                                                                <input
                                                                                    type={showAdminPassword ? "text" : "password"}
                                                                                    className="form-control"
                                                                                    id="newAdminPassword"
                                                                                    value={newAdminPassword}
                                                                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                                                                    placeholder={t("Enter new admin password")}
                                                                                    disabled={isSendingCode || isVerifyingCode || isEmailModalOpen}
                                                                                    aria-label="New Admin Password"
                                                                                />
                                                                                <button
                                                                                    className="btn btn-link border d-flex align-items-center justify-content-center"
                                                                                    type="button"
                                                                                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                                                                                    disabled={isSendingCode || isVerifyingCode || isEmailModalOpen}
                                                                                    aria-label={showAdminPassword ? t("Hide password") : t("Show password")}
                                                                                    style={{ width: '40px', textDecoration: 'none' }}
                                                                                >
                                                                                    <i className={showAdminPassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="mb-3">
                                                                            <label htmlFor="newEmployeePassword" className="form-label">{t('New Employee Password (min. 6 characters)')}</label>
                                                                            <div className={`input-group w-full`}>
                                                                                <input
                                                                                    type={showEmployeePassword ? "text" : "password"}
                                                                                    className="form-control"
                                                                                    id="newEmployeePassword"
                                                                                    value={newEmployeePassword}
                                                                                    onChange={(e) => setNewEmployeePassword(e.target.value)}
                                                                                    placeholder={t("Enter new employee password")}
                                                                                    disabled={isSendingCode || isVerifyingCode || isEmailModalOpen}
                                                                                    aria-label="New Employee Password"
                                                                                />
                                                                                <button
                                                                                    className="btn btn-link border d-flex align-items-center justify-content-center"
                                                                                    type="button"
                                                                                    onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                                                                                    disabled={isSendingCode || isVerifyingCode || isEmailModalOpen}
                                                                                    aria-label={showEmployeePassword ? t("Hide password") : t("Show password")}
                                                                                    style={{ width: '40px', textDecoration: 'none' }}
                                                                                >
                                                                                    <i className={showEmployeePassword ? "bi bi-eye-fill" : "bi bi-eye-slash-fill"}></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Step 1: Send Code Button */}
                                                                        <button
                                                                            className="btn btn-secondary mb-2"
                                                                            onClick={handleSavePasswordSettings}
                                                                            disabled={isSendingCode || isVerifyingCode || isEmailModalOpen}
                                                                        >
                                                                            {isSendingCode ? 'Sending Code...' : (passwordsExist ? 'Send Code to Reset' : 'Send Code to Set Passwords')}
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                        </div>
                                                            </div>

                                                            {/* QR Code Generator & Online Payment Options Combined Card */}
                                                            <div className="px-2 mb-4 flex-1 min-w-[320px]">
                                                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 h-full">
                                                        <div style={{ fontWeight: 'bold' }} className="mb-4">
                                                            QR code generator:
                                                        </div>

                                                        <div className="printContainer hidden print:block">
                                                            {docIds.map((item, index) => (
                                                                <div key={index} className="qrCodeItem">
                                                                    <QRCode value={generateQRLink(item)} size={128} />
                                                                    <div><span className='notranslate'>{item.split('-')[1]}</span></div>
                                                                </div>
                                                            ))}
                                                            {/* {docIds.map((item, index) => (
                                <div key={index} className="qrCodeItem">
                                  <QRCode value={generateQRLinkSelfCheckout(item)} size={128} />
                                  <div>SelfPay <span className='notranslate'>{item.split('-')[1]}</span></div>
                                </div>
                              ))} */}

                                                        </div>
                                                        <div className="flex justify-start mb-6">
                                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                                onClick={() => handlePrint()}
                                                            >
                                                                <i class="bi bi-printer-fill me-2"></i>
                                                                Create A4 Sized QR Code Prints</button>

                                                        </div>
                                                        
                                                        {/* Online Payment Options Section */}
                                                        <div className=' mb-6' >

                                                            {data?.stripe_store_acct === "" ?
                                                                <div>
                                                                    <div className='mb-1'>Online Payment Options:</div>

                                                                    <div>
                                                                        <StripeConnectButton store={data.id} user={user.uid}></StripeConnectButton>

                                                                    </div></div>

                                                                :
                                                                <div>
                                                                    <div className='mb-1' style={{ fontWeight: 'bold' }}>Online Payment Options:</div>
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

                                                                    <div className="bg-white rounded-md">
                                                                        <div class="mt-4">
                                                                            <label class="flex items-center space-x-2 text-blue-500 font-bold">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    onClick={toggleAdvertisingProgram}
                                                                                    class="form-checkbox h-5 w-5 text-blue-500"
                                                                                    checked={data?.isJointAdvertised}
                                                                                    readOnly
                                                                                />
                                                                                <span>Join Our Advertising Program</span>
                                                                            </label>
                                                                            {showModal && (
                                                                                <div class="mt-4 p-4 border border-gray-300 rounded-lg">
                                                                                    <h2 class="text-xl font-semibold mb-2">Enter Promotion Code</h2>
                                                                                    <input
                                                                                        type="password"
                                                                                        placeholder="Password"
                                                                                        class="border-2 border-gray-300 p-2 w-full rounded mb-4"
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => handlePasswordSubmit(document.querySelector('input[type="password"]').value)}
                                                                                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                                                    >
                                                                                        Submit
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                            <p class="text-sm text-gray-600 mt-2">
                                                                                We will offer premier promotional resources for up to ten products in your store, ensuring a minimum of 100 orders. Please note that we will take a 30% commission on those 10 items. To boost order volumes and enhance advertising effectiveness, we also provide shipping subsidies for participating customers. Join our advertising program and let's boost your store's foot traffic and achieve great results together!
                                                                            </p>
                                                                        </div>



                                                                        {/* <label className="flex items-center space-x-2 text-blue-500 font-bold mt-2">
                                      <input
                                        type="checkbox"
                                        onChange={handleCheckboxChange}
                                        className="form-checkbox h-5 w-5 text-blue-500"
                                        checked={data?.dailyPayout}
                                      />
                                      <span>Enable Daily Payout</span>
                                    </label>
                                    <p className="text-gray-600 mt-2">
                                      Enable daily payout to receive automatic transfers to your bank account every morning at 4:00 AM ~ 5:00 AM .
                                      By selecting this option, your earnings will be deposited consistently each day, ensuring prompt access to your funds.
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2">
                                      <strong>Note:</strong> Enabling this option will incur an additional charge of 1.5% and a flat fee of $1 per payout.
                                    </p> */}
                                                                        {isOpen ?
                                                                            <button
                                                                                className="px-4 py-2 bg-red-500 mt-2 text-white rounded-lg"
                                                                                onClick={toggleModal}
                                                                            >
                                                                                Collapse Standard Payout Schedule
                                                                            </button> :
                                                                            <button
                                                                                className="px-4 py-2 bg-blue-500 mt-2 text-white rounded-lg"
                                                                                onClick={toggleModal}
                                                                            >
                                                                                View Standard Payout Schedule
                                                                            </button>
                                                                        }
                                                                        <p className="text-gray-500 text-sm mt-2 mb-2 ">
                                                                            <strong>Note:</strong> Opting for the standard payout schedule means your earnings will be deposited according to our regular payout cycle without any additional fees.
                                                                        </p>

                                                                        <div className="text-center">


                                                                            {/* Modal */}
                                                                            {isOpen && (
                                                                                <div className='' >
                                                                                    <table className="w-full border-collapse">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th className="border-b-2 p-3 text-center text-gray-700 bg-green-500 text-white">Day of Transaction</th>
                                                                                                <th className="border-b-2 p-3 text-center text-gray-700 bg-green-500 text-white">Time Range</th>
                                                                                                <th className="border-b-2 p-3 text-center text-gray-700 bg-green-500 text-white">Deposit Date</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Monday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span> </td>
                                                                                                <td className="p-3 border-b text-gray-800">Thursday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Monday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Friday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Tuesday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span> </td>
                                                                                                <td className="p-3 border-b text-gray-800">Friday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Tuesday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Monday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span></td>
                                                                                                <td className="p-3 border-b text-gray-800">Monday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Tuesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Thursday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span></td>
                                                                                                <td className="p-3 border-b text-gray-800">Tuesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Thursday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Friday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span></td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Friday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Saturday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span></td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Saturday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Sunday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800">12:00 AM to <span className='notranslate'>{cutoffTime}</span></td>
                                                                                                <td className="p-3 border-b text-gray-800">Wednesday Early Morning</td>
                                                                                            </tr>
                                                                                            <tr className="odd:bg-white even:bg-gray-50">
                                                                                                <td className="p-3 border-b text-gray-800">Sunday</td>
                                                                                                <td className="notranslate p-3 border-b text-gray-800"><span className='notranslate'>{cutoffTime}</span> to 11:59 PM</td>
                                                                                                <td className="p-3 border-b text-gray-800">Thursday Early Morning</td>
                                                                                            </tr>
                                                                                            {/* Add other rows as needed */}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>


                                                                    <TerminalRegister City={data?.Address} Address={data?.physical_address} State={data?.State} storeDisplayName={data?.Name} ZipCode={data?.ZipCode} storeID={data?.id} connected_stripe_account_id={data?.stripe_store_acct} />
                                                                </div>

                                                            }
                                                        </div>
                                                        </div>
                                                            </div>
                                                        </div>

                                                        {/* Operating Hours Card */}
                                                        <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
                                                        <div style={{ fontWeight: 'bold' }}>Operating Hours:</div>
                                                        <ChangeTimeForm storeID={storeID} storeOpenTime={storeOpenTime} />
                                                        </div>

                                                    </div> : <div></div>
                                                    }

                                                    {showSection === 'sales' ? <div>
                                                        <div className="flex mt-3">
                                                            <div className={`w-50 ${isMobile ? 'mobile-class' : 'desktop-class'}`}>
                                                                <div>
                                                                    <div style={{ fontWeight: 'bold' }}>Select Date Range</div>
                                                                    <div className={`${isMobile ? '' : 'flex'} flex-wrap`} >
                                                                        <div > {/* START DATE GROUP */}
                                                                            <div>Start Date:</div>
                                                                            <div className={!isMobile ? "flex flex-wrap" : "flex-wrap"}> {/* MODIFIED: Added flex-wrap */}
                                                                                <button className=" btn btn-sm mt-1 mb-1 mr-2 notranslate " style={{
                                                                                    border: '1px solid #ccc',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    // Add other styles as needed
                                                                                }} onClick={() => {
                                                                                    setStartDate(parseDate(format12Oclock((new Date(startDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone)

                                                                                    );
                                                                                    if (endDate === null) {
                                                                                        setEndDate(null);
                                                                                    } else {
                                                                                        setEndDate(parseDate((format12Oclock((new Date(endDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone }))), AmericanTimeZone)

                                                                                        );
                                                                                    }
                                                                                    setIsPickerOpenMonth(false);
                                                                                    setIsPickerOpenEndDay(false);
                                                                                    setIsPickerOpenStartDay(!isPickerOpenStartDay);

                                                                                }}>
                                                                                    <i class="bi-calendar-range"></i>
                                                                                    &nbsp;
                                                                                    {startDate ? format(startDate, "MM/dd/yyyy") : "mm-dd-yyyy"}

                                                                                </button>

                                                                                <select
                                                                                    className=" btn btn-sm mt-1 mb-1 mr-2 notranslate "
                                                                                    style={{
                                                                                        border: '1px solid #ccc',
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        // Add other styles as needed
                                                                                    }}
                                                                                    id="time-select" value={selectedTime.replace("-", ":")} onChange={handleChange}>

                                                                                    {timeOptions.map((time, index) => (
                                                                                        <option key={index} value={time}>
                                                                                            {time}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <div>End Date:</div>
                                                                            {(endDate === null) ?
                                                                                 <button className=" btn btn-sm mt-1 mb-1 mr-2 notranslate " style={{
                                                                                        border: '1px solid #ccc',
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        // Add other styles as needed
                                                                                 }} onClick={() => {
                                                                                     const tomorrow = new Date(startDate);
                                                                                     tomorrow.setDate(startDate.getDate() + 1);
                                                                                     setEndDate(parseDate(format12Oclock(tomorrow.toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone));
                                                                                     setIsPickerOpenEndDay(!isPickerOpenEndDay);
                                                                                    }}>
                                                                                    <i className="bi bi-calendar-plus"></i>
                                                                                    &nbsp;
                                                                                    Add End Date
                                                                                </button>
                                                                                : <div className={!isMobile ? "flex flex-wrap" : "flex-wrap"}> {/* MODIFIED: Added flex-wrap */}
                                                                                    <div className={`${isMobile ? '' : 'flex'}`} >
                                                                                        <button className="btn btn-sm mt-1 mb-1 mr-2 notranslate" style={{
                                                                                            border: '1px solid #ccc',
                                                                                            display: 'inline-flex',
                                                                                            alignItems: 'center',
                                                                                            // Add other styles as needed
                                                                                        }} onClick={() => {
                                                                                            setStartDate(parseDate(format12Oclock((new Date(startDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone));
                                                                                            if (endDate === null) {
                                                                                                setEndDate(parseDate((format12Oclock((new Date(startDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone }))), AmericanTimeZone));
                                                                                            } else {
                                                                                                setEndDate(parseDate((format12Oclock((new Date(endDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone }))), AmericanTimeZone));
                                                                                            }
                                                                                            setIsPickerOpenMonth(false);
                                                                                            setIsPickerOpenStartDay(false);
                                                                                            setIsPickerOpenEndDay(!isPickerOpenEndDay);

                                                                                        }}>
                                                                                            <i class="bi-calendar-range"></i>
                                                                                            &nbsp;
                                                                                            {endDate ? format(endDate, "MM/dd/yyyy") : "mm-dd-yyyy"}

                                                                                        </button>
                                                                                        <div className='flex'>
                                                                                            <select
                                                                                                className="btn btn-sm mt-1 mb-1 mr-2 notranslate"
                                                                                                style={{
                                                                                                    border: '1px solid #ccc',
                                                                                                    display: 'inline-flex',
                                                                                                    alignItems: 'center',
                                                                                                    // Additional styles can be added as needed
                                                                                                }}
                                                                                                id="time-dropdown"
                                                                                                value={currentTime.replace("-", ":")}
                                                                                                onChange={handleTimeChange}
                                                                                            >
                                                                                                {timeIntervalOptions.map((timeOption, index) => (
                                                                                                    <option key={index} value={timeOption}>
                                                                                                        {timeOption}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                            <button onClick={() => setEndDate(null)} className="btn btn-sm btn-danger mt-1 mb-1 notranslate" style={{
                                                                                                border: '1px solid #ccc',
                                                                                                display: 'inline-flex',
                                                                                                alignItems: 'center',
                                                                                                // Add other styles as needed
                                                                                            }}>
                                                                                                <i className="bi bi-trash"></i>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            }

                                                                        </div>

                                                                    </div>
                                                                    <div style={{ fontWeight: 'bold' }}>Select Specific Month</div>
                                                                    <button className=" btn btn-sm mt-1 mb-1 mr-2 notranslate " style={{
                                                                        border: '1px solid #ccc',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        // Add other styles as needed
                                                                    }} onClick={() => {
                                                                        getMonthDates(((format12Oclock((new Date(startDate)).toLocaleString("en-US", { timeZone: AmericanTimeZone })))))
                                                                        setIsPickerOpenStartDay(false)
                                                                        setIsPickerOpenEndDay(false)
                                                                        setIsPickerOpenMonth(!isPickerOpenMonth);
                                                                    }}>
                                                                        <i class="bi-calendar3"></i>
                                                                        &nbsp;
                                                                        {startDate ? format(startDate, "MM/yyyy") : "Month Year"}

                                                                    </button>

                                                                    <div ref={wrapperRef} style={{ position: 'relative' }}>

                                                                        {isPickerOpenStartDay && (
                                                                            <div class="notranslate" style={{
                                                                                position: 'absolute',
                                                                                zIndex: 1000,
                                                                                top: '100%', // Position right below the button
                                                                                left: 0

                                                                            }}>
                                                                                {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                                    <DatePicker
                                                                                        selected={startDate}
                                                                                        onChange={handleChangeStartDay}
                                                                                        inline
                                                                                        locale="zh-CN"
                                                                                    /> :

                                                                                    <DatePicker
                                                                                        selected={startDate}
                                                                                        onChange={handleChangeStartDay}
                                                                                        inline
                                                                                    />}

                                                                            </div>
                                                                        )}
                                                                        {isPickerOpenEndDay && (
                                                                            <div
                                                                                class="notranslate" style={{
                                                                                    position: 'absolute',
                                                                                    zIndex: 1000,
                                                                                    top: '100%', // Position right below the button
                                                                                    left: 0
                                                                                }}>
                                                                                {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                                    <DatePicker
                                                                                        selected={endDate}
                                                                                        onChange={handleChangeEndDay}
                                                                                        inline
                                                                                        locale="zh-CN"
                                                                                    /> :

                                                                                    <DatePicker
                                                                                        selected={endDate}
                                                                                        onChange={handleChangeEndDay}
                                                                                        inline
                                                                                    />}

                                                                            </div>
                                                                        )}
                                                                        {isPickerOpenMonth && (
                                                                            <div class="notranslate" style={{
                                                                                position: 'absolute',
                                                                                zIndex: 1000,
                                                                                top: '100%', // Position right below the button
                                                                                left: 0
                                                                            }}>

                                                                                {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                                    <DatePicker
                                                                                        onChange={handleMonthChange}
                                                                                        showMonthYearPicker
                                                                                        inline
                                                                                        locale="zh-CN"
                                                                                    /> :

                                                                                    <DatePicker
                                                                                        onChange={handleMonthChange}
                                                                                        showMonthYearPicker
                                                                                        inline
                                                                                    />}

                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`mt-3 ${!isMobile ? 'flex flex-wrap items-start' : ''}`}> {/* MODIFIED: Added responsive flex layout for PC */}
                                                                    {!isMobile && <button
                                                                        onClick={() => { setStartDate(epochDate); setEndDate(parseDate((format12Oclock((new Date(Date.now())).toLocaleString("en-US", { timeZone: AmericanTimeZone }))), AmericanTimeZone)) }}
                                                                            className="btn btn-sm btn-secondary d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >
                                                                        <i className="bi bi-calendar pe-2"></i>
                                                                        <span>List All Orders</span>
                                                                    </button>}
                                                                        {!isMobile && <button
                                                                        onClick={() => { OpenCashDraw() }}
                                                                        className="btn btn-sm btn-info d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >
                                                                        <i className="bi bi-cash-stack pe-2"></i>
                                                                        <span>Cash Drawer</span>
                                                                        </button>}
                                                                    {/* 物品销量分析按钮 */}
                                                                    <button
                                                                            onClick={() => setItemAnalyticsModalOpen(true)}
                                                                            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white mx-1 mt-1 mb-2 whitespace-nowrap"
                                                                        >
                                                                            <i className="bi bi-graph-up mr-2"></i>
                                                                                {fanyi("Sales Analytics")}
                                                                    </button>
                                                                     </div> {/* END OF ADDED WRAPPER */}

                                                                {/* 物品销量分析模态框 */}
                                                                {isItemAnalyticsModalOpen && (
                                                                    <div
                                                                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
                                                                        onClick={() => setItemAnalyticsModalOpen(false)}
                                                                    >
                                                                        <div
                                                                            className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] overflow-hidden relative"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            {/* 悬浮右上角关闭按钮 */}
                                                                            <button
                                                                                onClick={() => setItemAnalyticsModalOpen(false)}
                                                                                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors text-3xl font-bold"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                                                                                <h2 className="text-2xl font-bold text-gray-800">{fanyi("Sales Analytics")}</h2>
                                                                                <button
                                                                                    onClick={() => setItemAnalyticsModalOpen(false)}
                                                                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                                                >
                                                                                    <i className="bi bi-x-lg text-2xl"></i>
                                                                                </button>
                                                                            </div>
                                                                            <div className="h-[calc(95vh-80px)] overflow-auto">
                                                                                <ItemSalesAnalytics
                                                                                    orders={orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table))}
                                                                                    dateRange={{ startDate, endDate }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}



                                                                    {/* {JSON.stringify(startDate)}
                                  {JSON.stringify(endDate)} */}

                                                                    {/* <button
                                    onClick={() => setShowChart(!showChart)}
                                    className="btn btn-sm btn-info d-flex align-items-center mx-1 mb-2"
                                  >
                                    <i className={`bi ${!showChart ? 'bi-bar-chart' : 'bi-eye-slash'} pe-2`}></i>
                                    <span>{!showChart ? 'Show Chart' : 'Hide Chart'}</span>
                                  </button> */}
                                                                </div>
                                                            </div>

                                                            <div style={isMobile ? { "width": "50%" } : {}}>
                                                                {/* <div className="flex flex-col justify-center items-center h-screen space-y-4">
                                  <select
                                    className="p-2 border rounded w-64"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                  >
                                    <option value="login">Login</option>
                                    <option value="reset_password">Reset Password</option>
                                    <option value="confirm_payment">Confirm Payment</option>
                                  </select>

                                  <button
                                    onClick={() => setIsPopupOpen(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                  >
                                    Open Verification
                                  </button>

                                  {isVerified && (
                                    <p className="text-green-600 text-lg font-semibold">
                                      ✅ Phone number verified successfully!
                                    </p>
                                  )}

                                  <PhoneVerificationPopup
                                    isOpen={isPopupOpen}
                                    onClose={() => setIsPopupOpen(false)}
                                    onVerificationSuccess={handleVerificationSuccess}
                                    users={users}
                                    purpose={purpose}
                                  />
                                </div> */}
                                                                {(isMobile || isChartPasswordVerified) && (
                                                                    <PieChart className='notranslate' width={isMobile ? width2 / 2 : 300} height={250}>
                                                                        <Pie
                                                                            cx={80} // Move the pie to the left by adjusting the cx value
                                                                            data={[
                                                                                {
                                                                                    name: fanyi('Subtotal'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                        (accumulator, receipt) => {
                                                                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                            accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                            accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                            //accumulator.total += parseFloat(receipt.total);
                                                                                            return accumulator;
                                                                                        },
                                                                                        { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                    ).subtotal * 100) / 100
                                                                                },
                                                                                {
                                                                                    name: fanyi('Tax'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                        (accumulator, receipt) => {
                                                                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                            accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                            accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                            //accumulator.total += parseFloat(receipt.total);
                                                                                            return accumulator;
                                                                                        },
                                                                                        { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                    ).tax * 100) / 100
                                                                                }, {
                                                                                    name: order_status === "POS Machine" ? fanyi('Cash Gratuity') : fanyi("Cash Gratuity"), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                        (accumulator, receipt) => {
                                                                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                            accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                            accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                            //accumulator.total += parseFloat(receipt.total);
                                                                                            return accumulator;
                                                                                        },
                                                                                        { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                    ).tips * 100) / 100
                                                                                },
                                                                                {
                                                                                    name: fanyi('Service Fee'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                        (accumulator, receipt) => {
                                                                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                            accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                            accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                            //accumulator.total += parseFloat(receipt.total);
                                                                                            return accumulator;
                                                                                        },
                                                                                        { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                    ).service_fee * 100) / 100
                                                                                },
                                                                                {
                                                                                    name: fanyi('Discount'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                        (accumulator, receipt) => {
                                                                                            accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                            accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                            accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                            accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                            accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                            //accumulator.total += parseFloat(receipt.total);
                                                                                            return accumulator;
                                                                                        },
                                                                                        { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                    ).discount * 100) / 100
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
                                                                                        name: order_status === "POS Machine" ? fanyi('Cash Gratuity') : fanyi("Cash Gratuity"), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                            (accumulator, receipt) => {
                                                                                                accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                                accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                                accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                                accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                                accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                                //accumulator.total += parseFloat(receipt.total);
                                                                                                return accumulator;
                                                                                            },
                                                                                            { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                        ).tips * 100) / 100
                                                                                    },
                                                                                    {
                                                                                        name: fanyi('Service Fee'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                            (accumulator, receipt) => {
                                                                                                accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                                accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                                accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                                accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                                accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                                //accumulator.total += parseFloat(receipt.total);
                                                                                                return accumulator;
                                                                                            },
                                                                                            { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                        ).service_fee * 100) / 100
                                                                                    },
                                                                                    {
                                                                                        name: fanyi('Tax'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                            (accumulator, receipt) => {
                                                                                                accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                                accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                                accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                                accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                                accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                                //accumulator.total += parseFloat(receipt.total);
                                                                                                return accumulator;
                                                                                            },
                                                                                            { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                        ).tax * 100) / 100
                                                                                    },
                                                                                    {
                                                                                        name: fanyi('Subtotal'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                            (accumulator, receipt) => {
                                                                                                accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                                accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                                accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                                accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                                accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                                //accumulator.total += parseFloat(receipt.total);
                                                                                                return accumulator;
                                                                                            },
                                                                                            { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                        ).subtotal * 100) / 100
                                                                                    },
                                                                                    {
                                                                                        name: fanyi('Discount'), value: Math.round(orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).reduce(
                                                                                            (accumulator, receipt) => {
                                                                                                accumulator.tips += parseFloat(receipt.metadata.tips);
                                                                                                accumulator.service_fee += parseFloat(receipt.metadata.service_fee);
                                                                                                accumulator.discount += parseFloat(receipt.metadata.discount);
                                                                                                accumulator.tax += parseFloat(receipt.metadata.tax);
                                                                                                accumulator.subtotal += parseFloat(receipt.metadata.subtotal);
                                                                                                //accumulator.total += parseFloat(receipt.total);
                                                                                                return accumulator;
                                                                                            },
                                                                                            { tips: 0, service_fee: 0, tax: 0, subtotal: 0, total: 0, discount: 0 }
                                                                                        ).discount * 100) / 100
                                                                                    }
                                                                                ].map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                                                                            }
                                                                        </Pie>
                                                                        <Tooltip />
                                                                        {isMobile ? (
                                                                            <Legend verticalAlign="top" content={renderLegend} />
                                                                        ) : (
                                                                            <Legend layout="vertical" align="right" verticalAlign="top" content={renderLegend} />
                                                                        )}
                                                                    </PieChart>
                                                                )}

                                                                {!isMobile && !isChartPasswordVerified && (
                                                                    <div className="flex justify-center items-center p-4">
                                                                        <button
                                                                            onClick={() => setIsChartPasswordModalOpen(true)}
                                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                                                                        >
                                                                            View Data Chart
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                <ChartPasswordModal
                                                                    isOpen={isChartPasswordModalOpen}
                                                                    onClose={() => setIsChartPasswordModalOpen(false)}
                                                                    onVerify={() => setIsChartPasswordVerified(true)}
                                                                />


                                                            </div>


                                                        </div>
                                                        <div>

                                                            <select
                                                                onChange={(e) => getSeason(format12Oclock(new Date(Date.now()).toLocaleString("en-US", { timeZone: AmericanTimeZone })), e.target.value)}
                                                                className="btn btn-sm border-black d-flex align-items-center mx-1 mb-2"
                                                            >

                                                                <option value="Q1">Show First Quarter of This Year</option>
                                                                <option value="Q2">Show Second Quarter of This Year</option>
                                                                <option value="Q3">Show Third Quarter of This Year</option>
                                                                <option value="Q4">Show Fourth Quarter of This Year</option>
                                                                <option value="lastQ1">Show First Quarter of Last Year</option>
                                                                <option value="lastQ2">Show Second Quarter of Last Year</option>
                                                                <option value="lastQ3">Show Third Quarter of Last Year</option>
                                                                <option value="lastQ4">Show Fourth Quarter of Last Year</option>
                                                            </select>
                                                            <div className={`${true ? 'flex flex-wrap items-start' : ''}`}>

                                                                <div className='flex'>
                                                                    <button
                                                                        onClick={() => { setStartDate(parseDate(format12Oclock((new Date(Date.now())).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone)); setEndDate(null) }}
                                                                        className="btn btn-sm btn-primary d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >

                                                                        <span>Today's Orders</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setStartDate(parseDate(format12Oclock((new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleString("en-US", { timeZone: AmericanTimeZone })), AmericanTimeZone)); setEndDate(null) }}
                                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >
                                                                        <span>Yesterday Orders</span>
                                                                    </button>
                                                                </div>

                                                                <div className='flex'>
                                                                    <button
                                                                        onClick={() => { getMonthDates(((format12Oclock((new Date(Date.now())).toLocaleString("en-US", { timeZone: AmericanTimeZone }))))) }}
                                                                        className="btn btn-sm btn-dark d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                                    ["一月订单", "二月订单", "三月订单", "四月订单", "五月订单", "六月订单", "七月订单", "八月订单", "九月订单", "十月订单", "十一月订单", "十二月订单"][new Date(new Date().toLocaleString("en-US", { timeZone: AmericanTimeZone })).getMonth()] :
                                                                                    ["January Orders", "February Orders", "March Orders", "April Orders", "May Orders", "June Orders", "July Orders", "August Orders", "September Orders", "October Orders", "November Orders", "December Orders"][new Date(new Date().toLocaleString("en-US", { timeZone: AmericanTimeZone })).getMonth()])
                                                                            }
                                                                        </span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => { getMonthDates(((format12Oclock((new Date(new Date().setMonth(new Date().getMonth() - 1))).toLocaleString("en-US", { timeZone: AmericanTimeZone }))))) }}
                                                                        className="btn btn-sm btn-outline-dark d-flex align-items-center mx-1 mt-1 mb-2"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                (localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                                                                                    ["十二月订单", "一月订单", "二月订单", "三月订单", "四月订单", "五月订单", "六月订单", "七月订单", "八月订单", "九月订单", "十月订单", "十一月订单"][new Date(new Date().toLocaleString("en-US", { timeZone: AmericanTimeZone })).getMonth()] :
                                                                                    ["December Orders", "January Orders", "February Orders", "March Orders", "April Orders", "May Orders", "June Orders", "July Orders", "August Orders", "September Orders", "October Orders", "November Orders"][new Date(new Date().toLocaleString("en-US", { timeZone: AmericanTimeZone })).getMonth()])
                                                                            }</span>
                                                                    </button>

                                                                </div>
                                                            </div>


                                                        </div>

                                                        {showChart && isMobile ?
                                                            <div>
                                                                <button onClick={() => setShowChart(false)} className="btn btn-sm mt-1 mb-1 notranslate" style={{
                                                                    float: "right",
                                                                    border: '1px solid #ccc',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    // Add other styles as needed
                                                                }}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /></svg>                                </button>
                                                                <LineChart className="chart" width={width2 - 75} height={250} data={sortedData}>
                                                                    <CartesianGrid strokeDasharray="3 3" />
                                                                    <XAxis dataKey="date" />
                                                                    <YAxis />
                                                                    <Tooltip />
                                                                    <Legend />
                                                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                                                                </LineChart>

                                                            </div> : null
                                                        }

                                                        <hr class="opacity-50 border-t-2 border-black-1000" />
                                                        {isMobile ? <div >
                                                            <select value={order_table} onChange={(e) => setOrder_table(e.target.value)}>
                                                                <option value="">Select Specific Dining Table Type</option>
                                                                {Array.from(new Set(orders?.map(order => order?.tableNum))).map((option, index) => (
                                                                    <option className='notranslate' key={index} value={option}>{option}</option>
                                                                ))}
                                                                {/* The options will be dynamically created here */}
                                                            </select>
                                                            &nbsp;
                                                            <select value={order_status} onChange={(e) => setOrder_status(e.target.value)}>
                                                                <option value="">Select Specific Payment Type</option>
                                                                {Array.from(new Set(orders?.map(order => order?.status))).map((option, index) => (
                                                                    <option class="notranslate" key={index} value={option}>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(option) : option}</option>
                                                                ))}
                                                                {/* The options will be dynamically created here */}
                                                            </select>
                                                            <div><b>Hint: Click on an order to see more details.</b></div>

                                                        </div> : null
                                                        }

                                                        <LazyLoad height={762}>

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
                                                                        {isMobile ? null : <th className="notranslate" >Number.</th>}
                                                                        {(isLocalHost)
                                                                            ?
                                                                            <th className="order-number" >Order ID</th>
                                                                            :
                                                                            <></>
                                                                        }
                                                                        <th className="order-name" >
                                                                            {!isMobile ?
                                                                                <select value={order_table} onChange={(e) => setOrder_table(e.target.value)}>
                                                                                    <option value="">Select Specific Dining Table Type</option>
                                                                                    {Array.from(new Set(orders?.map(order => order?.tableNum))).map((option, index) => (
                                                                                        <option className='notranslate' key={index} value={option}>{option}</option>
                                                                                    ))}
                                                                                    {/* The options will be dynamically created here */}
                                                                                </select> : "ID"
                                                                            }

                                                                        </th>
                                                                        <th className="order-status" >
                                                                            {!isMobile ?
                                                                                <select value={order_status} onChange={(e) => setOrder_status(e.target.value)}>
                                                                                    <option value="">Select Specific Payment Type</option>
                                                                                    {Array.from(new Set(orders?.map(order => order?.status))).map((option, index) => (
                                                                                        <option key={index} value={option}>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(option) : option}</option>
                                                                                    ))}
                                                                                    {/* The options will be dynamically created here */}
                                                                                </select>
                                                                                : "Type"
                                                                            }
                                                                        </th>
                                                                        <th className="order-total" >Price</th>
                                                                        <th className="order-date" >Date</th>
                                                                    </tr>
                                                                </thead>
                                                                {/* {!loading && (
                                  <button className="btn btn-primary btn-block" onClick={handleLoadMore}>
                                    Next
                                  </button>
                                )} */}

                                                                <tbody
                                                                >

                                                                    {items?.map((order, index) => {
                                                                        if (order.status === "Canceled") {
                                                                        } else {
                                                                            displayIndex++;

                                                                        }

                                                                        return (
                                                                            <>
                                                                                <div className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                                                                    {
                                                                                        (() => {
                                                                                            function compareDates(date1, date2) {
                                                                                                // Check for null or invalid dates
                                                                                                if (!date1 || !date2) return "Invalid dates to compare";

                                                                                                // Parse the dates
                                                                                                const parsedDate1 = new Date(`20${date1.split('/')[2]}`, date1.split('/')[0] - 1, date1.split('/')[1]);
                                                                                                const parsedDate2 = new Date(`20${date2.split('/')[2]}`, date2.split('/')[0] - 1, date2.split('/')[1]);

                                                                                                // Compare the dates
                                                                                                if (parsedDate1 > parsedDate2) {
                                                                                                    return ` 📅 ${date2}`;
                                                                                                } else if (parsedDate1 < parsedDate2) {
                                                                                                    return ``;
                                                                                                } else {
                                                                                                    return ``;
                                                                                                }
                                                                                            }

                                                                                            // Ensure index > 0 before calling compareDates
                                                                                            return index > 0
                                                                                                ? compareDates(items[index - 1].date.split(' ')[0], items[index].date.split(' ')[0])
                                                                                                : `📅 ${items[index].date.split(' ')[0]}`;
                                                                                        })()
                                                                                    }
                                                                                </div>
                                                                                < div onClick={() => {
                                                                                    if (isMobile) {
                                                                                        toggleExpandedOrderId(order.id)
                                                                                    }
                                                                                }
                                                                                }

                                                                                    style={{ display: 'contents' }}>
                                                                                    <tr className="order" style={{ borderBottom: "1px solid #ddd" }}>
                                                                                        {isMobile ? null :
                                                                                            (
                                                                                                (order.status !== "Canceled") ?
                                                                                                    <td className='notranslate'># {orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).length - displayIndex}</td>
                                                                                                    : <span className='notranslate'><FontAwesomeIcon icon={faTriangleExclamation} style={{ color: 'red' }} /> </span>

                                                                                            )
                                                                                        }
                                                                                        {(isLocalHost)
                                                                                            ?
                                                                                            <td className="order-number notranslate" data-title="OrderID">
                                                                                                <a>
                                                                                                    {order.id.substring(0, 4)}
                                                                                                </a>
                                                                                            </td> :
                                                                                            <></>
                                                                                        }

                                                                                        <td className="order-name notranslate" data-title="Dining Table" style={{ whiteSpace: "nowrap" }}>
                                                                                            {isMobile ?
                                                                                                (
                                                                                                    (order.status !== "Canceled") ?
                                                                                                        <span className='notranslate'>#{orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table)).length - displayIndex} </span>
                                                                                                        :
                                                                                                        <span className='notranslate'><FontAwesomeIcon icon={faTriangleExclamation} style={{ color: 'red' }} /> </span>
                                                                                                )
                                                                                                :
                                                                                                null
                                                                                            }
                                                                                            {order.tableNum === "" ? "Takeout" : order.tableNum}</td>
                                                                                        <td className="order-status notranslate" data-title="Status" style={{ whiteSpace: "nowrap" }}>{localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(order.status) : order.status} </td>
                                                                                        <td className="order-total" data-title="Total" style={{ whiteSpace: "nowrap" }}><span className=" amount">
                                                                                            <span className='notranslate'>
                                                                                                {"$" + roundToTwoDecimalsTofix(order.total)}
                                                                                            </span>

                                                                                            <span style={{ color: 'red' }}>

                                                                                                {(() => {
                                                                                                    const subtotal = roundToTwoDecimalsTofix(order?.metadata?.subtotal);
                                                                                                    const serviceFee = roundToTwoDecimalsTofix(order?.metadata?.service_fee);
                                                                                                    const tips = roundToTwoDecimalsTofix(order?.metadata?.tips);

                                                                                                    // 检查 subtotal 是否有效
                                                                                                    if (isNaN(subtotal) || subtotal <= 0) {
                                                                                                        return null; // 不显示任何内容
                                                                                                    }

                                                                                                    // 根据 serviceFee 的值计算相应的百分比
                                                                                                    const percentage = serviceFee == 0
                                                                                                        ? (tips / subtotal) * 100
                                                                                                        : (serviceFee / subtotal) * 100;

                                                                                                    // 如果计算结果是 NaN，则返回 null 不显示任何内容
                                                                                                    return !isNaN(percentage)
                                                                                                        ? ` (${percentage.toFixed(2)}${!isMobile ? "% Gratuity)" : "%)"}`
                                                                                                        : null;
                                                                                                })()}
                                                                                            </span>

                                                                                            {/* <i class="fa-solid fa-circle-info"></i>
                                          {order?.transaction_json?.net !== undefined ?
                                            roundToTwoDecimalsTofix(order?.transaction_json?.net) : 0
                                          } */}
                                                                                        </span></td>
                                                                                        <td className="order-date" data-title="Date" style={{ whiteSpace: "nowrap" }}>
                                                                                            <time dateTime={order.date} title={order.date} nowrap>
                                                                                                <span className='notranslate'>

                                                                                                    {isMobile ?
                                                                                                        order.date.split(' ').slice(1).join(' ') :
                                                                                                        order.date
                                                                                                    }
                                                                                                </span>
                                                                                            </time>
                                                                                        </td>
                                                                                        {!isMobile && (
                                                                                            (order.status !== "Canceled") && (
                                                                                                <td className="order-details" style={{
                                                                                                    width: "400px",
                                                                                                    whiteSpace: "nowrap", textAlign: "right"
                                                                                                }}
                                                                                                    data-title="Details">
                                                                                                    {/* <button
                                                className="border-black p-2 m-2 bg-orange-500 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                                onClick={() => { bankReceipt(order?.Charge_ID, order?.id, order?.date) }}
                                              >
                                                Bank Receipt
                                              </button> */}
                                                                                                    {/* {order?.status === 'Paid by Cash' ? (
                                                                                      <button
                                                                                        className="border-black p-2 m-2 bg-green-500 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                                                                        onClick={() => { setSplitPaymentModalOpen(true); setModalStore(order.store); setModalID(order.id); setModalTips(order.metadata.tips); setModalSubtotal(order.metadata.subtotal); setModalTotal(order.metadata.total) }}
                                                                                      >
                                                                                        Add Gratuity
                                                                                      </button>
                                                                                    ) :
                                                                                      <button
                                                                                        className="border-black p-2 m-2 bg-orange-500 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                                                                        onClick={() => { bankReceipt(order?.Charge_ID, order?.id, order?.date) }}
                                                                                      >
                                                                                        Bank Receipt
                                                                                      </button>} */}
                                                                                                    <button
                                                                                                        className="border-black p-2 m-2 bg-green-500 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                                                                                        onClick={() => { setSplitPaymentModalOpen(true); setModalStore(order.store); setModalID(order.id); setModalTips(order.metadata.tips); setModalSubtotal(order.metadata.subtotal); setModalTotal(order.metadata.total) }}
                                                                                                    >
                                                                                                        {fanyi("Add Cash Tips")}
                                                                                                    </button>
                                                                                                    <button className="border-black p-2 m-2 bg-orange-500 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300" onClick={() => MerchantReceipt(order.store, order.receiptData, order.metadata.discount, order.tableNum, order.metadata.service_fee, order.total, order.metadata.tips)}>

                                                                                                        Print Receipt
                                                                                                    </button>
                                                                                                    {/* <button onClick={() => deleteDocument(order.id)}>
                                                  Delete Document
                                                </button> */}
                                                                                                    <button className="border-black p-2 m-2 bg-gray-500 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" onClick={() => toggleExpandedOrderId(order.id)}
                                                                                                    >
                                                                                                        {expandedOrderIds.includes(order.id) ? "Close Details" : "View Details"}
                                                                                                    </button>
                                                                                                </td>
                                                                                            )

                                                                                        )
                                                                                        }

                                                                                    </tr>


                                                                                    {
                                                                                        (expandedOrderIds.includes(order.id) || order?.status === "Canceled") && (
                                                                                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                                                                <td colSpan={8} style={{ padding: "10px" }}>
                                                                                                    <div className="receipt">
                                                                                                        {isMobile && order.status === "canceled" ?
                                                                                                            <div>
                                                                                                                <button
                                                                                                                    className="border-black p-2 m-2 bg-green-500 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                                                                                                                    onClick={() => { setSplitPaymentModalOpen(true); setModalStore(order.store); setModalID(order.id); setModalTips(order.metadata.tips); setModalSubtotal(order.metadata.subtotal); setModalTotal(order.metadata.total) }}
                                                                                                                >
                                                                                                                    {fanyi("Add Cash Tips")}
                                                                                                                </button>
                                                                                                                <button className="border-black p-2 m-2 bg-orange-500 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300" onClick={() => MerchantReceipt(order.store, order.receiptData, order.metadata.discount, order.tableNum, order.metadata.service_fee, order.total, order.metadata.tips)}>

                                                                                                                    Print Receipt
                                                                                                                </button>
                                                                                                                {/* <button onClick={() => deleteDocument(order.id)}>
                                                                                                                                  Delete Document
                                                                                                                                </button> */}
                                                                                                                <button className="border-black p-2 m-2 bg-gray-500 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" onClick={() => toggleExpandedOrderId(order.id)}
                                                                                                                >
                                                                                                                    {expandedOrderIds.includes(order.id) ? "Close Details" : "View Details"}
                                                                                                                </button>
                                                                                                            </div>
                                                                                                            : null
                                                                                                        }
                                                                                                        {order.status !== "Canceled" &&
                                                                                                            <span>
                                                                                                                Order ID: {order.id}</span>
                                                                                                        }
                                                                                                        {isMobile
                                                                                                            ? <p>Date: <span className='notranslate'>{order.date}</span></p>
                                                                                                            : null}


                                                                                                        <p><span className='notranslate'>{order.name}</span></p>
                                                                                                        {/* <p>{order.email}</p> */}
                                                                                                        {/* <p><span className='notranslate'>{order.date}</span></p> */}
                                                                                                        {JSON.parse(order.receiptData).map((item, index) => (
                                                                                                            <div className="receipt-item" key={item.id}>
                                                                                                                <p className='notranslate'>
                                                                                                                    {(/^#@%\d+#@%/.test(item?.name)) ?
                                                                                                                    localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")
                                                                                                                     ? t(item?.CHI) : (item?.name.replace(/^#@%\d+#@%/, ''))
                                                                                                                        : localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")
                                                                                                                        ? t(item?.CHI) : (item?.name)}
                                                                                                                        {Object.entries(item?.attributeSelected || {}).length > 0 ?
                                                                                                                        "(" + Object.entries(item?.attributeSelected).map(([key, value]) => {
                                                                                                                            // 如果是开台商品的特殊属性，显示友好的信息
                                                                                                                            if (key === '开台商品') {
                                                                                                                                const tableItems = value;
                                                                                                                                if (Array.isArray(tableItems) && tableItems.length > 0) {
                                                                                                                                    const itemValue = tableItems[0];
                                                                                                                                    // 检查值是否为包含时间戳的字符串
                                                                                                                                    if (typeof itemValue === 'string' && itemValue.startsWith('开台时间-')) {
                                                                                                                                        const parts = itemValue.split('-');
                                                                                                                                        const timestamp = parseInt(parts[parts.length - 1], 10);
                                                                                                                                        if (!isNaN(timestamp)) {
                                                                                                                                            const date = new Date(timestamp);
                                                                                                                                            const hours = date.getHours().toString().padStart(2, '0');
                                                                                                                                            const minutes = date.getMinutes().toString().padStart(2, '0');
                                                                                                                                            const formattedTime = `${hours}:${minutes}`;
                                                                                                                                            const lang = localStorage.getItem("Google-language");
                                                                                                                                            if (lang?.includes("Chinese") || lang?.includes("中")) {
                                                                                                                                                return `开台时间: ${formattedTime}`;
                                                                                                                                            } else {
                                                                                                                                                return `Start Time: ${formattedTime}`;
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    // 如果格式不符或已经是格式化后的，直接返回值
                                                                                                                                    return itemValue;
                                                                                                                                }
                                                                                                                            }
                                                                                                                            return Array.isArray(value) ? value.join(' ') : value
                                                                                                                        }).join(' ') + ")" : ''}
                                                                                                                    &nbsp;x&nbsp;{(/^#@%\d+#@%/.test(item?.name)) ? round2digt(Math.round(item.quantity) / (item?.name.match(/#@%(\d+)#@%/)?.[1])) : item.quantity}
                                                                                                                    &nbsp;@&nbsp; ${(/^#@%\d+#@%/.test(item?.name)) ? ((roundToTwoDecimalsTofix(item.itemTotalPrice)) / roundToTwoDecimalsTofix(Math.round(item.quantity) / (item?.name.match(/#@%(\d+)#@%/)?.[1]))) :
                                                                                                                        roundToTwoDecimalsTofix(roundToTwoDecimalsTofix(item.itemTotalPrice) / roundToTwoDecimalsTofix(Math.round(item.quantity)))}
                                                                                                                    &nbsp;each = ${roundToTwoDecimalsTofix(item.itemTotalPrice)}</p>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                        {order.status !== "Canceled" && (
                                                                                                            <>
                                                                                                                <p>Discount: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.discount)}</span></p>
                                                                                                                <p>Subtotal: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.subtotal)}</span></p>
                                                                                                                <p>Service fee: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.service_fee)}</span></p>
                                                                                                                <p>Tax: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.tax)}</span></p>
                                                                                                                <p>Gratuity: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.tips)}</span></p>
                                                                                                                <p>Total: $ <span className='notranslate'>{roundToTwoDecimalsTofix(order?.metadata?.total)}</span></p>
                                                                                                            </>
                                                                                                        )}


                                                                                                    </div>

                                                                                                </td>

                                                                                            </tr>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            </>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </LazyLoad>

                                                    </div>
                                                        : null
                                                    }

                                                    {/* 添加物品销量分析section */}
                                                    {showSection === 'itemAnalytics' ? <div>
                                                        <ItemSalesAnalytics
                                                            orders={orders?.filter(order => order?.status.includes(order_status)).filter(order => order?.tableNum.includes(order_table))}
                                                            dateRange={{ startDate, endDate }}
                                                        />
                                                    </div> : <div></div>
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


        </div >
    )
}


const renderLegend = (props) => {
    const { payload } = props;
    let revenue = 0;
    payload.forEach(entry => {
        revenue += entry.payload.value;
    });
    const translations = [
        { input: "Revenue", output: "总营收" },

    ];
    function translate(input) {
        const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
        return translation ? translation.output : "Translation not found";
    }

    function fanyi(input) {
        return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input
    }
    return (
        <ul>
            {revenue !== 0 ? (
                <div>
                    <li key="revenue" style={{ fontWeight: 'bold', fontSize: '13px' }}>
                        {fanyi("Revenue")}
                        <span class='notranslate'> (${((revenue - (payload[4].payload.value * 2)).toFixed(2))})</span>
                    </li>
                    {payload.map((entry, index) => (
                        <li key={`item-${index}`} style={{ color: entry.color, fontWeight: 'bold', fontSize: '13px' }} >
                            {entry.value} <span class='notranslate'>(${entry.payload.value.toFixed(2)})</span>
                        </li>
                    ))}

                </div>
            ) : (
                <li key="revenue">
                    No Business Data On Date Range
                </li>
            )}

        </ul>
    );
};

export default Account


