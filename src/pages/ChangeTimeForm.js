import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { businessHours } from '../data/businessHours';

import { useMemo } from 'react';




function TimeDropdown({ day, pairIndex, timeType, selectedTime, onTimeChange }) {
    const generateTimeOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hour = i < 10 ? `0${i}` : i;
                const minute = j === 0 ? '00' : j;
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    };

    return (
        <div className="time-row">
            <label>{timeType}: </label>
            <select
                value={selectedTime}
                onChange={(e) => onTimeChange(day, pairIndex, timeType, e.target.value)}
            >
                {generateTimeOptions().map(time => (
                    <option key={time} value={time}>
                        {time}
                    </option>
                ))}
            </select>
        </div>
    );
}

function DayTimeSelectors({ day, selectedTimePairs, onAddTime, onTimeChange, onDeleteTime, toggleClosed }) {
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
        <div className="day-row" style={{ display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            maxWidth: "500px",
            margin: "auto",
            padding: "5px" }}>
            <div style={{display: "flex", flexDirection: "column"}}>
            <h4 style={{textAlign:"center"}}>{day}</h4>
            <Button style={{margin:"5px"}} type="button" onClick={() => toggleClosed(day)}>
                {selectedTimePairs.closed ? t('Mark as Open') : t('Mark as Closed')}
            </Button>
            <Button style={{margin:"5px"}} onClick={() => onAddTime(day)}>{t("Add Time Range")}</Button>
            </div>
            
            <div style={{display: "flex", flexDirection: "column"}}>
            {!selectedTimePairs.closed && (
                <>
                    {selectedTimePairs.times.map((pair, index) => (
                        <div className="time-pair" style={{ display: "flex", justifyContent: "space-between", margin: "5px 0", alignItems: 'center' }} key={index}>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <TimeDropdown
                                    day={day}
                                    pairIndex={index}
                                    timeType="Open"
                                    selectedTime={pair.open}
                                    onTimeChange={onTimeChange}
                                />
                                <span> - </span>
                                <TimeDropdown
                                    day={day}
                                    pairIndex={index}
                                    timeType="Close"
                                    selectedTime={pair.close}
                                    onTimeChange={onTimeChange}
                                />
                            </div>
                            {index !== 0 && <Button style={{margin:"5px"}} onClick={() => onDeleteTime(day, index)}>{t("Delete")}</Button>}
                        </div>
                    ))}
                </>
            )}
            </div>
        </div>
    );
}

function ChangeTimeForm() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [formData, setFormData] = useState({
        Monday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Tuesday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Wednesday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Thursday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Friday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Saturday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
        Sunday: { times: [{ open: '00:00', close: '01:00' }], closed: false },
    });

    const handleAddTime = (day) => {
        setFormData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                times: prev[day].times.concat({ open: '00:00', close: '01:00' })
            }
        }));
    };

    const handleTimeChange = (day, pairIndex, timeType, time) => {
        const updatedPairs = [...formData[day].times];
        updatedPairs[pairIndex][timeType.toLowerCase()] = time;
        setFormData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                times: updatedPairs
            }
        }));
    };

    const handleDeleteTime = (day, indexToDelete) => {
        const updatedTimes = formData[day].times.filter((_, index) => index !== indexToDelete);
        setFormData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                times: updatedTimes
            }
        }));
    };

    const toggleClosed = (day) => {
        setFormData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                closed: !prev[day].closed
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = Object.entries(formData).reduce((acc, [day, data]) => {
            if (data.closed) {
                acc[day] = [{open: "xxxx", close: "xxxx"}];
            } else {
                acc[day] = data.times.map(timePair => ({
                    open: timePair.open.replace(":", ""),
                    close: timePair.close.replace(":", "")
                }));
            }
            return acc;
        }, {});
        console.log(JSON.stringify(finalData));
        // grabs the sessionstorage and updates the businesshours in the session
        var businessHours = JSON.parse(sessionStorage.getItem("businessHours"))

        const dayToIndexMapping = {
            "Sunday": 7,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
          };
          
          const updateBusinessHours = (finalData) => {
            Object.keys(finalData).forEach(day => {
              const index = dayToIndexMapping[day];
              if (businessHours.hasOwnProperty(index)) {
                businessHours[index].timeRanges = finalData[day].map(timePair => ({
                  openTime: timePair.open,
                  closeTime: timePair.close
                }));
              }
            });
            // Duplicate Sunday for index 0
            businessHours[0].timeRanges = [...businessHours[7].timeRanges];
          };
          
          updateBusinessHours(finalData);
          
        //   console.log("busienssHOurs: ", businessHours);
          sessionStorage.setItem("businessHours", JSON.stringify(businessHours))
        // console.log(bus)
    };

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
        <form onSubmit={handleSubmit}>
            {days.map(day => (
                <DayTimeSelectors
                    key={day}
                    day={day}
                    selectedTimePairs={formData[day]}
                    onAddTime={handleAddTime}
                    onTimeChange={handleTimeChange}
                    onDeleteTime={handleDeleteTime}
                    toggleClosed={toggleClosed}
                />
            ))}
            <Button style={{margin:"5px"}} variant="primary" type="submit">{t("Submit")}</Button>
        </form>
    );
}

export default ChangeTimeForm;