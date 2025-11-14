import React from "react";
import "./MessageBubble.css";

const MessageBubble = ({ role, message, language, timestamp }) => {
  const isUser = role === "user";
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`message-bubble ${isUser ? "user" : "bot"}`}>
      <div className="message-content">
        <p className="message-text">{message}</p>
        {!isUser && (
          <p className="message-disclaimer">
            This is a suggestion, not a guaranteed outcome.
          </p>
        )}
        {formattedTime && <span className="message-time">{formattedTime}</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
