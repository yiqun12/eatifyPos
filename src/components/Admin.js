import React, { useEffect, useRef } from 'react';

const Exercises = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data === 'buttonClicked') {
        console.log('Button clicked2!');
      }
    });
    iframeRef.current.src = './abc.html';
  }, []);

  return (
    <div style={{ height: "900px" }}>
      <iframe ref={iframeRef} style={{ width: '540px', height: '100%', overflow: 'hidden' }}></iframe>
    </div>
  );
};

export default Exercises;
