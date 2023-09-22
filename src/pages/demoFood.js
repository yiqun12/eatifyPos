import React, { useState, useEffect } from 'react'
import './Food.css';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Button_ from '@mui/material/Button'
import { getFirestore, collection, getDoc,setDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import {  doc, updateDoc, arrayUnion } from "firebase/firestore";

import BusinessHoursTable from './BusinessHoursTable.js'

const Food = () => {


  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const [DemoStorename, setDemoStore] = useState('demo');

  const handleDemoStoreNameChange = (event) => {
    setDemoStore(event.target.value);
  };
  const { user, user_loading } = useUserContext();

  const handleDemoStoreNameSubmit = async (event) => {
    event.preventDefault();
    console.log('Form submitted with name:', DemoStorename);
    const storeName = DemoStorename;
    const address = "no address";
    const Open_time = "null";
    const data = ""
    //const data = localStorage.getItem("food_arrays");
  
    // First, check if a document with the given ID exists
    const docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName);
  
    // If the document doesn't exist, add a new one
    const newDoc = {
      Name: storeName,
      Address: address,
      Open_time: Open_time,
      key: data,
      Image:"https://s3-media0.fl.yelpcdn.com/bphoto/byOMYO520SGEYxKAbK_PYw/l.jpg",
      stripe_store_acct:"",
      storeOwnerId:user.uid
    };
  
    try {
      await setDoc(docRef, newDoc);  // We use setDoc since we're specifying the document ID (storeName)
      
      console.log("Document added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
   

  return (

    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
      <div className='max-w-[1000px] m-auto px-4 '>
        <div className='flex flex-col lg:flex-row justify-between' style={{ flexDirection: "column" }}>
          {/* Filter Type */}
          <div className='Type' >
            {/* <div className='flex justify-between flex-wrap'> */}

            {/* web mode */}
            <form onSubmit={handleDemoStoreNameSubmit} style={{ display: "flex", alignItems: "center" }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"  // I've used "Name" directly as you didn't provide the value of TitleLogoNameContent.Name
                name="name"
                autoComplete="name"
                autoFocus
                value={DemoStorename}
                onChange={handleDemoStoreNameChange}
                style={{ width: "50%" }}
            />
            <Button_
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                style={{ width: "50%", marginLeft: "5%", height: "56px" }}
            >
                Make it a real store
            </Button_>
        </form>
            {/* end of the top */}

          </div>

          </div>

      </div>
    </div>
  )
}

export default Food