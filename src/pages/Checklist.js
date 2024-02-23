import React, { useRef } from 'react';

function IframeComponent() {
  // Create references for each iframe
  const iframeRef1 = useRef(null);

  // Function to send a message to both iframes
  const sendMessageToIframes = () => {
    const message = { type: 'greeting', text: 'Hello from React!' };

    // Check if the iframe references are currently pointing to the iframe elements
    if (iframeRef1.current) {
      iframeRef1.current.contentWindow.postMessage(message, 'http://localhost:3001');
    }
  };

  return (
    <div>
      <button onClick={sendMessageToIframes}>Send Message to Iframes</button>
      <iframe
        ref={iframeRef1}
        src="http://localhost:3001"
        title="Localhost Iframe 1"
        width="0"
        height="0"
      ></iframe>
    </div>
  );
}

export default IframeComponent;
