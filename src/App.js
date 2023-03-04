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
import ForgotPassword from './pages/ForgotPassword'
import Reservation from './pages/reservation'
import Checkout from './pages/Checkout'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './loading.css';
import React, { useState,useEffect } from 'react'
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase/index';
import { MyHookProvider, useMyHook } from './pages/myHook';
import Receipt from './pages/Receipt'
import Html2 from './pages/Html2'

// translation purposes -> can switch to using fetchPost() to grab translation file just like food_array
import { translations } from './data/translations.js'

function App() {

  const { user} = useUserContext();
  localStorage.setItem('user', JSON.stringify(user));
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
      //console.log("fetchPost")
      await getDocs(collection(db, "food_data"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              console.log(JSON.stringify(newData))
              localStorage.setItem("Food_arrays", JSON.stringify(newData));
          })

      await getDocs(collection(db, "TitleLogoNameContent"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              localStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
              console.log(newData)
          })

      setLoading(false);    
  }
  useEffect(() => {
    document.title = "EatifyPos"
 }, []);
  useEffect(() => {
      // added line to grab translation file (can use the same method as food_data to grab translations file)
      localStorage.setItem("translations", JSON.stringify(translations))
      // localStorage.setItem("translationsMode", "en")
      fetchPost();
  }, [])
  if (loading) {
    return <p>  <div className="pan-loader">
      Loading...
    <div className="loader"></div>
    <div className="pan-container">
      <div className="pan"></div>
      <div className="handle"></div>
    </div>
    <div className="shadow"></div>
  </div></p>;
} else {

  return (
    
    <div className="App">
      
      <BrowserRouter>
      <MyHookProvider>

      <Navbar/>
      <Routes>
      <Route path='*' exact={true} element={<Home />} />
      <Route exact path="/" element={<Home />} />
      <Route path="Auth" element={<Auth />} />
      <Route path="Admin" element={<Admin />} />
      <Route path="Receipt" element={<Receipt />} />
      <Route path="Html2" element={<Html2 />} />
      <Route path="Reservation" element={<Reservation />} />
      { user ?  <Route path="Checkout" element={<Checkout />}></Route> : <Route path="Checkout" element={<LogIn />}></Route> }
      <Route path="Dashboard" element={<Dashboard />} />
      { user ?  <Route path="Account" element={<Account />}></Route> : <Route path="Account" element={<LogIn />}></Route> }
      <Route path="success.html" element={<Success />}></Route>
      <Route path="canceled.html" element={<Canceled />}></Route>
      <Route path="SignUp" element={<SignUp />}></Route>
      { user ? <Route path="LogIn" element={<Account />}></Route>: <Route path="LogIn" element={<LogIn />}></Route>}
      { user ? <Route path="ForgotPassword" element={<Account />}></Route>: <Route path="ForgotPassword" element={<ForgotPassword />}></Route>}
      
      </Routes>
      <footer style={{'height':"100px",'color':'transparent', 'userSelect': 'none'}}>
  void
</footer>

      </MyHookProvider>
    </BrowserRouter>
    </div>
    
  );
}
}

export default App;
