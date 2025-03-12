import React, { useState } from 'react';
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';

function App() {
  const handleTextSubmit = async (text) => {
    const functions = getFunctions();
    const synthesizeSpeechFunction = httpsCallable(functions, 'synthesizeSpeech');
    let languageCode = 'en-US';
    try {
      const result = await synthesizeSpeechFunction({ text, languageCode });
      const audioContentBase64 = result.data.audioContent;
      const audioBlob = new Blob([Uint8Array.from(atob(audioContentBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const url = URL.createObjectURL(audioBlob);
      const sound = new Audio(url);
      sound.play();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={() => handleTextSubmit("New Order has been sent to kitchen")}>Convert to Speech</button>
  );
}

export default App;
