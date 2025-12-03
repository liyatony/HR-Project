const Employee = require("../models/employee_model");
const Attendance = require("../models/attendance_model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const deptController = require("../controllers/deptHeadController");

router.get("/attendance", auth, deptController.getDeptAttendance);

module.exports = router;


exports.getDeptAttendance = async (req, res) => {
  try {
    const head = req.user; // Department Head logged in
    const { date } = req.query;

    // Step 1: employees in same department
    const employees = await Employee.find({ department: head.department });

    // Step 2: attendance for selected date
    const attendance = await Attendance.find({ date });

    // Step 3: merge
    const merged = employees.map(emp => {
      const att = attendance.find(a => String(a.employeeId) === String(emp._id));

      return att
        ? {
            _id: att._id,
            employeeId: emp._id,
            employeeName: emp.name,
            department: emp.department,
            date: att.date,
            checkIn: att.checkIn,
            checkOut: att.checkOut,
            status: att.status,
            totalHours: att.totalHours,
            overtimeHours: att.overtimeHours,
            isLate: att.isLate,
            isHoliday: att.isHoliday,
            holidayName: att.holidayName,
            leaveId: att.leaveId,
            correctionRequested: att.correctionRequested,
            correctionReason: att.correctionReason,
            correctionStatus: att.correctionStatus,
          }
        : {
            _id: null,
            employeeId: emp._id,
            employeeName: emp.name,
            department: emp.department,
            date,
            checkIn: "",
            checkOut: "",
            status: "absent",
            totalHours: 0,
            overtimeHours: 0,
            isLate: false,
            isHoliday: false,
            holidayName: "",
            leaveId: null,
            correctionRequested: false,
            correctionReason: "",
            correctionStatus: "",
          };
    });

    res.json({ success: true, data: merged });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
