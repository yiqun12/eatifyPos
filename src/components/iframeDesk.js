import React from 'react';
import './style.css';
import { useCallback, useState, useEffect } from 'react';
import { collection, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, deleteField, getDocs, query, where } from "firebase/firestore";
import { db } from '../firebase/index';
import { useMyHook } from '../pages/myHook';
import Button from '@mui/material/Button';
import icons8Drawer from './icons8-drawer-32.png'; // Tell webpack this JS file uses this image
import plusSvg from '../pages/plus.svg';
import minusSvg from '../pages/minus.svg';
import { useRef } from "react";
import { data_ } from '../data/data.js'
import firebase from 'firebase/compat/app';

import InStore_food from '../pages/inStore_food'
import InStore_shop_cart from '../pages/inStore_shop_cart'
import { useUserContext } from "../context/userContext";
import Dnd_Test from '../pages/dnd_test';
import { onSnapshot } from 'firebase/firestore';
import { forwardRef, useImperativeHandle } from 'react';

// 引入一些额外的 UI 组件
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { Modal, ModalHeader } from '@mui/material';
import { toast } from 'react-hot-toast';

// Create a CSS class to hide overflow
const bodyOverflowHiddenClass = 'body-overflow-hidden';

const Iframe = forwardRef(({ src, width, height, storeName, title }, ref) => {
    const iframeRef = useRef();
    //console.log("title", title)

    const sendMessage = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
        }
    };

    useImperativeHandle(ref, () => ({
        sendMessage,
    }));
    useEffect(() => {
        iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
    }, [title]);

    useEffect(() => {
        const fetchHtml = async () => {
            try {
                const response = await fetch(src);
                const html = await response.text();
                iframeRef.current.contentWindow.document.open();
                iframeRef.current.contentWindow.document.write(html);
                iframeRef.current.contentWindow.document.close();
            } catch (error) {
                console.error('Error fetching HTML:', error);
            }
        };

        fetchHtml();
    }, []);
    useEffect(() => {
        // existing fetchHtml logic...

        iframeRef.current.onload = () => {
            iframeRef.current.contentWindow.postMessage(storeName + '_restaurant_seat_arrangement', '*');
        };
    }, []);
    //width
    return <iframe ref={iframeRef} title="Seat" width={width} height={height} />;
});

