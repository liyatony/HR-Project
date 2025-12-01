const mongoose = require("mongoose");

const attendanceCorrectionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },

  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "attendance",
    required: true,
  },

  // The date of the attendance entry
  date: {
    type: String,
    required: true,
  },

  // ORIGINAL attendance data (for admin reference)
  previousCheckIn: {
    type: String,
    default: "",
  },
  previousCheckOut: {
    type: String,
    default: "",
  },
  previousStatus: {
    type: String,
    enum: ["present", "absent", "leave"],
    default: "absent",
  },

  // EMPLOYEE REQUESTED new data
  requestedCheckIn: {
    type: String,
    default: "",
  },
  requestedCheckOut: {
    type: String,
    default: "",
  },
  requestedStatus: {
    type: String,
    enum: ["present", "absent", "leave"],
    default: "present",
  },

  // Reason employee gives
  reason: {
    type: String,
    required: true,
  },

  // Admin decision: pending / approved / rejected
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // Admin can add a comment (optional)
  adminComment: {
    type: String,
    default: "",
  },

}, { timestamps: true });

module.exports = mongoose.model("AttendanceCorrection", attendanceCorrectionSchema);
