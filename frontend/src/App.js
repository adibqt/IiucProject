// SkillSync - Main App Component
// Routing and layout configuration

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route */}
          <Route path="/" element={
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div>
                <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Welcome to SkillSync</h1>
                <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>
                  AI-Powered Learning Platform
                </p>
                <a 
                  href="/admin" 
                  style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: 'white',
                    color: '#667eea',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Admin Login →
                </a>
              </div>
            </div>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
