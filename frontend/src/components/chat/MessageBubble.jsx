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

  // Format message with markdown-like styling
  const formatMessage = (text) => {
    if (!text) return "";

    let formatted = text;

    // Escape HTML to prevent XSS
    formatted = formatted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers: ## Header or # Header
    formatted = formatted.replace(
      /^### (.+)$/gm,
      '<h4 class="message-header-small">$1</h4>'
    );
    formatted = formatted.replace(
      /^## (.+)$/gm,
      '<h3 class="message-header">$1</h3>'
    );
    formatted = formatted.replace(
      /^# (.+)$/gm,
      '<h2 class="message-header-large">$1</h2>'
    );

    // Bold text: **text** (must come before italic)
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Italic text: *text* or _text_
    formatted = formatted.replace(/\*([^\*]+)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>");

    // Bullet points: - item, * item, or • item
    formatted = formatted.replace(
      /^[\-\*•] (.+)$/gm,
      '<li class="message-list-item">$1</li>'
    );

    // Numbered lists: 1. item
    formatted = formatted.replace(
      /^\d+\.\s+(.+)$/gm,
      '<li class="message-numbered-item">$1</li>'
    );

    // Wrap consecutive list items in ul/ol
    formatted = formatted.replace(
      /(<li class="message-list-item">[\s\S]+?<\/li>)(?:\n(?=<li class="message-list-item">)|(?!\n<li class="message-list-item">))/g,
      (match) => `<ul class="message-list">${match}</ul>`
    );
    formatted = formatted.replace(
      /(<li class="message-numbered-item">[\s\S]+?<\/li>)(?:\n(?=<li class="message-numbered-item">)|(?!\n<li class="message-numbered-item">))/g,
      (match) => `<ol class="message-numbered-list">${match}</ol>`
    );

    // Split into paragraphs (double line breaks)
    const parts = formatted.split(/\n\n+/);
    formatted = parts
      .map((part) => {
        const trimmed = part.trim();
        // Don't wrap if it's already wrapped in HTML tags
        if (
          trimmed.startsWith("<h") ||
          trimmed.startsWith("<ul") ||
          trimmed.startsWith("<ol") ||
          trimmed.startsWith("<li")
        ) {
          return trimmed;
        }
        // Wrap in paragraph
        return `<p class="message-paragraph">${trimmed.replace(
          /\n/g,
          "<br/>"
        )}</p>`;
      })
      .filter((p) => p.length > 0)
      .join("\n");

    return formatted;
  };

  // Check if message contains the disclaimer
  const hasDisclaimer =
    !isUser &&
    message.includes("This is a suggestion, not a guaranteed outcome");

  return (
    <div className={`message-bubble ${isUser ? "user" : "bot"}`}>
      <div className="message-content">
        {isUser ? (
          <p className="message-text">{message}</p>
        ) : (
          <div
            className="message-text formatted"
            dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
          />
        )}
        {formattedTime && <span className="message-time">{formattedTime}</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
