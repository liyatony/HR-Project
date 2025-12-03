// import React, { useEffect, useState } from "react";
// import Sidebar from "../common/DeptHeadSidebar";
// import Navbar from "../common/DepHeadNavbar";
// import axiosInstance from "../../utils/axiosInstance";
// import {
//   FaCalendarCheck,
//   FaUserCheck,
//   FaUserTimes,
//   FaCalendarAlt,
//   FaClock,
//   FaSearch,
//   FaFilter,
//   FaDownload,
// } from "react-icons/fa";
// import "../../styles/attendance.css";
// import { useAuth } from "../../utils/AuthContext";

// const Attendancecheck = () => {
//   const { user } = useAuth();


//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState("attendance");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStartDate, setFilterStartDate] = useState("2025-01-01");
//   const [filterEndDate, setFilterEndDate] = useState("");
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  
//   const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

//   useEffect(() => {
//     if (!filterStartDate) return;

//     // const fetchAttendance = async () => {
//     //   try {
//     //     setLoading(true);
//     //     setError(null);
        
//     //     const response = await axiosInstance.get("/admin/attendance_records", {
//     //       params: { date: filterStartDate },
//     //     });
        
//     //     console.log("Attendance data:", response.data);
//     //     setAttendanceRecords(response.data.data || []);
//     //   } catch (err) {
//     //     console.error("Error fetching attendance data:", err);
//     //     setError(err.response?.data?.message || "Failed to fetch attendance");
//     //     setAttendanceRecords([]);
//     //   } finally {
//     //     setLoading(false);
//     //   }
//     // };
// const fetchAttendance = async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     let response;

//     if (user?.role === "dpt_head") {
//       // 🔥 Show ONLY employees from this department
//       response = await axiosInstance.get("/dept/my-team");
      
//       // Convert to a simple employee list (not attendance)
//       const employees = response.data.data || [];

//       // Show them in table format
//       const formatted = employees.map(emp => ({
//         _id: emp._id,
//         employeeName: emp.name,
//         employeeId: emp,
//         department: emp.department,
//         date: filterStartDate,
//         checkIn: "-",
//         checkOut: "-",
//         totalHours: "-",
//         status: "absent", // Default if no attendance
//       }));

//       setAttendanceRecords(formatted);
      
//     } else {
//       // Admin → show normal attendance
//       response = await axiosInstance.get("/admin/attendance_records", {
//         params: { date: filterStartDate },
//       });

//       setAttendanceRecords(response.data.data || []);
//     }

//   } catch (err) {
//     console.error("Error fetching attendance data:", err);
//     setError(err.response?.data?.message || "Failed to fetch attendance");
//     setAttendanceRecords([]);
//   } finally {
//     setLoading(false);
//   }
// };

//     fetchAttendance();
//   }, [filterStartDate]);

//   const statsData = [
//     {
//       title: "Total Present",
//       value: attendanceRecords.filter(r => r.status === "present").length,
//       icon: <FaUserCheck />,
//       color: "#16a34a",
//       bgColor: "#dcfce7",
//     },
//     {
//       title: "Total Absent",
//       value: attendanceRecords.filter(r => r.status === "absent").length,
//       icon: <FaUserTimes />,
//       color: "#dc2626",
//       bgColor: "#fee2e2",
//     },
//     {
//       title: "On Leave",
//       value: attendanceRecords.filter(r => r.status === "leave").length,
//       icon: <FaCalendarAlt />,
//       color: "#ea580c",
//       bgColor: "#ffedd5",
//     },
//     {
//       title: "Late Arrivals",
//       value: attendanceRecords.filter(r => r.isLate).length,
//       icon: <FaClock />,
//       color: "#d97706",
//       bgColor: "#fef3c7",
//     },
//   ];

//   const handleExportReport = () => {
//     console.log("Exporting attendance report...");
//     console.log("Date Range:", filterStartDate, "to", filterEndDate);
//     console.log("Department:", filterDepartment || "All");
//   };

