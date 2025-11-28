// src/App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";

import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";

import AdminDashboard from "./components/dashboard/AdminDashboard";
import DeptHeadDashboard from "./components/dashboard/DeptHeadDashboard";
import EmployeeDashboard from "./components/dashboard/EmployeeDashboard";
import EmployeeList from "./components/employee/EmployeeList";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeePayroll from "./components/employee/EmployeePayroll";
import Reports from "./components/adminpages/Reports";
import Attendance from "./components/adminpages/Attendance";
import Performance from "./components/adminpages/Performance";
import LeaveManagement from "./components/adminpages/LeaveManagement";
import Teammembers from "./components/dephead/Teammembers";
import Attendancecheck from "./components/dephead/Attendencecheck";
import Leaveapproval from "./components/dephead/Leaveapproval";
import Teamperformance from "./components/dephead/Teamperformance";

const router = createBrowserRouter([
  // Login
  { path: "/login", element: <Login /> },
 { path: "/forgot-password", element: <ForgotPassword/> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Admin Dashboard
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  
  // Department Head Dashboard
  {
    path: "/dept-head-dashboard",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <DeptHeadDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employees",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <EmployeeList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employees/profile/:id",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <EmployeeProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/payroll",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <EmployeePayroll/>
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/reports",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/attendance",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/performance",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Performance />
      </ProtectedRoute>
    ),
  },
  {
    path: "admin/leave-management",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <LeaveManagement />
      </ProtectedRoute>
    ),
  },

  // Department Head Routes
  {
    path: "/dept-head/team",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Teammembers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/attendance",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Attendancecheck />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/leave-requests",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Leaveapproval />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/performance",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Teamperformance />
      </ProtectedRoute>
    ),
  },

  // Employee dashboard route
  {
    path: "/employee-dashboard",
    element: (
      <ProtectedRoute roles={["employee"]}>
        <EmployeeDashboard />
      </ProtectedRoute>
    ),
  },

  // Unauthorized page
  { 
    path: "/unauthorized", 
    element: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>Unauthorized Access</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          You don't have permission to access this page.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Back to Login
        </button>
      </div>
    )
  },

  // Default → Redirect to login
  { path: "/", element: <Navigate to="/login" replace /> },
  
  // Catch all - redirect to appropriate dashboard or login
  { 
    path: "*", 
    element: <Navigate to="/login" replace /> 
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}