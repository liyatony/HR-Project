// // import Sidebar from "../common/Sidebar";
// // import Navbar from "../common/Navbar";
// // import { 
// //   FaStar, 
// //   FaTasks, 
// //   FaTrophy,
// //   FaChartLine,
// //   FaSearch,
// //   FaFilter,
// //   FaEye,
// //   FaEdit,
// //   FaDownload
// // } from "react-icons/fa";
// // import "../../styles/Teamperformance.css";
// // import Rating from "@mui/material/Rating";
// // import React, { useState, useEffect } from "react";
// // import axiosInstance from "../../utils/axiosInstance";
// // import { useAuth } from "../../utils/AuthContext";   // to get logged-in dept head



// // // ⭐ Rating Section Component
// // // const RatingSection = ({ performanceData }) => {
// // //   const [selectedEmployee, setSelectedEmployee] = useState("");
// // //   const [punctuality, setPunctuality] = useState(0);
// // //   const [teamwork, setTeamwork] = useState(0);
// // //   const [quality, setQuality] = useState(0);
// // //   const [feedback, setFeedback] = useState("");

// // //   const labels = {
// // //     0.5: "Useless",
// // //     1: "Useless+",
// // //     1.5: "Poor",
// // //     2: "Poor+",
// // //     2.5: "Ok",
// // //     3: "Ok+",
// // //     3.5: "Good",
// // //     4: "Good+",
// // //     4.5: "Excellent",
// // //     5: "Excellent+",
// // //   };

// // //   const getLabelText = (value) =>
// // //     `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;

// // //   const handleSubmit = () => {
// // //     alert("Rating submitted successfully!");
// // //     console.log({
// // //       selectedEmployee,
// // //       punctuality,
// // //       teamwork,
// // //       quality,
// // //       feedback,
// // //     });
// // //   };

// // //   return (
// // //     <div className="rate-employee-card">
// // //       <h3 className="rate-title">Rate Employee</h3>

// // //       {/* Select Employee */}
// // //       <label className="form-label">Select Employee:</label>
// // //       <select
// // //         className="rate-select"
// // //         value={selectedEmployee}
// // //         onChange={(e) => setSelectedEmployee(e.target.value)}
// // //       >
// // //         <option value="">Choose employee</option>
// // //         {performanceData.map((emp) => (
// // //           <option key={emp.id} value={emp.employee}>
// // //             {emp.employee} ({emp.department})
// // //           </option>
// // //         ))}
// // //       </select>

// // //       {/* KPI Ratings */}
// // //       <div className="kpi-group">
// // //         <div className="kpi-item">
// // //           <label>Punctuality</label>
// // //           <Rating
// // //             name="punctuality"
// // //             value={punctuality}
// // //             precision={0.5}
// // //             getLabelText={getLabelText}
// // //             onChange={(e, val) => setPunctuality(val)}
// // //           />
// // //         </div>

// // //         <div className="kpi-item">
// // //           <label>Teamwork</label>
// // //           <Rating
// // //             name="teamwork"
// // //             value={teamwork}
// // //             precision={0.5}
// // //             getLabelText={getLabelText}
// // //             onChange={(e, val) => setTeamwork(val)}
// // //           />
// // //         </div>

// // //         <div className="kpi-item">
// // //           <label>Quality</label>
// // //           <Rating
// // //             name="quality"
// // //             value={quality}
// // //             precision={0.5}
// // //             getLabelText={getLabelText}
// // //             onChange={(e, val) => setQuality(val)}
// // //           />
// // //         </div>
// // //       </div>

// // //       {/* Feedback */}
// // //       <label className="form-label">Feedback</label>
// // //       <textarea
// // //         className="feedback-box"
// // //         placeholder="Write feedback here..."
// // //         value={feedback}
// // //         onChange={(e) => setFeedback(e.target.value)}
// // //       />

// // //       {/* Submit Button */}
// // //       <button className="btn-submit-rating" onClick={handleSubmit}>
// // //         Submit Rating
// // //       </button>
// // //     </div>
// // //   );
// // // };
// // // ⭐ Updated Rating Section Component (Fully Working with Hover Labels)
// // const RatingSection = ({ performanceData }) => {
// //   const [selectedEmployee, setSelectedEmployee] = useState("");

