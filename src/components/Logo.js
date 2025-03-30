import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="#FF642D" />
        
        <path d="M16 14H32L24 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 22H30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 28H26" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="ml-2 text-gray-800 font-bold text-xl">7dollar POS</span>
    </div>
  );
};

export default Logo;