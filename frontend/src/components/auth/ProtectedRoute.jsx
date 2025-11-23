
// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !hasRole(roles)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