// //   // Rating values
// //   const [punctuality, setPunctuality] = useState(0);
// //   const [teamwork, setTeamwork] = useState(0);
// //   const [quality, setQuality] = useState(0);

// //   // Hover states
// //   const [hoverPunctuality, setHoverPunctuality] = useState(-1);
// //   const [hoverTeamwork, setHoverTeamwork] = useState(-1);
// //   const [hoverQuality, setHoverQuality] = useState(-1);

// //   const [feedback, setFeedback] = useState("");

// //   const labels = {
// //     0.5: "Useless",
// //     1: "Useless+",
// //     1.5: "Poor",
// //     2: "Poor+",
// //     2.5: "Ok",
// //     3: "Ok+",
// //     3.5: "Good",
// //     4: "Good+",
// //     4.5: "Excellent",
// //     5: "Excellent+",
// //   };

// //   const getLabelText = (value) =>
// //     `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;

// //   // const handleSubmit = () => {
// //   //   alert("Rating submitted successfully!");
// //   //   console.log({
// //   //     selectedEmployee,
// //   //     punctuality,
// //   //     teamwork,
// //   //     quality,
// //   //     feedback,
// //   //   });
// //   // };
// // const handleSubmit = async () => {
// //   if (!selectedEmployee) {
// //     alert("Please select an employee");
// //     return;
// //   }

// //   const month = new Date().toISOString().slice(0, 7); // YYYY-MM
// //   const score = ((punctuality + teamwork + quality) / 3).toFixed(1);

// //   try {
// //     const res = await axiosInstance.post("/dept/performance/add", {
// //       employeeId: selectedEmployee,
// //       date: month,
// //       ratings: {
// //         punctuality,
// //         teamwork,
// //         quality
// //       },
// //       comments: feedback,
// //       score
// //     });

// //     alert("Performance saved!");
// //     console.log("Saved:", res.data);

// //     window.location.reload(); // refresh table
// //   } catch (err) {
// //     console.error("Error posting performance:", err);
// //     alert("Failed to save rating");
// //   }
// // };



// //   return (
// //     <div className="rate-employee-card">
// //       <h3 className="rate-title">Rate Employee</h3>

// //       {/* Select Employee */}
// //       <label className="form-label">Select Employee:</label>
// //       <select
// //         className="rate-select"
// //         value={selectedEmployee}
// //         onChange={(e) => setSelectedEmployee(e.target.value)}
// //       >
// //         <option value="">Choose employee</option>
// //         {performanceData.map((emp) => (
// //           <option key={emp.id} value={emp.empId}>
// //             {emp.employee} - ID: {emp.empId}
// //           </option>
// //         ))}
// //       </select>

// //       {/* KPI Ratings */}
// //       <div className="kpi-group">

// //         {/* ⭐ Punctuality */}
// //         <div className="kpi-item">
// //           <label>Punctuality</label>
// //           <div className="rating-line">
// //             <Rating
// //               name="punctuality"
// //               value={punctuality}
// //               precision={0.5}
// //               getLabelText={getLabelText}
// //               onChange={(event, newValue) => setPunctuality(newValue)}
// //               onChangeActive={(event, newHover) => setHoverPunctuality(newHover)}
// //             />
// //             {punctuality !== null && (
// //               <span className="rating-label">
// //                 {labels[hoverPunctuality !== -1 ? hoverPunctuality : punctuality]}
// //               </span>
// //             )}
// //           </div>
// //         </div>

// //         {/* ⭐ Teamwork */}
// //         <div className="kpi-item">
// //           <label>Teamwork</label>
// //           <div className="rating-line">
// //             <Rating
// //               name="teamwork"
// //               value={teamwork}
// //               precision={0.5}
// //               getLabelText={getLabelText}
// //               onChange={(event, newValue) => setTeamwork(newValue)}
// //               onChangeActive={(event, newHover) => setHoverTeamwork(newHover)}
// //             />
// //             {teamwork !== null && (
// //               <span className="rating-label">
// //                 {labels[hoverTeamwork !== -1 ? hoverTeamwork : teamwork]}
// //               </span>
// //             )}
// //           </div>
// //         </div>

