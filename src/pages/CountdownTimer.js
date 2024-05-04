import React, { useState, useEffect } from 'react';

function CountdownTimer() {
  const [count, setCount] = useState(20);
  const params = new URLSearchParams(window.location.search);

  const storeFromURL = params.get('store') ? params.get('store').toLowerCase() : "";
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");

  useEffect(() => {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        //console.log(url.hash)
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        return false;
      }
    };

    // Call the checkUrlFormat function and log the result
    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []); // Empty dependency array means this effect runs only once after the initial render

  useEffect(() => {
    // Only set up the interval if the count is greater than 0
    if (count > 0) {
      const timerId = setInterval(() => {
        setCount(count - 1);
      }, 1000);

      // Clear interval on component unmount
      return () => clearInterval(timerId);
    }else{
      window.location.href = `/store?store=${storeFromURL}${kioskHash}`;
    }
  }, [count]);

  return (
    <span >
      {count}
    </span>
  );
}

export default CountdownTimer;
