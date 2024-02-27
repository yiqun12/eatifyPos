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

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { auth } from "../firebase";

//import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';


let currentUser = {};
let customerData = {};
/**
 * Set up Stripe Elements
 */


export const UserContext = createContext({});

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  firebase.auth().languageCode = 'it';

  useState(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { uid, displayName, email, storelist } = firebaseUser;
        const filteredProperties = Object.assign({}, { uid }, { displayName }, { email });
        if (filteredProperties.uid != null && filteredProperties.displayName == null && email == null) {
          filteredProperties.displayName = "Guest"
          filteredProperties.email = "Guest@Eatifydash.App"
        }
        setUser(filteredProperties);
        currentUser = firebaseUser;
        //sessionStorage.setItem('user', JSON.stringify(filteredProperties));
      } else {
        setUser(null);
        //sessionStorage.setItem('user', JSON.stringify(null));
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
        emailVerification()//sometimes it conflict with logout
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
        //sessionStorage.removeItem("user");
        setError("Email not verified");
        sessionStorage.setItem('user_not_verified', JSON.stringify('user_not_verified'));
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

  // list of admin emails (replace this with your actual admin emails)
  const adminEmails = ["yix223@lehigh.edu"];

  const signInWithAdminGoogle = () => {
    setLoading(true);
    setError("");

    signInWithPopup(auth, new GoogleAuthProvider())
      .then((res) => {
        // Extract user from the result
        const user = res.user;

        if (adminEmails.includes(user.email)) {
          // If user email is in the list of admin emails, the user is an admin
          console.log("User is an admin");
          // Handle admin logic here
        } else {
          // If not an admin, ask for store name
          const storeName = prompt("Enter your store name:");
          if (storeName) {
            // Save store name and set user as admin
            // ... your logic here
          }
        }
      })
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

  const signInWithGuestLink = async (id) => {
    setLoading(true);
    setError("");
    try {
      await signInAnonymously(auth)
      //console.log(id)
      return;
    } catch (err) {
      //console.log(err.message);
      setError(err.message);
      return err.message;
    } finally {
      setLoading(false);
    }
  };

  const emailVerification = () => {
    setError("");
    sendEmailVerification(auth.currentUser)
      .then((res) => console.log(res))
      .catch((err) => setError(err.code));
  };

  const logoutUser = () => {
    firebase.auth().signOut(auth);
    setUser(null);
    //sessionStorage.setItem('user', JSON.stringify(null));
  };

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // const isEmailVerified = () => {
  //   return auth.currentUser.emailVerified;
  // }

  const contextValue = {
    user,
    user_loading: loading,
    error,
    signInUser,
    registerUser,
    logoutUser,
    forgotPassword,
    signInWithGoogle,
    signInWithGuest,
    signInWithGuestLink,
    signInWithAdminGoogle,
    // isEmailVerified
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};


