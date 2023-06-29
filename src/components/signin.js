import React, { useRef, useEffect } from "react";
import { useUserContext } from "../context/userContext";
import { useMyHook } from '../pages/myHook';

const Signin = () => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);

  const emailRef = useRef();
  const psdRef = useRef();
  const { signInUser, forgotPassword } = useUserContext();

  const onSubmit = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = psdRef.current.value;
    if (email && password) signInUser(email, password);
  };

  const forgotPasswordHandler = () => {
    const email = emailRef.current.value;
    if (email)
      forgotPassword(email).then(() => {
        emailRef.current.value = "";
      });
  };

  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    console.log(trans)
    console.log(sessionStorage.getItem("translationsMode"))

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
    <div className="form">
      <h2> {t("Login")} </h2>
      <form onSubmit={onSubmit}>
        <input placeholder={t("Email")} type="email" ref={emailRef} />
        <input placeholder={t("Password")} type="password" ref={psdRef} />
        <button type="submit">{t("Sign In")}</button>
        <p onClick={forgotPasswordHandler}>{t("Forgot Password")}?</p>
      </form>
    </div>
  );
};

export default Signin;
