import React, { useEffect, useState, Fragment } from 'react';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useMemo } from 'react';

import "./BusinessHoursTable.css";
import { json } from 'react-router-dom';


function parseTime(timeStr) {
  if (timeStr == "xxxx") {
    return { closed: true }
  }

  // console.log("timeString")
  const [hourStr, minuteStr] = timeStr.match(/\d{2}/g);
  // console.log(hourStr + " " + minuteStr)
  return {
    hours: parseInt(hourStr),
    minutes: parseInt(minuteStr),
    closed: false
  };
}

// grabs a timeStr and convert to 12 hr format such as "10:30AM"
function convertTo12HourFormat(timeStr) {

  // console.log("timeStr in 12 hr: " + JSON.stringify(timeStr))
  const timeObj = parseTime(timeStr)
  if (timeObj.closed) {
    return 'Closed';
  }

  let hours = timeObj.hours;
  let minutes = timeObj.minutes;

  // Determine if it's AM or PM
  let period = 'AM';
  if (hours >= 12 && hours != 24) {
    period = 'PM';

    // Convert from 24 hour time to 12 hour time
    if (hours > 12) {
      hours = hours - 12;
    }
  } else if (hours === 0) {
    // Adjust for 00:xx time
    hours = 12;
  } else if (hours == 24) {
    hours = 0;
  }

  // Return the formatted time string
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
}


