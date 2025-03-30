import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import '../css/AIChat.css';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your POS assistant. I can help you with menu management, order processing, payment systems, and more. How can I assist you today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleToggleAIChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('toggleAIChat', handleToggleAIChat);

    return () => {
      window.removeEventListener('toggleAIChat', handleToggleAIChat);
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = { id: messages.length + 1, text: inputValue, isBot: false };
    setMessages([...messages, userMessage]);
    setInputValue('');

    setIsThinking(true);

    setTimeout(() => {
      const botResponses = [
        "Let me check our POS system documentation for that information.",
        "I can help you with that POS system feature. Here's what I found...",
        "Based on our restaurant POS system capabilities...",
        "That's a common question about our POS system. Here's what you need to know...",
        "Would you like me to explain more about our POS system features?"
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      setIsThinking(false);
      const botMessage = { id: messages.length + 2, text: randomResponse, isBot: true };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = { id: messages.length + 1, text: suggestion, isBot: false };
    setMessages([...messages, userMessage]);

    setIsThinking(true);

    setTimeout(() => {
      let botResponse = "";
      switch (suggestion) {
        case "How to manage menu items?":
          botResponse = "Our POS system offers comprehensive menu management features. You can easily add, edit, or remove items, set prices, create categories, and manage special offers. The system also supports multiple languages and currencies for international restaurants.";
          break;
        case "How to process payments?":
          botResponse = "Our POS system supports various payment methods including credit cards, mobile payments, and cash. You can split bills, apply discounts, handle refunds, and generate detailed payment reports. The system is also PCI compliant for secure transactions.";
          break;
        case "How to handle orders?":
          botResponse = "Order processing is streamlined with our POS system. You can take orders at tables, for takeout, or delivery. The system automatically sends orders to the kitchen, tracks order status, and manages delivery routes. You can also handle special requests and modifications easily.";
          break;
        case "How to manage inventory?":
          botResponse = "Our POS system includes powerful inventory management features. You can track stock levels, set reorder points, manage suppliers, and generate inventory reports. The system also helps reduce waste by tracking usage patterns and suggesting optimal stock levels.";
          break;
        default:
          botResponse = "I'm not sure I understand that question. Could you please provide more details about what you'd like to know about our POS system?";
      }

      setIsThinking(false);
      const botMessage = { id: messages.length + 2, text: botResponse, isBot: true };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 2000);
  };

  const suggestions = [
    "How to manage menu items?",
    "How to process payments?",
    "How to handle orders?",
    "How to manage inventory?"
  ];

  const ThinkingIndicator = () => (
    <div className="ai-chat-message ai-bot-message ai-thinking">
      <div className="ai-thinking-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );

  return (
    <div className="ai-chat-container">
      {isOpen ? (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <div className="ai-logo">
                <span className="ai-logo-text">POS</span>
              </div>
              <div>
                <h3>POS Assistant</h3>
                <p className="ai-chat-subtitle">Your restaurant management expert</p>
              </div>
            </div>
            <button className="ai-chat-close-btn" onClick={toggleChat}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-chat-message ${message.isBot ? 'ai-bot-message' : 'ai-user-message'}`}
              >
                {message.text}
              </div>
            ))}
            {isThinking && <ThinkingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isThinking && (
            <div className="ai-chat-suggestions">
              <p className="ai-suggestions-title">Common Questions</p>
              <div className="ai-suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="ai-suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="ai-chat-input-container" onSubmit={handleSubmit}>
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask about our POS system..."
              value={inputValue}
              onChange={handleInputChange}
              ref={inputRef}
            />
            <button 
              type="submit" 
              className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors duration-200"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      ) : (
        <button className="ai-chat-button" onClick={toggleChat}>
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default AIChat;