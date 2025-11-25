

// // backend/routes/auth.js
// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const User = require("../models/user_model");
// const Employee = require("../models/employee_model");
// const OTP = require("../models/otp_model");
// const AuditLog = require("../models/audit_log");
// const { generateAccessTokenPayload } = require("../middleware/auth");
// const nodemailer = require("nodemailer");
// const cookieParser = require("cookie-parser");
// const PasswordReset = require("../models/password_reset_model");
// require("dotenv").config();

// router.use(cookieParser());

// const MAX_LOGIN_ATTEMPTS = 5;
// const LOCK_TIME = 15 * 60 * 1000;
// const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
// const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";
// const OTP_EXPIRES_MINUTES = 5;
// const RESET_TOKEN_EXPIRES = 60 * 60 * 1000; // 1 hour

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com", port: 587, secure: false,
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
// });

// const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
// const setRefreshTokenCookie = (res, token) => {
//   res.cookie("refreshToken", token, {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 7 * 24 * 60 * 60 * 1000
//   });
// };
// const clearRefreshCookie = (res) => {
//   res.clearCookie("refreshToken", { httpOnly: true, sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", secure: process.env.NODE_ENV === "production" });
// };

// // POST /auth/login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const ip = req.ip;
//     if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

//     const user = await User.findOne({ email: email.toLowerCase() }).populate("employeeId", "-passwordHash").exec();
//     if (!user || !user.active) {
//       await AuditLog.create({ action: "login-failed", ip, meta: { email } });
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     if (user.lockedUntil && user.lockedUntil > Date.now()) {
//       const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
//       return res.status(423).json({ success: false, message: `Account locked. Try after ${remaining} minutes.` });
//     }

//     const pwValid = await bcrypt.compare(password, user.passwordHash);
//     if (!pwValid) {
//       user.failedLoginAttempts += 1;
//       if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) user.lockedUntil = new Date(Date.now() + LOCK_TIME);
//       await user.save();
//       await AuditLog.create({ userId: user._id, action: "login-failed", ip });
//       return res.status(401).json({ success: false, message: "Invalid credentials", attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts) });
//     }

//     if (!user.employeeId || !user.employeeId.active) {
//       await AuditLog.create({ userId: user._id, action: "login-failed-inactive", ip });
//       return res.status(401).json({ success: false, message: "Employee account inactive" });
//     }

//     user.failedLoginAttempts = 0;
//     user.lockedUntil = null;
//     user.lastLogin = new Date();
//     await user.save();

//     // MFA: ONLY for role === 'admin'
//     if (user.role === "admin") {
//       const otpValue = (Math.floor(100000 + Math.random() * 900000)).toString();
//       const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
//       await OTP.create({ userId: user._id, otp: otpValue, expiresAt });

//       try {
//         const html = `<p>Hello ${user.employeeId.name || user.email},</p><p>Your HR System OTP is <b>${otpValue}</b>. It expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`;
//         await transporter.sendMail({ from: `"HR System" <${process.env.EMAIL_USER}>`, to: user.email, subject: "HR System OTP", html });
//       } catch (mailErr) {
//         console.error("OTP email error:", mailErr);
//       }

//       await AuditLog.create({ userId: user._id, action: "otp-sent", ip });
//       return res.status(200).json({ success: true, mfaRequired: true, message: "MFA required. OTP sent to registered email.", user: { id: user._id, email: user.email, role: user.role } });
//     }

//     // Non-admin login (employee or dpt_head): issue tokens
//     const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
//     const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
//     user.refreshTokenHash = hashToken(refreshToken);
//     await user.save();
//     setRefreshTokenCookie(res, refreshToken);
//     await AuditLog.create({ userId: user._id, action: "login-success", ip });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token: accessToken,
//       user: {
//         id: user._id, employeeId: user.employeeId._id, name: user.employeeId.name, email: user.email, role: user.role,
//         department: user.employeeId.department, position: user.employeeId.position, image: user.employeeId.image, lastLogin: user.lastLogin
//       }
//     });
//   } catch (err) {
//     console.error("login error", err);
//     return res.status(500).json({ success: false, message: "Login failed" });
//   }
// });

// // POST /auth/mfa/verify
// router.post("/mfa/verify", async (req, res) => {
//   try {
//     const { userId, otp } = req.body;
//     const ip = req.ip;
//     if (!userId || !otp) return res.status(400).json({ success: false, message: "Missing params" });

//     const user = await User.findById(userId).populate("employeeId", "-passwordHash");
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const otpRecord = await OTP.findOne({ userId: user._id, otp, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
//     if (!otpRecord) {
//       await AuditLog.create({ userId: user._id, action: "otp-failed", ip });
//       return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
//     }

//     otpRecord.used = true;
//     await otpRecord.save();

//     // issue tokens
//     const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
//     const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });

//     user.refreshTokenHash = hashToken(refreshToken);
//     await user.save();
//     setRefreshTokenCookie(res, refreshToken);
//     await AuditLog.create({ userId: user._id, action: "otp-verified", ip });

//     return res.status(200).json({
//       success: true,
//       message: "MFA verified",
//       token: accessToken,
//       user: {
//         id: user._id, employeeId: user.employeeId._id, name: user.employeeId.name, email: user.email, role: user.role,
//         department: user.employeeId.department, position: user.employeeId.position, image: user.employeeId.image, lastLogin: user.lastLogin
//       }
//     });
//   } catch (err) {
//     console.error("mfa verify err", err);
//     return res.status(500).json({ success: false, message: "MFA verify failed" });
//   }
// });

// // POST /auth/refresh-token
// router.post("/refresh-token", async (req, res) => {
//   try {
//     const token = req.cookies?.refreshToken;
//     const ip = req.ip;
//     if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

//     let payload;
//     try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET); } catch (e) { return res.status(401).json({ success: false, message: "Invalid refresh token" }); }

//     const user = await User.findById(payload.id);
//     if (!user) return res.status(401).json({ success: false, message: "Invalid user" });

//     const hashed = hashToken(token);
//     if (!user.refreshTokenHash || user.refreshTokenHash !== hashed) {
//       user.refreshTokenHash = null;
//       await user.save();
//       clearRefreshCookie(res);
//       await AuditLog.create({ userId: user._id, action: "refresh-token-failed", ip });
//       return res.status(401).json({ success: false, message: "Refresh token invalidated" });
//     }

//     // rotate refresh token
//     const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
//     const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });

//     user.refreshTokenHash = hashToken(newRefreshToken);
//     await user.save();
//     setRefreshTokenCookie(res, newRefreshToken);
//     await AuditLog.create({ userId: user._id, action: "token-refreshed", ip });

//     return res.status(200).json({ success: true, token: accessToken });
//   } catch (err) {
//     console.error("refresh error", err);
//     return res.status(500).json({ success: false, message: "Refresh failed" });
//   }
// });

// // POST /auth/logout
// router.post("/logout", async (req, res) => {
//   try {
//     const token = req.cookies?.refreshToken;
//     const ip = req.ip;
//     if (token) {
//       try {
//         const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
//         const user = await User.findById(payload.id);
//         if (user) {
//           user.refreshTokenHash = null;
//           await user.save();
//           await AuditLog.create({ userId: user._id, action: "logout", ip });
//         }
//       } catch (e) { /* ignore */ }
//     }
//     clearRefreshCookie(res);
//     return res.status(200).json({ success: true, message: "Logged out" });
//   } catch (err) {
//     console.error("logout err", err);
//     return res.status(500).json({ success: false, message: "Logout failed" });
//   }
// });

// // POST /auth/change-password
// router.post("/change-password", async (req, res) => {
//   try {
//     const header = req.headers.authorization;
//     const token = header && header.split(" ")[1];
//     if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { oldPassword, newPassword } = req.body;
//     if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "Old and new required" });
//     if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password min 8 chars" });

//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });

//     const valid = await bcrypt.compare(oldPassword, user.passwordHash);
//     if (!valid) return res.status(401).json({ success: false, message: "Current password incorrect" });

//     user.passwordHash = await bcrypt.hash(newPassword, 10);
//     user.refreshTokenHash = null;
//     await user.save();
//     clearRefreshCookie(res);
//     await AuditLog.create({ userId: user._id, action: "password-change", ip: req.ip });

//     return res.status(200).json({ success: true, message: "Password changed" });
//   } catch (err) {
//     console.error("change-password err", err);
//     return res.status(500).json({ success: false, message: "Change password failed" });
//   }
// });

// // POST /auth/forgot-password
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const ip = req.ip;

//     if (!email) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Email is required" 
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() })
//       .populate("employeeId", "name");

//     // Don't reveal if user exists or not (security best practice)
//     if (!user || !user.active) {
//       return res.status(200).json({ 
//         success: true, 
//         message: "If an account exists, a password reset link has been sent" 
//       });
//     }

//     // Generate secure reset token
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = hashToken(resetToken);

//     // Delete any existing reset tokens for this user
//     await PasswordReset.deleteMany({ userId: user._id });

//     // Create new reset token
//     const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES);
//     await PasswordReset.create({
//       userId: user._id,
//       token: hashedToken,
//       expiresAt
//     });

//     // Create reset URL
//     const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

//     // Send email
//     const htmlMessage = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #4f46e5;">Password Reset Request</h2>
//         <p>Hello ${user.employeeId?.name || user.email},</p>
//         <p>You requested to reset your password for the HR Management System.</p>
//         <p>Click the button below to reset your password:</p>
//         <div style="text-align: center; margin: 30px 0;">
//           <a href="${resetUrl}" 
//              style="background-color: #4f46e5; 
//                     color: white; 
//                     padding: 12px 30px; 
//                     text-decoration: none; 
//                     border-radius: 5px;
//                     display: inline-block;">
//             Reset Password
//           </a>
//         </div>
//         <p>Or copy and paste this link into your browser:</p>
//         <p style="color: #666; word-break: break-all;">${resetUrl}</p>
//         <p><strong>This link will expire in 1 hour.</strong></p>
//         <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
//         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//         <p style="color: #666; font-size: 12px;">
//           This is an automated message from HR Management System. Please do not reply to this email.
//         </p>
//       </div>
//     `;

//     try {
//       await transporter.sendMail({
//         from: `"HR System" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: "Password Reset Request - HR Management System",
//         html: htmlMessage,
//       });
//       console.log(`📧 Password reset email sent to ${user.email}`);
//     } catch (mailErr) {
//       console.error("⚠️ Failed to send reset email:", mailErr);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send reset email. Please try again later."
//       });
//     }

//     await AuditLog.create({
//       userId: user._id,
//       action: "password-reset-requested",
//       ip,
//       meta: { email: user.email }
//     });

//     return res.status(200).json({
//       success: true,
//       message: "If an account exists, a password reset link has been sent"
//     });

//   } catch (err) {
//     console.error("Forgot password error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to process password reset request"
//     });
//   }
// });

// // POST /auth/reset-password
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { token, email, newPassword } = req.body;
//     const ip = req.ip;

//     if (!token || !email || !newPassword) {
//       return res.status(400).json({
//         success: false,
//         message: "Token, email, and new password are required"
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 8 characters long"
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user || !user.active) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired reset token"
//       });
//     }

