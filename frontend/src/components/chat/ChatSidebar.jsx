/**
 * ChatSidebar - ChatGPT-style conversation sidebar
 */
import React, { useState } from "react";
import "./ChatSidebar.css";

const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const handleStartEdit = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const handleSaveEdit = (sessionId) => {
    if (editTitle.trim()) {
      onRenameSession(sessionId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (sessionId) => {
    if (window.confirm("Delete this conversation? This cannot be undone.")) {
      onDeleteSession(sessionId);
    }
    setMenuOpenId(null);
  };

  const toggleMenu = (sessionId) => {
    setMenuOpenId(menuOpenId === sessionId ? null : sessionId);
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <span className="icon">✨</span>
          <span>New Chat</span>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sessions-section">
          <h3 className="section-title">Chats</h3>
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No conversations yet</p>
                <p className="empty-hint">Start a new chat to begin!</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`session-item ${
                    session.id === currentSessionId ? "active" : ""
                  }`}
                  onClick={() => !editingId && onSelectSession(session.id)}
                >
                  {editingId === session.id ? (
                    <div className="session-edit">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(session.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="edit-actions">
                        <button
                          className="save-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(session.id);
                          }}
                        >
                          ✓
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="session-info">
                        <div className="session-icon">💬</div>
                        <div className="session-details">
                          <div className="session-title">{session.title}</div>
                          <div className="session-meta">
                            {session.message_count} messages
                          </div>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button
                          className="menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(session.id);
                          }}
                        >
                          ⋮
                        </button>
                        {menuOpenId === session.id && (
                          <div className="session-menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(session);
                              }}
                            >
                              <span className="menu-icon">✏️</span>
                              Rename
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                            >
                              <span className="menu-icon">🗑️</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
