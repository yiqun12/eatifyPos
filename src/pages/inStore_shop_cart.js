import React from 'react'
import { useState, useRef, useCallback } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useEffect, useMemo } from 'react';
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
import { faCreditCard, faGift, faDollarSign, faShare, faPencilAlt, faTimes, faExchangeAlt, faArrowRight, faPrint, faBackspace } from '@fortawesome/free-solid-svg-icons';
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
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
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
import NumberPad from '../components/NumberPad'; // Import NumberPad component
import KeypadModal from '../components/KeypadModal'; // Import KeypadModal component
import TableTimingModal from '../components/TableTimingModal';

// Member Payment System Imports
import SimpleMemberPayment from '../components/Member/components/SimpleMemberPayment';
import { MemberPaymentAPI } from '../components/Member/memberUtils';
import { t as memberT } from '../components/Member/translations';

const Navbar = ({ OpenChangeAttributeModal, setOpenChangeAttributeModal, setIsAllowed, isAllowed, store, selectedTable, acct, openSplitPaymentModal, TaxRate, isViewOrdersMode = false }) => {
  // Removed startTime prop as it's read from localStorage now
  // startTime = 1744625303617 // Removed hardcoded value

  const serviceFeeInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const cashPayInputRef = useRef(null);

  const [products, setProducts] = useState(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : []);
  const { user, user_loading } = useUserContext();

  const [width_, setWidth_] = useState(window.innerWidth - 64);

  // State for dining duration
  const [diningDuration, setDiningDuration] = useState('');
  // State for formatted start time
  const [startTimeDisplay, setStartTimeDisplay] = useState('');

  useEffect(() => {
    function handleResize() {
      setWidth_(window.innerWidth - 64);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = width_ <= 768;


  const [isSplitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);

  // Table timing modal state
  const [isTableTimingModalOpen, setIsTableTimingModalOpen] = useState(false);
  const [selectedTableItem, setSelectedTableItem] = useState(null);

  // Unfinished table warning modal state
  const [showUnfinishedTableWarning, setShowUnfinishedTableWarning] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState(null);

  // Simplified Member Payment States
  const [showMemberPayment, setShowMemberPayment] = useState(false);
  const [memberBalanceUsage, setMemberBalanceUsage] = useState(null); // Member balance usage information
  const [verifiedMemberPhone, setVerifiedMemberPhone] = useState(() => {
    // Restore verification state from localStorage
    return localStorage.getItem(`verifiedMemberPhone-${store}-${selectedTable}`) || null;
  }); // Verified member phone number
  const [showToast, setShowToast] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });
  const [toastMessage, setToastMessage] = useState('');

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    setProducts(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])
  }, [id]);

  // Save verification state to localStorage
  useEffect(() => {
    if (verifiedMemberPhone) {
      localStorage.setItem(`verifiedMemberPhone-${store}-${selectedTable}`, verifiedMemberPhone);
    } else {
      localStorage.removeItem(`verifiedMemberPhone-${store}-${selectedTable}`);
    }
  }, [verifiedMemberPhone, store, selectedTable]);

  // Listen for update events from TableTimingModal
  useEffect(() => {
    const handleCartUpdate = (event) => {
      const { store: eventStore, selectedTable: eventTable } = event.detail;
      // Only update when the event is for the current cart
      if (eventStore === store && eventTable === selectedTable) {
        saveId(Math.random()); // Trigger re-render
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [store, selectedTable, saveId]);

  // New: Check and restore all timers on page load
  useEffect(() => {
    const checkAllTimers = () => {
      // Iterate through all timers in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('-timer')) {
          try {
            const timerData = JSON.parse(localStorage.getItem(key));
            if (timerData && timerData.endTime && timerData.action) {
              const now = Date.now();
              const { endTime, action } = timerData;

              if (now < endTime) {
                // Timer not yet expired, restore timer
                const remainingTime = endTime - now;
                console.log(`恢复定时器 ${key}，剩余时间: ${Math.floor(remainingTime / 1000)}秒`);

                setTimeout(() => {
                  executeTimerAction(action, key);
                }, remainingTime);
              } else if (now >= endTime && action === 'Auto Checkout') {
                // Timer expired and is auto-checkout, execute immediately
                console.log(`定时器 ${key} 已到期，执行自动结账`);
                executeTimerAction(action, key);
              }
            }
          } catch (error) {
            console.error('恢复定时器时出错:', error);
          }
        }
      }
    };

    // Execute timer action
    const executeTimerAction = (action, timerKey) => {
      if (action === 'Auto Checkout') {
        // Parse timer key to get table information
        const keyParts = timerKey.split('-');
        const storeMatch = keyParts.slice(0, -2).join('-'); // Remove the last timer part

        if (storeMatch === store) {
          // Clear timer record
          localStorage.removeItem(timerKey);

          // Show reminder
          const tableInfo = keyParts[keyParts.length - 3]; // Get table information
          // alert(`${tableInfo || selectedTable} 定时结账已执行`);

          // More auto-checkout logic can be added here
          console.log('执行自动结账逻辑');
        }
      } else if (action === 'Continue Billing') {
        // Continue charging requires no special handling
        console.log('到时继续计费');
      }
    };

    // 延迟执行，确保页面完全加载
    setTimeout(checkAllTimers, 1000);
  }, [store, selectedTable]);

  const translations = useMemo(() => [
    { input: "Cart", output: "购物车" },
    { input: "Table", output: "桌号" },
    { input: "Change Desk", output: "更换餐桌" },
    { input: "Allow Dish Revise", output: "打开菜品修改" },
    { input: "Disallow Dish Revise", output: "关闭菜品修改" },
    { input: "Add Service Fee", output: "添加服务费" },
    { input: "Add Discount", output: "添加折扣" },
    { input: "Adjust Total", output: "全桌改价" },
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
    { input: "Discount", output: "折扣" },
    { input: "Disc.", output: "折扣" },
    { input: "After Discount", output: "折扣后" },
    { input: "Duration", output: "用餐时长" },
    { input: "Start", output: "开始时间" },
    { input: "Start Table", output: "开台" },
    { input: "End Table", output: "结台" },
    { input: "Table Timing", output: "开台计时" },
    { input: "Service Fee", output: "服务费" },
    { input: "Tips", output: "小费" },
    { input: "Gratuity", output: "小费" },
    { input: "Revise", output: "修订" },
    { input: "Cash Pay", output: "现金支付" },
    { input: "Use Balance", output: "使用余额" },
    { input: "Member Balance", output: "会员余额" },
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
    { input: "Cancel", output: "返回" },
    { input: "Cancel Add", output: "取消添加" },
    { input: "Tax Exempt", output: "免税" },
    { input: "✓ Tax Exempt", output: "✓ 免税" },
    { input: "Original Total", output: "修改前总价" },
    { input: "New Total", output: "修改后总价" },
    { input: "Enter new total price", output: "输入新的总价" },
    { input: "Surcharge!", output: "加价！" },
    { input: "Discount", output: "折扣" },
    { input: "Enter new total price", output: "输入新的总价" },
    { input: "✓ Tax Exempt", output: "✓ 免税" },
    { input: "Tax Exempt", output: "免税" },
    { input: "Cancel Add", output: "取消添加" },
    { input: "5% Off", output: "95折" },
    { input: "15% Off", output: "85折" },
    { input: "25% Off", output: "75折" },
    { input: "Tips", output: "小费" },
    { input: "Service Fee", output: "服务费" },
    { input: "Custom Amount", output: "自定金额" },
    { input: "Enter service fee by amount", output: "输入服务费金额" },
    { input: "No service fee", output: "无服务费" },
    { input: "Apply", output: "应用" },
    { input: "Unfinished Tables Warning", output: "未结台提醒" },
    { input: "There are unfinished tables that need to be ended before payment.", output: "有未结台的桌子需要先结台才能支付。" },
    { input: "Please end all tables first, then proceed with payment.", output: "请先结台所有桌子，再进行支付。" },
    { input: "Go to End Tables", output: "去结台" },
    { input: "OK", output: "确定" },
  ], []);

  const fanyi = useCallback((input) => {
    const lang = localStorage.getItem("Google-language");
    if (lang?.includes("Chinese") || lang?.includes("中")) {
      const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
      return translation ? translation.output : input;
    }
    return input;
  }, [translations]);

  const handleOpenCustomPriceModal = () => {
    const originalTotal = calculateOriginalTotalPrice();
    setCustomTotalPrice(originalTotal); // Initialize with the current cart total
    setModalTaxExempt(isTaxExempt); // Sync modal's tax exempt state with global
    setIsCustomPriceModalOpen(true);
  };

  // Function to apply percentage discount
  const handlePercentageDiscount = (multiplier) => {
    const originalTotal = parseFloat(calculateOriginalTotalPrice());
    if (!isNaN(originalTotal)) {
      const discountedTotal = originalTotal * multiplier;
      setCustomTotalPrice(stringTofixed(discountedTotal)); // Update the state for new total
    }
  };

  // Callback function after successful table start (products already exist in cart, no need to add again)
  const handleTableStartFromCart = (tableItem) => {
    // Products already exist in cart, only need to refresh state after successful table start
    console.log('开台成功:', tableItem.name);
  };

  // Callback function after successful table end
  const handleTableEnd = (tableItem, finalPrice, endedAtTime) => { // Added endedAtTime parameter
    if (tableItem) {
      // Update the price of corresponding products in cart
      console.log("Table ended for:", tableItem, "Final Price:", finalPrice, "Ended At:", endedAtTime);
      let products_ = JSON.parse(localStorage.getItem(store + "-" + selectedTable) || "[]"); // Ensure products_ is an array

      if (Array.isArray(products_) && products_.length > 0) {
        // Find corresponding table start product - using more accurate search method
        const productIndex = products_.findIndex(product =>
          product.id === tableItem.id &&
          // product.isTableItem && // Consider if this flag is reliably set, or rely on other attributes
          product.attributeSelected &&
          product.attributeSelected['开台商品'] && // This is a key identifier
          product.count === tableItem.count // count is crucial for uniqueness
        );

        if (productIndex !== -1) {
          // Create a new array for products to trigger state update correctly
          const updatedProductsArray = [...products_];

          // Update product price and related information
          updatedProductsArray[productIndex] = {
            ...updatedProductsArray[productIndex],
            subtotal: finalPrice, // This is the total timed charge
            itemTotalPrice: Math.round(finalPrice * updatedProductsArray[productIndex].quantity * 100) / 100,
            // Optionally, you can store information about the timing being ended
            // For example, by adding a property or modifying an attribute:
            // attributeSelected: {
            //   ...updatedProductsArray[productIndex].attributeSelected,
            //   '已结台': true,
            //   '结台时间': endedAtTime ? endedAtTime.toISOString() : new Date().toISOString(),
            //   '最终费用': finalPrice
            // }
          };

          // 保存更新后的购物车
          SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProductsArray));
          // 触发重新渲染 - 使用saveId而不是刷新页面
          saveId(Math.random()); // This should trigger re-read from localStorage via useEffect
        } else {
          console.warn("Ended table item not found in cart for update:", tableItem, "Current cart:", products_);
        }
      }
    }
  };

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
  // const [isTaxExempt, setIsTaxExempt] = useState(false); // 全局免税状态，由外部传入或在这里管理
  // 注意：isTaxExempt 的管理可能需要更集中的地方，或者确保props正确传递
  // 为了让这里的修改能独立工作，暂时假设 isTaxExempt 和 setIsTaxExempt 是可用的。
  // 如果它们是从 props 传下来的，那就不需要在这里 useState。
  // 假设 isTaxExempt 是一个已存在的 state
  const [isTaxExempt, setIsTaxExempt] = useState(false);

  // 自定义改价功能状态
  const [isCustomPriceModalOpen, setIsCustomPriceModalOpen] = useState(false);
  const [customTotalPrice, setCustomTotalPrice] = useState('');
  const [modalTaxExempt, setModalTaxExempt] = useState(isTaxExempt); // Initialize with global tax exempt state

  // originalSubtotal 不再是 state，由 calculateOriginalTotalPrice() 实时计算

  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [priceAfterDiscount, setPriceAfterDiscount] = useState(0); // Price after discount but before member balance

  const [totalQuant, setTotalQuant] = useState(0);
  const [extra, setExtra] = useState(0);

  // Effect to calculate and update dining duration
  useEffect(() => {
    let intervalId = null;

    const updateDuration = () => {
      const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
      const startTimeValue = localStorage.getItem(startTimeKey);
      if (startTimeValue && !isNaN(parseInt(startTimeValue))) {
        console.log("updateDuration")

        const startTime = parseInt(startTimeValue);
        const now = Date.now();
        const durationMs = now - startTime;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

        const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setDiningDuration(formattedDuration);

        // Format and set start time display
        const startDate = new Date(startTime);
        const formattedStartTime = startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        setStartTimeDisplay(formattedStartTime);
      } else {
        setDiningDuration(''); // Clear duration if no start time or no products
        setStartTimeDisplay(''); // Clear start time display
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    updateDuration(); // Initial calculation

    // Set up interval only if conditions are met initially
    const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
    const startTimeValue = localStorage.getItem(startTimeKey);
    if (startTimeValue && !isNaN(parseInt(startTimeValue))) {
      intervalId = setInterval(updateDuration, 1000); // Update every 30 seconds
    }

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [products, id]); // Rerun when store, table, or products change

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
      const total = (Array.isArray(products) ? products : []).reduce((acc, item) => item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0);
      console.log(total)
      setTotalPrice(total);
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))
      console.log((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))
      console.log("finalPrice")
      console.log((Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
      // Calculate member balance deduction
      const memberBalanceDeduction = memberBalanceUsage ? parseFloat(memberBalanceUsage.balanceToUse) || 0 : 0;

      // Calculate price after discount but before member balance (for member payment modal)
      const calculatedPriceAfterDiscount = Math.round(100 * (total * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100;

      setPriceAfterDiscount(calculatedPriceAfterDiscount);

      setFinalPrice(
        Math.max(0, calculatedPriceAfterDiscount - memberBalanceDeduction))
    }
    calculateTotalPrice();
    console.log("change price")
    console.log(tableProductInfo)
    //TO DO: get a better sync. this would write in database twice and this code is not working in mobile unless you get in the shopping cart.
    //GetTableProductInfo(store + "-" + selectedTable)
  }, [products, width, tips, discount, extra, memberBalanceUsage]);

  // Auto-adjust member balance when price after discount changes
  useEffect(() => {
    if (memberBalanceUsage && priceAfterDiscount > 0) {
      const currentBalanceUsage = parseFloat(memberBalanceUsage.balanceToUse) || 0;
      const maxAllowedBalance = priceAfterDiscount;

      console.log('💰 Balance adjustment check:', {
        currentBalanceUsage: currentBalanceUsage.toFixed(2),
        maxAllowedBalance: maxAllowedBalance.toFixed(2),
        needsAdjustment: currentBalanceUsage > maxAllowedBalance
      });

      // Only adjust if current usage exceeds what's allowed AND the values are actually different
      if (currentBalanceUsage > maxAllowedBalance && Math.abs(currentBalanceUsage - maxAllowedBalance) > 0.01) {
        console.log('🔄 Auto-adjusting member balance from', currentBalanceUsage.toFixed(2), 'to', maxAllowedBalance.toFixed(2));
        setMemberBalanceUsage(prevUsage => ({
          ...prevUsage,
          balanceToUse: maxAllowedBalance.toFixed(2)
        }));
      }
    }
  }, [priceAfterDiscount, memberBalanceUsage]); // Watch both but use condition to prevent infinite loops

  const handleDeleteClick = (productId, count) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    // Optional: Logging the product to be deleted
    const productToDelete = products.find((product) => product.id === productId && product.count === count);
    if (productToDelete) {
      console.log('Product before deletion:', productToDelete);
    }

    // Filter out the product to be deleted
    const updatedProducts = products.filter((product) => !(product.id === productId && product.count === count));

    // Update the table information with the new set of products
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
  };

  const handlePlusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = product.quantity + 1;
        const newTotalPrice = Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));

  };


  const handleMinusClick = (productId, targetCount) => {
    // Assuming prevProducts is available in this scope, otherwise, you need to get it from your state
    const updatedProducts = products.map((product) => {
      if (product.id === productId && product.count === targetCount) {
        const newQuantity = Math.max(product.quantity - 1, 0);
        const newTotalPrice = newQuantity > 0 ? Math.round(100 * product.itemTotalPrice / product.quantity * newQuantity) / 100 : 0;

        return {
          ...product,
          quantity: newQuantity,
          itemTotalPrice: newTotalPrice,
        };
      }
      return product;
    });

    // Call SetTableInfo with updated information
    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
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


  // 清理商品数据中的开台时间戳信息
  const cleanProductData = (products) => {
    if (!products) {
      return [];
    }

    const cleanedProducts = products.map(product => {
      const cleanedProduct = { ...product };
      if (cleanedProduct.attributeSelected) {
        cleanedProduct.attributeSelected = { ...cleanedProduct.attributeSelected };
      }

      // 如果商品有attributeSelected且包含开台商品属性
      if (cleanedProduct.attributeSelected && cleanedProduct.attributeSelected['开台商品']) {
        const tableItems = cleanedProduct.attributeSelected['开台商品'];

        const cleanedTableItems = tableItems.map(item => {
          if (typeof item === 'string' && item.startsWith('开台时间-')) {
            const parts = item.split('-');
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
          return item; // Fallback to original item if format is unexpected
        }).filter((item, index, arr) => arr.indexOf(item) === index); // 去重

        cleanedProduct.attributeSelected = {
          ...cleanedProduct.attributeSelected,
          '开台商品': cleanedTableItems
        };
      }

      if (product.isNew) {
        return { ...cleanedProduct, isNew: false };
      }

      return cleanedProduct;
    });

    return cleanedProducts;
  };

  const MerchantReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      // 清理商品数据
      const rawData = localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [];
      const cleanedData = cleanProductData(rawData);

      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
        date: date,
        data: cleanedData, // 使用清理后的数据
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: Math.round(100 * (finalPrice + (memberBalanceUsage?.balanceToUse ? (Math.round(100 * memberBalanceUsage.balanceToUse) / 100) : 0))) / 100,
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

      // 清理商品数据
      const rawData = localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [];
      const cleanedData = cleanProductData(rawData);

      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CustomerReceipt"), {
        date: date,
        data: cleanedData, // 使用清理后的数据
        selectedTable: selectedTable,
        discount: discount === "" ? 0 : discount,
        service_fee: tips === "" ? 0 : tips,
        total: Math.round(100 * (finalPrice + (memberBalanceUsage?.balanceToUse ? (Math.round(100 * memberBalanceUsage.balanceToUse) / 100) : 0))) / 100,
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

      // 清理商品数据
      const rawData = localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [];
      const cleanedData = cleanProductData(rawData);

      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "listOrder"), {
        date: date,
        data: cleanedData, // 使用清理后的数据
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
    // Add logic to save start time if it doesn't exist
    const startTimeKey = `${store}-${selectedTable}-isSent_startTime`;
    const currentCart = localStorage.getItem(`${store}-${selectedTable}`);
    if (!localStorage.getItem(startTimeKey) && currentCart && currentCart !== '[]') {
      localStorage.setItem(startTimeKey, Date.now().toString());
      console.log(`Saved start time for ${selectedTable}: ${startTimeKey}`);
    }
    try {

      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        if (localStorage.getItem(store + "-" + selectedTable + "-isSent") === null || localStorage.getItem(store + "-" + selectedTable + "-isSent") === "[]") {
          console.log("//no item in the array no item isSent.")
          return //no item in the array no item isSent.
        } else {//delete all items
        }
      }
      compareArrays(JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), JSON.parse(localStorage.getItem(store + "-" + selectedTable)))
      SetTableIsSent(store + "-" + selectedTable + "-isSent", localStorage.getItem(store + "-" + selectedTable) !== null ? localStorage.getItem(store + "-" + selectedTable) : "[]")

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

      // 清理商品数据
      const cleanedAddArray = cleanProductData(add_array);

      const addPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "SendToKitchen"), {
        date: date,
        data: cleanedAddArray, // 使用清理后的数据
        selectedTable: selectedTable
      }).then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      });
      promises.push(addPromise);
    }

    if (delete_array.length !== 0) {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      // 清理商品数据
      const cleanedDeleteArray = cleanProductData(delete_array);

      const deletePromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "DeletedSendToKitchen"), {
        date: date,
        data: cleanedDeleteArray, // 使用清理后的数据
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

      // 清理商品数据
      const rawData = localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [];
      const cleanedData = cleanProductData(rawData);

      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "OpenCashDraw"), {
        date: date,
        data: cleanedData, // 使用清理后的数据
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const MarkAsUnPaid = async () => {

    let extra_tip = 0
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
        setProducts([]);
        setExtra(0)
        setInputValue("")
        setDiscount("")
        setTips("")
        // setIsTaxExempt(false); // 重置免税状态
        return
      }
      // Wrap the addDoc call in a promise
      const addDocPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100 * 100),
        application: "",
        application_fee_amount: 0,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret: "pi_none",
        confirmation_method: "automatic",
        created: 0,
        currency: "usd",
        customer: null,
        dateTime: date,
        description: null,
        id: "pi_none",
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_none",
        livemode: true,
        metadata: {
          discount: discount === "" ? 0 : discount,
          isDine: true,
          service_fee: tips === "" ? 0 : tips,
          subtotal: Math.round(100 * totalPrice) / 100, // Original item subtotal (before member balance)
          tax: Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100,
          tips: Math.round(100 * extra_tip) / 100,
          total: Math.round((Math.round(100 * finalPrice) / 100 + Math.round(100 * extra_tip) / 100) * 100) / 100,
          // Add member balance information if used
          ...(memberBalanceUsage && {
            memberBalanceUsed: parseFloat(memberBalanceUsage.balanceToUse) || 0,
            originalTotal: Math.round(100 * (totalPrice * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100
          })
        }, // Assuming an empty map converts to an empty object
        next_action: null,
        object: "payment_intent",
        on_behalf_of: null,
        payment_method: "pm_none",
        payment_method_configuration_details: null,
        payment_method_options: {}, // Assuming an empty map converts to an empty object
        card_present: {}, // Assuming an empty map converts to an empty object
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
        payment_method_types: ["Mark_as_Unpaid"],
        powerBy: "Unpaid",
        processing: null,
        receiptData: JSON.stringify(cleanProductData(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])),
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        store: store,
        storeOwnerId: user.uid,
        stripe_store_acct: acct,
        tableNum: selectedTable,
        transfer_data: null,
        transfer_group: null,
        uid: user.uid,
        user_email: user.email,
      });

      // Assuming SetTableInfo and SetTableIsSent are asynchronous and return promises
      // If they are not asynchronous, you can wrap their calls in Promise.resolve to treat them as promises
      const setTableInfoPromise = SetTableInfo(`${store}-${selectedTable}`, "[]");
      const setTableIsSentPromise = SetTableIsSent(`${store}-${selectedTable}-isSent`, "[]");

      // Execute all promises in parallel
      Promise.all([addDocPromise, setTableInfoPromise, setTableIsSentPromise]).then(() => {
        console.log("All operations completed successfully.");

      }).catch((error) => {
        console.error("Error executing operations:", error);
      });
      setProducts([]);
      setExtra(0)
      setInputValue("")
      setTips("")
      setDiscount("")
      // setIsTaxExempt(false); // 重置免税状态
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time


    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  // console.logg(tips)
  // console.log(typeof(tips))
  //console.logg(Math.round(extra * 100) / 100)
  //console.log(typeof(Math.round(extra * 100) / 100))
  function roundToTwoDecimals(n) {
    return Math.round(n * 100) / 100;
  }
  const CashCheckOut = async (extra, tax, total) => {
    // Prevent duplicate submissions
    if (isCashProcessing) {
      console.log("🚫 CashCheckOut already processing, skipping duplicate call");
      return;
    }
    
    setIsCashProcessing(true);
    console.log("🏧 CashCheckOut called with:", { extra, tax, total });
    console.log("💰 Current memberBalanceUsage:", memberBalanceUsage);
    let extra_tip = 0
    if (extra !== null) {
      extra_tip = Math.round(extra * 100) / 100
    }
    console.log(extra)
    console.log(extra_tip)
    console.log(tips)
    console.log(roundToTwoDecimals
      (roundToTwoDecimals(extra_tip) + roundToTwoDecimals(tips === "" ? 0 : tips)))
    //console.log(typeof extra_tip)//number
    //console.log(typeof (tips === "" ? 0 : tips))//string
    if (localStorage.getItem(store + "-" + selectedTable) === null || localStorage.getItem(store + "-" + selectedTable) === "[]") {
      setProducts([]);
      setExtra(0)
      setInputValue("")
      setDiscount("")
      setTips("")
      // setIsTaxExempt(false); // 重置免税状态
      setResult(null)
      setIsCashProcessing(false);
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
      return
    }
    console.log("CashCheckOut")

    try {
      // If member balance is used, validate balance first then execute deduction
      if (memberBalanceUsage) {
        console.log('🔄 Processing member balance deduction...', memberBalanceUsage);

        // Validate balance before deduction
        console.log('🔍 Validating member balance before deduction...');
        try {
          const validationResult = await MemberPaymentAPI.validateBalanceUsage(
            memberBalanceUsage.memberPhone,
            parseFloat(memberBalanceUsage.balanceToUse),
            store
          );
          console.log('✅ Balance validation successful:', validationResult);
        } catch (validationError) {
          console.error('❌ Balance validation failed:', validationError);
          throw new Error('Balance validation failed: ' + validationError.message);
        }

        try {
          const paymentData = {
            memberPhone: memberBalanceUsage.memberPhone,
            memberName: memberBalanceUsage.memberName,
            balanceUsed: parseFloat(memberBalanceUsage.balanceToUse),
            remainingAmount: Math.max(0, total - parseFloat(memberBalanceUsage.balanceToUse)),
            totalAmount: total,
            orderItems: products || [],
            storeId: store,
            tableNum: selectedTable,
            isDineIn: true,
            tips: parseFloat(tips) || 0,
            discount: parseFloat(discount) || 0,
            taxRate: parseFloat(TaxRate) || 0,
            // Pass calculated values directly instead of recalculating
            subtotal: Math.round(100 * totalPrice) / 100, // Original item subtotal
            tax: parseFloat(tax) || 0 // Calculated tax value passed from CashCheckOut
          };

          console.log('💳 Member payment data:', paymentData);
          const result = await MemberPaymentAPI.executeMemberPayment(paymentData);
          console.log('✅ Member balance deducted successfully:', result);
        } catch (memberPaymentError) {
          console.error('Failed to deduct member balance:', memberPaymentError);
          throw new Error('Member balance deduction failed: ' + memberPaymentError.message);
        }
      }

      // If payment is fully covered by member balance (total = 0), skip creating cash payment record
      const isFullyPaidWithBalance = memberBalanceUsage && total <= 0;
      
      if (isFullyPaidWithBalance) {
        console.log('💰 Payment fully covered by member balance, skipping cash payment record');
        // Clear cart and reset states
        setProducts([]);
        setExtra(0)
        setInputValue("")
        setDiscount("")
        setTips("")
        setResult(null)
        setMemberBalanceUsage(null);
        setIsCashProcessing(false);
        localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`);
        
        // Clear table data
        SetTableInfo(store + "-" + selectedTable, "[]");
        SetTableIsSent(store + "-" + selectedTable + "-isSent", "[]");
        return;
      }

      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

      // Determine payment method identifier
      const paymentMethod = memberBalanceUsage ? "Mixed Payment (Cash + Member Balance)" : "Paid by Cash";
      const powerBy = memberBalanceUsage ? "Mixed Payment" : "Paid by Cash";

      // Wrap the addDoc call in a promise
      const addDocPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(total * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(total * 100),
        application: "",
        application_fee_amount: 0,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic",
        client_secret: "pi_none",
        confirmation_method: "automatic",
        created: 0,
        currency: "usd",
        customer: null,
        dateTime: date,
        description: null,
        id: "pi_none",
        invoice: null,
        last_payment_error: null,
        latest_charge: "ch_none",
        livemode: true,
        metadata: {
          discount: discount === "" ? 0 : discount,
          isDine: true,
          service_fee: 0,
          subtotal: Math.round(100 * totalPrice) / 100, // Original item subtotal (before member balance)
          tax: tax,
          tips: roundToTwoDecimals
            (roundToTwoDecimals(extra_tip) + roundToTwoDecimals(tips === "" ? 0 : tips)),
          total: total,
          // Member balance information
          ...(memberBalanceUsage && {
            memberPhone: memberBalanceUsage.memberPhone,
            memberBalanceUsed: parseFloat(memberBalanceUsage.balanceToUse),
            memberPaymentType: parseFloat(memberBalanceUsage.balanceToUse) >= total ? 'full' : 'partial',
            originalTotal: Math.round(100 * (totalPrice * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100
          })
        }, // Assuming an empty map converts to an empty object
        next_action: null,
        object: "payment_intent",
        on_behalf_of: null,
        payment_method: "pm_none",
        payment_method_configuration_details: null,
        payment_method_options: {}, // Assuming an empty map converts to an empty object
        card_present: {}, // Assuming an empty map converts to an empty object
        request_extended_authorization: false,
        request_incremental_authorization_support: false,
        payment_method_types: memberBalanceUsage ? ["Paid_by_Cash", "Member_Balance"] : ["Paid_by_Cash"],
        powerBy: powerBy,
        processing: null,
        receiptData: JSON.stringify(cleanProductData(localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [])),
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        store: store,
        storeOwnerId: user.uid,
        stripe_store_acct: acct,
        tableNum: selectedTable,
        transfer_data: null,
        transfer_group: null,
        uid: user.uid,
        user_email: user.email,
      });

      // Assuming SetTableInfo and SetTableIsSent are asynchronous and return promises
      // If they are not asynchronous, you can wrap their calls in Promise.resolve to treat them as promises
      const setTableInfoPromise = SetTableInfo(store + "-" + selectedTable, "[]");
      const setTableIsSentPromise = SetTableIsSent(store + "-" + selectedTable + "-isSent", "[]");

      // Execute all promises in parallel
      Promise.all([addDocPromise, setTableInfoPromise, setTableIsSentPromise]).then(() => {

        console.log("All operations completed successfully.");
      }).catch((error) => {
        console.error("Error executing operations:", error);
      });
      setProducts([]);
      setExtra(0)
      setInputValue("")
      setDiscount("")
      setTips("")
      setResult(null)
      // Clear member balance usage state
      setMemberBalanceUsage(null);
      setIsCashProcessing(false);
      localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time


    } catch (e) {
      console.error("Error adding document: ", e);
      setIsCashProcessing(false);
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
    // setIsTaxExempt(false); // reset
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

  // 自定义改价功能处理函数
  const handleCustomPriceClick = () => {
    let effectiveTargetSubtotalToShow;
    const originalItemsSubtotal = parseFloat(calculateOriginalTotalPrice());

    const surchargeItem = products.find(p => p.id === "SURCHARGE_ITEM");
    const currentDiscountValue = parseFloat(discount || 0);

    if (surchargeItem) {
      // If there's a surcharge, the target subtotal was the original items + surcharge amount
      effectiveTargetSubtotalToShow = originalItemsSubtotal + parseFloat(surchargeItem.itemTotalPrice);
    } else if (currentDiscountValue > 0) {
      // If there's a discount and no surcharge, the price was set lower.
      // We need to find out what the subtotal was *before* this discount was applied.
      // The discount = (originalItemsSubtotal - effectiveTargetSubtotalToShow_hypothetical) + taxPortion (if exempt)
      // So, effectiveTargetSubtotalToShow_hypothetical = originalItemsSubtotal - (currentDiscountValue - taxPortion)
      let priceDropPortionOfDiscount = currentDiscountValue;
      if (isTaxExempt) {
        const taxPortion = originalItemsSubtotal * (Number(TaxRate) / 100);
        priceDropPortionOfDiscount -= taxPortion;
      }
      // If priceDropPortionOfDiscount is negative, it means discount was all (or more than) tax, so target was originalItemsSubtotal
      if (priceDropPortionOfDiscount > 0) {
        effectiveTargetSubtotalToShow = originalItemsSubtotal - priceDropPortionOfDiscount;
      } else {
        effectiveTargetSubtotalToShow = originalItemsSubtotal; // Discount was purely from tax or other reasons not a price drop
      }
    } else {
      // No surcharge, no discount, so the target is just the original items subtotal
      effectiveTargetSubtotalToShow = originalItemsSubtotal;
    }

    effectiveTargetSubtotalToShow = Math.max(0, effectiveTargetSubtotalToShow); // Ensure not negative

    setCustomTotalPrice(effectiveTargetSubtotalToShow > 0 ? effectiveTargetSubtotalToShow.toFixed(2) : '');
    setModalTaxExempt(isTaxExempt); // Initialize modal's tax exempt state with current global state
    setIsCustomPriceModalOpen(true);
  };

  const handleCancelCustomPrice = () => {
    setCustomTotalPrice('');
    // setIsCustomPriceTaxExempt(isTaxExempt); // 移除
    setModalTaxExempt(false); // 重置弹窗内部免税状态
    setIsCustomPriceModalOpen(false);
  };

  // 计算真正的原始总价（排除加价商品）
  const calculateOriginalTotalPrice = () => {
    const originalProducts = products.filter(product =>
      !(product.name === fanyi("Surcharge!") && product.id === "SURCHARGE_ITEM")
    );
    const originalSubtotal = originalProducts.reduce((acc, item) =>
      item && parseFloat(item.itemTotalPrice) ? parseFloat(acc) + parseFloat(item.itemTotalPrice) : parseFloat(acc), 0
    );
    return originalSubtotal.toFixed(2);
  };

  const applyCustomPrice = (newPriceString, taxChoice) => {
    const newPriceTarget = parseFloat(newPriceString);

    if (newPriceString === null || newPriceString === undefined || newPriceString.trim() === '' || isNaN(newPriceTarget) || newPriceTarget < 0) {
      setCustomTotalPrice('');
      // No localStorage interaction

      setIsTaxExempt(taxChoice);

      const originalSubtotalForTax = parseFloat(calculateOriginalTotalPrice());
      const taxExemptionOnlyDiscount = taxChoice ? (originalSubtotalForTax * (Number(TaxRate) / 100)) : 0;
      setDiscount(taxExemptionOnlyDiscount > 0 ? taxExemptionOnlyDiscount.toFixed(2) : '');
      removeSurchargeProduct();
      return;
    }

    const formattedNewPrice = newPriceTarget.toFixed(2);
    setCustomTotalPrice(formattedNewPrice);
    setIsTaxExempt(taxChoice);

    // No localStorage interaction

    const originalSubtotal = parseFloat(calculateOriginalTotalPrice());
    const difference = newPriceTarget - originalSubtotal;

    let calculatedDiscount = 0;

    if (taxChoice) {
      const tempPrice = difference > 0 ? newPriceTarget : originalSubtotal;
      // Calculate tax exemption discount based on the *original item subtotal*
      const taxExemptionDiscountAmount = tempPrice * (Number(TaxRate) / 100);
      calculatedDiscount += taxExemptionDiscountAmount;
    }

    // Clear previous surcharge product before potentially adding a new one or setting a discount
    removeSurchargeProduct();

    if (difference < 0) {
      // Custom price is lower than original, this difference is an additional discount
      calculatedDiscount += Math.abs(difference);
    } else if (difference > 0) {
      // Custom price is higher, this difference is a surcharge
      // The discount, in this case, would only be from tax exemption, if applicable.
      addSurchargeProduct(difference);
    }
    // If difference is 0, 'calculatedDiscount' will correctly be just the tax exemption amount (if any)

    setDiscount(calculatedDiscount > 0 ? calculatedDiscount.toFixed(2) : '');
  };

  const addSurchargeProduct = (surchargeAmount) => {
    // 检查是否已存在加价商品
    const existingSurchargeIndex = products.findIndex(product =>
      product.name === fanyi("Surcharge!") && product.id === "SURCHARGE_ITEM"
    );

    let updatedProducts;
    const surchargeProduct = {
      id: "SURCHARGE_ITEM",
      name: fanyi("Surcharge!"),
      CHI: "加价！",
      image: "",
      subtotal: surchargeAmount,
      itemTotalPrice: surchargeAmount,
      quantity: 1,
      availability: true,
      attributesArr: {},
      attributeSelected: {},
      count: Date.now().toString() // 使用时间戳作为唯一标识
    };

    if (existingSurchargeIndex !== -1) {
      // 更新现有加价商品
      updatedProducts = products.map((product, index) =>
        index === existingSurchargeIndex ? surchargeProduct : product
      );
    } else {
      // 添加新的加价商品
      updatedProducts = [...products, surchargeProduct];
    }

    SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
  };

  const removeSurchargeProduct = () => {
    const updatedProducts = products.filter(product =>
      !(product.name === fanyi("Surcharge!") && product.id === "SURCHARGE_ITEM")
    );

    if (updatedProducts.length !== products.length) {
      SetTableInfo(store + "-" + selectedTable, JSON.stringify(updatedProducts));
    }
  };


  const [isMyModalVisible, setMyModalVisible] = useState(false);
  const [received, setReceived] = useState(false)
  const [isPaymentClick, setIsPaymentClick] = useState(false)

  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [isChangeTableModal, setChangeTableModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isCashProcessing, setIsCashProcessing] = useState(false);

  // Add keypadProps state
  const [keypadProps, setKeypadProps] = useState({
    numberPadValue: customAmount,
    onNumberPadChange: (newValue) => {
      setInputValue(newValue);
      setErrorMessage('');
      setResult(null);
    },
    onNumberPadConfirm: () => calculateResult(),
    onQuickAmountClick: (amount) => {
      setInputValue(amount.toString());
      setErrorMessage('');
      setResult(null);
    },
    key: "main-input", // Key for the main input field
    activeInputType: "main" // Type of the active input field
  });

  // Reset keypadProps to default values (linked to the main input field)
  const resetKeypadProps = () => {
    setKeypadProps({
      numberPadValue: inputValue,
      onNumberPadChange: (newValue) => {
        setInputValue(newValue);
        setErrorMessage('');
        setResult(null);
      },
      onNumberPadConfirm: () => calculateResult(),
      onQuickAmountClick: (amount) => {
        setInputValue(amount.toString());
        setErrorMessage('');
        setResult(null);
      },
      key: "main-input", // Key for the main input field
      activeInputType: "main" // Type of the main input field
    });
  };

  // Update numberPadValue in keypadProps
  useEffect(() => {
    if (keypadProps.numberPadValue === inputValue) {
      setKeypadProps(prev => ({
        ...prev,
        numberPadValue: inputValue
      }));
    }
  }, [inputValue]);

  // When custom tip amount is updated
  useEffect(() => {
    if (keypadProps.numberPadValue === customAmount) {
      setKeypadProps(prev => ({
        ...prev,
        numberPadValue: customAmount
      }));
    }
  }, [customAmount]);

  // Listen for reset-keypad events
  useEffect(() => {
    const handleResetKeypad = () => {
      resetKeypadProps();
    };

    window.addEventListener('reset-keypad', handleResetKeypad);

    return () => {
      window.removeEventListener('reset-keypad', handleResetKeypad);
    };
  }, [inputValue]);

  const openUniqueModal = () => {
    setUniqueModalOpen(true);
    resetKeypadProps(); // Reset keypadProps to default values
  };
  const closeUniqueModal = () => setUniqueModalOpen(false);

  // 检查是否有未结台的桌子
  const checkUnfinishedTables = () => {
    const currentProducts = products || [];
    const unfinishedTables = currentProducts.filter(product =>
      product.isTableItem &&
      product.attributeSelected &&
      product.attributeSelected['开台商品'] &&
      localStorage.getItem(`${store}-${product.id}-${product.count}-isSent_startTime`)
    );

    return unfinishedTables.length > 0;
  };

  // Handle payment pre-check
  const handlePaymentClick = (paymentAction) => {
    if (checkUnfinishedTables()) {
      setPendingPaymentAction(paymentAction);
      setShowUnfinishedTableWarning(true);
    } else {
      // Execute payment directly
      executePayment(paymentAction);
    }
  };

  // Execute payment operation
  const executePayment = async (paymentAction) => {
    // Validate member balance before any payment if balance is being used
    if (memberBalanceUsage && (paymentAction === 'card' || paymentAction === 'cash')) {
      console.log('🔍 Validating member balance before payment...');
      try {
        const validationResult = await MemberPaymentAPI.validateBalanceUsage(
          memberBalanceUsage.memberPhone,
          parseFloat(memberBalanceUsage.balanceToUse),
          store
        );
        console.log('✅ Balance validation successful before payment:', validationResult);
      } catch (validationError) {
        console.error('❌ Balance validation failed before payment:', validationError);
        setErrorToast({
          show: true,
          message: validationError.message || 'Balance validation failed'
        });
        setTimeout(() => setErrorToast({ show: false, message: '' }), 4000);
        return; // Stop payment if validation fails
      }
    }

    if (paymentAction === 'card') {
      setMyModalVisible(true);
      SendToKitchen();
    } else if (paymentAction === 'cash') {
      openUniqueModal();
      SendToKitchen();
      setInputValue("");
      setResult(null);
      setExtra(0);
    } else if (paymentAction === 'member_balance') {
      // Member balance payment - open member payment flow
      setShowMemberPayment(true);
      SendToKitchen(); // Send order to kitchen before payment processing
    }
  };

  // Handle member balance usage confirmation (no deduction, only record)
  const handleMemberPaymentComplete = (result) => {
    setShowMemberPayment(false);

    if (result.type === 'balance_usage') {
      // Record member balance usage information (similar to discount)
      setMemberBalanceUsage(result);

      // Save verification state for direct use when modifying amount next time
      if (result.memberPhone) {
        setVerifiedMemberPhone(result.memberPhone);
      }

      // Show confirmation message
      const message = `${memberT('Balance Discount')}: $${result.balanceToUse.toFixed(2)}`;
      setToastMessage(message);
      setShowToast(true);

      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  // Handle member payment cancellation
  const handleMemberPaymentCancel = () => {
    setShowMemberPayment(false);
  };

  // Clear cart and redirect (utility function)
  const clearCartAndRedirect = () => {
    // Clear cart data
    localStorage.removeItem(store + "-" + selectedTable);
    setProducts([]);

    // Reset member balance usage state
    setMemberBalanceUsage(null);

    // You can add redirect logic here if needed
    // window.location.href = '/success';
  };

  // 关闭警告弹窗，用户需要先去结台
  const closeWarningAndEndTables = () => {
    setShowUnfinishedTableWarning(false);
    setPendingPaymentAction(null);
    // 这里可以添加跳转到结台页面的逻辑
    // 或者显示未结台商品的列表
  };

  // Effect for closing number pad removed - now controlled by KeypadModal

  const handleChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow positive numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      // Maintain original format even with decimal at the end
      setInputValue(value);
    }
    setErrorMessage(``)

    setResult(null);
  };

  const handleCustomAmountChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow positive numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
    }
  };


  const calculateResult = () => {
    // For input ending with decimal point, temporarily add 0 for calculation
    let valueToCheck = inputValue;
    if (inputValue.endsWith('.')) {
      valueToCheck = inputValue + '0'; // Add 0 to make it a valid number
    }

    const x = parseFloat(valueToCheck);
    if (!isNaN(x) && x > finalPrice) {
      setResult(x);
    } else {
      setErrorMessage(`Please enter a number greater than total amount`);
      // Keep the input value to allow user to continue editing
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

  // NumberPad state management code removed - now handled by KeypadModal

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
    ///combine toble


    SetTableInfo(`${store}-${table_name}`, JSON.stringify(groupAndSumItems(
      [...JSON.parse(localStorage.getItem(`${store}-${selectedTable}`)), ...JSON.parse(localStorage.getItem(`${store}-${table_name}`))]
    )))
    SetTableInfo(`${store}-${selectedTable}`, JSON.stringify([]))
    SetTableIsSent(`${store}-${table_name}-isSent`, JSON.stringify(groupAndSumItems(
      [...JSON.parse(localStorage.getItem(store + "-" + selectedTable + "-isSent")), ...JSON.parse(localStorage.getItem(store + "-" + table_name + "-isSent"))])
    ))
    SetTableIsSent(`${store}-${selectedTable}-isSent`, JSON.stringify([]))

  };


  //   {startTimeDisplay && (
  //     <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
  //       Start time: <span className="notranslate text-blue-600">{startTimeDisplay}</span>
  //     </div>
  //   )}

  //   {/* Display Dining Duration */}
  // {diningDuration && (
  //   <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
  //     Elapsed time: <span className="notranslate text-green-600">{diningDuration}</span>
  //   </div>
  // )}
  // console.log("Products from instroe_shop_cart", products)
  return (

    <div>

      <div class=''>
        <div className="mb-1 p-2 border-b-2 bg-white space-y-3">
          <div className="flex justify-between w-full">
            <div className="text-left">
              {startTimeDisplay && (
                <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Start")}: <span className="notranslate">{startTimeDisplay}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              {diningDuration && (
                <div className={`${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Duration")}: <span className="notranslate">{diningDuration}</span>
                </div>
              )}
            </div>
          </div>


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
                  {fanyi("Service Fee")}: <span className="notranslate text-green-600">${stringTofixed(tips)}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-right notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'} flex items-center justify-end gap-2`}>
                <span>
                  {fanyi("Tax")}:<span className="notranslate text-blue-600">${stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100))}</span>
                </span>
                <button
                  onClick={() => {
                    const taxAmount = Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100;
                    if (!isTaxExempt) {
                      // 添加免税折扣
                      setDiscount(taxAmount.toString());
                      setIsTaxExempt(true);
                    } else {
                      // 取消免税，清除折扣
                      setDiscount('');
                      setIsTaxExempt(false);
                    }
                  }}
                  className={`btn btn-sm px-2 py-1 text-xs ${isTaxExempt ? 'btn-success' : 'btn-secondary'}`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isTaxExempt ? fanyi('✓ Tax Exempt') : fanyi('Tax Exempt')}
                </button>
              </div>
            </div>
          </div>
          {/* Discount Section */}
          {discount && (
            <div className="flex w-full">
              <div className="text-left">
                <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'}`}>
                  {fanyi("Disc.")}: <span className="notranslate text-red-600">${stringTofixed(discount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Member Balance Section */}
          {memberBalanceUsage && (
            <div className="flex w-full">
              <div className="text-left">
                <div className={`notranslate ${!isMobile ? 'text-lg font-semibold' : 'font-medium'} flex items-center`}>
                  {memberT("Balance Discount")}: <span className="notranslate text-orange-600">${stringTofixed(memberBalanceUsage.balanceToUse)}</span>
                  <button
                    onClick={() => setShowMemberPayment(true)}
                    className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                    style={{ fontSize: '10px' }}
                  >
                    {memberT("Edit")}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between w-full">
            <div className="text-left">
            </div>
            <div className="text-left">
              <div className={`text-right notranslate ${!isMobile ? 'text-lg font-bold' : 'font-semibold'}`}>
                {fanyi("Total")}: <span className="notranslate text-red-600">${stringTofixed(finalPrice)}</span>
              </div>
            </div>
          </div>

        </div>
        <div className="flex w-full">

          <div className={`flex-grow flex-shrink overflow-auto ${!isMobile ? 'm-2' : 'm-2'}`} style={{ minWidth: "150px", maxWidth: "calc(100vw - 180px)" }} >

            <div style={{ overflowY: 'auto', height: `calc(100vh - 355px)` }} >
              {(Array.isArray(products) ? products : []).map((product) => (
                // the parent div
                // can make the parent div flexbox
                <div className="cart-item bg-white rounded-lg shadow-sm p-2 mb-2">
                  <div className='flex items-start'>
                    <DeleteSvg className='delete-btn mt-1 ml-1 mr-3 cursor-pointer' style={{ width: '20px', flexShrink: 0 }}
                      onClick={() => {
                        handleDeleteClick(product.id, product.count)
                      }}></DeleteSvg>
                    <div className={`flex flex-col w-full ${!isMobile ? 'text-lg' : ''} notranslate`}>
                      <div className="flex justify-between w-full">
                        <span className="product-title" style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                          {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? t(product?.CHI) : (product?.name)}
                        </span>
                        <span className="product-price ml-2" style={{ flexShrink: 0 }}>${(Math.round(product.itemTotalPrice * 100) / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className='pl-8 mt-1'>
                    <div className="mb-2">
                      <span className="notranslate text-gray-600 text-sm">
                        {Object.entries(product.attributeSelected)
                          .map(([key, value]) => {
                            // 如果是开台商品的特殊属性，显示友好的信息
                            if (key === '开台商品') {
                              const tableItems = value;
                              if (Array.isArray(tableItems) && tableItems.length > 0) {
                                const itemValue = tableItems[0];
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
                                return itemValue; // Fallback
                              }
                            }
                            // 其他属性正常显示
                            return Array.isArray(value) ? value.join(' ') : value;
                          })
                          .join(' ')
                        }
                      </span>
                    </div>

                    <div className="quantity-section">
                      {/* 一行布局：按钮在左，数量控制在右，空间不够时自动换行 */}
                      <div className="flex flex-wrap gap-2 justify-between items-center">
                        {/* 左侧按钮组 */}
                        <div className="flex flex-wrap gap-1">
                          {!product.CHI.includes("开台") ?

                            <button
                              onClick={() => {
                                setOpenChangeAttributeModal(product)
                              }}
                              className="btn btn-outline-dark btn-sm d-flex align-items-center"
                              style={{ whiteSpace: 'nowrap', height: '30px', fontSize: '15px', padding: '2px 8px' }}
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Edit
                            </button> : <></>}
                          {/* 开台/结台按钮 */}
                          {localStorage.getItem(`${store}-${product.id}-${product.count}-isSent_startTime`) && (
                            <button
                              onClick={() => {
                                // 创建商品对象用于结台
                                const tableItemData = {
                                  id: product.id,
                                  name: product.name,
                                  CHI: product.CHI || product.name, // Ensure CHI name is passed
                                  // IMPORTANT: Ensure product.subtotal here is the HOURLY RATE for the item
                                  // If product.subtotal is modified after a previous timing, this might be wrong.
                                  // It's safer to have a dedicated field like product.hourlyRate
                                  subtotal: parseFloat(product.subtotal) || 0,
                                  image: product.image,
                                  attributeSelected: product.attributeSelected || {},
                                  count: product.count, // Essential for unique identification and timer lookup
                                  // quantity: product.quantity, // Not directly used by modal for rate calculation if subtotal is hourly rate
                                  // isTableItem: product.isTableItem, // Pass if used by handleTableEnd or for other logic
                                };
                                setSelectedTableItem(tableItemData);
                                setIsTableTimingModalOpen(true);
                              }}
                              className="btn btn-outline-danger btn-sm d-flex align-items-center"
                              style={{ whiteSpace: 'nowrap', height: '30px', fontSize: '15px', padding: '2px 8px' }}
                            >
                              <i className="bi bi-stop-circle me-1"></i>
                              {fanyi("End Table")}
                            </button>
                          )}
                        </div>

                        {/* 右侧数量控制 */}
                        <div className="quantity-control flex-shrink-0">
                          <button className="minus-btn" type="button" name="button"
                            onClick={() => {
                              if (product.quantity === 1) {
                                handleDeleteClick(product.id, product.count);
                              } else {
                                handleMinusClick(product.id, product.count)
                              }
                            }}>
                            <MinusSvg style={{ width: '12px', height: '12px' }} alt="" />
                          </button>

                          <span className='notranslate'>{product.quantity}</span>

                          <button className="plus-btn" type="button" name="button"
                            onClick={() => {
                              handlePlusClick(product.id, product.count)
                            }}>
                            <PlusSvg style={{ width: '12px', height: '12px' }} alt="" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              ))}

            </div>

          </div>
          <div className='flex flex-col space-y-2 flex-shrink-0' style={
            isMobile ? {
              width: "120px",
              maxHeight: isViewOrdersMode ? "calc(100vh - 180px)" : "calc(100vh - 280px)",
              overflowY: "auto"
            } : {
              width: "150px",
              maxHeight: "calc(100vh - 150px)",
              overflowY: "auto"
            }
          }>
            {/* Display Start Time */}
            <a
              onClick={() => { SendToKitchen(); setChangeTableModal(true); }}
              className="mt-3 bg-white btn btn-sm btn-link mx-1 border-black"
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

            {/* <a
              onClick={handleAddDiscountClick}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Add Discount")}</span>
            </a> */}

            <a
              onClick={handleCustomPriceClick}
              className="mt-3 btn btn-sm btn-purple mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#6f42c1', color: 'white' }}
            >

              <span className='notranslate'>{fanyi("Adjust Total")}</span>
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
              onClick={() => { SendToKitchen(); MarkAsUnPaid(); }}
              className="mt-3 bg-white btn btn-sm btn-outline-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Mark as Unpaid")}</span>
            </a>
            <a
              onClick={() => handlePaymentClick('card')}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Card Pay")}</span>
            </a>

            <a
              onClick={() => handlePaymentClick('cash')}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >

              <span className='notranslate'>{fanyi("Cash Pay")}</span>
            </a>

            {/* Member Balance Payment Button */}
            {memberBalanceUsage ? (
              <a
                onClick={() => {
                  setMemberBalanceUsage(null);
                  setVerifiedMemberPhone(null); // Clear verification state, can restart next time
                }}
                className="mt-3 btn btn-sm mx-1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  backgroundColor: '#6b7280', // Gray color for cancel
                  color: 'white',
                  border: 'none'
                }}
              >
                <span className='notranslate'>{memberT("Cancel Balance Usage")}</span>
              </a>
            ) : (
              <a
                onClick={() => handlePaymentClick('member_balance')}
                className="mt-3 btn btn-sm mx-1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  backgroundColor: '#9e2820', // Deep red color for member balance
                  color: 'white',
                  border: 'none'
                }}
              >
                <span className='notranslate'>{fanyi("Use Balance") || memberT("Use Balance")}</span>
              </a>
            )}
          </div>
        </div>
        <div>
        </div>
      </div>
      {/* popup content */}
      <div style={{ margin: "auto", height: "fit-content" }}>

        <div className="flex flex-col flex-row">
          {isUniqueModalOpen && (
            <KeypadModal
              isOpen={isUniqueModalOpen}
              onClose={() => {
                setUniqueModalOpen(false);
                setInputValue("");
                setResult(null);
                setExtra(0);
              }}
              headerContent={
                <a
                  onClick={() => { OpenCashDraw(); }}
                  className="mt-3 btn btn-md btn-info"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                >
                  <span>Open Cash Drawer</span>
                </a>
              }
              showCloseButton={true}
              numberPadValue={keypadProps.numberPadValue}
              onNumberPadChange={keypadProps.onNumberPadChange}
              onNumberPadConfirm={keypadProps.onNumberPadConfirm}
              onQuickAmountClick={keypadProps.onQuickAmountClick}
              activeInputType={keypadProps.activeInputType}
              showOneHundred={true}
            >
              <div>
                <p className="mb-2">{fanyi("Enter the Cash Received")}</p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={handleChange}
                  style={uniqueModalStyles.inputStyle}
                  className="mb-4 p-2 w-full border rounded-md"
                  translate="no"
                  ref={cashPayInputRef}
                  onClick={() => {
                    // When clicking the main input field, reset keypadProps
                    resetKeypadProps();
                  }}
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

                <p className="mb-4">{fanyi("Gratuity")}:</p>
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
                        onClick={() => {
                          // When clicking the custom tip input field, modify association to custom tip input
                          setKeypadProps({
                            // Use the current value of custom tip
                            numberPadValue: customAmount,
                            onNumberPadChange: (newValue) => {
                              setCustomAmount(newValue);
                            },
                            onNumberPadConfirm: () => {
                              calculateCustomAmount(customAmount);
                            },
                            onQuickAmountClick: (amount) => {
                              setCustomAmount(amount.toString());
                            },
                            key: "custom-amount", // Key for the custom tip input field
                            activeInputType: "custom" // Type of the custom tip input field
                          });
                        }}
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
                  <p className="mt-4">{fanyi("Gratuity")}: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                )}
                <p className="mt-1">{fanyi("Receivable Payment")}: <span className='notranslate'>${finalPrice}</span> </p>

                {result !== null && (
                  <div>
                    <p className="mt-1 mb-4 ">
                      {fanyi("Give Back Cash")}: <span className='notranslate'>${Math.round((result - finalPrice) * 100) / 100}</span>
                    </p>
                    <button
                      onClick={() => {
                        setCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                        calculateCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                        CashCheckOut(
                          Math.round((result - finalPrice + extra) * 100) / 100,
                          stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                          inputValue
                        );
                        closeUniqueModal();
                      }}
                      disabled={isCashProcessing}
                      style={uniqueModalStyles.buttonStyle}
                      className={`notranslate mt-2 mb-2 text-white px-4 py-2 rounded-md w-full ${isCashProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500'}`}
                    >
                      {fanyi("Collect")} ${stringTofixed(Math.round(inputValue * 100) / 100)},
                      {fanyi("including")} ${Math.round((result - finalPrice + extra) * 100) / 100}
                      {fanyi("Gratuity")}.
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    CashCheckOut(
                      extra,
                      stringTofixed((Math.round(100 * totalPrice * (Number(TaxRate) / 100)) / 100)),
                      finalPrice
                    );
                    closeUniqueModal();
                  }}
                  disabled={isCashProcessing}
                  style={uniqueModalStyles.buttonStyle}
                  className={`notranslate mt-2 mb-2 text-white px-4 py-2 rounded-md w-full ${isCashProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500'}`}
                >
                  {fanyi("Collect")} ${stringTofixed(finalPrice)},
                  {fanyi("including")} ${Math.round((extra) * 100) / 100}
                  {fanyi("Gratuity")}.
                </button>
              </div>
            </KeypadModal>
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
                    <Dnd_Test store={store} acct={acct} selectedTable={selectedTable} key={dndTestKey} main_input={products}
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
                        onClick={() => {
                          mergeProduct(option); setChangeTableModal(false);
                          localStorage.setItem(`${store}-${option}-isSent_startTime`, localStorage.getItem(`${store}-${selectedTable}-isSent_startTime`)); // Clear start time
                          localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
                        }}
                        style={{ backgroundColor: '#966f33' }}
                      >
                        {option}
                      </button>

                    ))}
                    <hr></hr>
                    <div>Dining Desk(s) in Use:</div>
                    {arrOccupied.map((option) => (

                      <button
                        key={option}
                        type="button"
                        className="btn btn-primary mb-2 mr-2 notranslate"
                        onClick={() => {
                          mergeProduct(option); setChangeTableModal(false);
                          localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
                        }}
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

                    <PaymentRegular setDiscount={setDiscount} setTips={setTips} setExtra={setExtra} setInputValue={setInputValue} setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store}
                      chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} totalPrice={Math.round(totalPrice * 100)}
                      memberBalanceUsage={memberBalanceUsage} setMemberBalanceUsage={setMemberBalanceUsage}
                      onError={(message) => {
                        setErrorToast({ show: true, message });
                        setTimeout(() => setErrorToast({ show: false, message: '' }), 4000);
                      }} />
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
            <KeypadModal
              isOpen={isTipsModalOpen}
              onClose={() => setTipsModalOpen(false)}
              title={fanyi("Add Service Fee")}
              numberPadValue={tips}
              onNumberPadChange={(newValue) => {
                // Handle decimal point input
                setTips(newValue);
              }}
              onNumberPadConfirm={(confirmedValue) => {
                // Process value when confirming
                let valueToConfirm = confirmedValue;
                setTips(valueToConfirm);
                setTipsModalOpen(false);
              }}
              onQuickAmountClick={(amount) => {
                setTips(amount.toString());
              }}
            >
              <div>
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
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter service fee by amount"
                  value={tips}
                  className="form-control tips-no-spinners"
                  onChange={(e) => {
                    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

                    // Only allow numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                      setTips(value.toString());  // Update the state with the raw input value
                      setSelectedTipPercentage(null);
                    }
                  }}
                  ref={serviceFeeInputRef}
                  translate="no"
                />
                <div className="mt-4 text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={() => handleCancelTip()}>
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> {fanyi("Cancel Add")}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setTipsModalOpen(false)}>
                    {fanyi("Add Service Fee")}
                  </button>
                </div>
              </div>
            </KeypadModal>
          )}

          {isDiscountModalOpen && (
            <KeypadModal
              isOpen={isDiscountModalOpen}
              onClose={() => setDiscountModalOpen(false)}
              title={fanyi("Add Discount")}
              numberPadValue={discount}
              onNumberPadChange={(newValue) => {
                // Handle decimal point input
                applyDiscount(newValue);
              }}
              onNumberPadConfirm={(confirmedValue) => {
                // Process value when confirming
                let valueToConfirm = confirmedValue;
                applyDiscount(valueToConfirm);
                setDiscountModalOpen(false);
              }}
              onQuickAmountClick={(amount) => {
                // Use the button amount value directly
                setDiscount(amount.toString());
              }}
            >
              <div>
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
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter discount by amount"
                  value={discount}
                  className="form-control tips-no-spinners"
                  onChange={(e) => {
                    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

                    // Only allow numbers and decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                      applyDiscount(value);
                      setSelectedTipPercentage(null);
                    }
                  }}
                  ref={discountInputRef}
                  translate="no"
                />

                <div className="mt-4 text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={handleCancelDiscount}>
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> {fanyi("Cancel Add")}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setDiscountModalOpen(false)}>
                    {fanyi("Add Discount")}
                  </button>
                </div>
              </div>
            </KeypadModal>
          )}

          {/* 自定义改价弹窗 */}
          {isCustomPriceModalOpen && (
            <KeypadModal
              isOpen={isCustomPriceModalOpen}
              onClose={handleCancelCustomPrice} // 使用 handleCancelCustomPrice 来确保状态正确重置
              title={fanyi("Adjust Total")}
              numberPadValue={customTotalPrice} // 这个值由弹窗打开时设置，或者用户输入时更新
              onNumberPadChange={(newValue) => {
                // 用户在数字键盘上输入时，只更新 customTotalPrice state
                // applyCustomPrice 不在这里调用，只在用户确认或点击免税/百分比按钮时调用
                setCustomTotalPrice(newValue);
              }}
              onNumberPadConfirm={(confirmedValue) => {
                // 只有当用户通过数字键盘确认时，我们才用 confirmedValue
                // 如果 confirmedValue 是空的（例如，用户直接点确认没改数字），我们用 customTotalPrice 当前的值
                const valueToApply = confirmedValue === '' ? customTotalPrice : confirmedValue;
                applyCustomPrice(valueToApply); // 应用价格，这个函数会处理折扣/加价
                setIsCustomPriceModalOpen(false); // 关闭弹窗
              }}
              onQuickAmountClick={(amount) => {
                setCustomTotalPrice(amount.toString());
                applyCustomPrice(amount.toString()); // 快捷金额也立即应用
              }}
            >
              <div>
                {/* 修改前总价和修改后总价显示 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">{fanyi("Original Total")}:</span>
                    <span className="text-lg font-semibold text-gray-800 notranslate">
                      ${stringTofixed(calculateOriginalTotalPrice())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{fanyi("New Total")}:</span>
                    <span className="text-lg font-semibold text-purple-600 notranslate">
                      ${customTotalPrice ? stringTofixed(parseFloat(customTotalPrice)) : stringTofixed(calculateOriginalTotalPrice())}
                    </span>
                  </div>
                  {customTotalPrice && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      {(() => {
                        const originalDisplaySubtotal = calculateOriginalTotalPrice();
                        const newDisplaySubtotal = parseFloat(customTotalPrice);
                        if (isNaN(newDisplaySubtotal)) return null; // 如果输入无效，不显示差额
                        const differenceDisplay = newDisplaySubtotal - originalDisplaySubtotal;
                        if (Math.abs(differenceDisplay) < 0.001) return null; // 差额太小也不显示
                        const isHigherDisplay = differenceDisplay > 0;
                        return (
                          <>
                            {isHigherDisplay ? (
                              <span className="text-sm font-medium text-green-600 notranslate">{fanyi("Surcharge!")}:</span>
                            ) : (
                              <span className="text-sm font-medium text-red-600 notranslate">{fanyi("Discount")}:</span>
                            )}
                            <span className={`text-sm font-semibold ${isHigherDisplay ? 'text-green-600' : 'text-red-600'} notranslate`}>
                              {isHigherDisplay ? '+' : '-'}${stringTofixed(Math.abs(differenceDisplay))}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Discount Percentage Buttons */}
                <div className="mb-3 d-flex justify-content-around">
                  <button
                    onClick={() => handlePercentageDiscount(0.95)}
                    className="btn btn-success btn-sm flex-grow-1 mx-1"
                    style={{ borderRadius: '0.375rem', color: 'white', backgroundColor: '#28a745', borderColor: '#28a745' }}
                  >
                    {fanyi("5% Off")}
                  </button>
                  <button
                    onClick={() => handlePercentageDiscount(0.85)}
                    className="btn btn-success btn-sm flex-grow-1 mx-1"
                    style={{ borderRadius: '0.375rem', color: 'white', backgroundColor: '#28a745', borderColor: '#28a745' }}
                  >
                    {fanyi("15% Off")}
                  </button>
                  <button
                    onClick={() => handlePercentageDiscount(0.75)}
                    className="btn btn-success btn-sm flex-grow-1 mx-1"
                    style={{ borderRadius: '0.375rem', color: 'white', backgroundColor: '#28a745', borderColor: '#28a745' }}
                  >
                    {fanyi("25% Off")}
                  </button>
                </div>

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={fanyi("Enter new total price")}
                  value={customTotalPrice}
                  className="form-control tips-no-spinners"
                  onChange={(e) => {
                    let value = e.target.value.replace(/。/g, '.');
                    if (/^\d*\.?\d*$/.test(value)) {
                      setCustomTotalPrice(value);
                      // applyCustomPrice(value); // 不在输入时实时应用，避免频繁计算
                    }
                  }}
                  translate="no"
                />

                {/* 免税按钮 */}
                <div className="mt-4 mb-4">
                  <button
                    onClick={() => {
                      // 只修改弹窗内部状态，不立即应用到全局
                      setModalTaxExempt(!modalTaxExempt);
                    }}
                    className={`btn btn-sm px-3 py-2 ${modalTaxExempt ? 'btn-success' : 'btn-secondary'} w-full`}
                  >
                    {modalTaxExempt ? fanyi('✓ Tax Exempt') : fanyi('Tax Exempt')}
                  </button>
                </div>

                <div className="mt-4 text-right">
                  <button type="button" className="btn btn-secondary mr-2" onClick={handleCancelCustomPrice}>
                    <FontAwesomeIcon icon={faTimes} className="mr-1" /> {fanyi("Cancel Add")}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: '#6f42c1', color: 'white' }}
                    onClick={() => {
                      // Pass the modal's current tax choice (modalTaxExempt) to applyCustomPrice
                      applyCustomPrice(customTotalPrice, modalTaxExempt);
                      setIsCustomPriceModalOpen(false); // Close the modal
                    }}
                  >
                    {fanyi("Adjust Total")}
                  </button>
                </div>
              </div>
            </KeypadModal>
          )}
        </div>


      </div>
      {/* Standalone NumberPad component removed - now integrated in KeypadModal */}

      {/* 开台计时弹窗 */}
      <TableTimingModal
        isOpen={isTableTimingModalOpen}
        onClose={() => {
          setIsTableTimingModalOpen(false);
          setSelectedTableItem(null);
        }}
        selectedTable={selectedTable}
        store={store}
        tableItem={selectedTableItem}
        onTableStart={handleTableStartFromCart}
        onTableEnd={handleTableEnd}
        onRemarksUpdate={SetTableInfo} // 传递SetTableInfo函数用于保存备注到数据库
        fanyi={fanyi} // Pass the fanyi function as a prop
      />

      {/* 未结台警告弹窗 */}
      {showUnfinishedTableWarning && (
        <div className="confirmation-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="confirmation-dialog" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            minWidth: '350px',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid #ddd'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#dc3545'
            }}>
              {fanyi("Unfinished Tables Warning")}
            </h3>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#666'
            }}>
              {fanyi("There are unfinished tables that need to be ended before payment.")}
            </p>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '12px',
              color: '#999'
            }}>
              {fanyi("Please end all tables first, then proceed with payment.")}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={closeWarningAndEndTables}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                {fanyi("OK")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Member Payment Modal */}
      <SimpleMemberPayment
        isOpen={showMemberPayment}
        totalAmount={priceAfterDiscount || totalPrice}
        orderItems={products}
        storeId={store}
        tableNum={selectedTable}
        onPaymentComplete={handleMemberPaymentComplete}
        onClose={handleMemberPaymentCancel}
        verifiedMemberPhone={verifiedMemberPhone}
        onVerifiedPhoneChange={setVerifiedMemberPhone}
        currentBalanceUsage={memberBalanceUsage} // Current balance usage state
      />

      {/* Error Toast Notification */}
      {errorToast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            maxWidth: '400px',
            wordWrap: 'break-word'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', lineHeight: '1.4' }}>{errorToast.message}</span>
            <button
              style={{
                marginLeft: '15px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0'
              }}
              onClick={() => setErrorToast({ show: false, message: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification for Member Payment */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '300px',
            fontSize: '14px',
            lineHeight: '1.4'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ whiteSpace: 'pre-line', flex: 1 }}>
              {toastMessage}
            </div>
            <button
              onClick={() => setShowToast(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                marginLeft: '10px',
                padding: '0',
                lineHeight: '1'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}


    </div>
  )
}

export default Navbar