//     // Hash the token from URL and find matching reset request
//     const hashedToken = hashToken(token);
//     const resetRequest = await PasswordReset.findOne({
//       userId: user._id,
//       token: hashedToken,
//       used: false,
//       expiresAt: { $gt: new Date() }
//     });

//     if (!resetRequest) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired reset token"
//       });
//     }

//     // Update password
//     const passwordHash = await bcrypt.hash(newPassword, 10);
//     user.passwordHash = passwordHash;
//     user.refreshTokenHash = null; // Invalidate all sessions
//     user.failedLoginAttempts = 0;
//     user.lockedUntil = null;
//     await user.save();

//     // Mark token as used
//     resetRequest.used = true;
//     await resetRequest.save();

//     // Clear any other pending reset tokens
//     await PasswordReset.deleteMany({
//       userId: user._id,
//       _id: { $ne: resetRequest._id }
//     });

//     await AuditLog.create({
//       userId: user._id,
//       action: "password-reset-completed",
//       ip,
//       meta: { email: user.email }
//     });

//     // Send confirmation email
//     try {
//       const htmlMessage = `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4f46e5;">Password Successfully Reset</h2>
//           <p>Hello ${user.employeeId?.name || user.email},</p>
//           <p>Your password has been successfully reset for the HR Management System.</p>
//           <p>You can now log in with your new password.</p>
//           <p>If you didn't make this change, please contact support immediately.</p>
//           <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//           <p style="color: #666; font-size: 12px;">
//             This is an automated message from HR Management System.
//           </p>
//         </div>
//       `;

