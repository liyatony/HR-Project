import React, { useEffect, useState } from "react";
import EmployeeSidebar from "../common/EmployeeSidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import { FaCheckCircle, FaTimesCircle, FaCalendarCheck } from "react-icons/fa";
import "../../styles/dashboard.css";

const MyAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get("/emp/my-attendance");

      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="dashboard-wrapper">
        <div className="main-wrapper">
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading…</div>
        </div>
      </div>
    );

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-wrapper">
        <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="My Attendance"
          pageSubtitle="Your overall attendance summary"
        />

        <main className="content-area">
          {/* Summary Cards */}
          <div className="stats-grid">
            {/* Present Days */}
            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Present Days</p>
                  <h3 className="stat-value">{summary.totalPresent}</h3>
                </div>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                  }}
                >
                  <FaCheckCircle />
                </div>
              </div>
            </div>

            {/* Absent Days */}
            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Absent Days</p>
                  <h3 className="stat-value">{summary.totalAbsent}</h3>
                </div>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                  }}
                >
                  <FaTimesCircle />
                </div>
              </div>
            </div>

            {/* Leave Days */}
            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Leave Days</p>
                  <h3 className="stat-value">{summary.totalLeaves}</h3>
                </div>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: "#ffedd5",
                    color: "#ea580c",
                  }}
                >
                  <FaCalendarCheck />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAttendance;
