import React from 'react';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/7dollar-pos/id6782497706';

const AppStoreBanner = () => {
  return (
    <div className="bg-orange-500">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left text-white hover:text-white no-underline"
      >
        <span className="text-sm sm:text-base font-medium text-white">
          Get the <span className="font-bold notranslate">7dollar POS</span> app for iPhone and iPad
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm font-semibold whitespace-nowrap">
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.365 12.83c-.026-2.77 2.264-4.1 2.366-4.162-1.29-1.884-3.297-2.143-4.01-2.173-1.705-.173-3.33 1.004-4.196 1.004-.88 0-2.216-.98-3.65-.953-1.877.028-3.62 1.093-4.588 2.774-1.96 3.396-.5 8.42 1.407 11.173.934 1.348 2.043 2.86 3.5 2.807 1.424-.058 1.962-.92 3.684-.92 1.705 0 2.21.92 3.684.89 1.526-.026 2.49-1.372 3.416-2.728 1.076-1.56 1.516-3.07 1.54-3.15-.034-.016-2.95-1.132-2.983-4.362zM13.877 4.46c.78-.946 1.306-2.262 1.163-3.58-1.124.046-2.485.75-3.29 1.69-.72.836-1.352 2.173-1.182 3.457 1.25.097 2.53-.636 3.309-1.567z" />
          </svg>
          Download on the App Store
        </span>
      </a>
    </div>
  );
};

export default AppStoreBanner;