//       await transporter.sendMail({
//         from: `"HR System" <${process.env.EMAIL_USER}>`,
//         to: user.email,
//         subject: "Password Reset Successful - HR Management System",
//         html: htmlMessage,
//       });
//     } catch (mailErr) {
//       console.error("⚠️ Failed to send confirmation email:", mailErr);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Password has been reset successfully. You can now log in."
//     });

//   } catch (err) {
//     console.error("Reset password error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to reset password"
//     });
//   }
// });

// // GET /auth/verify-reset-token
// router.get("/verify-reset-token", async (req, res) => {
//   try {
//     const { token, email } = req.query;

//     if (!token || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Token and email are required"
//       });
//     }

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid reset token"
//       });
//     }

//     const hashedToken = hashToken(token);
//     const resetRequest = await PasswordReset.findOne({
//       userId: user._id,
//       token: hashedToken,
//       used: false,
//       expiresAt: { $gt: new Date() }
//     });

//     if (!resetRequest) {
//       return res.status(400).json({
//         success: false,
//         message: "Reset token has expired or is invalid"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Token is valid"
//     });

//   } catch (err) {
//     console.error("Verify token error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to verify token"
//     });
//   }
// });

// module.exports = router;


// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user_model");
const Employee = require("../models/employee_model");
const OTP = require("../models/otp_model");
const AuditLog = require("../models/audit_log");
const { generateAccessTokenPayload } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const PasswordReset = require("../models/password_reset_model");
require("dotenv").config();