// //         {/* ⭐ Quality */}
// //         <div className="kpi-item">
// //           <label>Quality</label>
// //           <div className="rating-line">
// //             <Rating
// //               name="quality"
// //               value={quality}
// //               precision={0.5}
// //               getLabelText={getLabelText}
// //               onChange={(event, newValue) => setQuality(newValue)}
// //               onChangeActive={(event, newHover) => setHoverQuality(newHover)}
// //             />
// //             {quality !== null && (
// //               <span className="rating-label">
// //                 {labels[hoverQuality !== -1 ? hoverQuality : quality]}
// //               </span>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Feedback */}
// //       <label className="form-label">Feedback</label>
// //       <textarea
// //         className="feedback-box"
// //         placeholder="Write feedback here..."
// //         value={feedback}
// //         onChange={(e) => setFeedback(e.target.value)}
// //       />

// //       <button className="btn-submit-rating" onClick={handleSubmit}>
// //         Submit Rating
// //       </button>
// //     </div>
// //   );
// // };



// // const Teamperformance = () => {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [activeMenu, setActiveMenu] = useState("performance");
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [filterDepartment, setFilterDepartment] = useState("");
// //   const [filterStatus, setFilterStatus] = useState("");

// //   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

// //   const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

// //   // Sample performance data
// //   // const performanceData = [
// //   //   {
// //   //     id: 1,
// //   //     employee: "John Doe",
// //   //     empId: "EMP001",
// //   //     department: "Engineering",
// //   //     tasksAssigned: 45,
// //   //     tasksCompleted: 42,
// //   //     rating: 4.5,
// //   //     lastReview: "2024-12-15",
// //   //     status: "Excellent",
// //   //     completionRate: "93.3%"
// //   //   },
// //   //   {
// //   //     id: 2,
// //   //     employee: "Sarah Johnson",
// //   //     empId: "EMP002",
// //   //     department: "Marketing",
// //   //     tasksAssigned: 38,
// //   //     tasksCompleted: 36,
// //   //     rating: 4.2,
// //   //     lastReview: "2024-12-20",
// //   //     status: "Good",
// //   //     completionRate: "94.7%"
// //   //   },
// //   //   {
// //   //     id: 3,
// //   //     employee: "Mike Chen",
// //   //     empId: "EMP003",
// //   //     department: "Engineering",
// //   //     tasksAssigned: 50,
// //   //     tasksCompleted: 44,
// //   //     rating: 4.0,
// //   //     lastReview: "2024-12-10",
// //   //     status: "Good",
// //   //     completionRate: "88.0%"
// //   //   },
// //   //   {
// //   //     id: 4,
// //   //     employee: "Lisa Anderson",
// //   //     empId: "EMP004",
// //   //     department: "HR",
// //   //     tasksAssigned: 32,
// //   //     tasksCompleted: 30,
// //   //     rating: 4.7,
// //   //     lastReview: "2025-01-05",
// //   //     status: "Excellent",
// //   //     completionRate: "93.8%"
// //   //   },
// //   //   {
// //   //     id: 5,
// //   //     employee: "David Brown",
// //   //     empId: "EMP005",
// //   //     department: "Sales",
// //   //     tasksAssigned: 40,
// //   //     tasksCompleted: 35,
// //   //     rating: 3.8,
// //   //     lastReview: "2024-12-18",
// //   //     status: "Average",
// //   //     completionRate: "87.5%"
// //   //   },
// //   //   {
// //   //     id: 6,
// //   //     employee: "Emma Wilson",
// //   //     empId: "EMP006",
// //   //     department: "Finance",
// //   //     tasksAssigned: 35,
// //   //     tasksCompleted: 34,
// //   //     rating: 4.6,
// //   //     lastReview: "2025-01-02",
// //   //     status: "Excellent",
// //   //     completionRate: "97.1%"
// //   //   },
// //   // ];
// //   const [performanceData, setPerformanceData] = useState([]);
// // const { user } = useAuth();
// // useEffect(() => {
// //   const fetchTeam = async () => {
// //     try {
// //       const res = await axiosInstance.get("/dept/my-team");

