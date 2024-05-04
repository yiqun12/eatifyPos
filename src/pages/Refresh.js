// Refresh.js
import { useLocation } from 'react-router-dom';
import { useUserContext } from "../context/userContext";
import { doc, updateDoc } from "firebase/firestore";
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
      }).then(() => {
          // After successful update, fetch the document again to see the updated content.
          return docRef.get();
      }).then(docSnapshot => {
          if (docSnapshot.exists) {
              console.log("Updated Document:", docSnapshot.data());
              // Do other tasks with the updated document if needed.
          } else {
              console.warn("Document does not exist!");
          }
      }).catch(error => {
          console.error("Error updating or fetching document:", error);
          alert("Due to security concerns, you do not have permission to update our database. Please contact customer support for further assistance.");
      });      
        alert(JSON.stringify({stripe_store_acct,storeName,id}));

        window.location.href = "/account";
      } else {
        alert(stripe_store_acct);
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
