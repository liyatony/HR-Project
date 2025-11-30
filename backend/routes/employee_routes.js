const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Attendance = require("../models/attendance_model");
const Payroll = require("../models/payroll_model");
const Employee = require("../models/employee_model");
const Leave = require("../models/Leave_model");
const Holiday = require("../models/Holiday_model");
const AttendanceCorrection = require("../models/attendance_correction_model"); // <-- IMPORTANT FIX

const { verifyAccessToken } = require("../middleware/auth");

/* -------------------------------------------------------
   Convert received employeeId to ObjectId safely
--------------------------------------------------------*/
function getObjectId(id) {
  try {
    if (typeof id === "object" && id._id)
      return new mongoose.Types.ObjectId(id._id);
    return new mongoose.Types.ObjectId(id);
  } catch {
    return id;
  }
}

/* -------------------------------------------------------
   Ensure Today Attendance Exists
--------------------------------------------------------*/
async function ensureTodayAttendance(employeeId, employeeName) {
  const today = new Date().toISOString().split("T")[0];

  let record = await Attendance.findOne({ employeeId, date: today });
  if (record) return record;

  // Auto detect holiday
  const holiday = await Holiday.findOne({ date: today });
  if (holiday) {
    return Attendance.create({
      employeeId,
      employeeName,
      date: today,
      status: "leave",
      isHoliday: true,
      holidayName: holiday.name,
    });
  }

  // Auto detect leave
  const leaveApplied = await Leave.findOne({
    employeeId,
    status: "approved",
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  if (leaveApplied) {
    return Attendance.create({
      employeeId,
      employeeName,
      date: today,
      status: "leave",
      leaveId: leaveApplied._id,
    });
  }

  // Default absent entry
  return Attendance.create({
    employeeId,
    employeeName,
    date: today,
    status: "absent",
  });
}

/* -------------------------------------------------------
   My Attendance Summary (Dashboard)
--------------------------------------------------------*/
router.get("/my-attendance", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);

    const summary = await Attendance.aggregate([
      { $match: { employeeId } },
      {
        $group: {
          _id: null,
          totalPresent: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          totalAbsent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          totalLeaves: {
            $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data:
        summary[0] || { totalPresent: 0, totalAbsent: 0, totalLeaves: 0 },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
});

/* -------------------------------------------------------
   GET: Attendance Records (Filter By Month)
--------------------------------------------------------*/
router.get("/my-attendance-records", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);

    const filter = { employeeId };

    if (req.query.month) {
      const start = new Date(`${req.query.month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      filter.date = {
        $gte: start.toISOString().split("T")[0],
        $lte: end.toISOString().split("T")[0],
      };
    }

    const data = await Attendance.find(filter).sort({ date: -1 });

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch records" });
  }
});

/* -------------------------------------------------------
   POST: Mark Check-In
--------------------------------------------------------*/
router.post("/mark-attendance", verifyAccessToken, async (req, res) => {
  try {
    const employeeName = req.user.name;
    const employeeId = getObjectId(req.user.employeeId);
    const { date, checkIn } = req.body;

    let record = await Attendance.findOne({ employeeId, date });

    if (!record)
      record = await ensureTodayAttendance(employeeId, employeeName);

    if (record.checkIn)
      return res.status(400).json({ success: false, message: "Already checked in" });

    record.checkIn = checkIn;
    record.status = "present";
    await record.save();

    res.json({ success: true, message: "Check-in successful", data: record });
  } catch {
    res.status(500).json({ success: false, message: "Check-in failed" });
  }
});

/* -------------------------------------------------------
   PUT: Mark Check-Out
--------------------------------------------------------*/
router.put("/mark-attendance/:id", verifyAccessToken, async (req, res) => {
  try {
    const { checkOut } = req.body;

    const record = await Attendance.findById(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, message: "Record not found" });

    record.checkOut = checkOut;

    if (record.checkIn) {
      const [h1, m1] = record.checkIn.split(":").map(Number);
      const [h2, m2] = checkOut.split(":").map(Number);

      const total = h2 * 60 + m2 - (h1 * 60 + m1);
      record.totalHours = total / 60;
      record.overtimeHours = record.totalHours > 8 ? record.totalHours - 8 : 0;
    }

    await record.save();

    res.json({ success: true, message: "Check-out updated", data: record });
  } catch {
    res.status(500).json({ success: false, message: "Check-out failed" });
  }
});

/* -------------------------------------------------------
   POST: Attendance Correction Request
--------------------------------------------------------*/
router.post("/my-attendance-correction", verifyAccessToken, async (req, res) => {
  try {
    const { attendanceId, reason } = req.body;

    if (!attendanceId || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Attendance ID & reason required",
      });
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res
        .status(404)
        .json({ success: false, message: "Attendance record not found" });
    }

    // Prevent duplicate request
    const exists = await AttendanceCorrection.findOne({
      attendanceId,
      status: "pending",
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Correction already requested for this date",
      });
    }

    await AttendanceCorrection.create({
      employeeId: req.user.employeeId,
      attendanceId,
      date: attendance.date,
      reason,
    });

    res.json({ success: true, message: "Correction request submitted" });
  } catch {
    res.status(500).json({ success: false, message: "Request failed" });
  }
});

/* -------------------------------------------------------
   Dashboard Summary
--------------------------------------------------------*/
router.get("/dashboard-summary", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);

    const summary = await Attendance.aggregate([
      { $match: { employeeId } },
      {
        $group: {
          _id: null,
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          leaves: {
            $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: summary[0] || { present: 0, absent: 0, leaves: 0 },
    });
  } catch {
    res.status(500).json({ success: false, message: "Summary fetch failed" });
  }
});

module.exports = router;
