import React, { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

const ChatInput = ({ onSend, isLoading, disabled }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto-focus input when component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage("");
      // Refocus after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <div className="send-spinner"></div>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
