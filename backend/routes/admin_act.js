// backend/routes/admin_act.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomPass = require("../utils/password_generater");
const Employee = require("../models/employee_model");
const Attendance = require("../models/attendance_model");
const Payroll = require("../models/payroll_model");
const User = require("../models/user_model");
const AuditLog = require("../models/audit_log");
const LeaveRequest = require("../models/leaveReques_model");
const leaveApprovemail = require("../utils/approved_leaveTemplate");
const leaveRejectedmail=require("../utils/rejected_leaveTemplate")
const {
  verifyAccessToken,
  isAdmin,
  isDeptHead,
} = require("../middleware/auth");
require("dotenv").config();
const payrollEmailTemplate = require("../utils/payrollemailTemplate");
const rejected_leaveTemplate = require("../utils/rejected_leaveTemplate");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9)
    ),
});
const upload = multer({ storage });

// ============================================
// EMPLOYEE MANAGEMENT ROUTES
// ============================================

/**
 * Get all active employees
 * GET /emp/employees
 * Access: Admin, Dept Head
 */
router.get("/employees", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    console.log("📋 Fetching all employees...");
    const employees = await Employee.find({ active: true }).select(
      "-passwordHash"
    );
    console.log(`✅ Found ${employees.length} employees`);

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("❌ Failed to fetch employees:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

/**
 * Add new employee
 * POST /emp/add
 * Access: Admin only
 */
router.post(
  "/add",
  verifyAccessToken,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("➕ Adding new employee...");
      const { email, role } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const existingEmployee = await Employee.findOne({
        email: email.toLowerCase(),
      });
      if (existingEmployee) {
        return res
          .status(400)
          .json({ success: false, message: "Email already registered" });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const myPlaintextPassword = randomPass();
      const hash = await bcrypt.hash(myPlaintextPassword, 10);

      const employee_file = req.file ? req.file.path : null;
      const employee_data = new Employee({
        ...req.body,
        email: email.toLowerCase(),
        image: employee_file,
        passwordHash: hash,
        active: true,
      });
      await employee_data.save();

      const user_data = new User({
        email: email.toLowerCase(),
        passwordHash: hash,
        role: role || "employee",
        employeeId: employee_data._id,
        active: true,
      });
      await user_data.save();

      console.log(`✅ Employee created: ${employee_data.name}`);

      const htmlMessage = `<div style="font-family: Arial, sans-serif;">
      <h3>Welcome to the Company, ${employee_data.name}!</h3>
      <p>Your account has been created.</p>
      <p><strong>Email:</strong> ${employee_data.email}</p>
      <p><strong>Temporary password:</strong> ${myPlaintextPassword}</p>
      <p>Please log in and change your password immediately.</p>
      <p>Regards,<br/>HR Team</p>
    </div>`;

      try {
        await transporter.sendMail({
          from: `"HR System" <${process.env.EMAIL_USER}>`,
          to: employee_data.email,
          subject: "Welcome - Your Account Details",
          html: htmlMessage,
        });
        console.log("📧 Welcome email sent");
      } catch (e) {
        console.error("⚠️ Email failed:", e.message);
      }

      await AuditLog.create({
        userId: req.user.id,
        action: "add-employee",
        ip: req.ip,
        meta: { employeeId: employee_data._id, email: employee_data.email },
      });

      res.status(200).json({
        success: true,
        message: "Employee added successfully",
        data: {
          employee: {
            id: employee_data._id,
            name: employee_data.name,
            email: employee_data.email,
            department: employee_data.department,
            role: user_data.role,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error adding employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add employee",
        error: error.message,
      });
    }
  }
);

/**
 * Update employee
 * PUT /emp/update/:id
 * Access: Admin, Dept Head
 */
router.put(
  "/update/:id",
  verifyAccessToken,
  isDeptHead,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log(`📝 Updating employee: ${req.params.id}`);
      const employee_id = req.params.id;
      const updated_employee_details = req.body;
      const updated_employee_file = req.file ? req.file.path : null;

      const updateData = {
        ...updated_employee_details,
        ...(updated_employee_file && { image: updated_employee_file }),
      };

      if (updateData.email) {
        const existing = await Employee.findOne({
          email: updateData.email.toLowerCase(),
          _id: { $ne: employee_id },
        });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
        updateData.email = updateData.email.toLowerCase();
      }

      const updated_employee = await Employee.findByIdAndUpdate(
        employee_id,
        updateData,
        { new: true }
      ).select("-passwordHash");

      if (!updated_employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      if (updateData.role) {
        await User.findOneAndUpdate(
          { employeeId: employee_id },
          { role: updateData.role }
        );
      }

      await AuditLog.create({
        userId: req.user.id,
        action: "update-employee",
        ip: req.ip,
        meta: { employeeId: employee_id },
      });

      console.log(`✅ Employee updated: ${updated_employee.name}`);

      res.json({
        success: true,
        message: "Employee updated successfully",
        data: updated_employee,
      });
    } catch (error) {
      console.error("❌ Error updating employee:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update employee",
        error: error.message,
      });
    }
  }
);

/**
 * Delete employee
 * DELETE /emp/delete/:id
 * Access: Admin only
 */
router.delete("/delete/:id", verifyAccessToken, isAdmin, async (req, res) => {
  try {
    console.log(`🗑️ Deleting employee: ${req.params.id}`);
    const employee_id = req.params.id;

    const deletion = await Employee.findByIdAndDelete(employee_id);
    if (!deletion) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    await User.findOneAndUpdate({ employeeId: employee_id }, { active: false });

    await AuditLog.create({
      userId: req.user.id,
      action: "delete-employee",
      ip: req.ip,
      meta: { employeeId: employee_id },
    });

    console.log(`✅ Employee deleted: ${deletion.name}`);

    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
});

// ============================================
// ATTENDANCE ROUTES
// ============================================

/**
 * Get attendance summary
 * GET /emp/attendance
 * Access: Admin, Dept Head
 */
router.get("/attendance", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    console.log("📊 Fetching attendance summary...");

    const result = await Attendance.aggregate([
      { $match: { date: { $exists: true, $ne: null } } },
      { $addFields: { dateObj: { $toDate: "$date" } } },
      {
        $group: {
          _id: {
            employeeId: "$employeeId",
            employeeName: "$employeeName",
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
          },
          totalPresentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          totalLeaveDays: {
            $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] },
          },
          totalOvertimeHours: { $sum: { $ifNull: ["$overtimeHours", 0] } },
          totalHoursWorked: { $sum: { $ifNull: ["$totalHours", 0] } },
          totalAbsentDays: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.employeeName": 1, "_id.year": 1, "_id.month": 1 } },
    ]);

    const formatted = result.map((r) => ({
      empId: r._id.employeeId,
      name: r._id.employeeName,
      month: `${r._id.year}-${r._id.month.toString().padStart(2, "0")}`,
      presentDays: r.totalPresentDays,
      leaves: r.totalLeaveDays,
      overtime: r.totalOvertimeHours,
      totalAbsentDays: r.totalAbsentDays,
    }));

    console.log(`✅ Found ${formatted.length} attendance records`);

    res.status(200).json({
      success: true,
      message: "Attendance fetched",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

/**
 * Get attendance records by date
 * GET /emp/attendance_records?date=YYYY-MM-DD
 * Access: Admin, Dept Head
 */
router.get(
  "/attendance_records",
  verifyAccessToken,
  isDeptHead,
  async (req, res) => {
    try {
      const date = req.query.date;
      console.log(`📅 Fetching attendance for date: ${date}`);

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date parameter required (YYYY-MM-DD)",
        });
      }

      const iso = date + "T00:00:00.000Z";
      const data = await Attendance.find({ date: iso }).populate(
        "employeeId",
        "department employeeId name"
      );

      console.log(`✅ Found ${data.length} attendance records`);

      res.status(200).json({
        success: true,
        message: "Attendance records fetched",
        data,
      });
    } catch (err) {
      console.error("❌ Attendance records error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch attendance records",
        error: err.message,
      });
    }
  }
);

// ============================================
// PAYROLL ROUTES
// ============================================

/**
 * Bulk insert payrolls
 * POST /emp/allmonthlypayrolls
 * Access: Admin only
 */
router.post(
  "/allmonthlypayrolls",
  verifyAccessToken,
  isAdmin,
  async (req, res) => {
    try {
      console.log("💰 Processing bulk payroll...");
      const data = req.body;

      if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Invalid payroll data",
        });
      }

      const saved = await Promise.all(
        data.map(async (row) => {
          const existing = await Payroll.findOne({
            empId: row.empId,
            month: row.month,
          });
          if (!existing) return Payroll.create(row);
          return existing;
        })
      );

      await AuditLog.create({
        userId: req.user.id,
        action: "bulk-payroll-upload",
        ip: req.ip,
        meta: { count: saved.length },
      });

      const newCount = saved.filter((s) => s.status === "pending").length;
      console.log(`✅ Processed ${newCount} new payroll records`);

      res.status(200).json({
        success: true,
        message: `Payroll processed: ${newCount} new records`,
        data: saved,
      });
    } catch (error) {
      console.error("❌ Payroll error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Get all payrolls
 * GET /emp/allpayrolls
 * Access: Admin, Dept Head
 */
router.get("/allpayrolls", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    console.log("💰 Fetching all payrolls...");
    const data = await Payroll.find();
    console.log(`✅ Found ${data.length} payroll records`);

    res.status(200).json({
      success: true,
      message: "Payrolls fetched",
      data,
    });
  } catch (error) {
    console.error("❌ Payroll fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payrolls",
      error: error.message,
    });
  }
});