router.use(cookieParser());

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";
const OTP_EXPIRES_MINUTES = 5;
const RESET_TOKEN_EXPIRES = 60 * 60 * 1000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", port: 587, secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", { 
    httpOnly: true, 
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", 
    secure: process.env.NODE_ENV === "production" 
  });
};

// Helper function to format user response consistently
const formatUserResponse = (user) => {
  if (!user.employeeId) {
    throw new Error("Employee data not populated");
  }
  
  return {
    id: user._id,
    employeeId: user.employeeId._id,  // THIS IS THE KEY - Always use _id from populated employeeId
    name: user.employeeId.name,
    email: user.email,
    role: user.role,
    department: user.employeeId.department,
    position: user.employeeId.position,
    image: user.employeeId.image,
    lastLogin: user.lastLogin
  };
};

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password required" 
      });
    }

    // IMPORTANT: Always populate employeeId
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate("employeeId", "-passwordHash")
      .exec();
      
    if (!user || !user.active) {
      await AuditLog.create({ action: "login-failed", ip, meta: { email } });
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        success: false, 
        message: `Account locked. Try after ${remaining} minutes.` 
      });
    }

    // Verify password
    const pwValid = await bcrypt.compare(password, user.passwordHash);
    if (!pwValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_TIME);
      }
      await user.save();
      await AuditLog.create({ userId: user._id, action: "login-failed", ip });
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials", 
        attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts) 
      });
    }

    // Check if employee is active
    if (!user.employeeId || !user.employeeId.active) {
      await AuditLog.create({ userId: user._id, action: "login-failed-inactive", ip });
      return res.status(401).json({ 
        success: false, 
        message: "Employee account inactive" 
      });
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    console.log("🔐 User authenticated:", user.email, "EmployeeId:", user.employeeId._id);

    // MFA: ONLY for role === 'admin'
    if (user.role === "admin") {
      const otpValue = (Math.floor(100000 + Math.random() * 900000)).toString();
      const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
      await OTP.create({ userId: user._id, otp: otpValue, expiresAt });

      try {
        const html = `<p>Hello ${user.employeeId.name || user.email},</p><p>Your HR System OTP is <b>${otpValue}</b>. It expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`;
        await transporter.sendMail({ 
          from: `"HR System" <${process.env.EMAIL_USER}>`, 
          to: user.email, 
          subject: "HR System OTP", 
          html 
        });
        console.log("📧 OTP sent to:", user.email);
      } catch (mailErr) {
        console.error("OTP email error:", mailErr);
      }

      await AuditLog.create({ userId: user._id, action: "otp-sent", ip });
      
      return res.status(200).json({ 
        success: true, 
        mfaRequired: true, 
        message: "MFA required. OTP sent to registered email.", 
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role 
        } 
      });
    }

    // Non-admin login: issue tokens immediately
    const accessToken = jwt.sign(
      generateAccessTokenPayload(user), 
      process.env.JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );
    
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    
    setRefreshTokenCookie(res, refreshToken);
    await AuditLog.create({ userId: user._id, action: "login-success", ip });

    const userResponse = formatUserResponse(user);
    console.log("✅ Login successful - Sending user data:", userResponse);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: userResponse
    });
    
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Login failed" 
    });
  }
});

