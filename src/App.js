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
import MemoryMonitor from './components/MemoryMonitor';

import IframeDesk from './components/iframeDesk'
import { RemoveScroll } from 'react-remove-scroll';

import Account_admin from './components/Account_admin'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  shouldBlockForAuth,
  resolveProtectedAccountView,
} from "./utils/authRoute";
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
  useEffect(() => {
    sessionStorage.setItem("translations", JSON.stringify(translations))
    sessionStorage.setItem("timezoneOffsets", JSON.stringify(timeZones[(businessHours[1])["timezone"]]))
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <BrowserRouter>
          <MyHookProvider>
            <AppRoutes />
          </MyHookProvider>
        </BrowserRouter>
      </div>
      {process.env.NODE_ENV === "development" && <MemoryMonitor />}
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { user, user_loading } = useUserContext();
  const location = useLocation();
  const [isKiosk, setIsKiosk] = useState(false);
  const [kioskHash, setkioskHash] = useState("");

  useEffect(() => {
    const checkUrlFormat = () => {
      try {
        const url = new URL(window.location.href);
        const hashPattern = /^#(\w+)-(\w+)-(\w+)$/;
        setkioskHash(url.hash)
        return hashPattern.test(url.hash);
      } catch (error) {
        console.error("Invalid URL:", error);
        return false;
      }
    };

    const result = checkUrlFormat();
    setIsKiosk(result)
    console.log("URL format check result:", result);
  }, []);

  const [loading, setLoading] = useState(true);

  const [dndTestKey, setDndTestKey] = useState(0);
  const resetDndTest = () => {
    setDndTestKey(prevKey => prevKey + 1);
  };

  if (shouldBlockForAuth(user_loading, location.pathname)) {
    return (
      <div className="pan-loader">
        Loading...
      </div>
    );
  }

  const accountView = resolveProtectedAccountView(user, user_loading);

  return (
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


                <Route
                  path="Account"
                  element={
                    accountView === 'loading' ? (
                      <div className="pan-loader">Loading...</div>
                    ) : accountView === 'account' ? (
                      <>
                        <Navbar />
                        <Account_admin />
                      </>
                    ) : (
                      <>
                        <Navbar />
                        <LogIn />
                      </>
                    )
                  }
                />

                {/* <Route
                  path="SignUp"
                  element={
                    <>
                      <Navbar />
                      <SignUp />
                    </>
                  }
                /> */}


                <Route
                  path="ForgotPassword"
                  element={
                    accountView === 'loading' ? (
                      <div className="pan-loader">Loading...</div>
                    ) : accountView === 'account' ? (
                      <>
                        <Navbar />
                        <Account_admin />
                      </>
                    ) : (
                      <>
                        <Navbar />
                        <ForgotPassword />
                      </>
                    )
                  }
                />
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
  );
}

export default App;