function App({ isModalOpen, setModalOpen, setSelectedTable, selectedTable, setIsVisible, store, acct, TaxRate }) {

    const [divWidth, setDivWidth] = useState(0);
    const divRef = useRef();

    const [title, setTitle] = useState(0);

    const [iframeHeight, setIframeHeight] = useState(0); // Start with a default value

    // 添加成员管理所需的状态
    const [tableOrders, setTableOrders] = useState({});
    const [activeMemberId, setActiveMemberId] = useState("1"); // 默认激活第一个成员
    
    // 获取当前成员的键
    const getCurrentMemberKey = () => {
        return `${store}-${selectedTable}-member-${activeMemberId}`;
    };
    
    // 计算当前激活成员的订单信息
    const activeMemberOrder = tableOrders[activeMemberId] || { name: "", order: [] };
    
    // 初始化或加载tableOrders数据
    useEffect(() => {
        if (selectedTable) {
            const membersKey = `${store}-${selectedTable}-members`;
            const storedOrders = localStorage.getItem(membersKey);
            
            if (storedOrders) {
                setTableOrders(JSON.parse(storedOrders));
            } else {
                // 初始化一个默认的成员订单结构
                const initialOrders = {
                    "1": { name: "成员1", order: [] }
                };
                setTableOrders(initialOrders);
                localStorage.setItem(membersKey, JSON.stringify(initialOrders));
            }
        }
    }, [store, selectedTable]);

    useEffect(() => {
        // Function to update height based on the viewport
        const updateHeight = () => {
            const vhInPx = window.innerHeight; // 100vh equivalent in pixels
            setIframeHeight(vhInPx - 100); // Set the state to this value
        };

        // Calculate height on mount
        updateHeight();

        // Listen to resize events to adjust the height dynamically
        window.addEventListener('resize', updateHeight);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, []); // Empty dependency array means this effect will only run on mount and unmount


    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            // Assuming you are observing only one element
            const { width } = entries[0].contentRect;
            console.log(width)
            setDivWidth(width);
        });

        if (divRef.current) {
            resizeObserver.observe(divRef.current);
        }

        // Clean up function to stop observing the element when the component unmounts
        return () => {
            if (divRef.current) {
                resizeObserver.unobserve(divRef.current);
            }
        };
    }, []); // Empty dependency array means this effect will only run on mount and unmount


    const syncData = async () => {
        console.log("sync data")

        let sessionData;

        try {
            // Get a reference to the specific document with ID equal to store
            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);

            // Fetch the document
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                // The document exists
                sessionData = docSnapshot.data().key;
                const { key, ...rest } = docSnapshot.data();
                localStorage.setItem("TitleLogoNameContent", JSON.stringify(rest));
                console.log("rest")
                console.log(rest.restaurant_seat_arrangement)
                localStorage.setItem(store + '_restaurant_seat_arrangement', rest.restaurant_seat_arrangement)
                setTitle(Math.random())
                saveId(Math.random());
            }

        } catch (error) {
            console.error("Error fetching the document:", error);
        }

    }



    useEffect(() => {
        syncData();
    }, []);

    const { user, user_loading } = useUserContext();

    const buttonStyles = {
        // Converting global and element styles to React's inline style
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        color: 'inherit',
        margin: '0',
        overflow: 'visible',
        textTransform: 'none',
        cursor: 'pointer',
        WebkitAppearance: 'button',

        // .btn styles
        display: 'inline-block',
        padding: '6px 12px',
        marginBottom: '0',
        fontWeight: '400',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        touchAction: 'manipulation',
        background: 'none',
        border: '1px solid transparent',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.42857143',
        // .btn-primary styles
        color: '#fff',
        backgroundColor: '#eea236',
        borderColor: '#eea236',

        // .btn-group-vertical>.btn, .btn-group>.btn styles
        position: 'relative',
        float: 'left',

        // .btn-group>.btn:first-child styles
        marginLeft: '12px',

        // .btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle) styles
        // Note: Pseudo selectors like :not, :last-child, etc. can't be directly translated to inline styles.
        borderTopRightRadius: '0',
        borderBottomRightRadius: '0',
    };

    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);

    // for translate
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
    const iframeRef = useRef(null);
    const [changeEvent, setChangeEvent] = useState("seat");


    const handleClick = () => {
        iframeRef.current.sendMessage();
        //setChangeEvent(changeEvent+1)
    };

    const SetTableInfo = async (table_name, product) => {
        try {
            const dateTime = new Date().toISOString();
            const date = dateTime.slice(0, 10) + '-' + dateTime.slice(11, 13) + '-' + dateTime.slice(14, 16) + '-' + dateTime.slice(17, 19) + '-' + dateTime.slice(20, 22);

            const docData = { product: product, date: date };

            const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", table_name);
            await setDoc(docRef, docData);
            //localStorage.setItem(store + "-" + selectedTable, JSON.stringify(groupAndSumItems(JSON.parse(product))))
            //localStorage.setItem(table_name, product)

        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    async function processPayment() {
        console.log("processPayment");

        try {
            const processPaymentFunction = firebase.functions().httpsCallable('processPayment');

            const response = await processPaymentFunction({
                keepWarm: true
            });


            const createPaymentIntent = firebase.functions().httpsCallable('createPaymentIntent');

            const response2 = await createPaymentIntent({
                keepWarm: true
            });

            console.log("the response was okay");
            return response.data;
        } catch (error) {
            console.error("There was an error with processPayment:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }



    async function cancel() {
        console.log("cancel");
        try {
            const cancelActionFunction = firebase.functions().httpsCallable('cancelAction');

            const response = await cancelActionFunction({
                keepWarm: true
            });

            console.log("the response was okay");
            return response.data;

        } catch (error) {
            console.error("There was an error with cancel:", error.message);
            throw error; // rethrow to handle it outside of the function or display to user
        }
    }
    // the selectedTable variable allows you to keep track which table you have selected
    const [selectedSeatMode, setSelectedSeatMode] = useState("customer");
    // the below messageHandler + useEffect() below allows for communication from iframe to parent window
    const messageHandler = useCallback((event) => {
        // console.log(event.data);

        // the code serves to communicate with the iframe
        if (event.data.includes('selected_table')) {
            // Extract the table number after the colon and trim any whitespace
            const tableNumber = event.data.split('selected_table')[1].trim();

            // Set the table number to the selectedTable state
            setSelectedTable(tableNumber);
            console.log(tableNumber);
            setModalOpen(true);
            setIsVisible(false)
            if (localStorage.getItem(store + "-" + tableNumber) === null) {
                // If it doesn't exist, set the value to an empty array
                //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
                SetTableInfo(store + "-" + tableNumber, JSON.stringify([]))
            }
            if (!localStorage.getItem(store + "-" + tableNumber)) {
                // If it doesn't exist, set the value to an empty array
                //localStorage.setItem(store + "-" + selectedTable, JSON.stringify([]));
                SetTableInfo(store + "-" + tableNumber, JSON.stringify([]))
            }
            processPayment()//kepp the cloud function warm and get ready
            cancel()//kepp the cloud function warm and get ready
        } else if (event.data === "admin mode active") {
            setSelectedSeatMode("admin");
        } else if (event.data === "customer mode active") {
            setSelectedSeatMode("customer");
            //synOldLayOut(store)
        } else if (event.data === "save mode active") {
            setSelectedSeatMode("customer");
            handleFormSubmit(store)
        } else if (event.data === "table_deselected") {
            setSelectedTable("null");
            saveId(Math.random());
            console.log(event.data)
            console.log("Table deselected");
        }
        else if (event.data === 'reload') {
            synOldLayOut(store)
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
            iframeRef.current.src = src;
        }
    }, [src]);

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
    const [count, setCount] = useState(0);

    // Function to update the state
    const reRenderDiv = () => {
        setCount(prevCount => prevCount + 1); // This will trigger a re-render
    };

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

    function compareLayouts(layout1, layout2) {
        const getTableNames = (layout) => layout.table.map(t => t.tableName);
        const tableNames1 = getTableNames(layout1);
        const tableNames2 = getTableNames(layout2);

        const added = tableNames2.filter(name => !tableNames1.includes(name)).map(name => ({ name, change: 'added' }));
        const deleted = tableNames1.filter(name => !tableNames2.includes(name)).map(name => ({ name, change: 'deleted' }));

        return [...added, ...deleted];
    }

    const synOldLayOut = async (store) => {
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
        const old_layout = await getDoc(docRef)
        //console.log("hello")
        localStorage.setItem(store + "_restaurant_seat_arrangement", old_layout.data().restaurant_seat_arrangement)
        setTitle(Math.random())
        handleClick()
        saveId(Math.random());
    }

    const handleFormSubmit = async (store) => {

        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store);
        const old_layout = await getDoc(docRef)
        const combined = compareLayouts(JSON.parse(old_layout.data().restaurant_seat_arrangement), JSON.parse(localStorage.getItem(store + "_restaurant_seat_arrangement")))
        console.log(combined)
        combined.forEach(async (item) => {
            if (item.change === 'added') {
                console.log("added")
                const docRefTable_ = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", store + "-" + item.name)
                // Corrected the syntax for concatenating `store` and `item.id`
                await setDoc(docRefTable_, { product: "[]" }, { merge: true });
                console.log(`Added: ${item.name}`);
            } else if (item.change === 'deleted') {
                // Corrected the syntax here as well
                await deleteDoc(doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", store, "Table", store + "-" + item.name));
                console.log(`Deleted: ${item.name}`);
            }
        });
        //console.log(compareLayouts(JSON.parse(old_layout.data().restaurant_seat_arrangement), JSON.parse(localStorage.getItem(store + "_restaurant_seat_arrangement"))))

        // Update the 'key' field to the value retrieved from localStorage
        await updateDoc(docRef, {
            restaurant_seat_arrangement: localStorage.getItem(store + "_restaurant_seat_arrangement")

        });
        alert("Updated Successful");
    };

    // for split payment modal

    const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);

    const openSplitPaymentModal = () => {
        setIsSplitPaymentModalOpen(true);
        // Add a CSS class to disable body scroll
        document.body.classList.add('bodyOverflowHiddenClass');
    };

    const closeSplitPaymentModal = () => {
        setIsSplitPaymentModalOpen(false);
        // Remove the CSS class to enable body scroll
        document.body.classList.remove('bodyOverflowHiddenClass');
    };
    // const [currentTime, setCurrentTime] = useState(new Date());

    // useEffect(() => {
    //     const intervalId = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 100); // Update every 100 milliseconds

    //     return () => {
    //         clearInterval(intervalId);
    //     };
    // }, []);
    const [width, setWidth] = useState(window.innerWidth - 64);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth - 64);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const isPC = width >= 1024;
    const isMobile = width <= 768;

    const [view, setView] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    const [OpenChangeAttributeModal, setOpenChangeAttributeModal] = useState(false);

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

    //send info to kitchen
    function SendToKitchen() {
        // 检查是否有订单需要发送
        if (!tableOrders || Object.keys(tableOrders).length === 0) {
            console.log("没有成员，无法发送订单");
            toast.error("没有成员，无法发送订单！", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        // 检查是否有任何成员有未发送的订单
        let hasOrders = false;
        for (const memberId in tableOrders) {
            if (tableOrders[memberId].order && tableOrders[memberId].order.length > 0) {
                hasOrders = true;
                break;
            }
        }

        if (!hasOrders) {
            console.log("所有成员的购物车都是空的，无法发送订单");
            toast.error("购物车是空的，无法发送订单！", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        // 记录已发送的订单
        const sentOrdersKey = `${store}-${selectedTable}-sentOrders`;
        let sentOrders = {};
        try {
            const sentOrdersJson = localStorage.getItem(sentOrdersKey);
            if (sentOrdersJson) {
                sentOrders = JSON.parse(sentOrdersJson);
            }
        } catch (error) {
            console.error("解析已发送订单时出错:", error);
            sentOrders = {};
        }

        // 合并所有成员的订单，并标记成员ID
        const allOrders = [];
        for (const memberId in tableOrders) {
            const memberData = tableOrders[memberId];
            if (memberData.order && memberData.order.length > 0) {
                // 获取此成员之前发送的订单
                const previousSentOrders = sentOrders[memberId] || [];
                
                // 标记新订单并添加到已发送订单中
                const newOrders = memberData.order.map(item => ({
                    ...item,
                    memberId,
                    memberName: memberData.name
                }));
                
                // 添加到发送列表
                allOrders.push(...newOrders);
                
                // 更新此成员的已发送订单
                sentOrders[memberId] = [...previousSentOrders, ...memberData.order];
            }
        }

        // 保存已发送的订单到localStorage
        localStorage.setItem(sentOrdersKey, JSON.stringify(sentOrders));

        // 发送所有订单到厨房
        if (allOrders.length > 0) {
            const orderData = {
                orders: allOrders,
                tableId: selectedTable,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            // 保存到Firestore
            const kitchenOrdersRef = doc(db, "kitchenOrders", `${store}-${selectedTable}`);
            setDoc(kitchenOrdersRef, orderData, { merge: true })
                .then(() => {
                    console.log("订单已成功发送到厨房");
                    toast.success("订单已成功发送到厨房！", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                })
                .catch((error) => {
                    console.error("发送订单到厨房时出错:", error);
                    toast.error("发送订单失败，请重试！", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                });
        }
    }

    // 切换当前激活的成员
    const handleMemberTabClick = (memberId) => {
        setActiveMemberId(memberId);
    };

    // 计算成员订单中的商品总数
    const getMemberItemCount = (memberId) => {
        if (!tableOrders[memberId] || !tableOrders[memberId].order) {
            return 0;
        }
        return tableOrders[memberId].order.reduce((total, item) => total + item.quantity, 0);
    };

    // 添加新成员到桌子
    const handleAddMember = () => {
        // 生成新的成员ID
        const newMemberId = (Math.max(0, ...Object.keys(tableOrders).map(id => parseInt(id))) + 1).toString();
        
        // 创建新成员对象
        const newMember = {
            name: `成员${newMemberId}`,
            order: []
        };
        
        // 更新tableOrders状态
        const updatedOrders = {
            ...tableOrders,
            [newMemberId]: newMember
        };
        
        // 更新状态并保存到localStorage
        setTableOrders(updatedOrders);
        setActiveMemberId(newMemberId); // 自动切换到新成员
        
        // 保存到localStorage
        const membersKey = `${store}-${selectedTable}-members`;
        localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
    };

    // 清空当前活跃成员的购物车
    const handleClearActiveMemberCart = () => {
        if (!tableOrders[activeMemberId]) {
            return;
        }
        
        // 更新tableOrders，将当前成员的order设为空数组
        const updatedOrders = {
            ...tableOrders,
            [activeMemberId]: {
                ...tableOrders[activeMemberId],
                order: []
            }
        };
        
        // 更新状态
        setTableOrders(updatedOrders);
        
        // 保存到localStorage
        const membersKey = `${store}-${selectedTable}-members`;
        localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
    };

    // 删除当前成员购物车中的商品
    const handleDeleteCartItem = (productId) => {
        if (!tableOrders[activeMemberId] || !tableOrders[activeMemberId].order) {
            return;
        }
        
        // 复制当前成员的订单
        const currentOrder = [...tableOrders[activeMemberId].order];
        
        // 找到要删除的商品索引
        const itemIndex = currentOrder.findIndex(item => item.id === productId);
        
        // 如果找到了商品，从数组中删除
        if (itemIndex !== -1) {
            currentOrder.splice(itemIndex, 1);
            
            // 更新tableOrders
            const updatedOrders = {
                ...tableOrders,
                [activeMemberId]: {
                    ...tableOrders[activeMemberId],
                    order: currentOrder
                }
            };
            
            // 更新状态并保存到localStorage
            setTableOrders(updatedOrders);
            const membersKey = `${store}-${selectedTable}-members`;
            localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
        }
    };

    // 增加当前成员购物车中商品的数量
    const handleIncrementCartItem = (productId) => {
        if (!tableOrders[activeMemberId] || !tableOrders[activeMemberId].order) {
            return;
        }
        
        // 复制当前成员的订单
        const currentOrder = [...tableOrders[activeMemberId].order];
        
        // 找到要增加数量的商品
        const itemIndex = currentOrder.findIndex(item => item.id === productId);
        
        // 如果找到了商品，增加其数量
        if (itemIndex !== -1) {
            currentOrder[itemIndex] = {
                ...currentOrder[itemIndex],
                quantity: currentOrder[itemIndex].quantity + 1
            };
            
            // 更新tableOrders
            const updatedOrders = {
                ...tableOrders,
                [activeMemberId]: {
                    ...tableOrders[activeMemberId],
                    order: currentOrder
                }
            };
            
            // 更新状态并保存到localStorage
            setTableOrders(updatedOrders);
            const membersKey = `${store}-${selectedTable}-members`;
            localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
        }
    };

    // 减少当前成员购物车中商品的数量
    const handleDecrementCartItem = (productId) => {
        if (!tableOrders[activeMemberId] || !tableOrders[activeMemberId].order) {
            return;
        }
        
        // 复制当前成员的订单
        const currentOrder = [...tableOrders[activeMemberId].order];
        
        // 找到要减少数量的商品
        const itemIndex = currentOrder.findIndex(item => item.id === productId);
        
        // 如果找到了商品，且数量大于1，减少其数量
        if (itemIndex !== -1 && currentOrder[itemIndex].quantity > 1) {
            currentOrder[itemIndex] = {
                ...currentOrder[itemIndex],
                quantity: currentOrder[itemIndex].quantity - 1
            };
            
            // 更新tableOrders
            const updatedOrders = {
                ...tableOrders,
                [activeMemberId]: {
                    ...tableOrders[activeMemberId],
                    order: currentOrder
                }
            };
            
            // 更新状态并保存到localStorage
            setTableOrders(updatedOrders);
            const membersKey = `${store}-${selectedTable}-members`;
            localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
        } 
        // 如果数量为1，则直接删除该商品
        else if (itemIndex !== -1 && currentOrder[itemIndex].quantity === 1) {
            handleDeleteCartItem(productId);
        }
    };

    // 添加菜品到当前成员的购物车
    const handleAddToCart = (product) => {
        if (!tableOrders[activeMemberId]) {
            return;
        }
        
        // 复制当前成员的订单
        const currentOrder = [...tableOrders[activeMemberId].order];
        
        // 检查商品是否已在购物车中
        const existingItemIndex = currentOrder.findIndex(item => item.id === product.id);
        
        // 如果商品已在购物车中，增加其数量
        if (existingItemIndex !== -1) {
            currentOrder[existingItemIndex] = {
                ...currentOrder[existingItemIndex],
                quantity: currentOrder[existingItemIndex].quantity + 1
            };
        } 
        // 否则添加新商品
        else {
            currentOrder.push({
                ...product,
                quantity: 1
            });
        }
        
        // 更新tableOrders
        const updatedOrders = {
            ...tableOrders,
            [activeMemberId]: {
                ...tableOrders[activeMemberId],
                order: currentOrder
            }
        };
        
        // 更新状态并保存到localStorage
        setTableOrders(updatedOrders);
        const membersKey = `${store}-${selectedTable}-members`;
        localStorage.setItem(membersKey, JSON.stringify(updatedOrders));
        
        // 显示添加成功提示
        toast.success(`已添加 ${product.name} 到购物车`, {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    };

    return (

        <div ref={divRef}>

            <style>
                {`
          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
            </style>
            {/* beginning of the other code */}

            {true ?

                <div>





                    {/* split_payment modal ends here */}

                    <div className='flex flex-col' style={{ alignItems: 'flex-start' }}>

                        <div style={{ margin: "10px", display: "flex" }} >
                            <div style={isMobile ? { position: 'static' } : { position: 'relative' }}>

                                <Iframe
                                    className="notranslate" key={changeEvent}
                                    ref={iframeRef} src={`${process.env.PUBLIC_URL}/seat.html`} width={(divWidth) + "px"} height={`${iframeHeight}px`} storeName={store}
                                    title={title} />

                                {isModalOpen && (
                                    <div id="addTableModal" className="modal fade show" role="dialog" style={{

                                        display: 'block', position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,1)', overflow: 'hidden'
                                    }}>
                                        <div role="document" className='m-2' style={{ overflowY: 'hidden' }}>
                                            <div className="modal-content" style={{ overflowY: 'hidden', /* Add scrollbar styles inline */ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                                                <div className="modal-header flex items-center justify-between p-4" style={{
                                                    borderBottom: '1px solid #dee2e6',
                                                    backgroundColor: '#f8f9fa' // 标题栏使用非常浅的灰色
                                                }}>
                                                            <div>
                                                        <h5 style={{ fontWeight: '600', color: '#212529', margin: 0 }}>
                                                            Dining table : {selectedTable}
                                                        </h5>
                                                        
                                                        {/* 成员切换 UI */}
                                                        <div className="member-tabs mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                            {tableOrders && Object.keys(tableOrders).map((memberId) => (
                                                                <button
                                                                    key={memberId}
                                                                    onClick={() => handleMemberTabClick(memberId)}
                                                                    className={`member-tab ${activeMemberId === memberId ? 'active' : ''}`}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        border: '1px solid #ddd',
                                                                        borderRadius: '20px',
                                                                        fontSize: '14px',
                                                                        backgroundColor: activeMemberId === memberId ? '#007bff' : '#f8f9fa',
                                                                        color: activeMemberId === memberId ? 'white' : '#333',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    <span>{tableOrders[memberId].name}</span>
                                                                    {getMemberItemCount(memberId) > 0 && (
                                                                        <span style={{ 
                                                                            marginLeft: '5px', 
                                                                            backgroundColor: activeMemberId === memberId ? 'white' : '#007bff',
                                                                            color: activeMemberId === memberId ? '#007bff' : 'white',
                                                                            borderRadius: '50%',
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '12px'
                                                                        }}>
                                                                            {getMemberItemCount(memberId)}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={handleAddMember}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '20px',
                                                                    fontSize: '14px',
                                                                    backgroundColor: '#eee',
                                                                    color: '#333',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <PersonAddIcon style={{ fontSize: '16px', marginRight: '4px' }} />
                                                                Add Member
                                                            </button>
                                                    </div>
                                                    </div>
                                                    <div>
                                                        {!isPC && (
                                                            <button
                                                        onClick={() => {
                                                                    setView(true)
                                                                }}
                                                                className="btn btn-sm btn-outline-secondary mx-1 text-black border-black ">
                                                                View Orders
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (!isPC && view === true) {
                                                                setView(false)
                                                            } else {
                                                                setModalOpen(false);
                                                                setIsVisible(true)
                                                            }
                                                            SendToKitchen();
                                                        }}
                                                            className="btn btn-sm btn-primary mx-1" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}>
                                                            {isPC || !view ? "Send To Kitchen and Back" : "Back to Menu"}
                                                        </button>
                                                    </div>
                                                </div>
                                                {!isPC ?
                                                    <div key={view} className="modal-body p-0">
                                                        <div >
                                                            {view === true ?
                                                                <div>
                                                                    {/* 移动版购物车样式 */}
                                                                    <div style={{
                                                                        backgroundColor: '#e9f7ff', // 浅蓝色背景
                                                                        padding: '1rem',
                                                                        borderBottom: '1px solid #dee2e6',
                                                                        marginBottom: '0.5rem'
                                                                    }}>
                                                                        <h5 style={{ marginBottom: '1rem', fontWeight: '600', color: '#0056b3' }}>Shopping Cart</h5>
                                                                    <InStore_shop_cart
                                                                        OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                        setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                        store={store}
                                                                        acct={acct}
                                                                        selectedTable={selectedTable}
                                                                        isAllowed={isAllowed}
                                                                        setIsAllowed={setIsAllowed}
                                                                        openSplitPaymentModal={openSplitPaymentModal}
                                                                        TaxRate={TaxRate}
                                                                            activeMemberId={activeMemberId}
                                                                            getCurrentMemberKey={getCurrentMemberKey}
                                                                            onClearCart={handleClearActiveMemberCart}
                                                                            activeMemberOrder={activeMemberOrder}
                                                                            onDeleteItem={handleDeleteCartItem}
                                                                            onIncrementItem={handleIncrementCartItem}
                                                                            onDecrementItem={handleDecrementCartItem}
                                                                        />
                                                                    </div>
                                                                    {/* 移动版菜单样式 */}
                                                                    <div style={{
                                                                        backgroundColor: '#ffffff', // 白色背景
                                                                        padding: '1rem'
                                                                    }}>
                                                                        <h5 style={{ marginBottom: '1rem', fontWeight: '600', color: '#495057' }}>Menu Items</h5>
                                                                    <InStore_food
                                                                        setIsVisible={setIsVisible}
                                                                        OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                        setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                        isAllowed={isAllowed}
                                                                        setIsAllowed={setIsAllowed}
                                                                        store={store} selectedTable={selectedTable}
                                                                        view={view}
                                                                        onAddToCart={handleAddToCart}
                                                                    />
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div style={{
                                                                    backgroundColor: '#ffffff', // 白色背景
                                                                    padding: '1rem'
                                                                }}>
                                                                    <h5 style={{ marginBottom: '1rem', fontWeight: '600', color: '#495057' }}>Menu Items</h5>
                                                                <InStore_food
                                                                    setIsVisible={setIsVisible}
                                                                    OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                    setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                    isAllowed={isAllowed}
                                                                    setIsAllowed={setIsAllowed}
                                                                    store={store} selectedTable={selectedTable}
                                                                    view={view}
                                                                    onAddToCart={handleAddToCart}
                                                                />
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>


                                                    :
                                                    <div className="modal-body flex p-0" style={{ minHeight: 'calc(100vh - 150px)' }} >

                                                        <div className='w-1/2' style={{ 
                                                            backgroundColor: '#ffffff', // 菜单区保持白色
                                                            padding: '1rem',
                                                            borderRight: '1px solid #dee2e6' // 稍明显的灰色分隔线
                                                        }}>
                                                            <h5 style={{ marginBottom: '1rem', fontWeight: '600', color: '#495057' }}>Menu Items</h5>
                                                            <InStore_food
                                                                setIsVisible={setIsVisible}
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} selectedTable={selectedTable}
                                                                view={view}
                                                                onAddToCart={handleAddToCart}
                                                            />
                                                        </div>
                                                        <div className='w-1/2' style={{
                                                            backgroundColor: '#e9f7ff', // 购物车区域使用柔和的浅蓝色
                                                            padding: '1rem'
                                                        }}>
                                                            <h5 style={{ marginBottom: '1rem', fontWeight: '600', color: '#0056b3' }}>Shopping Cart</h5>
                                                            <InStore_shop_cart
                                                                OpenChangeAttributeModal={OpenChangeAttributeModal}
                                                                setOpenChangeAttributeModal={setOpenChangeAttributeModal}
                                                                isAllowed={isAllowed}
                                                                setIsAllowed={setIsAllowed}
                                                                store={store} acct={acct} selectedTable={selectedTable}
                                                                openSplitPaymentModal={openSplitPaymentModal}
                                                                TaxRate={TaxRate}
                                                                activeMemberId={activeMemberId}
                                                                getCurrentMemberKey={getCurrentMemberKey}
                                                                onClearCart={handleClearActiveMemberCart}
                                                                activeMemberOrder={activeMemberOrder}
                                                                onDeleteItem={handleDeleteCartItem}
                                                                onIncrementItem={handleIncrementCartItem}
                                                                onDecrementItem={handleDecrementCartItem}
                                                            ></InStore_shop_cart>
                                                        </div>
                                                    </div>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* 
                            <div>
                            </div> */}
                        </div>
                    </div>

                </div>
                :
                null
            }
        </div >

    );
}
export default App;


