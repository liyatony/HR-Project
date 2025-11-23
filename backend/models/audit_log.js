// backend/models/audit_log.js
const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  action: { type: String, required: true }, // login-success, login-failed, otp-sent, otp-verified, token-refreshed, logout, password-change
  ip: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditSchema);
