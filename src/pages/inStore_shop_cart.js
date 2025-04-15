import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { json, useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import './cartcheckout.css';
import './float.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard, faGift, faDollarSign, faShare, faPencilAlt, faTimes, faExchangeAlt, faArrowRight, faPrint } from '@fortawesome/free-solid-svg-icons';
import logo_transparent from './logo_transparent.png'
//import { flexbox } from '@mui/system';
import "./navbar.css";
import { useMyHook } from './myHook';
import teapotImage from './teapot.png';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';
import logo_fork from './logo_fork.png'
import Hero from './Hero'
import cuiyuan from './cuiyuan.png'
import { collection, doc, setDoc, addDoc, getDoc } from "firebase/firestore";
import { onSnapshot, query } from 'firebase/firestore';
import QRCode from 'qrcode.react';

import { db } from '../firebase/index';
import cartImage from './shopcart.png';
import "./inStore_shop_cart.css";
import PaymentRegular from "../pages/PaymentRegular";
import { round2digtNum } from "../utils";

import Dnd_Test from '../pages/dnd_test';
//import { isMobile } from 'react-device-detect';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { faExclamation } from '@fortawesome/free-solid-svg-icons'; // Import the exclamation mark icon

const Navbar = ({ OpenChangeAttributeModal, setOpenChangeAttributeModal, setIsAllowed, isAllowed, store, selectedTable, acct, openSplitPaymentModal, TaxRate, activeMemberId, getCurrentMemberKey, onClearCart, activeMemberOrder, onDeleteItem, onIncrementItem, onDecrementItem }) => {
  // 使用 getCurrentMemberKey 获取当前成员的存储键
  const currentMemberKey = getCurrentMemberKey ? getCurrentMemberKey() : `${store}-${selectedTable}`;
  
  // 不再需要products状态和setProducts
  const [shouldReloadCart, setShouldReloadCart] = useState(true);
  const { user, user_loading } = useUserContext();

  const [width_, setWidth_] = useState(window.innerWidth - 64);

  useEffect(() => {
    function handleResize() {
      setWidth_(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width_ <= 768;


  const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    // 重置shouldReloadCart为true，允许重新加载购物车数据
    setShouldReloadCart(true);
  }, [activeMemberId]); // 当activeMemberId变化时执行

  const translations = [
    { input: "Change Desk", output: "更换餐桌" },
    { input: "Allow Dish Revise", output: "打开菜品修改" },
    { input: "Disallow Dish Revise", output: "关闭菜品修改" },
    { input: "Add Service Fee", output: "添加服务费" },
    { input: "Add Discount", output: "添加折扣" },
    { input: "Send to kitchen", output: "送到厨房" },
    { input: "Print Order", output: "打印订单" },
    { input: "Print Receipt", output: "商户收据" },
    { input: "Split payment", output: "分单付款" },
    { input: "Mark as Unpaid", output: "未付款" },
    { input: "Card Pay", output: "信用卡支付" },
    { input: "Cash Pay", output: "现金支付" },
    { input: "Subtotal", output: "小计" },
    { input: "Tax", output: "税" },
    { input: "Total", output: "总额" },
    { input: "Discount", output: "折扣" },//Disc
    { input: "Disc.", output: "折扣" },//Disc
    { input: "Service Fee", output: "服务费" },//Tips
    { input: "Tips", output: "小费" },
    { input: "Gratuity", output: "小费" },
    { input: "Revise", output: "修订" },
    { input: "Cash Pay", output: "现金支付" },
    { input: "Enter the Cash Received", output: "输入收到的现金" },
    { input: "Calculate Give Back Cash", output: "计算返还现金" },
    { input: "Receivable Payment", output: "应收付款" },
    { input: "Give Back Cash", output: "返还现金" },
    { input: "Add return cash as a gratuity", output: "添加返还现金作为小费" },
    { input: "Total", output: "总计" },
    { input: "Custom Gratuity", output: "自定义小费" },
    { input: "Other", output: "其他" },
    { input: "Add", output: "添加" },
    { input: "and finalize", output: "并最终确定" },
    { input: "Finalize the Order. Total Gratuity", output: "完成订单。小费总额" },
    { input: "Collect", output: "现收" },
    { input: "including", output: "其中包含" },
    { input: "Gratuity", output: "小费" },

  ];
  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : "Translation not found";
  }
  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input
  }

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


  const [tips, setTips] = useState('');
  const [discount, setDiscount] = useState('');

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [totalQuant, setTotalQuant] = useState(0);
  const [extra, setExtra] = useState(0);

  const toggleAllowance = () => {
    console.log(isAllowed)
    setIsAllowed(!isAllowed);
  };
  const [tableProductInfo, setTableProductInfo] = useState('[]');
  const SetTableInfo = async (table_name, product) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  function stringTofixed(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
  }

  useEffect(() => {
    // Calculate the height of the shopping cart based on the number of products

    //maybe add a line here...
    const calculateTotalPrice = () => {
      // 使用activeMemberOrder.order而不是products
      const orderArray = activeMemberOrder && Array.isArray(activeMemberOrder.order) ? activeMemberOrder.order : [];
      const total = orderArray.reduce((acc, item) => item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0);
      
      console.log(total)
      setTotalPrice(total);
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))
      console.log("finalPrice")
      console.log((Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
      setFinalPrice(
        (Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
    }
    calculateTotalPrice();
    console.log("change price")
    console.log(tableProductInfo)
    //TO DO: get a better sync. this would write in database twice and this code is not working in mobile unless you get in the shopping cart.
    //GetTableProductInfo(store + "-" + selectedTable)
  }, [activeMemberOrder, width, tips, discount, extra]);


  const handleDeleteClick = (productId, count) => {
    // 使用从props传入的删除函数
    if (onDeleteItem) {
      onDeleteItem(productId, count);
    }
  };

  const handlePlusClick = (productId, targetCount) => {
    // 使用从props传入的增加数量函数
    if (onIncrementItem) {
      onIncrementItem(productId, targetCount);
    }
  };


  const handleMinusClick = (productId, targetCount) => {
    // 使用从props传入的减少数量函数
    if (onDecrementItem) {
      onDecrementItem(productId, targetCount);
    }
  };




  // for translations sake
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      //console.log(trans)
      //console.log(translationsMode)

      if (trans != null) {
        if (translationsMode != null) {
          if (trans[text] != null) {
            if (trans[text][translationsMode] != null) {
              return trans[text][translationsMode]
            }
          }
        }
      }

      return text
    }
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")])


  const MerchantReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const CustomerReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CustomerReceipt"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const listOrder = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "listOrder"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const SetTableIsSent = async (table_name, product) => {
    try {
      if (localStorage.getItem(table_name) === product) {
        return
      }
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "TableIsSent", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const SendToKitchen = async () => {
    try {
      // 检查当前成员是否有订单
      if (!activeMemberOrder || !activeMemberOrder.order || activeMemberOrder.order.length === 0) {
        console.log("//当前成员没有订单");
        return; // 没有订单，不需要发送
      }
      
      // 获取当前成员的isSent键
      const isSentKey = `${store}-${selectedTable}-member-${activeMemberId}-isSent`;
      
      // 获取之前已发送的订单数据
      const previouslySentOrders = localStorage.getItem(isSentKey) !== null ? 
        JSON.parse(localStorage.getItem(isSentKey)) : [];
      
      // 比较新旧订单并发送差异
      compareArrays(previouslySentOrders, activeMemberOrder.order);
      
      // 更新已发送数据
      localStorage.setItem(isSentKey, JSON.stringify(activeMemberOrder.order));
      SetTableIsSent(isSentKey, JSON.stringify(activeMemberOrder.order));
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const SendToKitchenMarkAsUnPaid = async () => {
    try {
      // 检查当前成员是否有订单
      if (!activeMemberOrder || !activeMemberOrder.order || activeMemberOrder.order.length === 0) {
        console.log("//当前成员没有订单");
        return; // 没有订单，不需要发送
      }
      
      // 获取当前成员的isSent键
      const isSentKey = `${store}-${selectedTable}-member-${activeMemberId}-isSent`;
      
      // 获取之前已发送的订单数据
      const previouslySentOrders = localStorage.getItem(isSentKey) !== null ? 
        JSON.parse(localStorage.getItem(isSentKey)) : [];
      
      // 比较新旧订单并发送差异
      compareArrays(previouslySentOrders, activeMemberOrder.order);
      
      // 标记为未支付后清空已发送数据
      SetTableIsSent(isSentKey, "[]");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  const [arrEmpty, setArrEmpty] = useState([]);
  const [arrOccupied, setArrOccupied] = useState([]);

  useEffect(() => {
    // Ensure the user is defined
    if (!user || !user.uid) return;
    console.log("docs");

    const collectionRef = collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table");

    // Listen for changes in the collection
    const unsubscribe = onSnapshot(query(collectionRef), (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });

      });
      setArrEmpty(docs
        .filter(element => element.product === "[]")
        .map(element => element.id.slice((store + "-").length)))
      setArrOccupied(docs
        .filter(element => element.product !== "[]")
        .map(element => element.id.slice((store + "-").length)))
      //setCheckProduct(docs)
      //console.log()
      //setArr(docs.map(element => element.id.slice((store + "-").length)))


    }, (error) => {
      // Handle any errors
      console.error("Error getting documents:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Dependencies for useEffect

  async function compareArrays(array1, array2) {//array1 isSent array2 is full array
    const array1ById = Object.fromEntries(array1.map(item => [item.count, item]));
    const array2ById = Object.fromEntries(array2.map(item => [item.count, item]));
    const add_array = []
    const delete_array = []
    for (const [count, item1] of Object.entries(array1ById)) {
      const item2 = array2ById[count];
      if (item2) {
        // If item exists in both arrays
        if (item1.quantity > item2.quantity) {
          console.log('Deleted trigger:', {
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          });
          delete_array.push({
            ...item1,
            quantity: item1.quantity - item2.quantity,
            itemTotalPrice: (item1.itemTotalPrice / item1.quantity) * (item1.quantity - item2.quantity)
          })

        } else if (item1.quantity < item2.quantity) {
          console.log('Added trigger:', {
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          });
          add_array.push({
            ...item2,
            quantity: item2.quantity - item1.quantity,
            itemTotalPrice: (item2.itemTotalPrice / item2.quantity) * (item2.quantity - item1.quantity)
          })
        }
      } else {
        // If item exists in array 1 but not in array 2
        console.log('Deleted trigger:', item1);
        delete_array.push(item1)
      }
    }

    for (const [count, item2] of Object.entries(array2ById)) {
      const item1 = array1ById[count];
      if (!item1) {
        // If item exists in array 2 but not in array 1
        console.log('Added trigger:', item2);
        add_array.push(item2)
      }
    }
    const promises = [];//make them call at the same time

    if (add_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const addPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
        date: date,
        data: add_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      });
      promises.push(addPromise);
    }

    if (delete_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const deletePromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
        date: date,
        data: delete_array,
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("DeleteSendToKitchen Document written with ID: ", docRef.id);
      });
      promises.push(deletePromise);
    }

    // Execute both promises in parallel
    Promise.all(promises).then(() => {
      console.log("All operations completed");
    }).catch(error => {
      console.error("Error in executing parallel operations", error);
    });
  }

  const OpenCashDraw = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "OpenCashDraw"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const MarkAsUnPaid = () => {
    if (onClearCart) {
      onClearCart();
    }
  };

  const CashCheckOut = async (tips_) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CashCheckOut"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        extra_tips: tips_ === "" ? 0 : tips_,
        total: finalPrice,
      });
      console.log("Document written with ID: ", docRef.id);
      if (onClearCart) {
        onClearCart();
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // handling the add tips logic + modal

  // Add a new state for the modal
  const [isTipsModalOpen, setTipsModalOpen] = useState(false);

  const [selectedTipPercentage, setSelectedTipPercentage] = useState(null);

  const [customPercentage, setCustomPercentage] = useState("");

  // Create a function to open the modal
  const handleAddTipClick = () => {
    setTipsModalOpen(true);
  };

  const handleCancelTip = () => {
    setTips("");  // reset the tips value

    setSelectedTipPercentage("");
    setTipsModalOpen(false);  // close the modal
  };

  const handlePercentageTip = (percentage) => {
    // If the value is less than 0, set it to 0 (or any other default value)
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedTip = totalPrice * percentage;
    setTips(calculatedTip.toFixed(2)); // This will keep the tip value to two decimal places
    setSelectedTipPercentage(percentage);
  }

  const handleCustomPercentageChange = (e) => {
    let value = e.target.value;
    // If the value is less than 0, set it to 0 (or any other default value)
    if (value < 0) {
      value = 0;
    }
    setCustomPercentage(value);
    const calculatedTip = totalPrice * (Number(value) / 100);
    setTips(calculatedTip.toFixed(2));
    setSelectedTipPercentage(null);
  }

  // the modal and logic for discounts
  // const [discount, setDiscount] = useState('');  //declared ontop
  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState(null);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");

  const handleAddDiscountClick = () => {
    setDiscountModalOpen(true);
  };

  const handleCancelDiscount = () => {
    setDiscount('');  // reset the discount value
    setDiscountModalOpen(false);  // close the modal
  };

  const applyDiscount = (value) => {
    if (value < 0) {
      value = 0;
    }
    setDiscount(value.toString());
  };

  const handleDiscountPercentage = (percentage) => {
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedDiscount = totalPrice * percentage;
    setDiscount(calculatedDiscount.toFixed(2));
    setSelectedDiscountPercentage(percentage);
  }

  const [isMyModalVisible, setMyModalVisible] = useState(false);
  const [received, setReceived] = useState(false)
  const [isPaymentClick, setIsPaymentClick] = useState(false)


  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isChangeTableModal, setChangeTableModal] = useState(false);

  const openUniqueModal = () => setUniqueModalOpen(true);
  const closeUniqueModal = () => setUniqueModalOpen(false);

  const handleChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // 替换中文句号

    // 只允许数字、小数点、负号
    if (/^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
    setErrorMessage(``)

    setResult(null);
  };

  const handleCustomAmountChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // 替换中文句号

    // 只允许数字、小数点、负号
    if (/^-?\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };


  const [errorMessage, setErrorMessage] = useState("");

  const calculateResult = () => {
    const x = parseFloat(inputValue);
    if (!isNaN(x) && x > finalPrice) {
      setResult(x);
    } else {
      setErrorMessage(`Please enter a number greater than total amount`);
    }
  };


  const calculateExtra = (percentage) => {
    const extraAmount = (totalPrice * percentage) / 100;
    setExtra(extraAmount);
    setFinalResult(totalPrice + extraAmount);
  };

  const calculateCustomAmount = (customAmoun_t) => {
    let amount;
    amount = parseFloat(customAmoun_t)
    if (!isNaN(amount)) {
      setExtra(amount);
      setFinalResult(totalPrice + amount);
    } else {
      alert("Please enter a valid number");
    }
  };

  const uniqueModalStyles = {
    overlayStyle: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: isUniqueModalOpen ? 'flex' : 'none',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStyle: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      position: 'relative',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    closeBtnStyle: {
      position: 'absolute',
      right: '30px',
      top: '0',
      background: 'none',
      border: 'none',
      fontSize: '48px',
      cursor: 'pointer',
    },
    inputStyle: {
      width: '100%',
      padding: '12px',
      boxSizing: 'border-box',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    buttonStyle: {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      marginBottom: '10px',
    },
  };
  const [isCustomAmountVisible, setCustomAmountVisible] = useState(false);

  const toggleCustomAmountVisibility = () => {
    setCustomAmountVisible(!isCustomAmountVisible);
  };

  const isPC = width >= 1024;


  // these dndTestKey allows the dnd_test to reset by switching to a different key
  const [dndTestKey, setDndTestKey] = useState(0); // initial key set to 0

  const resetDndTest = () => {
    setDndTestKey(prevKey => prevKey + 1); // increment key to force re-render
  };
  function groupAndSumItems(items) {
    const groupedItems = {};
    items.reverse();
    items.forEach(item => {
      // Create a unique key based on id and JSON stringified attributes
      const key = `${item.id}-${JSON.stringify(item.attributeSelected)}`;

      if (!groupedItems[key]) {
        // If this is the first item of its kind, clone it (to avoid modifying the original item)
        groupedItems[key] = { ...item };
      } else {
        // If this item already exists, sum up the quantity and itemTotalPrice
        groupedItems[key].quantity += item.quantity;
        groupedItems[key].itemTotalPrice = Math.round((groupedItems[key].itemTotalPrice + item.itemTotalPrice) * 100) / 100;
        // The count remains from the first item
      }
    });

    // Convert the grouped items object back to an array
    return Object.values(groupedItems).reverse();
  }

  const mergeProduct = async (table_name) => {
    try {
      // 从iframeDesk.js获取目标桌子的订单
      const targetTableDataRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", `${store}-${table_name}`);
      const targetTableDoc = await getDoc(targetTableDataRef);
      
      if (!targetTableDoc.exists()) {
        console.error("目标桌子数据不存在");
        return;
      }
      
      // 获取目标桌子的产品数据
      let targetTableProducts = [];
      if (targetTableDoc.data() && targetTableDoc.data().product) {
        try {
          targetTableProducts = JSON.parse(targetTableDoc.data().product);
        } catch (e) {
          console.error("解析目标桌子数据失败", e);
          targetTableProducts = [];
        }
      }
      
      // 合并当前活动成员的订单与目标桌子的订单
      const mergedProducts = groupAndSumItems([
        ...(activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : []), 
        ...targetTableProducts
      ]);
      
      // 更新目标桌子数据
      await SetTableInfo_(`${store}-${table_name}`, JSON.stringify(mergedProducts));
      
      // 获取并合并isSent数据
      const currentIsSentKey = `${store}-${selectedTable}-member-${activeMemberId}-isSent`;
      const targetIsSentKey = `${store}-${table_name}-isSent`;
      
      const currentIsSent = localStorage.getItem(currentIsSentKey) ? 
        JSON.parse(localStorage.getItem(currentIsSentKey)) : [];
      const targetIsSent = localStorage.getItem(targetIsSentKey) ? 
        JSON.parse(localStorage.getItem(targetIsSentKey)) : [];
      
      const mergedIsSent = groupAndSumItems([...currentIsSent, ...targetIsSent]);
      
      // 更新目标桌子isSent数据
      await SetTableIsSent(targetIsSentKey, JSON.stringify(mergedIsSent));
      
      // 清空当前桌子数据
      await SetTableInfo_(`${store}-${selectedTable}`, JSON.stringify([]));
      await SetTableIsSent(currentIsSentKey, JSON.stringify([]));
      
      // 清空当前活动成员的购物车
      if (onClearCart) {
        onClearCart();
      }
      
      // 显示合并成功消息
      alert(`成功将订单合并到桌子 ${table_name}`);
      
    } catch (error) {
      console.error("合并桌子数据失败: ", error);
      alert("合并桌子失败，请重试");
    }
  };

  const SetTableInfo_ = async (table_name, product, id) => {
    try {

      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docData = { product: product, date: date };
      const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
      await setDoc(docRef, docData);

    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const PaymentSuccessUpdate = async (tips_, intent) => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CheckOut"), {
        date: date,
        data: activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : [],
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        extra_tips: tips_ === "" ? 0 : tips_,
        total: finalPrice,
        intent: intent,
      });
      console.log("Document written with ID: ", docRef.id);
      if (onClearCart) {
        onClearCart();
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // console.log("Products from instroe_shop_cart", products)
  return (

    <div>

      <div class=''>
        <div className="flex w-full">
          <div className={`flex-grow  ${!isMobile ? 'm-6' : 'm-2'}`} >
            <div className="mb-1 bg-gray-100 p-4 rounded-lg space-y-3">
              <div className="flex justify-between w-full">
                <div className="text-left">
                  {(extra !== null && extra !== 0) && (
                    <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                      {fanyi("Tips")}: <span className="notranslate text-green-600">${stringTofixed(Math.round((extra) * 100) / 100)}</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-right notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                    {fanyi("Subtotal")}: <span className="notranslate text-blue-600">${stringTofixed(Math.round(100 * totalPrice) / 100)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between w-full">
                <div className="text-left">
                  {tips && (
                    <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                      {fanyi("Tips")}: <span className="notranslate text-green-600">${stringTofixed(tips)}</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-right notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                    {fanyi("Tax")} ({Number(TaxRate)})%: <span className="notranslate text-blue-600">${stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100))}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between w-full">
                <div className="text-left">
                  {discount && (
                    <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                      {fanyi("Disc.")}: <span className="notranslate text-red-600">${stringTofixed(discount)}</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-right notranslate ${!isMobile ? 'text-lg font-bold' : 'font-semibold'}`}>
                    {fanyi("Total")}: <span className="notranslate text-red-600">${stringTofixed(finalPrice)}</span>
                  </div>
                </div>
              </div>

            </div>
            <div style={{ overflowY: 'auto', height: `calc(100vh - 325px)` }} >
              {(activeMemberOrder && Array.isArray(activeMemberOrder.order) && activeMemberOrder.order.length > 0) ? activeMemberOrder.order.map((product) => (
                // can make the parent div flexbox
                <div>
                  <div className='flex'>
                    <DeleteSvg className='mt-2 ml-1 mr-2'
                      onClick={() => {
                        handleDeleteClick(product.id, product.count)
                      }}></DeleteSvg>
                    <div className={`flex justify-between w-full mb-1 ${!isMobile ? 'text-lg' : ''} notranslate`}>
                      <span>
                        {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                      </span>
                      <span>${(Math.round(product.itemTotalPrice * 100) / 100).toFixed(2)}</span>
                    </div>



                  </div>
                  <div className='items-center'>
                    <div>
                      <span class="notranslate">
                        {product.attributeSelected && typeof product.attributeSelected === 'object' 
                        ? Object.entries(product.attributeSelected).map(([key, value]) => (
                          Array.isArray(value) ? value.join(' ') : value)).join(' ') 
                        : ''}
                      </span>
                    </div>

                    <div className="quantity p-0"
                      style={{ marginRight: "0px", display: "flex", justifyContent: "space-between" }}>
                      <a
                        onClick={() => {
                          setOpenChangeAttributeModal(product)
                        }}
                        class="btn d-inline-flex btn-sm btn-outline-dark mx-1">
                        <span>Revise</span>
                      </a>

                      {/* the add minus box set up */}
                      <div style={{ display: "flex" }}>

                        {/* the start of minus button set up */}
                        <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderLeft: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "12rem 0 0 12rem", height: "30px" }}>
                          <button className="minus-btn" type="button" name="button" style={{ margin: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                            onClick={() => {
                              if (product.quantity === 1) {
                                handleDeleteClick(product.id, product.count);
                              } else {
                                handleMinusClick(product.id, product.count)
                              }
                            }}>
                            <MinusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                          </button>
                        </div>
                        {/* the end of minus button set up */}

                        { /* start of the quantity number */}
                        <span
                          className='notranslate'
                          type="text"
                          style={{ width: '30px', height: '30px', fontSize: '17px', alignItems: 'center', justifyContent: 'center', borderTop: "1px solid", borderBottom: "1px solid", display: "flex", padding: '0px' }}
                        >{product.quantity}</span>
                        { /* end of the quantity number */}

                        { /* start of the add button */}
                        <div className="black_hover" style={{ padding: '4px', alignItems: 'center', justifyContent: 'center', display: "flex", borderRight: "1px solid", borderTop: "1px solid", borderBottom: "1px solid", borderRadius: "0 12rem 12rem 0", height: "30px" }}>
                          <button className="plus-btn" type="button" name="button" style={{ marginTop: '0px', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', display: "flex" }}
                            onClick={() => {
                              handlePlusClick(product.id, product.count)
                            }}>
                            <PlusSvg style={{ margin: '0px', width: '10px', height: '10px' }} alt="" />
                          </button>
                        </div>
                        { /* end of the add button */}
                      </div>
                      { /* end of the add minus setup*/}
                    </div>

                    {/* end of quantity */}



                  </div>
                  <hr></hr>
                </div>

              )) : <div>购物车为空</div>}

            </div>

          </div>
          <div className='flex flex-col space-y-2' style={isMobile ? { minWidth: "120px" } : { minWidth: "150px" }}>
            <a
              onClick={() => { setChangeTableModal(true) }}
              className="mt-3 btn btn-sm btn-link mx-1 border-black"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Change Desk")}</span>
            </a>
            {/* <a
              onClick={toggleAllowance}
              className={`mt-3 btn btn-sm ${isAllowed ? 'btn-light' : 'btn-dark'} mx-1`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              {isMobile ? null : (
                <span className="pe-2">
                  <FontAwesomeIcon icon={isAllowed ? faToggleOn : faToggleOff} />
                </span>
              )}
              <span className='notranslate'>{isAllowed ? fanyi('Allow Dish Revise') : fanyi('Disallow Dish Revise')}</span>
            </a> */}

            <a
              onClick={handleAddTipClick}
              className="mt-3 btn btn-sm btn-success mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Add Service Fee")}</span>
            </a>

            <a
              onClick={handleAddDiscountClick}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Add Discount")}</span>
            </a>

            <a
              onClick={() => { listOrder(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Print Order")}</span>
            </a>

            <a
              onClick={() => { CustomerReceipt(); MerchantReceipt(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Print Receipt")}</span>
            </a>

            <a
              onClick={() => { setSplitPaymentModalOpen(true); SendToKitchen(); localStorage.setItem("splitSubtotalTotalPrice", Math.round(totalPrice * 100) / 100); localStorage.setItem("splitSubtotalCurrentPrice", 0) }}
              className="mt-3 btn btn-sm btn-warning mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >



              <span className='notranslate'>{fanyi("Split Payment")}</span>
            </a>
            <a
              onClick={() => { SendToKitchenMarkAsUnPaid(); MarkAsUnPaid(); }}
              className="mt-3 btn btn-sm btn-outline-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Mark as Unpaid")}</span>
            </a>
            <a
              onClick={() => { setMyModalVisible(true); SendToKitchen() }}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Card Pay")}</span>
            </a>

            <a
              onClick={() => { openUniqueModal(); SendToKitchen() }}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Cash Pay")}</span>
            </a>
          </div>
        </div>
        <div>
        </div>
      </div>
      {/* popup content */}
      <div style={{ margin: "auto", height: "fit-content" }}>

        <div className="flex flex-col flex-row">
          {isUniqueModalOpen && (
            <div id="addTipsModal notranslate" className="modal fade show"
              style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header mb-2">
                    <a
                      onClick={() => { OpenCashDraw(); }}
                      className="mt-3 btn btn-md btn-info "
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                    >

                      <span>Open Cash Drawer</span>
                    </a>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => {
                      setUniqueModalOpen(false);
                      setInputValue("")
                    }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">
                    <p className="mb-2">{fanyi("Enter the Cash Received")}</p>
                    <input
                      type="text" // 使用 text 但限制输入内容
                      value={inputValue}
                      onChange={handleChange}
                      style={uniqueModalStyles.inputStyle}
                      className="mb-4 p-2 w-full border rounded-md"
                      translate="no"
                    />
                    <button
                      onClick={calculateResult}
                      style={uniqueModalStyles.buttonStyle}
                      className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      {fanyi("Calculate Give Back Cash")}
                    </button>
                    {errorMessage && (
                      <div className="text-red-500 font-semibold mt-2">
                        {errorMessage}
                      </div>
                    )}
                    <p className="mb-4 mt-4">{fanyi("Gratuity")}:</p>
                    <div className="flex justify-between mb-4">
                      <button onClick={() => { calculateExtra(15); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => { calculateExtra(18); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => { calculateExtra(20); setCustomAmountVisible(false) }} className="bg-purple-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => { calculateExtra(0); setCustomAmountVisible(false) }} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        0
                      </button>
                      <button onClick={toggleCustomAmountVisibility} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        {fanyi("Other")}
                      </button>
                    </div>

                    {isCustomAmountVisible && (
                      <div className='notranslate'>
                        <p className="mb-2">{fanyi("Custom Gratuity")}:</p>
                        <div className="flex">
                          <input
                            type="text"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            style={uniqueModalStyles.inputStyle}
                            className="p-2 w-full border rounded-md mr-2"
                          />
                          <button
                            onClick={() => calculateCustomAmount(customAmount)}
                            className="bg-orange-500 text-white p-2 rounded-md w-1/3"
                          >
                            {fanyi("Add")}
                          </button>
                        </div>
                      </div>
                    )}

                    {(extra !== null && extra !== 0) && (
                      <p className="">{fanyi("Gratuity")}: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                    )}
                    <p className="mt-1">{fanyi("Receivable Payment")}: <span className='notranslate'>${finalPrice}</span> </p>

                    {result !== null && (
                      <div>
                        <p className="mt-1 mb-4 ">
                          {fanyi("Give Back Cash")}: <span className='notranslate'>${Math.round((result - finalPrice) * 100) / 100}</span>
                        </p>
                        <button
                          onClick={() => {
                            setCustomAmount(Math.round((result - finalPrice) * 100) / 100); calculateCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                            CashCheckOut(Math.round((result - finalPrice + extra) * 100) / 100, stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                              inputValue);

                            closeUniqueModal();
                          }}
                          style={uniqueModalStyles.buttonStyle}
                          className="notranslate mt-2 mb-2 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                        >
                          {fanyi("Collect")} ${stringTofixed(Math.round(inputValue * 100) / 100)},
                          {fanyi("including")} ${Math.round((result - finalPrice + extra) * 100) / 100}
                          {fanyi("Gratuity")}.
                          {/* {fanyi("Add return cash as a gratuity")} (
                          {fanyi("Total")}:
                          
                          <span className='notranslate'>${Math.round((result - finalPrice + extra) * 100) / 100}</span>
                          {fanyi("and finalize")} */}
                        </button>

                      </div>
                    )}
                    <button
                      onClick={() => {
                        CashCheckOut(extra, stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                          finalPrice);
                        closeUniqueModal();

                      }}//service_fee,finalnum,givebackcash,
                      style={uniqueModalStyles.buttonStyle}
                      className="notranslate mt-2 mb-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                    >
                      {fanyi("Collect")} ${stringTofixed(finalPrice)},
                      {fanyi("including")} ${Math.round((extra) * 100) / 100}
                      {fanyi("Gratuity")}.
                    </button>
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}
          {isSplitPaymentModalOpen && (
            <div
              id="addTipsModal"
              className="modal fade show"
              role="dialog"
              style={{
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: '95%', width: '95%', height: "90%", margin: '0 auto', marginTop: '20px' }}
              >
                <div className="modal-content">

                  <div
                    className="modal-body p-2 pt-0"
                    style={{ overflowX: 'auto', maxWidth: '100%' }}
                  >
                    <div className='flex p-2 pt-4'>
                      <Button className='mr-2' variant="danger" style={{ marginTop: "auto" }} onClick={resetDndTest}>
                        Reset
                      </Button>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                        <div>
                          <div>
                            ✅ Paid Subtotal:&nbsp;
                            <span className='notranslate'>${round2digtNum(localStorage.getItem("splitSubtotalCurrentPrice")).toFixed(2)}</span>
                          </div>
                          <div>
                            💰Total Subtotal:&nbsp;
                            <span className='notranslate'>${round2digtNum(localStorage.getItem("splitSubtotalTotalPrice")).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setSplitPaymentModalOpen(false); }}>
                        &times;
                      </button>
                    </div>
                    <Dnd_Test store={store} acct={acct} selectedTable={selectedTable} key={dndTestKey} main_input={activeMemberOrder && activeMemberOrder.order ? activeMemberOrder.order : []}
                      TaxRate={TaxRate}
                    />
                  </div>
                </div>
              </div>
            </div>

          )
          }

          {isChangeTableModal && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select Dining Desk to Merge for {selectedTable}</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setChangeTableModal(false); }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">
                    <div>Empty Dining Desk(s): </div>
                    {arrEmpty.map((option) => (

                      <button
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => { mergeProduct(option); setChangeTableModal(false); }}
                        style={{ backgroundColor: '#966f33' }}
                      >
                        {option}
                      </button>

                    ))}
                    <hr></hr>
                    <div>Dining Desk(s) in Use:</div>
                    {arrOccupied.map((option) => (

                      <button
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => { mergeProduct(option); setChangeTableModal(false); }}
                      >
                        {option}
                      </button>

                    ))}
                  </div>
                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>

          )
          }
          {isMyModalVisible && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Select your POS Machine:</h5>
                    <button style={uniqueModalStyles.closeBtnStyle} onClick={() => { setMyModalVisible(false); setReceived(false) }}>
                      &times;
                    </button>
                  </div>
                  <div className="modal-body pt-0">

                    <PaymentRegular setDiscount={setDiscount} setTips={setTips} setExtra={setExtra} setInputValue={setInputValue} onClearCart={onClearCart} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store}
                      chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} totalPrice={Math.round(totalPrice * 100)} setShouldReloadCart={setShouldReloadCart} />
                    <span className="mb-2 notranslate">Or Customer Can Scan To Pay The Whole Table (扫码支付本桌)</span>

                    <div className="qrCodeItem flex flex-col items-center mt-1">
                      <QRCode value={`https://7dollar.delivery/store?store=${store}&table=${selectedTable}`} size={100} />
                    </div>

                  </div>

                  <div className="modal-footer">
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* the modal for tips */}
          {isTipsModalOpen && (
            <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Service Fee</h5>
                  </div>
                  <div className="modal-body">

                    <div className="flex justify-between mb-4">
                      <button onClick={() => handlePercentageTip(0.15)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        15%
                      </button>
                      <button onClick={() => handlePercentageTip(0.18)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        18%
                      </button>
                      <button onClick={() => handlePercentageTip(0.20)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => handlePercentageTip(0.25)} className="bg-green-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                      {/* <input
                        type="number"
                        placeholder="Enter percent"
                        min="0"  // Add this line
                        value={customPercentage}
                        onChange={handleCustomPercentageChange}
                        className="px-4 py-2 ml-2 form-control tips-no-spinners"  // Added the 'no-spinners' class
                        translate="no" 
                      /> */}
                    </div>
                    <input
                      type="number"
                      placeholder="Enter service fee by amount"
                      value={tips}
                      step="any"  // Allows any decimal input
                      className="form-control tips-no-spinners"  // Presuming the 'tips-no-spinners' class hides the default spinner
                      onChange={(e) => {
                        let value = e.target.value;

                        // Convert to float for validation but update state with original input value
                        let parsedValue = parseFloat(value);

                        // Ensure the input is non-negative and valid
                        if (isNaN(parsedValue) || parsedValue < 0) {
                          value = "0";  // Set to "0" if invalid or negative
                        }

                        setTips(value.toString());  // Update the state with the raw input value
                        setSelectedTipPercentage(null);
                      }}
                      onFocus={() => setSelectedTipPercentage(null)}
                      translate="no"
                    />


                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => handleCancelTip()}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => setTipsModalOpen(false)}>Add Service Fee</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isDiscountModalOpen && (
            <div id="addDiscountModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Discount</h5>
                  </div>
                  <div className="modal-body">
                    <div className="flex justify-between mb-4">
                      <button onClick={() => handleDiscountPercentage(0.10)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mr-2">
                        10%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.15)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mx-1">
                        15%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.20)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        20%
                      </button>
                      <button onClick={() => handleDiscountPercentage(0.25)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        25%
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Enter discount by amount"
                      value={discount}
                      step="any"  // Allows any decimal input
                      className="form-control tips-no-spinners"  // Presuming the 'tips-no-spinners' class hides the default spinner
                      onChange={(e) => {
                        let value = e.target.value;

                        // Convert to float for validation but update state with original input value
                        let parsedValue = parseFloat(value);

                        // Ensure the input is non-negative and valid
                        if (isNaN(parsedValue) || parsedValue < 0) {
                          value = "0";  // Set to "0" if invalid or negative
                        }

                        applyDiscount(value.toString());  // Update the state with the raw input value
                        setSelectedTipPercentage(null);
                      }}
                      onFocus={() => setSelectedTipPercentage(null)}
                      translate="no"
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancelDiscount}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => setDiscountModalOpen(false)}>Add Discount</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  )
}

export default Navbar