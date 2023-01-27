import Auth from "./components/auth";
import Dashboard from "./components/dashboard";
import Admin from "./components/Admin";
import { useUserContext } from "./context/userContext";
import Success from './pages/Success';
import Canceled from './pages/Canceled';
import SignUp from './pages/new_signup';
import LogIn from './pages/new_login';
import Navbar from './pages/Navbar'
import Account from './pages/Account';
import Home from './pages/Home'
import Html from './pages/Html'
import Html2 from './pages/Html2'
import Checkout from './pages/Checkout'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import React, { useState,useEffect } from 'react'
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase/index';

function App() {
  const { user} = useUserContext();
  localStorage.setItem('user', JSON.stringify(user));
  
  const fetchPost = async () => {
      //console.log("fetchPost")
      await getDocs(collection(db, "food_data"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              localStorage.setItem("Food_arrays", JSON.stringify(newData));
          })

      await getDocs(collection(db, "TitleLogoNameContent"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              localStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
              console.log(newData)
          })
  }

  useEffect(() => {
      fetchPost();
  }, [])


  return (
    
    <div className="App">
      <BrowserRouter>
      <Navbar />
      <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="Auth" element={<Auth />} />
      <Route path="Admin" element={<Admin />} />
      <Route path="Html" element={<Html />} />
      <Route path="Html2" element={<Html2 />} />
      { user ?  <Route path="Checkout" element={<Checkout />}></Route> : <Route path="Checkout" element={<LogIn />}></Route> }
      <Route path="Dashboard" element={<Dashboard />} />
      { user ?  <Route path="Account" element={<Account />}></Route> : <Route path="Account" element={<LogIn />}></Route> }
      <Route path="success.html" element={<Success />}></Route>
      <Route path="canceled.html" element={<Canceled />}></Route>
      <Route path="SignUp" element={<SignUp />}></Route>
      <Route path="LogIn" element={<LogIn />}></Route>
      </Routes>
    </BrowserRouter>
    </div>
    
  );
}

export default App;
