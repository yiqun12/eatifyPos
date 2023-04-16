import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from 'react-bootstrap/Button';
import { BsPlusCircle } from 'react-icons/bs';
import './Food.css';
import chicken from './chicken.png';
import salad from './salad.png';
import burger from './burger.png';
import pizza from './pizza.png';
import all from './all_food.png';
import $ from 'jquery';
import './fooddropAnimate.css';
import { useMyHook } from './myHook';
import { useMemo } from 'react';
import plusSvg from './plus.svg';
import minusSvg from './minus.svg';
import './Html2.css';

const NumberAnimation = ({ number, incrementNumber, decrementNumber }) => {
  const [prevNumber, setPrevNumber] = useState(null);
  const [animationClass, setAnimationClass] = useState('');

  const onAnimationEnd = () => {
    setAnimationClass('');
    setPrevNumber(null);
  };

  const handleIncrement = () => {
    setPrevNumber(number);
    incrementNumber();
    setAnimationClass('increment');
  };

  const handleDecrement = () => {
    setPrevNumber(number);
    decrementNumber();
    setAnimationClass('decrement');
  };

  return (
    <div>

      
      <div className="container">

        
        {prevNumber !== null && (
          <span
            onAnimationEnd={onAnimationEnd}
            className={`number ${animationClass}-prev`}
          >
            {prevNumber}
          </span>
        )}
        <span className={`number ${animationClass}-current`}>{number}</span>
      </div>
      <div className="button-container">
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleDecrement}>-</button>
      </div>
    </div>
  );
};

const NumberAnimationContainer = () => {
  const [numbers, setNumbers] = useState([0, 0, 0]);

  const incrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num + 1 : num))
    );
  };

  const decrementNumber = (index) => {
    setNumbers((prevNumbers) =>
      prevNumbers.map((num, i) => (i === index ? num - 1 : num))
    );
  };

  return (
    <div>
      {numbers.map((number, index) => (
        <NumberAnimation
          key={index}
          number={number}
          incrementNumber={() => incrementNumber(index)}
          decrementNumber={() => decrementNumber(index)}
        />
      ))}
    </div>
  );
};

export default NumberAnimationContainer;