//   const handleApplyFilters = () => {
//     console.log("Applying filters...");
//     console.log("Start Date:", filterStartDate);
//     console.log("End Date:", filterEndDate);
//     console.log("Department:", filterDepartment);
//   };

//   return (
//     <div className="dashboard-wrapper">
//       {sidebarOpen && (
//         <div className="sidebar-overlay" onClick={toggleSidebar}></div>
//       )}

//       <Sidebar
//         isOpen={sidebarOpen}
//         toggleSidebar={toggleSidebar}
//         activeMenu={activeMenu}
//         setActiveMenu={setActiveMenu}
//       />

//       <div className="main-wrapper">
//         <Navbar
//           toggleSidebar={toggleSidebar}
//           pageTitle="Attendance Management"
//           pageSubtitle="Track and manage employee attendance"
//         />

//         <main className="content-area">
//           {/* Stats Cards
//           <div className="attendance-stats-grid">
//             {statsData.map((stat, index) => (
//               <div key={index} className="attendance-stat-card">
//                 <div 
//                   className="stat-icon-box" 
//                   style={{ backgroundColor: stat.bgColor, color: stat.color }}
//                 >
//                   {stat.icon}
//                 </div>
//                 <div className="stat-details">
//                   <p className="stat-label">{stat.title}</p>
//                   <h3 className="stat-number">{stat.value}</h3>
//                 </div>
//               </div>
//             ))}
//           </div> */}

//           {/* Filters Section */}
//           <div className="attendance-filters-card">
//             <div className="filters-header">
//               <h3 className="filters-title">
//                 <FaFilter /> Filter Attendance Records
//               </h3>
//             </div>

//             <div className="filters-container">
//               <div className="filter-row">
//                 <div className="filter-item">
//                   <label className="filter-label">Select A Date</label>
//                   <input
//                     type="date"
//                     value={filterStartDate}
//                     onChange={(e) => setFilterStartDate(e.target.value)}
//                     className="date-input-field"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Loading State */}
//           {loading && (
//             <div style={{ textAlign: 'center', padding: '2rem' }}>
//               <p>Loading attendance records...</p>
//             </div>
//           )}

//           {/* Error State */}
//           {error && (
//             <div style={{ 
//               textAlign: 'center', 
//               padding: '2rem', 
//               color: '#dc2626',
//               backgroundColor: '#fee2e2',
//               borderRadius: '8px',
//               margin: '1rem 0'
//             }}>
//               <p>{error}</p>
//             </div>
//           )}

//           {/* Attendance Table */}
//           {!loading && !error && (
//             <div className="attendance-table-card">
//               <div className="table-header">
//                 <h3 className="table-title">
//                   <FaCalendarCheck /> Attendance Records
//                 </h3>
//                 <span className="record-count">
//                   {attendanceRecords.length} Records
//                 </span>
//               </div>

//               <div className="table-wrapper">
//                 <table className="attendance-table">
//                   <thead>
//                     <tr>
//                       <th>Employee ID</th>
//                       <th>Employee Name</th>
//                       <th>Department</th>
//                       <th>Date</th>
//                       <th>Check In</th>
//                       <th>Check Out</th>
//                       <th>Hours</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {attendanceRecords.length === 0 ? (
//                       <tr>
//                         <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
//                           No attendance records found for this date
//                         </td>
//                       </tr>
//                     ) : (
//                       attendanceRecords.map((record) => (
//                         <tr key={record._id}>
//                           <td className="emp-id-cell">
//                             {record.employeeId?._id?.substring(0, 8) || 'N/A'}
//                           </td>
//                           <td className="emp-name-cell">{record.employeeName}</td>
//                           <td>{record.employeeId?.department || 'N/A'}</td>
//                           <td>
//                             {new Date(record.date).toLocaleDateString()}
//                           </td>
//                           <td className="time-cell">{record.checkIn || '-'}</td>
//                           <td className="time-cell">{record.checkOut || '-'}</td>
//                           <td className="hours-cell">
//                             {record.totalHours ? `${record.totalHours}hrs` : '-'}
//                           </td>
//                           <td>
//                             <span
//                               className={`status-badge-attendance ${record.status.toLowerCase()}`}
//                             >
//                               {record.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Attendancecheck;





