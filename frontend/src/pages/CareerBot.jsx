/**
 * CareerBot Page - AI-powered career guidance chat interface with session management
 */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import careerbotAPI from "../services/careerbotService";
import {
  saveCurrentSession,
  loadCurrentSession,
  clearCurrentSession,
} from "../utils/chatStorage";
import "./CareerBot.css";

const CareerBot = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState(null);

  // ==================== Initialize Sessions ====================

  /**
   * Load sessions and determine which one to open
   */
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        // Fetch all sessions
        const fetchedSessions = await careerbotAPI.getSessions();
        setSessions(fetchedSessions);

        // Determine which session to open
        const savedSessionId = loadCurrentSession();

        // If coming from another page (not refresh), start fresh
        const isFromNavigation = location.state?.fromNavigation;

        if (isFromNavigation || !savedSessionId) {
          // Create new session
          const newSession = await careerbotAPI.createSession();
          setSessions((prev) => [newSession, ...prev]);
          setCurrentSessionId(newSession.id);
          saveCurrentSession(newSession.id);
          setMessages([]);
        } else {
          // Load saved session if it exists
          const sessionExists = fetchedSessions.find(
            (s) => s.id === savedSessionId
          );
          if (sessionExists) {
            setCurrentSessionId(savedSessionId);
            await loadSessionHistory(savedSessionId);
          } else {
            // Session was deleted, create new one
            const newSession = await careerbotAPI.createSession();
            setSessions((prev) => [newSession, ...prev]);
            setCurrentSessionId(newSession.id);
            saveCurrentSession(newSession.id);
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("Failed to initialize sessions:", err);
        setError("Failed to load conversations. Please refresh the page.");
      } finally {
        setIsSyncing(false);
      }
    };

    initializeSessions();
  }, []); // Only run once on mount

  /**
   * Load history for a specific session
   */
  const loadSessionHistory = async (sessionId) => {
    try {
      const history = await careerbotAPI.getHistory(sessionId);
      setMessages(history);
    } catch (err) {
      console.error("Failed to load session history:", err);
      setError("Failed to load conversation history.");
      setMessages([]);
    }
  };

  // ==================== Session Management ====================

  const handleNewChat = async () => {
    try {
      const newSession = await careerbotAPI.createSession();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      saveCurrentSession(newSession.id);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("Failed to create new chat:", err);
      setError("Failed to create new conversation.");
    }
  };

  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;

    try {
      setCurrentSessionId(sessionId);
      saveCurrentSession(sessionId);
      setError(null);
      setIsSyncing(true);
      await loadSessionHistory(sessionId);
    } catch (err) {
      console.error("Failed to switch session:", err);
      setError("Failed to load conversation.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      const updatedSession = await careerbotAPI.updateSession(
        sessionId,
        newTitle
      );
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
    } catch (err) {
      console.error("Failed to rename session:", err);
      setError("Failed to rename conversation.");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await careerbotAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // If deleting current session, switch to another or create new
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          const nextSession = remainingSessions[0];
          setCurrentSessionId(nextSession.id);
          saveCurrentSession(nextSession.id);
          await loadSessionHistory(nextSession.id);
        } else {
          // No sessions left, create a new one
          await handleNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError("Failed to delete conversation.");
    }
  };

  // ==================== Message Handling ====================

  const handleSend = async (message) => {
    if (!message.trim() || isLoading || !currentSessionId) return;

    // Add user message immediately
    const userMessage = {
      role: "user",
      message: message,
      language: "en",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await careerbotAPI.ask(message, currentSessionId);

      // Add bot response
      const botMessage = {
        role: "bot",
        message: response.reply,
        language: response.language || "en",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Refresh sessions to update message count and title
      const updatedSessions = await careerbotAPI.getSessions();
      setSessions(updatedSessions);
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
    <div className="careerbot-page-container">
      <div className="careerbot-navbar-wrapper">
        <Navbar />
      </div>

      <div className="careerbot-main">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
        />

        <div className="careerbot-content">
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
              disabled={!currentSessionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerBot;