// POST /auth/mfa/verify
router.post("/mfa/verify", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const ip = req.ip;
    
    if (!userId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing params" 
      });
    }

    // IMPORTANT: Always populate employeeId
    const user = await User.findById(userId)
      .populate("employeeId", "-passwordHash")
      .exec();
      
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("🔓 MFA verification for user:", user.email, "EmployeeId:", user.employeeId._id);

    const otpRecord = await OTP.findOne({ 
      userId: user._id, 
      otp, 
      used: false, 
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 });
    
    if (!otpRecord) {
      await AuditLog.create({ userId: user._id, action: "otp-failed", ip });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired OTP" 
      });
    }

    otpRecord.used = true;
    await otpRecord.save();

    // Issue tokens
    const accessToken = jwt.sign(
      generateAccessTokenPayload(user), 
      process.env.JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    
    setRefreshTokenCookie(res, refreshToken);
    await AuditLog.create({ userId: user._id, action: "otp-verified", ip });

    const userResponse = formatUserResponse(user);
    console.log("✅ MFA verified - Sending user data:", userResponse);

    return res.status(200).json({
      success: true,
      message: "MFA verified",
      token: accessToken,
      user: userResponse
    });
    
  } catch (err) {
    console.error("❌ MFA verify error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "MFA verify failed" 
    });
  }
});

