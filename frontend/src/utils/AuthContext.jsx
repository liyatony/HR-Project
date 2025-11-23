
// src/utils/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStoredAccessToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    const init = async () => {
      const token = getStoredAccessToken();
      if (!token) { setLoading(false); return; }
      try {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const resp = await axiosInstance.get("/auth/verify");
        if (resp.data.success) setUser(resp.data.user);
        else logout();
      } catch (err) {
        // try refresh
        try {
          const r = await axiosInstance.post("/auth/refresh-token");
          const newToken = r.data.token;
          if (newToken) {
            sessionStorage.setItem("token", newToken);
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            const v = await axiosInstance.get("/auth/verify");
            if (v.data.success) setUser(v.data.user);
            else logout();
          } else logout();
        } catch (e) { logout(); }
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const login = (userData, token, rememberMe = false) => {
    setUser(userData);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = async () => {
    try { await axiosInstance.post("/auth/logout"); } catch (e) {}
    setUser(null);
    localStorage.removeItem("token"); localStorage.removeItem("user");
    sessionStorage.removeItem("token"); sessionStorage.removeItem("user");
    delete axiosInstance.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  const isAuthenticated = () => !!user && !!getStoredAccessToken();
  const hasRole = (roles) => { if (!user) return false; return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles; };

  return <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, hasRole }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};



