import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCw8WmZfhBIuYJVw34gTE6LlEfOE0e1Dqo",
  authDomain: "eatify-22231.firebaseapp.com",
  databaseURL: "https://eatify-22231-default-rtdb.firebaseio.com",
  projectId: "eatify-22231",
  storageBucket: "eatify-22231.appspot.com",
  messagingSenderId: "579212375301",
  appId: "1:579212375301:web:c29702497965d6e376f36c",
  measurementId: "G-Y7WG36CDV3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Enable offline data persistence
enableMultiTabIndexedDbPersistence(db, {
  forceOwnership: true,
  cacheSizeBytes: 102400000 // Set cache size to 100 MB
}).then(() => console.log("Offline persistence enabled"))
  .catch(error => {
    switch (error.code) {
      case 'failed-precondition':
        console.log("Offline persistence already enabled in another tab")
        break
      case 'unimplemented':
        console.log("Offline persistence not supported by browser")
        break
      default:
        console.error(error)
    }
  })

