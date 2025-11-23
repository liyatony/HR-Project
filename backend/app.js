
// backend/app.js
const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4300;
require("./config/bd_employee");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// CORS Configuration
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploaded files
app.use("/uploads", express.static("uploads"));

// Import Routes
const admin_route = require("./routes/admin_act");
const auth_route = require("./routes/auth");
const employee_personal_route = require("./routes/employee_routes");
const dept_head_route = require("./routes/dept_head_routes");

// Mount Routes
app.use("/auth", auth_route); // Authentication routes - FIRST
app.use("/emp", admin_route); // Admin routes for employee management
app.use("/emp", employee_personal_route); // Employee personal routes (my-attendance, my-payslips, etc)
app.use("/dept", dept_head_route); // Department head routes

// Health Check
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "HR Management System API is running",
    version: "1.0.0"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});