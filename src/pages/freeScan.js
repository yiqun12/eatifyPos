import React, { useState, useEffect, useRef } from 'react'
//import { data } from '../data/data.js'
import { motion, AnimatePresence } from "framer-motion"
import { useMyHook } from '../pages/myHook';
import { useMemo } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';
import '../components/admin_food.css';
import Scanner from '../components/ScanMenu';
import { useUserContext } from "../context/userContext";
import add_image from '../components/add_image.png';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import useDynamicAttributes from '../components/useDynamicAttributes';
import pinyin from "pinyin";
import LazyLoad from 'react-lazy-load';


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

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                scrollingWrapperRef.current.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        };

        const wrapper = scrollingWrapperRef.current;
        wrapper.addEventListener('wheel', handleWheel);

        // Cleanup event listener when the component unmounts
        return () => {
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, []); // Empty dependency array means this useEffect runs once when component mounts
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

    return (
        <div className="min-h-screen from-orange-50 to-white p-4 lg:p-8">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto mb-8">
                <h2 className="text-3xl font-bold text-orange-600 mb-4">
                    Visualize Your Menu with AI
                </h2>
                <p className="text-gray-700 text-lg mb-4">
                    We'll provide recommendations and help you visualize your menu with AI. Simply snap a picture of your menu, and we'll generate images of each dish to help you choose your order more easily.
                </p>
                <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium">
                    100% free and powered by 7dollar.delivery's AI
                </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap gap-4">
                <label
                    onClick={() => {
                        localStorage.setItem(store, "[]")
                        setFoods([])
                        setData([])
                    }}
                    style={{ cursor: 'pointer' }}>
                    <div className="btn d-inline-flex btn-sm btn-danger mx-1">
                        <span className="pe-2">
                            <i className="fa fa-refresh"></i>
                        </span>
                        <span className="text-base">
                            Clear Data
                        </span>
                    </div>
                </label>
                <Scanner reload={reload} setFoods={setFoods} store={store} />
                <label
                    onClick={() => {
                        const dataStr = JSON.stringify(JSON.parse(localStorage.getItem(store) || "[]"), null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                        const exportFileDefaultName = 'menu.json';
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                    }}
                    style={{ cursor: 'pointer' }}>
                    <div className="btn d-inline-flex btn-sm btn-info mx-1">
                        <span className="pe-2">
                            <i className="fa fa-refresh"></i>
                        </span>
                        <span className="text-base">
                            Download JSON
                        </span>
                    </div>
                </label>

            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="bi bi-search text-gray-400"></i>
                    </div>
                    {localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? (
                        <input
                            translate="no"
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                            placeholder="Search for items..."
                            type="text"
                            value={selectedCHI}
                            onChange={handleCHIChange}
                        />
                    ) : (
                        <input
                            translate="no"
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                            placeholder="Search for items..."
                            type="text"
                            value={selectedName}
                            onChange={handleNameChange}
                        />
                    )}
                </div>
            </div>

            {/* Category Filters */}
            <div className="max-w-4xl mx-auto mb-8">
                <div ref={scrollingWrapperRef} className={`flex gap-2 overflow-x-auto pb-2 ${isMobile ? 'scrolling-wrapper-filter' : ''}`}>
                    <button
                        onClick={() => setSelectedFoodType("")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedFoodType === ""
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {t("All")}
                    </button>
                    {foodTypes.map((foodType) => (
                        <button
                            key={foodType}
                            onClick={() => setSelectedFoodType(foodType)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedFoodType === foodType
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {foodType && foodType.length > 1
                                ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                                : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Food Items Grid */}
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
                                <Item
                                    selectedFoodType={selectedFoodType}
                                    translateToChinese={translateToChinese}
                                    translateToEnglish={translateToEnglish}
                                    item={item}
                                    updateItem={updateItem}
                                    deleteFood_array={deleteFood_array}
                                    id={id}
                                    saveId={saveId}
                                    foodTypes={foodTypes}
                                />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};



const Item = ({ selectedFoodType, item, updateItem, deleteFood_array, saveId, id, translateToEnglish, translateToChinese, foodTypes }) => {
    const [showAdjustion, setShowAdjustion] = useState(false);

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
        //console.log('Attributes updated:', item);
        updateItem(item.id, { ...item, attributesArr: attributes })
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


    const [imgGallery, setImgGallery] = useState([]);
    const [isGenChi, setGenChi] = useState(false);
    const [isModalGeneratePicOpen, setModalGeneratePicOpen] = useState(false);

    const [width, setWidth] = useState(window.innerWidth - 64);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth - 64);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isMobile = width <= 768;

    const [previewUrl, setPreviewUrl] = useState(add_image)
    // Initialize selectedOptions with an empty array
    //const [selectedOptions, setSelectedOptions] = useState([]);
    // Define a function to toggle the selection of an option

    const toggleOption = (option) => {
        if (item.availability.includes(option)) {
            // If the option is already selected, remove it
            //setSelectedOptions(selectedOptions.filter((item) => item !== option));
            //console.log(item)
            updateItem(item.id, { ...item, availability: item.availability.filter((item) => item !== option) })

        } else {
            //console.log(option)
            // If the option is not selected, add it
            //setSelectedOptions([...selectedOptions, option]);

            //console.log(item)
            updateItem(item.id, { ...item, availability: [...item.availability, option] })

        }
    };
    const [expandDetails, setExpandDetails] = useState(false);
    const [expandOptions, setExpandOptions] = useState(false);

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
                updateItem(item.id, { ...item, image: data.result.variants[0] })
                //setUploadStatus('Image uploaded successfully.');
            } else {
                //setUploadStatus(`Failed to upload image: ${JSON.stringify(data.errors)}`);
            }
        } catch (error) {
            //setUploadStatus(`Error: ${error.message}`);
        }
    };
    const generatePic = async (item) => {
        setPreviewUrl(add_image)
        try {
            const myFunction = firebase.functions().httpsCallable('generatePic');
            const result = await myFunction({ CHI: item.CHI, name: item.name });
            let ARRimage = result.data.result
            console.log(ARRimage.length)
            setImgGallery(ARRimage)
            //console.log(result.data.result)
            //return(result.data.result)
            //setResponse(result);
        } catch (error) {
            setImgGallery([])
            //console.log([])

            //return []
        }
    };
    const selectPic = (pic_url, item) => {
        //console.log(item)
        updateItem(item.id, { ...item, image: pic_url })
        handleModalGeneratePicClose()
    }


    const handleModalGeneratePicOpen = (item) => {
        //console.log(item)
        setModalGeneratePicOpen(true);
    };

    const handleModalGeneratePicClose = () => {
        setModalGeneratePicOpen(false);
    };

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
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    return (
        <div>
            {isCategoryModalOpen && (
                <div id="defaultModal" className="fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-2xl max-h-full mt-20">
                        <div className="relative bg-white rounded-lg border-black shadow">
                            <div className="flex items-start justify-between p-4 border-b rounded-t">
                                <h3 className="text-xl font-semibold text-gray-900 ">
                                    {t("Select the category that you would like to change into")}
                                </h3>
                                <button onClick={() => { setCategoryModalOpen(false) }} style={{ fontSize: '24px', lineHeight: '1', color: 'black', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', position: 'absolute', top: '15px', right: '20px' }}>
                                    &times;
                                </button>
                            </div>
                            <div className='p-4 pt-3 flex flex-row flex-wrap'>
                                {foodTypes.map((foodType) => (
                                    <button
                                        key={foodType}
                                        onClick={() => {
                                            updateItem(item.id, { ...item, category: foodType })
                                        }}
                                        className={`m-2 btn border-black text-black-600 rounded-xl px-2 py-2`}
                                        style={{ display: 'inline-flex', textUnderlineOffset: '0.5em' }}
                                    >
                                        <div>
                                            {foodType && foodType.length > 1
                                                ? t(foodType.charAt(0).toUpperCase() + foodType.slice(1))
                                                : ''}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            )}
            {isModalGeneratePicOpen && (
                <div id="defaultModal"
                    className={`${isMobile ? " w-full " : "w-[700px]"} fixed top-0 left-0 right-0 bottom-0 z-50 w-full h-full p-4 overflow-x-hidden overflow-y-auto flex justify-center bg-black bg-opacity-50`}>
                    <div className="relative w-full max-w-2xl max-h-full mt-20">
                        <div className="relative bg-white rounded-lg border-black shadow">
                            <div className="flex items-start justify-between p-4 border-b rounded-t ">
                                <h3 className="text-xl font-semibold text-gray-900 ">
                                    <span className='notranslate'>{item.name} {item.CHI} might look like ...</span>
                                </h3>
                                <button
                                    onClick={handleModalGeneratePicClose}
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center ">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">{t("Close modal")}</span>
                                </button>
                            </div>
                            <div className='p-4 pt-3 '>


                                <div className="flex flex-wrap gap-2">

                                    {imgGallery.map((gen_img, index) => (
                                        <div
                                            key={index}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            className="border rounded-lg h-[80px] w-[80px] cursor-pointer flex-shrink-0"
                                        >
                                            <div className="h-min overflow-hidden rounded-md">
                                                <img
                                                    loading="lazy"
                                                    className="h-[80px] w-[80px] hover:scale-125 transition-all cursor-pointer object-cover rounded-t-lg"
                                                    src={gen_img}
                                                    onClick={() => {
                                                        selectPic(gen_img, item);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>


                            </div>


                        </div>
                    </div>
                </div>
            )}
            <div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={""}
                className="">

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}>
                    <div
                        style={{
                            width: '80px',
                        }}>
                        <label className='cursor-pointer'
                            style={{ display: 'block', width: '100%' }}
                        >
                            <img
                                className="h-[80px] w-[80px] transition-all object-cover rounded-md"
                                src={item.image}
                                loading="lazy"
                                onClick={() => {
                                    handleModalGeneratePicOpen();
                                    generatePic(item);
                                }}
                            />
                        </label>
                    </div>

                    <div style={{ width: 'calc(100% - 80px)' }}>  {/* adjust width */}
                        <div className='text-md font-semibold notranslate '>

                            <div className="mb-1 mt-1 ml-2 flex items-center ">
                                <div>
                                    {item?.name} {item?.CHI}
                                </div>
                            </div>
                            <div className="mb-1 flex ml-2 items-center notranslate">
                                <div>
                                    ${item.subtotal}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                <div className='d-block text-md font-semibold'>

                    {expandDetails ? <div>

                        <div>
                            <p className="mb-1">
                                <span className='text-black'>
                                    {" Options:"}
                                </span>
                            </p>
                            {expandOptions ? <div><div className='d-block text-md font-semibold'>
                                <button onClick={() => setShowAdjustion(!showAdjustion)}
                                    className="btn d-inline-flex d-inline-flex btn-sm btn-light">
                                    Edit Dish Revision Category
                                </button>
                                {
                                    showAdjustion ? (
                                        <div>
                                            <div className='flex'>

                                                <span className='text-black'>
                                                    Dish Revise Category:&nbsp;

                                                </span>
                                                <input
                                                    className='text-md font-semibold'
                                                    style={{ width: "50%" }}
                                                    value={currentAttribute}
                                                    onChange={(e) => setCurrentAttribute(e.target.value)}
                                                    placeholder="Size"
                                                    translate="no"
                                                />
                                            </div>
                                            <small className='text-blue-500'>default: 'Option'(E.g.: Portion Size)</small>
                                        </div>
                                    ) : null
                                }


                                <div className='flex'>

                                    <span className='text-black'>
                                        Dish Revise Details:&nbsp;

                                    </span>

                                    <input
                                        className='text-md font-semibold'
                                        style={{ width: "50%" }}
                                        value={currentVariation.type}
                                        onChange={(e) => setCurrentVariation({ ...currentVariation, type: e.target.value })}
                                        placeholder="BG"
                                        translate="no"
                                    />
                                </div>
                                <small className='text-blue-500'>E.g.: Big</small>

                                <div className='flex'>

                                    <span className='text-black'>
                                        {t("Price: $ ")}

                                    </span>

                                    <input
                                        className='text-md font-semibold'
                                        style={{ width: "50%" }}
                                        value={currentVariation.price}
                                        onChange={(e) => setCurrentVariation({ ...currentVariation, price: e.target.value })}
                                        placeholder="1"
                                        translate="no"
                                    />
                                </div>
                                <div className='text-red-700'>
                                    {priceFormatError && <span>{priceFormatError}</span>}

                                </div>

                            </div></div>
                                :
                                <div></div>}

                            <div className='flex'>
                                <a
                                    onClick={() => {
                                        if (!expandOptions) {
                                            setExpandOptions(true);
                                        } else {
                                            resetAttributes(transformJsonToInitialState(item.attributesArr));// init
                                            addOrUpdateAttributeVariation();
                                        }
                                    }}
                                    className="mr-1 btn d-inline-flex d-inline-flex btn-sm btn-warning"
                                >
                                    <span>
                                        {!expandOptions ? "Adjust Dish Revision Option" : "Confirm"}
                                    </span>
                                </a>
                            </div>

                            {Object.entries(item.attributesArr).map(([attributeName, attributeDetails]) => (
                                <div key={attributeName}>
                                    <p className="mb-1">
                                        <span onClick={() => setCurrentAttribute(attributeName)} className='text-black' style={{ cursor: "pointer", display: "inline-block" }}>
                                            {attributeName} &nbsp;
                                        </span>
                                        <div className="custom-control custom-switch" style={{ display: "inline-block", verticalAlign: "middle" }}>

                                            <input
                                                className='form-check-input'
                                                type="checkbox"
                                                style={{ marginRight: "5px" }}
                                                checked={!attributeDetails.isSingleSelected}
                                                onChange={(e) => handleToggle(attributeName, !e.target.checked)}
                                                translate="no"
                                            />
                                        </div>
                                        {" Multi-Select"} { }
                                    </p>

                                    <div className='flex flex-wrap'>
                                        {attributeDetails.variations.map((variation, idx) => (
                                            <div>
                                                <div key={idx}>
                                                    <div onClick={() => selectVariationForEdit(attributeName, variation)} className='mb-1 mr-1 mt-1' style={{ position: 'relative', background: 'rgb(208, 229, 253)', borderRadius: '8px', padding: '10px 10px 10px 10px', height: '32px', fontFamily: "Suisse Int'l", fontStyle: 'normal', fontWeight: 600, fontSize: '12px', lineHeight: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'black', whiteSpace: 'nowrap' }}>
                                                        {variation.type}({formatPriceDisplay(variation.price)})
                                                        <span onClick={() => deleteVariation(attributeName, idx)} style={{ position: 'absolute', top: '-2px', right: '-2px', cursor: 'pointer' }}>
                                                            <i className="fas fa-times"></i>
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>

                                </div>
                            ))}


                        </div>

                        <div className='mb-3'>
                            <p className="mb-1">
                                <span className='text-black'>

                                    Time Range Availability:
                                </span>

                            </p>
                            <div className="flex">
                                {['Morning', 'Afternoon', 'Evening'].map((period) => (
                                    <div
                                        key={period}
                                        className={`mr-1 cursor-pointer relative rounded-lg px-2.5 h-8 flex items-center justify-center font-semibold text-xs leading-none tracking-wider uppercase text-black whitespace-nowrap ${item.availability.includes(period) ? 'bg-blue-200' : 'bg-white'
                                            }`}
                                        onClick={() => toggleOption(period)}
                                    >
                                        {period}
                                        {item.availability.includes(period) && (
                                            <span className="absolute top-0 right-0 cursor-pointer">
                                                {/* Ensure FontAwesomeIcon component is correctly imported to use it here */}
                                                <FontAwesomeIcon icon={faTimes} />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>


                        </div></div> : <div className='mb-2'></div>}



                </div>




            </div>

        </div >

    );
};




export default Food