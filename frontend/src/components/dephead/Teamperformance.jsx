import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import { 
  FaStar, 
  FaTasks, 
  FaTrophy,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaDownload
} from "react-icons/fa";
import "../../styles/Teamperformance.css";
import Rating from "@mui/material/Rating";
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../utils/AuthContext";   // to get logged-in dept head



// ⭐ Rating Section Component
// const RatingSection = ({ performanceData }) => {
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [punctuality, setPunctuality] = useState(0);
//   const [teamwork, setTeamwork] = useState(0);
//   const [quality, setQuality] = useState(0);
//   const [feedback, setFeedback] = useState("");

//   const labels = {
//     0.5: "Useless",
//     1: "Useless+",
//     1.5: "Poor",
//     2: "Poor+",
//     2.5: "Ok",
//     3: "Ok+",
//     3.5: "Good",
//     4: "Good+",
//     4.5: "Excellent",
//     5: "Excellent+",
//   };

//   const getLabelText = (value) =>
//     `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;

//   const handleSubmit = () => {
//     alert("Rating submitted successfully!");
//     console.log({
//       selectedEmployee,
//       punctuality,
//       teamwork,
//       quality,
//       feedback,
//     });
//   };

//   return (
//     <div className="rate-employee-card">
//       <h3 className="rate-title">Rate Employee</h3>

//       {/* Select Employee */}
//       <label className="form-label">Select Employee:</label>
//       <select
//         className="rate-select"
//         value={selectedEmployee}
//         onChange={(e) => setSelectedEmployee(e.target.value)}
//       >
//         <option value="">Choose employee</option>
//         {performanceData.map((emp) => (
//           <option key={emp.id} value={emp.employee}>
//             {emp.employee} ({emp.department})
//           </option>
//         ))}
//       </select>

//       {/* KPI Ratings */}
//       <div className="kpi-group">
//         <div className="kpi-item">
//           <label>Punctuality</label>
//           <Rating
//             name="punctuality"
//             value={punctuality}
//             precision={0.5}
//             getLabelText={getLabelText}
//             onChange={(e, val) => setPunctuality(val)}
//           />
//         </div>

//         <div className="kpi-item">
//           <label>Teamwork</label>
//           <Rating
//             name="teamwork"
//             value={teamwork}
//             precision={0.5}
//             getLabelText={getLabelText}
//             onChange={(e, val) => setTeamwork(val)}
//           />
//         </div>

//         <div className="kpi-item">
//           <label>Quality</label>
//           <Rating
//             name="quality"
//             value={quality}
//             precision={0.5}
//             getLabelText={getLabelText}
//             onChange={(e, val) => setQuality(val)}
//           />
//         </div>
//       </div>

//       {/* Feedback */}
//       <label className="form-label">Feedback</label>
//       <textarea
//         className="feedback-box"
//         placeholder="Write feedback here..."
//         value={feedback}
//         onChange={(e) => setFeedback(e.target.value)}
//       />

