/**
 * Login Page
 * User login form for SkillSync
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SkillSyncLogo from "../components/SkillSyncLogo";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Show redirect message if coming from protected route
  useEffect(() => {
    if (location.state?.message) {
      setAlert({
        type: "info",
        message: location.state.message,
      });
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Load remembered email if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setAlert({
          type: "success",
          message: "Login successful! Redirecting...",
        });

        // Redirect to the page they came from or dashboard
        const redirectTo = location.state?.from || "/dashboard";
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      } else {
        let errorMessage = result.error;

        // Provide user-friendly error messages
        if (result.error.includes("401")) {
          errorMessage = "Invalid email or password";
        } else if (result.error.includes("not found")) {
          errorMessage = "Account does not exist. Please register first.";
        }

        setAlert({
          type: "error",
          message: errorMessage || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <button
          onClick={() => navigate("/")}
          className="login-back-button"
          type="button"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease",
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ← Back to Home
        </button>
        <div className="login-header">
          <div className="login-logo">
            <SkillSyncLogo size={60} variant="icon" theme="light" />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to continue your learning journey
          </p>
        </div>

        <div className="login-body">
          {alert && (
            <div className={`login-alert ${alert.type}`}>
              <span>{alert.type === "success" ? "✓" : "⚠"}</span>
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-form-group">
              <label htmlFor="email" className="login-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`login-form-input ${errors.email ? "error" : ""}`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <div className="login-error-message">
                  <span>⚠</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="login-form-group">
              <div className="login-password-label-wrapper">
                <label htmlFor="password" className="login-form-label">
                  Password
                </label>
                <Link
                  to="#forgot"
                  className="login-forgot-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <div className="login-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`login-form-input ${
                    errors.password ? "error" : ""
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {errors.password && (
                <div className="login-error-message">
                  <span>⚠</span>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Remember Me */}
            <div className="login-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`login-submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Signing In</span>
                  <div className="login-button-spinner"></div>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="login-footer-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
