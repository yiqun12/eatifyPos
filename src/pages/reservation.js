import React, { useEffect, useState } from 'react';
import './reservation.css';

const ReservationForm = () => {
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
        'padding':' 50px'
      }}
    action="reservation.php" method="post">
      <div className="elem-group">
        <label htmlFor="name">Your Name</label>
        <input
          type="text"
          id="name"
          name="visitor_name"
          placeholder="Enter your name"
          pattern="[A-Z\sa-z]{3,20}"
          required
        />
      </div>
      <div className="elem-group">
        <label htmlFor="email">Your E-mail</label>
        <input
          type="email"
          id="email"
          name="visitor_email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="elem-group">
        <label htmlFor="phone">Your Phone</label>
        <input
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
        <label htmlFor="adult">Adults</label>
        <input
          type="number"
          id="adult"
          name="total_adults"
          placeholder="2"
          min="1"
          required
        />
      </div>
      <div className="elem-group inlined">
        <label htmlFor="child">Children</label>
        <input
          type="number"
          id="child"
          name="total_children"
          placeholder="2"
          min="0"
          required
        />
      </div>
      <div className="elem-group inlined">
        <label htmlFor="checkin-date">Check-in Date</label>
        <input
          type="date"
          id="checkin-date"
          name="checkin"
          required
        />
      </div>
      <div className="elem-group inlined">
        <label htmlFor="checkout-date">Check-out Date</label>
        <input
          type="date"
          id="checkout-date"
          name="checkout"
          required
        />
      </div>
      <div className="elem-group">
        <label htmlFor="room-selection">Select Room Preference</label>
        <select
          id="room-selection"
          name="room_preference"
          required
        >
          <option value="">Choose a Room from the List</option>
          <option value="connecting">Room1</option>
          <option value="adjoining">Room2</option>
          <option value="adjacent">Room3</option>
        </select>
      </div>
      <hr />
      <div className="elem-group">
      <label htmlFor="message">Anything Else?</label>
        <textarea
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