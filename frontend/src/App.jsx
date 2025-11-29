// src/App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";

// Auth
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Dashboards
import AdminDashboard from "./components/dashboard/AdminDashboard";
import DeptHeadDashboard from "./components/dashboard/DeptHeadDashboard";
import EmployeeDashboard from "./components/dashboard/EmployeeDashboard";

// Admin pages
import EmployeeList from "./components/employee/EmployeeList";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeePayroll from "./components/employee/EmployeePayroll";
import Reports from "./components/adminpages/Reports";
import Attendance from "./components/adminpages/Attendance";
import Performance from "./components/adminpages/Performance";
import LeaveManagement from "./components/adminpages/LeaveManagement";

// Employee Pages
import MarkAttendance from "./components/employee/MarkAttendance";
import AttendanceHistory from "./components/employee/AttendanceHistory";


const router = createBrowserRouter([
  // -------------------------------
  //         AUTH ROUTES
  // -------------------------------
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // -------------------------------
  //        ADMIN DASHBOARD
  // -------------------------------
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // Admin Protected Routes
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
    path: "/admin/payroll",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <EmployeePayroll />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/attendance",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/performance",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <Performance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/leave-management",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <LeaveManagement />
      </ProtectedRoute>
    ),
  },

  // -------------------------------
  //      DEPARTMENT HEAD ROUTES
  // -------------------------------
  {
    path: "/dept-head-dashboard",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <DeptHeadDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/team",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <EmployeeList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/attendance",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/leave-requests",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <LeaveManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dept-head/performance",
    element: (
      <ProtectedRoute roles={["dpt_head"]}>
        <Performance />
      </ProtectedRoute>
    ),
  },

  // -------------------------------
  //         EMPLOYEE ROUTES
  // -------------------------------
  {
    path: "/employee-dashboard",
    element: (
      <ProtectedRoute roles={["employee"]}>
        <EmployeeDashboard />
      </ProtectedRoute>
    ),
  },

  // ⭐ EMPLOYEE ATTENDANCE ROUTES
  {
    path: "/employee/mark-attendance",
    element: (
      <ProtectedRoute roles={["employee"]}>
        <MarkAttendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employee/attendance-history",
    element: (
      <ProtectedRoute roles={["employee"]}>
        <AttendanceHistory />
      </ProtectedRoute>
    ),
  },
  

  // -------------------------------
  //       UNAUTHORIZED PAGE
  // -------------------------------
  {
    path: "/unauthorized",
    element: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ color: "#dc2626" }}>Unauthorized Access</h1>
        <p>You don't have permission to access this page.</p>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: "5px",
            border: "none",
          }}
        >
          Back to Login
        </button>
      </div>
    ),
  },


  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
