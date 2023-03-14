import React, { useState, useEffect } from "react";
import { useUserContext } from "../context/userContext";
import Signin from "./signin";
import Signup from "./signup";
import { useMyHook } from '../pages/myHook';

const Auth = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const [index, setIndex] = useState(false);
  const toggleIndex = () => {
    setIndex((prevState) => !prevState);
  };

  const { signInWithGoogle, } = useUserContext();

  // for translate
  const trans = JSON.parse(localStorage.getItem("translations"))
  const t = (text) => {
    // const trans = localStorage.getItem("translations")
    console.log(trans)
    console.log(localStorage.getItem("translationsMode"))

    if (trans != null) {
      if (localStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
            if (trans[text][localStorage.getItem("translationsMode")] != null)
              return trans[text][localStorage.getItem("translationsMode")]
        }
      }
    } 
    // base case to just return the text if no modes/translations are found
    return text
  }

  return (
    <div className="container">
      {!index ? <Signin /> : <Signup />}
      <button onClick={signInWithGoogle}> {t("Continue with Google")} </button>
      <p onClick={toggleIndex}>
        {!index ? t("New user") +"? " + t("Click here") : t("Already have an acount") + "?"}
      </p>
    </div>
  );
};

export default Auth;
