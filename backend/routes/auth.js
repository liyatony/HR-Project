

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
require("dotenv").config();

router.use(cookieParser());

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";
const OTP_EXPIRES_MINUTES = 5;

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
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", secure: process.env.NODE_ENV === "production" });
};

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() }).populate("employeeId", "-passwordHash").exec();
    if (!user || !user.active) {
      await AuditLog.create({ action: "login-failed", ip, meta: { email } });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Account locked. Try after ${remaining} minutes.` });
    }

    const pwValid = await bcrypt.compare(password, user.passwordHash);
    if (!pwValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) user.lockedUntil = new Date(Date.now() + LOCK_TIME);
      await user.save();
      await AuditLog.create({ userId: user._id, action: "login-failed", ip });
      return res.status(401).json({ success: false, message: "Invalid credentials", attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts) });
    }

    if (!user.employeeId || !user.employeeId.active) {
      await AuditLog.create({ userId: user._id, action: "login-failed-inactive", ip });
      return res.status(401).json({ success: false, message: "Employee account inactive" });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // MFA: ONLY for role === 'admin'
    if (user.role === "admin") {
      const otpValue = (Math.floor(100000 + Math.random() * 900000)).toString();
      const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
      await OTP.create({ userId: user._id, otp: otpValue, expiresAt });

      try {
        const html = `<p>Hello ${user.employeeId.name || user.email},</p><p>Your HR System OTP is <b>${otpValue}</b>. It expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`;
        await transporter.sendMail({ from: `"HR System" <${process.env.EMAIL_USER}>`, to: user.email, subject: "HR System OTP", html });
      } catch (mailErr) {
        console.error("OTP email error:", mailErr);
      }

      await AuditLog.create({ userId: user._id, action: "otp-sent", ip });
      return res.status(200).json({ success: true, mfaRequired: true, message: "MFA required. OTP sent to registered email.", user: { id: user._id, email: user.email, role: user.role } });
    }

    // Non-admin login (employee or dpt_head): issue tokens
    const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    setRefreshTokenCookie(res, refreshToken);
    await AuditLog.create({ userId: user._id, action: "login-success", ip });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: accessToken,
      user: {
        id: user._id, employeeId: user.employeeId._id, name: user.employeeId.name, email: user.email, role: user.role,
        department: user.employeeId.department, position: user.employeeId.position, image: user.employeeId.image, lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
});

// POST /auth/mfa/verify
router.post("/mfa/verify", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const ip = req.ip;
    if (!userId || !otp) return res.status(400).json({ success: false, message: "Missing params" });

    const user = await User.findById(userId).populate("employeeId", "-passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otpRecord = await OTP.findOne({ userId: user._id, otp, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!otpRecord) {
      await AuditLog.create({ userId: user._id, action: "otp-failed", ip });
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    otpRecord.used = true;
    await otpRecord.save();

    // issue tokens
    const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    setRefreshTokenCookie(res, refreshToken);
    await AuditLog.create({ userId: user._id, action: "otp-verified", ip });

    return res.status(200).json({
      success: true,
      message: "MFA verified",
      token: accessToken,
      user: {
        id: user._id, employeeId: user.employeeId._id, name: user.employeeId.name, email: user.email, role: user.role,
        department: user.employeeId.department, position: user.employeeId.position, image: user.employeeId.image, lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error("mfa verify err", err);
    return res.status(500).json({ success: false, message: "MFA verify failed" });
  }
});

// POST /auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const ip = req.ip;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    let payload;
    try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET); } catch (e) { return res.status(401).json({ success: false, message: "Invalid refresh token" }); }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, message: "Invalid user" });

    const hashed = hashToken(token);
    if (!user.refreshTokenHash || user.refreshTokenHash !== hashed) {
      user.refreshTokenHash = null;
      await user.save();
      clearRefreshCookie(res);
      await AuditLog.create({ userId: user._id, action: "refresh-token-failed", ip });
      return res.status(401).json({ success: false, message: "Refresh token invalidated" });
    }

    // rotate refresh token
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
    const accessToken = jwt.sign(generateAccessTokenPayload(user), process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();
    setRefreshTokenCookie(res, newRefreshToken);
    await AuditLog.create({ userId: user._id, action: "token-refreshed", ip });

    return res.status(200).json({ success: true, token: accessToken });
  } catch (err) {
    console.error("refresh error", err);
    return res.status(500).json({ success: false, message: "Refresh failed" });
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
        }
      } catch (e) { /* ignore */ }
    }
    clearRefreshCookie(res);
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("logout err", err);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
});

// POST /auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "Old and new required" });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password min 8 chars" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: "Current password incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.refreshTokenHash = null;
    await user.save();
    clearRefreshCookie(res);
    await AuditLog.create({ userId: user._id, action: "password-change", ip: req.ip });

    return res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    console.error("change-password err", err);
    return res.status(500).json({ success: false, message: "Change password failed" });
  }
});

module.exports = router;
