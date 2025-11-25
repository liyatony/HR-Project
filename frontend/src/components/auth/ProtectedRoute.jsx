
// // src/components/auth/ProtectedRoute.jsx
// import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../utils/AuthContext";

// const ProtectedRoute = ({ children, roles }) => {
//   const { loading, isAuthenticated, hasRole } = useAuth();
//   const location = useLocation();

//   if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
//   if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location }} replace />;
//   if (roles && !hasRole(roles)) return <Navigate to="/unauthorized" replace />;

//   return children;
// };

// export default ProtectedRoute;


// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#4f46e5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    console.log("❌ User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles && !hasRole(roles)) {
    console.log("❌ User does not have required role. User role:", user?.role, "Required:", roles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Protected route access granted. User:", user?.email, "Role:", user?.role);

  // User is authenticated and has required role
  return children;
};

export default ProtectedRoute;