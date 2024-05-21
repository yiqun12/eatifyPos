import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from 'react';
import { useEffect } from 'react';
import { useMyHook } from './myHook';
import { useMemo } from 'react';

const Hero = ({ directoryType, isDineIn, setIsDineIn }) => {
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id, directoryType]);
  const params = new URLSearchParams(window.location.search);

  console.log("sbaijwos")
  console.log(directoryType)

  // for translations sake
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = useMemo(() => {
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const translationsMode = sessionStorage.getItem("translationsMode")

    return (text) => {
      if (trans != null && translationsMode != null) {
        if (trans[text] != null && trans[text][translationsMode] != null) {
          return trans[text][translationsMode];
        }
      }

      return text;
    };
  }, [sessionStorage.getItem("translations"), sessionStorage.getItem("translationsMode")]);

  return (
    <div style={{ display: 'flex' }} className='max-w-[1000px]'>
      <div className="notranslate switches-container" style={{ "marginBottom": "10px", "boxShadow": "0px 0px 4px rgba(0, 0, 0, 0.3)" }}

      >
        <input
          type="radio"
          id="switchTakeOut"
          name="switchPlan"
          value="TakeOut"
          checked={!isDineIn}  // Notice the negation here
          disabled={sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === "" || directoryType}
          translate="no"
        />
        <input
          type="radio"
          id="switchDineIn"
          name="switchPlan"
          value="DineIn"
          checked={isDineIn}
          disabled={sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === "" || directoryType}
          translate="no"
        />
        <label htmlFor="switchTakeOut" onClick={() => {
          if (sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === "") {
            alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
              "您需要扫描餐桌上的二维码来选取堂食" : "You need to scan the qr code from the table to switch to dine in mode");
          } else {
            if (!directoryType) {
              setIsDineIn(!isDineIn)
            } else {
              alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                "自助服务不能转换成外卖。"
                : "Self-service cannot be converted to takeout.");
            }
          }
        }
        }
          style={{ "fontSize": "14px" }}>{t("ToGo")}</label>
        <label htmlFor="switchDineIn" onClick={() => {

          if (sessionStorage.getItem('table') === null || sessionStorage.getItem('table') === "") {
            alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
              "您需要扫描餐桌上的二维码来选取堂食" : "You need to scan the qr code from the table to switch to dine in mode");
          } else {
            if (!directoryType) {
              setIsDineIn(!isDineIn)
            } else {
              alert(localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ?
                "自助服务不能转换成外卖。"
                : "Self-service cannot be converted to takeout.");
            }
          }
        }
        }
          style={{ "fontSize": "14px" }}>{t("DineIn")}</label>
        <div className="switch-wrapper">
          <div className="switch">
            <div style={{ "fontSize": "14px" }}>{t("ToGo")}</div>
            <div style={{ "fontSize": "14px" }}>{t("DineIn")}</div>
          </div>
        </div>
      </div>
    </ div>
  )
}

export default Hero