import React, { useEffect, useState } from 'react';
import './reservation.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useMyHook } from './myHook';

const ReservationForm = () => {
    /**listen to localtsorage */
    const { id, saveId } = useMyHook(null);
    useEffect(() => {
      //console.log('Component B - ID changed:', id);
    }, [id]);

    const [width, setWidth] = useState(window.innerWidth);
    const input_style = {
      'border-radius': '7px',
      'border': '2px solid #777',
      'box-sizing': 'border-box',
      'font-size': '1.25em',
      'font-family': 'Nanum Gothic',
      'width': '100%',
      'padding': '10px'
    }
    const label_style = {
        "display": "block",
        "font-family": 'Nanum Gothic',
        "padding-bottom": "10px",
        "font-size": "1.25em"
    }
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

    useEffect(() => {
        const currentDateTime = new Date();
        const year = currentDateTime.getFullYear();
        const month = currentDateTime.getMonth() + 1;
        const date = currentDateTime.getDate() + 1;
    
        const formattedDate =
          date < 10 ? '0' + date : date;
        const formattedMonth =
          month < 10 ? '0' + month : month;
    
          const dateTomorrow = `${year}-${formattedMonth}-${formattedDate}`;
          //console.log(dateTomorrow)

      }, []);
      //console.log(isMobile )

    // for translations sake
    const trans = JSON.parse(sessionStorage.getItem("translations"))
    const t = (text) => {
      // const trans = sessionStorage.getItem("translations")
     // console.log(trans)
     // console.log(sessionStorage.getItem("translationsMode"))
  
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

    <div className="container">
 <div style= {!isMobile?{ width: "600px", margin: "0 auto" }:{}}>
     <div style={{'opacity': '0.9'}} className={!isMobile?"card2 mt-50 mb-50":""}>
       <div className={!isMobile?"main":""}>     
    <form 
    style={{
        'max-width': '500px',
        'margin': '0 auto',
        'padding': '0 24px'
      }}
    action="reservation.php" method="post">
      <div className="elem-group">
        <label
        style={label_style}
        htmlFor="name">{t("Your Name")}</label>
        <input
         translate="no" 
        style={input_style}
          type="text"
          id="name"
          name="visitor_name"
          placeholder={t("Enter your name")}
          pattern="[A-Z\sa-z]{3,20}"
          required
        />
      </div>
      <div className="elem-group">
        <label style={label_style} htmlFor="email">{t("Your E-mail")}</label>
        <input
         translate="no" 
        style={input_style}
          type="email"
          id="email"
          name="visitor_email"
          placeholder={t("Enter your email")}
          required
        />
      </div>
      <div className="elem-group">
        <label style={label_style} htmlFor="phone">{t("Your Phone")}</label>
        <input
         translate="no" 
        style={input_style}
          type="tel"
          id="phone"
          name="visitor_phone"
          placeholder={t("Enter your phone")}
          pattern="(\d{3})-?\s?(\d{3})-?\s?(\d{4})"
          required
        />
      </div>
      <div className="elem-group inlined">
        <label style={label_style} htmlFor="adult">{t("Adults")}</label>
        <input
         translate="no" 
        style={input_style}
          type="number"
          id="adult"
          name="total_adults"
          placeholder="2"
          min="1"
          required
        />
      </div>
      <div className="elem-group inlined">
        <label style={label_style} htmlFor="child">{t("Children")}</label>
        <input
         translate="no" 
        style={input_style}
          type="number"
          id="child"
          name="total_children"
          placeholder="2"
          min="0"
          required
        />
      </div>
      <div style = {{width:"100%"}}className="elem-group inlined">
        <label style={label_style} htmlFor="checkin-date">{t("Check-in Date")}</label>
        <input
         translate="no" 
        style={input_style}
          placeholder = "mm/dd/yyyy"
          type="date"
          id="checkin-date"
          name="checkin"
          required
        />
      </div>
      <div className="elem-group select-dropdown">
        <label style={label_style} htmlFor="room-selection">{t("Select Room Preference")}</label>
        <select
        style={input_style}
          id="room-selection"
          name="room_preference"
          required
        >
          <option value="">{t("Choose a Room")}</option>
          <option value="connecting">{t("Room")}1</option>
          <option value="adjoining">{t("Room")}2</option>
          <option value="adjacent">{t("Room")}3</option>
        </select>
      </div>
      <div className="elem-group">
      <label style={label_style} htmlFor="message">{t("Anything Else")}?</label>
        <textarea
          style={{ ...input_style,'height': '250px'}}
          id="message"
          name="visitor_message"
          placeholder={t("Tell us anything else that might be important") + '.'}
          required
        />
      </div>
      <button
                  style={{ width: "100%", textAlign: "center" }}
                class="w-80 mx-auto border-0 rounded-full text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 flex justify-center"
                >
                 {t("Book The Rooms")} 
              </button>
    </form>

    </div>
     </div>
     </div>

    </div>
  );
};

export default ReservationForm;