import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <h1 className="dashboard-logo">SkillSync</h1>
        <nav className="dashboard-nav">
          <ul className="dashboard-nav-list">
            <li>
              <button
                onClick={() => navigate("/dashboard")}
                className={`dashboard-nav-link ${
                  isActive("/dashboard") ? "active" : ""
                }`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/profile")}
                className={`dashboard-nav-link ${
                  isActive("/profile") ? "active" : ""
                }`}
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
              <button
                onClick={() => navigate("/jobs")}
                className={`dashboard-nav-link ${
                  isActive("/jobs") ? "active" : ""
                }`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Jobs
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/resources")}
                className={`dashboard-nav-link ${
                  isActive("/resources") ? "active" : ""
                }`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Resources
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/cv-assistant")}
                className={`dashboard-nav-link ${
                  isActive("/cv-assistant") ? "active" : ""
                }`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                CV Assistant
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/ai-services")}
                className={`dashboard-nav-link ai-services-nav-btn ${
                  isActive("/ai-services") ? "active" : ""
                }`}
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                ✨ SkillCoach AI
              </button>
            </li>
          </ul>
          <button
            className="dashboard-logout-button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
