import React from "react";
import { useState, useEffect } from 'react';

const Main = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div>
      {width > 640 ? (
        <div className="container">
          <div style={{ width: "500px", margin: "0 auto" }}>
            <div className="card2 mt-50 mb-50">
              <div className="main">
                <hr className="full-width-hr" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <hr />
      )}
    </div>
  );
};

export default Main;