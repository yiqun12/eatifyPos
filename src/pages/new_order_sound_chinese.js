import React, { useState } from 'react';
import mySound from './new_order_chinese.mp3'; // Replace with your sound file's path

const SoundButtonNewOrderChinese = () => {
  // This function plays the sound
  const playSound = () => {
    const sound = new Audio(mySound);
    sound.play();
  };

  return (
    <div>
      <button onClick={playSound}>Play Chinese Sound</button>
    </div>
  );
};

export default SoundButtonNewOrderChinese;