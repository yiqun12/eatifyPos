import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import Logo from './Logo';
import { HashLink as Link } from 'react-router-hash-link';

import { useUserContext } from "../context/userContext";

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';
const GOOGLE_TRANSLATE_CALLBACK = 'googleTranslateElementInit';
const GOOGLE_TRANSLATE_CONTAINER_ID = 'google_translate_element';

const clearGoogleTranslate = () => {
  const container = document.getElementById(GOOGLE_TRANSLATE_CONTAINER_ID);
  if (container) {
    container.innerHTML = '';
    delete container.dataset.gtInit;
  }

  document
    .querySelectorAll(`#${GOOGLE_TRANSLATE_SCRIPT_ID}, script[src*="translate_a/element.js"], .skiptranslate, iframe.goog-te-menu-frame`)
    .forEach((node) => node.remove());

  if (window.google && window.google.translate) {
    delete window.google.translate;
  }
  if (window[GOOGLE_TRANSLATE_CALLBACK]) {
    delete window[GOOGLE_TRANSLATE_CALLBACK];
  }
  document.body.style.top = '';
  document.body.classList.remove('translated-ltr', 'translated-rtl');
  document.documentElement.classList.remove('translated-ltr', 'translated-rtl');
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const params = new URLSearchParams(window.location.search);
  const { user, user_loading } = useUserContext();

  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";

  // Handle window resize
  useEffect(() => {
    const handleWindowSizeChange = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  // Initialize Google Translate
  useEffect(() => {
    let disposed = false;

    const googleTranslateElementInit = () => {
      const TranslateElement = window.google && window.google.translate && window.google.translate.TranslateElement;
      const container = document.getElementById(GOOGLE_TRANSLATE_CONTAINER_ID);
      if (disposed || !TranslateElement || !container || container.dataset.gtInit === 'true') return;

      container.innerHTML = '';
      new TranslateElement(
        {
          includedLanguages: "en,zh-CN",
          autoDisplay: false
        },
        GOOGLE_TRANSLATE_CONTAINER_ID
      );
      container.dataset.gtInit = 'true';
    };

    window[GOOGLE_TRANSLATE_CALLBACK] = googleTranslateElementInit;

    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      googleTranslateElementInit();
    } else if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const addScript = document.createElement("script");
      addScript.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      addScript.async = true;
      addScript.src = `//translate.google.com/translate_a/element.js?cb=${GOOGLE_TRANSLATE_CALLBACK}`;
      addScript.onerror = () => {
        console.error('Failed to load the Google Translate script');
      };
      document.body.appendChild(addScript);
    }

    return () => {
      disposed = true;
      clearGoogleTranslate();
    };
  }, [isMobile]);

  return (
    <nav className="bg-white shadow-sm fixed w-full z-[99]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/home" className="flex-shrink-0 flex items-center">
              <Logo />
            </a>

            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                smooth
                to="/home#pricing"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary transition-colors duration-300"
              >
                Pricing
              </Link>
              <a href="/scan_article"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary transition-colors duration-300">
                LLM Scan
              </a>
              <a href="/sendmessage" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary transition-colors duration-300">
                SMS API
              </a>
              <a href="/career" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary transition-colors duration-300">
                Career
              </a>
              {!isMobile ? (
                <a className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary transition-colors duration-300">
                  <div className='mt-4' id={GOOGLE_TRANSLATE_CONTAINER_ID}></div>
                </a>
              ) : null}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <a
              onClick={() => {
                // Skip redirection if we're on the code page
                if (window.location.hash.slice(1).split('?')[0] === 'code') {
                  return;
                }

                // Redirect to account page with store parameter if available
                const redirectUrl = storeFromURL ? `/account?store=${storeFromURL}` : '/account';
                window.location.href = redirectUrl;
              }}
              className="w-full flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-700 md:py-4 md:text-lg md:px-10 cursor-pointer"
            >
              {user ? "Account" : "Log In"}
            </a>
          </div>

          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary cursor-pointer"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">

          <Link
            smooth
            to="/home#pricing"
            className="block w-full py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary transition-colors duration-300"
          >
            Pricing
          </Link>
          <a href="/scan_article"
            className="block w-full py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary transition-colors duration-300">
            LLM Scan
          </a>
          <a href="/sendmessage"
            className="block w-full py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary transition-colors duration-300">
            SMS API
          </a>
          <a href="/career"
            className="block w-full py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary transition-colors duration-300">
            Career
          </a>
          {isMobile ? (
            <a
              className="block w-full py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 hover:text-primary transition-colors duration-300">
              <div className='mt-2' id={GOOGLE_TRANSLATE_CONTAINER_ID}></div>
            </a>
          ) : null}


          <a
            onClick={() => {
              // Skip redirection if we're on the code page
              if (window.location.hash.slice(1).split('?')[0] === 'code') {
                return;
              }

              // Redirect to account page with store parameter if available
              const redirectUrl = storeFromURL ? `/account?store=${storeFromURL}` : '/account';
              window.location.href = redirectUrl;
            }}
            className="block px-3 py-2 rounded-md text-base font-medium bg-orange-500 text-white hover:bg-orange-700 cursor-pointer"
          >
            {user ? "Account" : "LogIn"}
          </a>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