// src/components/dashboard/DeptHeadDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import Sidebar from "../common/DeptHeadSidebar";
import Navbar from "../common/DepHeadNavbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaUsers,
  FaCalendarCheck,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClock,
  FaChartLine,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import "../../styles/dashboard.css";

const DeptHeadDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    departmentStats: {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      onLeave: 0,
    },
    pendingLeaveRequests: [],
    recentActivities: [],
    teamPerformance: [],
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchDeptHeadDashboard();
  }, []);

  const fetchDeptHeadDashboard = async () => {
    try {
      setLoading(true);
      
      // Fetch department-specific data using NEW endpoints
      const [teamRes, attendanceRes, summaryRes, leavesRes] = await Promise.all([
        axiosInstance.get(`/dept/my-team`),  // Gets ONLY this dept head's team
        axiosInstance.get(`/dept/team-attendance`),  // Gets ONLY this dept's attendance
        axiosInstance.get(`/dept/team-attendance-summary`),  // Gets summary
        axiosInstance.get(`/dept/team-leave-requests`),  // Gets ONLY this dept's leaves
      ]);

      const team = teamRes.data.data || [];
      const attendance = attendanceRes.data.data || [];
      const summary = summaryRes.data.data || {};
      const leaves = leavesRes.data.data || [];

      setDashboardData({
        departmentStats: {
          totalEmployees: summary.totalEmployees || team.length,
          presentToday: summary.totalPresent || 0,
          absentToday: summary.totalAbsent || 0,
          onLeave: summary.totalLeave || 0,
        },
        pendingLeaveRequests: leaves.filter(l => l.status === "pending"),
        recentActivities: attendance.slice(0, 5),
        teamPerformance: team,
      });
    } catch (error) {
      console.error("Failed to fetch department dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      await axiosInstance.put(`/emp/leave-request/${leaveId}`, {
        status: action,
        approvedBy: user.id,
      });
      
      // Refresh data
      fetchDeptHeadDashboard();
    } catch (error) {
      console.error("Failed to update leave request:", error);
    }
  };

  const statsCards = [
    {
      title: "Team Members",
      value: dashboardData.departmentStats.totalEmployees,
      icon: <FaUsers />,
      color: "#4f46e5",
      bgColor: "#eef2ff",
    },
    {
      title: "Present Today",
      value: dashboardData.departmentStats.presentToday,
      icon: <FaUserCheck />,
      color: "#059669",
      bgColor: "#ecfdf5",
    },
    {
      title: "Absent Today",
      value: dashboardData.departmentStats.absentToday,
      icon: <FaUserTimes />,
      color: "#dc2626",
      bgColor: "#fef2f2",
    },
    {
      title: "On Leave",
      value: dashboardData.departmentStats.onLeave,
      icon: <FaClipboardList />,
      color: "#ea580c",
      bgColor: "#fff7ed",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="main-wrapper">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

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
          pageTitle={`${user?.department || ''} Department Dashboard`}
          pageSubtitle={`Welcome back, ${user?.name || 'Department Head'}`}
        />

        <main className="content-area">
          {/* Stats Cards */}
          <div className="stats-grid">
            {statsCards.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-info">
                    <p className="stat-title">{stat.title}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                  </div>
                  <div
                    className="stat-icon"
                    style={{ backgroundColor: stat.bgColor, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Pending Leave Requests */}
            {/* <div className="panel requests-panel">
              <div className="panel-header">
                <h3 className="panel-title">Pending Leave Requests</h3>
                <span className="badge-count">
                  {dashboardData.pendingLeaveRequests.length}
                </span>
              </div>
              <div className="panel-body">
                {dashboardData.pendingLeaveRequests.length === 0 ? (
                  <p style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#6b7280' 
                  }}>
                    No pending requests
                  </p>
                ) : (
                  dashboardData.pendingLeaveRequests.map((req, index) => (
                    <div key={index} className="request-item">
                      <div className="request-icon">
                        <FaHourglassHalf />
                      </div>
                      <div className="request-content">
                        <p className="request-type">{req.leaveType}</p>
                        <p className="request-employee">{req.employeeName}</p>
                        <span className="request-dept">
                          {req.startDate} to {req.endDate}
                        </span>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="btn-icon btn-approve"
                          onClick={() => handleLeaveAction(req._id, 'approved')}
                          title="Approve"
                        >
                          <FaCheckCircle />
                        </button>
                        <button 
                          className="btn-icon btn-reject"
                          onClick={() => handleLeaveAction(req._id, 'rejected')}
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> */}
            {/* Pending Requests */}
                        <div className="panel requests-panel">
                          <div className="panel-header">
                            <h3 className="panel-title">Pending Leave Requests</h3>
                            <span className="badge-count">{pendingRequests.length}</span>
                          </div>
                          <div className="panel-body">
                            {pendingRequests.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                <p>No pending leave requests</p>
                              </div>
                            ) : (
                              pendingRequests.slice(0, 5).map((req, index) => (
                                <div key={index} className="request-item">
                                  <div className="request-icon">
                                    <FaHourglassHalf />
                                  </div>
                                  <div className="request-content">
                                    <p className="request-type">Leave Request</p>
                                    <p className="request-employee">{req.employeeId.name}</p>
                                    <span className="request-dept">{req.employeeId.department}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="panel-footer">
                            <button 
                              className="btn-secondary btn-block" 
                              onClick={() => navigate("/admin/leave-management")}
                            >
                              View All Requests
                            </button>
                          </div>
                        </div>

            {/* Recent Activities */}
            <div className="panel activity-panel">
              <div className="panel-header">
                <h3 className="panel-title">Today's Attendance</h3>
                <button className="btn-text">View All</button>
              </div>
              <div className="panel-body">
                {dashboardData.recentActivities.length === 0 ? (
                  <p style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#6b7280' 
                  }}>
                    No activities
                  </p>
                ) : (
                  dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div 
                        className="activity-icon" 
                        style={{ 
                          color: activity.status === 'present' 
                            ? '#059669' 
                            : activity.status === 'absent' 
                            ? '#dc2626' 
                            : '#ea580c' 
                        }}
                      >
                        {activity.status === 'present' ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{activity.employeeName}</strong> - {activity.status}
                        </p>
                        <span className="activity-time">
                          <FaClock /> {activity.checkIn || 'Not checked in'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card">
                <div className="action-icon" style={{ 
                  backgroundColor: '#eef2ff', 
                  color: '#4f46e5' 
                }}>
                  <FaUsers />
                </div>
                <span className="action-label">View Team Members</span>
              </button>
              <button className="action-card">
                <div className="action-icon" style={{ 
                  backgroundColor: '#ecfdf5', 
                  color: '#059669' 
                }}>
                  <FaCalendarCheck />
                </div>
                <span className="action-label">Team Attendance</span>
              </button>
              <button className="action-card">
                <div className="action-icon" style={{ 
                  backgroundColor: '#fff7ed', 
                  color: '#ea580c' 
                }}>
                  <FaClipboardList />
                </div>
                <span className="action-label">Leave Requests</span>
              </button>
              <button className="action-card">
                <div className="action-icon" style={{ 
                  backgroundColor: '#fef2f2', 
                  color: '#dc2626' 
                }}>
                  <FaChartLine />
                </div>
                <span className="action-label">Team Performance</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeptHeadDashboard;