import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

