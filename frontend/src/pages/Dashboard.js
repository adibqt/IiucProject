/**
 * User Dashboard Page
 * Main page for authenticated users
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header/Navbar */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-logo">SkillSync</h1>
          <nav className="dashboard-nav">
            <ul className="dashboard-nav-list">
              <li>
                <a href="#dashboard" className="dashboard-nav-link active">
                  Dashboard
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  className="dashboard-nav-link"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Profile
                </button>
              </li>

              <li>
                <a href="#resources" className="dashboard-nav-link">
                  Resources
                </a>
              </li>
            </ul>
            <button className="dashboard-logout-button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div className="dashboard-welcome">
            <h2>Welcome, {user.full_name || user.email}! 👋</h2>
            <p>Ready to continue your learning journey?</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Quick Stats */}
          <section className="dashboard-section">
            <h3>Quick Stats</h3>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Skills</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Courses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0%</div>
                <div className="stat-label">Progress</div>
              </div>
            </div>
          </section>

          {/* User Info */}
          <section className="dashboard-section">
            <h3>Account Information</h3>
            <div className="dashboard-user-info">
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="role-badge">{user.role}</span>
              </div>
            </div>
          </section>

          {/* Coming Soon Features */}
          <section className="dashboard-section">
            <h3>Coming Soon</h3>
            <div className="coming-soon-grid">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">📚</div>
                <h4>Recommended Resources</h4>
                <p>Get personalized learning resources</p>
              </div>
              <div className="coming-soon-card">
                <div className="coming-soon-icon">🎯</div>
                <h4>Job Matches</h4>
                <p>Find jobs that match your skills</p>
              </div>
              <div className="coming-soon-card">
                <div className="coming-soon-icon">🗺️</div>
                <h4>Career Roadmap</h4>
                <p>Plan your career path with AI</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 SkillSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
