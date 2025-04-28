import React, { useState, useEffect, useRef, useMemo } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import { useMyHook } from '../pages/myHook';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import '../components/admin_food.css';
import '../components/hideScrollbar.css'; // 引入隐藏滚动条的CSS
import Scanner from '../components/ScanMenu';
import { useUserContext } from "../context/userContext";
import add_image from '../components/add_image.png';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowLeft, faPlus, faSearch, faQuestionCircle, faCamera, faTrash, faDownload, faArrowsAlt, faCheckSquare, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import useDynamicAttributes from '../components/useDynamicAttributes';
import pinyin from "pinyin";
import LazyLoad from 'react-lazy-load';

// 自定义hook useDraggableScroll - 添加在函数组件外部
const useDraggableScroll = (ref) => {
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY !== 0 && ref.current) {
        ref.current.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    // 添加鼠标拖动功能的变量和处理函数
    let isDown = false;
    let startX;
    let scrollLeft;
    
    const handleMouseDown = (e) => {
      if (!ref.current) return;
      isDown = true;
      startX = e.pageX - ref.current.offsetLeft;
      scrollLeft = ref.current.scrollLeft;
    };
    
    const handleMouseLeave = () => {
      isDown = false;
    };
    
    const handleMouseUp = () => {
      isDown = false;
    };
    
    const handleMouseMove = (e) => {
      if (!isDown || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    };

    // 触摸设备支持
    const handleTouchStart = (e) => {
      if (!ref.current) return;
      isDown = true;
      startX = e.touches[0].pageX - ref.current.offsetLeft;
      scrollLeft = ref.current.scrollLeft;
    };
    
    const handleTouchEnd = () => {
      isDown = false;
    };
    
    const handleTouchMove = (e) => {
      if (!isDown || !ref.current) return;
      const x = e.touches[0].pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      ref.current.scrollLeft = scrollLeft - walk;
    };

    const element = ref.current;
    
    if (element) {
      // 添加滚轮事件监听
      element.addEventListener('wheel', handleWheel);
      
      // 添加鼠标拖动事件监听
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mousemove', handleMouseMove);
      
      // 添加触摸事件监听
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('touchmove', handleTouchMove);

      // Cleanup event listener when the component unmounts
      return () => {
        element.removeEventListener('wheel', handleWheel);
        
        // 移除鼠标拖动事件监听
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mousemove', handleMouseMove);
        
        // 移除触摸事件监听
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchmove', handleTouchMove);
      };
    }
    return () => {};
  }, [ref]);
};

function convertToPinyin(text) {
    return pinyin(text, {
        style: pinyin.STYLE_NORMAL,
    }).join('');
}

