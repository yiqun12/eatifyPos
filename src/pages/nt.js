import React from 'react'
import { useState } from 'react';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import { useRef, useEffect, useMemo } from 'react';
import "./modal.css"
import "./shopping_cart.css"
import item_1_pic from "./item-1.png"
import { useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import 'bootstrap/dist/css/bootstrap.css';
import './group_list.css';
import './cartcheckout.css';
import './float.css';
import $ from 'jquery';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
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
import Receipt from './Receipt'
import OrderHasReceived from './OrderHasReceived'
import cartImage from './shopcart.png';
import ringBell from './ringBell.png';

const Navbar = () => {


  const googleTranslateElementInit = () => {
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,zh-CN",
          autoDisplay: false
        },
        "google_translate_element"
      );
    } else {
      console.error('Google Translate not initialized correctly');
    }
  };

  useEffect(() => {
    // Check if the script is already loaded
    if (window.google && window.google.translate) {
      googleTranslateElementInit();
      return;
    }

    var addScript = document.createElement("script");
    addScript.setAttribute(
      "src",
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    );
    addScript.onerror = function () {
      console.error('Failed to load the Google Translate script');
    };
    document.body.appendChild(addScript);
    window.googleTranslateElementInit = googleTranslateElementInit;
  }, []);

  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  if (localStorage.getItem("Google-language") && localStorage.getItem("Google-language") !== null) {
  } else {
    localStorage.setItem("Google-language", "Select Language");
  }
  // the below code checks for language option changes with the google translate widget
  $(document).ready(function () {
    function listenToTranslateWidget() {
      if ($('.goog-te-combo').length) {
        $('.goog-te-combo').on('change', function () {
          let language = $("select.goog-te-combo option:selected").text();
          console.log(language);
          if (localStorage.getItem("Google-language") && localStorage.getItem("Google-language") !== null && language !== localStorage.getItem("Google-language")) {
            localStorage.setItem("Google-language", language);
            saveId(Math.random());  // generate a new id here
          }

        });
      } else {
        // If the widget is not yet loaded, wait and try again.
        setTimeout(listenToTranslateWidget, 1000); // Try again in 1 second
      }
    }

    listenToTranslateWidget();
  });



  return (

    <div>
      <style>
        {`
          /* Bootstrap Icons */
          @import url("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.4.0/font/bootstrap-icons.min.css");
        `}
      </style>

      <div className='mt-2' id="google_translate_element"></div>

    </div>
  )
}

export default Navbar