function BusinessHoursTable() {


  const storeOpenTime = (sessionStorage.getItem('TitleLogoNameContent') !== null ? JSON.parse(JSON.parse(sessionStorage.getItem('TitleLogoNameContent')).Open_time) : { "0": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "1": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "2": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "3": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "4": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "5": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "6": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "7": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" } });

  const businessHours = (getBusinessHours((sessionStorage.getItem('TitleLogoNameContent') !== null ? JSON.parse(JSON.parse(sessionStorage.getItem('TitleLogoNameContent')).Open_time) : { "0": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "1": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "2": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "3": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "4": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "5": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "6": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" }, "7": { "timeRanges": [{ "openTime": "0000", "closeTime": "2359" }], "timezone": "ET" } }), convertTo12HourFormat));
  const [timezone, setTimezone] = useState("PDT");

  //const businessHoursData = storeOpenTime;
  function getBusinessHours(storeOpenTime, convertTo12HourFormat) {
    const dayOfWeek = {
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
      7: "Sunday",
    };

    const newBusinessHours = {};

    for (let day in storeOpenTime) {
      // Skip day = 0 (sunday duplicate) if removed will print out undefined duplicate sunday
      if (day == 0) {
        continue;
      }
      const timeRanges = storeOpenTime[day].timeRanges;

      var businessHoursRangesDaily = [];
      for (const range of timeRanges) {
        const openTime = convertTo12HourFormat(range.openTime);
        const closeTime = convertTo12HourFormat(range.closeTime);

        if (openTime == "Closed") {
          businessHoursRangesDaily.push(`${openTime}`);
        } else {
          businessHoursRangesDaily.push(`${openTime} - ${closeTime}`);
        }
      }
      newBusinessHours[dayOfWeek[day]] = businessHoursRangesDaily;
    }

    return newBusinessHours;
  }


  useEffect(() => {
    setTimezone((storeOpenTime[1])["timezone"])
  }, []);

  // modal for the business hours
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const offset = JSON.parse(sessionStorage.getItem("timezoneOffsets"));
  const offsetHours = parseInt(offset["hours"]);
  const offsetMinutes = parseInt(offset["minutes"]);

  function getCurrentDayIndex() {
    // adjusted for offset
    const now = new Date();
    now.setHours(now.getHours() - offsetHours);
    now.setMinutes(now.getMinutes() - offsetMinutes);
    // console.log(now.toUTCString())

    const currentDay = new Date().getDay();
    // console.log(currentDay)
    return currentDay === 0 ? 7 : currentDay; // Sunday should be 7, not 0
  }

  function getCurrentTime() {
    // adjusted for offset
    const now = new Date();
    now.setHours(now.getHours() - offsetHours);
    now.setMinutes(now.getMinutes() - offsetMinutes);

    // console.log(`${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}`)

    return `${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}`;
  }

  function getNextCloseTimeRange() {
    const currentDayIndex = getCurrentDayIndex();
    const currentTime = getCurrentTime();
    const ranges = storeOpenTime[currentDayIndex].timeRanges;

    for (const range of ranges) {
      if (range.openTime <= currentTime && currentTime <= range.closeTime) {
        // console.log({day: currentDayIndex, closeTime: range.closeTime})
        return {
          day: currentDayIndex,
          time: range.closeTime
        };
      }
      else if (range.openTime <= currentTime && range.openTime >= range.closeTime && currentTime >= range.openTime) {
        // console.log({day: currentDayIndex, closeTime: range.closeTime})
        return {
          day: currentDayIndex,
          time: range.closeTime
        };
      }
    }

    return null; // Return null if we're not currently within an open time range
  }

  function getNextOpenTimeRange() {
    let currentDayIndex = getCurrentDayIndex();
    let currentTime = getCurrentTime();

    for (let i = 0; i < 7; i++) {
      const ranges = storeOpenTime[currentDayIndex].timeRanges;

      for (const range of ranges) {
        if (range.openTime !== "xxxx" && range.openTime >= currentTime) {
          console.log("next open time: ", currentDayIndex, " ", range.openTime)
          return {
            day: currentDayIndex,
            time: range.openTime
          };
        }
      }

      // Moving to the next day, so we reset the current time to the start of the day
      currentTime = "0000";
      currentDayIndex += 1;
      currentDayIndex = currentDayIndex % 7;
    }

    return null;
  }

  function grabDayTime(dayTimeObject) {
    const dayNames = ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"];

    if (dayTimeObject == null) {
      return "The store is temporarily closed";
    }

    const dayName = dayNames[dayTimeObject["day"]];
    // return `${dayName} ${convertTo12HourFormat(dayTimeObject["time"])}`;
    return `${isOpen ? "Open until" : "Close until"} ${dayName} ${convertTo12HourFormat(dayTimeObject["time"])}`;

  }

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
  function getCurrentDayTimeRanges() {
    const currentDayIndex = getCurrentDayIndex();
    const ranges = storeOpenTime[currentDayIndex].timeRanges;
    return ranges.map((range, index) => {
      if (range.openTime === "xxxx") {
        return t("Closed");
      }
      return (
        <Fragment key={index}>
          {convertTo12HourFormat(range.openTime)} - {convertTo12HourFormat(range.closeTime)}
          {index !== ranges.length - 1 && <br />}  {/* Insert a line break unless it's the last item */}
        </Fragment>
      );
    });
  }

  var isOpen = false;
  if (getNextCloseTimeRange() === null) {
    isOpen = false;
  } else {
    isOpen = true;
  }

  return (
    <div>
      {/* <BusinessHoursTable></BusinessHoursTable> */}
      {/* the modal that when the button is pressed shows */}
      {/* {storeStatus ?     <Button variant="primary" onClick={handleShow}>
      Open
      </Button> :     <Button variant="primary" onClick={handleShow}>
      Closed
      </Button> } */}

      <h1 onClick={handleShow} className="responsive-text px-4 font-bold" style={{ cursor: "pointer", color: 'orange' }}>
        {isOpen ? grabDayTime(getNextCloseTimeRange()) : grabDayTime(getNextOpenTimeRange())}
      </h1>
      {/* <Button variant="primary" onClick={handleShow}>
      Business Hours
      </Button> */}

      <Modal className="my-custom-modal" show={show} onHide={handleClose} size="large" centered style={{ width: "100%" }}>
        <Modal.Header>
          <Modal.Title>{t("Business Hours")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* everything here to the Modal.Body end is the table */}
          <Table striped bordered hover style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>{t("Day")}</th>
                <th><span>{`${t("Hours")} (` + timezone + `)`}</span> </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(businessHours).map(([day, hourArray]) => (
                <tr key={day}>
                  <td>{t(day)}</td>
                  <td>
                    {hourArray.map((hour, index) => (
                      <span key={index}>
                        {hour === "Closed" ? t("Closed") : hour}
                        {/* Add a line break unless it's the last item */}
                        {index !== hourArray.length - 1 && <br />}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
              {/* {Object.entries(businessHours).map(([day, hours]) => (
          <tr key={day}>
            <td>{day}</td>
            <td>{hours}</td>
          </tr>
        ))} */}
            </tbody>
          </Table>
          {/* the code for the table ends here */}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t("Close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BusinessHoursTable;