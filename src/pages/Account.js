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

  return (
    <>
      <Elements stripe={promise}>
        <div className='max-w-[1000px] mx-auto p-4'>
          <meta charSet="utf-8" />
          
          <title>Profile settings - Bootdey.com</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />

          <div className="container">
            {/* /Breadcrumb */}
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
                        href="#billing"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#billing' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#billing')}
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
                          className="feather feather-credit-card mr-2"
                        >
                          <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
                          <line x1={1} y1={10} x2={23} y2={10} />
                        </svg>
                        {t("Billing")}
                      </a>
                      <a
                        href="#History"
                        data-toggle="tab"
                        className={`nav-item nav-link has-icon ${activeTab === '#History' ? 'nav-link-faded active' : 'nav-link-faded'}`}
                        onClick={(e) => handleTabClick(e, '#History')}
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
  className="feather feather-clock mr-2"
>
  <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
  <path d="M12 6v6l4 2" />
</svg>
                        {t("History")}
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header border-bottom mb-3 d-flex d-md-none">
                    <ul
                      className="nav nav-tabs card-header-tabs nav-gap-x-1"
                      role="tablist"
                    >
                      <li className="nav-item">
                        <a
                          href="#profile"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#profile' || activeTab === '' ? 'active' : ''}`}
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
                            className="feather feather-user"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx={12} cy={7} r={4} />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#billing"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#billing' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#billing')}
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
                            className="feather feather-credit-card"
                          >
                            <rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
                            <line x1={1} y1={10} x2={23} y2={10} />
                          </svg>
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="#History"
                          data-toggle="tab"
                          className={`nav-link has-icon ${activeTab === '#History' ? 'active' : ''}`}
                          onClick={(e) => handleTabClick(e, '#History')}
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
  className="feather feather-clock mr-2"
>
  <path d="M18.364 5.636c-3.905-3.905-10.237-3.905-14.142 0s-3.905 10.237 0 14.142 10.237 3.905 14.142 0 3.905-10.237 0-14.142z" />
  <path d="M12 6v6l4 2" />
</svg>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="card-body tab-content">


                    {activeTab === '#profile' || activeTab === '' ? (

                      <div className="tab-pane active" id="profile">
                        <h6>{t("YOUR PROFILE INFORMATION")}
                        </h6>
                        <hr />
                        <form>
                          <div className="form-group">
                            <label style={{
                              "font-size": "200%",
                              "font-weight": "bold"
                            }}>{(user) ? user.displayName : ""}</label>

                          </div>
                          <div className="form-group">
                            <label htmlFor="bio">{(user) ? user.email : ""}</label>

                          </div>
                          <div className="form-group small text-muted">
                            {t("We do not share user data with third parties for their marketing or advertising unless you give us or the third party permission to do so")}.

                          </div>
                          <button
                            onClick={() => {
                              logoutUser();
                              removeFromLocalStorage();
                            }}
                            type="button"
                            className="btn btn-primary">
                            {t("sign out")}
                          </button>
                          <hr></hr>
                        </form>
                      </div>
                    ) : null}

                    {activeTab === '#billing' ? (

                      <div className="tab-pane-active" id="billing">
                        <h6>{t("BILLING SETTINGS")}</h6>
                        <hr />
                        <form>
                          <div className="form-group">
                            
                            <label className="d-block mb-0">{t("Payment Method")}</label>
                            <Checkout/>
                            <CardSection />
                          </div>
                        </form>
                      </div>

                    ) : null}
                    {activeTab === '#History' ? (

                      <div className="tab-pane-active" id="History">
                        <h6>{t("BILLING SETTINGS")}</h6>
                        <hr />
                        <form>
                          <label className="d-block">{t("Payment History")} ({t("click triangle for details")})</label>
                          <div className="form-group mb-0" style={{
                            "height": "400px",
                            "overflow-y": " scroll"
                          }}>

                            <div className="border border-gray-500 bg-gray-200 p-3 text-center font-size-sm">
                              <PayFullhistory />
                            </div>
                          </div>
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