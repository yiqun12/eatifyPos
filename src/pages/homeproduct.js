//import {data} from '../data/data.js'
import React, { useState, useEffect, useRef } from 'react';
import ReactShadow from 'react-shadow'; // Use default export
import { useMyHook } from '../pages/myHook';
import cartImage from './shopcart.png';
import $ from 'jquery';
import { FaTrash } from 'react-icons/fa';
import { ReactComponent as DeleteSvg } from './delete-icn.svg';
import firebase from 'firebase/compat/app';

const cartData = [
    {
        id: 1,
        src: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/48d7c78d-5662-4e15-1350-0b9f4cf7c500/public",
        alt: "POS机",
        sizes: [
            {
                name: "买断",
                description: "一次买断提供24个月维修服务，只需支付20个月的费用"
            },
            {
                name: "合约",
                description: "月付合约最少24个月, 期间提供维修服务"
            }
        ],
        options: [
            { name: "线上线下维护", subscriptionPrice: 100 },
            { name: "刷卡机", subscriptionPrice: 30 },
            { name: "热敏打印机", subscriptionPrice: 15 },
            { name: "电脑", subscriptionPrice: 60 },
            { name: "钱柜", subscriptionPrice: 15 },
            { name: "贴纸打印机", subscriptionPrice: 25 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 2,
        src: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/61912e00-f8be-4a2d-1314-68e9ac221800/public",
        alt: "在线点单和外卖配送",
        sizes: [
            {
                name: "买断",
                description: "一次买断提供24个月维修服务，只需支付20个月的费用"
            }
        ],
        options: [
            { name: "QRcode和外卖", subscriptionPrice: 5 },
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 3,
        src: "https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/4abd8ba2-6064-4be7-3e88-f8546b14da00/public",
        alt: "自助点餐机",
        sizes: [
            {
                name: "买断",
                description: "一次买断提供24个月维修服务，只需支付20个月的费用"
            },
            {
                name: "合约",
                description: "月付合约最少24个月, 期间提供维修服务"
            }
        ],
        options: [
            { name: "自助点餐机", subscriptionPrice: 150 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 4,
        src: "https://cdn.prod.website-files.com/63563536256a8d380270e964/64c3ef556abdd2827655a3cd_1-p-500.jpeg",
        alt: "公司注册服务和商业信贷",
        sizes: [
            {
                name: "买断",
                description: "提供公司注册服务，包括商标注册、补助金申请以及SBA商业信贷支持，帮助企业全面拓展市场与金融渠道"
            }
        ],
        options: [
            { name: "公司注册", subscriptionPrice: 15 },
            { name: "商标注册", subscriptionPrice: 20 },
            { name: "补助金申请", subscriptionPrice: 0 },
            { name: "SBA商业信贷支持", subscriptionPrice: 0 },
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 5,
        src: "https://paper-attachments.dropboxusercontent.com/s_44E7D875E6BAFE02DFA511556E27947E4E40F2F74334450606899F1B7D4539EE_1682588133479_+1.png",
        alt: "市场营销广告投放",
        sizes: [
            {
                name: "买断",
                description: "一次买断提供24个月市场营销服务，只需支付20个月的费用"
            },
            {
                name: "合约",
                description: "月付合约最少24个月, 期间提供市场营销服务"
            }
        ],
        options: [
            { name: "提供针对性广告投放的市场营销服务。", subscriptionPrice: 200 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 6,
        src: "https://gd-filems.dancf.com/gaoding/gaoding/70249/de960f4a-ccab-4c39-8d85-f48cbc196c3c217207.jpg",
        alt: "菜单制作",
        sizes: [
            {
                name: "买断",
                description: "专业的菜单设计服务"
            }
        ],
        options: [
            { name: "提供菜单与海报设计服务", subscriptionPrice: 10 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 7,
        src: "https://files.animiz.cn/web/animiz/blog/image/2019/08/30/1567133931584556.jpg",
        alt: "广告视频制作",
        sizes: [
            {
                name: "买断",
                description: "提供广告和推广用途的视频制作服务"
            }
        ],
        options: [
            { name: "数字人视频制作", subscriptionPrice: 20 },
            { name: "普通视频制作", subscriptionPrice: 10 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 8,
        src: "https://pp.myapp.com/ma_pic2/0/shot_10868231_1_1729129142/0",
        alt: "功能网站/手机app设计制作",
        sizes: [
            {
                name: "买断",
                description: "提供定制化的网站和应用程序设计服务，包括复杂的电商解决方案。"
            }
        ],
        options: [
            { name: "无功能个人网页", subscriptionPrice: 0 },
            { name: "复杂精致个人网页", subscriptionPrice: 0 },
            { name: "电商物流配送网页", subscriptionPrice: 0 },
            { name: "房地产网站，如盗版Zillow", subscriptionPrice: 0 },
            { name: "爬取房主联系信息寻找潜在房源卖家", subscriptionPrice: 0 },
            { name: "潜在硅谷买家联系方式", subscriptionPrice: 0 },
            { name: "库存管理的网页", subscriptionPrice: 0 }
        ],
        quantity: 0,
        selectedOptions: []
    },
    {
        id: 9,
        src: "https://s3.cn-north-1.amazonaws.com.cn/awschinablog/APIG002.png",
        alt: "使用我们的api",
        sizes: [
            {
                name: "买断",
                description: "提供一系列API服务，方便与现有系统集成"
            }
        ],
        options: [
            { name: "小商品一小时内配送API", subscriptionPrice: 20 },
            { name: "收发SMS短信API", subscriptionPrice: 20 },
            { name: "远程控制打印机API", subscriptionPrice: 30 }
        ],
        quantity: 0,
        selectedOptions: []
    }
];


const Card = () => {
    const [generatedCode, setGeneratedCode] = useState(null);

    const handleSendSMS = async () => {
        const phoneNumber = document.getElementById('phoneNumberInput').value;
        const phonePattern = /^[0-9]{10,15}$/;

        if (!phonePattern.test(phoneNumber)) {
            alert('Please enter a valid phone number.');
            return;
        }

        // Generate a new six-digit code, replacing any previous code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        // Sending code logic
        try {
            const sendSMS = firebase.functions().httpsCallable('sendSMS');
            const res = await sendSMS({ phoneNumber, message: `Your verification code is: ${code}` });
            console.log('SMS sent:', res.data);
            document.getElementById('smsCodeSection').classList.remove('hidden');
        } catch (err) {
            console.error('Error sending SMS:', err);
            alert('Failed to send SMS. Please try again.');
        }
    };

    const handleVerifyCode = async () => {
        const smsCode = document.getElementById('smsCodeInput').value;
        const userPhoneNumber = document.getElementById('phoneNumberInput').value;
        if (smsCode === generatedCode) {
            alert('Code verified successfully!');

            // Prepare the cart data and user phone number in a human-readable format
            const formattedCartData = `User Phone Number: ${userPhoneNumber}\n` +
                cart.map((item, index) => {
                    return `Item ${index + 1}:\n` +
                        `- Name: ${item.alt}\n` +
                        `- Size: ${item.size.name}\n` +
                        `- Options: ${item.options.map(opt => opt.name).join(', ')}\n` +
                        `- Quantity: ${item.quantity}\n` +
                        `- Price: $${item.price}\n`;
                }).join('\n');

            // Sending formatted cart data and user phone number to a specific phone number
            try {
                const sendSMS = firebase.functions().httpsCallable('sendSMS');
                const res = await sendSMS({ phoneNumber: '9294614214', message: formattedCartData });
                console.log('Shopping cart data sent:', res.data);
                alert('Shopping cart data and user phone number sent successfully.');
                window.location.reload();
            } catch (err) {
                console.error('Error sending shopping cart data:', err);
                alert('Failed to send shopping cart data.');
            }
        } else {
            alert('Invalid code. Please try again.');
        }
    };
    const translationsMap = new Map([
        ["买断".toLowerCase(), "Buyout"],
        ["合约".toLowerCase(), "Contract"],
        ["一次买断提供24个月维修服务，只需支付20个月的费用".toLowerCase(), "One-time purchase provides 24 months of repair service for the cost of 20 months"],
        ["月付合约最少24个月, 期间提供维修服务".toLowerCase(), "Minimum contract of 24 months, providing repair service during the period"],

        ["一次买断提供24个月市场营销服务，只需支付20个月的费用".toLowerCase(), "One-time purchase provides 24 months of digital marketing for the cost of 20 months"],
        ["月付合约最少24个月, 期间提供市场营销服务".toLowerCase(), "Minimum contract of 24 months, providing digital marketing service during the period"],

        ["线上线下维护".toLowerCase(), "Software Maintenance and Assistance"],
        ["刷卡机".toLowerCase(), "Stripe Credit Card Reader"],
        ["热敏打印机".toLowerCase(), "Thermal Printer"],
        ["电脑".toLowerCase(), "Touch Screen Monitor Laptop"],
        ["钱柜".toLowerCase(), "Cash Register Drawer"],
        ["贴纸打印机".toLowerCase(), "Brother Label Printer"],
        ["QRcode和外卖".toLowerCase(), "QR Code and Delivery"],
        ["自助点餐机".toLowerCase(), "Self-Service Ordering Kiosk Machine"],
        ["公司注册，商标注册，补助金申请，商业信贷".toLowerCase(), "Company registration, trademark registration, grant applications, and SBA business credit support"],
        ["提供公司注册服务，包括商标注册、补助金申请以及SBA商业信贷支持，帮助企业全面拓展市场与金融渠道".toLowerCase(), "Providing company registration services, including trademark registration, grant applications, and SBA business credit support, to help businesses comprehensively expand their market and financial channels."],
        ["市场营销广告投放".toLowerCase(), "Marketing and Advertising Placement"],
        ["提供针对性广告投放的市场营销服务。".toLowerCase(), "Providing targeted marketing services for advertisement placement"],
        ["菜单制作".toLowerCase(), "Menu Creation"],
        ["专业的菜单设计服务".toLowerCase(), "Professional menu design service"],
        ["广告视频制作".toLowerCase(), "Advertising Video Production"],
        ["数字人视频制作".toLowerCase(), "AI Deep Fake Character Video Production"],
        ["普通视频制作".toLowerCase(), "Standard Video Production"],
        
        ["复杂精致个人网页".toLowerCase(), "Complex and Exquisite Personal Website."],

        ["电商物流配送网页".toLowerCase(), "E-commerce logistics and delivery website"],
        ["房地产网站，如盗版Zillow".toLowerCase(), "Real estate website, such as a Zillow clone"],
        ["爬取房主联系信息寻找潜在房源卖家".toLowerCase(), "Scraping homeowner contact info to find potential sellers"],
        ["潜在硅谷买家联系方式".toLowerCase(), "Contact information for potential Silicon Valley buyers"],
        ["功能网站/手机app设计制作".toLowerCase(), "Functional Website/App Design and Development"],
        ["提供定制化的网站和应用程序设计服务，包括复杂的电商解决方案。".toLowerCase(), "Providing customized website and application design services, including complex e-commerce solutions"],
        ["无功能个人网页".toLowerCase(), "Non-functional Personal Webpage"],
        ["复杂个人网页".toLowerCase(), "Complex Personal Webpage"],
        ["类似电商外卖网页/app(自定义设计，收付款，配送，登录，热敏打印机，热敏贴纸打印机)".toLowerCase(), "E-commerce/delivery-like webpage/app (custom design, payments, delivery, login, thermal printer, thermal sticker printer)"],
        ["类似zillow/yelp网页/app(自定义设计，收付款，配送，登录)".toLowerCase(), "Zillow/Yelp-like webpage/app (custom design, payments, delivery, login)"],
        ["复杂物流库存管理的网页/app".toLowerCase(), "Complex Logistics and Inventory Management Webpage/App"],
        ["使用我们的api".toLowerCase(), "Using Our API"],
        ["提供一系列API服务，方便与您现有系统集成".toLowerCase(), "Offering a suite of API services to seamlessly integrate with your existing systems"],
        ["小商品一小时内配送API".toLowerCase(), "Small Goods One-Hour Delivery API"],
        ["收发SMS短信API".toLowerCase(), "Send and Receive SMS API"],
        ["远程控制打印机API".toLowerCase(), "Cloud Thermal Printing API"],
        ["POS机".toLowerCase(), "Restaurant POS System"],
        ["在线点单和外卖配送".toLowerCase(), "Online Ordering and Delivery"],
        ["自助点餐机".toLowerCase(), "Self-Service Ordering Kiosk Machine"],
        ["公司注册服务和商业信贷".toLowerCase(), "Company Management and Financing Service"],
        ["市场营销广告投放".toLowerCase(), "Marketing and Advertising Placement"],
        ["菜单制作".toLowerCase(), "Menu Creation"],
        ["广告视频制作".toLowerCase(), "Advertising Video Production"],
        ["使用我们的api".toLowerCase(), "Using Our API"],
        ["公司注册".toLowerCase(), "Company Registration"],
        ["商标注册".toLowerCase(), "Trademark Registration"],
        ["补助金申请".toLowerCase(), "Grant Application"],
        ["SBA商业信贷支持".toLowerCase(), "SBA Business Credit Support"],
        ["提供菜单与海报设计服务".toLowerCase(), "Providing menu and poster design services."],
        ["提供广告和推广用途的视频制作服务".toLowerCase(), "Providing Video Production Services for Advertising and Promotion Purposes."],
        ["提供一系列API服务，方便与现有系统集成".toLowerCase(), "Providing a series of API services for easy integration with existing systems."],

    ]);

    function fanyi(input) {

        return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")
            ? input
            : translate(input);
    }

    function translate(input) {
        const translation = translationsMap.get(input.toLowerCase());
        return translation ? translation : "Translation not found";
    }

    // 状态管理
    const [cart, setCart] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0); // 用于 size 单选
    const [showPopup, setShowPopup] = useState(false);
    const closePopup = () => {
        setShowPopup(false);
    };


    useEffect(() => {
        if (cart.length === 0) {
            $('#cart').attr("data-totalitems", 0);
        } else {
            $('#cart').attr("data-totalitems", "!");
        }

    }, [cart]);

    const [selectedIndices, setSelectedIndices] = useState([]); // 用于 options 多选

    const [hasUserSetActiveIndex, setHasUserSetActiveIndex] = useState(false);
    const [width, setWidth] = useState(window.innerWidth - 64);
    const intervalRef = useRef(null);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth - 64);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        handleToggle(0)
    }, []);
    const isMobile = width <= 768;

    // 自动切换图片
    useEffect(() => {
        if (!hasUserSetActiveIndex) {
            intervalRef.current = setInterval(() => {
                setActiveIndex(prevIndex => (prevIndex + 1) % cartData.length);
                setSelectedIndex(0)

                setSelectedIndices([])
                handleToggle(0)
            }, 3000);
        }

        return () => clearInterval(intervalRef.current);
    }, [hasUserSetActiveIndex]);

    // 切换图片
    const handleClick = (index) => {
        setActiveIndex(index);
        setHasUserSetActiveIndex(true);
        setSelectedIndex(0)
        setSelectedIndices([])
        handleToggle(0)
    };

    // 切换尺寸选项（单选）
    const handleSizeSelect = (index) => {
        setSelectedIndex(index);
    };

    // 切换服务选项（多选）
    const handleToggle = (index) => {
        setSelectedIndices(prevSelected =>
            prevSelected.includes(index)
                ? prevSelected.filter(i => i !== index)
                : [...prevSelected, index]
        );
    };

    // 更新 calculatePrice 函数，确保数据安全访问
    const calculatePrice = () => {
        const selectedItem = cartData[activeIndex];
        if (!selectedItem) return 0; // 确保 selectedItem 存在

        const selectedSize = selectedItem.sizes[selectedIndex];
        const selectedOptions = selectedIndices.map(index => selectedItem.options[index] || { subscriptionPrice: 0 }); // 确保 selectedItem.options 存在

        const optionsTotalPrice = selectedOptions.reduce((total, option) => total + option.subscriptionPrice, 0);
        return optionsTotalPrice * (selectedSize?.name === "买断" ? 20 : 1); // 确保 selectedSize 存在
    };

    //$('#cart').attr("data-totalitems", total);

    // 添加到购物车
    const addToCart = () => {
        const selectedItem = cartData[activeIndex];
        const selectedSize = selectedItem.sizes[selectedIndex];
        const selectedOptions = selectedIndices.map(index => selectedItem.options[index]);

        const newItem = {
            ...selectedItem,
            size: selectedSize,
            options: selectedOptions,
            price: calculatePrice(),
            quantity: 1,
            uniqueId: Date.now() + Math.random().toString(36).substr(2, 9) // 生成唯一的 ID
        };
        setHasUserSetActiveIndex(true);

        setCart(prevCart => {
            // 检查是否存在相同的购物车项
            const existingItem = prevCart.find(item =>
                item.id === newItem.id &&
                item.size.name === newItem.size.name &&
                JSON.stringify(item.options) === JSON.stringify(newItem.options)
            );

            if (existingItem) {
                // 如果存在相同项，则增加数量
                return prevCart.map(item =>
                    item.id === newItem.id &&
                        item.size.name === newItem.size.name &&
                        JSON.stringify(item.options) === JSON.stringify(newItem.options)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // 如果是新项，则添加到购物车
            return [...prevCart, newItem];
        });
        setShowPopup(true)
    };


    // 移除购物车中的项目
    const removeFromCart = (uniqueIdToRemove) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, item) => {
                // 基于 uniqueId 进行匹配
                if (item.uniqueId === uniqueIdToRemove) {
                    // 如果数量大于 1，减少数量
                    if (item.quantity > 1) {
                        return [...acc, { ...item, quantity: item.quantity - 1 }];
                    }
                    // 如果数量等于 1，则不添加到新的数组中（即移除）
                    return acc;
                } else {
                    // 如果不是要移除的项目，保持不变
                    return [...acc, item];
                }
            }, []);
        });
    };


    return (

        <div>
            <ReactShadow.div>
                <style>{`

  
  .img {
    transition: all 600ms ease-out 0s;
    -webkit-transform: translateY(0px);
    -ms-transform: translateY(0px);
    transform: translateY(0px);
    border-radius: 1px;
    background: transparent no-repeat center center;
    background-size: cover;
    border: 1px solid #e2e2e3;
    display: block;
    height: 0;
    opacity: 1; }
  
  
  
  
  header ._cont,
  .collection-list a .variants,
  .product-detail .price-shipping,
  .product-detail .btn-and-quantity-wrap,
  .product-detail .btn-and-quantity,
  .spinner,
  .tabs .tab-labels,
  .detail-socials,
  .detail-socials .social-sharing,
  .socials ul,
  footer .top,
  footer .bottom,
  footer .bottom .left nav ul,
  .swatches,
  .swatch {
      display: block
  }
  header ._cont:after,
  .collection-list a .variants:after,
  .product-detail .price-shipping:after,
  .product-detail .btn-and-quantity-wrap:after,
  .product-detail .btn-and-quantity:after,
  .spinner:after,
  .tabs .tab-labels:after,
  .detail-socials:after,
  .detail-socials .social-sharing:after,
  .socials ul:after,
  footer .top:after,
  footer .bottom:after,
  footer .bottom .left nav ul:after,
  .swatches:after,
  .swatch:after {
      clear: both;
      content: "";
      display: block;
      visibility: hidden;
      height: 0
  }
  
  /*@font-face {
      font-family: 'montserratlight';
      src: url("montserrat-light-webfont.eot");
      src: url("montserrat-light-webfont.eot?#iefix") format("embedded-opentype"), url("montserrat-light-webfont.woff") format("woff"), url("montserrat-light-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'montserratregular';
      src: url("montserrat-regular-webfont.eot");
      src: url("montserrat-regular-webfont.eot?#iefix") format("embedded-opentype"), url("montserrat-regular-webfont.woff") format("woff"), url("montserrat-regular-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'montserratbold';
      src: url("montserrat-bold-webfont.eot");
      src: url("montserrat-bold-webfont.eot?#iefix") format("embedded-opentype"), url("montserrat-bold-webfont.woff") format("woff"), url("montserrat-bold-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'robotolight';
      src: url("roboto-light-webfont.eot");
      src: url("roboto-light-webfont.eot?#iefix") format("embedded-opentype"), url("roboto-light-webfont.woff") format("woff"), url("roboto-light-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'robotoregular';
      src: url("roboto-regular-webfont.eot");
      src: url("roboto-regular-webfont.eot?#iefix") format("embedded-opentype"), url("roboto-regular-webfont.woff") format("woff"), url("roboto-regular-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'robotobold';
      src: url("roboto-bold-webfont.eot");
      src: url("roboto-bold-webfont.eot?#iefix") format("embedded-opentype"), url("roboto-bold-webfont.woff") format("woff"), url("roboto-bold-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }
  @font-face {
      font-family: 'robotoblack';
      src: url("roboto-black-webfont.eot");
      src: url("roboto-black-webfont.eot?#iefix") format("embedded-opentype"), url("roboto-black-webfont.woff") format("woff"), url("roboto-black-webfont.ttf") format("truetype");
      font-weight: normal;
      font-style: normal
  }*/
  
  html,
  body,
  div,
  span,
  h1,
  h2,
  a,
  img,
  strong,
  ol,
  ul,
  li,
  form,
  label,
  aside,
  footer,
  header,
  nav,
  section {
      margin: 0;
      padding: 0;
      border: 0;
      font: inherit;
      font-size: 100%;
      vertical-align: baseline
  }
  html {
      line-height: 1
  }
  ol,
  ul {
      list-style: none
  }
  a img {
      border: none
  }
  aside,
  footer,
  header,
  nav,
  section {
      display: block
  }
  * {
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      outline: 0 none
  }
  body {
      background-color: #fff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale
  }
  img {
      max-width: 100%
  }
  a {
      color: inherit;
      text-decoration: inherit;
      cursor: inherit;
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      cursor: pointer
  }
  a:active,
  a:focus {
      outline: none
  }
  button {
      cursor: pointer
  }
  input {
      outline: 0 none
  }
  body {
      font-family: "montserratlight", sans-serif;
      background-color: #fff;
      color: #16161a;
      font-size: 81.25%;
      line-height: 184.61538%;
      overflow-x: hidden;
      position: relative
  }
  ._cont {
      margin: 0 auto;
      width: 1110px
  }
  header nav>ul>li>a:before,
  header nav>ul>li>a:after {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEwcHgiIGhlaWdodD0iNHB4IiB2aWV3Qm94PSIwIDAgMTAgNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTQ3LjAwMDAwMCwgLTU2NS4wMDAwMDApIiBzdHJva2U9IiMxNjE2MWEiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAuMDAwMDAwLCAzNDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5LjAwMDAwMCwgMjE4LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzksNyBMNDMsMTEgTDQ3LDciIGlkPSJQYXRoLTY3LUNvcHkiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==') no-repeat center center
  }
  header nav>ul>li>a:before {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEwcHgiIGhlaWdodD0iNHB4IiB2aWV3Qm94PSIwIDAgMTAgNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTQ3LjAwMDAwMCwgLTU2NS4wMDAwMDApIiBzdHJva2U9IiMwODZmY2YiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAuMDAwMDAwLCAzNDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg5LjAwMDAwMCwgMjE4LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzksNyBMNDMsMTEgTDQ3LDciIGlkPSJQYXRoLTY3LUNvcHkiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==') no-repeat center center
  }
  header {
      font-size: 100%;
      line-height: 130.76923%;
      position: relative;
      z-index: 1000
  }
  header .header {
      -moz-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      -webkit-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      height: 74px
  }
  header .logo {
      font-family: "montserratbold", sans-serif;
      font-size: 107.69231%;
      line-height: 128.57143%;
      display: block;
      float: left;
      margin-top: 30px;
      letter-spacing: 4px;
      position: relative;
      text-transform: uppercase;
      z-index: 100
  }
  header nav {
      font-family: "montserratregular", sans-serif;
      left: 0;
      position: absolute;
      text-align: center;
      text-transform: uppercase;
      top: 31px;
      width: 100%;
      z-index: 1
  }
  header nav>ul>li {
      display: inline-block;
      margin-right: 19px
  }
  header nav>ul>li:last-child {
      margin-right: 0
  }
  header nav>ul>li>a {
      padding: 0 14px 20px 0;
      position: relative
  }
  header nav>ul>li>a:before,
  header nav>ul>li>a:after {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      content: "";
      height: 10px;
      margin-top: -15px;
      opacity: 1;
      position: absolute;
      right: 0;
      top: 50%;
      width: 10px
  }
  header nav>ul>li>a:before {
      opacity: 0
  }
  header nav>ul>li>a:hover {
      color: #086fcf
  }
  header nav>ul>li>a:hover:before {
      opacity: 1
  }
  header nav>ul>li>a:hover:after {
      opacity: 0
  }
  header nav>ul>li ul {
      -moz-column-count: 2;
      -webkit-column-count: 2;
      column-count: 2;
      -moz-column-gap: 50px;
      -webkit-column-gap: 50px;
      column-gap: 50px;
      font-family: "montserratlight", sans-serif;
      font-size: 107.69231%;
      line-height: 121.42857%;
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      background-color: rgba(13, 13, 26, 0.93);
      display: none;
      left: 50%;
      margin-left: -331px;
      padding: 13px 26px 20px;
      position: absolute;
      text-align: left;
      text-transform: none;
      top: 28px;
      width: 662px;
      z-index: 1000
  }
  header nav>ul>li ul:after {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEycHgiIGhlaWdodD0iN3B4IiB2aWV3Qm94PSIwIDAgMTIgNyIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTE3NS4wMDAwMDAsIC0xMzAzLjAwMDAwMCkiIGZpbGw9IiMwQzBDMTkiIG9wYWNpdHk9IjAuOTM5OTk5OTk4Ij4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMuMDAwMDAwLCAxMjQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTExNzgsNjMuNDg1MjgxNCBMMTE4My42NTY4NSw1Ny44Mjg0MjcxIEwxMTg5LjMxMzcxLDYzLjQ4NTI4MTQgTDExNzgsNjMuNDg1MjgxNCBaIiBpZD0iU2lwa2EtbWVudSI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=') no-repeat left top;
      content: "";
      display: none;
      height: 7px;
      left: 44%;
      left: 43.5%;
      position: absolute;
      top: -6px;
      width: 14px
  }
  header form {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      -moz-border-radius: 19px;
      -webkit-border-radius: 19px;
      border-radius: 19px;
      border: 1px solid #fff;
      float: right;
      margin-top: 19px;
      overflow: hidden;
      position: relative;
      z-index: 100
  }
  header form .find-input {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      font-family: "montserratlight", sans-serif;
      font-size: 100%;
      line-height: 130.76923%;
      color: #16161a;
      border: 0 none;
      margin-right: 0;
      overflow: hidden;
      padding: 10px 0;
      width: 0
  }
  header form button {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE0cHgiIGhlaWdodD0iMTE0cHgiIHZpZXdCb3g9IjAgMCAxNCAxMTQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiPgogICAgPGcgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTQ5NC4wMDAwMDAsIC0xMjk3LjAwMDAwMCkiIGZpbGw9IiMxNjE2MTkiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMy4wMDAwMDAsIDEyNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNTA1Ljc1MDA0NCw1MSBDNTAyLjg1MDczMSw1MSA1MDAuNSw1My4zNTA2NDM3IDUwMC41LDU2LjI0OTk1NjMgQzUwMC41LDU3LjQ2Mjk2ODggNTAwLjkxNTMxOSw1OC41NzY3NTYzIDUwMS42MDY2MTIsNTkuNDY1NDA2MyBMNDk3LjE5MjMyNSw2My44Nzk3Mzc1IEM0OTcuMDY0MTM4LDY0LjAwNzkyNSA0OTcsNjQuMTc1MzU2MiA0OTcsNjQuMzQzNzA2MyBDNDk3LDY0LjUxMTY2MjUgNDk3LjA2NDEzOCw2NC42Nzk1MzEzIDQ5Ny4xOTIzMjUsNjQuODA3NzE4OCBDNDk3LjMyMDQ2OSw2NC45MzU5MDYyIDQ5Ny40ODgzODEsNjUgNDk3LjY1NjI5NCw2NSBDNDk3LjgyNDE2Miw2NSA0OTcuOTkyMDc1LDY0LjkzNTkwNjIgNDk4LjEyMDI2Myw2NC44MDc3MTg4IEw1MDIuNTM0NTUsNjAuMzkzNDMxMiBDNTAzLjQyMzI0NCw2MS4wODQ3MjUgNTA0LjUzNzAzMSw2MS40OTk5NTYzIDUwNS43NTAwNDQsNjEuNDk5OTU2MyBDNTA4LjY0OTMxMiw2MS40OTk5NTYzIDUxMS4wMDAwNDQsNTkuMTQ5MjY4NyA1MTEuMDAwMDQ0LDU2LjI0OTk1NjMgQzUxMS4wMDAwNDQsNTMuMzUwNjQzNyA1MDguNjQ5MzEyLDUxIDUwNS43NTAwNDQsNTEgTDUwNS43NTAwNDQsNTEgWiBNNTA1Ljc1MDA0NCw2MC4xODc1IEM1MDMuNTc4NzMxLDYwLjE4NzUgNTAxLjgxMjU0NCw1OC40MjEyMjUgNTAxLjgxMjU0NCw1Ni4yNDk5NTYzIEM1MDEuODEyNTQ0LDU0LjA3ODY4NzUgNTAzLjU3ODczMSw1Mi4zMTI0NTYzIDUwNS43NTAwNDQsNTIuMzEyNDU2MyBDNTA3LjkyMTI2OSw1Mi4zMTI0NTYzIDUwOS42ODc1LDU0LjA3ODY4NzUgNTA5LjY4NzUsNTYuMjQ5OTU2MyBDNTA5LjY4NzUsNTguNDIxMjI1IDUwNy45MjEyNjksNjAuMTg3NSA1MDUuNzUwMDQ0LDYwLjE4NzUgTDUwNS43NTAwNDQsNjAuMTg3NSBaIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLDEwMCkiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00OTQuMDAwMDAwLCAtMTI5Ny4wMDAwMDApIiBmaWxsPSIjMDg2ZmNmIj4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMuMDAwMDAwLCAxMjQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUwNS43NTAwNDQsNTEgQzUwMi44NTA3MzEsNTEgNTAwLjUsNTMuMzUwNjQzNyA1MDAuNSw1Ni4yNDk5NTYzIEM1MDAuNSw1Ny40NjI5Njg4IDUwMC45MTUzMTksNTguNTc2NzU2MyA1MDEuNjA2NjEyLDU5LjQ2NTQwNjMgTDQ5Ny4xOTIzMjUsNjMuODc5NzM3NSBDNDk3LjA2NDEzOCw2NC4wMDc5MjUgNDk3LDY0LjE3NTM1NjIgNDk3LDY0LjM0MzcwNjMgQzQ5Nyw2NC41MTE2NjI1IDQ5Ny4wNjQxMzgsNjQuNjc5NTMxMyA0OTcuMTkyMzI1LDY0LjgwNzcxODggQzQ5Ny4zMjA0NjksNjQuOTM1OTA2MiA0OTcuNDg4MzgxLDY1IDQ5Ny42NTYyOTQsNjUgQzQ5Ny44MjQxNjIsNjUgNDk3Ljk5MjA3NSw2NC45MzU5MDYyIDQ5OC4xMjAyNjMsNjQuODA3NzE4OCBMNTAyLjUzNDU1LDYwLjM5MzQzMTIgQzUwMy40MjMyNDQsNjEuMDg0NzI1IDUwNC41MzcwMzEsNjEuNDk5OTU2MyA1MDUuNzUwMDQ0LDYxLjQ5OTk1NjMgQzUwOC42NDkzMTIsNjEuNDk5OTU2MyA1MTEuMDAwMDQ0LDU5LjE0OTI2ODcgNTExLjAwMDA0NCw1Ni4yNDk5NTYzIEM1MTEuMDAwMDQ0LDUzLjM1MDY0MzcgNTA4LjY0OTMxMiw1MSA1MDUuNzUwMDQ0LDUxIEw1MDUuNzUwMDQ0LDUxIFogTTUwNS43NTAwNDQsNjAuMTg3NSBDNTAzLjU3ODczMSw2MC4xODc1IDUwMS44MTI1NDQsNTguNDIxMjI1IDUwMS44MTI1NDQsNTYuMjQ5OTU2MyBDNTAxLjgxMjU0NCw1NC4wNzg2ODc1IDUwMy41Nzg3MzEsNTIuMzEyNDU2MyA1MDUuNzUwMDQ0LDUyLjMxMjQ1NjMgQzUwNy45MjEyNjksNTIuMzEyNDU2MyA1MDkuNjg3NSw1NC4wNzg2ODc1IDUwOS42ODc1LDU2LjI0OTk1NjMgQzUwOS42ODc1LDU4LjQyMTIyNSA1MDcuOTIxMjY5LDYwLjE4NzUgNTA1Ljc1MDA0NCw2MC4xODc1IEw1MDUuNzUwMDQ0LDYwLjE4NzUgWiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=') no-repeat left top;
      border: 0 none;
      height: 14px;
      margin-right: 15px;
      position: relative;
      overflow: hidden;
      top: 1px;
      text-indent: -1000px;
      width: 14px
  }
  header form button:hover {
      background-position: left bottom
  }
  header #customer_login_link {
      display: inline-block;
      float: right;
      margin: 30px 26px 0 0;
      position: relative;
      z-index: 100
  }
  header #customer_login_link:hover {
      color: #086fcf
  }
  header #nav-icon {
      display: none
  }
  .breadcrumb {
      margin-top: 15px
  }
  .breadcrumb li {
      display: inline-block
  }
  .breadcrumb a {
      color: #b5b6bd;
      display: inline-block;
      margin-right: 5px;
      padding-right: 14px;
      position: relative
  }
  .breadcrumb a:hover {
      color: #086fcf
  }
  .breadcrumb a:after {
      color: #b5b6bd;
      content: ">";
      position: absolute;
      right: 0
  }
  .text {
      margin: 0 auto;
      padding: 90px 0 165px;
      width: 700px
  }
  .text strong {
      font-family: "montserratbold", sans-serif
  }
  .text *:last-child {
      margin-bottom: 0
  }
  .more-products {
      padding-top: 40px;
      text-align: center
  }
  .more-products span {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      font-size: 107.69231%;
      line-height: 121.42857%;
      font-family: "montserratbold", sans-serif;
      -moz-border-radius: 26px;
      -webkit-border-radius: 26px;
      border-radius: 26px;
      -moz-box-shadow: rgba(17, 17, 18, 0.1) 0 2px 4px, rgba(19, 20, 20, 0.07) 0 1px 1px;
      -webkit-box-shadow: rgba(17, 17, 18, 0.1) 0 2px 4px, rgba(19, 20, 20, 0.07) 0 1px 1px;
      box-shadow: rgba(17, 17, 18, 0.1) 0 2px 4px, rgba(19, 20, 20, 0.07) 0 1px 1px;
      background-color: #086fcf;
      color: #fff;
      cursor: pointer;
      display: inline-block;
      padding: 16px 26px
  }
  .more-products span:hover {
      background-color: #0084ff
  }
  .collection-list {
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      margin-top: 18px
  }
  .collection-list:after {
      content: " ";
      display: block;
      clear: both
  }
  .collection-list.cols-4 a {
      width: 23.72881%;
      float: left;
      margin-right: 1.69492%
  }
  .collection-list.cols-4 a:nth-child(4n) {
      float: right;
      margin-right: 0
  }
  .collection-list.cols-4 a:nth-child(4n+1) {
      clear: both
  }
  .collection-list a {
      font-size: 100%;
      line-height: 123.07692%;
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      cursor: pointer;
      display: block;
      margin-bottom: 3.44828%;
      position: relative
  }
  .collection-list a .img {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      -moz-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      -webkit-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      background-color: rgba(64, 64, 82, 0.1) !important;
      border: 1px solid rgba(64, 64, 82, 0.1);
      display: block;
      height: 0;
      overflow: hidden;
      padding-bottom: 133%;
      position: relative
  }
  .collection-list a .img .i {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      background: transparent no-repeat center center;
      -moz-background-size: cover;
      -o-background-size: cover;
      -webkit-background-size: cover;
      background-size: cover;
      display: block;
      height: 100%;
      left: 0;
      opacity: 1;
      position: absolute;
      top: 0;
      width: 100%
  }
  .collection-list a .img .second {
      opacity: 0
  }
  .collection-list a .text {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      background-color: rgba(13, 13, 26, 0.93);
      bottom: -10px;
      color: #fff;
      display: block;
      left: 3%;
      max-width: 94%;
      padding: 6px 10px 3px;
      position: absolute
  }
  .collection-list a .text strong {
      font-family: "robotoregular", sans-serif;
      display: block
  }
  .collection-list a .text>span {
      font-family: "robotoblack", sans-serif;
      display: block;
      margin-bottom: 2px
  }
  .collection-list a:hover>span {
      background-color: #0d0d1a
  }
  .collection-list a:hover .variants {
      height: 27px
  }
  .collection-list a .variants {
      -moz-transition: all 200ms cubic-bezier(0.64, 0.57, 0.67, 1.53) 0s;
      -o-transition: all 200ms cubic-bezier(0.64, 0.57, 0.67, 1.53) 0s;
      -webkit-transition: all 200ms cubic-bezier(0.64, 0.57, 0.67, 1.53);
      -webkit-transition-delay: 0s;
      transition: all 200ms cubic-bezier(0.64, 0.57, 0.67, 1.53) 0s;
      font-family: "robotoregular", sans-serif;
      height: 0;
      overflow: hidden
  }
  .collection-list a .variants .variant {
      float: left;
      margin: 5px 0 2px;
      width: 50%
  }
  .collection-list a .variants .variant:nth-child(even) {
      text-align: right
  }
  .collection-list a .variants .var {
      display: inline-block
  }
  .collection-list a .variants .var.color {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      border: 1px solid #5d5e66;
      height: 16px;
      padding: 3px;
      width: 16px
  }
  .collection-list a .variants .var.blue .c {
      background-color: #086fcf !important
  }
  .collection-list a .variants .var.yellow .c {
      background-color: #f5c81f !important
  }
  .collection-list a .variants .var.red .c {
      background-color: #d9332e !important
  }
  .collection-list a .variants .var .c {
      height: 100%;
      width: 100%
  }
  .collection-list a .variants .var:not(:last-child) .t:after {
      content: ", "
  }
  .collection-list a.hidden {
      display: none
  }
  .product-detail {
      padding-top: 15px
  }
  .product-detail .shadow {
      -moz-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      -webkit-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
      margin-bottom: 2px
  }
  .product-detail .cols {
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      padding: 35px 0 58px
  }
  .product-detail .cols:after {
      content: " ";
      display: block;
      clear: both
  }
  .product-detail .left-col {
      width: 48.27586%;
      float: left;
      margin-right: 3.44828%;
      max-width: 100%;
      margin-left: auto;
      margin-right: auto
  }
  .product-detail .left-col:after {
      content: " ";
      display: block;
      clear: both
  }
  .product-detail .left-col .thumbs {
      width: 15.25424%;
      float: left;
      margin-right: 1.69492%
  }
  .product-detail .left-col .thumbs a {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      -moz-border-radius: 1px;
      -webkit-border-radius: 1px;
      border-radius: 1px;
      border: 1px solid #e2e2e3;
      display: block;
      margin-bottom: 8px;
      position: relative;
      width: 100%
  }
  .product-detail .left-col .thumbs a.active {
      border-color: #086fcf
  }
  .product-detail .left-col .thumbs a.active:hover {
      border-color: #086fcf
  }
  .product-detail .left-col .thumbs a:hover {
      border-color: #b5b6bd
  }
.product-detail .left-col .thumbs img {
    display: block;
    width: 100%;
    height: 50px; /* Default for desktop */
}

@media (max-width: 768px) {
    .product-detail .left-col .thumbs img {
        height: 40px; /* For mobile devices */
    }
}

  .product-detail .left-col .big {
      width: 83.05085%;
      float: right;
      margin-right: 0
  }
  .product-detail .left-col .big .img {
      -moz-transition: all 600ms ease-out 0s;
      -o-transition: all 600ms ease-out 0s;
      -webkit-transition: all 600ms ease-out;
      -webkit-transition-delay: 0s;
      transition: all 600ms ease-out 0s;
      -moz-transform: translateY(0px);
      -ms-transform: translateY(0px);
      -webkit-transform: translateY(0px);
      transform: translateY(0px);
      -moz-border-radius: 1px;
      -webkit-border-radius: 1px;
      border-radius: 1px;
      background: transparent no-repeat center center;
      -moz-background-size: cover;
      -o-background-size: cover;
      -webkit-background-size: cover;
      background-size: cover;
      border: 1px solid #e2e2e3;
      display: block;
      
      height: 0;
      opacity: 1;
      padding-bottom: 133%
  }
  .product-detail .left-col .big #banner-gallery {
      display: none
  }
  .product-detail .right-col {
      width: 48.27586%;
      float: right;
      margin-right: 0
  }
  .product-detail h1 {
      font-size: 184.61538%;
      line-height: 141.66667%;
      font-family: "montserratregular", sans-serif
  }
  .product-detail a {
      font-size: 100%;
      line-height: 123.07692%;
      color: #b5b6bd;
      text-decoration: underline
  }
  .product-detail a:hover {
      color: #086fcf
  }
  .product-detail .price-shipping {
      border-bottom: 1px solid #edeff2;
      padding-bottom: 14px
  }
  .product-detail .price-shipping a {
      display: block;
      float: left;
      margin: 19px 0 0 25px
  }
  .product-detail .price {
      font-size: 369.23077%;
      line-height: 108.33333%;
      font-family: "montserratbold", sans-serif;
      color: #086fcf;
      float: left;
      letter-spacing: -2px
  }
  .product-detail #AddToCartForm {
      margin-top: 40px
  }
  .product-detail .btn-and-quantity {
  }
  .product-detail #AddToCart {
      font-family: "montserratbold", sans-serif;
      -moz-border-radius: 25px;
      -webkit-border-radius: 25px;
      border-radius: 25px;
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      font-size: 107.69231%;
      line-height: 128.57143%;
      background: #086fcf url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE5cHgiIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDE5IDE4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02ODYuMDAwMDAwLCAtNDUwLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2NjAuMDAwMDAwLCAxNjUuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgMjY5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI2LjAwMDAwMCwgMTYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNi43NjU0Nzg0LDQuMjc1IEwxNS44NzU4NzQ5LDguNTkzMzYwNzEgTDQuNjk5ODQwNTksOS43MjQwOTgyMSBMMy40NzM5MDMwNCw0LjI3NSBMMTYuNzY1NDc4NCw0LjI3NSBaIE0xNi44MDQ1NDYzLDkuNzI4MDY3ODYgTDE4LjY3MzcyNTEsMy4wNTM1NzE0MyBMMy4xOTkxNTIwNywzLjA1MzU3MTQzIEwyLjUxMjI3NDYzLDAgTDMuMjYzMDc1NzJlLTA1LDAgTDMuMjYzMDc1NzJlLTA1LDEuMjIxNDI4NTcgTDEuNDUzMDgwMjUsMS4yMjE0Mjg1NyBMNC4wNjM1NDA4MywxMi44MjUgTDE2Ljk2ODAyNjQsMTIuODI1IEwxNi45NjgwMjY0LDExLjYwMzU3MTQgTDUuMTIyNzM1MjEsMTEuNjAzNTcxNCBMNC45NzAwMjMyNiwxMC45MjUzNzMyIEwxNi44MDQ1NDYzLDkuNzI4MDY3ODYgWiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNy44MzEzODE3MywxNS4yNjc4NTcxIEM3LjgzMTM4MTczLDE2LjI3OTgxMDcgNi45NTQ5MTk1OSwxNy4xIDUuODczNTM2MywxNy4xIEM0Ljc5MjE1MzAxLDE3LjEgMy45MTU2OTA4NywxNi4yNzk4MTA3IDMuOTE1NjkwODcsMTUuMjY3ODU3MSBDMy45MTU2OTA4NywxNC4yNTU5MDM2IDQuNzkyMTUzMDEsMTMuNDM1NzE0MyA1Ljg3MzUzNjMsMTMuNDM1NzE0MyBDNi45NTQ5MTk1OSwxMy40MzU3MTQzIDcuODMxMzgxNzMsMTQuMjU1OTAzNiA3LjgzMTM4MTczLDE1LjI2Nzg1NzEiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE1LjY2Mjc2MzUsMTUuMjY3ODU3MSBDMTUuNjYyNzYzNSwxNi4yNzk4MTA3IDE0Ljc4NjMwMTMsMTcuMSAxMy43MDQ5MTgsMTcuMSBDMTIuNjIzNTM0NywxNy4xIDExLjc0NzA3MjYsMTYuMjc5ODEwNyAxMS43NDcwNzI2LDE1LjI2Nzg1NzEgQzExLjc0NzA3MjYsMTQuMjU1OTAzNiAxMi42MjM1MzQ3LDEzLjQzNTcxNDMgMTMuNzA0OTE4LDEzLjQzNTcxNDMgQzE0Ljc4NjMwMTMsMTMuNDM1NzE0MyAxNS42NjI3NjM1LDE0LjI1NTkwMzYgMTUuNjYyNzYzNSwxNS4yNjc4NTcxIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=') no-repeat 26px center;
      border: 0 none;
      color: #fff;
      height: 50px;
      padding: 14px 26px 14px 53px
  }
  .product-detail #AddToCart:hover {
      background-color: #0084ff
  }
  .product-detail .spinner {
      float: right
  }
  .product-detail .spinner:before {
      background: transparent url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAyCAIAAADqed0qAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACsSURBVDhP7ZNbEsIgDAC9/2HVSnkUWnAVZhwlBA/Q/QqzhKaQXIrKqUU0ndI+1DmX27IO9Wq980HWx5FJJZC1dcH5jUDQOZNq+DYI2oeN7BoL+mEsv1RjQV/vpkW9jjGZ1bVFr431IcS2+NFUtBj7Lrnx0b2DpkUHLz1y8IcG7fCKVlql3/GlQbsWmFwqaE8CkwedtMOkmYDsYSvCpJFBGwOYDBFoI1g5tUApTxJ40LZNFr4gAAAAAElFTkSuQmCC') no-repeat left top;
      content: "";
      display: block;
      height: 50px;
      left: -6px;
      position: absolute;
      top: 0;
      width: 10px
  }
  .related {
      background-color: #f7f7fa;
      padding: 40px 0 85px
  }
  .related h2 {
      font-size: 184.61538%;
      line-height: 150%;
      font-family: "montserratregular", sans-serif;
      text-align: center
  }
  .related .collection-list {
      margin-top: 26px
  }
  .swatches .guide {
      float: left;
      margin: 36px 0 0 20px
  }
  .spinner {
      -moz-border-radius: 25px;
      -webkit-border-radius: 25px;
      border-radius: 25px;
      border: 1px solid #edeff2;
      height: 50px;
      margin-left: 10px;
      padding: 15px 16px 0;
      position: relative
  }
  .spinner .btn {
      cursor: pointer;
      display: block;
      float: left;
      height: 10px;
      margin-top: 4px;
      position: relative;
      width: 10px
  }
  .spinner .btn:before {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      background-color: #086fcf;
      content: "";
      display: block;
      height: 2px;
      left: 0;
      margin-top: -1px;
      position: absolute;
      top: 50%;
      width: 100%
  }
  .spinner .btn.plus:after {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      background-color: #086fcf;
      bottom: 0;
      content: "";
      display: block;
      height: 100%;
      left: 50%;
      margin-left: -1px;
      position: absolute;
      top: 0;
      width: 2px
  }
  .spinner .btn:hover:before,
  .spinner .btn:hover:after {
      background-color: #0084ff
  }
  .spinner input {
      font-family: "montserratlight", sans-serif;
      border: 0 none;
      color: #16161a;
      display: block;
      float: left;
      font-size: 14px;
      height: 17px !important;
      line-height: 17px !important;
      margin-left: 1px;
      padding-bottom: 0;
      padding-top: 0;
      text-align: right;
      width: 30px
  }
  .spinner .q {
      font-size: 107.69231%;
      line-height: 121.42857%;
      display: block;
      float: left;
      margin: 1px 20px 0 3px
  }
  .tabs {
      margin: 30px 0
  }
  .tabs .tab-labels {
      position: relative;
      top: 1px;
      z-index: 100
  }
  .tabs .tab-labels span {
      font-family: "montserratbold", sans-serif;
      font-size: 100%;
      line-height: 123.07692%;
      -moz-border-radius: 1px;
      -webkit-border-radius: 1px;
      border-radius: 1px;
      border: 1px solid #fff;
      border-bottom: 0 none;
      color: #086fcf;
      cursor: pointer;
      display: block;
      float: left;
      padding: 7px 15px 9px;
      text-transform: uppercase
  }
  .tabs .tab-labels span.active {
      background-color: #fff;
      border-color: #edeff2;
      color: #16161a
  }
  .tabs .tab-slides {
      font-size: 100%;
      line-height: 184.61538%;
      border-top: 1px solid #edeff2;
      padding-top: 10px;
      position: relative
  }
  .tabs .tab-slides>div {
      display: none
  }
  .tabs .tab-slides>div.active {
      display: block
  }
  .social-sharing-btn-wrapper {
      display: none
  }
  .detail-socials .social-sharing {
      float: right;
      margin: 12px 0
  }
  .detail-socials a {
      -moz-border-radius: 50%;
      -webkit-border-radius: 50%;
      border-radius: 50%;
      background: transparent no-repeat center center;
      border: 1px solid #edeff2;
      display: block;
      float: left;
      height: 26px;
      margin-right: 7px;
      width: 26px
  }
  .detail-socials a:hover {
      border-color: #b5b6bd
  }
  .detail-socials a:last-child {
      margin-right: 0
  }
  .detail-socials .share-facebook {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjI3cHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDI3IDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01NjEuMDAwMDAwLCAtNzY5LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4My4wMDAwMDAsIDE1Ny4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ0NS4wMDAwMDAsIDYxMi4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzMy40Mjg1NzEsIDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMS4yMTE3OTE2LDE5LjQyNzY0NzUgTDExLjIxMTc5MTYsMTMuMjcyMTY2OCBMOS45NDExNzY0NywxMy4yNzIxNjY4IEw5Ljk0MTE3NjQ3LDExLjE1MDg3MTMgTDExLjIxMTc5MTYsMTEuMTUwODcxMyBMMTEuMjExNzkxNiw5Ljg3NzI1MzEzIEMxMS4yMTE3OTE2LDguMTQ2NzAzNjEgMTEuOTI5MjYwNCw3LjExNzY0NzA2IDEzLjk2NzY3NCw3LjExNzY0NzA2IEwxNS42NjQ3MTA1LDcuMTE3NjQ3MDYgTDE1LjY2NDcxMDUsOS4yMzkxODI4MiBMMTQuNjAzOTQyNiw5LjIzOTE4MjgyIEMxMy44MTA0Mzg3LDkuMjM5MTgyODIgMTMuNzU3OTQ2OSw5LjUzNTYzNTY3IDEzLjc1Nzk0NjksMTAuMDg4OTAyMiBMMTMuNzU1MDY0LDExLjE1MDYzMSBMMTUuNjc2NzIyMywxMS4xNTA2MzEgTDE1LjQ1MTg2MDIsMTMuMjcxOTI2NiBMMTMuNzU1MDY0LDEzLjI3MTkyNjYgTDEzLjc1NTA2NCwxOS40Mjc2NDc1IEwxMS4yMTE3OTE2LDE5LjQyNzY0NzUgWiIgZmlsbD0iI0I1QjdCRCI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+')
  }
  .detail-socials .share-twitter {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjI2cHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDI2IDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01MjguMDAwMDAwLCAtNzY5LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4My4wMDAwMDAsIDE1Ny4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ0NS4wMDAwMDAsIDYxMi4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTUuMDU2NDI4NCw4LjUyNzIxNjk1IEMxMy45ODgxODAyLDguOTE2MDI1MDEgMTMuMzEzMDQ3Myw5LjkxODI4NTggMTMuMzg5OTYxMiwxMS4wMTU1ODg2IEwxMy40MTU1OTkxLDExLjQzODk1NzMgTDEyLjk4ODI5OTgsMTEuMzg3MTE2MyBDMTEuNDMyOTMwNSwxMS4xODgzOTIxIDEwLjA3NDExODcsMTAuNTE0NDU4MiA4LjkyMDQxMDY4LDkuMzgyNTk0NjkgTDguMzU2Mzc1NjMsOC44MjA5ODMwNCBMOC4yMTEwOTM4OCw5LjIzNTcxMTY0IEM3LjkwMzQzODM5LDEwLjE2MDIxMDggOC4wOTk5OTYwNiwxMS4xMzY1NTExIDguNzQwOTQ0OTgsMTEuNzkzMjA0NyBDOS4wODI3ODQ0MSwxMi4xNTYwOTIyIDkuMDA1ODcwNTQsMTIuMjA3OTMzMyA4LjQxNjE5NzUzLDExLjk5MTkyODggQzguMjExMDkzODgsMTEuOTIyODA3NCA4LjAzMTYyODE4LDExLjg3MDk2NjMgOC4wMTQ1MzYyMSwxMS44OTY4ODY4IEM3Ljk1NDcxNDMxLDExLjk1NzM2ODEgOC4xNTk4MTc5NiwxMi43NDM2MjQ0IDguMzIyMTkxNjksMTMuMDU0NjcwOCBDOC41NDQzODczMiwxMy40ODY2Nzk4IDguOTk3MzI0NTUsMTMuOTEwMDQ4NiA5LjQ5Mjk5MTcyLDE0LjE2MDYxMzggTDkuOTExNzQ1MDIsMTQuMzU5MzM3OSBMOS40MTYwNzc4NSwxNC4zNjc5NzgxIEM4LjkzNzUwMjY1LDE0LjM2Nzk3ODEgOC45MjA0MTA2OCwxNC4zNzY2MTgzIDguOTcxNjg2NiwxNC41NTgwNjIgQzkuMTQyNjA2MzEsMTUuMTE5NjczNyA5LjgxNzczOTE3LDE1LjcxNTg0NiAxMC41Njk3ODU5LDE1Ljk3NTA1MTQgTDExLjA5OTYzNywxNi4xNTY0OTUyIEwxMC42MzgxNTM4LDE2LjQzMjk4MDkgQzkuOTU0NDc0OTQsMTYuODMwNDI5MSA5LjE1MTE1MjMsMTcuMDU1MDczOCA4LjM0NzgyOTY1LDE3LjA3MjM1NDIgQzcuOTYzMjYwMjksMTcuMDgwOTk0MyA3LjY0NzA1ODgyLDE3LjExNTU1NTEgNy42NDcwNTg4MiwxNy4xNDE0NzU2IEM3LjY0NzA1ODgyLDE3LjIyNzg3NzQgOC42ODk2NjkwNywxNy43MTE3Mjc0IDkuMjk2NDM0MDUsMTcuOTAxODExNCBDMTEuMTE2NzI5LDE4LjQ2MzQyMyAxMy4yNzg4NjM0LDE4LjIyMTQ5OCAxNC45MDI2MDA2LDE3LjI2MjQzODEgQzE2LjA1NjMwODcsMTYuNTc5ODYzOSAxNy4yMTAwMTY3LDE1LjIyMzM1NTggMTcuNzQ4NDEzOCwxMy45MTAwNDg2IEMxOC4wMzg5Nzc0LDEzLjIxMDE5NDEgMTguMzI5NTQwOSwxMS45MzE0NDc1IDE4LjMyOTU0MDksMTEuMzE3OTk0OCBDMTguMzI5NTQwOSwxMC45MjA1NDY2IDE4LjM1NTE3ODgsMTAuODY4NzA1NSAxOC44MzM3NTQsMTAuMzkzNDk1NyBDMTkuMTE1NzcxNSwxMC4xMTcwMDk5IDE5LjM4MDY5NzEsOS44MTQ2MDM2NSAxOS40MzE5NzMsOS43MjgyMDE4NiBDMTkuNTE3NDMyOSw5LjU2NDAzODQ1IDE5LjUwODg4NjksOS41NjQwMzg0NSAxOS4wNzMwNDE2LDkuNzEwOTIxNSBDMTguMzQ2NjMyOCw5Ljk3MDEyNjg3IDE4LjI0NDA4MSw5LjkzNTU2NjE2IDE4LjYwMzAxMjQsOS41NDY3NTgwOSBDMTguODY3OTM4LDkuMjcwMjcyMzYgMTkuMTg0MTM5NCw4Ljc2OTE0MTk3IDE5LjE4NDEzOTQsOC42MjIyNTg5MiBDMTkuMTg0MTM5NCw4LjU5NjMzODM4IDE5LjA1NTk0OTYsOC42Mzk1MzkyOCAxOC45MTA2Njc5LDguNzE3MzAwODkgQzE4Ljc1Njg0MDEsOC44MDM3MDI2OCAxOC40MTUwMDA3LDguOTMzMzA1MzcgMTguMTU4NjIxMiw5LjAxMTA2Njk4IEwxNy42OTcxMzc5LDkuMTU3OTUwMDMgTDE3LjI3ODM4NDYsOC44NzI4MjQxMiBDMTcuMDQ3NjQzLDguNzE3MzAwODkgMTYuNzIyODk1Niw4LjU0NDQ5NzMxIDE2LjU1MTk3NTksOC40OTI2NTYyMyBDMTYuMTE2MTMwNiw4LjM3MTY5MzczIDE1LjQ0OTU0MzcsOC4zODg5NzQwOCAxNS4wNTY0Mjg0LDguNTI3MjE2OTUgTDE1LjA1NjQyODQsOC41MjcyMTY5NSBaIiBmaWxsPSIjQjVCN0JEIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==')
  }
  .detail-socials .share-pinterest {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjI2cHgiIGhlaWdodD0iMjZweCIgdmlld0JveD0iMCAwIDI2IDI2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01OTQuMDAwMDAwLCAtNzY5LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4My4wMDAwMDAsIDE1Ny4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ0NS4wMDAwMDAsIDYxMi4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2Ni4wMDAwMDAsIDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy40MzcwNjg3LDYuMTE3NjQ3MDYgQzkuNzE2MzUwOTQsNi4xMTc2NDcwNiA3Ljg0MDMzNjEzLDguNzg1MjQyODcgNy44NDAzMzYxMywxMS4wMDk3NzYgQzcuODQwMzM2MTMsMTIuMzU2NzA3NSA4LjM1MDI4NDQzLDEzLjU1NDk5NDYgOS40NDQwMjQ4MSwxNC4wMDE1MzY0IEM5LjYyMzM3MjE0LDE0LjA3NDg1ODQgOS43ODQwMTkzMywxNC4wMDQwNTg4IDkuODM2MDMxOCwxMy44MDU0ODk1IEM5Ljg3MjIxNDM4LDEzLjY2ODA2NTIgOS45NTc4MDAxMSwxMy4zMjEzNzM0IDkuOTk1OTgzMTcsMTMuMTc2OTkxIEMxMC4wNDg0MzA1LDEyLjk4MDU5NjEgMTAuMDI4MDc3OCwxMi45MTE3MTAxIDkuODgzMzQ3NDgsMTIuNzQwNTM4NiBDOS41Njc5Njc1NiwxMi4zNjg1MzY0IDkuMzY2NDQxLDExLjg4Njk0MjcgOS4zNjY0NDEsMTEuMjA0Nzc5MiBDOS4zNjY0NDEsOS4yMjU2OTYyNiAxMC44NDcxNDM3LDcuNDUzOTY3MzEgMTMuMjIyMTQ3Niw3LjQ1Mzk2NzMxIEMxNS4zMjUxNzM0LDcuNDUzOTY3MzEgMTYuNDgwNTgwNyw4LjczODk3MDkyIDE2LjQ4MDU4MDcsMTAuNDU1MTIxMyBDMTYuNDgwNTgwNywxMi43MTMxNDA3IDE1LjQ4MTI5NzcsMTQuNjE4OTAxOCAxMy45OTc4MTE4LDE0LjYxODkwMTggQzEzLjE3ODU3MiwxNC42MTg5MDE4IDEyLjU2NTI5NDYsMTMuOTQxMzQ4MSAxMi43NjE4NjM0LDEzLjExMDM2NjQgQzEyLjk5NzIyNDIsMTIuMTE4MzAyNSAxMy40NTMxNTk1LDExLjA0NzYxMTEgMTMuNDUzMTU5NSwxMC4zMzE1MjY1IEMxMy40NTMxNTk1LDkuNjkwNTAzMyAxMy4xMDkwNzcxLDkuMTU1ODUzNDMgMTIuMzk2OTkzNCw5LjE1NTg1MzQzIEMxMS41NTk0ODgzLDkuMTU1ODUzNDMgMTAuODg2NzE4NCwxMC4wMjIyMzUgMTAuODg2NzE4NCwxMS4xODI4NjA5IEMxMC44ODY3MTg0LDExLjkyMjA4MTYgMTEuMTM2NTE3NCwxMi40MjIwMjc1IDExLjEzNjUxNzQsMTIuNDIyMDI3NSBDMTEuMTM2NTE3NCwxMi40MjIwMjc1IDEwLjI3OTQ0MjQsMTYuMDUzNDE5NSAxMC4xMjkyMzI1LDE2LjY4OTM5OCBDOS44MzAwMzAzNiwxNy45NTU5NjI0IDEwLjA4NDI2NTIsMTkuNTA4NTk1NCAxMC4xMDU3NDg2LDE5LjY2NTQxNTUgQzEwLjExODM2MDMsMTkuNzU4MzA3NCAxMC4yMzc3ODAzLDE5Ljc4MDM5OTYgMTAuMjkxODgwMiwxOS43MTAyMDg5IEMxMC4zNjkxMTYxLDE5LjYwOTQwMjEgMTEuMzY2NTcyNSwxOC4zNzc5NzY2IDExLjcwNTY5NzMsMTcuMTQ3NTA3OCBDMTEuODAxNjMzMywxNi43OTkwNzY0IDEyLjI1NjUyNDksMTQuOTk0OTA0OSAxMi4yNTY1MjQ5LDE0Ljk5NDkwNDkgQzEyLjUyODU5MDEsMTUuNTEzODk4OSAxMy4zMjM4MjQyLDE1Ljk3MTA1MTkgMTQuMTY5NTA1MSwxNS45NzEwNTE5IEMxNi42ODY5NzgsMTUuOTcxMDUxOSAxOC4zOTQ5NTI1LDEzLjY3NTk4MDIgMTguMzk0OTUyNSwxMC42MDM5Mzk2IEMxOC4zOTQ5NTI1LDguMjgxMDM1MDggMTYuNDI3NDM3NSw2LjExNzY0NzA2IDEzLjQzNzA2ODcsNi4xMTc2NDcwNiBMMTMuNDM3MDY4Nyw2LjExNzY0NzA2IFoiIGZpbGw9IiNCNUI3QkQiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==')
  }
  .socials {
      color: #edeff2
  }
  .socials strong {
      opacity: 0.4
  }
  .socials ul {
      display: inline-block
  }
  .socials li {
      float: left;
      margin-left: 28px
  }
  .socials a {
      background: transparent no-repeat left top;
      display: inline-block;
      opacity: 0.65;
      overflow: hidden;
      position: relative;
      text-indent: 100px;
      top: 12px
  }
  .socials a:hover {
      opacity: 1
  }
  .socials .tw {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTRweCIgdmlld0JveD0iMCAwIDE2IDE0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDQ1LjAwMDAwMCwgLTE1OTEuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zLjAwMDAwMCwgMTI0Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAxNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0MC4wMDAwMDAsIDE5MC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTguMjIyNTA4OSw5Ljc1MDk3NjAxIEMxNi44MjU1Njg5LDEwLjI1OTQxNzMgMTUuOTQyNzAyOSwxMS41NzAwNjYgMTYuMDQzMjgyNiwxMy4wMDUwMDA0IEwxNi4wNzY4MDkxLDEzLjU1ODYzNjUgTDE1LjUxODAzMzEsMTMuNDkwODQ0MyBDMTMuNDg0MDg4NSwxMy4yMzA5NzQzIDExLjcwNzE4MDksMTIuMzQ5Njc2MSAxMC4xOTg0ODU4LDEwLjg2OTU0NjkgTDkuNDYwOTAxNDcsMTAuMTM1MTMxNyBMOS4yNzA5MTc2MywxMC42Nzc0NjkxIEM4Ljg2ODU5ODkyLDExLjg4NjQyOTUgOS4xMjU2MzU4OCwxMy4xNjMxODIyIDkuOTYzNzk5ODUsMTQuMDIxODgzIEMxMC40MTA4MjA2LDE0LjQ5NjQyODMgMTAuMzEwMjQxLDE0LjU2NDIyMDQgOS41MzkxMzAxLDE0LjI4MTc1MyBDOS4yNzA5MTc2MywxNC4xOTEzNjM1IDkuMDM2MjMxNzIsMTQuMTIzNTcxMyA5LjAxMzg4MDY4LDE0LjE1NzQ2NzQgQzguOTM1NjUyMDQsMTQuMjM2NTU4MyA5LjIwMzg2NDUxLDE1LjI2NDczOTYgOS40MTYxOTkzOSwxNS42NzE0OTI2IEM5LjcwNjc2MjksMTYuMjM2NDI3NCAxMC4yOTkwNjU0LDE2Ljc5MDA2MzUgMTAuOTQ3MjQ1NiwxNy4xMTc3MjU3IEwxMS40OTQ4NDYsMTcuMzc3NTk1NyBMMTAuODQ2NjY1OSwxNy4zODg4OTQ0IEMxMC4yMjA4MzY4LDE3LjM4ODg5NDQgMTAuMTk4NDg1OCwxNy40MDAxOTMxIDEwLjI2NTUzODksMTcuNjM3NDY1NyBDMTAuNDg5MDQ5MywxOC4zNzE4ODA5IDExLjM3MTkxNTMsMTkuMTUxNDkxIDEyLjM1NTM2MTEsMTkuNDkwNDUxOCBMMTMuMDQ4MjQzMywxOS43Mjc3MjQ0IEwxMi40NDQ3NjUyLDIwLjA4OTI4MjcgQzExLjU1MDcyMzYsMjAuNjA5MDIyNyAxMC41MDAyMjQ4LDIwLjkwMjc4ODggOS40NDk3MjU5NSwyMC45MjUzODYyIEM4Ljk0NjgyNzU2LDIwLjkzNjY4NDkgOC41MzMzMzMzMywyMC45ODE4Nzk3IDguNTMzMzMzMzMsMjEuMDE1Nzc1OCBDOC41MzMzMzMzMywyMS4xMjg3NjI3IDkuODk2NzQ2NzMsMjEuNzYxNDg5NyAxMC42OTAyMDg2LDIyLjAxMDA2MSBDMTMuMDcwNTk0MywyMi43NDQ0NzYyIDE1Ljg5ODAwMDgsMjIuNDI4MTEyOCAxOC4wMjEzNDk1LDIxLjE3Mzk1NzUgQzE5LjUzMDA0NDcsMjAuMjgxMzYwNSAyMS4wMzg3Mzk4LDE4LjUwNzQ2NTMgMjEuNzQyNzk3NiwxNi43OTAwNjM1IEMyMi4xMjI3NjUzLDE1Ljg3NDg2OTIgMjIuNTAyNzMyOSwxNC4yMDI2NjIyIDIyLjUwMjczMjksMTMuNDAwNDU0OCBDMjIuNTAyNzMyOSwxMi44ODA3MTQ4IDIyLjUzNjI1OTUsMTIuODEyOTIyNiAyMy4xNjIwODg2LDEyLjE5MTQ5NDMgQzIzLjUzMDg4MDcsMTEuODI5OTM2IDIzLjg3NzMyMTgsMTEuNDM0NDgxNyAyMy45NDQzNzUsMTEuMzIxNDk0NyBDMjQuMDU2MTMwMiwxMS4xMDY4MTk1IDI0LjA0NDk1NDYsMTEuMTA2ODE5NSAyMy40NzUwMDMxLDExLjI5ODg5NzMgQzIyLjUyNTA4NCwxMS42Mzc4NTgyIDIyLjM5MDk3NzcsMTEuNTkyNjYzNCAyMi44NjAzNDk2LDExLjA4NDIyMjEgQzIzLjIwNjc5MDcsMTAuNzIyNjYzOSAyMy42MjAyODQ5LDEwLjA2NzMzOTUgMjMuNjIwMjg0OSw5Ljg3NTI2MTY3IEMyMy42MjAyODQ5LDkuODQxMzY1NTggMjMuNDUyNjUyMSw5Ljg5Nzg1OTA2IDIzLjI2MjY2ODMsOS45OTk1NDczMiBDMjMuMDYxNTA4OSwxMC4xMTI1MzQzIDIyLjYxNDQ4ODEsMTAuMjgyMDE0NyAyMi4yNzkyMjI1LDEwLjM4MzcwMyBMMjEuNjc1NzQ0NSwxMC41NzU3ODA4IEwyMS4xMjgxNDQsMTAuMjAyOTIzOCBDMjAuODI2NDA1LDkuOTk5NTQ3MzIgMjAuNDAxNzM1Miw5Ljc3MzU3MzQgMjAuMTc4MjI0OCw5LjcwNTc4MTIzIEMxOS42MDgyNzMzLDkuNTQ3NTk5NDkgMTguNzM2NTgyOCw5LjU3MDE5Njg4IDE4LjIyMjUwODksOS43NTA5NzYwMSBMMTguMjIyNTA4OSw5Ljc1MDk3NjAxIFoiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+');
      height: 14px;
      top: 10px;
      width: 16px
  }
  .socials .fb {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjlweCIgaGVpZ2h0PSIxOHB4IiB2aWV3Qm94PSIwIDAgOSAxOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTA5My4wMDAwMDAsIC0xNTg5LjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMy4wMDAwMDAsIDEyNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgMTQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNDAuMDAwMDAwLCAxOTAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ0LjMwNzY5MiwgMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy43NDE0NDg5LDI0LjcwMzgyNTYgTDEzLjc0MTQ0ODksMTUuOTk5MzIwNiBMMTEuOTQ0NjYzOCwxNS45OTkzMjA2IEwxMS45NDQ2NjM4LDEyLjk5OTU4MjkgTDEzLjc0MTQ0ODksMTIuOTk5NTgyOSBMMTMuNzQxNDQ4OSwxMS4xOTg1NTEyIEMxMy43NDE0NDg5LDguNzUxMzY5OTUgMTQuNzU2MDI2MSw3LjI5NjE3NDQzIDE3LjYzODU2LDcuMjk2MTc0NDMgTDIwLjAzODM1MDIsNy4yOTYxNzQ0MyBMMjAuMDM4MzUwMiwxMC4yOTYyNTE5IEwxOC41MzgzMTE1LDEwLjI5NjI1MTkgQzE3LjQxNjIxMjUsMTAuMjk2MjUxOSAxNy4zNDE5ODM0LDEwLjcxNTQ2NzcgMTcuMzQxOTgzNCwxMS40OTc4NDU1IEwxNy4zMzc5MDY4LDEyLjk5OTI0MzEgTDIwLjA1NTMzNjIsMTIuOTk5MjQzMSBMMTkuNzM3MzU3MiwxNS45OTg5ODA4IEwxNy4zMzc5MDY4LDE1Ljk5ODk4MDggTDE3LjMzNzkwNjgsMjQuNzAzODI1NiBMMTMuNzQxNDQ4OSwyNC43MDM4MjU2IFoiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+');
      height: 18px;
      width: 9px;
      top: 11px
  }
  .socials .in {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE3cHgiIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDE3IDE4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTMzLjAwMDAwMCwgLTE1ODkuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zLjAwMDAwMCwgMTI0Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAxNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0MC4wMDAwMDAsIDE5MC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODguNjE1Mzg1LCAwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNy4zODQ2MTUsIDcuMzg0NjE1KSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTE1LjEyNDk5NDcsMTYuNzUxMzgwOCBMMi4xMDU3NzQ1MywxNi43NTEzODA4IEMyLjA3MTE1ODIxLDE2Ljc0NTgwNSAyLjAzNjMwOTU3LDE2LjczOTA2NzYgMi4wMDE2OTMyNSwxNi43MzQ4ODU4IEMxLjI4NTkwMjE1LDE2LjY0Mjg4NTQgMC42ODQxODIyNzMsMTYuMDk2NDU4NyAwLjUyNDgwNzgxOSwxNS4zOTE1ODY4IEMwLjUwNjIyMTg3NywxNS4zMDkzNDQgMC40OTQzNzMzMzksMTUuMjI1OTM5NiAwLjQ3OTUwNDU4NSwxNS4xNDMyMzIyIEwwLjQ3OTUwNDU4NSwyLjA4ODIzNDA0IEMwLjQ4NDg0ODA0MywyLjA1Nzc5OTU2IDAuNDkxMTIwNzk5LDIuMDI3NTk3NDEgMC40OTUzMDI2MzYsMS45OTcxNjI5MyBDMC41OTc5ODk5NjYsMS4yNjY3MzU0IDEuMTMxNDA2NTEsMC42ODYxNTcwMyAxLjg1MjMwODc0LDAuNTIxOTAzNzY2IEMxLjkyOTkwNTA1LDAuNTA0MjQ3MTIgMi4wMDkxMjc2MywwLjQ5MzU2MDIwNCAyLjA4Nzg4NTU2LDAuNDc5Mzg4NDIzIEwxNS4xNDI4ODM3LDAuNDc5Mzg4NDIzIEMxNS4xNzMwODU4LDAuNDg0NzMxODgxIDE1LjIwMzA1NTcsMC40OTE0NjkyODUgMTUuMjMzNzIyNSwwLjQ5NTQxODc5OCBDMTUuOTcyMjgxMywwLjU5NjQ3OTg1OSAxNi41NzM3Njg5LDEuMTYyNDIxOCAxNi43MTYxODM3LDEuODkxNjg3NyBDMTYuNzMwMTIzMSwxLjk2Mjc3ODkzIDE2LjczOTg4MDgsMi4wMzQzMzQ4MSAxNi43NTEyNjQ2LDIuMTA1NjU4MzYgTDE2Ljc1MTI2NDYsMTUuMTI1MTEwOSBDMTYuNzM5NDE2MSwxNS4xOTc1OTYgMTYuNzI5MTkzOCwxNS4yNzEwMTA1IDE2LjcxNTI1NDQsMTUuMzQzMjYzNCBDMTYuNTg1Mzg1MSwxNi4wMTE2NjAzIDE2LjA0MjQ0MzMsMTYuNTY1OTg2IDE1LjM3Nzk5NTgsMTYuNzA3MDA2OSBDMTUuMjk0MzU5MSwxNi43MjUxMjgyIDE1LjIwOTU2MDcsMTYuNzM2OTc2NyAxNS4xMjQ5OTQ3LDE2Ljc1MTM4MDggWiBNMi4yMzk4MjU2Myw3LjA3NzE2NTU4IEwyLjIzOTgyNTYzLDcuMTIxMDc0ODYgQzIuMjM5ODI1NjMsOS41MjkxMTYgMi4yMzk1OTMzMSwxMS45MzcxNTcxIDIuMjQwMDU3OTYsMTQuMzQ1MTk4MyBDMi4yNDAwNTc5NiwxNC42OTE1OTM4IDIuNTM5OTg4NiwxNC45ODk0MzM1IDIuODg2Mzg0MSwxNC45ODk0MzM1IEM2LjcwNDg2NTkyLDE0Ljk4OTY2NTggMTAuNTIzMTE1NCwxNC45ODk2NjU4IDE0LjM0MTU5NzIsMTQuOTg5NDMzNSBDMTQuNjkxMjQ1MywxNC45ODk0MzM1IDE0Ljk4OTU0OTcsMTQuNjkyMDU4NCAxNC45ODk1NDk3LDE0LjM0MzEwNzMgQzE0Ljk4OTc4MiwxMS45Mzc4NTQxIDE0Ljk4OTU0OTcsOS41MzI4MzMxOSAxNC45ODk1NDk3LDcuMTI3ODEyMjcgTDE0Ljk4OTU0OTcsNy4wNzc4NjI1NSBMMTMuNDM2MjI5NSw3LjA3Nzg2MjU1IEMxMy42NTU1NDM3LDcuNzc4Nzg0ODkgMTMuNzIyOTE3Nyw4LjQ5MTc4ODEgMTMuNjM2OTU3Nyw5LjIxODQ5ODQ0IEMxMy41NTA1MzMxLDkuOTQ1NDQxMSAxMy4zMTYzNTAyLDEwLjYyMTk2OTQgMTIuOTM0ODczNywxMS4yNDY2ODk0IEMxMi41NTMxNjUsMTEuODcyMTA2MyAxMi4wNTgzMTQyLDEyLjM5MDE4OTUgMTEuNDUyNDEyNSwxMi44MDI1NjUxIEM5Ljg4MTkwMDQxLDEzLjg3MjE4NiA3LjgxNDIxNDM0LDEzLjk2NjI3NzQgNi4xNDc3NTIzLDEzLjAzMDkzOTggQzUuMzA1MzQ0NDcsMTIuNTU4NjI0NiA0LjY0MzkxNzI2LDExLjg5OTk4NTIgNC4xODI3NTM1NywxMS4wNTEzMDQ3IEMzLjQ5NDg0MTM4LDkuNzg0OTA1MDMgMy4zODQ5NTIsOC40NTU3Nzc4NCAzLjc4ODQ5OTI3LDcuMDc2NzAwOTMgQzMuMjczMjA0MDIsNy4wNzcxNjU1OCAyLjc1OTk5OTY5LDcuMDc3MTY1NTggMi4yMzk4MjU2Myw3LjA3NzE2NTU4IFogTTguNjE1NTAwNzgsNS4zMTgwMDYxNSBDNi44MTA4MDU3OSw1LjMxNjg0NDUzIDUuMzQzNjc3OTgsNi43Njg4NzEyNiA1LjMxODM1NDYzLDguNTY1NDM0OSBDNS4yOTIzMzQzMSwxMC40MTAzMjIgNi43NjkyMTk3NSwxMS44NzI4MDMzIDguNTM5NzYzMDYsMTEuOTEwOTA0NSBDMTAuMzgyMDk0NiwxMS45NTAzOTk2IDExLjg3MjIyMjUsMTAuNDc4MzkzIDExLjkxMTAyMDcsOC42ODgxMDIxMSBDMTEuOTUwNzQ4MSw2Ljg0MTgyMTA4IDEwLjQ2MTU0OTUsNS4zMTY4NDQ1MyA4LjYxNTUwMDc4LDUuMzE4MDA2MTUgWiBNMTMuNTYwMDU4NCw0LjY1NzA0MzU4IEwxMy41NjAwNTg0LDQuNjU0MDIzMzYgQzEzLjgyNzY5NTksNC42NTQwMjMzNiAxNC4wOTYyNjI4LDQuNjU5MTM0NSAxNC4zNjQxMzI3LDQuNjUyNjI5NDIgQzE0LjcwODY2OTYsNC42NDQwMzM0MiAxNC45ODkzMTczLDQuMzQ4NzQ5MjYgMTQuOTg5MzE3Myw0LjAwMzc0NzcxIEMxNC45ODk1NDk3LDMuNDkwMDc4NzMgMTQuOTg5NTQ5NywyLjk3NjE3NzQzIDE0Ljk4OTMxNzMsMi40NjI1MDg0NSBDMTQuOTg5MzE3MywyLjA5NDA0MjE1IDE0LjY5Nzc1MDQsMS44MDA4NDg5MSAxNC4zMjk3NDg3LDEuODAwNjE2NTkgQzEzLjgxNzQ3MzcsMS44MDAzODQyNiAxMy4zMDUxOTg2LDEuODAwMTUxOTQgMTIuNzkyNjkxMywxLjgwMDYxNjU5IEMxMi40MjU2MTg5LDEuODAxMDgxMjQgMTIuMTMzMTIyNywyLjA5NDk3MTQ1IDEyLjEzMjg5MDMsMi40NjM0Mzc3NSBDMTIuMTMyNjU4LDIuOTcyNjkyNTcgMTIuMTMxMjY0MSwzLjQ4MTk0NzM4IDEyLjEzNDc0ODksMy45OTE0MzQ1MiBDMTIuMTM1MjEzNiw0LjA2NzQwNDU2IDEyLjE0OTYxNzcsNC4xNDYzOTQ4MiAxMi4xNzM3Nzk0LDQuMjE4NDE1MzQgQzEyLjI2NTc3OTgsNC40ODk1Mzc3NyAxMi41MTQxMzQ1LDQuNjU1ODgxOTYgMTIuODE4MjQ3LDQuNjU3Mjc1OSBDMTMuMDY1NDQsNC42NTc3NDA1NSAxMy4zMTI2MzMsNC42NTcwNDM1OCAxMy41NjAwNTg0LDQuNjU3MDQzNTggWiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=');
      height: 18px;
      width: 17px
  }
  .socials .pi {
      background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE0cHgiIGhlaWdodD0iMThweCIgdmlld0JveD0iMCAwIDE0IDE4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTc5LjAwMDAwMCwgLTE1ODkuMDAwMDAwKSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zLjAwMDAwMCwgMTI0Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAxNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA0MC4wMDAwMDAsIDE5MC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTMyLjkyMzA3NywgMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNi40MTc3MDg4LDcuMDg1NTQ2NDMgQzExLjU1MjE1NDgsNy4wODU1NDY0MyA5LjA5ODkwNDY3LDEwLjU3Mzk0MSA5LjA5ODkwNDY3LDEzLjQ4Mjk0NTggQzkuMDk4OTA0NjcsMTUuMjQ0MzE3NyA5Ljc2NTc2MDEzLDE2LjgxMTMwODcgMTEuMTk2MDM2LDE3LjM5NTI0NzkgQzExLjQzMDU2NzEsMTcuNDkxMTMwNCAxMS42NDA2NDQyLDE3LjM5ODU0NjQgMTEuNzA4NjYwNSwxNy4xMzg4Nzg4IEMxMS43NTU5NzYyLDE2Ljk1OTE3MDIgMTEuODY3ODk2LDE2LjUwNTgwNCAxMS45MTc4Mjc3LDE2LjMxNjk5NjIgQzExLjk4NjQxMjcsMTYuMDYwMTcyMSAxMS45NTk3OTc2LDE1Ljk3MDA5MDMgMTEuNzcwNTM0OSwxNS43NDYyNTA3IEMxMS4zNTgxMTUsMTUuMjU5Nzg2MyAxMS4wOTQ1ODAzLDE0LjYzMDAxIDExLjA5NDU4MDMsMTMuNzM3OTUwMSBDMTEuMDk0NTgwMywxMS4xNDk5MTg1IDEzLjAzMDg4MzgsOC44MzMwNDIxNCAxNi4xMzY2NTgyLDguODMzMDQyMTQgQzE4Ljg4Njc2ODcsOC44MzMwNDIxNCAyMC4zOTc2ODYsMTAuNTEzNDMxNSAyMC4zOTc2ODYsMTIuNzU3NjI4MiBDMjAuMzk3Njg2LDE1LjcxMDQyMjggMTkuMDkwOTMxNCwxOC4yMDI1NzE4IDE3LjE1MDk4ODIsMTguMjAyNTcxOCBDMTYuMDc5Njc0NiwxOC4yMDI1NzE4IDE1LjI3NzY5NjUsMTcuMzE2NTQwMSAxNS41MzQ3NDgsMTYuMjI5ODcxNyBDMTUuODQyNTI3NSwxNC45MzI1NTc0IDE2LjQzODc1MDYsMTMuNTMyNDIyNSAxNi40Mzg3NTA2LDEyLjU5NjAwNDEgQzE2LjQzODc1MDYsMTEuNzU3NzQzMSAxNS45ODg3OTY2LDExLjA1ODU4NTUgMTUuMDU3NjEwMywxMS4wNTg1ODU1IEMxMy45NjI0MTE0LDExLjA1ODU4NTUgMTMuMDgyNjM1MywxMi4xOTE1NDYgMTMuMDgyNjM1MywxMy43MDkyODc3IEMxMy4wODI2MzUzLDE0LjY3NTk2MDggMTMuNDA5Mjk1NSwxNS4zMjk3MzYyIDEzLjQwOTI5NTUsMTUuMzI5NzM2MiBDMTMuNDA5Mjk1NSwxNS4zMjk3MzYyIDEyLjI4ODUwNTIsMjAuMDc4NDc5NiAxMi4wOTIwNzY4LDIwLjkxMDE0MzggQzExLjcwMDgxMjUsMjIuNTY2NDIwMyAxMi4wMzMyNzM0LDI0LjU5Njc4NjUgMTIuMDYxMzY3MSwyNC44MDE4NTkxIEMxMi4wNzc4NTk0LDI0LjkyMzMzMyAxMi4yMzQwMjM5LDI0Ljk1MjIyMjkgMTIuMzA0NzcsMjQuODYwNDM1IEMxMi40MDU3NzA3LDI0LjcyODYxMDcgMTMuNzEwMTM2OCwyMy4xMTgyODUgMTQuMTUzNjA3NywyMS41MDkyMTA0IEMxNC4yNzkwNjI1LDIxLjA1MzU2OTUgMTQuODczOTIwOCwxOC42OTQyNjgzIDE0Ljg3MzkyMDgsMTguNjk0MjY4MyBDMTUuMjI5Njk4MywxOS4zNzI5NTI3IDE2LjI2OTYxOTgsMTkuOTcwNzY4MiAxNy4zNzU1MTAyLDE5Ljk3MDc2ODIgQzIwLjY2NzU5MDIsMTkuOTcwNzY4MiAyMi45MDEwOTUzLDE2Ljk2OTUyMDUgMjIuOTAxMDk1MywxMi45NTIyMzY3IEMyMi45MDEwOTUzLDkuOTE0NTkyMzEgMjAuMzI4MTkxMSw3LjA4NTU0NjQzIDE2LjQxNzcwODgsNy4wODU1NDY0MyBMMTYuNDE3NzA4OCw3LjA4NTU0NjQzIFoiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+');
      height: 18px;
      width: 14px
  }
  footer {
      background-color: #16161a;
      color: #fff;
      padding: 42px 0 66px
  }
  footer ._cont {
      position: relative
  }
  footer .left {
      float: left;
      width: 50%
  }
  footer .right {
      float: right;
      text-align: right;
      width: 50%
  }
  footer .top .left {
      font-size: 138.46154%;
      line-height: 188.88889%;
      padding-top: 8px
  }
  footer .top .left .phone {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE3cHgiIGhlaWdodD0iMTdweCIgdmlld0JveD0iMCAwIDE3IDE3IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04NC4wMDAwMDAsIC0xNDUyLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMy4wMDAwMDAsIDEyNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgMTQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg3LjAwMDAwMCwgNDQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxnPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD0iTTIuNDUxNDI3MTQsMTYuNDk5MTkwMiBMMS40NDAyMzY2MSwxNy4yMzkzODE2IEMwLjUwMTEwOTEyMywxNy45MjY3MDIzIDAuMTE1NDA1MjA2LDE5LjExMzI0OTEgMC40NzkxODI0NzEsMjAuMTkxODM4NCBDMi4zNDM3MTcyNywyNS43MTE2OTk4IDYuODYyMzM4NjgsMzAuMTYzODY2IDEyLjU2NjczMDQsMzIuMTAwNzU5OSBDMTMuNTY2NjM3LDMyLjQ0MDc1OCAxNC43NDI0MDU2LDMyLjE4MDQwNDYgMTUuNDg0OTYyNiwzMS40NTg4NjI2IEwxNi42NDE0MzMyLDMwLjMzNTUyNjkgQzE2Ljg4MDU3NDgsMzAuMTAyNTAxNCAxNy4wMTI3MTE3LDI5Ljc5NjA0NzYgMTcuMDEyNzExNywyOS40NzE2ODI5IEMxNy4wMTI3MTE3LDI5LjAwODk1NTUgMTYuNzQ0NzE5MywyOC41ODkxMjggMTYuMzEyNjYxNywyOC4zNzYyOTA2IEwxMi45ODkzNjM0LDI2LjczNzIzMzcgQzEyLjg1NTM2NzIsMjYuNjcxMzc1OSAxMi42OTE5NDMxLDI2LjcyOTQxNjkgMTIuNjI5MzY4OCwyNi43ODQ2ODgxIEwxMi4yNDExNjQ1LDI3LjEyNjcxNzQgQzExLjI4Mzg5MywyNy45Njk5NDI0IDEwLjIwNzgyNTIsMjcuNzUyMzI0NyA5LjA1MDcxMzQ1LDI3LjE4MDEwMTIgQzcuNTYwMDIxNjYsMjYuNDQyODY0IDYuMzY1MzM5NjgsMjUuMjk3ODYzIDUuNTk4NDE5NzYsMjMuODY4ODEyMiBDNC45OTExNDEyNSwyMi43Mzg0NTk5IDQuNzc0ODgyOTIsMjEuNzYwNjY3NyA1LjY3MTM3NTI1LDIwLjgyNTA1NzMgTDYuMDI2NDk3MjYsMjAuNDUzNjY5IEM2LjA2NTI4NTYzLDIwLjQxMzI5MjcgNi4xMTE2MzkzNSwyMC4zNDQ0ODA2IDYuMTExNjM5MzUsMjAuMjQ2MzA5NSBDNi4xMTE2MzkzNSwyMC4xOTc2MjQxIDYuMDk5NjUwMjEsMjAuMTUwOTY5NyA2LjA3NjU2OTUzLDIwLjEwNzcwMDYgTDQuMzY3ODkzNDgsMTYuOTE5Njk0OCBDNC4xNDYyNTQ3NywxNi41MDU0NjgyIDMuNzA4NjE5MzEsMTYuMjQ4NSAzLjIyNjU1MzUzLDE2LjI0ODUgQzIuOTQyOTE3NTMsMTYuMjQ4NSAyLjY3NDkyNTEyLDE2LjMzNTQ2OTEgMi40NTE0MjcxNCwxNi40OTkxOTAyIFoiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+') no-repeat left 9px;
      display: inline-block;
      margin-right: 75px;
      padding-left: 26px
  }
  footer .top .left a.mail {
      display: inline-block;
      padding-left: 28px;
      position: relative
  }
  footer .top .left a.mail:before {
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjIwcHgiIGhlaWdodD0iMTE2cHgiIHZpZXdCb3g9IjAgMCAyMCAxMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiPgogICAgPGcgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMzNy4wMDAwMDAsIC0xNDUzLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMy4wMDAwMDAsIDEyNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwgMTQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg3LjAwMDAwMCwgNDQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDI1My4wMDAwMDAsIDAuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMS4yNSwxNyBDMC41NTk2ODc1LDE3IDAsMTcuNTUxMDc0OCAwLDE4LjIzMDc2NDUgTDAsMzEuNzY5MTc0IEMwLDMyLjQ0ODkyNTIgMC41NTk2ODc1LDMzIDEuMjUsMzMgTDE4Ljc1LDMzIEMxOS40NDAzMTI1LDMzIDIwLDMyLjQ0ODkyNTIgMjAsMzEuNzY5MTc0IEwyMCwxOC4yMzA3NjQ1IEMyMCwxNy41NTEwNzQ4IDE5LjQ0MDMxMjUsMTcgMTguNzUsMTcgTDEuMjUsMTcgTDEuMjUsMTcgWiBNMTguMTI1LDE4Ljg0NjE0NjcgTDE4LjEyNSwxOS4zMjkzNDQ5IEwxMCwyNi4wNDIwNTc1IEwxLjg3NSwxOS4zMjkzNDQ5IEwxLjg3NSwxOC44NDYxNDY3IEwxOC4xMjUsMTguODQ2MTQ2NyBMMTguMTI1LDE4Ljg0NjE0NjcgWiBNMS44NzUsMzEuMTUzNzkxNyBMMS44NzUsMjEuNzM5MTgxOCBMOS4xOTY1LDI3Ljc4ODE0MzEgQzkuNDI5MzEyNSwyNy45ODA0NTAxIDkuNzE0Njg3NSwyOC4wNzY4ODA1IDEwLDI4LjA3Njg4MDUgQzEwLjI4NTMxMjUsMjguMDc2ODgwNSAxMC41NzA2ODc1LDI3Ljk4MDQ1MDEgMTAuODAzNSwyNy43ODgxNDMxIEwxOC4xMjUsMjEuNzM5MTgxOCBMMTguMTI1LDMxLjE1Mzc5MTcgTDEuODc1LDMxLjE1Mzc5MTcgTDEuODc1LDMxLjE1Mzc5MTcgWiI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgogICAgPGcgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwxMDApIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzM3LjAwMDAwMCwgLTE0NTMuMDAwMDAwKSIgZmlsbD0iIzA4NmZjZiI+CiAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zLjAwMDAwMCwgMTI0Ni4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMDAwMDAwLCAxNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODcuMDAwMDAwLCA0NC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUzLjAwMDAwMCwgMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xLjI1LDE3IEMwLjU1OTY4NzUsMTcgMCwxNy41NTEwNzQ4IDAsMTguMjMwNzY0NSBMMCwzMS43NjkxNzQgQzAsMzIuNDQ4OTI1MiAwLjU1OTY4NzUsMzMgMS4yNSwzMyBMMTguNzUsMzMgQzE5LjQ0MDMxMjUsMzMgMjAsMzIuNDQ4OTI1MiAyMCwzMS43NjkxNzQgTDIwLDE4LjIzMDc2NDUgQzIwLDE3LjU1MTA3NDggMTkuNDQwMzEyNSwxNyAxOC43NSwxNyBMMS4yNSwxNyBMMS4yNSwxNyBaIE0xOC4xMjUsMTguODQ2MTQ2NyBMMTguMTI1LDE5LjMyOTM0NDkgTDEwLDI2LjA0MjA1NzUgTDEuODc1LDE5LjMyOTM0NDkgTDEuODc1LDE4Ljg0NjE0NjcgTDE4LjEyNSwxOC44NDYxNDY3IEwxOC4xMjUsMTguODQ2MTQ2NyBaIE0xLjg3NSwzMS4xNTM3OTE3IEwxLjg3NSwyMS43MzkxODE4IEw5LjE5NjUsMjcuNzg4MTQzMSBDOS40MjkzMTI1LDI3Ljk4MDQ1MDEgOS43MTQ2ODc1LDI4LjA3Njg4MDUgMTAsMjguMDc2ODgwNSBDMTAuMjg1MzEyNSwyOC4wNzY4ODA1IDEwLjU3MDY4NzUsMjcuOTgwNDUwMSAxMC44MDM1LDI3Ljc4ODE0MzEgTDE4LjEyNSwyMS43MzkxODE4IEwxOC4xMjUsMzEuMTUzNzkxNyBMMS44NzUsMzEuMTUzNzkxNyBMMS44NzUsMzEuMTUzNzkxNyBaIj48L3BhdGg+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==') no-repeat left top;
      content: "";
      height: 16px;
      left: 0;
      position: absolute;
      top: 10px;
      width: 20px
  }
  footer .top .left a.mail:hover {
      color: rgba(255, 255, 255, 0.7)
  }
  footer .top form {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      border: 1px solid #46464a;
      display: inline-block
  }
  footer .top form input {
      font-family: "montserratlight", sans-serif;
      font-size: 107.69231%;
      line-height: 121.42857%;
      background-color: transparent;
      border: 0 none;
      color: #fff;
      padding: 15px 12px;
      width: 320px
  }
  footer .top form input:-moz-placeholder {
      color: #46464a;
      opacity: 1
  }
  footer .top form input::-moz-placeholder {
      color: #46464a;
      opacity: 1
  }
  footer .top form input:-ms-input-placeholder {
      color: #46464a;
      opacity: 1
  }
  footer .top form input::-webkit-input-placeholder {
      color: #46464a;
      opacity: 1
  }
  footer .top form button {
      font-family: "montserratbold", sans-serif;
      font-size: 107.69231%;
      line-height: 121.42857%;
      background-color: transparent;
      border: 0 none;
      color: #fff;
      margin-right: 4px
  }
  footer .top form button:hover {
      color: rgba(255, 255, 255, 0.7)
  }
  footer .bottom {
      font-size: 107.69231%;
      line-height: 128.57143%;
      padding-top: 101px
  }
  footer .bottom .left nav li {
      float: left;
      list-style-type: none
  }
  footer .bottom .left nav li a {
      display: inline-block
  }
  footer .bottom .left a {
      display: inline-block;
      opacity: 0.64;
      text-decoration: underline
  }
  footer .bottom .left a:hover {
      opacity: 1
  }
  footer .bottom .left li {
      margin-right: 32px
  }
  footer .bottom .left li:last-child {
      margin-right: 0
  }
  footer .socials {
      bottom: 0;
      position: absolute;
      right: 0
  }
  @media only screen and (max-width: 1200px) {
      ._cont {
          width: 89%
      }
  }
  @media only screen and (max-width: 1170px) {
      footer .top .left {
          font-size: 107.69231%;
          line-height: 242.85714%
      }
      footer .top .left .phone {
          margin-right: 45px
      }
      footer .top form input {
          width: 280px
      }
  }
  @media only screen and (max-width: 850px) {
      header .logo {
          letter-spacing: 2px
      }
      ._cont,
      .text {
          width: 90%
      }
      .text {
          padding: 160px 0 120px
      }
      .collection-list a {
          font-size: 92.30769%;
          line-height: 125%
      }
      footer {
          padding: 21px 0 26px
      }
      footer .left,
      footer .right {
          float: none;
          text-align: center;
          width: 100%
      }
      footer .top .left {
          font-size: 92.30769%;
          line-height: 283.33333%
      }
      footer .top .left .phone {
          -moz-background-size: auto 12px;
          -o-background-size: auto 12px;
          -webkit-background-size: auto 12px;
          background-size: auto 12px;
          background-position: left 12px;
          margin-right: 25px;
          padding-left: 16px
      }
      footer .top .left a.mail {
          padding-left: 19px
      }
      footer .top .left a.mail:before {
          -moz-background-size: 100%;
          -o-background-size: 100%;
          -webkit-background-size: 100%;
          background-size: 100%;
          height: 12px;
          top: 12px;
          width: 15px
      }
      footer .top .right {
          margin-bottom: 7px
      }
      footer .top form input {
          font-size: 92.30769%;
          line-height: 141.66667%;
          padding: 12px;
          width: 224px
      }
      footer .top form button {
          font-size: 92.30769%;
          line-height: 141.66667%;
          margin-right: 4px
      }
      footer .bottom {
          font-size: 92.30769%;
          line-height: 150%;
          padding-top: 55px
      }
      footer .bottom .left nav li {
          display: inline-block;
          float: none;
          margin-right: 36px
      }
      footer .socials {
          font-size: 92.30769%;
          line-height: 141.66667%;
          bottom: auto;
          margin-bottom: 24px;
          position: static;
          right: auto;
          text-align: center
      }
      footer .socials li {
          margin: 0 23px
      }
      footer .socials strong {
          display: block;
          margin-bottom: 12px
      }
      footer .socials .tw {
          top: 14px
      }
  }
  @media only screen and (max-width: 760px) {
      .text {
          width: 90%
      }
      header nav>ul>li ul {
          left: 0;
          margin: 0 5%;
          width: 90%
      }
      .spinner .q {
          margin-right: 10px
      }
      .product-detail #AddToCart {

      }
  }
  @media only screen and (max-width: 600px) {
      header .header #customer_login_link:after,
      header .header nav>ul>li a:after {
          background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IlZyc3R2YV8xIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI3cHgiIGhlaWdodD0iOHB4Ig0KCSB2aWV3Qm94PSIzIC0yIDcgOCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAzIC0yIDcgOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTQ3LjAwMDAwMCwgLTU2NS4wMDAwMDApIj4NCgkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLjAwMDAwMCwgMzQwLjAwMDAwMCkiPg0KCQkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOS4wMDAwMDAsIDIxOC4wMDAwMDApIj4NCgkJCQk8Zz4NCgkJCQkJPHBhdGggaWQ9IlBhdGgtNjctQ29weSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGRkZGIiBkPSJNNDEsMTNsNC00bC00LTQiLz4NCgkJCQk8L2c+DQoJCQk8L2c+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==') no-repeat center center;
          content: "";
          display: block;
          height: 100%;
          margin-top: 0;
          position: absolute;
          right: 26px;
          top: 0;
          width: 7px
      }
      header ._cont {
          width: 100%
      }
      header form,
      header #customer_login_link,
      header nav {
          display: none
      }
      header .header {
          -moz-box-shadow: none;
          -webkit-box-shadow: none;
          box-shadow: none;
          height: auto
      }
      header .header form {
          -moz-border-radius: 0;
          -webkit-border-radius: 0;
          border-radius: 0;
          background-color: #16161a;
          border: 0 none;
          border-bottom: 1px solid #2e2e38;
          display: block;
          float: none;
          height: 54px;
          left: 0;
          margin-top: 0;
          padding: 8px 5% 0;
          width: 100%
      }
      header .header form .find-input {
          font-size: 92.30769%;
          line-height: 141.66667%;
          background-color: #16161a;
          color: #fff;
          padding-left: 0;
          width: 91%;
          width: calc(100% - 27px)
      }
      header .header form .find-input:-moz-placeholder {
          color: #b5b6bd
      }
      header .header form .find-input::-moz-placeholder {
          color: #b5b6bd
      }
      header .header form .find-input:-ms-input-placeholder {
          color: #b5b6bd
      }
      header .header form .find-input::-webkit-input-placeholder {
          color: #b5b6bd
      }
      header .header form button {
          background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE0cHgiIGhlaWdodD0iMTRweCIgdmlld0JveD0iMCAwIDE0IDE0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00OTQuMDAwMDAwLCAtMTI5Ny4wMDAwMDApIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTMuMDAwMDAwLCAxMjQ2LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUwNS43NTAwNDQsNTEgQzUwMi44NTA3MzEsNTEgNTAwLjUsNTMuMzUwNjQzNyA1MDAuNSw1Ni4yNDk5NTYzIEM1MDAuNSw1Ny40NjI5Njg4IDUwMC45MTUzMTksNTguNTc2NzU2MyA1MDEuNjA2NjEyLDU5LjQ2NTQwNjMgTDQ5Ny4xOTIzMjUsNjMuODc5NzM3NSBDNDk3LjA2NDEzOCw2NC4wMDc5MjUgNDk3LDY0LjE3NTM1NjIgNDk3LDY0LjM0MzcwNjMgQzQ5Nyw2NC41MTE2NjI1IDQ5Ny4wNjQxMzgsNjQuNjc5NTMxMyA0OTcuMTkyMzI1LDY0LjgwNzcxODggQzQ5Ny4zMjA0NjksNjQuOTM1OTA2MiA0OTcuNDg4MzgxLDY1IDQ5Ny42NTYyOTQsNjUgQzQ5Ny44MjQxNjIsNjUgNDk3Ljk5MjA3NSw2NC45MzU5MDYyIDQ5OC4xMjAyNjMsNjQuODA3NzE4OCBMNTAyLjUzNDU1LDYwLjM5MzQzMTIgQzUwMy40MjMyNDQsNjEuMDg0NzI1IDUwNC41MzcwMzEsNjEuNDk5OTU2MyA1MDUuNzUwMDQ0LDYxLjQ5OTk1NjMgQzUwOC42NDkzMTIsNjEuNDk5OTU2MyA1MTEuMDAwMDQ0LDU5LjE0OTI2ODcgNTExLjAwMDA0NCw1Ni4yNDk5NTYzIEM1MTEuMDAwMDQ0LDUzLjM1MDY0MzcgNTA4LjY0OTMxMiw1MSA1MDUuNzUwMDQ0LDUxIEw1MDUuNzUwMDQ0LDUxIFogTTUwNS43NTAwNDQsNjAuMTg3NSBDNTAzLjU3ODczMSw2MC4xODc1IDUwMS44MTI1NDQsNTguNDIxMjI1IDUwMS44MTI1NDQsNTYuMjQ5OTU2MyBDNTAxLjgxMjU0NCw1NC4wNzg2ODc1IDUwMy41Nzg3MzEsNTIuMzEyNDU2MyA1MDUuNzUwMDQ0LDUyLjMxMjQ1NjMgQzUwNy45MjEyNjksNTIuMzEyNDU2MyA1MDkuNjg3NSw1NC4wNzg2ODc1IDUwOS42ODc1LDU2LjI0OTk1NjMgQzUwOS42ODc1LDU4LjQyMTIyNSA1MDcuOTIxMjY5LDYwLjE4NzUgNTA1Ljc1MDA0NCw2MC4xODc1IEw1MDUuNzUwMDQ0LDYwLjE4NzUgWiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=');
          margin-right: 0
      }
      header .header #customer_login_link {
          font-size: 92.30769%;
          line-height: 141.66667%;
          background-color: #16161a;
          border-bottom: 1px solid #2e2e38;
          color: #fff;
          display: block;
          float: none;
          height: 54px;
          left: 0;
          margin: 0;
          opacity: 1;
          padding: 18px 5% 0;
          width: 100%;
          z-index: 1000
      }
      header .header #customer_login_link:hover {
          color: #fff
      }
      header .header nav {
          font-family: "montserratlight", sans-serif;
          font-size: 92.30769%;
          line-height: 141.66667%;
          background-color: #16161a;
          display: block;
          position: static;
          text-transform: none;
          z-index: 1000
      }
      header .header nav>ul>li {
          display: block;
          margin: 0
      }
      header .header nav>ul>li a {
          border-bottom: 1px solid #2e2e38;
          color: #fff;
          display: block;
          height: 54px;
          opacity: 1;
          padding: 18px 5% 0;
          text-align: left
      }
      header .header nav>ul>li a:hover {
          color: #fff
      }
      header .header nav>ul>li a:hover:before {
          opacity: 0
      }
      header .header nav>ul>li a:hover:after {
          opacity: 1
      }
      header .header nav>ul>li a:after {
          -moz-transform: rotate(90deg);
          -ms-transform: rotate(90deg);
          -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
          right: 28px
      }
      header .header nav>ul>li ul {
          -moz-transition: 0.1s;
          -o-transition: 0.1s;
          -webkit-transition: 0.1s;
          transition: 0.1s;
          -moz-column-count: 1;
          -webkit-column-count: 1;
          column-count: 1;
          -moz-column-gap: 0;
          -webkit-column-gap: 0;
          column-gap: 0;
          -moz-border-radius: 0;
          -webkit-border-radius: 0;
          border-radius: 0;
          background-color: transparent;
          left: auto;
          margin: 0;
          max-height: 0;
          overflow: hidden;
          padding: 0;
          position: static;
          top: auto;
          width: 100%
      }
      header .shadow {
          -moz-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
          -webkit-box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
          box-shadow: rgba(17, 17, 18, 0.04) 0 2px 4px, rgba(19, 20, 20, 0.06) 0 1px 1px;
          height: 52px;
          position: relative
      }
      header .logo {
          letter-spacing: 1px;
          margin-left: 4.5%;
          margin-top: 18px
      }
      header #nav-icon {
          -moz-transition: all 0.3s ease-in-out;
          -o-transition: all 0.3s ease-in-out;
          -webkit-transition: all 0.3s ease-in-out;
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          display: inline-block;
          height: 15px;
          position: relative;
          width: 16px;
          -webkit-transform: rotate(0deg);
          -moz-transform: rotate(0deg);
          -o-transform: rotate(0deg);
          transform: rotate(0deg)
      }
      header #nav-icon {
          position: absolute;
          right: 4.5%;
          top: 20px
      }
      header #nav-icon:before {
          font-size: 107.69231%;
          line-height: 128.57143%;
          content: "Menu";
          right: 0;
          padding-right: 24px;
          position: absolute;
          top: -2px
      }
      header .mobile-menu {
          -moz-transition: 0.1s;
          -o-transition: 0.1s;
          -webkit-transition: 0.1s;
          transition: 0.1s;
          max-height: 0;
          overflow: hidden
      }
      .breadcrumb {
          display: none
      }
      .text {
          padding: 20px 0 96px
      }
      .collection-list {
          margin-top: 26px
      }
      .collection-list.cols-4 a {
          width: 48.27586%;
          float: left;
          margin-right: 3.44828%;
          margin-bottom: 5.26316%
      }
      .collection-list.cols-4 a:nth-child(3n) {
          width: 48.27586%;
          float: left;
          margin-right: 3.44828%
      }
      .collection-list.cols-4 a:nth-child(3n+1) {
          clear: none
      }
      .collection-list.cols-4 a:nth-child(2n) {
          float: right;
          margin-right: 0
      }
      .collection-list.cols-4 a:nth-child(2n+1) {
          clear: both
      }
      .collection-list a>span {
          left: 0;
          max-width: 100%
      }
      .collection-list a>span strong {
          font-family: "robotolight", sans-serif
      }
      .collection-list a .variants .variant {
          float: none;
          width: auto
      }
      .collection-list a .variants .variant:nth-child(2n) {
          text-align: left
      }
      .product-detail {
          padding-top: 0
      }
      .product-detail .detail-top {
          width: 100%
      }
      .product-detail .left-col {
          float: none;
          position: relative;
          width: 100%
      }
      .product-detail .left-col .thumbs {
          bottom: -30px;
          float: none;
          left: 0;
          position: absolute;
          text-align: center;
          width: 100%;
          z-index: 100
      }
      .product-detail .left-col .thumbs a {
          border: 2px solid #e2e2e3;
          display: inline-block;
          height: 43px;
          margin: 0 8px 8px 0;
          width: 38px
      }
      .product-detail .left-col .thumbs a span {
          background-color: #fff;
          border: 2px solid #fff;
          display: block;
          height: 39px;
          overflow: hidden;
          width: 34px
      }
      .product-detail .left-col .big {
          float: none;
          width: 100%
      }
      .product-detail .left-col .big #big-image {
          display: none
      }
      .product-detail .left-col .big #banner-gallery {
          display: block;
          position: relative;
          max-width: 1024px;
          margin: 0 auto;

          border-bottom: 1px solid #c6c6c6;
          overflow: hidden
      }
      .product-detail .left-col .big #banner-gallery .swipe-wrap {
          overflow: hidden;
          position: relative
      }
      .product-detail .left-col .big #banner-gallery .swipe-wrap>div {
          background: transparent no-repeat center center;
          -moz-background-size: cover;
          -o-background-size: cover;
          -webkit-background-size: cover;
          background-size: cover;
          float: left;
          padding-bottom: 100%;
          width: 100%;
          position: relative
      }
      .product-detail .right-col {
          float: none;
          margin: 0 auto;
          width: 90%
      }
      .product-detail .cols {
          padding: 0 0 20px
      }
      .product-detail h1 {
          font-size: 107.69231%;
          line-height: 171.42857%;
          margin: 25px 0 2px;
          text-align: center
      }
      .product-detail .price-shipping {
          padding-bottom: 10px;
          text-align: center
      }
      .product-detail .price-shipping a {
          display: inline;
          float: none;
          margin: 0
      }
      .product-detail .price {
          font-size: 276.92308%;
          line-height: 111.11111%;
          display: block;
          float: none;
          text-align: center
      }
      .product-detail .swatches {
          margin: 10px 0 30px
      }
      .product-detail .swatches .guide {
          float: none;
          margin: -25px 0 0;
          text-align: center
      }
      .product-detail .swatch {
          float: none;
          margin-right: 0;
          text-align: center
      }
      .product-detail .swatch .swatch-element {
          display: inline-block;
          float: none;
          margin: 7px 8px 25px 0
      }
      .product-detail .btn-and-quantity {
          float: none;
          text-align: center
      }
      .product-detail .spinner {
          float: none;
          margin: 0 auto 10px;
          width: 200px
      }
      .product-detail .spinner input {
          width: 60px
      }
      .product-detail .spinner .q {
          margin-right: 20px;
          width: 61px
      }
      .product-detail .spinner:before {
          background: transparent url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAAAKCAIAAAB38SYMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADhSURBVFhH7ZVtC4MgFEb3///r1puZadkOU2QEKw32xe5BBC/hDZ+DPrZDrFuaTo3aeO9jSRA+oARioId1LpZ+cCIZIJee5qYbmGNJuD1JiZy751yyANoqPbEvs7Un5gq1QvRJg/zHLVeyAPua2fZKv9qBPsbQdFlXeUvrhFgJl4gJmrgJnegRoDTvMskSNJmt40mma9sr1OYPnk1f6+iGcXeuLCnuPqtpECixEi4REzRxX75JLkp2Nzjlb8+CYRTjWjhEJMsleSaGlSKSFRA8E8NKEcnKQC8xrBSRTPgz2/YGSZmvkaSZcu8AAAAASUVORK5CYII=') no-repeat center top;
          bottom: -5px;
          height: 10px;
          left: 0;
          top: auto;
          width: 100%
      }
      .product-detail #AddToCart {

      }
      .related {
          padding: 28px 0 58px
      }
      .related h2 {
          font-size: 107.69231%;
          line-height: 171.42857%
      }
      .detail-socials .social-sharing {
          -moz-transition: all 0.3s ease-in-out;
          -o-transition: all 0.3s ease-in-out;
          -webkit-transition: all 0.3s ease-in-out;
          transition: all 0.3s ease-in-out;
          -moz-box-shadow: rgba(17, 17, 18, 0.08) 0 -2px 10px;
          -webkit-box-shadow: rgba(17, 17, 18, 0.08) 0 -2px 10px;
          box-shadow: rgba(17, 17, 18, 0.08) 0 -2px 10px;
          background-color: #fff;
          bottom: -60px;
          float: none;
          height: 50px;
          left: 0;
          margin: 0;
          padding: 12px 5% 0;
          position: fixed;
          top: auto !important;
          width: 100%;
          z-index: 1000
      }
      .detail-socials .social-sharing a {
          margin-right: 20px
      }
      .social-sharing-btn-wrapper {
          font-family: "montserratregular", sans-serif;
          font-size: 92.30769%;
          line-height: 133.33333%;
          display: block
      }
      .social-sharing-btn-wrapper span {
          background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjE1cHgiIGhlaWdodD0iMTdweCIgdmlld0JveD0iMCAwIDE1IDE3IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIj4KICAgIDxnIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMC4wMDAwMDAsIC0xMjI5LjAwMDAwMCkiIGZpbGw9IiMwODZGQ0YiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMC4wMDAwMDAsIDEyMjkuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTMuMjgxMjQ0NywxNyBMMS4wNjI0Nzg3NSwxNyBDMC40NzY1MjU5MzcsMTcgMCwxNi41MjM0Njg4IDAsMTUuOTM3NSBMMCw2LjM3NSBDMCw1Ljc4OTU2MjUgMC40NzY1MjU5MzcsNS4zMTI1IDEuMDYyNDc4NzUsNS4zMTI1IEwzLjk4NDM2OTY5LDUuMzEyNSBDNC40MjQ1NjM0NCw1LjMxMjUgNC43ODEyNDQ2OSw1LjY2OTUgNC43ODEyNDQ2OSw2LjEwOTM3NSBDNC43ODEyNDQ2OSw2LjU0OTI1IDQuNDI0NTYzNDQsNi45MDYyNSAzLjk4NDM2OTY5LDYuOTA2MjUgTDEuNTkzNzUsNi45MDYyNSBMMS41OTM3NSwxNS40MDYyNSBMMTIuNzQ5OTk0NywxNS40MDYyNSBMMTIuNzQ5OTk0Nyw2LjkwNjI1IEwxMC4zNTkzNjk3LDYuOTA2MjUgQzkuOTE5MTc1OTQsNi45MDYyNSA5LjU2MjQ5NDY5LDYuNTQ5MjUgOS41NjI0OTQ2OSw2LjEwOTM3NSBDOS41NjI0OTQ2OSw1LjY2OTUgOS45MTkxNzU5NCw1LjMxMjUgMTAuMzU5MzY5Nyw1LjMxMjUgTDEzLjI4MTI0NDcsNS4zMTI1IEMxMy44NjcyMTM0LDUuMzEyNSAxNC4zNDM3NDQ3LDUuNzg5NTYyNSAxNC4zNDM3NDQ3LDYuMzc1IEwxNC4zNDM3NDQ3LDE1LjkzNzUgQzE0LjM0Mzc0NDcsMTYuNTIzNDY4OCAxMy44NjcyMTM0LDE3IDEzLjI4MTI0NDcsMTcgTDEzLjI4MTI0NDcsMTcgWiBNOS44MjgxMTk2OSw0LjI1IEM5LjYwODEyOTA2LDQuMjUgOS40MDg5MTAzMSw0LjE2MDc1IDkuMjY0NzI5MDYsNC4wMTY3ODEyNSBMNy45Njg3NDQ2OSwyLjcyMDUzMTI1IEw3Ljk2ODc0NDY5LDExLjQyMTg3NSBDNy45Njg3NDQ2OSwxMS44NjE3NSA3LjYxMjA2MzQ0LDEyLjIxODc1IDcuMTcxODY5NjksMTIuMjE4NzUgQzYuNzMxNjc1OTQsMTIuMjE4NzUgNi4zNzQ5OTQ2OSwxMS44NjE3NSA2LjM3NDk5NDY5LDExLjQyMTg3NSBMNi4zNzQ5OTQ2OSwyLjcyMDUzMTI1IEw1LjA3OTAxMDMxLDQuMDE2NzgxMjUgQzQuOTM0ODI5MDYsNC4xNjA3NSA0LjczNTYxMDMxLDQuMjUgNC41MTU2MTk2OSw0LjI1IEM0LjA3NTQyNTk0LDQuMjUgMy43MTg3NDQ2OSwzLjg5MyAzLjcxODc0NDY5LDMuNDUzMTI1IEMzLjcxODc0NDY5LDMuMjMzMTg3NSAzLjgwNzk5NDY5LDMuMDMzOTY4NzUgMy45NTIyMjkwNiwyLjg5IEw2LjYwODQ3OTA2LDAuMjMzNzUgQzYuNzUyNjYwMzEsMC4wODkyNSA2Ljk1MTg3OTA2LDAgNy4xNzE4Njk2OSwwIEM3LjM5MTg2MDMxLDAgNy41OTEwNzkwNiwwLjA4OTI1IDcuNzM1MjYwMzEsMC4yMzM3NSBMMTAuMzkxNTEwMywyLjg5IEMxMC41MzU3NDQ3LDMuMDMzOTY4NzUgMTAuNjI0OTk0NywzLjIzMzE4NzUgMTAuNjI0OTk0NywzLjQ1MzEyNSBDMTAuNjI0OTk0NywzLjg5MyAxMC4yNjgzMTM0LDQuMjUgOS44MjgxMTk2OSw0LjI1IEw5LjgyODExOTY5LDQuMjUgWiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=') no-repeat left top;
          color: #086fcf;
          cursor: pointer;
          display: inline-block;
          padding: 3px 0 0 21px
      }
      .social-sharing-btn-wrapper span:hover {
          color: #0084ff
      }
  }
  @media only screen and (max-width: 450px) {
      .collection-list.cols-4 a {
          margin-bottom: 7.14286%
      }
      footer .top form input {
          width: 218px
      }
  }
  .swatches {
      margin: 17px 0 80px
  }
  #productSelect {
      display: none
  }
  .swatch {
      float: left;
      margin-right: 40px
  }
  .swatch:nth-last-child(2) {
      margin-right: 0
  }
  .swatch .header {
      font-family: "montserratbold", sans-serif;
      text-transform: uppercase
  }
  .swatch input {
      display: none
  }
  .swatch .swatch-element {
      float: left;
      margin: 5px 8px 0 0;
      position: relative
  }
  .swatch .color label {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      -moz-border-radius: 50%;
      -webkit-border-radius: 50%;
      border-radius: 50%;
      border: 1px solid;
      cursor: pointer;
      display: block;
      height: 42px;
      padding: 7px 0 0 7px;
      width: 42px
  }
  .swatch .color label span {
      -moz-border-radius: 50%;
      -webkit-border-radius: 50%;
      border-radius: 50%;
      display: block;
      height: 26px;
      position: relative;
      width: 26px
  }
  .swatch .color label span:after {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      background: transparent url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjEycHgiIGhlaWdodD0iOXB4IiB2aWV3Qm94PSIwIDAgMTIgOSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyI+CiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIzMS4wMDAwMDAsIC0xMzAyLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMy4wMDAwMDAsIDEyNDYuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTIzNS45MzgzNyw1OC40NTA1ODYxIEwxMjM0LjUyMTE2LDU5LjM5NTUzMDcgTDEyMzcuNTQ4NDgsNjMuOTM2NzE1OCBMMTI0NS45MjIyNSw1OC4zNTM5MTk4IEwxMjQ0Ljk3NzczLDU2LjkzNjcxNTggTDEyMzguMDIxMTYsNjEuNTc0NTY3MSBMMTIzNS45MzgzNyw1OC40NTA1ODYxIEwxMjM1LjkzODM3LDU4LjQ1MDU4NjEgWiIgaWQ9ImZhamZrYSIgc2tldGNoOnR5cGU9Ik1TU2hhcGVHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTI0MC4yMjE3MDYsIDYwLjQzNjcxNikgcm90YXRlKC0xMC4wMDAwMDApIHRyYW5zbGF0ZSgtMTI0MC4yMjE3MDYsIC02MC40MzY3MTYpIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==') no-repeat center center;
      bottom: 0;
      content: "";
      display: block;
      height: 100%;
      left: 0;
      opacity: 0;
      position: absolute;
      top: 0;
      width: 100%
  }
  .swatch .plain label {
      -moz-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      -webkit-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      -moz-border-radius: 50%;
      -webkit-border-radius: 50%;
      border-radius: 50%;
      font-family: "montserratbold", sans-serif;
      border: 1px solid #086fcf;
      color: #086fcf;
      cursor: pointer;
      display: block;
      height: 42px;
      padding-top: 8px;
      text-align: center;
      width: 42px
  }
  .swatch .color input:checked+label span:after {
      opacity: 1
  }
  .swatch input:not(:checked)+label {
      border-color: #edeff2 !important
  }
  .swatch input:not(:checked)+label:hover {
      border-color: #b5b6bd !important
  }
  .swatch .plain input:not(:checked)+label {
      color: #16161a !important
  }
  .swatch .blue input:checked+label {
      border-color: #086fcf !important
  }
  .swatch .yellow input:checked+label {
      border-color: #f5c81f !important
  }
  .swatch .red input:checked+label {
      border-color: #d9332e !important
  }
  .swatch .blue label span {
      background-color: #086fcf !important
  }
  .swatch .yellow label span {
      background-color: #f5c81f !important
  }
  .swatch .red label span {
      background-color: #d9332e !important
  }
  .crossed-out {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0
  }
  .swatch .swatch-element .crossed-out {
      display: none
  }
  .swatch .tooltip {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      text-align: center;
      background-color: rgba(22, 22, 26, 0.93);
      color: #fff;
      bottom: 100%;
      padding: 10px;
      display: block;
      position: absolute;
      width: 100px;
      left: -23px;
      margin-bottom: 15px;
      filter: alpha(opacity=0);
      -khtml-opacity: 0;
      -moz-opacity: 0;
      opacity: 0;
      visibility: hidden;
      -webkit-transform: translateY(10px);
      -moz-transform: translateY(10px);
      -ms-transform: translateY(10px);
      -o-transform: translateY(10px);
      transform: translateY(10px);
      -webkit-transition: all .25s ease-out;
      -moz-transition: all .25s ease-out;
      -ms-transition: all .25s ease-out;
      -o-transition: all .25s ease-out;
      transition: all .25s ease-out;
      -webkit-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
      -moz-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
      -ms-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
      -o-box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
      box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.28);
      z-index: 10000;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box
  }
  .swatch .tooltip:before {
      bottom: -20px;
      content: " ";
      display: block;
      height: 20px;
      left: 0;
      position: absolute;
      width: 100%
  }
  .swatch .tooltip:after {
      border-left: solid transparent 10px;
      border-right: solid transparent 10px;
      border-top: solid rgba(22, 22, 26, 0.93) 10px;
      bottom: -10px;
      content: " ";
      height: 0;
      left: 50%;
      margin-left: -13px;
      position: absolute;
      width: 0
  }
  .swatch .swatch-element:hover .tooltip {
      filter: alpha(opacity=100);
      -khtml-opacity: 1;
      -moz-opacity: 1;
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateY(0px);
      -moz-transform: translateY(0px);
      -ms-transform: translateY(0px);
      -o-transform: translateY(0px);
      transform: translateY(0px)
  }
        `}</style>
                {/* Demo page craeted by https://github.com/petr-goca */}

                <section aria-label="Main content" role="main" className="product-detail">
                    <div itemScope="" itemType="http://schema.org/Product">
                        <meta
                            itemProp="url"
                            content="http://html-koder-test.myshopify.com/products/tommy-hilfiger-t-shirt-new-york"
                        />
                        <meta
                            itemProp="image"
                            content="//cdn.shopify.com/s/files/1/1047/6452/products/product_grande.png?v=1446769025"
                        />
                        <div className="shadow">
                            <div className="_cont detail-top">
                                <div className="cols">
                                    <div className="left-col">
                                        <div className="thumbs">
                                            {cartData.map((item, index) => (
                                                <a
                                                    key={index}
                                                    className={`thumb-image ${activeIndex === index ? 'active' : ''}`}
                                                    onClick={() => handleClick(index)}
                                                >
                                                    <span>
                                                        <img
                                                            src={item.src}
                                                            alt={item.alt}
                                                        />
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                        <div className="big">
                                            <span
                                                id="big-image"
                                                className="img"
                                                quickbeam="image"
                                                style={{
                                                    backgroundImage: `url("${cartData[activeIndex].src}")`,
                                                    backgroundSize: 'auto 70%',
                                                }}
                                            />
                                            <div id="banner-gallery" className="swipe">
                                                <div className="swipe-wrap">
                                                    <div
                                                        style={{
                                                            backgroundImage: `url("${cartData[activeIndex].src}")`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="right-col">
                                        <h1 itemProp="name">{fanyi(cartData[activeIndex].alt)}</h1>

                                        <div
                                            itemProp="offers"
                                            itemScope=""
                                            itemType="http://schema.org/Offer"
                                        >
                                            <meta itemProp="priceCurrency" content="USD" />
                                            <link
                                                itemProp="availability"
                                            />
                                            <strong>Estimated Price: </strong>
                                            <span className='notranslate'>${calculatePrice()}</span>
                                            <div className="swatches">
                                                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px', marginTop: '10px', color: '#2c3e50', textAlign: isMobile ? 'left' : 'left' }}>
                                                    Payment Option
                                                </div>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '10px',
                                                        justifyContent: isMobile ? 'flex-start' : 'flex-start',
                                                    }}
                                                >
                                                    {cartData[activeIndex]?.sizes.map((option, index) => (
                                                        <button
                                                            key={index}
                                                            style={{
                                                                padding: '10px 16px',
                                                                backgroundColor: selectedIndex === index ? '#28a745' : '#ffffff', // Green background if selected, white otherwise
                                                                color: selectedIndex === index ? '#ffffff' : '#28a745', // White text if selected, green text otherwise
                                                                fontSize: '16px',
                                                                fontWeight: '500',
                                                                borderRadius: '8px',
                                                                border: '2px solid #28a745', // Green border
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, transform 0.2s ease-in-out',
                                                            }}
                                                            onClick={() => {
                                                                setHasUserSetActiveIndex(true);
                                                                handleSizeSelect(index);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = selectedIndex === index ? '#218838' : '#e6f5ea'; // Light green background on hover when not selected
                                                                e.target.style.color = selectedIndex === index ? '#ffffff' : '#28a745'; // White text on hover if selected, green otherwise
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = selectedIndex === index ? '#28a745' : '#ffffff'; // Revert to initial background
                                                                e.target.style.color = selectedIndex === index ? '#ffffff' : '#28a745'; // Revert to initial text color
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.target.style.transform = 'scale(0.98)';
                                                            }}
                                                            onMouseUp={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            {fanyi(option.name)}
                                                        </button>


                                                    ))}


                                                </div>
                                                <span>
                                                    {fanyi(cartData[activeIndex].sizes[selectedIndex].description)}
                                                </span>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px', marginTop: '10px', color: '#2c3e50', textAlign: isMobile ? 'left' : 'left' }}>
                                                    Service Option
                                                </div>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '10px',
                                                        justifyContent: isMobile ? 'flex-start' : 'flex-start',
                                                    }}
                                                >
                                                    {cartData[activeIndex]?.options?.map((option, index) => ( // 使用可选链访问
                                                    
                                                        <button
                                                            key={index}
                                                            style={{
                                                                padding: '10px 16px',
                                                                backgroundColor: selectedIndices.includes(index) ? '#28a745' : '#ffffff', // Green background if selected, white otherwise
                                                                color: selectedIndices.includes(index) ? '#ffffff' : '#28a745', // White text if selected, green text otherwise
                                                                fontSize: '16px',
                                                                fontWeight: '500',
                                                                borderRadius: '8px',
                                                                border: '2px solid #28a745', // Green border
                                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, transform 0.2s ease-in-out',
                                                            }}
                                                            onClick={() => {
                                                                setHasUserSetActiveIndex(true);
                                                                handleToggle(index);
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = selectedIndices === index ? '#218838' : '#e6f5ea'; // Light green background on hover when not selected
                                                                e.target.style.color = selectedIndices === index ? '#ffffff' : '#28a745'; // White text on hover if selected, green otherwise
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = selectedIndices === index ? '#28a745' : '#ffffff'; // Revert to initial background
                                                                e.target.style.color = selectedIndices === index ? '#ffffff' : '#28a745'; // Revert to initial text color
                                                            }}
                                                            onMouseDown={(e) => {
                                                                e.target.style.transform = 'scale(0.98)';
                                                            }}
                                                            onMouseUp={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            {fanyi(option.name)}
                                                        </button>

                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart()}
                                                type="button"
                                                style={{
                                                    padding: '12px 20px', // Increased padding for better touch targets
                                                    fontSize: '18px', // Increased font size for better readability
                                                    fontWeight: '600', // Slightly bolder font weight
                                                    backgroundColor: '#007bff',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease-in-out, transform 0.2s ease-in-out',
                                                    display: 'block', // Ensures full width behavior
                                                    width: '100%', // Forces full width if needed
                                                }}
                                                className='w-full'
                                            >
                                                <span id="AddToCartText">Contact Us</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 购物车展示 */}




                    </div>
                    <aside className="related">
                        <div className="_cont">
                            <h2>我们的产品演示视频</h2>
                            <div
                                className="collection-list cols-4"
                                id="collection-list"
                                data-products-per-page={4}
                            >
                                <a className="product-box"
                                    href="https://www.youtube.com/watch?v=wcJlI1JxGvA"
                                    target="_blank"
                                >
                                    <span className="img">
                                        <span
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/a0c330c0-25e4-480b-8898-471bbe07e900/public")'
                                            }}
                                            className="i first"
                                        />
                                        <span
                                            className="i second"
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/a0c330c0-25e4-480b-8898-471bbe07e900/public")'
                                            }}
                                        />
                                    </span>
                                    <span className="text">
                                        <strong>二维码点餐演示视频</strong>
                                        <span>时长:1:10</span>
                                    </span>
                                </a>
                                <a className="product-box"
                                    href="https://www.youtube.com/watch?v=XsPJ5qgqnCo"
                                    target="_blank"
                                >
                                    <span className="img">
                                        <span
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/cf2aaf7d-a742-4529-1ddd-202cf6256400/public")'
                                            }}
                                            className="i first"
                                        />
                                        <span
                                            className="i second"
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/cf2aaf7d-a742-4529-1ddd-202cf6256400/public")'
                                            }}
                                        />
                                    </span>
                                    <span className="text">
                                        <strong>POS机演示视频</strong>
                                        <span>时长:0:57</span>

                                    </span>
                                </a>
                                <a
                                    className="product-box"
                                    href="https://www.youtube.com/watch?v=cLPom6gjmYg"
                                    target="_blank"
                                >
                                    <span className="img">
                                        <span
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/1a6da95e-5a5f-4641-6a02-e17d6107d700/public")'
                                            }}
                                            className="i first"
                                        />
                                        <span
                                            className="i second"
                                            style={{
                                                backgroundImage:
                                                    'url("https://imagedelivery.net/D2Yu9GcuKDLfOUNdrm2hHQ/1a6da95e-5a5f-4641-6a02-e17d6107d700/public")'
                                            }}
                                        />
                                    </span>
                                    <span className="text">
                                        <strong>自助点餐机演示视频</strong>
                                        <span>时长:1:16</span>
                                    </span>
                                </a>

                            </div>

                        </div>
                    </aside>
                </section>

            </ReactShadow.div>


            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    style={{ zIndex: 100 }}
                >
                    <div className="relative bg-white p-6 rounded shadow-lg w-96">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            onClick={closePopup}
                        >
                            <DeleteSvg
                                className="delete-btn"
                                style={{ cursor: 'pointer', margin: '0' }}

                            />
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
                        {cart.length === 0 ? (
                            <p className="text-gray-500">Your cart is empty</p>
                        ) : (
                            <div>
                                <ul className="space-y-0 p-0">
                                    {cart.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                                            <div className="text-base">
                                                <span className="font-bold text-lg">{item.alt}</span>
                                                <div className="text-sm text-gray-600">
                                                    Size: <span className="font-medium">{item.size.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Options: <span className="font-medium">{item.options.map((opt) => opt.name).join(', ')}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Quantity: <span className="font-medium">{item.quantity}</span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Price: <span className="font-medium">${item.price}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="text-red-500 hover:text-red-700 text-sm"
                                                onClick={() => removeFromCart(item.uniqueId)}
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="w-full p-2 mb-2 border rounded"
                                    id="phoneNumberInput"
                                />
                                <div id="smsCodeSection" className="hidden mt-2">
                                    <input
                                        type="text"
                                        placeholder="Enter the SMS code"
                                        className="w-full p-2 mb-2 border rounded"
                                        id="smsCodeInput"
                                    />
                                    <button
                                        className="mb-2 w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={handleVerifyCode}
                                    >
                                        Verify Code
                                    </button>
                                </div>
                                <button
                                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleSendSMS}
                                >
                                    Contact Us
                                </button>
                                <p className="mt-2 text-gray-600">
                                    Contact us to negotiate pricing. The displayed price is an estimate and not final.
                                </p>


                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Card

