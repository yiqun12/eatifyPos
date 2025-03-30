import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">7dollar POS</h3>
            <p className="text-gray-400">
              Modern restaurant POS system solutions to help you improve efficiency and increase revenue.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors duration-300">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-300">Pricing</a></li>
              <li><a href="#demo" className="text-gray-400 hover:text-white transition-colors duration-300">Demo</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white transition-colors duration-300">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
              <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors duration-300">Blog</a></li>
              <li><a href="/partners" className="text-gray-400 hover:text-white transition-colors duration-300">Partners</a></li>
              <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors duration-300">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Phone: 1-929-461-4214</li>
              <li className="text-gray-400">Email: admin@eatfiydash.com</li>
              <li className="text-gray-400">Demo Location: 1343 Powell St, San Francisco, CA 94133</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">© {new Date().getFullYear()} 7dollar POS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 