// //       console.log("Team members:", res.data.data);

// //       const formatted = res.data.data.map((emp, i) => ({
// //         id: i + 1,
// //         employee: emp.name,
// //         empId: emp._id,
// //         department: emp.department,
// //         tasksAssigned: 0,
// //         tasksCompleted: 0,
// //         rating: 0,
// //         lastReview: "-",
// //         status: "Not Rated",
// //         completionRate: "0%",
// //       }));

// //       setPerformanceData(formatted);
// //     } catch (err) {
// //       console.error("Error fetching team:", err);
// //     }
// //   };

// //   fetchTeam();
// // }, []);



// //   const statsData = [
// //     { 
// //       title: "Avg Performance", 
// //       value: "4.3/5.0", 
// //       icon: <FaStar />, 
// //       color: "#f59e0b",
// //       bgColor: "#fef3c7"
// //     },
// //     { 
// //       title: "Tasks Completed", 
// //       value: "221/240", 
// //       icon: <FaTasks />, 
// //       color: "#059669",
// //       bgColor: "#d1fae5"
// //     },
// //     { 
// //       title: "Top Performers", 
// //       value: "18", 
// //       icon: <FaTrophy />, 
// //       color: "#dc2626",
// //       bgColor: "#fee2e2"
// //     },
// //     { 
// //       title: "Avg Completion", 
// //       value: "92.1%", 
// //       icon: <FaChartLine />, 
// //       color: "#4f46e5",
// //       bgColor: "#e0e7ff"
// //     },
// //   ];

// //   const handleExportReport = () => {
// //     console.log("Exporting performance report...");
// //     console.log("Department:", filterDepartment || "All");
// //     console.log("Status:", filterStatus || "All");
// //   };

// //   const handleApplyFilters = () => {
// //     console.log("Applying filters...");
// //     console.log("Search:", searchTerm);
// //     console.log("Department:", filterDepartment);
// //     console.log("Status:", filterStatus);
// //   };
// //   return (
// //     <div className="dashboard-wrapper">
// //       {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

// //       <Sidebar 
// //         isOpen={sidebarOpen} 
// //         toggleSidebar={toggleSidebar}
// //         activeMenu={activeMenu}
// //         setActiveMenu={setActiveMenu}
// //       />

// //       <div className="main-wrapper">
// //         <Navbar
// //           toggleSidebar={toggleSidebar}
// //           pageTitle="Performance Management"
// //           pageSubtitle="Track and evaluate employee performance"
// //         />

// //         <main className="content-area">
// //           {/* Stats Cards
// //           <div className="performance-stats-grid">
// //             {statsData.map((stat, index) => (
// //               <div key={index} className="performance-stat-card">
// //                 <div className="stat-icon-box" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
// //                   {stat.icon}
// //                 </div>
// //                 <div className="stat-details">
// //                   <p className="stat-label">{stat.title}</p>
// //                   <h3 className="stat-number">{stat.value}</h3>
// //                 </div>
// //               </div>
// //             ))}
// //           </div> */}

// //           {/* Filters Section */}
// //           <div className="performance-filters-card">
// //             <div className="filters-header">
// //               <h3 className="filters-title">
// //                 <FaFilter /> Filter Performance Records
// //               </h3>
// //             </div>

// //             <div className="filters-container">
// //               <div className="filter-row">
// //                 <div className="filter-item">
// //                   <label className="filter-label">Search Employee</label>
// //                   <div className="search-input-wrapper">
// //                     <FaSearch className="search-icon-input" />
// //                     <input
// //                       type="text"
// //                       placeholder="Search employee..."
// //                       value={searchTerm}
// //                       onChange={(e) => setSearchTerm(e.target.value)}
// //                       className="search-input-field"
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="filter-item">
// //                   <label className="filter-label">Department</label>
// //                   <select
// //                     value={filterDepartment}
// //                     onChange={(e) => setFilterDepartment(e.target.value)}
// //                     className="department-select-field"
// //                   >
// //                     <option value="">All Departments</option>
// //                     {departments.map((dept, index) => (
// //                       <option key={index} value={dept}>{dept}</option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 <div className="filter-item">
// //                   <label className="filter-label">Performance Status</label>
// //                   <select
// //                     value={filterStatus}
// //                     onChange={(e) => setFilterStatus(e.target.value)}
// //                     className="department-select-field"
// //                   >
// //                     <option value="">All Status</option>
// //                     <option value="Excellent">Excellent</option>
// //                     <option value="Good">Good</option>
// //                     <option value="Average">Average</option>
// //                   </select>
// //                 </div>
// //               </div>

