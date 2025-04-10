import React from 'react';

const FreeScanNew = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-6xl mx-auto font-sans">
      {/* Added padding, adjusted text sizes and colors */}
      <div className="p-6 md:p-8 flex-grow">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">7dollar POS's new AI tool makes menu management a snap for merchants</h1>
        <p className="text-sm text-gray-500 mb-6">Chris Collard, Principal Product Manager, Business Platform
        November 26, 2024</p>

        {/* Added Image Here */}
        <img 
          src="/images/scan1.png" 
          alt="Merchant Menu Assistant Illustration" 
          className="block w-full  h-auto mx-auto my-8 rounded-lg shadow-md"
        />

        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">At 7dollar POS, we're constantly searching for ways to improve the experience for everyone in our ecosystem.</p>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">A recent update we rolled out for our merchant-partners on 7dollar POS Food is an AI-powered Merchant Menu Assistant. This feature helps food vendors set up their digital menu on 7dollar POS so that they can start selling.</p>
        <p className="text-base md:text-lg text-gray-800 mb-6 leading-relaxed">Merchant Menu Assistant lets them take a picture of their physical menu. It then extracts the titles, descriptions, and prices of all menu items with high accuracy, and fills them into 7dollar POS's digital catalogue template. Now, all that's left to do is review the menu items and edit details where needed, and then publish.</p>

        <img 
          src="/images/scan1.gif" 
          alt="Merchant Menu Assistant Illustration" 
          className="block w-full max-w-xl h-auto mx-auto my-8 rounded-lg shadow-md"
        />

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">Solving problems on two fronts</h2>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">Previously, setting up a menu on 7dollar POS would have required the merchant to type in each item manually. It was quite laborious, especially for restaurants with an extensive menu.</p>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">Smaller, less tech-savvy merchants were sometimes overwhelmed with this task... The Merchant Menu Assistant made this much easier... Now, Merchant Menu Assistant is now available across the region for all merchants to use on a "self-serve" basis.</p>
        <p className="text-base md:text-lg text-gray-800 mb-6 leading-relaxed">The tool automates a time-consuming task, which helps many of our food vendors, especially the smaller ones running their restaurants without a lot of manpower.</p>

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">From hackathon to real-world implementation</h2>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">Merchant Menu Assistant is a great example of how we innovate at 7dollar POS. The idea was developed at one of 7dollar POS's Hackathons.</p>
        <p className="text-base md:text-lg text-gray-800 mb-6 leading-relaxed">Technically, Merchant Menu Assistant works with a combination of optical character recognition (OCR) techniques, and Large Language Models (LLMs). The OCR helps capture text from images, and the LLMs ensure this text gets classified and organised into the right menu item data structure, such as menu titles, prices, and so on.</p>

        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">What's next for Merchant Menu Assistant</h2>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">We will continue improving this feature based on merchant feedback. One area we're working on is being able to support all types of menu structures and complexities by exploring different OCR techniques. This includes ensuring high accuracy across all the languages we support in the region.</p>
        <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">We're also working on expanding the feature to scan more data. Currently we only scan title, description, price, and category. But we are also looking at how to support modifiers—such as menu item options—and whether we can export dish images too...</p>
      </div>
    </div>
  );
}


export default FreeScanNew; 
