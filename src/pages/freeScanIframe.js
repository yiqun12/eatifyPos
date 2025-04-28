import React from 'react';
import { Link } from 'react-router-dom';
import '../components/iPhone.css'; // 将创建这个CSS文件

const FreeScanIframe = () => {
  return (
    <div className="iphone-container">
      <div className="iphone">
        <div className="iphone-top">
          <div className="iphone-camera"></div>
          <div className="iphone-speaker"></div>
        </div>
        <div className="iphone-screen">
          <iframe 
            src="/scan" 
            title="Menu Scanner" 
            className="iphone-content"
          />
        </div>
        <div className="iphone-bottom">
          <div className="iphone-home-button"></div>
        </div>
      </div>
    </div>
  );
}

export default FreeScanIframe; 
