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
  signInAnonymously
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
        if(filteredProperties.uid!=null&&filteredProperties.displayName==null&&email==null){
          filteredProperties.displayName = "Anonymous mode"
          filteredProperties.email = "Anonymous@eatifyPos.com"
        }
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
// logout untill full filled.
  const registerUser = async (email, password, name) => {
    setLoading(true);
    setError("");
  
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        updateProfile(auth.currentUser, {
          displayName: name,
        });
        logoutUser()
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoading(false));
  };


  const signInUser = async (email, password) => {
    setLoading(true);
    setError("");
  
    try {
      await signInWithEmailAndPassword(auth, email, password)
  
      if (!auth.currentUser.emailVerified) {
        logoutUser();
        localStorage.removeItem("user");
        setError("Email not verified");
        localStorage.setItem('user_not_verified', JSON.stringify('user_not_verified'));
        throw new Error("Email not verified, go verify your email at your email address provided");
      } else {
        updateProfile(auth.currentUser, {
          displayName: auth.currentUser.displayName,
        });
        return;
      }
    } catch (err) {
      //console.log(err.message);
      setError(err.message);
      return err.message;
    } finally {
      setLoading(false);
    }
  };
  

  const signInWithGoogle = () => {
    setLoading(true);
    setError("");

    signInWithPopup(auth, new GoogleAuthProvider())
      .then((res) => console.log(res))
      .catch((err) => setError(err.code))
      .finally(() => setLoading(false));
  };

  const signInWithGuest = () => {
    setLoading(true);
    setError("");
  
    try {
      signInAnonymously(auth)
/*  
      updateProfile(auth.currentUser, {
        displayName: 'Guest',
      });*/
      return;
    } catch (err) {
      //console.log(err.message);
      setError(err.message);
      return err.message;
    } finally {
      setLoading(false);
    }
  };

  // const signInWithGuest = () => {
  //   setLoading(true);
  //   setError("");
  
  // //   signInAnonymously(auth)
  // // .then(() => {
  // //   // Signed in..
  // // })
  // // .catch((error) => {
  // //   const errorCode = error.code;
  // //   const errorMessage = error.message;
  // //   // ...
  // // });

  //   signInAnonymously(auth)
  //   .then(updateProfile(auth.currentUser, {
  //     displayName: 'guest',
  //   }))
  //   .catch((err) => setError(err.code))
  //   .finally(() => setLoading(false));
  // }

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
    promise,
    signInWithGuest
    // isEmailVerified
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};