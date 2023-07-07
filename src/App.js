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
import Admin_new from './components/Admin_new'
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
import Html2 from './components/Html2'
import Html from './components/Html'
import { Navigate } from 'react-router-dom';

// translation purposes -> can switch to using fetchPost() to grab translation file just like food_array
import { translations } from './data/translations.js'

function App() {

  const { user} = useUserContext();

  const [loading, setLoading] = useState(true);
  console.log("userload",user)
  console.log("userSession",JSON.parse(sessionStorage.getItem('user')))

  const fetchPost = async () => {
    
      console.log("fetchPost1")
      await getDocs(collection(db, "food_data"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
              //console.log(JSON.stringify(newData))
              sessionStorage.setItem("Food_arrays", JSON.stringify(newData));
          })

      await getDocs(collection(db, "TitleLogoNameContent"))
          .then((querySnapshot) => {
              const newData = querySnapshot.docs
                  .map((doc) => ({ ...doc.data(), id: doc.id }));
                  sessionStorage.setItem("TitleLogoNameContent", JSON.stringify(newData));
              //console.log(newData)
              window.location.href = './';

          })
  }
  useEffect(() => {
    document.title = "EatifyPos"
 }, []);

 useEffect(() => {
  // Added line to grab translation file (can use the same method as food_data to grab translations file)
  sessionStorage.setItem("translations", JSON.stringify(translations))

  if (!sessionStorage.getItem("Food_arrays") || !sessionStorage.getItem("TitleLogoNameContent")) {
    fetchPost();
  }else{
    setLoading(false); 
  }
}, []);

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
        
      <Route path="QRcode" element={ 
        JSON.parse(sessionStorage.getItem('user'))!=null &&
        JSON.parse(sessionStorage.getItem('user')).uid === "27PaU92zV9aTxfj7LdoaZgR0heq1" ? 
        <Html /> : 
        <LogIn />} />

      <Route path="Admin" element={
        JSON.parse(sessionStorage.getItem('user'))!=null && 
        JSON.parse(sessionStorage.getItem('user')).uid === "27PaU92zV9aTxfj7LdoaZgR0heq1" ? 
        <Admin_new /> : 
        <LogIn />} />
      <Route path='*' exact={true} element={<Home />} />
      <Route exact path="/" element={<Home />} />
      <Route path="Receipt" element={<Receipt />} />
      <Route path="guest/:id" element={<Html2 />} />
      <Route path="Reservation" element={<Reservation />} />
      { JSON.parse(sessionStorage.getItem('user')) ?  <Route path="Checkout" element={<Checkout />}></Route> : <Route path="Checkout" element={<LogIn />}></Route> }
      <Route path="Dashboard" element={<Dashboard />} />
      { JSON.parse(sessionStorage.getItem('user')) ?  <Route path="Account" element={<Account />}></Route> : <Route path="Account" element={<LogIn />}></Route> }
      <Route path="SignUp" element={<SignUp />}></Route>
      { JSON.parse(sessionStorage.getItem('user')) ? <Route path="LogIn" element={<Account />}></Route>: <Route path="LogIn" element={<LogIn />}></Route>}
      { JSON.parse(sessionStorage.getItem('user')) ? <Route path="ForgotPassword" element={<Account />}></Route>: <Route path="ForgotPassword" element={<ForgotPassword />}></Route>}

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
