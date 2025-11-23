import React, { useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import { FaFileAlt, FaCalendarCheck, FaDownload, FaFilter, FaFileExcel } from "react-icons/fa";
import "../../styles/reports.css";

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    department: "",
  });

  const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

  // Sample attendance data
  const attendanceData = [
    { employee: "John Doe", department: "Engineering", present: 22, absent: 2, leaves: 1, percentage: "91.7%" },
    { employee: "Sarah Johnson", department: "Marketing", present: 24, absent: 0, leaves: 1, percentage: "100%" },
    { employee: "Mike Chen", department: "Engineering", present: 21, absent: 3, leaves: 1, percentage: "87.5%" },
    { employee: "Lisa Anderson", department: "HR", present: 23, absent: 1, leaves: 1, percentage: "95.8%" },
    { employee: "David Brown", department: "Sales", present: 20, absent: 4, leaves: 1, percentage: "83.3%" },
  ];

  // Sample performance data
  const performanceData = [
    { employee: "John Doe", department: "Engineering", tasks: 45, completed: 42, rating: 4.5, status: "Excellent" },
    { employee: "Sarah Johnson", department: "Marketing", tasks: 38, completed: 36, rating: 4.2, status: "Good" },
    { employee: "Mike Chen", department: "Engineering", tasks: 50, completed: 44, rating: 4.0, status: "Good" },
    { employee: "Lisa Anderson", department: "HR", tasks: 32, completed: 30, rating: 4.7, status: "Excellent" },
    { employee: "David Brown", department: "Sales", tasks: 40, completed: 35, rating: 3.8, status: "Average" },
  ];

  const handleExcelDownload = () => {
    console.log("Downloading Excel report...");
    // Add your Excel download logic here
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="Reports"
          pageSubtitle="Generate and Export HR Reports"
        />

        <main className="content-area">
          {/* Report Type Tabs */}
          <div className="report-tabs-container">
            <button
              className={`report-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
              onClick={() => setActiveTab("attendance")}
            >
              <FaCalendarCheck className="tab-icon" />
              <span>Attendance Report</span>
            </button>
            <button
              className={`report-tab-btn ${activeTab === "performance" ? "active" : ""}`}
              onClick={() => setActiveTab("performance")}
            >
              <FaFileAlt className="tab-icon" />
              <span>Performance Report</span>
            </button>
          </div>

          {/* Filters Section */}
          <div className="report-filters-card">
            <div className="card-header">
              <FaFilter className="header-icon" />
              <h2 className="card-title">Filter Reports</h2>
            </div>

            <div className="filters-row">
              <div className="filter-input-group">
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  className="date-input"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>

              <div className="filter-input-group">
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  className="date-input"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>

              <div className="filter-input-group">
                <label className="input-label">Department</label>
                <select
                  className="select-input"
                  value={filters.department}
                  onChange={(e) =>
                    setFilters({ ...filters, department: e.target.value })
                  }
                >
                  <option value="">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="filter-button-group">
                <button className="apply-filter-btn">
                  <FaFilter /> Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview with Export */}
          <div className="report-preview-card">
            <div className="preview-header">
              <h3 className="preview-title">
                {activeTab === "attendance" ? "Attendance Report" : "Performance Report"}
              </h3>
              <button className="excel-download-btn" onClick={handleExcelDownload}>
                <FaFileExcel className="excel-icon" />
                Download as Excel
              </button>
            </div>

            {activeTab === "attendance" ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Present Days</th>
                      <th>Absent Days</th>
                      <th>Leaves</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((row, index) => (
                      <tr key={index}>
                        <td className="employee-cell">{row.employee}</td>
                        <td>{row.department}</td>
                        <td><span className="status-pill success-pill">{row.present}</span></td>
                        <td><span className="status-pill danger-pill">{row.absent}</span></td>
                        <td><span className="status-pill warning-pill">{row.leaves}</span></td>
                        <td className="percentage-cell">{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Total Tasks</th>
                      <th>Completed</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((row, index) => (
                      <tr key={index}>
                        <td className="employee-cell">{row.employee}</td>
                        <td>{row.department}</td>
                        <td>{row.tasks}</td>
                        <td><span className="status-pill info-pill">{row.completed}</span></td>
                        <td>
                          <div className="rating-display">
                            <span className="star-icon">⭐</span>
                            <span className="rating-value">{row.rating}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`performance-badge ${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;