

// backend/models/user_model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["employee", "admin", "dpt_head"], required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    refreshTokenHash: { type: String, default: null },
    mfaEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });

module.exports = mongoose.model("User", userSchema);
