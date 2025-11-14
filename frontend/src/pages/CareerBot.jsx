/**
 * CareerBot Page - AI-powered career guidance chat interface
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import careerbotAPI from "../services/careerbotService";
import "./CareerBot.css";

const CareerBot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async (message) => {
    if (!message.trim() || isLoading) return;

    // Add user message immediately
    const userMessage = {
      role: "user",
      message: message,
      language: "en", // Will be detected by backend
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await careerbotAPI.ask(message);

      // Add bot response
      const botMessage = {
        role: "bot",
        message: response.reply,
        language: response.language || "en",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message to CareerBot:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to get response from CareerBot. Please try again."
      );

      // Add error message as bot message
      const errorMessage = {
        role: "bot",
        message:
          "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        language: "en",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="careerbot-page">
      <div className="careerbot-navbar-wrapper">
        <Navbar />
      </div>
      <div className="careerbot-container">
        <div className="careerbot-header">
          <div className="careerbot-header-content">
            <h1>CareerBot</h1>
            <p>Your AI-powered career mentor and guide</p>
          </div>
        </div>

        {error && <div className="careerbot-alert error">{error}</div>}

        <div className="careerbot-chat-container">
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CareerBot;
