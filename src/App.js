import Dashboard from "./components/dashboard";
import { useUserContext } from "./context/userContext";
import SignUp from './pages/customer_signup';
import LogIn from './pages/customer_login';
import Navbar from './pages/Navbar'
//import Account from './components/Account';
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import Reservation from './pages/reservation'
import Checkout from './pages/Checkout'

import Admin_new from './components/Admin_new'
import IframeDesk from './components/iframeDesk'

import Account_admin from './components/Account_admin'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './loading.css';
import React, { useState, useEffect } from 'react'

import { MyHookProvider, useMyHook } from './pages/myHook';
import Receipt from './pages/Receipt'
import Html from './components/Html'
import { Navigate } from 'react-router-dom';
import Admin_food from './components/admin_food'
import DemoCreateStore from './components/demoCreateStore'


// translation purposes -> can switch to using fetchPost() to grab translation file just like food_array
import { translations } from './data/translations.js'

// import businessHours
import { businessHours } from "./data/businessHours";

/// import timezone offsets
import { timeZones } from "./data/timeZones"
import Food from './pages/Food'
import Food_testing from './pages/Food_testing'

import Checklist from './pages/Checklist'
import DemoFood from './pages/demoFood'
import Refresh from './pages/Refresh'

// import the time change page for testing
import ChangeTimeForm from "./pages/ChangeTimeForm"

// import the terminal page

import PaymentComponent from "./pages/PaymentComponent";

import BusinessHoursTestPage from "./pages/BusinessHoursTestPage.js";

import Test_Notification_Page from "./pages/Test_Notification_Page.js";

function App() {
  const { user, user_loading } = useUserContext();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Added line to grab translation file (can use the same method as food_data to grab translations file)
    sessionStorage.setItem("translations", JSON.stringify(translations))

    // Added line to grab translation file (can use the same method as food_data to grab translations file)
    // keep a counter so the local file does not refreshes multiple times
    // (would not need this in a scenario where server stores file or where local file is changed)
    //const businessHoursData = JSON.stringify(businessHours)
    //if (!sessionStorage.getItem("businessHours")) {
    //  sessionStorage.setItem("businessHours", businessHoursData)
    //}
    // Added line to grab timezone offset file from UTC
    //const timeZoneOffsetData = JSON.stringify(timeZones)
    // console.log(timeZones["ET"])
    // sessionStorage.setItem("timezoneOffsets", timeZoneOffsetData[businessHoursData["timezone"]])
    // console.log(timeZones[(businessHours[1])["timezone"]])
    sessionStorage.setItem("timezoneOffsets", JSON.stringify(timeZones[(businessHours[1])["timezone"]]))


  }, []);

  if (user_loading) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {

    return (

      <div className="App">

        <BrowserRouter>
          <MyHookProvider>

            <Navbar />
            <Routes>

              <Route path="QRcode" element={
                user != null &&
                  user.uid === process.env.REACT_APP_ADMIN_UID ?
                  <Html /> :
                  <LogIn />} />

              <Route path="Admin" element={
                user != null &&
                  user.uid === process.env.REACT_APP_ADMIN_UID ?
                  <Admin_new /> :
                  <LogIn />} />


              <Route path="orders" element={<Receipt />} />
              <Route path="Reservation" element={<Reservation />} />
              {user ? <Route path="/checkout" element={<Checkout />}></Route> : <Route path="/checkout" element={<LogIn />}></Route>}
              {user ? <Route path="/DemoFood" element={<DemoFood />}></Route> : <Route path="/DemoFood" element={<LogIn />}></Route>}

              <Route path="Dashboard" element={<Dashboard />} />
              {user ?
                <Route path="Account" element=
                  {
                    user != null &&
                      user.uid === process.env.REACT_APP_ADMIN_UID ?
                      <Account_admin /> :
                      <Account_admin />}
                ></Route> : <Route path="Account" element={<LogIn />}></Route>
              }
              {user ?
                <Route path="LogIn" element={
                  user.uid === process.env.REACT_APP_ADMIN_UID ?
                    <Account_admin /> :
                    <Account_admin />}></Route> :
                <Route path="LogIn" element={<LogIn />}></Route>
              }

              <Route path="DemoCreateStore" element={<DemoCreateStore />}></Route>

              <Route path="SignUp" element={<SignUp />}></Route>

              {/*testing from tony change Time menu */}
              <Route exact path="/change_time" element={<ChangeTimeForm />} />

              {/* testing from tony */}
              <Route exact path="/testing_admin" element={<Account_admin />} />
              <Route exact path="/testing_food" element={<Food_testing />} />

<<<<<<< HEAD
              <Route exact path="/terminal_page" element={<PaymentComponent />} />
=======
      <Route exact path="/terminal_page" element={<PaymentComponent/>}/>
      <Route exact path="/businesshours_testpage" element={<BusinessHoursTestPage/>}/>

      <Route exact path="/test_notification_page" element={<Test_Notification_Page/>}/>

      {/* <Route exact path="/businesshours_testpage" element={<BusinessHoursTestPage/>}/> */}
>>>>>>> d9b3b3f60657784e5a3ed86780be76e11dad9492

              <Route exact path="/test_admin_new" element={<Admin_new />} />
              <Route exact path="/test_iframeDesk" element={<IframeDesk store={"demo"} />} />

              {user ? <Route path="ForgotPassword" element={<Account_admin />}></Route> : <Route path="ForgotPassword" element={<ForgotPassword />}></Route>}
              <Route exact path="/store" element={<Food />} />
              <Route exact path="/DemoFood" element={<DemoFood />} />
              <Route exact path="/AdminFood" element={<Admin_food />} />
              <Route exact path="/Refresh" element={<Refresh />} />

              <Route path='*' exact={true} element={<Home />} />
              <Route exact path="/" element={<Home />} />
              <Route exact path="/Checklist" element={<Checklist />} />

            </Routes>

          </MyHookProvider>
        </BrowserRouter>
      </div>

    );
  }
}

export default App;
