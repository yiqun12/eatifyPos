import React from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  const params = new URLSearchParams(window.location.search);

  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";

  const handleAIClick = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('toggleAIChat'));
  };

  return (
    <div className="relative bg-white overflow-hidden pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <motion.h1
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="block xl:inline">Modern Restaurant</span>{' '}
                <span className="block text-orange-500 xl:inline">POS System</span>
              </motion.h1>
              <motion.p
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Streamline your restaurant operations, increase efficiency, and boost revenue. Our POS system provides a comprehensive solution from order taking to inventory management.
              </motion.p>
              <motion.div
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="rounded-md shadow mt-3 sm:mt-0 sm:ml-3">
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
                     className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 cursor-pointer"
                  >
                    Start Free Trial
                  </a>
                </div>
                <div className="rounded-md shadow mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#ai-chat"
                    onClick={handleAIClick}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600 transform hover:scale-105 transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 cursor-pointer"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Ask AI
                  </a>
                </div>
                <div className="rounded-md shadow mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#tutorials"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('tutorials').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 ease-in-out md:py-4 md:text-lg md:px-10 cursor-pointer"
                  >
                    Watch Demo
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80"
          alt="Restaurant POS System"
        />
      </div>
    </div>
  );
};

export default Hero; 