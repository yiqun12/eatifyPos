import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore, enableMultiTabIndexedDbPersistence,enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

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

firebase.initializeApp(firebaseConfig);
// Immediately set Firestore settings
firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable offline data persistence

firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence.
    }
  });

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
enableMultiTabIndexedDbPersistence(db, {
  forceOwnership: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED // Set cache size to unlimited
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
// Enable offline data persistence
export const functions = getFunctions(app);

