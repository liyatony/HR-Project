const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Attendance = require("../models/attendance_model");
const Payroll = require("../models/payroll_model");
const Employee = require("../models/employee_model");
const Leave = require("../models/Leave_model");
const Holiday = require("../models/Holiday_model");
const AttendanceCorrection = require("../models/attendance_correction_model"); 

const { verifyAccessToken } = require("../middleware/auth");

function getObjectId(id) {
  try {
    if (typeof id === "object" && id._id)
      return new mongoose.Types.ObjectId(id._id);
    return new mongoose.Types.ObjectId(id);
  } catch {
    return id;
  }
}


router.get("/my-today-attendance", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);
    const employeeName = req.user.name;

    const record = await ensureTodayAttendance(employeeId, employeeName);

    res.json({ success: true, data: record });
  } catch (err) {
    console.error("Today Attendance Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch today" });
  }
});


   // Today Attendance Exists

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

   //my attendance summary

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


   //GET: Attendance Records

router.get("/my-attendance-records", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);
    const filter = { employeeId };

  if (req.query.month && req.query.month !== "all") {
  const start = new Date(`${req.query.month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  filter.createdAt = { $gte: start, $lt: end };
}

    const data = await Attendance.find(filter).sort({ date: -1 });

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch records" });
  }
});


   //GET: Last 7 Days Attendance

router.get("/my-last-7-days", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = getObjectId(req.user.employeeId);
    const employeeName = req.user.name;

    const results = [];

    // Always use LOCAL date (prevents timezone duplicates)
    function formatLocalDate(dateObj) {
      dateObj.setHours(0, 0, 0, 0);
      return dateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD
    }

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() - i);

      const date = formatLocalDate(dateObj);

      // STEP 1: Try exact match
      let record = await Attendance.findOne({ employeeId, date });

      // STEP 2: Try regex match (fixes duplicate creation issue)
      if (!record) {
        record = await Attendance.findOne({
          employeeId,
          date: { $regex: new RegExp(date) },
        });
      }

      // STEP 3: If still no record → create ABSENT/LEAVE/HOLIDAY
      if (!record) {
        // Holiday
        const holiday = await Holiday.findOne({ date });
        if (holiday) {
          record = await Attendance.create({
            employeeId,
            employeeName,
            date,
            status: "leave",
            isHoliday: true,
            holidayName: holiday.name,
            checkIn: "",
            checkOut: "",
            totalHours: 0,
          });
        } else {
          // Approved Leave
          const leaveApplied = await Leave.findOne({
            employeeId,
            status: "approved",
            startDate: { $lte: date },
            endDate: { $gte: date },
          });

          if (leaveApplied) {
            record = await Attendance.create({
              employeeId,
              employeeName,
              date,
              status: "leave",
              leaveId: leaveApplied._id,
              checkIn: "",
              checkOut: "",
              totalHours: 0,
            });
          } else {
            // Default: ABSENT
            record = await Attendance.create({
              employeeId,
              employeeName,
              date,
              status: "absent",
              checkIn: "",
              checkOut: "",
              totalHours: 0,
            });
          }
        }
      }

      results.push(record);
    }

    results.sort((a, b) => (a.date < b.date ? 1 : -1));

    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Error last 7 days:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch last 7 days",
    });
  }
});


//mark check in
router.post("/mark-attendance", verifyAccessToken, async (req, res) => {
  try {
    const employeeName = req.user.name;
    const employeeId = getObjectId(req.user.employeeId);

    // Always use today's date (not req.body.date)
    const today = new Date().toISOString().split("T")[0];

    // Fetch or auto-create Absent/Leave/Holiday attendance
    let record = await Attendance.findOne({ employeeId, date: today });

    if (!record) {
      record = await ensureTodayAttendance(employeeId, employeeName);
    }

    // Already checked in
    if (record.checkIn && record.checkIn !== "") {
      return res.status(400).json({
        success: false,
        message: "Already checked in",
      });
    }

    // Get current time
    const now = new Date();
    const checkInTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Update record
    record.checkIn = checkInTime;
    record.status = "present";

    await record.save();

    res.json({
      success: true,
      message: "Check-in successful",
      data: record,
    });

  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ success: false, message: "Check-in failed" });
  }
});


//mark checkout
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

router.post("/my-attendance-correction", verifyAccessToken, async (req, res) => {
  try {
    const { attendanceId, reason, requestedCheckIn, requestedCheckOut, requestedStatus } = req.body;
    const employeeId = getObjectId(req.user.employeeId);

    // Validation
    if (!attendanceId || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Attendance ID & reason required" });
    }

    // Fetch attendance record
    const attendance = await Attendance.findOne({ _id: attendanceId, employeeId });
    if (!attendance) {
      return res.status(404).json({ success: false, message: "Attendance record not found" });
    }

    // Prevent duplicate pending request
    const exists = await AttendanceCorrection.findOne({
      attendanceId,
      employeeId,
      status: "pending",
    });

    if (exists) {
      return res.status(400).json({ success: false, message: "A correction request is already pending for this date." });
    }

    // Save correction request
    await AttendanceCorrection.create({
      employeeId,
      attendanceId,
      date: attendance.date,

      previousCheckIn: attendance.checkIn || "",
      previousCheckOut: attendance.checkOut || "",
      previousStatus: attendance.status || "absent",

      requestedCheckIn,
      requestedCheckOut,
      requestedStatus,

      reason,
    });

    res.json({ success: true, message: "Correction request submitted successfully." });

  } catch (err) {
    console.error("Correction Request Error:", err);
    res.status(500).json({ success: false, message: "Failed to submit correction request" });
  }
});

//dashboard summary
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