const Food = ({ store }) => {

    const {
        attributes,
        currentAttribute,
        setCurrentAttribute,
        currentVariation,
        setCurrentVariation,
        priceFormatError,
        addOrUpdateAttributeVariation,
        deleteVariation,
        deleteAttribute,
        toggleMultiSelect,
        resetAttributes, // Add this function from the hook
    } = useDynamicAttributes();
    useEffect(() => {
        // This effect will run whenever attributes state changes
        console.log('Attributes updated:', attributes);
        setNewItem({ ...newItem, attributesArr: attributes });
        //resetAttributes(transformJsonToInitialState(attributes))

    }, [attributes]); // Add attributes as a dependency
    const transformJsonToInitialState = (jsonObject) => {
        const initialState = {};

        for (const attributeName in jsonObject) {
            if (jsonObject.hasOwnProperty(attributeName)) {
                initialState[attributeName] = {
                    isSingleSelected: jsonObject[attributeName].isSingleSelected,
                    variations: jsonObject[attributeName].variations
                };
            }
        }

        return initialState;
    };

    /**
     * 
    {
        "size": {
          "isSingleSelected": true,
          "variations": [
            {
              "type": "bg",
              "price": 2
            },
            {
              "type": "sm",
              "price": -1
            }
          ]
        },
        "more": {
          "isSingleSelected": false,
          "variations": [
            {
              "type": "more rice",
              "price": 1
            }
          ]
        }
      }
     */
    const formatPriceDisplay = (price) => {
        return price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`;
    };

    const selectVariationForEdit = (attributeName, variation) => {
        setCurrentAttribute(attributeName);
        setCurrentVariation(variation);
    };

    const [isSingleSelect, setIsSingleSelect] = useState(true);

    const handleToggle = (attributeName, isSingle) => {
        toggleMultiSelect(attributeName, isSingle);  // Assuming toggleMultiSelect and attributeName come from props or somewhere else.
        setIsSingleSelect(isSingle);
    };


    const params = new URLSearchParams(window.location.search);
    const [selectedFoodType, setSelectedFoodType] = useState("");
    const [selectedName, setSelectedName] = useState('');
    const [selectedCHI, setSelectedCHI] = useState('');
    const handleNameChange = (event) => {
        setSelectedName(event.target.value);
    };

    // Function to handle the change in the CHI input
    const handleCHIChange = (event) => {
        setSelectedCHI(event.target.value);
    };
    const { user, user_loading } = useUserContext();

    const scrollingWrapperRef = useRef(null);
    const filterScrollRef = useRef(null); // 添加新的ref

    // 使用自定义hook
    useDraggableScroll(scrollingWrapperRef);
    useDraggableScroll(filterScrollRef);

    // Initialize selectedOptions with an empty array
    const [selectedOptions, setSelectedOptions] = useState(['Morning', 'Afternoon', 'Evening']);
    // Define a function to toggle the selection of an option
    const toggleOption = (option) => {
        if (selectedOptions.includes(option)) {
            // If the option is already selected, remove it
            setSelectedOptions(selectedOptions.filter((item) => item !== option));
            setNewItem({ ...newItem, availability: selectedOptions.filter((item) => item !== option) });

        } else {
            // If the option is not selected, add it
            setSelectedOptions([...selectedOptions, option]);
            setNewItem({ ...newItem, availability: option });

        }
        console.log(selectedOptions)
    };

    const [data, setData] = useState(JSON.parse(localStorage.getItem(store) || "[]"));

    const [foods, setFoods] = useState(data);
    if (!localStorage.getItem(store) || localStorage.getItem(store) === "") {
        localStorage.setItem(store, "[]");
    }



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
        let products = JSON.parse(sessionStorage.getItem(store));
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
    const containerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
    };
    const isBigPC = width >= 1280;
    const itemStyle = isMobile
        ? {
            minWidth: 'calc(100% - 10px)',
            maxWidth: 'calc(100% - 10px)', // 100% when width >= 1280
            margin: '0px',
            padding: '0px',
            paddingLeft: '0px',
            paddingRight: '0px',
            boxSizing: 'border-box',
        }
        : isBigPC
            ? {
                minWidth: 'calc(33% - 10px)', // 33% when width >= 1280
                maxWidth: 'calc(33% - 10px)', // 33% when width >= 1280
                margin: '5px',
                padding: '10px',
                paddingLeft: '0px',
                paddingRight: '0px',
                boxSizing: 'border-box',
            }
            : {
                minWidth: 'calc(50% - 10px)', // 50% for screens smaller than 1280 but not mobile
                maxWidth: 'calc(50% - 10px)', // 50% when width >= 1280
                margin: '5px',
                padding: '10px',
                paddingLeft: '0px',
                paddingRight: '0px',
                boxSizing: 'border-box',
            };
    useEffect(() => {
    }, [id]);

    useEffect(() => {
        // Get data from localStorage when component mounts
        const storedData = JSON.parse(localStorage.getItem(store) || "[]");
        setData(storedData);
    }, [id]);

    const updateKey = async () => {
        console.log("updateKey");
        // Reference to the specific document
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

        // Update the 'key' field to the value retrieved from localStorage
        await updateDoc(docRef, {
            key: localStorage.getItem(store)
        });
        localStorage.setItem("Old_" + store, localStorage.getItem(store));
        alert("Saved Successful");

    };


    const syncData = async () => {
        console.log("sync data")

        let sessionData;

        try {
            // Get a reference to the specific document with ID equal to store
            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
            console.log("syncData1")
            // Fetch the document
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                // The document exists
                sessionData = docSnapshot.data()?.key;
                const { key, ...rest } = docSnapshot.data();
                JSON.parse(localStorage.getItem(store) || "[]")
                if (rest === undefined || rest === null) {
                    // If rest is undefined or null, do something else (e.g., set an empty array as the value)
                    localStorage.setItem("TitleLogoNameContent", JSON.stringify([]));
                } else {
                    // If rest is not undefined or null, proceed with the original operations
                    localStorage.setItem("TitleLogoNameContent", JSON.stringify(rest));
                }
                if (sessionData === undefined || sessionData === null) {
                    // If rest is undefined or null, do something else (e.g., set an empty array as the value)
                    localStorage.setItem("Old_" + store, JSON.stringify([]));
                } else {
                    // If rest is not undefined or null, proceed with the original operations
                    localStorage.setItem("Old_" + store, sessionData);
                }

                setArr(JSON.parse(sessionData));
                setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])
                setData(JSON.parse(sessionData)); // Update state
                setFoods(JSON.parse(sessionData))
                saveId(Math.random());
                //setArr(JSON.parse(sessionData));
                setFoodTypes([...new Set(JSON.parse(sessionData).map(item => item.category))])

            } else {
                console.log("No document found with the given ID.");
            }
        } catch (error) {
            console.error("Error fetching the document:", error);
        }
        console.log("syncData1")
    }


    // timesClicked is an object that stores the number of times a item is clicked
    //const timesClicked = new Map();


    // for translations sake
    const [translationsMode_, settranslationsMode_] = useState("en");

    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = useMemo(() => {
        const trans = JSON.parse(sessionStorage.getItem("translations"))
        const translationsMode = sessionStorage.getItem("translationsMode")
        settranslationsMode_(sessionStorage.getItem("translationsMode"))

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
    const [foodTypes, setFoodTypes] = useState([...new Set(JSON.parse(localStorage.getItem(store) || "[]").map(item => item.category))]);
    const [foodTypesCHI, setFoodTypesCHI] = useState([...new Set(JSON.parse(localStorage.getItem(store) || "[]").map(item => item.categoryCHI))]);

    const [expandDetails, setExpandDetails] = useState(false);
    const [expandOptions, setExpandOptions] = useState(false);


    function deleteById(arr, id) {
        return arr.filter(item => item.id !== id);
    }
    const deleteFood_array = async (id) => {
        console.log(id)
        let updatedArr = deleteById(JSON.parse(localStorage.getItem(store) || "[]"), id)

        reload(updatedArr)

    }

    const [newItem, setNewItem] = useState({
        name: "",
        CHI: "",
        subtotal: "",
        category: "",
        categoryCHI: "",
        availability: "",
        attributes: "",
        attributes2: "",
        attributesArr: ""
    });


    const [arr, setArr] = useState(JSON.parse(localStorage.getItem(store) || "[]"));

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
            image: previewUrl,
            name: newItem.name || "Enter Meal Name",
            CHI: newItem.CHI || "填写菜品名称",
            subtotal: newItem.subtotal || "1",
            category: selectedFoodType === "" ? newItem.category || "Temporary Use" : selectedFoodType,
            categoryCHI: newItem.categoryCHI || "类别",
            availability: newItem.availability || ['Morning', 'Afternoon', 'Evening'],
            attributes: newItem.attributes || [],
            attributes2: newItem.attributes2 || [],
            attributesArr: newItem.attributesArr || {}
        };

        // Add the new item to the array
        let updatedArr = [newItemWithPlaceholders, ...arr];
        reload(updatedArr)
        setSelectedOptions(['Morning', 'Afternoon', 'Evening']);
        resetAttributes(transformJsonToInitialState({}))


        console.log(updatedArr)
        // Clear the input fields
        setNewItem({
            name: "",
            CHI: "",
            image: "",
            subtotal: "",
            category: "",
            categoryCHI: "",
            availability: "",
            attributes: "",
            attributes2: "",
            attributesArr: ""
        });
    };

    const updateItem = (id, updatedFields) => {
        let target_category = null;
        const newItems = arr.map((item) => {
            if (item.id === id) {
                const updatedItem = { ...item, ...updatedFields };
                target_category = updatedItem.category;
                return updatedItem;
            }
            return item;
        });
        reload(newItems)

    };

    function reload(updatedArr) {
        setArr(updatedArr);
        setData(updatedArr); // Update state
        setFoods(updatedArr)

        localStorage.setItem(store, JSON.stringify(updatedArr))
        saveId(Math.random());
        setFoodTypes([...new Set(updatedArr.map(item => item.category))])
    }

    const [previewUrl, setPreviewUrl] = useState("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/b686ebae-7ab0-40ec-9383-4c483dace800/public");

    const handleFileChangeAndUpload = async (event) => {
        const selectedFile = event.target.files[0];
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
                //console.log(data.result.variants[0])
                setPreviewUrl(data.result.variants[0])
                //console.log(item)
                //setUploadStatus('Image uploaded successfully.');
            } else {
                //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
            }
        } catch (error) {
            //setUploadStatus(`Error: ${error.message}`);
        }
    };


    const translateToChinese = async (text) => {
        try {
            const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {}, {
                params: {
                    q: text,
                    target: 'zh-CN',  // Translate to Spanish as an example. Adjust as needed.
                    key: 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo'
                }
            });
            return (response.data.data.translations[0].translatedText)
            //setTranslatedText(response.data.data.translations[0].translatedText);
        } catch (error) {
            return ('Failed to translate text');
        }
    };

    const translateToEnglish = async (text) => {
        try {
            const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {}, {
                params: {
                    q: text,
                    target: 'en',  // Translate to English.
                    key: 'AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo' // Note: It's not recommended to expose API keys in code like this. 
                }
            });
            return (response.data.data.translations[0].translatedText)
            //setTranslatedText(response.data.data.translations[0].translatedText);
        } catch (error) {
            return ('Failed to translate text');
        }
    };
    /**scanner */

    //Instruction:
    //Click on the image to change:
    //
    useEffect(() => {
        //console.log("hellooooooooooooooooooooo")
        syncData();
    }, []);
    const [ChangeCategoryName, setChangeCategoryName] = useState(false);
    const [SelectChangeCategoryName, setSelectChangeCategoryName] = useState('');
    const [categoryName, setCategoryName] = useState(''); // Initialize with an empty string
    const [showAdjustion, setShowAdjustion] = useState(false);

    const ChangeCategoryNameSubmit = () => {
        // Use the categoryName state variable here
        console.log('New category name:', categoryName)
        console.log(SelectChangeCategoryName)
        console.log(JSON.parse(localStorage.getItem(store)))

        const updatedData = JSON.parse(localStorage.getItem(store)).map((item) => {
            if (item.category === SelectChangeCategoryName) {
                return { ...item, category: categoryName };
            }
            return item;
        });
        //console.log(updatedData)
        reload(updatedData)
        setSelectedFoodType(categoryName)
        setSelectChangeCategoryName('');
        setCategoryName(''); // Initialize with an empty string


    };

    // State for scan results and recommendations (lifted from ScanMenu)
    const [scanStatusMessage, setScanStatusMessage] = useState('');
    const [recommendation, setRecommendation] = useState([]); // Lifted state
    const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false); // ADD Modal state

    // Function passed to Scanner to update recommendations and status
    const handleScanComplete = (result) => {
        console.log("handleScanComplete called with result:", result); // Log the entire result object

        if (result.recommendationData) {
            console.log("Setting recommendation data:", result.recommendationData);
            setRecommendation(result.recommendationData);
        }
        if (result.statusMessage) {
            console.log("Setting scan status message:", result.statusMessage); // Log the message being set
            setScanStatusMessage(result.statusMessage);
            // Clear message after a few seconds (keeping original 5s for now as extending didn't help)
            setTimeout(() => setScanStatusMessage(''), 5000);
        } else {
            console.log("No status message received in handleScanComplete."); // Log if message is missing
        }
        if (result.scannedItems) {
            console.log("Received scanned items (not currently directly used for status):", result.scannedItems);
            // Logic to replace data if we implement that later
            // reload(result.scannedItems);
        }
    };

    // 新增状态用于控制菜单界面
    const [activeTab, setActiveTab] = useState('items'); // 'items' 或 'option-group'
    const [expandedCategory, setExpandedCategory] = useState('Drinks'); // 默认展开 Drinks 分类
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false); // 控制底部 + 按钮菜单

    // 切换选项菜单
    const toggleAddMenu = () => {
        setIsAddMenuOpen(!isAddMenuOpen);
    };

    // 添加useEffect以控制body滚动
    useEffect(() => {
        if (isAddMenuOpen) {
            // 禁止滚动
            document.body.style.overflow = 'hidden';
        } else {
            // 恢复滚动
            document.body.style.overflow = 'auto';
        }
        
        // 组件卸载时恢复滚动
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isAddMenuOpen]);

    return (
        <div className="bg-white min-h-screen">
            {/* 顶部导航栏 - 在弹窗打开时移除sticky定位 */}
            <div className={`${isAddMenuOpen ? '' : 'sticky top-0 z-40'} bg-white border-b border-gray-200`}>
                <div className="px-4 py-4 flex items-center">
                    <button className="mr-2">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-gray-800" />
                    </button>
                    <h1 className="text-xl font-medium text-gray-800">Menu</h1>
                    <button className="ml-auto">
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400" />
                    </button>
                </div>
                
                {/* 标签页切换 */}
                <div className="flex border-b border-gray-200">
                    <button 
                        className="flex-1 py-3 px-4 text-sm font-medium text-green-700 border-b-2 border-green-700"
                    >
                        Items
                    </button>
                    <button 
                        className="flex-1 py-3 px-4 text-sm font-medium text-gray-500"
                    >
                        Option Group
                    </button>
                </div>
            </div>
            
            {/* 保留原有内容 */}
            <div className="p-4 sm:p-6 lg:p-8 relative">
                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto">
                    {/* Header Section - Simplified */}
                    {scanStatusMessage && (
                    <div className={`mb-6 text-center sm:text-left ${(!foods || foods.length === 0) ? 'hidden' : ''}`}>
                        {/* Scan Status Message Area - Placed below title */}
                        <AnimatePresence>
                            
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="my-2 p-2 bg-green-100 text-green-800 rounded-md text-sm text-center shadow-sm">
                                        {scanStatusMessage}
                                    </div>
                                </motion.div>
                            
                        </AnimatePresence>
                    </div>
                    )}
                    {/* Action Buttons Row for Large Screens (Corrected Styles + Tooltips) */}
                    <div className="hidden lg:flex justify-end space-x-2 mb-4">
                        {/* Scanner Button (Top Bar Style + Tooltip Wrapper) */}
                        <div className="relative group"> {/* Added wrapper back */}
                            <Scanner
                                store={store}
                                reload={reload}
                                onScanComplete={handleScanComplete}
                                isButton={true} // Render as top-bar button
                                t={t}
                            />
                            {/* Hover Tooltip for Scanner */}
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                {t("Scan Menu")}
                            </span>
                        </div>

                        {/* Clear Button (Top Bar Style + Tooltip) */}
                        <button
                            title={t("Clear Data")}
                            onClick={() => {
                                if (window.confirm(t("Are you sure you want to clear all menu data?"))) {
                                    localStorage.setItem(store, "[]");
                                    setFoods([]);
                                    setData([]);
                                    setRecommendation([]);
                                    setScanStatusMessage(t('Menu data cleared.'));
                                    setTimeout(() => setScanStatusMessage(''), 5000);
                                }
                            }}
                            className="relative group flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                        >
                            <i className="bi bi-trash"></i>
                            <span>{t("Clear Data")}</span>
                            {/* Hover Tooltip */}
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                {t("Clear Data")}
                            </span>
                        </button>

                        {/* Download Button (Top Bar Style + Tooltip) */}
                        <button
                            title={t("Download JSON")}
                            onClick={() => {
                                const dataStr = JSON.stringify(JSON.parse(localStorage.getItem(store) || "[]"), null, 2);
                                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                const exportFileDefaultName = 'menu.json';
                                const linkElement = document.createElement('a');
                                linkElement.setAttribute('href', dataUri);
                                linkElement.setAttribute('download', exportFileDefaultName);
                                linkElement.click();
                            }}
                            className="relative group flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                        >
                            <i className="bi bi-download"></i>
                            <span>{t("Download JSON")}</span>
                            {/* Hover Tooltip */}
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                {t("Download JSON")}
                            </span>
                        </button>

                        {/* Recommendation Button (Top Bar Style + Tooltip) */}
                        {recommendation && recommendation.length > 0 && (
                            <button
                                title={t("Show Recommendations")}
                                onClick={() => setIsRecommendationModalOpen(true)}
                                className="relative group flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                            >
                                <i className="bi bi-lightbulb"></i>
                                <span>{t("Recommendations")}</span>
                                {/* Hover Tooltip */}
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                    {t("Recommendations")}
                                </span>
                            </button>
                        )}
                    </div>
                    
                    {/* 修改搜索栏样式 */}
                    <div ref={filterScrollRef} className="px-4 py-3 flex items-center space-x-2 overflow-x-auto category-scrolling-wrapper">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className="py-2 pl-9 pr-4 w-28 bg-white border border-gray-200 rounded-full text-sm focus:outline-none"
                                value={localStorage.getItem("Google-language")?.includes("Chinese") ? selectedCHI : selectedName}
                                onChange={localStorage.getItem("Google-language")?.includes("Chinese") ? handleCHIChange : handleNameChange}
                            />
                        </div>
                        <button className="py-2 px-4 bg-white border border-gray-200 rounded-full text-sm flex-shrink-0">
                            Out of stock
                        </button>
                        <button className="py-2 px-4 bg-white border border-gray-200 rounded-full text-sm flex-shrink-0">
                            Availability sche...
                        </button>
                    </div>
                    
                    {/* Category Filters - 保持原有功能，只修改样式 */}
                    <div className={`mb-4 flex flex-col sm:flex-row sm:items-center gap-3 ${(!foods || foods.length === 0) ? 'hidden' : ''}`}>
                        <div className="flex-grow mt-4">
                            <div ref={scrollingWrapperRef} className="flex space-x-2 overflow-x-auto pb-2 category-scrolling-wrapper">
                                <button
                                    onClick={() => setSelectedFoodType("")}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 flex-shrink-0 ${selectedFoodType === ""
                                        ? 'bg-gray-700 text-white' // Using darker gray for active
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                        }`}
                                >
                                    {t("All")}
                                </button>
                                {foodTypes.map((foodType) => (
                                    <button
                                        key={foodType}
                                        onClick={() => setSelectedFoodType(foodType)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 flex-shrink-0 ${selectedFoodType === foodType
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                            }`}
                                    >
                                        {foodType && foodType.length > 1 ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1)) : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 保留原有的菜单项显示 */}
                    {/* Conditional Rendering for Grid or Intro Text */}
                    {foods && foods.length === 0 ? (
                        // Show Intro Text when no food items exist
                        <div className="pt-10 pb-8 text-center">
                            <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-4">
                                Visualize Your Menu with AI
                            </h1>
                            <p className="text-gray-600 text-lg mb-6 max-w-3xl mx-auto">
                                We'll provide recommendations and help you visualize your menu with AI. Simply snap a picture of your menu, and we'll generate images of each dish to help you choose your order more easily.
                            </p>
                            <div className="inline-block bg-orange-100 text-orange-800 px-5 py-2 rounded-full text-sm font-medium shadow-sm">
                                100% free and powered by 7dollar.delivery's AI
                            </div>
                            {/* Optionally add a prominent Scan button here? */}
                        </div>
                    ) : (
                        // Show Food Items Grid when food items exist
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                            {foods
                                .filter(food => selectedFoodType === "" || food.category === selectedFoodType)
                                .filter(food => selectedName === "" || food.name.toLowerCase().includes(selectedName.toLowerCase()))
                                .filter(food => {
                                    if (selectedCHI === "") return true;
                                    const pinyinCHI = convertToPinyin(food.CHI).toLowerCase();
                                    return food.CHI.includes(selectedCHI) || pinyinCHI.includes(selectedCHI.toLowerCase());
                                })
                                .filter(item => !(item?.name === "Enter Meal Name" && item?.CHI === "填写菜品名称"))
                                ?.map((item, index) => (
                                    <FoodItem
                                        key={item.id} // Use item.id for key
                                        item={item}
                                        updateItem={updateItem}
                                        deleteFood_array={deleteFood_array}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {/* --- Floating Action Button Area (Mobile - lg:hidden) --- */}
                <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end space-y-2 lg:hidden">

                    {/* 主按钮 - 根据菜单状态显示加号或关闭图标 */}
                    <button
                        onClick={toggleAddMenu}
                        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        {isAddMenuOpen ? (
                            <FontAwesomeIcon icon={faTimes} className="text-white text-xl" />
                        ) : (
                            <FontAwesomeIcon icon={faPlus} className="text-white text-xl" />
                        )}
                    </button>

                    {/* 遮罩层 */}
                    {isAddMenuOpen && (
                        <div 
                            className="fixed inset-0 bg-black bg-opacity-50 z-50"
                            onClick={toggleAddMenu}
                        ></div>
                    )}

                    {/* 弹出菜单 */}
                    {isAddMenuOpen && (
                        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl w-64 overflow-hidden z-[60]">
                            <div className="divide-y divide-gray-100">
                                {/* Recommendations 按钮 */}
                                {recommendation && recommendation.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setIsRecommendationModalOpen(true);
                                            toggleAddMenu(); // 关闭菜单
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faLightbulb} className="w-4 h-4 mr-3 text-gray-400" />
                                        <span className="text-gray-700">{t("Recommendations")}</span>
                                    </button>
                                )}

                                {/* Scanner功能 */}
                                <div className="px-4 py-3 hover:bg-gray-50">
                                    <Scanner
                                        store={store}
                                        reload={reload}
                                        onScanComplete={handleScanComplete}
                                        t={t}
                                        isButton={true}
                                        buttonLabel="Scan a printed menu"
                                        icon={<FontAwesomeIcon icon={faCamera} className="w-4 h-4 mr-3 text-gray-400" />}
                                        buttonClassName="w-full text-left flex items-center"
                                        iconClassName="text-gray-700"
                                    />
                                </div>
                                
                                {/* Clear Data功能 */}
                                <button 
                                    onClick={() => {
                                        if (window.confirm(t("Are you sure?"))) {
                                            localStorage.setItem(store, "[]"); 
                                            setFoods([]); 
                                            setData([]); 
                                            setRecommendation([]);
                                            setScanStatusMessage(t('Cleared.')); 
                                            setTimeout(() => setScanStatusMessage(''), 3000);
                                            toggleAddMenu(); // 关闭菜单
                                        }
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-gray-700">{t("Clear Data")}</span>
                                </button>
                                
                                {/* JSON功能 */}
                                <button 
                                    onClick={() => {
                                        const dataStr = JSON.stringify(JSON.parse(localStorage.getItem(store) || "[]"), null, 2);
                                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                        const exportFileDefaultName = 'menu.json';
                                        const linkElement = document.createElement('a');
                                        linkElement.setAttribute('href', dataUri);
                                        linkElement.setAttribute('download', exportFileDefaultName);
                                        linkElement.click();
                                        toggleAddMenu(); // 关闭菜单
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center"
                                >
                                    <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-3 text-gray-400" />
                                    <span className="text-gray-700">{t("Download JSON")}</span>
                                </button>
                                
                                
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendation Modal */}
                {isRecommendationModalOpen && (
                    <div
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black bg-opacity-50" // Higher z-index than FAB
                        onClick={() => setIsRecommendationModalOpen(false)} // Close on backdrop click
                    >
                        <div
                            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Menu Recommendations
                                </h3>
                                <button
                                    onClick={() => setIsRecommendationModalOpen(false)}
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            {/* Modal Body - Contains the RecommendationSection */}
                            <div className="p-6">
                                <RecommendationSection recommendation={recommendation} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 食品项组件
const FoodItem = ({ item, updateItem, deleteFood_array }) => {
    const [isModalGeneratePicOpen, setModalGeneratePicOpen] = useState(false);
    const [imgGallery, setImgGallery] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(item.image || add_image); // Use item image or fallback

    const handleFileChangeAndUpload = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('https://hello-world-twilight-art-645c.eatify12.workers.dev/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                const newImageUrl = data.result.variants[0];
                setPreviewUrl(newImageUrl);
                updateItem(item.id, { ...item, image: newImageUrl });
            } else { console.error('Image upload failed:', data.errors); }
        } catch (error) {
            console.error('Image upload error:', error);
        }
    };

    const generatePic = async (item) => {
        // setPreviewUrl(add_image) // Maybe don't reset preview immediately
        setImgGallery([]); // Clear previous gallery
        try {
            const myFunction = firebase.functions().httpsCallable('generatePic');
            const result = await myFunction({ CHI: item.CHI, name: item.name });
            setImgGallery(result.data.result || []);
        } catch (error) {
            console.error("Error generating pic:", error);
            setImgGallery([]);
        }
    };

    const selectPic = (pic_url, item) => {
        updateItem(item.id, { ...item, image: pic_url });
        setPreviewUrl(pic_url);
        handleModalGeneratePicClose();
    };

    const handleModalGeneratePicOpen = (item) => {
        setModalGeneratePicOpen(true);
        generatePic(item); // Generate pics when modal opens
    };

    const handleModalGeneratePicClose = () => {
        setModalGeneratePicOpen(false);
        setImgGallery([]); // Clear gallery when closing
    };

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

    // Determine screen size (consider moving this to a context or higher-level component if used elsewhere)
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        function handleResize() { setWidth(window.innerWidth); }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isMobile = width <= 768;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center space-x-3 hover:shadow-sm transition-shadow duration-150">
            <div className="flex-shrink-0">
                <label className='cursor-pointer block'>
                    <img
                        className="h-16 w-16 object-cover rounded-md"
                        src={previewUrl}
                        loading="lazy"
                        alt={`${item.name || 'Food item'} image`}
                        onClick={() => handleModalGeneratePicOpen(item)}
                    />
                </label>
            </div>

            <div className="flex-grow min-w-0">
                <div className='font-medium text-gray-900 truncate notranslate'>
                    {item?.name} {item?.CHI}
                </div>
                <div className="text-sm text-gray-500 notranslate">
                    ${item.subtotal}
                </div>
            </div>

            {isModalGeneratePicOpen && (
                <div id="defaultModal"
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
                    style={{ margin: 0 }}
                    onClick={handleModalGeneratePicClose}
                >
                    <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between p-4 border-b rounded-t">
                            <h3 className="text-lg font-semibold text-gray-900 notranslate">
                                {item.name} {item.CHI} might look like ...
                            </h3>
                            <button
                                onClick={handleModalGeneratePicClose}
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                <span className="sr-only">{t("Close modal")}</span>
                            </button>
                        </div>
                        <div className='p-3'>
                            {imgGallery.length === 0 ? (
                                <div className="flex justify-center items-center h-20">
                                    <p className="text-gray-500">Generating images...</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {imgGallery.map((gen_img, index) => (
                                        <div key={index} className="h-min overflow-hidden rounded-md">
                                            <img
                                                loading="lazy"
                                                className="h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-md"
                                                src={gen_img}
                                                alt={`Generated image ${index + 1}`}
                                                onClick={() => selectPic(gen_img, item)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 保留原有的 RecommendationSection 组件
const RecommendationSection = ({ recommendation }) => {
    return (
        <div>
            <div className="space-y-4">
                {recommendation && recommendation.map((section, index) => (
                    <div key={index}>
                        <h4 className="font-medium text-gray-700 mb-1">{section?.title}</h4>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            {section?.entries.map((entry, idx) => (
                                <li key={idx} className="text-sm text-gray-600">
                                    <strong className="text-gray-700 notranslate">{entry?.name}:</strong> {entry?.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Food
