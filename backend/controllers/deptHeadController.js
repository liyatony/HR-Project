const Employee = require("../models/employee_model");
const Attendance = require("../models/attendance_model");
const mongoose = require("mongoose");

exports.getDeptAttendance = async (req, res) => {
  try {
    const head = req.user;
    const { date, department } = req.query;

    // 1️⃣ Determine department
    const deptToSearch = department || head.department;
    const employees = await Employee.find({ department: deptToSearch });

    if (!employees.length) return res.json({ success: true, data: [] });

    // 2️⃣ Build start & end of day for ISO dates
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    // 3️⃣ Get attendance for department employees on that date
    const employeeIds = employees.map(emp => emp._id);

    const attendanceRecords = await Attendance.find({
      employeeId: { $in: employeeIds },
      $or: [
        { date: { $gte: start, $lte: end } }, // matches ISO date
        { date: date },                        // matches string date
      ]
    }).populate("employeeId", "name department");


    console.log(attendanceRecords);

    
    // 4️⃣ Merge attendance with employees
    // const merged = employees.map(emp => {
    //   const att = attendanceRecords.find(a =>
    //     String(a.employeeId._id || a.employeeId) === String(emp._id)
    //   );

      // return att
      //   ? {
      //       _id: att._id,
      //       employeeId: emp._id,
      //       employeeName: emp.name,
      //       department: emp.department,
      //       date: att.date,
      //       checkIn: att.checkIn,
      //       checkOut: att.checkOut,
      //       status: att.status,
      //       totalHours: att.totalHours,
      //       overtimeHours: att.overtimeHours,
      //       isLate: att.isLate,
      //       isHoliday: att.isHoliday,
      //       holidayName: att.holidayName,
      //       leaveId: att.leaveId,
      //       correctionRequested: att.correctionRequested,
      //       correctionReason: att.correctionReason,
      //       correctionStatus: att.correctionStatus,
      //     }
      //   : {
      //       _id: null,
      //       employeeId: emp._id,
      //       employeeName: emp.name,
      //       department: emp.department,
      //       date,
      //       checkIn: "",
      //       checkOut: "",
      //       status: "absent",
      //       totalHours: 0,
      //       overtimeHours: 0,
      //       isLate: false,
      //       isHoliday: false,
      //       holidayName: "",
      //       leaveId: null,
      //       correctionRequested: false,
      //       correctionReason: "",
      //       correctionStatus: "",
    //   //     };
    // });

    res.json({ success: true, data: attendanceRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
