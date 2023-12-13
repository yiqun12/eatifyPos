import React, { useState } from 'react';
import mySound from './new_order_english.mp3'; // Replace with your sound file's path

const SoundButtonNewOrderEnglish = () => {
  // This function plays the sound
  const playSound = () => {
    const sound = new Audio(mySound);
    sound.play();
  };

  return (
    <div>
      <button onClick={playSound}>Play English Sound</button>
    </div>
  );
};

export default SoundButtonNewOrderEnglish;