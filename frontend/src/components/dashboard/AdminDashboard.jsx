// src/components/dashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    attendanceRate: "0%",
    monthlyPayroll: "₹0",
    avgPerformance: "0%"
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPendingLeaves(),
        loadDashboardStats(),
        loadPerformanceData()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingLeaves = async () => {
    try {
      const response = await axiosInstance.get("/emp/pending");
      setPendingRequests(response.data);
    } catch (error) {
      console.error("Error loading pending leaves:", error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await axiosInstance.get("/emp/dashboard-stats");
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await axiosInstance.get(`/emp/performance/all?month=${currentMonth}`);
      if (response.data.success) {
        // Get department-wise average performance
        const deptPerformance = calculateDepartmentPerformance(response.data.data);
        setPerformanceData(deptPerformance);
      }
    } catch (error) {
      console.error("Error loading performance data:", error);
    }
  };

  const calculateDepartmentPerformance = (data) => {
    const deptMap = {};
    
    data.forEach(perf => {
      const dept = perf.employeeId?.department || "Unknown";
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, count: 0 };
      }
      deptMap[dept].total += perf.score || 0;
      deptMap[dept].count += 1;
    });

    return Object.entries(deptMap).map(([dept, values]) => ({
      department: dept,
      avgScore: (values.total / values.count).toFixed(1),
      count: values.count
    }));
  };

  const statsCards = [
    { 
      title: "Total Employees", 
      value: dashboardStats.totalEmployees, 
      change: dashboardStats.employeeChange || "+0 this month", 
      changeType: "positive", 
      icon: <FaUserTie />, 
      color: "#4f46e5", 
      bgColor: "#eef2ff" 
    },
    { 
      title: "Attendance Rate", 
      value: dashboardStats.attendanceRate, 
      change: dashboardStats.attendanceChange || "+0% from last month", 
      changeType: "positive", 
      icon: <FaCalendarCheck />, 
      color: "#059669", 
      bgColor: "#ecfdf5" 
    },
    { 
      title: "Monthly Payroll", 
      value: dashboardStats.monthlyPayroll, 
      change: dashboardStats.payrollStatus || "Processed", 
      changeType: "neutral", 
      icon: <FaFileInvoiceDollar />, 
      color: "#dc2626", 
      bgColor: "#fef2f2" 
    },
    { 
      title: "Avg Performance", 
      value: dashboardStats.avgPerformance, 
      change: dashboardStats.performanceChange || "+0% improvement", 
      changeType: "positive", 
      icon: <FaChartLine />, 
      color: "#ea580c", 
      bgColor: "#fff7ed" 
    },
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
          {/* Stats Cards */}
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
            {/* Performance Graph */}
            <div className="panel performance-panel">
              <div className="panel-header">
                <h3 className="panel-title">
                  <FaChartLine /> Department Performance Overview
                </h3>
                <button className="btn-text" onClick={() => navigate("/admin/performance")}>
                  View Details
                </button>
              </div>
              <div className="panel-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Loading performance data...</p>
                  </div>
                ) : performanceData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <p>No performance data available for this month</p>
                  </div>
                ) : (
                  <div className="performance-chart">
                    {performanceData.map((dept, index) => (
                      <div key={index} className="performance-bar-item">
                        <div className="performance-bar-label">
                          <span className="dept-name">{dept.department}</span>
                          <span className="dept-score">{dept.avgScore}/5.0</span>
                        </div>
                        <div className="performance-bar-wrapper">
                          <div 
                            className="performance-bar-fill"
                            style={{ 
                              width: `${(dept.avgScore / 5) * 100}%`,
                              backgroundColor: dept.avgScore >= 4 ? '#059669' : 
                                             dept.avgScore >= 3 ? '#f59e0b' : '#dc2626'
                            }}
                          />
                        </div>
                        <span className="dept-count">{dept.count} employees</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

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
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <Add_employee
              isOpen={showAddEmployee}
              onClose={() => setShowAddEmployee(false)}
              onSubmit={(formData) => {
                setShowAddEmployee(false);
                loadDashboardData(); // Refresh data after adding employee
              }}
            />
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={() => setShowAddEmployee(true)}>
                <div className="action-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  <FaUserTie />
                </div>
                <span className="action-label">Add Employee</span>
              </button>
              <button className="action-card" onClick={() => navigate("/admin/attendance")}>
                <div className="action-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <FaCalendarCheck />
                </div>
                <span className="action-label">View Attendance</span>
              </button>
              <button className="action-card" onClick={() => navigate("/admin/payroll")}>
                <div className="action-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <FaFileInvoiceDollar />
                </div>
                <span className="action-label">Generate Payroll</span>
              </button>
              <button className="action-card" onClick={() => navigate("/admin/performance")}>
                <div className="action-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <FaChartLine />
                </div>
                <span className="action-label">Performance</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;




