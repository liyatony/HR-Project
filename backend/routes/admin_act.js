// backend/routes/admin_act.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomPass = require("../utils/password_generater");

// Models
const Employee = require("../models/employee_model");
const Attendance = require("../models/attendance_model");
const AttendanceCorrection = require("../models/attendance_correction_model");
const Payroll = require("../models/payroll_model");
const User = require("../models/user_model");

const { verifyAccessToken, isAdmin, isDeptHead } = require("../middleware/auth");
require("dotenv").config();

/* ------------------------------------------------------------
   MAIL SETUP
------------------------------------------------------------ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ------------------------------------------------------------
   MULTER CONFIG
------------------------------------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`),
});
const upload = multer({ storage });

/* ============================================================
                    EMPLOYEE MANAGEMENT
============================================================ */
router.get("/employees", verifyAccessToken, isDeptHead, async (req, res) => {
  const employees = await Employee.find().select("-passwordHash");
  res.json({ success: true, data: employees });
});

/* ============================================================
                    ATTENDANCE CORRECTIONS
============================================================ */

// GET: all correction requests
router.get(
  "/attendance-corrections",
  verifyAccessToken,
  isAdmin,
  async (req, res) => {
    const list = await AttendanceCorrection.find()
      .populate("employeeId", "name email")
      .populate("attendanceId");

    res.json({ success: true, data: list });
  }
);

// APPROVE correction request
router.put(
  "/attendance-corrections/:id/approve",
  verifyAccessToken,
  isAdmin,
  async (req, res) => {
    const { checkIn, checkOut, status } = req.body;
    const reqObj = await AttendanceCorrection.findById(req.params.id);

    if (!reqObj)
      return res.status(404).json({ success: false, message: "Request not found" });

    reqObj.status = "approved";
    await reqObj.save();

    const att = await Attendance.findById(reqObj.attendanceId);
    if (att) {
      if (checkIn) att.checkIn = checkIn;
      if (checkOut) att.checkOut = checkOut;
      if (status) att.status = status;
      await att.save();
    }

    res.json({ success: true, message: "Correction approved" });
  }
);

// REJECT correction request
router.put(
  "/attendance-corrections/:id/reject",
  verifyAccessToken,
  isAdmin,
  async (req, res) => {
    const reqObj = await AttendanceCorrection.findById(req.params.id);

    if (!reqObj)
      return res.status(404).json({ success: false, message: "Request not found" });

    reqObj.status = "rejected";
    await reqObj.save();

    res.json({ success: true, message: "Correction rejected" });
  }
);

module.exports = router;
