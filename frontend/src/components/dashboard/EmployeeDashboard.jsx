import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import Sidebar from "../common/EmployeeSidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

import {
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";

import "../../styles/dashboard.css";
import { FiMenu } from "react-icons/fi";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [dashboardData, setDashboardData] = useState({
    present: 0,
    absent: 0,
    leaves: 0,
  });

  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    try {
      const res = await axiosInstance.get(`/emp/my-attendance`);

      if (res.data.success) {
        setDashboardData({
          present: res.data.data.totalPresent,
          absent: res.data.data.totalAbsent,
          leaves: res.data.data.totalLeaves,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Days Present",
      value: dashboardData.present,
      icon: <FaCheckCircle />,
      color: "#16a34a",
      bgColor: "#dcfce7",
    },
    {
      title: "Days Absent",
      value: dashboardData.absent,
      icon: <FaTimesCircle />,
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
    {
      title: "Leaves Taken",
      value: dashboardData.leaves,
      icon: <FaCalendarCheck />,
      color: "#ea580c",
      bgColor: "#ffedd5",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="main-wrapper">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

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
        {/* <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="Employee Dashboard"
          pageSubtitle={`Welcome back, ${user?.name || "Employee"}`}
        /> */}

          <header className="top-navbar">
                  <div className="navbar-left">
                    <button className="toggle-btn" onClick={toggleSidebar}>
                      <FiMenu />
                    </button>
        
                    <div className="page-title">
                      <h1>Employee Dashboard</h1>
                     
                    </div>
                  </div>
        
                  <div className="navbar-right">
                    <div className="user-profile">
                      <img
                        src="https://ui-avatars.com/api/?name=Employee&background=4f46e5&color=fff"
                        className="profile-img"
                        alt="profile"
                      />
                      <div className="profile-info">
                        <span className="profile-name">Employee Dashboard</span>
                        <span className="profile-role">{user.name || ""}</span>
                      </div>
                    </div>
                  </div>
                </header>

        <main className="content-area">
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
                    style={{
                      backgroundColor: stat.bgColor,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>

            <div className="actions-grid">
              <button className="action-card" onClick={() => navigate("/employee/mark-attendance")}>
                <div className="action-icon" style={{ backgroundColor: "#dcfce7", color: "#059669" }}>
                  <FaCalendarCheck />
                </div>
                <span className="action-label">Mark Attendance</span>
              </button>

              <button className="action-card" onClick={() => navigate("/employee/attendance-history")}>
                <div className="action-icon" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  <FaClipboardList />
                </div>
                <span className="action-label">Attendance History</span>
              </button>

              <button className="action-card" onClick={() => navigate("/payslips")}>
                <div className="action-icon" style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
                  <FaFileInvoiceDollar />
                </div>
                <span className="action-label">View Payslips</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
