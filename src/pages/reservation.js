import React, { useEffect, useState } from 'react';
import './reservation.css';

const ReservationForm = () => {
    const [width, setWidth] = useState(window.innerWidth);
    const input_style = {
      'border-radius': '5px',
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
          console.log(dateTomorrow)

      }, []);
      console.log(isMobile )
      
  return (
    <div className="container">
 <div style= {!isMobile?{ width: "600px", margin: "0 auto" }:{}}>
     <div className={!isMobile?"card2 mt-50 mb-50":""}>
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
        htmlFor="name">Your Name</label>
        <input
        style={input_style}
          type="text"
          id="name"
          name="visitor_name"
          placeholder="Enter your name"
          pattern="[A-Z\sa-z]{3,20}"
          required
        />
      </div>
      <div className="elem-group">
        <label style={label_style} htmlFor="email">Your E-mail</label>
        <input
        style={input_style}
          type="email"
          id="email"
          name="visitor_email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="elem-group">
        <label style={label_style} htmlFor="phone">Your Phone</label>
        <input
        style={input_style}
          type="tel"
          id="phone"
          name="visitor_phone"
          placeholder="Enter your phone"
          pattern="(\d{3})-?\s?(\d{3})-?\s?(\d{4})"
          required
        />
      </div>
      <hr />
      <div className="elem-group inlined">
        <label style={label_style} htmlFor="adult">Adults</label>
        <input
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
        <label style={label_style} htmlFor="child">Children</label>
        <input
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
        <label style={label_style} htmlFor="checkin-date">Check-in Date</label>
        <input
        style={input_style}
          type="date"
          id="checkin-date"
          name="checkin"
          required
        />
      </div>
      <div className="elem-group">
        <label style={label_style} htmlFor="room-selection">Select Room Preference</label>
        <select
        style={input_style}
          id="room-selection"
          name="room_preference"
          required
        >
          <option value="">Choose a Room</option>
          <option value="connecting">Room1</option>
          <option value="adjoining">Room2</option>
          <option value="adjacent">Room3</option>
        </select>
      </div>
      <div className="elem-group">
      <label style={label_style} htmlFor="message">Anything Else?</label>
        <textarea
          style={{ ...input_style,'height': '250px'}}
          id="message"
          name="visitor_message"
          placeholder="Tell us anything else that might be important."
          required
        />
      </div>
      <button
                  style={{ width: "100%", textAlign: "center" }}
                class="w-80 mx-auto border-0 rounded-full text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 flex justify-center"
                >
                 Book The Rooms 
              </button>
    </form>

    </div>
     </div>
     </div>

    </div>
  );
};

export default ReservationForm;