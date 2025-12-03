// backend/routes/dept_head_routes.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/employee_model");
const Attendance = require("../models/attendance_model");
const Payroll = require("../models/payroll_model");
const User = require("../models/user_model");
const { verifyAccessToken, isDeptHead } = require("../middleware/auth");
const deptController = require("../controllers/deptHeadController");
const LeaveRequest = require("../models/Leave_model");




const auth = require("../middleware/auth");


router.get(
  "/attendance",
  verifyAccessToken,
  isDeptHead,
  deptController.getDeptAttendance
);



/**
 * Get logged-in dept head's department employees
 * GET /dept/my-team
 */
router.get("/my-team", verifyAccessToken, isDeptHead, async (req, res) => {

  
  
  try {
    // Get the logged-in dept head's employee record
    const deptHead = await Employee.findById(req.user.employeeId);

    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // Get all employees in THIS dept head's department (excluding the dept head)
    const employees = await Employee.find({
      department,
      active: true,
      _id: { $ne: deptHead._id } // Exclude dept head from list
    }).select("-passwordHash");

    res.status(200).json({
      success: true,
      message: "Team members fetched",
      data: employees,
      department: department,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: error.message,
    });
  }
});

/**
 * Get attendance for logged-in dept head's team
 * GET /dept/team-attendance?date=YYYY-MM-DD
 */
router.get("/team-attendance", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Get dept head's department
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // Get all employees in this department
    const employees = await Employee.find({
      department,
      active: true
    });

    const employeeIds = employees.map(e => e._id);

    // Get attendance for this date
    const iso = date + "T00:00:00.000Z";
    const attendance = await Attendance.find({
      employeeId: { $in: employeeIds },
      date: iso,
    }).populate("employeeId", "name email department position");

    res.status(200).json({
      success: true,
      message: "Team attendance fetched",
      data: attendance,
      department: department,
      date: date,
    });
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

/**
 * Get aggregated attendance summary for dept head's team
 * GET /dept/team-attendance-summary
 */
router.get("/team-attendance-summary", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    // Get dept head's department
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // Get all employees in department
    const employees = await Employee.find({
      department,
      active: true
    });

    const employeeIds = employees.map(e => e._id);

    // Get current month's date range
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // Aggregate attendance data
    const summary = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: null,
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalLeave: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } },
        }
      }
    ]);

    const result = summary[0] || {
      totalPresent: 0,
      totalAbsent: 0,
      totalLeave: 0,
    };

    res.status(200).json({
      success: true,
      message: "Attendance summary fetched",
      data: {
        ...result,
        totalEmployees: employees.length,
        department: department,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
      error: error.message,
    });
  }
});

/**
 * Get leave requests for dept head's department
 * GET /dept/team-leave-requests
 */
// router.get("/team-leave-requests", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     // Get dept head's department
//     const deptHead = await Employee.findById(req.user.employeeId);
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     const department = deptHead.department;

//     // Note: You need to create a Leave model
//     // For now, returning empty array with proper structure
//     const leaveRequests = [];

//     res.status(200).json({
//       success: true,
//       message: "Leave requests fetched",
//       data: leaveRequests,
//       department: department,
//     });
//   } catch (error) {
//     console.error("Error fetching leave requests:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch leave requests",
//       error: error.message,
//     });
//   }
// });
/**
 * Get leave requests for dept head's department
 * GET /dept/team-leave-requests
 */
router.get("/team-leave-requests", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const deptHead = await Employee.findById(req.user.employeeId);

    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // ❌ EMPTY ALWAYS!!
    const leaveRequests = [];

    res.status(200).json({
      success: true,
      message: "Leave requests fetched",
      data: leaveRequests,
      department: department,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
});


/**
 * Approve/Reject leave request (dept head can only approve for their department)
 * PUT /dept/leave-request/:id
 */
router.put("/leave-request/:id", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    // Get dept head's department
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    // Note: When you implement Leave model, add check here:
    // const leave = await Leave.findById(leaveId).populate('employeeId');
    // if (leave.employeeId.department !== deptHead.department) {
    //   return res.status(403).json({ message: "Cannot approve leave for other departments" });
    // }

    res.status(200).json({
      success: true,
      message: `Leave request ${status}`,
      data: {
        _id: leaveId,
        status,
        approvedBy: req.user.id,
        approverName: deptHead.name
      },
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update leave request",
      error: error.message,
    });
  }
});

/**
 * Get team performance for dept head's department
 * GET /dept/team-performance
 */
