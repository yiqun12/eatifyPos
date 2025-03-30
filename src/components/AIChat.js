import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import '../css/AIChat.css';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I can find answers from the Zams help center. How can I help?", isBot: true }
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
        "I'm checking our knowledge base for that information.",
        "That's a great question! Here's what I found in our documentation.",
        "Let me help you with that. Based on our restaurant POS system features...",
        "I understand your question. Our system supports that functionality.",
        "Would you like me to provide more details about our POS system?"
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      setIsThinking(false);
      const botMessage = { id: messages.length + 2, text: randomResponse, isBot: true };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 2000); // 思考2秒
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = { id: messages.length + 1, text: suggestion, isBot: false };
    setMessages([...messages, userMessage]);

    setIsThinking(true);

    setTimeout(() => {
      let botResponse = "";
      switch (suggestion) {
        case "What are AI Agents?":
          botResponse = "AI Agents are intelligent software components that can perform tasks autonomously. In our POS system, AI agents help with order processing, inventory management, and customer service.";
          break;
        case "Agentic AI vs. Predictive AI":
          botResponse = "Agentic AI can take actions based on data and context, while Predictive AI primarily forecasts outcomes. Our POS system uses both: predictive AI for sales forecasting and agentic AI for automated inventory management.";
          break;
        case "What is the onboarding process?":
          botResponse = "Our onboarding process is simple: 1) System installation, 2) Staff training, 3) Menu setup, 4) Test transactions, and 5) Go-live with support. We provide comprehensive training materials and 24/7 support during this process.";
          break;
        case "What algorithms are supported?":
          botResponse = "Our POS system supports various algorithms including machine learning for sales prediction, natural language processing for voice orders, and computer vision for QR code scanning and visual food recognition.";
          break;
        default:
          botResponse = "I'm not sure I understand that question. Could you please provide more details?";
      }

      setIsThinking(false);
      const botMessage = { id: messages.length + 2, text: botResponse, isBot: true };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    }, 2000); // 思考2秒
  };

  const suggestions = [
    "What are AI Agents?",
    "Agentic AI vs. Predictive AI",
    "What is the onboarding process?",
    "What algorithms are supported?"
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
                <span className="ai-logo-text">AI</span>
              </div>
              <div>
                <h3>AI Answers</h3>
                <p className="ai-chat-subtitle">AI assistant</p>
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
              <p className="ai-suggestions-title">Suggestions</p>
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
              placeholder="Ask a question..."
              value={inputValue}
              onChange={handleInputChange}
              ref={inputRef}
            />
            <button type="submit" className="ai-chat-send-btn">
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
