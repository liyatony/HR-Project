// backend/routes/admin_attendance_routes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance_model");
const AttendanceCorrection = require("../models/attendance_correction_model");
const { verifyAccessToken, isAdmin } = require("../middleware/auth");

// LIST ALL correction requests
router.get("/attendance-corrections", verifyAccessToken, isAdmin, async (req, res) => {
  const list = await AttendanceCorrection.find().populate("employeeId", "name");
  res.json({ success: true, data: list });
});

// APPROVE correction
router.put("/attendance-corrections/:id/approve", verifyAccessToken, isAdmin, async (req, res) => {
  const reqId = req.params.id;
  const { checkIn, checkOut, status } = req.body;

  const correction = await AttendanceCorrection.findById(reqId);
  if (!correction) return res.status(404).json({ message: "Not found" });

  correction.status = "approved";
  await correction.save();

  // update attendance record
  const att = await Attendance.findById(correction.attendanceId);
  if (att) {
    if (checkIn) att.checkIn = checkIn;
    if (checkOut) att.checkOut = checkOut;
    if (status) att.status = status;
    await att.save();
  }

  res.json({ success: true, message: "Correction approved" });
});

// REJECT correction
router.put("/attendance-corrections/:id/reject", verifyAccessToken, isAdmin, async (req, res) => {
  const reqId = req.params.id;
  const correction = await AttendanceCorrection.findById(reqId);
  correction.status = "rejected";
  await correction.save();

  res.json({ success: true, message: "Correction rejected" });
});

module.exports = router;
