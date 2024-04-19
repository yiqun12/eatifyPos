import { useUserContext } from "./context/userContext";
import SignUp from './pages/customer_signup';
import LogIn from './pages/customer_login';
import Navbar from './pages/Navbar'
//import Account from './components/Account';
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import Reservation from './pages/reservation'
import Checkout from './pages/Checkout'
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary component

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

        <div className="App">

          <BrowserRouter>
            <MyHookProvider>

              <Navbar />
              <Routes>

                <Route path="QRcode" element={
                    <Html /> }></Route>

                <Route path="Admin" element={
                  user != null &&
                    user.uid === process.env.REACT_APP_ADMIN_UID ?
                    <Admin_new /> :
                    <LogIn />} />

                <Route path="orders" element={<Receipt />} />

                {/* <Route path="orderhasreceived" element={<OrderHasReceived />} /> */}

                <Route path="Reservation" element={<Reservation />} />
                {user ? <Route path="/selfCheckout" element={<Checkout />}></Route> : <Route path="/selfCheckout" element={<LogIn />}></Route>}

                {user ? <Route path="/checkout" element={<Checkout />}></Route> : <Route path="/checkout" element={<LogIn />}></Route>}
                {user ? <Route path="/DemoFood" element={<DemoFood />}></Route> : <Route path="/DemoFood" element={<LogIn />}></Route>}

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

                <Route path="SignUp" element={<SignUp />}></Route>

                {/*testing from tony change Time menu */}
                {/* <Route exact path="/change_time" element={<ChangeTimeForm />} /> */}

                {/* sound button chinese for new order */}
                {/* <Route exact path="/sound_button" element={<div><SoundButtonNewOrderChinese /> <SoundButtonNewOrderEnglish /> </div>} /> */}


                {/* testing from tony */}
                {/* <Route exact path="/testing_admin" element={<Account_admin />} /> */}
                {/* <Route exact path="/testing_food" element={<Food_testing />} /> */}
                {/* <Route exact path="/terminal_page" element={<TerminalRegister storeDisplayName={"display"} storeID={"demo"} connected_stripe_account_id={"acct_1NhfrBD7rxr1kqtN"} />} /> */}
                {/* <Route exact path="/terminal_page2" element={<PaymentRegular storeID={"demo"} chargeAmount={"100"} connected_stripe_account_id={"acct_1NhfrBD7rxr1kqtN"} />} /> */}
                {/* <Route exact path="/businesshours_testpage" element={<BusinessHoursTestPage />} /> */}
                {/* <Route exact path="/test_notification_page" element={<Test_Notification_Page />} /> */}
                {/* <Route exact path="dnd" element={<Dnd_Test store={"demo"} acct={"acct_1NhfrBD7rxr1kqtN"} selectedTable={"A2"} key={dndTestKey} main_input={[{ "id": "9ee84ddc-c91f-47ec-981b-1c5680550837", "name": "Garlic A Choy", "subtotal": "15", "image": "https://img1.baidu.com/it/u=322774879,3838779892&fm=253&fmt=auto&app=138&f=JPEG?w=463&h=500", "quantity": 5, "attributeSelected": {}, "count": "3c50ff94-49e1-4563-ac99-990efc15b0e9", "itemTotalPrice": 75, "CHI": "蒜蓉A菜" }, { "id": "c315164b-5afb-4330-b24a-238caf766cc4", "name": "Beef And Broccoli", "subtotal": "18", "image": "https://img2.baidu.com/it/u=3582338435,3937177930&fm=253&fmt=auto&app=138&f=JPEG?w=747&h=500", "quantity": 1, "attributeSelected": {}, "count": "9e72ec1f-9941-45be-ac26-369792e69f78", "itemTotalPrice": 18, "CHI": "牛肉西兰花" }]} />} /> */}
                {/* <Route exact path="/businesshours_testpage" element={<BusinessHoursTestPage/>}/> */}
                {/* <Route exact path="/test_admin_new" element={<Admin_new />} /> */}
                {/* <Route exact path="/test_iframeDesk" element={<IframeDesk store={"demo"} />} /> */}

                <Route exact path="/PaymentKiosk" element={<PaymentKiosk receipt_JSON={JSON.stringify([{ "id": "9ee84ddc-c91f-47ec-981b-1c5680550837", "name": "Garlic A Choy", "subtotal": "15", "image": "https://img1.baidu.com/it/u=322774879,3838779892&fm=253&fmt=auto&app=138&f=JPEG?w=463&h=500", "quantity": 5, "attributeSelected": {}, "count": "3c50ff94-49e1-4563-ac99-990efc15b0e9", "itemTotalPrice": 75, "CHI": "蒜蓉A菜" }, { "id": "c315164b-5afb-4330-b24a-238caf766cc4", "name": "Beef And Broccoli", "subtotal": "18", "image": "https://img2.baidu.com/it/u=3582338435,3937177930&fm=253&fmt=auto&app=138&f=JPEG?w=747&h=500", "quantity": 1, "attributeSelected": {}, "count": "9e72ec1f-9941-45be-ac26-369792e69f78", "itemTotalPrice": 18, "CHI": "牛肉西兰花" }])}
                  storeID={"demo"} chargeAmount={1} connected_stripe_account_id={"acct_1OWU8KBUAXdEY4mJ"} service_fee={0} selectedTable={"测试"} />} />

                {user ? <Route path="ForgotPassword" element={<Account_admin />}></Route> : <Route path="ForgotPassword" element={<ForgotPassword />}></Route>}
                <Route exact path="/store" element={<Food />} />
                <Route exact path="/DemoFood" element={<DemoFood />} />
                <Route exact path="/AdminFood" element={<Admin_food />} />
                <Route exact path="/Refresh" element={<Refresh />} />
                <Route path="/career" element={<Career/>} />

                <Route path='*' exact={true} element={<Home />} />
                <Route exact path="/" element={<Home />} />
                <Route exact path="/Checklist" element={<Checklist />} />

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
