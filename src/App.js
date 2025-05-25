import { useUserContext } from "./context/userContext";
import SignUp from './pages/customer_signup';
import LogIn from './pages/customer_login';
import Navbar from './pages/Navbar'
import Navbar_new from './components/Navbar_new'
//import Account from './components/Account';
import Home from './pages/Home'

import ForgotPassword from './pages/ForgotPassword'
import Reservation from './pages/reservation'
import FreeScan from './pages/freeScan'
import FreeScanArticle from './pages/freeScanArticle'
import FreeScanIfarme from './pages/freeScanIframe.js'
import Resume from './pages/resume'

import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary component

import IframeDesk from './components/iframeDesk'
import { RemoveScroll } from 'react-remove-scroll';

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
import OrderHasReceived from './pages/OrderHasReceived'

import Html from './components/Html'
import { Navigate } from 'react-router-dom';
import Admin_food from './components/admin_food'

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
import Career from './pages/CareerPage'; // Your Career component
import SendMessage from './pages/SendMessage';

// import the time change page for testing
import ChangeTimeForm from "./pages/ChangeTimeForm"

// import the terminal page

import TerminalRegister from "./pages/TerminalRegister";
// import PaymentRegular from "./pages/PaymentRegular";
import PaymentKiosk from "./pages/PaymentKiosk";

import BusinessHoursTestPage from "./pages/BusinessHoursTestPage.js";

import Test_Notification_Page from "./pages/Test_Notification_Page.js";

import SoundButtonNewOrderChinese from "./pages/new_order_sound_chinese.js";

import SoundButtonNewOrderEnglish from "./pages/new_order_sound_english.js";
// import Droppable from "./pages/droppable.js";
//import Split_Payment from "./pages/Split_Payment";

import Dnd_Test from "./pages/dnd_test";

function App() {
  const { user, user_loading } = useUserContext();
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");

  useEffect(() => {
    // Function to check the URL format
    const checkUrlFormat = () => {
      try {
        // Assuming you want to check the current window's URL
        const url = new URL(window.location.href);

        // Check if hash matches the specific pattern
        // This pattern matches hashes like #string-string-string
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        //console.log(url.hash)
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        // Handle potential errors, e.g., invalid URL
        console.error("Invalid URL:", error);
        return false;
      }
    };

    // Call the checkUrlFormat function and log the result
    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []); // Empty dependency array means this effect runs only once after the initial render


  const [loading, setLoading] = useState(true);

  const [dndTestKey, setDndTestKey] = useState(0); // initial key set to 0
  const resetDndTest = () => {
    setDndTestKey(prevKey => prevKey + 1); // increment key to force re-render
  };

  useEffect(() => {
    // Added line to grab translation file (can use the same method as food_data to grab translations file)
    sessionStorage.setItem("translations", JSON.stringify(translations))

    sessionStorage.setItem("timezoneOffsets", JSON.stringify(timeZones[(businessHours[1])["timezone"]]))

  }, []);

  if (user_loading) {
    return <p>  <div className="pan-loader">
      Loading...
    </div></p>;
  } else {

    return (
      <ErrorBoundary>

        <div className="App" >

          <BrowserRouter>
            <MyHookProvider>

              <Routes>

                <Route
                  path="/SendMessage"
                  element={
                    <>
                      <Navbar_new />
                      <SendMessage />
                    </>
                  }
                />

                {/* <Route path="orders" element={<Receipt />} /> */}

                {/* <Route path="orderhasreceived" element={<OrderHasReceived />} /> */}

                {/* <Route
                  path="Reservation"
                  element={
                    <>
                      <Navbar />
                      <Reservation />
                    </>
                  }
                /> */}
                <Route
                  path="scan"
                  element={
                    <>
                      <Navbar_new />
                      <FreeScan store="freescan" />
                    </>
                  }
                />

                <Route
                  path="scan_iframe"
                  element={
                    <>
                      {/* <Navbar_new /> */}
                      <FreeScanIfarme />
                    </>
                  }
                />

                <Route
                  path="scan_article"
                  element={
                    <>
                      <Navbar_new />
                      <FreeScanArticle store="freescan" />
                    </>
                  }
                />

                <Route
                  path="resume"
                  element={
                    <>
                      <Navbar />
                      <Resume />
                    </>
                  }
                />


                {user ? (
                  <Route
                    path="Account"
                    element={
                      <>
                        <Navbar />
                        <Account_admin />
                      </>
                    }
                  />
                ) : (
                  <Route
                    path="Account"
                    element={
                      <>
                        <Navbar />
                        <LogIn />
                      </>
                    }
                  />
                )}

                {/* <Route
                  path="SignUp"
                  element={
                    <>
                      <Navbar />
                      <SignUp />
                    </>
                  }
                /> */}


                {user ? (
                  <Route
                    path="ForgotPassword"
                    element={
                      <>
                        <Navbar />
                        <Account_admin />
                      </>
                    }
                  />
                ) : (
                  <Route
                    path="ForgotPassword"
                    element={
                      <>
                        <Navbar />
                        <ForgotPassword />
                      </>
                    }
                  />
                )}
                {user || !isKiosk ? (
                  <Route
                    exact
                    path="/store"
                    element={
                      <>
                        <Navbar />
                        <Food />
                      </>
                    }
                  />
                ) : (
                  <Route
                    exact
                    path="/store"
                    element={
                      <>
                        <Navbar />
                        <LogIn />
                      </>
                    }
                  />
                )}


                <Route
                  path="/career"
                  element={
                    <>
                      <Navbar_new />
                      <Career />
                    </>
                  }
                />

                <Route path="*" exact={true} element={<Home />} />
                <Route exact path="/" element={<Home />} />

                {/* <Route exact path="/Checklist" element={<Checklist />} /> */}

              </Routes>

            </MyHookProvider>
          </BrowserRouter>
        </div>
        {/* Your entire component tree */}
      </ErrorBoundary>
    );
  }
}

export default App;