//       {/* Submit Button */}
//       <button className="btn-submit-rating" onClick={handleSubmit}>
//         Submit Rating
//       </button>
//     </div>
//   );
// };
// ⭐ Updated Rating Section Component (Fully Working with Hover Labels)
const RatingSection = ({ performanceData }) => {
  const { user } = useAuth();

  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Rating values
  const [punctuality, setPunctuality] = useState(0);
  const [teamwork, setTeamwork] = useState(0);
  const [quality, setQuality] = useState(0);

  // Hover states
  const [hoverPunctuality, setHoverPunctuality] = useState(-1);
  const [hoverTeamwork, setHoverTeamwork] = useState(-1);
  const [hoverQuality, setHoverQuality] = useState(-1);

  const [feedback, setFeedback] = useState("");

  const labels = {
    0.5: "Useless",
    1: "Useless+",
    1.5: "Poor",
    2: "Poor+",
    2.5: "Ok",
    3: "Ok+",
    3.5: "Good",
    4: "Good+",
    4.5: "Excellent",
    5: "Excellent+",
  };

  const getLabelText = (value) =>
    `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;

  // const handleSubmit = () => {
  //   alert("Rating submitted successfully!");
  //   console.log({
  //     selectedEmployee,
  //     punctuality,
  //     teamwork,
  //     quality,
  //     feedback,
  //   });
  // };
// const handleSubmit = async () => {
//   if (!selectedEmployee) {
//     alert("Please select an employee");
//     return;
//   }

//   const month = new Date().toISOString().slice(0, 7); // YYYY-MM
//   const score = ((punctuality + teamwork + quality) / 3).toFixed(1);

//   try {
//     const res = await axiosInstance.post("/dept/performance/add", {
//       employeeId: selectedEmployee,
//       date: month,
//       ratings: {
//         punctuality,
//         teamwork,
//         quality
//       },
//       comments: feedback,
//       score
//     });

//     alert("Performance saved!");
//     console.log("Saved:", res.data);

//     window.location.reload(); // refresh table
//   } catch (err) {
//     console.error("Error posting performance:", err);
//     alert("Failed to save rating");
//   }
// };
const handleSubmit = async () => {
  if (!selectedEmployee) {
    alert("Please select an employee");
    return;
  }

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Force numbers
  const safePunctuality = punctuality || 0;
  const safeTeamwork = teamwork || 0;
  const safeQuality = quality || 0;

  const score = ((safePunctuality + safeTeamwork + safeQuality) / 3).toFixed(1);

  try {
    const res = await axiosInstance.post("/dept/performance/add", {
      employeeId: selectedEmployee,
      reviewerId: user?.employeeId, 
      date: month,
      ratings: {
        taskCompletion: safePunctuality,
  attendance: safeTeamwork,
  behaviour: safeQuality
      },
      comments: feedback,
      score
    });

    alert("Performance saved!");
    console.log("Saved:", res.data);
    window.location.reload();

  } catch (err) {
    console.error("Error posting performance:", err.response?.data || err);
    alert("Failed to save rating");
  }
};



  return (
    <div className="rate-employee-card">
      <h3 className="rate-title">Rate Employee</h3>

      {/* Select Employee */}
      <label className="form-label">Select Employee:</label>
      <select
        className="rate-select"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
      >
        <option value="">Choose employee</option>
        {performanceData.map((emp) => (
          <option key={emp.id} value={emp.empId}>
            {emp.employee} - ID: {emp.empId}
          </option>
        ))}
      </select>

      {/* KPI Ratings */}
      <div className="kpi-group">

        {/* ⭐ Punctuality */}
        <div className="kpi-item">
          <label>Punctuality</label>
          <div className="rating-line">
            <Rating
              name="punctuality"
              value={punctuality}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={(event, newValue) => setPunctuality(newValue || 0)}

              onChangeActive={(event, newHover) => setHoverPunctuality(newHover)}
            />
            {punctuality !== null && (
              <span className="rating-label">
                {labels[hoverPunctuality !== -1 ? hoverPunctuality : punctuality]}
              </span>
            )}
          </div>
        </div>

        {/* ⭐ Teamwork */}
        <div className="kpi-item">
          <label>Teamwork</label>
          <div className="rating-line">
            <Rating
              name="teamwork"
              value={teamwork}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={(event, newValue) => setTeamwork(newValue || 0)}

              onChangeActive={(event, newHover) => setHoverTeamwork(newHover)}
            />
            {teamwork !== null && (
              <span className="rating-label">
                {labels[hoverTeamwork !== -1 ? hoverTeamwork : teamwork]}
              </span>
            )}
          </div>
        </div>

        {/* ⭐ Quality */}
        <div className="kpi-item">
          <label>Quality</label>
          <div className="rating-line">
            <Rating
              name="quality"
              value={quality}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={(event, newValue) => setQuality(newValue || 0)}

              onChangeActive={(event, newHover) => setHoverQuality(newHover)}
            />
            {quality !== null && (
              <span className="rating-label">
                {labels[hoverQuality !== -1 ? hoverQuality : quality]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <label className="form-label">Feedback</label>
      <textarea
        className="feedback-box"
        placeholder="Write feedback here..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />

      <button className="btn-submit-rating" onClick={handleSubmit}>
        Submit Rating
      </button>
    </div>
  );
};



const Teamperformance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("performance");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

  // Sample performance data
  // const performanceData = [
  //   {
  //     id: 1,
  //     employee: "John Doe",
  //     empId: "EMP001",
  //     department: "Engineering",
  //     tasksAssigned: 45,
  //     tasksCompleted: 42,
  //     rating: 4.5,
  //     lastReview: "2024-12-15",
  //     status: "Excellent",
  //     completionRate: "93.3%"
  //   },
  //   {
  //     id: 2,
  //     employee: "Sarah Johnson",
  //     empId: "EMP002",
  //     department: "Marketing",
  //     tasksAssigned: 38,
  //     tasksCompleted: 36,
  //     rating: 4.2,
  //     lastReview: "2024-12-20",
  //     status: "Good",
  //     completionRate: "94.7%"
  //   },
  //   {
  //     id: 3,
  //     employee: "Mike Chen",
  //     empId: "EMP003",
  //     department: "Engineering",
  //     tasksAssigned: 50,
  //     tasksCompleted: 44,
  //     rating: 4.0,
  //     lastReview: "2024-12-10",
  //     status: "Good",
  //     completionRate: "88.0%"
  //   },
  //   {
  //     id: 4,
  //     employee: "Lisa Anderson",
  //     empId: "EMP004",
  //     department: "HR",
  //     tasksAssigned: 32,
  //     tasksCompleted: 30,
  //     rating: 4.7,
  //     lastReview: "2025-01-05",
  //     status: "Excellent",
  //     completionRate: "93.8%"
  //   },
  //   {
  //     id: 5,
  //     employee: "David Brown",
  //     empId: "EMP005",
  //     department: "Sales",
  //     tasksAssigned: 40,
  //     tasksCompleted: 35,
  //     rating: 3.8,
  //     lastReview: "2024-12-18",
  //     status: "Average",
  //     completionRate: "87.5%"
  //   },
  //   {
  //     id: 6,
  //     employee: "Emma Wilson",
  //     empId: "EMP006",
  //     department: "Finance",
  //     tasksAssigned: 35,
  //     tasksCompleted: 34,
  //     rating: 4.6,
  //     lastReview: "2025-01-02",
  //     status: "Excellent",
  //     completionRate: "97.1%"
  //   },
  // ];
  const [performanceData, setPerformanceData] = useState([]);
const { user } = useAuth();
useEffect(() => {
  const fetchTeam = async () => {
    try {
      const res = await axiosInstance.get("/dept/my-team");

      console.log("Team members:", res.data.data);

      const formatted = res.data.data.map((emp, i) => ({
        id: i + 1,
        employee: emp.name,
        empId: emp._id,
        department: emp.department,
        tasksAssigned: 0,
        tasksCompleted: 0,
        rating: 0,
        lastReview: "-",
        status: "Not Rated",
        completionRate: "0%",
      }));

      setPerformanceData(formatted);
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  };

  fetchTeam();
}, []);



  const statsData = [
    { 
      title: "Avg Performance", 
      value: "4.3/5.0", 
      icon: <FaStar />, 
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    { 
      title: "Tasks Completed", 
      value: "221/240", 
      icon: <FaTasks />, 
      color: "#059669",
      bgColor: "#d1fae5"
    },
    { 
      title: "Top Performers", 
      value: "18", 
      icon: <FaTrophy />, 
      color: "#dc2626",
      bgColor: "#fee2e2"
    },
    { 
      title: "Avg Completion", 
      value: "92.1%", 
      icon: <FaChartLine />, 
      color: "#4f46e5",
      bgColor: "#e0e7ff"
    },
  ];

  const handleExportReport = () => {
    console.log("Exporting performance report...");
    console.log("Department:", filterDepartment || "All");
    console.log("Status:", filterStatus || "All");
  };

  const handleApplyFilters = () => {
    console.log("Applying filters...");
    console.log("Search:", searchTerm);
    console.log("Department:", filterDepartment);
    console.log("Status:", filterStatus);
  };
  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="main-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="Performance Management"
          pageSubtitle="Track and evaluate employee performance"
        />

        <main className="content-area">
          {/* Stats Cards
          <div className="performance-stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="performance-stat-card">
                <div className="stat-icon-box" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <p className="stat-label">{stat.title}</p>
                  <h3 className="stat-number">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div> */}

          {/* Filters Section */}
          <div className="performance-filters-card">
            <div className="filters-header">
              <h3 className="filters-title">
                <FaFilter /> Filter Performance Records
              </h3>
            </div>

            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-item">
                  <label className="filter-label">Search Employee</label>
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon-input" />
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input-field"
                    />
                  </div>
                </div>

                <div className="filter-item">
                  <label className="filter-label">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="department-select-field"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label className="filter-label">Performance Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="department-select-field"
                  >
                    <option value="">All Status</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn-apply-filter" onClick={handleApplyFilters}>
                  <FaFilter /> Apply Filters
                </button>
                <button className="btn-export-report" onClick={handleExportReport}>
                  <FaDownload /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="performance-table-card">
            <div className="table-header">
              <h3 className="table-title">
                <FaChartLine /> Employee Performance Overview
              </h3>
              <span className="record-count">{performanceData.length} Employees</span>
            </div>

            <div className="table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Tasks Assigned</th>
                    <th>Tasks Completed</th>
                    <th>Completion Rate</th>
                    <th>Rating</th>
                    <th>Last Review</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((record) => (
                    <tr key={record.id}>
                      <td className="emp-id-cell">{record.empId}</td>
                      <td className="emp-name-cell">{record.employee}</td>
                      <td>{record.department}</td>
                      <td className="tasks-cell">{record.tasksAssigned}</td>
                      <td className="tasks-cell completed">{record.tasksCompleted}</td>
                      <td className="completion-cell">{record.completionRate}</td>
                      <td>
                        <div className="rating-box">
                          <FaStar className="star-icon" />
                          <span className="rating-value">{record.rating}</span>
                        </div>
                      </td>
                      <td className="date-cell">{record.lastReview}</td>
                      <td>
                        <span className={`performance-status-badge ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <RatingSection performanceData={performanceData} />

        </main>
      </div>
    </div>
  );
};

export default Teamperformance;