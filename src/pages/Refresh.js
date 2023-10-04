// Refresh.js
import { useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase/index';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Refresh() {
  let query = useQuery();

  const id = query.get("ID");
  const storeName = query.get("StoreName");
  const stripe_store_acct = query.get("stripe_store_acct");

  const { user, user_loading } = useUserContext();
  console.log(user)
  console.log(user_loading)
  useEffect(() => {
    if (user_loading) {
      // Don't run if loading was false and now it's true again (e.g., re-fetching)
      return;
    }
    
    // Only run the effect if user_loading transitions from true to false
    if (!user_loading) {
      if (user && user.uid === id) {
        const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName);
        updateDoc(docRef, {
          stripe_store_acct: stripe_store_acct
        }).catch(error => {
          console.error("Error updating document:", error);
          alert("For sercurity concern, you do not have permision to access our database. Please contact our customer service.");
        });
        window.location.href = "/account";
      } else {
        alert("For sercurity concern, you are authorized. You need to log in your account and try again. Or contact our customer service.");
      }
    }
    
  }, [user, user_loading, id, storeName, stripe_store_acct]);

  return (
    <div>
      <p>Loading... </p>
    </div>
  );
}

export default Refresh;