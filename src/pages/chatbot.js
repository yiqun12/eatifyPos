import React, { useState } from 'react';
import './chatbot.css';


function chatbot() {


    return (
<>

<div id="chat-wrapper">
  <div id="chat-bot-mood">
    <div id="chat-bot-mood-icon"></div>
    <div id="chat-bot-mood-label">
      <h1 id="chat-bot-mood-text">Chatbot is feeling</h1>
      <h1 id="chat-bot-mood-value">Mood</h1>
    </div>
  </div>
  <div id="letter-pool"></div>
  <div id="temp-letter-pool"></div>
  <div id="letter-overlay"></div>
  <div id="chat-message-window">
    <div id="message-input-wrapper">
      <div id="message-input">
        <input id="message-input-field" type="text" placeholder="Type a message" maxlength="100"/>
        
        <div id="send-message-button"><i class="far fa-arrow-alt-circle-right"></i></div>
      </div>
    </div>
    <div class="scroll-bar" id="chat-message-column-wrapper">
      <div class="static" id="chat-message-column"></div>
    </div>
  </div>
</div>
</>
    );
}

export default chatbot;
