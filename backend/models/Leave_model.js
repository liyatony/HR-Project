const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },

  reason: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
