/**
 * Register Page
 * User registration form for SkillSync
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SkillSyncLogo from "../components/SkillSyncLogo";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one digit";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const result = await register(
        formData.fullName,
        formData.email,
        formData.password
      );

      if (result.success) {
        setAlert({
          type: "success",
          message: "Registration successful! Redirecting to dashboard...",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAlert({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1) return { label: "Weak", color: "#ef4444" };
    if (strength === 2) return { label: "Fair", color: "#f59e0b" };
    if (strength === 3) return { label: "Good", color: "#10b981" };
    return { label: "Strong", color: "#3b82f6" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-container">
      <div className="register-card fade-in">
        <div className="register-header">
          <div className="register-logo">
            <SkillSyncLogo size={60} variant="icon" theme="light" />
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Join SkillSync and start your learning journey
          </p>
        </div>

        <div className="register-body">
          {alert && (
            <div className={`register-alert ${alert.type}`}>
              <span>{alert.type === "success" ? "✓" : "⚠"}</span>
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="register-form-group">
              <label htmlFor="fullName" className="register-form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`register-form-input ${
                  errors.fullName ? "error" : ""
                }`}
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.fullName && (
                <div className="register-error-message">
                  <span>⚠</span>
                  <span>{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="register-form-group">
              <label htmlFor="email" className="register-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`register-form-input ${errors.email ? "error" : ""}`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <div className="register-error-message">
                  <span>⚠</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label htmlFor="password" className="register-form-label">
                Password
              </label>
              <div className="register-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`register-form-input ${
                    errors.password ? "error" : ""
                  }`}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="register-password-strength">
                  <div className="register-strength-bars">
                    <div
                      className="register-strength-bar"
                      style={{
                        backgroundColor: passwordStrength?.color || "#e5e7eb",
                        width:
                          passwordStrength?.label === "Weak"
                            ? "25%"
                            : passwordStrength?.label === "Fair"
                            ? "50%"
                            : passwordStrength?.label === "Good"
                            ? "75%"
                            : "100%",
                      }}
                    ></div>
                  </div>
                  <span style={{ color: passwordStrength?.color }}>
                    {passwordStrength?.label} password
                  </span>
                </div>
              )}

              {errors.password && (
                <div className="register-error-message">
                  <span>⚠</span>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="register-form-group">
              <label htmlFor="confirmPassword" className="register-form-label">
                Confirm Password
              </label>
              <div className="register-password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`register-form-input ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {errors.confirmPassword && (
                <div className="register-error-message">
                  <span>⚠</span>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`register-submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Creating Account</span>
                  <div className="register-button-spinner"></div>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Terms and Conditions */}
          <div className="register-terms">
            <p>
              By registering, you agree to our{" "}
              <a href="#terms" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="register-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="register-footer-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