/**
 * Update payroll
 * PUT /emp/updatepayrolls/:id
 * Access: Admin only
 */
router.put(
  "/updatepayrolls/:id",
  verifyAccessToken,
  isAdmin,
  async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      console.log(`💰 Updating payroll: ${id}`);

      if (!data) {
        return res.status(400).json({
          success: false,
          message: "No data provided",
        });
      }

      const checking = await Payroll.findById(id);
      if (!checking) {
        return res.status(404).json({
          success: false,
          message: "Payroll not found",
        });
      }

      if (checking.status === "processed") {
        return res.status(400).json({
          success: false,
          message: "Payroll already processed",
        });
      }

      const updatedPayroll = await Payroll.findByIdAndUpdate(id, data, {
        new: true,
      });

      await AuditLog.create({
        userId: req.user.id,
        action: "update-payroll",
        ip: req.ip,
        meta: { payrollId: id, status: updatedPayroll.status },
      });

      const template = payrollEmailTemplate(updatedPayroll);

      try {
        await transporter.sendMail({
          from: `"HR System" <${process.env.EMAIL_USER}>`,
          to: updatedPayroll.email,
          subject: "Payroll Update",
          html: template,
        });
        console.log("📧 Payroll email sent");
      } catch (err) {
        console.error("⚠️ Email failed:", err.message);
      }

      console.log(`✅ Payroll updated: ${id}`);

      res.status(200).json({
        success: true,
        message: "Payroll updated",
        data: updatedPayroll,
      });
    } catch (error) {
      console.error("❌ Payroll update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update payroll",
        error: error.message,
      });
    }
  }
);

router.get("/leave", async (req, res) => {
  try {
    const allleave = await LeaveRequest.find().populate(
      "employeeId",
      "name department email"
    );

    res
      .status(200)
      .json({ message: "leave details feateched ", data: allleave });
  } catch (error) {
    console.error("error featching leave data", error);
    res.status(500).json({ message: "error in leave featching", error: error });
  }
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


module.exports = router;
