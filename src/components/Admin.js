import React, { useEffect, useRef } from 'react';

function Iframe({ src, width, height }) {
  const iframeRef = useRef();

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const publicPath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';
        const response = await fetch(publicPath + src);
        const html = await response.text();
        iframeRef.current.contentWindow.document.open();
        iframeRef.current.contentWindow.document.write(html);
        iframeRef.current.contentWindow.document.close();
      } catch (error) {
        console.error('Error fetching HTML:', error);
      }
    };

    fetchHtml();
  }, [src]);

  return <iframe ref={iframeRef} title="Seat" width={width} height={height} />;
}

export default function Exercises() {
  return <Iframe src={`${process.env.PUBLIC_URL}/seat.html`} width="540" height="450" />;
}
