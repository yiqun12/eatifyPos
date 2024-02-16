import React from 'react';

function IframeComponent() {
  return (
    <div>
      <h2>Iframe Example</h2>
      {/* 嵌入iframe */}
      <iframe
        src="http://localhost:3000"
        title="Localhost Iframe"
        width="600"
        height="400"
      ></iframe>
    </div>
  );
}

export default IframeComponent;
