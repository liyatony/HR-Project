// backend/models/password_reset_model.js
const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true 
  },
  used: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Index for faster queries and automatic cleanup
passwordResetSchema.index({ userId: 1, token: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

module.exports = mongoose.model("PasswordReset", passwordResetSchema);