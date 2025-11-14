// Admin Dashboard
// Main dashboard with statistics and navigation

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SkillSyncLogo from "../components/SkillSyncLogo";
import AdminSkills from "./AdminSkills";
import AdminJobs from "./AdminJobs";
import AdminCourses from "./AdminCourses";
import AdminUsers from "./AdminUsers";
import { authAPI, dashboardAPI } from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check authentication
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin");
        return;
      }

      // Load user info
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Load dashboard stats
      const statsData = await dashboardAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      if (error.response?.status === 401) {
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <SkillSyncLogo size={40} variant="icon" theme="dark" />
            <div>
              <h2 className="admin-sidebar-title">SkillSync</h2>
              <p className="admin-sidebar-subtitle">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Overview</div>
            <div
              className={`admin-nav-item ${
                activeSection === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <span className="admin-nav-icon">📊</span>
              <span>Dashboard</span>
            </div>
          </div>

          <div className="admin-nav-section">
            <div className="admin-nav-section-title">Management</div>
            <div
              className={`admin-nav-item ${
                activeSection === "users" ? "active" : ""
              }`}
              onClick={() => setActiveSection("users")}
            >
              <span className="admin-nav-icon">👥</span>
              <span>Users</span>
            </div>
            <div
              className={`admin-nav-item ${
                activeSection === "courses" ? "active" : ""
              }`}
              onClick={() => setActiveSection("courses")}
            >
              <span className="admin-nav-icon">📚</span>
              <span>Courses</span>
            </div>
            <div
              className={`admin-nav-item ${
                activeSection === "skills" ? "active" : ""
              }`}
              onClick={() => setActiveSection("skills")}
            >
              <span className="admin-nav-icon">🎯</span>
              <span>Skills</span>
            </div>
            <div
              className={`admin-nav-item ${
                activeSection === "jobs" ? "active" : ""
              }`}
              onClick={() => setActiveSection("jobs")}
            >
              <span className="admin-nav-icon">💼</span>
              <span>Jobs</span>
            </div>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || "A"}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">
                {user?.full_name || user?.username}
              </p>
              <p className="admin-user-role">Administrator</p>
            </div>
          </div>
          <button className="admin-logout-button" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">
            {activeSection.charAt(0).toUpperCase() +
              activeSection.slice(1).replace("-", " ")}
          </h1>
          <div className="admin-header-actions">
            {/* Future: Add action buttons */}
          </div>
        </header>

        <div className="admin-content">
          {activeSection === "dashboard" && stats && (
            <>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <div>
                      <h3 className="admin-stat-value">{stats.total_users}</h3>
                      <p className="admin-stat-label">Total Users</p>
                    </div>
                    <div className="admin-stat-icon blue">👥</div>
                  </div>
                  <div className="admin-stat-change positive">
                    ↑ {stats.new_users_this_month} this month
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <div>
                      <h3 className="admin-stat-value">
                        {stats.total_courses}
                      </h3>
                      <p className="admin-stat-label">Total Courses</p>
                    </div>
                    <div className="admin-stat-icon purple">📚</div>
                  </div>
                  <div className="admin-stat-change positive">
                    ↑ {stats.courses_published_this_month} published this month
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <div>
                      <h3 className="admin-stat-value">{stats.total_skills}</h3>
                      <p className="admin-stat-label">Total Skills</p>
                    </div>
                    <div className="admin-stat-icon green">🎯</div>
                  </div>
                  <div className="admin-stat-change">
                    Skills available to learn
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <div>
                      <h3 className="admin-stat-value">
                        {stats.active_enrollments}
                      </h3>
                      <p className="admin-stat-label">Active Enrollments</p>
                    </div>
                    <div className="admin-stat-icon orange">📈</div>
                  </div>
                  <div className="admin-stat-change">
                    Students currently learning
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "32px",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "20px",
                    fontWeight: "600",
                  }}
                >
                  Welcome to SkillSync Admin Panel
                </h2>
              </div>
            </>
          )}

          {activeSection === "users" && <AdminUsers />}

          {activeSection === "skills" && <AdminSkills />}

          {activeSection === "courses" && <AdminCourses />}

          {activeSection === "jobs" && <AdminJobs />}

          {activeSection !== "dashboard" &&
            activeSection !== "users" &&
            activeSection !== "skills" &&
            activeSection !== "courses" &&
            activeSection !== "jobs" && (
              <div
                style={{
                  background: "white",
                  padding: "48px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <h2 style={{ fontSize: "24px", margin: "0 0 12px 0" }}>
                  {activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1).replace("-", " ")}
                </h2>
                <p style={{ color: "#6b7280" }}>
                  This section is ready for implementation. The backend API
                  endpoints and database models are prepared.
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
