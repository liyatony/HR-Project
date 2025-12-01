import React, { useEffect, useState } from "react";
import Sidebar from "../common/DeptHeadSidebar";
import Navbar from "../common/DepHeadNavbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import "../../styles/attendance.css";

const Attendancecheck = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("attendance");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("2025-01-01");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

  useEffect(() => {
    if (!filterStartDate) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get("/admin/attendance_records", {
          params: { date: filterStartDate },
        });
        
        console.log("Attendance data:", response.data);
        setAttendanceRecords(response.data.data || []);
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError(err.response?.data?.message || "Failed to fetch attendance");
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [filterStartDate]);

  const statsData = [
    {
      title: "Total Present",
      value: attendanceRecords.filter(r => r.status === "present").length,
      icon: <FaUserCheck />,
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      title: "Total Absent",
      value: attendanceRecords.filter(r => r.status === "absent").length,
      icon: <FaUserTimes />,
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
    {
      title: "On Leave",
      value: attendanceRecords.filter(r => r.status === "leave").length,
      icon: <FaCalendarAlt />,
      color: "#ea580c",
      bgColor: "#ffedd5",
    },
    {
      title: "Late Arrivals",
      value: attendanceRecords.filter(r => r.isLate).length,
      icon: <FaClock />,
      color: "#d97706",
      bgColor: "#fef3c7",
    },
  ];

  const handleExportReport = () => {
    console.log("Exporting attendance report...");
    console.log("Date Range:", filterStartDate, "to", filterEndDate);
    console.log("Department:", filterDepartment || "All");
  };

  const handleApplyFilters = () => {
    console.log("Applying filters...");
    console.log("Start Date:", filterStartDate);
    console.log("End Date:", filterEndDate);
    console.log("Department:", filterDepartment);
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="main-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="Attendance Management"
          pageSubtitle="Track and manage employee attendance"
        />

        <main className="content-area">
          {/* Stats Cards
          <div className="attendance-stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="attendance-stat-card">
                <div 
                  className="stat-icon-box" 
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
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
          <div className="attendance-filters-card">
            <div className="filters-header">
              <h3 className="filters-title">
                <FaFilter /> Filter Attendance Records
              </h3>
            </div>

            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-item">
                  <label className="filter-label">Select A Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="date-input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading attendance records...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              margin: '1rem 0'
            }}>
              <p>{error}</p>
            </div>
          )}

          {/* Attendance Table */}
          {!loading && !error && (
            <div className="attendance-table-card">
              <div className="table-header">
                <h3 className="table-title">
                  <FaCalendarCheck /> Attendance Records
                </h3>
                <span className="record-count">
                  {attendanceRecords.length} Records
                </span>
              </div>

              <div className="table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No attendance records found for this date
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((record) => (
                        <tr key={record._id}>
                          <td className="emp-id-cell">
                            {record.employeeId?._id?.substring(0, 8) || 'N/A'}
                          </td>
                          <td className="emp-name-cell">{record.employeeName}</td>
                          <td>{record.employeeId?.department || 'N/A'}</td>
                          <td>
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="time-cell">{record.checkIn || '-'}</td>
                          <td className="time-cell">{record.checkOut || '-'}</td>
                          <td className="hours-cell">
                            {record.totalHours ? `${record.totalHours}hrs` : '-'}
                          </td>
                          <td>
                            <span
                              className={`status-badge-attendance ${record.status.toLowerCase()}`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Attendancecheck;