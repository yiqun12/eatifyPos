import React, { useState } from 'react';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/functions';

function App() {

  const handleTextSubmit = async (text) => {
    const synthesizeSpeech = firebase.functions().httpsCallable('synthesizeSpeech');
    let languageCode = 'en-US'
    try {
      const result = await synthesizeSpeech({ text,languageCode });
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