// //               <div className="filter-actions">
// //                 <button className="btn-apply-filter" onClick={handleApplyFilters}>
// //                   <FaFilter /> Apply Filters
// //                 </button>
// //                 <button className="btn-export-report" onClick={handleExportReport}>
// //                   <FaDownload /> Export Report
// //                 </button>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Performance Table */}
// //           <div className="performance-table-card">
// //             <div className="table-header">
// //               <h3 className="table-title">
// //                 <FaChartLine /> Employee Performance Overview
// //               </h3>
// //               <span className="record-count">{performanceData.length} Employees</span>
// //             </div>

// //             <div className="table-wrapper">
// //               <table className="performance-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Employee ID</th>
// //                     <th>Employee Name</th>
// //                     <th>Department</th>
// //                     <th>Tasks Assigned</th>
// //                     <th>Tasks Completed</th>
// //                     <th>Completion Rate</th>
// //                     <th>Rating</th>
// //                     <th>Last Review</th>
// //                     <th>Status</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {performanceData.map((record) => (
// //                     <tr key={record.id}>
// //                       <td className="emp-id-cell">{record.empId}</td>
// //                       <td className="emp-name-cell">{record.employee}</td>
// //                       <td>{record.department}</td>
// //                       <td className="tasks-cell">{record.tasksAssigned}</td>
// //                       <td className="tasks-cell completed">{record.tasksCompleted}</td>
// //                       <td className="completion-cell">{record.completionRate}</td>
// //                       <td>
// //                         <div className="rating-box">
// //                           <FaStar className="star-icon" />
// //                           <span className="rating-value">{record.rating}</span>
// //                         </div>
// //                       </td>
// //                       <td className="date-cell">{record.lastReview}</td>
// //                       <td>
// //                         <span className={`performance-status-badge ${record.status.toLowerCase()}`}>
// //                           {record.status}
// //                         </span>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </div>
// //           <RatingSection performanceData={performanceData} />

// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Teamperformance;



// // backend/routes/dept_head_routes.js
// const express = require("express");
// const router = express.Router();
// const Employee = require("../models/employee_model");
// const Attendance = require("../models/attendance_model");
// const Payroll = require("../models/payroll_model");
// const User = require("../models/user_model");
// const { verifyAccessToken, isDeptHead } = require("../middleware/auth");

// /**
//  * Get logged-in dept head's department employees
//  * GET /dept/my-team
//  */
// router.get("/my-team", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     // Get the logged-in dept head's employee record
//     const deptHead = await Employee.findById(req.user.employeeId);
    
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     const department = deptHead.department;

//     // Get all employees in THIS dept head's department (excluding the dept head)
//     const employees = await Employee.find({ 
//       department, 
//       active: true,
//       _id: { $ne: deptHead._id } // Exclude dept head from list
//     }).select("-passwordHash");

//     res.status(200).json({
//       success: true,
//       message: "Team members fetched",
//       data: employees,
//       department: department,
//     });
//   } catch (error) {
//     console.error("Error fetching team:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch team members",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Get attendance for logged-in dept head's team
//  * GET /dept/team-attendance?date=YYYY-MM-DD
//  */
// router.get("/team-attendance", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const date = req.query.date || new Date().toISOString().split('T')[0];
    
//     // Get dept head's department
//     const deptHead = await Employee.findById(req.user.employeeId);
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     const department = deptHead.department;

//     // Get all employees in this department
//     const employees = await Employee.find({ 
//       department, 
//       active: true 
//     });
    
