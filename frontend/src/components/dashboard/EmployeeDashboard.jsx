// src/components/dashboard/EmployeeDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import "../../styles/dashboard.css";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState({
    attendance: { present: 0, absent: 0, leaves: 0 },
    recentPayslips: [],
    leaveRequests: [],
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchEmployeeDashboardData();
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      // You'll need to create these endpoints in your backend
      const [attendanceRes, payslipsRes, leavesRes] = await Promise.all([
        axiosInstance.get(`/emp/my-attendance`),
        axiosInstance.get(`/emp/my-payslips`),
        axiosInstance.get(`/emp/my-leaves`),
      ]);

      setDashboardData({
        attendance: attendanceRes.data.data || { present: 0, absent: 0, leaves: 0 },
        recentPayslips: payslipsRes.data.data || [],
        leaveRequests: leavesRes.data.data || [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Days Present",
      value: dashboardData.attendance.present,
      icon: <FaCheckCircle />,
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      title: "Days Absent",
      value: dashboardData.attendance.absent,
      icon: <FaTimesCircle />,
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
    {
      title: "Leaves Taken",
      value: dashboardData.attendance.leaves,
      icon: <FaCalendarCheck />,
      color: "#ea580c",
      bgColor: "#ffedd5",
    },
    {
      title: "Pending Requests",
      value: dashboardData.leaveRequests.filter(l => l.status === "pending").length,
      icon: <FaHourglassHalf />,
      color: "#d97706",
      bgColor: "#fef3c7",
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
          pageTitle="Employee Dashboard"
          pageSubtitle={`Welcome back, ${user?.name || 'Employee'}`}
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
            {/* Recent Payslips */}
            <div className="panel activity-panel">
              <div className="panel-header">
                <h3 className="panel-title">
                  <FaFileInvoiceDollar /> Recent Payslips
                </h3>
              </div>
              <div className="panel-body">
                {dashboardData.recentPayslips.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No payslips available
                  </p>
                ) : (
                  dashboardData.recentPayslips.map((payslip, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon" style={{ color: '#16a34a' }}>
                        <FaFileInvoiceDollar />
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{payslip.month}</strong> - ₹{payslip.netSalary?.toLocaleString()}
                        </p>
                        <span className="activity-time">
                          <FaClock /> {new Date(payslip.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button className="btn-text">Download</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Leave Requests */}
            <div className="panel requests-panel">
              <div className="panel-header">
                <h3 className="panel-title">
                  <FaClipboardList /> My Leave Requests
                </h3>
              </div>
              <div className="panel-body">
                {dashboardData.leaveRequests.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No leave requests
                  </p>
                ) : (
                  dashboardData.leaveRequests.slice(0, 5).map((leave, index) => (
                    <div key={index} className="request-item">
                      <div className="request-icon">
                        <FaHourglassHalf />
                      </div>
                      <div className="request-content">
                        <p className="request-type">{leave.leaveType}</p>
                        <p className="request-employee">
                          {leave.startDate} to {leave.endDate}
                        </p>
                        <span className="request-dept">{leave.days} days</span>
                      </div>
                      <span className={`leave-status-badge ${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
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
                <div className="action-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <FaCalendarCheck />
                </div>
                <span className="action-label">Apply for Leave</span>
              </button>
              <button className="action-card">
                <div className="action-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <FaFileInvoiceDollar />
                </div>
                <span className="action-label">View Payslips</span>
              </button>
              <button className="action-card">
                <div className="action-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  <FaClipboardList />
                </div>
                <span className="action-label">My Attendance</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;