// POST /auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const ip = req.ip;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No refresh token" 
      });
    }

    let payload;
    try { 
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET); 
    } catch (e) { 
      return res.status(401).json({ 
        success: false, 
        message: "Invalid refresh token" 
      }); 
    }

    const user = await User.findById(payload.id)
      .populate("employeeId", "-passwordHash")
      .exec();
      
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid user" 
      });
    }

    const hashed = hashToken(token);
    if (!user.refreshTokenHash || user.refreshTokenHash !== hashed) {
      user.refreshTokenHash = null;
      await user.save();
      clearRefreshCookie(res);
      await AuditLog.create({ userId: user._id, action: "refresh-token-failed", ip });
      return res.status(401).json({ 
        success: false, 
        message: "Refresh token invalidated" 
      });
    }

    // Rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );
    
    const accessToken = jwt.sign(
      generateAccessTokenPayload(user), 
      process.env.JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();
    
    setRefreshTokenCookie(res, newRefreshToken);
    await AuditLog.create({ userId: user._id, action: "token-refreshed", ip });

    console.log("🔄 Token refreshed for user:", user.email);

    return res.status(200).json({ 
      success: true, 
      token: accessToken 
    });
    
  } catch (err) {
    console.error("❌ Refresh error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Refresh failed" 
    });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const ip = req.ip;
    
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (user) {
          user.refreshTokenHash = null;
          await user.save();
          await AuditLog.create({ userId: user._id, action: "logout", ip });
          console.log("👋 User logged out:", user.email);
        }
      } catch (e) { 
        console.log("Token verification failed during logout");
      }
    }
    
    clearRefreshCookie(res);
    return res.status(200).json({ 
      success: true, 
      message: "Logged out" 
    });
    
  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Logout failed" 
    });
  }
});

// POST /auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Old and new password required" 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters" 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password incorrect" 
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.refreshTokenHash = null;
    await user.save();
    
    clearRefreshCookie(res);
    await AuditLog.create({ userId: user._id, action: "password-change", ip: req.ip });

    console.log("🔑 Password changed for user:", user.email);

    return res.status(200).json({ 
      success: true, 
      message: "Password changed" 
    });
    
  } catch (err) {
    console.error("❌ Change password error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Change password failed" 
    });
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate("employeeId", "name");

    if (!user || !user.active) {
      return res.status(200).json({ 
        success: true, 
        message: "If an account exists, a password reset link has been sent" 
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(resetToken);

    await PasswordReset.deleteMany({ userId: user._id });

    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES);
    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello ${user.employeeId?.name || user.email},</p>
        <p>You requested to reset your password for the HR Management System.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4f46e5; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from HR Management System. Please do not reply to this email.
        </p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"HR System" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Request - HR Management System",
        html: htmlMessage,
      });
      console.log("📧 Password reset email sent to:", user.email);
    } catch (mailErr) {
      console.error("⚠️ Failed to send reset email:", mailErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later."
      });
    }

    await AuditLog.create({
      userId: user._id,
      action: "password-reset-requested",
      ip,
      meta: { email: user.email }
    });

    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent"
    });

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request"
    });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    const ip = req.ip;

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.active) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const hashedToken = hashToken(token);
    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.refreshTokenHash = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    resetRequest.used = true;
    await resetRequest.save();

    await PasswordReset.deleteMany({
      userId: user._id,
      _id: { $ne: resetRequest._id }
    });

    await AuditLog.create({
      userId: user._id,
      action: "password-reset-completed",
      ip,
      meta: { email: user.email }
    });

    try {
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Password Successfully Reset</h2>
          <p>Hello ${user.email},</p>
          <p>Your password has been successfully reset for the HR Management System.</p>
          <p>You can now log in with your new password.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from HR Management System.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `"HR System" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Password Reset Successful - HR Management System",
        html: htmlMessage,
      });
    } catch (mailErr) {
      console.error("⚠️ Failed to send confirmation email:", mailErr);
    }

    console.log("🔑 Password reset completed for user:", user.email);

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in."
    });

  } catch (err) {
    console.error("❌ Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
});

// GET /auth/verify-reset-token
router.get("/verify-reset-token", async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    const hashedToken = hashToken(token);
    const resetRequest = await PasswordReset.findOne({
      userId: user._id,
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired or is invalid"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid"
    });

  } catch (err) {
    console.error("❌ Verify token error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to verify token"
    });
  }
});

module.exports = router;
