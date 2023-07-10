import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from 'react';
import { useEffect } from 'react';
import { useMyHook } from './myHook';

const Hero = () => {
      /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  const initialDineInState = sessionStorage.getItem('isDinein') 
  ? JSON.parse(sessionStorage.getItem('isDinein')) 
  : true;

    const [isDinein, setIsDinein] = useState(initialDineInState);
    sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
    
    const handleToggle = () => {
      setIsDinein(!isDinein);
      sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
      saveId(Math.random())
    };

    const [plan, setPlan] = useState(isDinein?'DineIn':'TakeOut');
    const handleSwitchChange = (event) => {
      setPlan(event.target.value);
      handleToggle()
    };
    return (
<div style={{ display: 'flex'}} className='max-w-[1000px] ml-auto'>
<div className="switches-container" style={{"marginBottom":"10px", "boxShadow":"0px 0px 10px rgba(0, 0, 0, 0.3)"}}>
            <input
                type="radio"
                id="switchTakeOut"
                name="switchPlan"
                value="TakeOut"
                checked={plan === 'TakeOut'}
                onChange={handleSwitchChange}
            />
            <input
                type="radio"
                id="switchDineIn"
                name="switchPlan"
                value="DineIn"
                checked={plan === 'DineIn'}
                onChange={handleSwitchChange}
            />
            <label htmlFor="switchTakeOut" style={{"fontSize":"14px"}}>TakeOut</label>
            <label htmlFor="switchDineIn" style={{"fontSize":"143x"}}>DineIn</label>
            <div className="switch-wrapper">
                <div className="switch">
                    <div style={{"fontSize":"14px"}}>TakeOut</div>
                    <div style={{"fontSize":"14px"}}>DineIn</div>
                </div>
            </div>
        </div>
</ div>
    )
}

export default Hero