import { React, useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { useDroppable, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import Button from 'react-bootstrap/Button';
import { round2digtNum } from "../utils";

import { ReactComponent as PlusSvg } from './plus.svg';
import { ReactComponent as MinusSvg } from './minus.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import PaymentSplit from "../pages/PaymentSplit";
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import NumberPad from '../components/NumberPad'; // Import NumberPad component
import KeypadModal from '../components/KeypadModal'; // Import KeypadModal component

// function Item({ heading, description })


function Item({ item, updateItems, whole_item_groups, numberOfGroups }) {

  // 清理商品数据中的开台时间信息用于显示
  const cleanItemForDisplay = (item) => {
    const cleanedItem = { ...item };
    
    // 如果商品有attributeSelected且包含开台商品属性
    if (cleanedItem.attributeSelected && cleanedItem.attributeSelected['开台商品']) {
        const tableItems = cleanedItem.attributeSelected['开台商品'];

        const cleanedTableItems = tableItems.map(attr => {
            if (typeof attr === 'string' && attr.startsWith('开台时间-')) {
                const parts = attr.split('-');
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
            return attr;
        }).filter((attr, index, arr) => arr.indexOf(attr) === index); // 去重
      
        cleanedItem.attributeSelected = {
            ...cleanedItem.attributeSelected,
            '开台商品': cleanedTableItems
        };
    }
    
    return cleanedItem;
  };

  function flattenAttributes(attributes) {
    function flattenObject(obj, prefix = "") {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const currentKey = key;

        if (Array.isArray(value)) {
          // If the value is an array, join its elements and add to the result
          const flattenedArray = value.join(" ");
          return acc + flattenedArray + "<br />";
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // If the value is an object, recursively flatten it
          return acc + flattenObject(value, currentKey);
        } else {
          // If the value is neither an object nor an array, add it to the result
          return acc + value + "<br />";
        }
      }, "");
    }

    return flattenObject(attributes).trim();
  }

  function generateAttributes(attributes) {
    const attributeString = flattenAttributes(attributes);
    if (attributeString === "") {
      return null; // Return null if there are no attributes
    } else {
      return (
        <div dangerouslySetInnerHTML={{ __html: attributeString }} />
      );
    }
  }

  // 使用清理后的商品数据进行显示
  const displayItem = cleanItemForDisplay(item);

  return (
    <div className="w-full flex flex-col gap-2 rounded-md bg-white p-4 border-1 border-gray-800">
      {/* <p className="font-bold text-2xl">{heading}</p>
      <p className="text-gra7-700 font-thin">{description}</p> */}
      {/* <p className="font-bold text-2xl">{item.name}</p> */}
      <span className="notranslate">

        {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? (displayItem?.CHI) : (displayItem?.name)}&nbsp;x&nbsp;
        <b>{
          Math.round((Math.round(displayItem.quantity) / Math.round(numberOfGroups)) * 100) / 100
        }</b>

        {generateAttributes(displayItem.attributeSelected)}
      </span>
      {/* <p className="font-bold text-2xl">{item.quantity}</p> */}
    </div>
  );
}


function SortableItem(props) {
  const { id, item, updateItems, whole_item_groups, numberOfGroups } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${Math.round(
        transform.y
      )}px, 0) scaleX(${transform.scaleX})`
      : "",
    transition
  };

  // console.log("sortableItem: ", whole_item_groups)
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item id={id} item={item} updateItems={updateItems} whole_item_groups={whole_item_groups} numberOfGroups={numberOfGroups}
      />
    </div>
  );
}

// Popup component
function ConfirmationPopup({ onConfirm, onCancel }) {
  return (
    <div className="popup">
      <p>Are you sure you want to delete?</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

// 添加cleanProductData函数
const cleanProductData = (products) => {
  return products.map(product => {
    const cleanedProduct = { ...product };
    
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
            return item;
        }).filter((item, index, arr) => arr.indexOf(item) === index); // 去重
      
        cleanedProduct.attributeSelected = {
            ...cleanedProduct.attributeSelected,
            '开台商品': cleanedTableItems
        };
    }
    
    return cleanedProduct;
  });
};

function Container(props) {
  const [products, setProducts] = useState([]);
  const { isPaidArray, setIsPaidArray } = props;

  const store = props.store
  const selectedTable = props.selectedTable
  const acct = props.acct
  const TaxRate = props.TaxRate
  console.log("TaxRate")
  console.log(TaxRate)
  const { user, user_loading } = useUserContext();
  const [isMyModalVisible, setMyModalVisible] = useState(false);
  const [received, setReceived] = useState(false)
  const [isPaymentClick, setIsPaymentClick] = useState(false)


  const [isUniqueModalOpen, setUniqueModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [result, setResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  // Add keypadProps state
  const [keypadProps, setKeypadProps] = useState({
    numberPadValue: "",
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

  const openUniqueModal = () => {
    setUniqueModalOpen(true);
    resetKeypadProps(); // Reset keypadProps to default values
  };
  const closeUniqueModal = () => setUniqueModalOpen(false);

  const [isCustomAmountVisible, setCustomAmountVisible] = useState(false);

  const [extra, setExtra] = useState(0);


  const [finalPrice, setFinalPrice] = useState(0);
  const [isTipsModalOpen, setTipsModalOpen] = useState(false);
  const [tips, setTips] = useState('');

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
    const calculatedTip = subtotal * percentage;
    setTips(calculatedTip.toFixed(2)); // This will keep the tip value to two decimal places
    setSelectedTipPercentage(percentage);
  }

  const handleCustomPercentageChange = (e) => {
    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomPercentage(value);
      const calculatedTip = subtotal * (Number(value) / 100);
      setTips(calculatedTip.toFixed(2));
      setSelectedTipPercentage(null);
    }
  }

  const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
  const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState(null);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");
  const [discount, setDiscount] = useState('');

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
    setDiscount(value);
  };

  const handleDiscountPercentage = (percentage) => {
    if (percentage < 0) {
      percentage = 0;
    }
    const calculatedDiscount = subtotal * percentage;
    setDiscount(calculatedDiscount.toFixed(2));
    setSelectedDiscountPercentage(percentage);
  }

  const handleCustomDiscountPercentageChange = (e) => {
    let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomDiscountPercentage(value);
      const calculatedDiscount = subtotal * (Number(value) / 100);
      setDiscount(calculatedDiscount.toFixed(2));
      setSelectedDiscountPercentage(null);
    }
  }

  // containerId ** is the key of this specific group in the whole_item_groups
  // items ** has all the items in JSON object of the curent group
  // (no longer used) checkout ** is a function from dnd_test that calculates the total
  // (no longer used) updateItems ** is a function from dnd_test that allows you to change whole_item_groups
  // whole_item_groups ** is a JSON object consist of the whole dnd_test groups and its objects
  // number of Groups ** is the group divisor number for all the items (IE: food x 1 / 4 or pasta x 2 / 4)
  // dirty ** is a boolean indicator whether or not something has been changed such as an element has been dragged
  const { containerId, items, handleDelete, checkout, updateItems, whole_item_groups, numberOfGroups, dirty, activeId } = props;

  // console.log("container:", whole_item_groups)

  const { setNodeRef } = useDroppable({
    id: containerId
  });

  const [showPopup, setShowPopup] = useState(false);
  const [containerIdToDelete, setContainerIdToDelete] = useState(null);

  const openPopup = (containerId) => {

    if (containerId === "group0") {
      openGroup0DeleteModal()
      return
    }

    if (dirty === false) {
      handleDelete(containerId)
      return
    }

    // then if dirty is true, check if whole_item_groups[containerId] is non-empty, if so setShowPopup
    // check if the container is empty, if it is then call handleDelete directly
    if (whole_item_groups[containerId] && whole_item_groups[containerId].length > 0) {
      setShowPopup(true);
      setContainerIdToDelete(containerId);
    } else {
      handleDelete(containerId);
    }
    // setShowPopup(true);
    // setContainerIdToDelete(containerId);
  };

  const closePopup = () => {
    setShowPopup(false);
    setContainerIdToDelete(null);
  };

  const confirmDelete = () => {
    if (containerIdToDelete) {
      handleDelete(containerIdToDelete);
    }
    closePopup();
  };

  const [showGroup0DeleteModal, setShowGroup0DeleteModal] = useState(false);

  const openGroup0DeleteModal = () => {
    setShowGroup0DeleteModal(true)
  }

  const closeGroup0DeleteModal = () => {
    setShowGroup0DeleteModal(false)
  };

  // console.log("container item: ", items)

  // for totalPrice calculations (subtotal)
  const [subtotal, setSubtotal] = useState(0);
  console.log("Container ", containerId, " has items:", items)

  useEffect(() => {
    // Calculate the subtotal
    let newSubtotal = 0;
    items.forEach(({ item }) => {
      const pricePerGroup = (item.itemTotalPrice / numberOfGroups)
      newSubtotal += pricePerGroup;
    });
    setSubtotal(newSubtotal);
    setFinalPrice((Math.round(100 * (newSubtotal * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(extra) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))) / 100))
  }, [items, numberOfGroups, tips, discount, extra]); // Dependency array includes 'items'
  const CustomerReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "CustomerReceipt"), {
        date: date,
        data: cleanProductData(checkout(containerId)),
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

  const MerchantReceipt = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "MerchantReceipt"), {
        date: date,
        data: cleanProductData(checkout(containerId)),
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

  const OpenCashDraw = async () => {
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const rawData = localStorage.getItem(store + "-" + selectedTable) !== null ? JSON.parse(localStorage.getItem(store + "-" + selectedTable)) : [];
      const docRef = await addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "OpenCashDraw"), {
        date: date,
        data: cleanProductData(rawData),
        selectedTable: selectedTable
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  function roundToTwoDecimals(n) {
    return Math.round(n * 100) / 100;
  }
  const CashCheckOut = async (extra, tax, total) => {
    let extra_tip = 0
    if (extra !== null) {
      extra_tip = Math.round(extra * 100) / 100
    }
    try {
      const dateTime = new Date().toISOString();
      const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);
      const addDocPromise = addDoc(collection(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "success_payment"), {
        amount: Math.round(finalPrice * 100),
        amount_capturable: 0,
        amount_details: { tip: { amount: 0 } },
        amount_received: Math.round(finalPrice * 100),
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
          subtotal: Math.round(100 * subtotal) / 100,
          tax: tax,
          tips: roundToTwoDecimals
            (roundToTwoDecimals(extra) + roundToTwoDecimals(tips === "" ? 0 : tips)),
          total: total,
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
        payment_method_types: ["Paid_by_Cash"],
        powerBy: "Paid by Cash",
        processing: null,
        receiptData: JSON.stringify(cleanProductData(checkout(containerId))),
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
      localStorage.setItem("splitSubtotalCurrentPrice", (Number(localStorage.getItem("splitSubtotalCurrentPrice")) + Number(subtotal)))

      setIsPaidArray((prev) => {
        const updatedArray = [...prev, containerId];
        if (Number(localStorage.getItem("splitSubtotalCurrentPrice")) == Number(localStorage.getItem("splitSubtotalTotalPrice"))) {
          console.log("✅ All groups are paid!");

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
          localStorage.removeItem(`${store}-${selectedTable}-isSent_startTime`); // Clear start time
        }
        return updatedArray;
      });



    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
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
  function stringTofixed(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
  }

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
    { input: "Discount", output: "折扣" },
    { input: "Disc.", output: "折扣" },
    { input: "Duration", output: "用餐时长" },
    { input: "Start", output: "开始时间" },
    { input: "Service Fee", output: "服务费" },
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
    { input: "Original Total", output: "修改前总价" },
    { input: "New Total", output: "修改后总价" },

  ];
  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : "Translation not found";
  }
  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input
  }



  // Add refs for inputs - only keeping necessary references
  const serviceFeeTipsInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const cashInputRef = useRef(null);
  const customAmountInputRef = useRef(null);
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

  const isPC = width >= 1024;

  // Effect for closing number pad removed - now controlled by KeypadModal

  const handleChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow numbers, decimal point, and negative sign
    if (/^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
    setErrorMessage(``)

    setResult(null);
  };

  const handleCustomAmountChange = (event) => {
    let value = event.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

    // Only allow numbers, decimal point, and negative sign
    if (/^-?\d*\.?\d*$/.test(value)) {
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
    }
  };

  const calculateExtra = (percentage) => {
    const extraAmount = (subtotal * percentage) / 100;
    setExtra(extraAmount);
    setFinalResult(subtotal + extraAmount);
  };

  const calculateCustomAmount = (customAmoun_t) => {
    let amount;
    if (!customAmoun_t) {
      amount = parseFloat(customAmount);
    } else {
      amount = customAmoun_t
    }
    if (!isNaN(amount)) {
      setExtra(amount);
      setFinalResult(subtotal + amount);
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

  const toggleCustomAmountVisibility = () => {
    setCustomAmountVisible(!isCustomAmountVisible);
  };

  // OpenNumberPad function removed - now handled by KeypadModal

  // Listen for reset-keypad events
  useEffect(() => {
    const handleResetKeypad = () => {
      resetKeypadProps();
    };

    window.addEventListener('reset-keypad', handleResetKeypad);

    return () => {
      window.removeEventListener('reset-keypad', handleResetKeypad);
    };
  }, [inputValue]); // Dependencies include inputValue to ensure resetKeypadProps uses the latest value

  return (

    <SortableContext
      id={containerId}
      items={items}
      strategy={verticalListSortingStrategy}
    >

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="text-center font-black text-gray-700 ml-1 mr-1">
          <div style={{ display: "flex", marginTop: "auto", justifyContent: "space-between" }}>
            <span className="notranslate">{containerId}</span>

            <Button variant="danger" style={{ marginTop: "auto" }} onClick={() => openPopup(containerId)}>
              <FontAwesomeIcon icon={faTrash} color="white" size="1x" />
            </Button>

            {showPopup && (
              <div
                id="deletePopupModal"
                className="modal fade show"
                role="dialog"
                style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <div
                  className="modal-dialog"
                  role="document"
                  style={{
                    maxWidth: '15%',
                    width: '15%',
                    margin: '0 auto',
                    position: 'fixed',  // Use fixed positioning
                    top: '30%',         // Center vertically
                    left: '50%',        // Center horizontally
                    transform: 'translate(-50%, -50%)' // Adjust for the top-left origin
                  }}>
                  <div className="modal-content">
                    <div
                      className="modal-body"
                      style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: "0.5rem" }}
                    >
                      If this is deleted, all the items here will be placed in group 0
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button type="button" class="btn btn-secondary" onClick={closePopup} style={{ margin: "5px" }}>Cancel</button>
                      <button type="button" class="btn btn-primary" onClickCapture={confirmDelete} style={{ margin: "5px" }}>Confirm</button>
                    </div>
                  </div>
                </div>
              </div>

            )}

            {showGroup0DeleteModal && (
              <div
                id="deleteGroup0Modal"
                className="modal fade show"
                role="dialog"
                style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <div
                  className="modal-dialog"
                  role="document"
                  style={{

                    margin: '0 auto',
                    position: 'fixed',  // Use fixed positioning
                    top: '30%',         // Center vertically
                    left: '50%',        // Center horizontally
                    transform: 'translate(-50%, -50%)' // Adjust for the top-left origin
                  }}>
                  <div className="modal-content">
                    <div
                      className="modal-body"
                      style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: "0.5rem" }}
                    >
                      Group0 cannot be deleted
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button type="button" class="btn btn-primary" onClickCapture={closeGroup0DeleteModal} style={{ margin: "5px" }}>Confirm</button>
                    </div>
                  </div>
                </div>
              </div>

            )}


            {/* {showPopup && (
                  <ConfirmationPopup
                    onConfirm={confirmDelete}
                    onCancel={closePopup}
                  />
            )} */}
          </div>
        </div>

        <div className="flex ">

          <div className={``}>
            <div className="flex flex-col gap-2 p-1 w-[180px]" >
              {/* Add an invisible placeholder */}
              <div
                ref={setNodeRef}
                style={{ opacity: 0, height: 0, pointerEvents: 'none' }}
              ></div>
              {items.map((item) => (

                <SortableItem className="bordered" key={item.id} id={item.id} item={item.item} updateItems={updateItems} whole_item_groups={whole_item_groups} numberOfGroups={numberOfGroups}
                />
                // <Item id={item.id} item={item.item} updateItems={updateItems} whole_item_groups={whole_item_groups} numberOfGroups={numberOfGroups} />
              ))}
              {/* </div> */}

            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            <a
              onClick={handleAddTipClick}
              className="mt-3 btn btn-sm btn-success mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Add Service Fee"}</span>
            </a>
            {isTipsModalOpen && (
              <KeypadModal
                isOpen={isTipsModalOpen}
                onClose={() => setTipsModalOpen(false)}
                title="Add Service Fee"
                numberPadValue={tips}
                onNumberPadChange={(newValue) => {
                  setTips(newValue);
                }}
                onNumberPadConfirm={(confirmedValue) => {
                  // Process value when confirming
                  let valueToConfirm = confirmedValue;
                  setTips(valueToConfirm);
                  setTipsModalOpen(false);
                }}
                onQuickAmountClick={(amount) => {
                  // 直接使用按钮上的金额值
                  setTips(amount.toString());
                }}
              >
                <div>
                  {/* 修改前总价和修改后总价显示 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{fanyi("Original Total")}:</span>
                      <span className="text-lg font-semibold text-gray-800 notranslate">
                        ${stringTofixed(subtotal * (Number(TaxRate) / 100 + 1) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{fanyi("New Total")}:</span>
                      <span className="text-lg font-semibold text-green-600 notranslate">
                        ${stringTofixed(subtotal * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))}
                      </span>
                    </div>
                    {tips && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-blue-600">{fanyi("Service Fee")}:</span>
                        <span className="text-sm font-semibold text-blue-600 notranslate">
                          +${stringTofixed((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))}
                        </span>
                      </div>
                    )}
                  </div>

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

                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter percent"
                      value={customPercentage}
                      onChange={handleCustomPercentageChange}
                      className="px-4 py-2 ml-2 form-control tips-no-spinners"
                      translate="no"
                    />
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
                        setTips(value.toString());
                        setSelectedTipPercentage(null);
                      }
                    }}
                    ref={serviceFeeTipsInputRef}
                    translate="no"
                  />

                  <div className="mt-4 text-right">
                    <button type="button" className="btn btn-secondary mr-2" onClick={() => handleCancelTip()}>
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel Add
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => setTipsModalOpen(false)}>
                      Add Service Fee
                    </button>
                  </div>
                </div>
              </KeypadModal>
            )}
            <a
              onClick={handleAddDiscountClick}
              className="mt-3 btn btn-sm btn-danger mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Add Discount"}</span>
            </a>

            {isDiscountModalOpen && (
              <KeypadModal
                isOpen={isDiscountModalOpen}
                onClose={() => setDiscountModalOpen(false)}
                title="Add Discount"
                numberPadValue={discount}
                onNumberPadChange={(newValue) => applyDiscount(newValue)}
                onNumberPadConfirm={(confirmedValue) => {
                  // Process value when confirming
                  let valueToConfirm = confirmedValue;
                  applyDiscount(valueToConfirm);
                  setDiscountModalOpen(false);
                }}
                onQuickAmountClick={(amount) => {
                  setDiscount(amount.toString());
                }}
              >
                <div>
                  {/* 修改前总价和修改后总价显示 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{fanyi("Original Total")}:</span>
                      <span className="text-lg font-semibold text-gray-800 notranslate">
                        ${stringTofixed(subtotal * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{fanyi("New Total")}:</span>
                      <span className="text-lg font-semibold text-red-600 notranslate">
                        ${stringTofixed(subtotal * (Number(TaxRate) / 100 + 1) + (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips) - (val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))}
                      </span>
                    </div>
                    {discount && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm font-medium text-red-600">{fanyi("Discount")}:</span>
                        <span className="text-sm font-semibold text-red-600 notranslate">
                          -${stringTofixed((val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount))}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mb-4">
                    <button onClick={() => handleDiscountPercentage(0.10)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mr-2">
                      10%
                    </button>
                    <button onClick={() => handleDiscountPercentage(0.20)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full mx-1">
                      20%
                    </button>
                    <button onClick={() => handleDiscountPercentage(0.30)} className="bg-red-500 text-white px-4 py-2 rounded-md w-full ml-2">
                      30%
                    </button>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter percent"
                      value={customDiscountPercentage}
                      onChange={handleCustomDiscountPercentageChange}
                      className="px-4 py-2 ml-2 form-control discounts-no-spinners"
                      translate="no"
                    />
                  </div>

                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter discount by amount"
                    value={discount}
                    className="form-control discounts-no-spinners"
                    onChange={(e) => {
                      let value = e.target.value.replace(/。/g, '.'); // Replace Chinese period with Western period

                      // Only allow numbers and decimal point
                      if (/^\d*\.?\d*$/.test(value)) {
                        applyDiscount(value.toString());
                        setSelectedTipPercentage(null);
                      }
                    }}
                    ref={discountInputRef}
                    translate="no"
                  />

                  <div className="mt-4 text-right">
                    <button type="button" className="btn btn-secondary mr-2" onClick={handleCancelDiscount}>
                      <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel Add
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => setDiscountModalOpen(false)}>
                      Add Discount
                    </button>
                  </div>
                </div>
              </KeypadModal>
            )}
            <a
              onClick={() => { CustomerReceipt(); MerchantReceipt(); }}
              className="mt-3 btn btn-sm btn-secondary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Print Receipt"}</span>
            </a>

            <a
              onClick={() => setMyModalVisible(true)}
              className="mt-3 btn btn-sm btn-primary mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <span>{"Card Pay"}</span>
            </a>
            {isMyModalVisible && (
              <div id="addTipsModal" className="modal fade show" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Select your POS Machine:</h5>
                      <button style={uniqueModalStyles.closeBtnStyle}
                        onClick={() => { setMyModalVisible(false); setReceived(false) }}>
                        &times;
                      </button>
                    </div>
                    <div className="modal-body pt-0">
                      <PaymentSplit
                        subtotal={subtotal} setDiscount={setDiscount} setTips={setTips} setExtra={setExtra} setInputValue={setInputValue} setProducts={setProducts} setIsPaymentClick={setIsPaymentClick} isPaymentClick={isPaymentClick} received={received} setReceived={setReceived} selectedTable={selectedTable} storeID={store} chargeAmount={finalPrice} discount={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(discount)} service_fee={(val => isNaN(parseFloat(val)) || !val ? 0 : parseFloat(val))(tips)} connected_stripe_account_id={acct} checkout_JSON={cleanProductData(checkout(containerId))} totalPrice={Math.round(subtotal * 100)}
                        isPaidArray={isPaidArray}
                        setIsPaidArray={setIsPaidArray}
                        containerId={containerId}
                        numberOfGroups={numberOfGroups}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <a
              onClick={() => {
                openUniqueModal();
                setInputValue("")
                setResult(null);
                setExtra(0)
              }}
              className="mt-3 btn btn-sm btn-info mx-1"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <span>{"Cash Pay"}</span>
            </a>
            {isUniqueModalOpen && (
              <KeypadModal
                isOpen={isUniqueModalOpen}
                onClose={() => {
                  setUniqueModalOpen(false);
                  setInputValue('');
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
                  <p className="mb-2">Enter the Cash Received</p>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    style={uniqueModalStyles.inputStyle}
                    className="mb-4 p-2 w-full border rounded-md"
                    ref={cashInputRef}
                    onClick={() => {
                      // When clicking the main input field, reset keypadProps
                      resetKeypadProps();
                    }}
                    translate="no"
                  />
                  <button
                    onClick={calculateResult}
                    style={uniqueModalStyles.buttonStyle}
                    className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
                  >
                    Calculate Give Back Cash
                  </button>
                  {errorMessage && (
                    <div className="text-red-500 font-semibold mt-2">
                      {errorMessage}
                    </div>
                  )}
                  {(extra !== null && extra !== 0) && (
                    <p className="">Gratuity: <span className='notranslate'>${Math.round((extra) * 100) / 100} </span></p>
                  )}
                  <p className="mt-1">Final Payment: <span className='notranslate'>${finalPrice}</span> </p>

                  {result !== null && (
                    <div>
                      <p className="mt-1 mb-4 ">
                        Give Back Cash:
                        <span className='notranslate'>${Math.round((result - finalPrice) * 100) / 100}</span>
                      </p>
                      <button
                        onClick={() => {
                          setCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                          calculateCustomAmount(Math.round((result - finalPrice) * 100) / 100);
                          CashCheckOut(
                            Math.round((result - finalPrice + extra) * 100) / 100,
                            Math.round(subtotal * (Number(TaxRate) / 100) * 100) / 100,
                            inputValue
                          );
                          closeUniqueModal();
                        }}
                        style={uniqueModalStyles.buttonStyle}
                        className="mt-2 mb-2 bg-gray-500 text-white px-4 py-2 rounded-md w-full"
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
                        Math.round(subtotal * (Number(TaxRate) / 100) * 100) / 100,
                        finalPrice
                      );
                      closeUniqueModal();
                    }}
                    style={uniqueModalStyles.buttonStyle}
                    className="mt-2 mb-2 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
                  >
                    {fanyi("Collect")} ${stringTofixed(finalPrice)},
                    {fanyi("including")} ${Math.round((extra) * 100) / 100}
                    {fanyi("Gratuity")}.
                  </button>

                  <div className="mt-4">
                    <p className="mb-4">Gratuity:</p>
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
                      <button onClick={toggleCustomAmountVisibility} className="bg-orange-500 text-white px-4 py-2 rounded-md w-full ml-2">
                        Other
                      </button>
                    </div>

                    {isCustomAmountVisible && (
                      <div>
                        <p className="mb-2">Custom Gratuity:</p>
                        <div className="flex">
                          <input
                            type="text"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            style={uniqueModalStyles.inputStyle}
                            className="p-2 w-full border rounded-md mr-2"
                            ref={customAmountInputRef}
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
                            translate="no"
                          />
                          <button
                            onClick={() => calculateCustomAmount(customAmount)}
                            className="bg-orange-500 text-white p-2 rounded-md w-1/3"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </KeypadModal>
            )}
            <div className={`text-right`}>Subtotal: <span className='notranslate'>${round2digtNum(subtotal).toFixed(2)}</span> </div>
            {discount && (
              <div className={`text-right`}>Discount: <span className='notranslate'>-${round2digtNum(discount)} </span></div>
            )}
            {tips && (
              <div className={`text-right`}>Service Fee: <span className='notranslate'>${round2digtNum(tips)}</span> </div>
            )}
            {(extra !== null && extra !== 0) && (
              <div className={`text-right`}>Gratuity: <span className='notranslate'>{round2digtNum(extra)} </span></div>
            )}
            <div className={`text-right `}>Tax ({(Number(TaxRate))}%): <span className='notranslate'>${round2digtNum(subtotal * (Number(TaxRate) / 100))}</span>  </div>
            <div className={`text-right `}>Total Price: <span className='notranslate'>${round2digtNum(finalPrice)}</span>  </div>

          </div>
        </div>
      </div>

    </SortableContext>


  );
}

export default Container;
