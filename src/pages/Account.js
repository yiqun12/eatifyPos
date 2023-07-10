//import Navbar from './Navbar'
import 'bootstrap/dist/css/bootstrap.css';
import React, { useState, useEffect } from 'react';
import './group_list.css';
import CardSection from "../components/CardSection_acc";
import Checkout from "../components/Checkout_acc";
//import Checkout from "../components/Checkout";
import PayFullhistory from "../components/PayFullhistory";
import { Elements } from '@stripe/react-stripe-js';
import { useUserContext } from "../context/userContext";
import { useMyHook } from './myHook';

const Account = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const { promise, logoutUser } = useUserContext();
  //console.log(promise)
  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
  }
  const user = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    setActiveTab(window.location.hash);
  }, []);
  function removeFromLocalStorage() {
    sessionStorage.removeItem('products');
    sessionStorage.removeItem('Food_arrays');
  }
  //google login button functions

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
    //console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
          if (trans[text][sessionStorage.getItem("translationsMode")] != null)
            return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    }
    // base case to just return the text if no modes/translations are found
    return text
  }

  /**check if its mobile/browser */
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  const isMobile = width <= 768;
  return (
    <>
      <Elements stripe={promise}>
        <div className='max-w-[1000px] mx-auto p-4'>
          <div className="container">
            <div className="row gutters-sm">
              <div className="col-md-4 d-none d-md-block">
                <div className="card">
                  <div className="card-body">
                    <nav className="nav flex-column nav-pills nav-gap-y-1">
                      <a
                        href="#profile"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#profile' || activeTab === '' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#profile')}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-user mr-2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx={12} cy={7} r={4} />
                        </svg>
                        {t("Profile")}
                      </a>

                      <a
                        style={{"cursor":"pointer"}}
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#billing' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={() => {
                          logoutUser();
                          removeFromLocalStorage();
                        }}
                      >
<svg
  xmlns="http://www.w3.org/2000/svg"
  width={24}
  height={24}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
  className="feather feather-log-out mr-2"
>
  <path d="M19 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v2" />
  <polyline points="9 10 15 10 12 14" />
</svg>

                        {t("Logout")}
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className={isMobile?"":"card"}>
                  <div className="card-body tab-content">
                    {activeTab === '#profile' || activeTab === '' ? (

                      <div className="tab-pane active" id="profile">

                        <h6 className="flex items-center">
                          <i className="material-icons">person</i>
                          {user ? user.displayName : ""}
                          <button  style={{ "margin-left": "auto" }}
                            onClick={() => {
                              logoutUser();
                              removeFromLocalStorage();
                            }}
                            type="button"
                            className={isMobile?"btn btn-primary":"hidden"}>
                            {t("sign out")}
                          </button>
                        </h6>
                        <form>
                          <div className="form-group">
                            <label htmlFor="bio">{(user) ? user.email : ""}</label>
                          </div>
                          <hr />
                          <h6>{t("Payment Method: ")}</h6>
                          <Checkout />
                          <h6>{t("Order History: ")}</h6>
                          <form>
                            <div className="form-group mb-0 " style={{
                              "height": "400px",
                              "overflow-y": " scroll"
                            }}>
                              <div className="border border-gray-500 bg-gray-200 p-3 text-center font-size-sm"
                              style={{
                                backgroundColor:"rgba(221, 228, 236, 0.301)"
                              }}>
                                <PayFullhistory />
                              </div>
                            </div>
                          </form>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Elements>
    </>
  )
}

export default Account