
// src/utils/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStoredAccessToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const getStoredUser = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredAccessToken();
      const storedUser = getStoredUser();

      if (!token) {
        setLoading(false);
        return;
      }

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (storedUser) {
        console.log("📦 Restored user from storage:", storedUser.email, "EmployeeId:", storedUser.employeeId);
        setUser(storedUser);
        setLoading(false);
      } else {
        await attemptTokenRefresh();
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const attemptTokenRefresh = async () => {
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      const newToken = response.data.token;
      
      if (newToken) {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("token", newToken);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  const login = (userData, token, rememberMe = false) => {
    console.log("✅ Login successful - User:", userData.email, "EmployeeId:", userData.employeeId);
    
    setUser(userData);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common["Authorization"];
    
    window.location.href = "/login";
  };

  const isAuthenticated = () => {
    return !!user && !!getStoredAccessToken();
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
