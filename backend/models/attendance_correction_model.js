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
  date: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminComment: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("AttendanceCorrection", attendanceCorrectionSchema);
