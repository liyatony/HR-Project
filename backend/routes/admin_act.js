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
<<<<<<< HEAD
const AuditLog = require("../models/audit_log");
const LeaveRequest = require("../models/leaveReques_model");
const leaveApprovemail = require("../utils/approved_leaveTemplate");
const leaveRejectedmail=require("../utils/rejected_leaveTemplate")
const Performance = require("../models/performance_model");
const {
  verifyAccessToken,
  isAdmin,
  isDeptHead,
} = require("../middleware/auth");
require("dotenv").config();
const payrollEmailTemplate = require("../utils/payrollemailTemplate");
const rejected_leaveTemplate = require("../utils/rejected_leaveTemplate");
=======
>>>>>>> 71ede71e2aae0a2ee20ac7d5988ef31f54ac64e9

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
<<<<<<< HEAD
});

router.put("/leave_confirm", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "leave _id not  given" });
    }

    const leavereq = await LeaveRequest.findByIdAndUpdate(
      req.body,
      { status: "approved" },
      { new: true }
    );
    res.status(200).json({ message: "leave approved!!", data: leavereq });
  } catch (error) {
    console.error("error in leave approving", err);
    res.status(500).json({ message: "error approving leave" });
  }
});

router.post("/approved_leave", async (req, res) => {
  try {
    console.log(req.body);

    const email = req.body.email;
    const employeeId = req.body.employeeId;
    const days = req.body.days;
    const name = req.body.employeeName;
    const LeaveId = req.body.leaveId;

    if (!employeeId || !days || !Array.isArray(days)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    for (const date of days) {
      await Attendance.findOneAndUpdate(
        { employeeId, date },
        {
          employeeId,
          date,
          status: "leave",
          checkIn: "",
          checkOut: "",
          totalHours: 0,
          overtimeHours: 0,
          isLate: false,
          employeeName: name,
          leaveId: LeaveId,
        },
        { upsert: true, new: true }
      );
    }

    const approveTemplate = leaveApprovemail(name, days, employeeId, LeaveId);

    try {
      await transporter.sendMail({
        from: `"HR System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "leave approved",
        html: approveTemplate,
      });
      console.log("📧 leave approval  email sent");
    } catch (err) {
      console.error("⚠️ Email failed:", err.message);
    }

    res.status(200).json({
      message: "Leave added/updated successfully",
      dates: days,
    });
  } catch (error) {
    console.error("error adding approved leaves to attendence ", error);

    res.status(500).json({ message: "Server error" });
  }
});

router.put("/rejected_leave", async (req, res) => {
  const id = req.body.leaveId;
  const name=req.body.name;
  const email=req.body.email;
  const startDate=req.body.startDate;
  const endDate =req.body.endDate;

  try {
  if (!id) {
    return res.status(400).json({ message: "leaveId is required" });
  }

  const leavreq = await LeaveRequest.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );

  if (!leavreq) {
    return res.status(404).json({ message: "Leave request not found" });
  }





  console.log("Rejected Leave:", leavreq);

  const { html, text }= leaveRejectedmail(name,startDate,endDate)


   try {
      await transporter.sendMail({
        from: `"HR System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "  Leave Rejected",
        html: html,
      });
      console.log("📧 leave Rejected  email sent");
    } catch (err) {
      console.error("⚠️ Email failed:", err.message);
    }






  res.status(200).json({
    message: "Leave rejected successfully",
    leave: leavreq,
  });



    
  } catch (error) {

     console.error("Reject error:", error);
    res.status(500).json({ message: "Server error" });
    
  }

});



router.get("/pending", async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ status: "pending" }).populate(
      "employeeId",
      "name department email"
    );
    return res.status(200).json(leaves);
  } catch (error) {
    return res.status(500).json({ 
      message: "Error fetching pending leave requests" 
    });
  }
});

// Get all performance records (Admin only)
router.get("/performance/all", verifyAccessToken, isAdmin, async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "month query is required (YYYY-MM)",
      });
    }

    // Admin can see ALL departments
    const performance = await Performance.find({
      date: month,
    })
    .populate("employeeId", "name email department position")
    .populate("reviewerId", "name department");

    res.status(200).json({
      success: true,
      message: "Performance list fetched",
      data: performance,
    });
  } catch (error) {
    console.error("Error fetching performances:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance",
      error: error.message,
    });
  }
});

// ============================================
// DASHBOARD STATS ROUTE - ADD THIS
// ============================================

router.get("/dashboard-stats", verifyAccessToken, isAdmin, async (req, res) => {
  try {
    console.log("📊 Fetching dashboard stats...");

    // Total Employees
    const totalEmployees = await Employee.countDocuments({ active: true });

    // Attendance Rate (Current Month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: null,
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    const attendanceRate = attendanceSummary.length > 0 
      ? ((attendanceSummary[0].totalPresent / attendanceSummary[0].totalRecords) * 100).toFixed(1)
      : 0;

    // Monthly Payroll (Current Month)
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const payrollSummary = await Payroll.aggregate([
      {
        $match: { month: currentMonth }
      },
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: "$netSalary" },
          processedCount: { $sum: { $cond: [{ $eq: ["$status", "processed"] }, 1, 0] } },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    const monthlyPayroll = payrollSummary.length > 0 
      ? (payrollSummary[0].totalPayroll / 100000).toFixed(1)
      : 0;

    const payrollProcessed = payrollSummary.length > 0 
      ? payrollSummary[0].processedCount === payrollSummary[0].totalCount
      : false;

    // Average Performance (Current Month)
    const performanceSummary = await Performance.aggregate([
      {
        $match: { date: currentMonth }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" }
        }
      }
    ]);

    const avgPerformance = performanceSummary.length > 0 
      ? ((performanceSummary[0].avgScore / 5) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched",
      data: {
        totalEmployees: totalEmployees,
        attendanceRate: `${attendanceRate}%`,
        monthlyPayroll: `₹${monthlyPayroll}L`,
        avgPerformance: `${avgPerformance}%`
      }
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
});
=======
);
>>>>>>> 71ede71e2aae0a2ee20ac7d5988ef31f54ac64e9

module.exports = router;
