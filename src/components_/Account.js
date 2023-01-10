import Navbar from './Navbar'
import signin_pic from './sigin.jpg';
import 'bootstrap/dist/css/bootstrap.css'; 
import {Row, Col, Container, Button} from "react-bootstrap"
import Card from 'react-bootstrap/Card';
import React, { useState } from 'react';
import './group_list.css';
import { useLocation } from 'react-router-dom';

var url = "http://localhost:8080";
const Account = () => {
  
  /// for tap button:
  const [activeTab, setActiveTab] = useState('');

  const handleTabClick = (e, tabHref) => {
    e.preventDefault();
    setActiveTab(tabHref);
    window.location.href=tabHref
  }

  const location = useLocation();
  
  /* Yiqun do not touch code from HERE */
  // authenticate user first
  const authURL = url + "/auth";
  // function to allow user in if signed in
  async function getAuth() {
    let res = await fetch(authURL, {method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    //make sure to serialize your JSON body
    body: JSON.stringify({
      cookies: sessionStorage.getItem('token'),
    })
  });
    let auth = await res.json();
    if (auth.data == false) {
      window.location.href = "/";
    }
  }
  getAuth();
  /*to HERE, got it!!!*/


 //google login button functions
 const [loginData, setLoginData] = useState(
    localStorage.getItem('loginData')
    ?JSON.parse(localStorage.getItem('loginData'))
    :null
   );
   
  return (
    <>
      <Navbar />
      <>
  <meta charSet="utf-8" />
  {/*  This file has been downloaded from bootdey.com @bootdey on twitter */}
  {/*  All snippets are MIT license http://bootdey.com/license */}
  <title>Profile settings - Bootdey.com</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  
  <div className="container">
<hr></hr>
    {/* /Breadcrumb */}
    <div className="row gutters-sm">
      <div className="col-md-4 d-none d-md-block">
        <div className="card">
          <div className="card-body">
            <nav className="nav flex-column nav-pills nav-gap-y-1">
              
              <a
        href="#profile"
        data-toggle="tab"
        className={`nav-item nav-link has-icon ${activeTab === '#profile' ? 'nav-link-faded active' : 'nav-link-faded'}`}
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
                Profile Information
              </a>
              <a
        href="#account"
        data-toggle="tab"
        className={`nav-item nav-link has-icon ${activeTab === '#account' ? 'nav-link-faded active' : 'nav-link-faded'}`}
        onClick={(e) => handleTabClick(e, '#account')}
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
                  className="feather feather-settings mr-2"
                >
                  <circle cx={12} cy={12} r={3} />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Account Settings
              </a>
              <a
        href="#security"
        data-toggle="tab"
        className={`nav-item nav-link has-icon ${activeTab === '#security' ? 'nav-link-faded active' : 'nav-link-faded'}`}
        onClick={(e) => handleTabClick(e, '#security')}
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
                  className="feather feather-shield mr-2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Security
              </a>
              <a
        href="#notification"
        data-toggle="tab"
        className={`nav-item nav-link has-icon ${activeTab === '#notification' ? 'nav-link-faded active' : 'nav-link-faded'}`}
        onClick={(e) => handleTabClick(e, '#notification')}
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
                  className="feather feather-bell mr-2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notification
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
                Billing
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
        className={`nav-link has-icon ${activeTab === '#profile' ? 'active' : ''}`}
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
        href="#account"
        data-toggle="tab"
        className={`nav-link has-icon ${activeTab === '#account' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, '#account')}
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
                    className="feather feather-settings"
                  >
                    <circle cx={12} cy={12} r={3} />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </a>
              </li>
              <li className="nav-item">
      <a
        href="#security"
        data-toggle="tab"
        className={`nav-link has-icon ${activeTab === '#security' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, '#security')}
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
                    className="feather feather-shield"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </a>
              </li>
              <li className="nav-item">
              <a
        href="#notification"
        data-toggle="tab"
        className={`nav-link has-icon ${activeTab === '#notification' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, '#notification')}
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
                    className="feather feather-bell"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
            </ul>
          </div>
          <div className="card-body tab-content">


          {location.hash === '#profile' ? (

            <div className="tab-pane active" id="profile">
              <h6>YOUR PROFILE INFORMATION</h6>
              <hr />
              <form>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    aria-describedby="fullNameHelp"
                    placeholder="Enter your fullname"
                    defaultValue={loginData.name}
                  />
                  <small id="fullNameHelp" className="form-text text-muted">
                   Your name should match the name associated with the your Gmail account.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Your Email</label>
                  <textarea
                    className="form-control autosize"
                    id="bio"
                    placeholder="Write something about you"
                    style={{
                      overflow: "hidden",
                      overflowWrap: "break-word",
                      resize: "none",
                      height: 62
                    }}
                    defaultValue={
                      loginData.email
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="url">URL</label>
                  <input
                    type="text"
                    className="form-control"
                    id="url"
                    placeholder="Enter your website address"
                    defaultValue="http://benije.ke/pozzivkij"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    placeholder="Enter your location"
                    defaultValue="Bay Area, San Francisco, CA"
                  />
                </div>
                <div className="form-group small text-muted">
                  All of the fields on this page are optional and can be deleted
                  at any time, and by filling them out, you're giving us consent
                  to share this data wherever your user profile appears.
                </div>
                <button type="button" className="btn btn-primary">
                  Update Profile
                </button>
                <button type="reset" className="btn btn-light">
                  Reset Changes
                </button>
              </form>
            </div>
      ) : null}

          {location.hash === '#account' ? (
            <div className="tab-pane active" id="account">
            <h6>ACCOUNT SETTINGS</h6>
            <hr />
            <form>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  aria-describedby="usernameHelp"
                  placeholder="Enter your username"
                  defaultValue="kennethvaldez"
                />
                <small id="usernameHelp" className="form-text text-muted">
                  After changing your username, your old username becomes
                  available for anyone else to claim.
                </small>
              </div>
              <hr />
              <div className="form-group">
                <label className="d-block text-danger">Delete Account</label>
                <p className="text-muted font-size-sm">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </div>
              <button className="btn btn-danger" type="button">
                Delete Account
              </button>
            </form>
          </div>
      ) : null}


          {location.hash === '#security' ? (
            <div className="tab-pane active" id="security">
            <h6>SECURITY SETTINGS</h6>
            <hr />
            <form>
              <div className="form-group">
                <label className="d-block">Change Password</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your old password"
                />
                <input
                  type="text"
                  className="form-control mt-1"
                  placeholder="New password"
                />
                <input
                  type="text"
                  className="form-control mt-1"
                  placeholder="Confirm new password"
                />
              </div>
            </form>
            <hr />
            <form>
              <div className="form-group">
                <label className="d-block">Two Factor Authentication</label>
                <button className="btn btn-info" type="button">
                  Enable two-factor authentication
                </button>
                <p className="small text-muted mt-2">
                  Two-factor authentication adds an additional layer of
                  security to your account by requiring more than just a
                  password to log in.
                </p>
              </div>
            </form>
            <hr />
            <form>
              <div className="form-group mb-0">
                <label className="d-block">Sessions</label>
                <p className="font-size-sm text-secondary">
                  This is a list of devices that have logged into your
                  account. Revoke any sessions that you do not recognize.
                </p>
                <ul className="list-group list-group-sm">
                  <li className="list-group-item has-icon">
                    <div>
                      <h6 className="mb-0">
                        San Francisco City 190.24.335.55
                      </h6>
                      <small className="text-muted">
                        Your current session seen in United States
                      </small>
                    </div>
                    <button
                      className="btn btn-light btn-sm ml-auto"
                      type="button"
                    >
                      More info
                    </button>
                  </li>
                </ul>
              </div>
            </form>
          </div>
      ) : null}


          {location.hash === '#notification' ? (

            <div className="tab-pane active" id="notification">
              <h6>NOTIFICATION SETTINGS</h6>
              <hr />
              <form>
                <div className="form-group">
                  <label className="d-block mb-0">Security Alerts</label>
                  <div className="small text-muted mb-3">
                    Receive security alert notifications via email
                  </div>
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customCheck1"
                      defaultChecked=""
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheck1"
                    >
                      Email each time a vulnerability is found
                    </label>
                  </div>
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customCheck2"
                      defaultChecked=""
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheck2"
                    >
                      Email a digest summary of vulnerability
                    </label>
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="d-block">SMS Notifications</label>
                  <ul className="list-group list-group-sm">
                    <li className="list-group-item has-icon">
                      Comments
                      <div className="custom-control custom-control-nolabel custom-switch ml-auto">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch1"
                          defaultChecked=""
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch1"
                        />
                      </div>
                    </li>
                    <li className="list-group-item has-icon">
                      Updates From People
                      <div className="custom-control custom-control-nolabel custom-switch ml-auto">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch2"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch2"
                        />
                      </div>
                    </li>
                    <li className="list-group-item has-icon">
                      Reminders
                      <div className="custom-control custom-control-nolabel custom-switch ml-auto">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch3"
                          defaultChecked=""
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch3"
                        />
                      </div>
                    </li>
                    <li className="list-group-item has-icon">
                      Events
                      <div className="custom-control custom-control-nolabel custom-switch ml-auto">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch4"
                          defaultChecked=""
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch4"
                        />
                      </div>
                    </li>
                    <li className="list-group-item has-icon">
                      Pages You Follow
                      <div className="custom-control custom-control-nolabel custom-switch ml-auto">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch5"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="customSwitch5"
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              </form>
            </div>
      ) : null}



          {location.hash === '#billing' ? (

            <div className="tab-pane-active" id="billing">
              <h6>BILLING SETTINGS</h6>
              <hr />
              <form>
                <div className="form-group">
                  <label className="d-block mb-0">Payment Method</label>
                  <div className="small text-muted mb-3">
                    You have not added a payment method
                  </div>
                  <button className="btn btn-info" type="button">
                    Add Payment Method
                  </button>
                </div>
                <div className="form-group mb-0">
                  <label className="d-block">Payment History</label>
                  <div className="border border-gray-500 bg-gray-200 p-3 text-center font-size-sm">
                    You have not made any payment.
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
</>

    </>
  )
}

export default Account