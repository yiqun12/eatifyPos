import { createContext, useContext, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";

import {loadStripe} from '@stripe/stripe-js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { auth } from "../firebase";

//import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MLJBWBuo6dxSribRhCcbf8dzFRYyPISzipz3fguPcItmpCnpKV0Ym1k37GTz3lpnS657H1a1XBBl0YV2bCHLIzv00tzsE3BHS';
let currentUser = {};
let customerData = {};
/**
 * Set up Stripe Elements
 */

const promise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const UserContext = createContext({});

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useState(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const {uid, displayName, email} = firebaseUser;
        const filteredProperties = Object.assign({}, {uid}, {displayName}, {email});
        setUser(filteredProperties);
        currentUser = firebaseUser;
      } else {
        setUser(null);
      }
      setError("");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const registerUser = (email, password, name) => {
    setLoading(true);
    setError("");

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        updateProfile(auth.currentUser, {
          displayName: name,
        })
        sendEmailVerification(auth.currentUser)
        logoutUser()
          }
      )
      // .then((res) => console.log(auth.currentUser))
      .then(
        alert("Email verification sent")
        // (res) => {    
        // sendEmailVerification(auth.currentUser)
        // logoutUser()
        // .then((res) => alert("Email verification sent"))
        // .catch((err) => setError(err.code))}
        )
      // .then((res) => console.log(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
      // console.log(auth)
      // console.log(user)
  };

  const signInUser = (email, password) => {
    setLoading(true);
    setError("");

    signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      if (!auth.currentUser.emailVerified) {
        logoutUser();
        localStorage.removeItem("user");
        setError("Email not verified");
        throw new Error("Email not verified, go verify your email at your email address provided");
      } else {
        updateProfile(auth.currentUser, {
          displayName: auth.currentUser.displayName,
        })
      }
    })
    .catch((err) => {
      // alert("Your email is not verified, go verify your email at your email address provided")
      setError(err.message)
    })
    .finally(
      () => {
        // if (error === "Email not verified, go verify your email at your email address provided") {
        //   alert("Your email is not verified, go verify your email at your email address provided")
        // }
        setLoading(false)
      }
      );
};

  // const signInUser = (email, password) => {
  //   setLoading(true);
  //   setError("");


  //   signInWithEmailAndPassword(auth, email, password)
  //   .then(() => {
  //     updateProfile(auth.currentUser, {
  //       displayName: auth.currentUser.displayName,
  //     })
  //     // sendEmailVerification(auth.currentUser)
  //     if (auth.currentUser.emailVerified) {
  //       console.log("You're verified")
  //     } else { 
  //       logoutUser()
  //       console.log(localStorage.getItem("user"))
  //       localStorage.removeItem("user");
  //       console.log(localStorage.getItem("user"))
  //       setError("Email not verified");
  //       alert("Your email is not verified, go verify your email at your email address provided")
  //     }
  //     // logoutUser()
  //       }
  //   )
  //     .catch((err) => setError(err.code))
  //     .finally(
  //       setLoading(false)
  //       // logoutUser()
  //     );
  // };

  

  const signInWithGoogle = () => {
    setLoading(true);
    setError("");

    signInWithPopup(auth, new GoogleAuthProvider())
      .then((res) => console.log(res))
      .catch((err) => setError(err.code))
      .finally(() => setLoading(false));
  };

  const emailVerification = () => {
    setError("");
    sendEmailVerification(auth.currentUser)
      .then((res) => console.log(res))
      .catch((err) => setError(err.code));
  };

  const logoutUser = () => {
    firebase.auth().signOut(auth);
  };

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // const isEmailVerified = () => {
  //   return auth.currentUser.emailVerified;
  // }

  const contextValue = {
    user,
    loading,
    error,
    signInUser,
    registerUser,
    logoutUser,
    forgotPassword,
    signInWithGoogle,
    emailVerification,
    promise
    // isEmailVerified
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};