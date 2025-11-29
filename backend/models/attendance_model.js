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

    date: { type: String, required: true },

    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },

    status: {
      type: String,
      enum: ["present", "absent", "leave", "half-day"],
      default: "absent",
    },

    totalHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },

    isLate: { type: Boolean, default: false },

    isHoliday: { type: Boolean, default: false },
    holidayName: { type: String, default: "" },

    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      default: null,
    },

    correctionRequested: { type: Boolean, default: false },
    correctionReason: { type: String, default: "" },
    correctionStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", ""],
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