router.get("/team-performance", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    // Get dept head's department
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // Get employees
    const employees = await Employee.find({
      department,
      active: true
    }).select("-passwordHash");

    const employeeIds = employees.map(e => e._id);

    // Get current month attendance
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const attendanceSummary = await Attendance.aggregate([
      {
        $match: {
          employeeId: { $in: employeeIds },
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: "$employeeId",
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalLeaves: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } },
        }
      }
    ]);

    // Merge employee data with attendance
    const performanceData = employees.map(emp => {
      const attendance = attendanceSummary.find(
        a => a._id.toString() === emp._id.toString()
      );
      return {
        ...emp.toObject(),
        attendance: attendance || {
          totalPresent: 0,
          totalAbsent: 0,
          totalLeaves: 0,
        }
      };
    });

    res.status(200).json({
      success: true,
      message: "Team performance fetched",
      data: performanceData,
      department: department,
    });
  } catch (error) {
    console.error("Error fetching team performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance",
      error: error.message,
    });
  }
});

/**
 * Get specific team member details (only if in dept head's department)
 * GET /dept/team-member/:id
 */
router.get("/team-member/:id", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Get dept head's department
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    // Get employee and verify they're in the same department
    const employee = await Employee.findById(employeeId).select("-passwordHash");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check if employee is in dept head's department
    if (employee.department !== deptHead.department) {
      return res.status(403).json({
        success: false,
        message: "Cannot view employee from another department",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team member details fetched",
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team member",
      error: error.message,
    });
  }
});



//PERFORMANCE
// ⭐ A. CREATE OR UPDATE Monthly Performance

const Performance = require("../models/performance_model");

/**
 * Add or Update Monthly Performance Review
 * POST /dept/performance/add
 */
router.post("/performance/add", verifyAccessToken, isDeptHead, async (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  try {
    const { employeeId, date, ratings, comments, score } = req.body;

    // Validate
    if (!employeeId || !date || !ratings || !score) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get dept head
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    // Ensure employee belongs to same department
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.department !== deptHead.department) {
      return res.status(403).json({
        success: false,
        message: "You can rate only employees in your department",
      });
    }

    // Upsert (update if exists, else create)
    const existing = await Performance.findOne({ employeeId, date });

    if (existing) {
      existing.ratings = ratings;
      existing.comments = comments;
      existing.score = score;
      existing.reviewerId = deptHead._id;

      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Performance updated",
        data: existing,
      });
    }

    const newPerformance = await Performance.create({
      employeeId,
      reviewerId: deptHead._id,
      date,
      ratings,
      comments,
      score,
    });

    res.status(201).json({
      success: true,
      message: "Performance added successfully",
      data: newPerformance,
    });

  } catch (error) {
    console.error("Error adding performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add performance",
      error: error.message,
    });
  }
});
//⭐ B. GET Performance of Entire Department
/**
 * Get all team performance of a month
 * GET /dept/performance/all?month=YYYY-MM
 */
router.get("/performance/all", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "month query is required (YYYY-MM)",
      });
    }

    const deptHead = await Employee.findById(req.user.employeeId);
    const department = deptHead.department;

    // get employees of this dept
    const employees = await Employee.find({
      department,
      active: true,
    });

    const employeeIds = employees.map((e) => e._id);

    const performance = await Performance.find({
      employeeId: { $in: employeeIds },
      date: month,
    }).populate("employeeId", "name email department");

    res.status(200).json({
      success: true,
      message: "Performance list fetched",
      data: performance,
      department,
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
//⭐ C. GET Specific Employee Performance
/**
 * Get single employee's performance for a month
 * GET /dept/performance/:employeeId?month=YYYY-MM
 */
router.get("/performance/:employeeId", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const month = req.query.month;

    const deptHead = await Employee.findById(req.user.employeeId);

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.department !== deptHead.department) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to view performance of other departments",
      });
    }

    const performance = await Performance.findOne({
      employeeId,
      date: month,
    });

    res.status(200).json({
      success: true,
      message: "Performance fetched",
      data: performance,
    });
  } catch (error) {
    console.error("Error fetching performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch performance",
      error: error.message,
    });
  }
});
/**
 * Get leave requests for dept head's department
 * GET /dept/team-leave-requests
 */
router.get("/team-leave-requests", verifyAccessToken, isDeptHead, async (req, res) => {
  try {
    // 1️⃣ Get dept head info
    const deptHead = await Employee.findById(req.user.employeeId);
    if (!deptHead) {
      return res.status(404).json({
        success: false,
        message: "Department head not found",
      });
    }

    const department = deptHead.department;

    // 2️⃣ Get all employees in this department
    const employees = await Employee.find({
      department,
      active: true,
    });

    const employeeIds = employees.map(e => e._id);

    // 3️⃣ Fetch leave requests only for those employees
    const leaveRequests = await LeaveRequest.find({
      employeeId: { $in: employeeIds },
    })
      .populate("employeeId", "name email department")
      .sort({ appliedDate: -1 });

    // 4️⃣ Return them
    res.status(200).json({
      success: true,
      message: "Leave requests fetched successfully",
      department,
      data: leaveRequests,
    });

  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
});


module.exports = router;