//     const employeeIds = employees.map(e => e._id);

//     // Get attendance for this date
//     const iso = date + "T00:00:00.000Z";
//     const attendance = await Attendance.find({
//       employeeId: { $in: employeeIds },
//       date: iso,
//     }).populate("employeeId", "name email department position");

//     res.status(200).json({
//       success: true,
//       message: "Team attendance fetched",
//       data: attendance,
//       department: department,
//       date: date,
//     });
//   } catch (error) {
//     console.error("Error fetching team attendance:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch attendance",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Get aggregated attendance summary for dept head's team
//  * GET /dept/team-attendance-summary
//  */
// router.get("/team-attendance-summary", verifyAccessToken, isDeptHead, async (req, res) => {
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

//     // Get all employees in department
//     const employees = await Employee.find({ 
//       department, 
//       active: true 
//     });
    
//     const employeeIds = employees.map(e => e._id);

//     // Get current month's date range
//     const now = new Date();
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

//     // Aggregate attendance data
//     const summary = await Attendance.aggregate([
//       {
//         $match: {
//           employeeId: { $in: employeeIds },
//           date: { $gte: firstDay, $lte: lastDay }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
//           totalLeave: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } },
//         }
//       }
//     ]);

//     const result = summary[0] || {
//       totalPresent: 0,
//       totalAbsent: 0,
//       totalLeave: 0,
//     };

//     res.status(200).json({
//       success: true,
//       message: "Attendance summary fetched",
//       data: {
//         ...result,
//         totalEmployees: employees.length,
//         department: department,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching attendance summary:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch summary",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Get leave requests for dept head's department
//  * GET /dept/team-leave-requests
//  */
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

// /**
//  * Approve/Reject leave request (dept head can only approve for their department)
//  * PUT /dept/leave-request/:id
//  */
// router.put("/leave-request/:id", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const leaveId = req.params.id;
//     const { status } = req.body;

//     if (!["approved", "rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status. Must be 'approved' or 'rejected'",
//       });
//     }

//     // Get dept head's department
//     const deptHead = await Employee.findById(req.user.employeeId);
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     // Note: When you implement Leave model, add check here:
//     // const leave = await Leave.findById(leaveId).populate('employeeId');
//     // if (leave.employeeId.department !== deptHead.department) {
//     //   return res.status(403).json({ message: "Cannot approve leave for other departments" });
//     // }

//     res.status(200).json({
//       success: true,
//       message: `Leave request ${status}`,
//       data: { 
//         _id: leaveId, 
//         status, 
//         approvedBy: req.user.id,
//         approverName: deptHead.name 
//       },
//     });
//   } catch (error) {
//     console.error("Error updating leave request:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update leave request",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Get team performance for dept head's department
//  * GET /dept/team-performance
//  */
// router.get("/team-performance", verifyAccessToken, isDeptHead, async (req, res) => {
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

//     // Get employees
//     const employees = await Employee.find({ 
//       department, 
//       active: true 
//     }).select("-passwordHash");
    
//     const employeeIds = employees.map(e => e._id);

//     // Get current month attendance
//     const now = new Date();
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

//     const attendanceSummary = await Attendance.aggregate([
//       {
//         $match: {
//           employeeId: { $in: employeeIds },
//           date: { $gte: firstDay, $lte: lastDay }
//         }
//       },
//       {
//         $group: {
//           _id: "$employeeId",
//           totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
//           totalLeaves: { $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] } },
//         }
//       }
//     ]);

//     // Merge employee data with attendance
//     const performanceData = employees.map(emp => {
//       const attendance = attendanceSummary.find(
//         a => a._id.toString() === emp._id.toString()
//       );
//       return {
//         ...emp.toObject(),
//         attendance: attendance || {
//           totalPresent: 0,
//           totalAbsent: 0,
//           totalLeaves: 0,
//         }
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Team performance fetched",
//       data: performanceData,
//       department: department,
//     });
//   } catch (error) {
//     console.error("Error fetching team performance:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch performance",
//       error: error.message,
//     });
//   }
// });

