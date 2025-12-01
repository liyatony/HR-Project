// backend/routes/admin_attendance_routes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance_model");
const AttendanceCorrection = require("../models/attendance_correction_model");
const { verifyAccessToken, isAdmin, isDeptHead } = require("../middleware/auth");

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


// NEW

// router.get(
//   "/attendance_records",
//   verifyAccessToken,
//   isDeptHead,
//   async (req, res) => {
//     try {
//       const { date } = req.query;
//       const user = req.user; // comes from JWT

//       if (!date) {
//         return res.status(400).json({
//           success: false,
//           message: "Date parameter required (YYYY-MM-DD)",
//         });
//       }

//       const iso = date + "T00:00:00.000Z";

//       let filter = { date: iso };

//       // ✅ If department head → only their department
//       if (user.role === "dpt_head") {
//         filter["employeeId.department"] = user.department;
//       }

//       // ✅ If employee → only their own records
//       if (user.role === "employee") {
//         filter.employeeId = user.employeeId;
//       }

//       // Admin sees all → no filter added

//       const data = await Attendance.find(filter).populate(
//         "employeeId",
//         "department employeeId name"
//       );

//       res.status(200).json({
//         success: true,
//         message: "Filtered attendance records fetched",
//         data,
//       });
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch attendance records",
//         error: err.message,
//       });
//     }
//   }
// );
router.get(
  "/attendance_records",
  verifyAccessToken,
  async (req, res) => {
    try {
      const { date } = req.query;
      const user = req.user;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date parameter required (YYYY-MM-DD)",
        });
      }

      const iso = date + "T00:00:00.000Z";

      // Fetch all attendance for the date
      let records = await Attendance.find({ date: iso })
        .populate("employeeId", "name department");

      // Apply filtering
      if (user.role === "dpt_head") {
        records = records.filter(
          (r) => r.employeeId?.department === user.department
        );
      }

      if (user.role === "employee") {
        records = records.filter(
          (r) => String(r.employeeId?._id) === String(user.employeeId)
        );
      }

      // Admin: no filtering

      return res.status(200).json({
        success: true,
        message: "Filtered attendance records",
        data: records,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance",
        error: err.message,
      });
    }
  }
);




module.exports = router;
