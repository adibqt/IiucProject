/**
 * AuthContext - Global Authentication State Management
 * Manages user authentication state, JWT tokens, and provides auth methods
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("userToken");
    const savedUser = localStorage.getItem("userData");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }

    setLoading(false);
  }, []);

  // Register user
  const register = useCallback(async (fullName, email, password) => {
    try {
      const response = await api.post("/users/register", {
        full_name: fullName,
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      // Save token and user data
      localStorage.setItem("userToken", access_token);
      localStorage.setItem("userData", JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || "Registration failed";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post("/users/login", {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      // Save token and user data
      localStorage.setItem("userToken", access_token);
      localStorage.setItem("userData", JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Login failed";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if needed (optional for stateless JWT)
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    }

    // Clear localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");

    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    return { success: true };
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    if (!token) {
      return { success: false, error: "No token available" };
    }

    try {
      const response = await api.get("/users/me");
      const userData = response.data;

      // Update state and localStorage
      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));

      return { success: true, data: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Failed to get user";
      return { success: false, error: errorMessage };
    }
  }, [token]);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData) => {
      if (!token) {
        return { success: false, error: "No token available" };
      }

      try {
        const response = await api.put("/users/me", profileData);
        const userData = response.data;

        // Update state and localStorage
        setUser(userData);
        localStorage.setItem("userData", JSON.stringify(userData));

        return { success: true, data: userData };
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail || "Failed to update profile";
        return { success: false, error: errorMessage };
      }
    },
    [token]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