// /**
//  * Get specific team member details (only if in dept head's department)
//  * GET /dept/team-member/:id
//  */
// router.get("/team-member/:id", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const employeeId = req.params.id;
    
//     // Get dept head's department
//     const deptHead = await Employee.findById(req.user.employeeId);
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     // Get employee and verify they're in the same department
//     const employee = await Employee.findById(employeeId).select("-passwordHash");
    
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found",
//       });
//     }

//     // Check if employee is in dept head's department
//     if (employee.department !== deptHead.department) {
//       return res.status(403).json({
//         success: false,
//         message: "Cannot view employee from another department",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Team member details fetched",
//       data: employee,
//     });
//   } catch (error) {
//     console.error("Error fetching team member:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch team member",
//       error: error.message,
//     });
//   }
// });



// //PERFORMANCE
// // ⭐ A. CREATE OR UPDATE Monthly Performance

// const Performance = require("../models/performance_model");

// /**
//  * Add or Update Monthly Performance Review
//  * POST /dept/performance/add
//  */
// router.post("/performance/add", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const { employeeId, date, ratings, comments, score } = req.body;

//     // Validate
//     if (!employeeId || !date || !ratings || !score) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // Get dept head
//     const deptHead = await Employee.findById(req.user.employeeId);
//     if (!deptHead) {
//       return res.status(404).json({
//         success: false,
//         message: "Department head not found",
//       });
//     }

//     // Ensure employee belongs to same department
//     const employee = await Employee.findById(employeeId);
//     if (!employee || employee.department !== deptHead.department) {
//       return res.status(403).json({
//         success: false,
//         message: "You can rate only employees in your department",
//       });
//     }

//     // Upsert (update if exists, else create)
//     const existing = await Performance.findOne({ employeeId, date });

//     if (existing) {
//       existing.ratings = ratings;
//       existing.comments = comments;
//       existing.score = score;
//       existing.reviewerId = deptHead._id;

//       await existing.save();

//       return res.status(200).json({
//         success: true,
//         message: "Performance updated",
//         data: existing,
//       });
//     }

//     const newPerformance = await Performance.create({
//       employeeId,
//       reviewerId: deptHead._id,
//       date,
//       ratings,
//       comments,
//       score,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Performance added successfully",
//       data: newPerformance,
//     });

//   } catch (error) {
//     console.error("Error adding performance:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to add performance",
//       error: error.message,
//     });
//   }
// });
// //⭐ B. GET Performance of Entire Department
// /**
//  * Get all team performance of a month
//  * GET /dept/performance/all?month=YYYY-MM
//  */
// router.get("/performance/all", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const month = req.query.month;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "month query is required (YYYY-MM)",
//       });
//     }

//     const deptHead = await Employee.findById(req.user.employeeId);
//     const department = deptHead.department;

//     // get employees of this dept
//     const employees = await Employee.find({
//       department,
//       active: true,
//     });

//     const employeeIds = employees.map((e) => e._id);

//     const performance = await Performance.find({
//       employeeId: { $in: employeeIds },
//       date: month,
//     }).populate("employeeId", "name email department");

//     res.status(200).json({
//       success: true,
//       message: "Performance list fetched",
//       data: performance,
//       department,
//     });
//   } catch (error) {
//     console.error("Error fetching performances:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch performance",
//       error: error.message,
//     });
//   }
// });
// //⭐ C. GET Specific Employee Performance
// /**
//  * Get single employee's performance for a month
//  * GET /dept/performance/:employeeId?month=YYYY-MM
//  */
// router.get("/performance/:employeeId", verifyAccessToken, isDeptHead, async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const month = req.query.month;

//     const deptHead = await Employee.findById(req.user.employeeId);

//     const employee = await Employee.findById(employeeId);
//     if (!employee || employee.department !== deptHead.department) {
//       return res.status(403).json({
//         success: false,
//         message: "Not allowed to view performance of other departments",
//       });
//     }

//     const performance = await Performance.findOne({
//       employeeId,
//       date: month,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Performance fetched",
//       data: performance,
//     });
//   } catch (error) {
//     console.error("Error fetching performance:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch performance",
//       error: error.message,
//     });
//   }
// });


// module.exports = router;