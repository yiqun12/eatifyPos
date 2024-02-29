import { useState, useEffect } from 'react';
import { onValue, ref, getDatabase } from 'firebase/database';

const useNetworkStatusWithFirebase = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize Firebase Database and reference to the '.info/connected' path
    const db = getDatabase();
    const connectedRef = ref(db, '.info/connected');

    // Listen for changes in the connection state
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        // Firebase reports that it is disconnected
        setIsOnline(false);
      } else {
        // Firebase reports that it is connected or reconnects
        setIsOnline(true);
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  return { isOnline };
};

export default useNetworkStatusWithFirebase;
