// Admin Login Page
// Professional login interface for SkillSync admin panel

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillSyncLogo from '../components/SkillSyncLogo';
import { authAPI } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await authAPI.login(formData.email, formData.password);
      
      // Store token and user info
      localStorage.setItem('adminToken', response.access_token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
      
      // Show success message
      setAlert({
        type: 'success',
        message: 'Login successful! Redirecting...'
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (!error.response) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      setAlert({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitAdmin = async () => {
    try {
      setLoading(true);
      const response = await authAPI.initializeAdmin();
      setAlert({
        type: 'success',
        message: `Admin created! Email: ${response.data.email}, Password: ${response.data.password}`
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to initialize admin'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card fade-in">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <SkillSyncLogo size={60} variant="icon" theme="light" />
          </div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">SkillSync Management System</p>
        </div>

        <div className="admin-login-body">
          {alert && (
            <div className={`admin-alert ${alert.type}`}>
              <span>{alert.type === 'success' ? '✓' : '⚠'}</span>
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="email" className="admin-form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`admin-form-input ${errors.email ? 'error' : ''}`}
                placeholder="admin@skillsync.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && (
                <div className="admin-error-message">
                  <span>⚠</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="password" className="admin-form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`admin-form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && (
                <div className="admin-error-message">
                  <span>⚠</span>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`admin-login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Sign In</span>
                  <div className="admin-button-spinner"></div>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Development helper - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handleInitAdmin}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '13px',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Initialize Admin (Dev Only)
              </button>
            </div>
          )}
        </div>

        <div className="admin-login-footer">
          <p>
            Secure admin access powered by SkillSync
            <br />
            © 2025 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
