import React, { useState, useEffect } from 'react'
import './Food.css';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Button_ from '@mui/material/Button'
import { getFirestore, collection, getDoc, setDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from '../firebase/index';
import { useUserContext } from "../context/userContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import QRCode from 'qrcode.react';
import intro_pic from './Best-Free-Online-Ordering-Systems-for-Restaurants.png';


const Food = () => {
  console.log(JSON.parse(localStorage.getItem("demo")))


  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const [DemoStorename, setDemoStore] = useState('demo');

  const handleDemoStoreNameChange = (event) => {
    let value = event.target.value;
    value = value.toLowerCase(); // Convert to lowercase
    value = value.replace(/[^a-z0-9]/g, ''); // Remove special characters other than alphabets and numbers
    setDemoStore(value);
    //setDemoStore(event.target.value);
  };
  const { user, user_loading } = useUserContext();

  const handleDemoStoreNameSubmit = async (event) => {
    event.preventDefault();
    //console.log('Form submitted with name:', DemoStorename);
    const storeName = DemoStorename;
    const address = "San Francisco";
    const Open_time = "null";
    const data = JSON.stringify([
      {
        "name": "Filet Mignon",
        "category": "Steak Cuts",
        "CHI": "菲力牛排",
        "image": "https://img1.baidu.com/it/u=1363595818,3487481938&fm=253&fmt=auto&app=138&f=JPEG?w=891&h=500",
        "id": "b5fe9fb8-0f83-4b78-8ed5-c9cc3355aa76",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      },
      {
        "name": "Rib Eye Steak",
        "category": "Steak Cuts",
        "CHI": "肋眼牛排",
        "image": "https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
        "id": "8d2579fc-bd3a-4df0-bde5-8884bcbd2919",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      },
      {
        "name": "Porterhouse for Two",
        "category": "Steak Cuts",
        "CHI": "上等腰肉牛排二人份",
        "image": "https://img2.baidu.com/it/u=1076400451,2339714653&fm=253&fmt=auto&app=138&f=JPEG?w=667&h=500",
        "id": "267d3107-1532-4084-ab3b-b62ceda0b75c",
        "subtotal": 1,
        "attributes": [],
        "attributes2": [],
        "attributesArr": {},
        "availability": [
          "Morning",
          "Afternoon",
          "Evening"
        ]
      }
    ])
    const clock = { "0": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "1": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "2": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "3": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "4": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "5": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "6": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "7": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" } }
    const restaurant_seat_arrangement = {
      "table": [
        {
          "type": "rect",
          "left": 45,
          "top": 75,
          "width": 60,
          "height": 60,
          "scaleX": 1,
          "scaleY": 1,
          "tableName": "A12",
          "id": "j57opywg",
          "snapAngle": 45,
          "angle": 0
        },
        {
          "type": "rect",
          "left": 165,
          "top": 75,
          "width": 60,
          "height": 60,
          "scaleX": 1,
          "scaleY": 1,
          "tableName": "A3",
          "id": "spkjh6o6",
          "snapAngle": 45,
          "angle": 0
        }
      ],
      "chair": [],
      "wall": []
    }
    let docRef;

    try {
      docRef = doc(db, "TitleLogoNameContent", storeName)
      const doc_ = await getDoc(docRef);

      if (doc_.exists()) {
        console.log("Document exists!");
        throw new Error('Document already exists!');
      } else {
        docRef = doc(db, "stripe_customers", user.uid, "TitleLogoNameContent", storeName);

        // If the document doesn't exist, add a new one
        const newDoc = {
          Name: storeName,
          Address: address,
          Open_time: JSON.stringify(clock),
          key: data,
          Image: "https://s3-media0.fl.yelpcdn.com/bphoto/byOMYO520SGEYxKAbK_PYw/l.jpg",
          stripe_store_acct: "",
          storeOwnerId: user.uid,
          restaurant_seat_arrangement: JSON.stringify(restaurant_seat_arrangement),
          storeNameCHI: storeName,
          ZipCode: '90011',
          State: 'CA',
          Phone: '4155551234',
          physical_address: '123 Main Street',
        };

        try {
          await setDoc(docRef, newDoc);  // We use setDoc since we're specifying the document ID (storeName)
          window.location.hash = `${DemoStorename}`;
          console.log("Document added successfully!");
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      }
    } catch (error) {
      alert(error.message); // Displays the error message in an alert popup
    }


  };
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = width <= 768;



  return (

    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>



      <div className='flex'>
        <div style={isMobile ? {} : { width: "45%" }}>
          <div>
            <form
              className='mt-5 mr-5'
              onSubmit={handleDemoStoreNameSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                borderRadius: !isMobile ? "8px" : "0px", // Apply borderRadius if isMobile is true, otherwise, set it to 0px
                boxShadow: !isMobile ? "0px 0px 10px rgba(0,0,0,0.1)" : "none" // Apply boxShadow if isMobile is true, otherwise, set it to "none"
              }}
            >
              <h2 style={{ marginBottom: "20px" }}>Your Store QR Code</h2>

              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                Enter your store name below and click "Generate QR Code". Once generated, you can scan the QR code to access your store's menu.
              </div>

              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Store Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={DemoStorename}
                onChange={handleDemoStoreNameChange}
              />
              <Button_
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                style={{ height: "56px" }}
              >
                Generate QR Code
              </Button_>
              {(isMobile) &&
                <div style={{ marginTop: "30px" }}>
                  {DemoStorename ? <div style={{ marginBottom: "20px" }}>Your QR Code:</div> : <div></div>}


                  <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                    {DemoStorename ? <QRCode value={`https://eatifylab.com/store?store=${DemoStorename}`} /> : <img src={intro_pic}></img>}

                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    {DemoStorename ? <div>Visit: <a href={`https://eatifylab.com/store?store=${DemoStorename}`} target="_blank" rel="noopener noreferrer">{`https://eatifylab.com/store?store=${DemoStorename}`}</a></div> : <div></div>}
                  </div>
                </div>
              }
            </form>

          </div>
        </div>
        <div className="mr-2" style={isMobile ? {} : { width: "45%" }}>

          {(!isMobile) &&
            <div
              className='mt-5'

              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                borderRadius: !isMobile ? "8px" : "0px", // Apply borderRadius if isMobile is true, otherwise, set it to 0px
                boxShadow: !isMobile ? "0px 0px 10px rgba(0,0,0,0.1)" : "none" // Apply boxShadow if isMobile is true, otherwise, set it to "none"
              }}>
              <div style={{ marginTop: "30px" }}>
                {DemoStorename ? <div style={{ marginBottom: "20px" }}>Your QR Code:</div> : <div></div>}
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
                  {DemoStorename ? <QRCode value={`https://eatifylab.com/store?store=${DemoStorename}`} /> : <img src={intro_pic}></img>}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  {DemoStorename ? <div>Visit: <a href={`https://eatifylab.com/store?store=${DemoStorename}`} target="_blank" rel="noopener noreferrer">{`https://eatifylab.com/store?store=${DemoStorename}`}</a></div> : <div></div>}
                </div>
              </div>
            </div>

          }

        </div>
      </div>
    </div>
  )
}

export default Food