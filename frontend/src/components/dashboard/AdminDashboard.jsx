// src/components/admin/AdminDashboard.jsx
import React, { useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import {
  FaFileInvoiceDollar,
  FaUserTie,
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClock,
  FaStar
} from "react-icons/fa";
import "../../styles/dashboard.css";
import Add_employee from "../employee/Add_employee";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
   const [showAddEmployee, setShowAddEmployee] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigate =useNavigate()

  const statsCards = [
    { title: "Total Employees", value: "124", change: "+8 this month", changeType: "positive", icon: <FaUserTie />, color: "#4f46e5", bgColor: "#eef2ff" },
    { title: "Attendance Rate", value: "98.2%", change: "+2.3% from last month", changeType: "positive", icon: <FaCalendarCheck />, color: "#059669", bgColor: "#ecfdf5" },
    { title: "Monthly Payroll", value: "₹3.2L", change: "Processed on time", changeType: "neutral", icon: <FaFileInvoiceDollar />, color: "#dc2626", bgColor: "#fef2f2" },
    { title: "Avg Performance", value: "87.5%", change: "+5.2% improvement", changeType: "positive", icon: <FaChartLine />, color: "#ea580c", bgColor: "#fff7ed" },
  ];

  const recentActivities = [
    { user: "John Doe", action: "marked attendance", time: "10 mins ago", icon: <FaCheckCircle />, color: "#059669" },
    { user: "Priya Sharma", action: "approved leave request", time: "25 mins ago", icon: <FaCheckCircle />, color: "#059669" },
    { user: "System", action: "generated monthly payroll", time: "1 hour ago", icon: <FaFileInvoiceDollar />, color: "#4f46e5" },
    { user: "Rajesh Kumar", action: "submitted performance review", time: "2 hours ago", icon: <FaStar />, color: "#ea580c" },
    { user: "Admin", action: "added new employee", time: "3 hours ago", icon: <FaUserTie />, color: "#0891b2" },
  ];

  const pendingRequests = [
    { type: "Leave Request", employee: "Sarah Johnson", department: "Marketing", icon: <FaHourglassHalf /> },
    { type: "Leave Request", employee: "Mike Chen", department: "Engineering", icon: <FaHourglassHalf /> },
    { type: "Attendance Appeal", employee: "Lisa Anderson", department: "HR", icon: <FaHourglassHalf /> },
    { type: "Leave Request", employee: "David Brown", department: "Sales", icon: <FaHourglassHalf /> },
  ];

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
          pageTitle="Dashboard"
          pageSubtitle="Welcome back, Admin"
        />

        <main className="content-area">
          <div className="stats-grid">
            {statsCards.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-info">
                    <p className="stat-title">{stat.title}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                    <span className={`stat-change ${stat.changeType}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="content-grid">
            <div className="panel activity-panel">
              <div className="panel-header">
                <h3 className="panel-title">Recent Activities</h3>
                <button className="btn-text">View All</button>
              </div>
              <div className="panel-body">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon" style={{ color: activity.color }}>
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{activity.user}</strong> {activity.action}
                      </p>
                      <span className="activity-time">
                        <FaClock /> {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel requests-panel">
              <div className="panel-header">
                <h3 className="panel-title">Pending Requests</h3>
                <span className="badge-count">{pendingRequests.length}</span>
              </div>
              <div className="panel-body">
                {pendingRequests.map((req, index) => (
                  <div key={index} className="request-item">
                    <div className="request-icon">{req.icon}</div>
                    <div className="request-content">
                      <p className="request-type">{req.type}</p>
                      <p className="request-employee">{req.employee}</p>
                      <span className="request-dept">{req.department}</span>
                    </div>
                    <div className="request-actions">
                      <button className="btn-icon btn-approve"><FaCheckCircle /></button>
                      <button className="btn-icon btn-reject"><FaTimesCircle /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel-footer">
                <button className="btn-secondary btn-block">View All Requests</button>
              </div>
            </div>
          </div>

          <div className="quick-actions-section">
            <Add_employee
                isOpen={showAddEmployee}
                onClose={() => setShowAddEmployee(false)}
                onSubmit={(formData) => {
                  setShowAddEmployee(false);
                }}
              />
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={()=>{setShowAddEmployee(true)}}>
                <div className="action-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  <FaUserTie />
                </div>
                <span className="action-label">Add Employee</span>
                
              </button>
              <button className="action-card" onClick={()=>{navigate("/admin/attendance")}}>
                <div className="action-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <FaCalendarCheck />
                </div>
                <span className="action-label">View Attendance</span>
              </button>
              <button className="action-card" onClick={()=>{navigate("/admin/payroll")}}>
                <div className="action-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <FaFileInvoiceDollar />
                </div>
                <span className="action-label">Generate Payroll</span>
              </button>
              <button className="action-card" onClick={()=>{navigate("/admin/reports")}}>
                <div className="action-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <FaChartLine />
                </div>
                <span className="action-label">View Reports</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

