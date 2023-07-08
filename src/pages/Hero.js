import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { MyHookProvider, useMyHook } from './myHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import logo_fork from './cuiyuan.png'

const Hero = () => {
      /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
  
    const [isDinein, setIsDinein] = useState(true);
    sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
    //console.log(isDinein)
    const handleToggle = () => {
      setIsDinein(!isDinein);
      //console.log(isDinein)
      sessionStorage.setItem('isDinein', JSON.stringify(isDinein));
      saveId(Math.random())
    };
    const [plan, setPlan] = useState('TakeOut');
    const handleSwitchChange = (event) => {
      setPlan(event.target.value);
    };
    return (
<div style={{ display: 'flex', alignItems: 'center' }} className='max-w-[1000px] m-auto px-4 '>


<div className="switches-container" style={{"marginTop":"20px","marginBottom":"10px", "border":"1px solid black"}}>

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