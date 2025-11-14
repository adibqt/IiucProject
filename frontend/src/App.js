// SkillSync - Main App Component
// Routing and layout configuration

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import CareerBot from "./pages/CareerBot";
import AIServices from "./pages/AIServices";
import JobRecommendation from "./pages/JobRecommendation";
import CVAssistant from "./pages/CVAssistant";
import "./App.css";

// Protected Route Component for User Auth
const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected Route Component for Admin Auth
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Redirect Authenticated Users from Auth Pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Home />} />

      {/* User Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedUserRoute>
            <Dashboard />
          </ProtectedUserRoute>
        }
      />

      {/* Jobs routes removed per request */}
      <Route
        path="/jobs"
        element={
          <ProtectedUserRoute>
            <Jobs />
          </ProtectedUserRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedUserRoute>
            <Profile />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedUserRoute>
            <Resources />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/bot"
        element={
          <ProtectedUserRoute>
            <CareerBot />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/ai-services"
        element={
          <ProtectedUserRoute>
            <AIServices />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/careerbot"
        element={
          <ProtectedUserRoute>
            <CareerBot />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/ai/job-recommendation"
        element={
          <ProtectedUserRoute>
            <JobRecommendation />
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/cv-assistant"
        element={
          <ProtectedUserRoute>
            <CVAssistant />
          </ProtectedUserRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;
