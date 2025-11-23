const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    empId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "unknown",
    },

    department: {
      type: String,
      default: "Unknown",
    },

    month: {
      type: String, // Format: "2025-01"
      required: true,
    },

    // Salary structure
    baseSalary: {
      type: Number,
      required: true,
    },

    workingDays: {
      type: Number,
      required: true,
    },

    presentDays: {
      type: Number,
      default: 0,
    },

    leaves: {
      type: Number,
      default: 0,
    },

    totalAbsentDays: {
      type: Number,
      default: 0,
    },

    totalHoursWorked: {
      type: Number,
      default: 0,
    },

    overtime: {
      type: Number,
      default: 0,
    },

    // Calculated parts
    absentDeductions: {
      type: Number,
      default: 0,
    },

    deductions: {
      type: Number,
      default: 0,
    },

    allowances: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "processed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);