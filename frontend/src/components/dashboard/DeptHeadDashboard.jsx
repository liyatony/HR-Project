// src/components/dashboard/DeptHeadDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
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
            <div className="panel requests-panel">
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