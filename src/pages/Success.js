import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMyHook } from './myHook';

const Success = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const [session, setSession] = useState({});
  const location = useLocation();
  const sessionId = location.search.replace('?session_id=', '');

  useEffect(() => {
    async function fetchSession() {
      setSession(
        await fetch('http://localhost:4242/checkout-session?sessionId=' + sessionId).then((res) =>
          res.json()
        )
      );
    }
    fetchSession();
  }, [sessionId]);

    // for translations sake
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
      // const trans = sessionStorage.getItem("translations")
     // console.log(trans)
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
    <div className="sr-root">
      <div className="sr-main">
        <header className="sr-header">
          <div className="sr-header__logo"></div>
        </header>
        <div className="sr-payment-summary completed-view">
          <h4>{t("Here is your receipt:")}</h4>
        </div>
        <div className="sr-section completed-view">
          <div className="sr-callout">
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
          <Link to="/">{t("Restart demo")}</Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
