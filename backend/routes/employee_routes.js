// backend/routes/employee_routes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance_model");
const Payroll = require("../models/payroll_model");
const Employee = require("../models/employee_model");
const { verifyAccessToken } = require("../middleware/auth");

/**
 * Get ONLY current logged-in employee's attendance summary
 * GET /emp/my-attendance
 */
router.get("/my-attendance", verifyAccessToken, async (req, res) => {
  try {
    // req.user.employeeId is the logged-in employee's ID
    const employeeId = req.user.employeeId;

    const attendanceData = await Attendance.aggregate([
      { 
        $match: { 
          employeeId: employeeId  // ONLY this user's data
        } 
      },
      {
        $group: {
          _id: null,
          totalPresent: { 
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } 
          },
          totalAbsent: { 
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } 
          },
          totalLeaves: { 
            $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } 
          },
        },
      },
    ]);

    const result = attendanceData[0] || {
      totalPresent: 0,
      totalAbsent: 0,
      totalLeaves: 0,
    };

    res.status(200).json({
      success: true,
      message: "Your attendance summary",
      data: {
        present: result.totalPresent,
        absent: result.totalAbsent,
        leaves: result.totalLeaves,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

/**
 * Get ONLY current logged-in employee's detailed attendance records
 * GET /emp/my-attendance-records?month=2025-01
 */
router.get("/my-attendance-records", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;  // ONLY this user
    const { month } = req.query;

    let query = { employeeId };  // Filter by logged-in user only
    
    // If month filter provided
    if (month) {
      const startDate = new Date(month + "-01T00:00:00.000Z");
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      
      query.date = {
        $gte: startDate.toISOString(),
        $lt: endDate.toISOString(),
      };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      message: "Your attendance records",
      data: records,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
});

/**
 * Get ONLY current logged-in employee's payslips
 * GET /emp/my-payslips
 */
router.get("/my-payslips", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;  // ONLY this user
    
    // Get employee details to match empId (string)
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get ONLY this employee's payslips
    const payslips = await Payroll.find({ 
      empId: employee._id.toString(),  // Match by this user's ID
      status: "processed" 
    })
      .sort({ month: -1 })
      .limit(12);  // Last 12 months

    res.status(200).json({
      success: true,
      message: "Your payslips",
      data: payslips,
    });
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslips",
      error: error.message,
    });
  }
});

/**
 * Get specific payslip details (ONLY if it belongs to logged-in employee)
 * GET /emp/payslip/:id
 */
router.get("/payslip/:id", verifyAccessToken, async (req, res) => {
  try {
    const payslipId = req.params.id;
    const employeeId = req.user.employeeId;  // Logged-in user
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get payslip ONLY if it belongs to this employee
    const payslip = await Payroll.findOne({
      _id: payslipId,
      empId: employee._id.toString(),  // Security: must match logged-in user
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payslip details",
      data: payslip,
    });
  } catch (error) {
    console.error("Error fetching payslip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payslip",
      error: error.message,
    });
  }
});

/**
 * Get ONLY current logged-in employee's leave requests
 * GET /emp/my-leaves
 */
router.get("/my-leaves", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;  // ONLY this user

    // Note: When you implement Leave model, filter by employeeId
    // const leaves = await Leave.find({ employeeId }).sort({ createdAt: -1 });
    
    // For now, returning empty array
    const leaves = [];

    res.status(200).json({
      success: true,
      message: "Your leave requests",
      data: leaves,
    });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
      error: error.message,
    });
  }
});

/**
 * Get ONLY current logged-in employee's profile
 * GET /emp/my-profile
 */
router.get("/my-profile", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;  // ONLY this user

    const employee = await Employee.findById(employeeId).select("-passwordHash");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Your profile",
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

/**
 * Update ONLY current logged-in employee's profile (limited fields)
 * PUT /emp/my-profile
 */
router.put("/my-profile", verifyAccessToken, async (req, res) => {
  try {
    const employeeId = req.user.employeeId;  // ONLY this user
    const { phone, email } = req.body;  // Only allow updating contact info

    // Employees can only update their contact information
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (email) {
      // Check if email is already used by another employee
      const existing = await Employee.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: employeeId } 
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      updateData.email = email.toLowerCase();
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    ).select("-passwordHash");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

module.exports = router;