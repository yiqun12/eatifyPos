import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from '../firebase/index';
import QRCode from 'qrcode.react'; // import QRCode component

function App() {
  const [guestLinks, setGuestLinks] = useState([]);

  useEffect(() => {
    // Define a query to get only documents where "isUsed" is false
    const q = query(collection(db, "guestLink"), where("isUsed", "==", false));
        
    // Listen for real time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Map the data and id
      const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          
      // Set the state
      setGuestLinks(newData);
    });

    // Cleanup function to stop listening for updates when the component is unmounted
    return () => unsubscribe();
  }, []); // The empty array ensures that this runs once on component mount and not on every render

  // You can now use guestLinks state variable in your component
  return (
    <div className="App">
        {/* Example usage: */}
        {guestLinks.map((link) => (
            <div key={link.id} style={{ textAlign: 'center' }}>
  <p>{"http://localhost:3000/guest/"+link.id}</p>
  <div style={{ display: 'inline-block' }}>
    <QRCode value={"http://localhost:3000/guest/"+link.id} size={256} />
  </div>
</div>
        ))}
    </div>
  );
}

export default App;
