import React from 'react';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon,RocketLaunchIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import NetworkSphere from './NetworkSphere';

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
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 xl:max-w-2xl xl:w-full xl:pb-28 2xl:pb-32 pt-10 sm:pt-12 md:pt-16 xl:pt-20 2xl:pt-28">
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:text-center xl:text-left">
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
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl xl:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Streamline your restaurant operations, increase efficiency, and boost revenue. Our POS system provides a comprehensive solution from order taking to inventory management.
              </motion.p>
              <motion.div
                className="mt-5 sm:mt-8 sm:flex sm:justify-center xl:justify-start"
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
                    <RocketLaunchIcon className="h-5 w-5 mr-2" />

                    Free Trial
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
                    <PlayCircleIcon className="h-5 w-5 mr-2" />
                    Watch Demo
                  </a>
                </div>
              </motion.div>
              
              {/* Sphere displays below buttons on small/medium screens */}
              <motion.div
                className="mt-8 flex justify-center xl:hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="h-80 w-80 flex items-center justify-center">
                  <NetworkSphere />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sphere displays on right side for large screens */}
      <div className="hidden xl:block xl:absolute xl:inset-y-0 xl:right-0 xl:w-1/2">
        <div className="xl:w-full xl:h-full flex items-center justify-center relative overflow-hidden">
          <NetworkSphere />
        </div>
      </div>
    </div>
  );
};

export default Hero; 