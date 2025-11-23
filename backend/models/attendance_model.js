const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    checkIn: {
      type: String, // Example: "09:00:00"
      default: "",
    },

    checkOut: {
      type: String, // Example: "18:00:00"
      default: "",
    },

    status: {
      type: String,
      enum: ["present", "absent", "leave", "half-day"],
      required: true,
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("attendance", attendanceSchema);
