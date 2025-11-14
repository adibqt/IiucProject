import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./ChatWindow.css";

const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="chat-window" ref={chatWindowRef}>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">🤖</div>
            <h3>Welcome to CareerBot!</h3>
            <p>I'm your AI career mentor. Ask me about:</p>
            <ul>
              <li>Skills to learn next</li>
              <li>Career path recommendations</li>
              <li>Job search tips</li>
              <li>Learning resources</li>
            </ul>
            <p className="welcome-note">
              You can chat in English, Bangla, or Banglish!
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.timestamp ? `${msg.timestamp}-${index}` : index}
            role={msg.role}
            message={msg.message}
            language={msg.language}
            timestamp={msg.timestamp}
          />
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="typing-text">CareerBot is thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
