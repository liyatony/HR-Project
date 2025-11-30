import React, { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import EmployeeSidebar from "../common/EmployeeSidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaClock,
  FaCheckCircle,
  FaCalendarDay,
  FaHourglassHalf,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import "../../styles/dashboard.css";
import { FiMenu } from "react-icons/fi";

const MarkAttendance = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentTime, setCurrentTime] = useState(new Date());

  const [recentRecords, setRecentRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchTodayAttendance();
    fetchRecentAttendance();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Today Attendance
  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const month = today.substring(0, 7);

      const res = await axiosInstance.get(
        `/emp/my-attendance-records?month=${month}`
      );

      if (res.data.success) {
        const todayRecord = res.data.data.find((r) => r.date === today);
        setTodayAttendance(todayRecord || null);
      }
    } catch (error) {
      console.error("Failed to fetch today's attendance:", error);
    }
  };

  // Fetch Last 7 Days Records
  const fetchRecentAttendance = async () => {
    try {
      const today = new Date();
      const month = today.toISOString().substring(0, 7);
      const res = await axiosInstance.get(
        `/emp/my-attendance-records?month=${month}`
      );

      if (res.data.success) {
        const last7 = res.data.data.slice(0, 7);
        setRecentRecords(last7);
      }
    } catch (error) {
      console.error("Failed to fetch recent attendance:", error);
    }
  };

  // Handle Check-In
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const now = new Date();
      const checkInTime = now.toTimeString().split(" ")[0];
      const date = now.toISOString().split("T")[0];

      const res = await axiosInstance.post("/emp/mark-attendance", {
        date,
        checkIn: checkInTime,
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Check-in successful! 🎉" });
        fetchTodayAttendance();
        fetchRecentAttendance();
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to check in",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to check in",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const now = new Date();
      const checkOutTime = now.toTimeString().split(" ")[0];

      const res = await axiosInstance.put(
        `/emp/mark-attendance/${todayAttendance._id}`,
        { checkOut: checkOutTime }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: "Check-out successful! 👋" });
        fetchTodayAttendance();
        fetchRecentAttendance();
      } else {
        setMessage({
          type: "error",
          text: res.data.message || "Failed to check out",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to check out",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate Hours
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";

    const [h1, m1] = checkIn.split(":").map(Number);
    const [h2, m2] = checkOut.split(":").map(Number);

    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    return `${hours}h ${mins}m`;
  };

  // Sorting
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let A = a[sortConfig.field];
      let B = b[sortConfig.field];

      if (!A) A = "";
      if (!B) B = "";

      if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
      if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredAndSorted = sortData(
    recentRecords.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const changeSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIcon = (field) => {
    if (sortConfig.field !== field) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-wrapper">
        {/* <Navbar
          toggleSidebar={toggleSidebar}
          pageTitle="Mark Attendance"
          pageSubtitle="Check in and check out for today"
        /> */}

          <header className="top-navbar">
                  <div className="navbar-left">
                    <button className="toggle-btn" onClick={toggleSidebar}>
                      <FiMenu />
                    </button>
        
                    <div className="page-title">
                      <h1>Mark Attendance</h1>
                     
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
          {/* Alert Message */}
          {message.text && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1.5rem",
                borderRadius: "8px",
                backgroundColor:
                  message.type === "success" ? "#dcfce7" : "#fee2e2",
                border: `1px solid ${
                  message.type === "success" ? "#16a34a" : "#dc2626"
                }`,
                color: message.type === "success" ? "#15803d" : "#b91c1c",
              }}
            >
              {message.text}
            </div>
          )}

          {/* Clock Section */}
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              borderRadius: "16px",
              padding: "2rem",
              marginBottom: "2rem",
              color: "white",
              textAlign: "center",
            }}
          >
            <FaClock style={{ fontSize: "3rem", marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "3rem", fontWeight: "bold" }}>
              {currentTime.toLocaleTimeString()}
            </h2>
            <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Check In</p>
                  <h3 className="stat-value">
                    {todayAttendance?.checkIn || "--:--"}
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: "#dcfce7" }}>
                  <FaCheckCircle />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Check Out</p>
                  <h3 className="stat-value">
                    {todayAttendance?.checkOut || "--:--"}
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: "#fee2e2" }}>
                  <FaClock />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Working Hours</p>
                  <h3 className="stat-value">
                    {calculateHours(
                      todayAttendance?.checkIn,
                      todayAttendance?.checkOut
                    )}
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: "#fef3c7" }}>
                  <FaHourglassHalf />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Status</p>
                  <h3
                    className="stat-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {todayAttendance?.status || "Not Marked"}
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: "#dbeafe" }}>
                  <FaCalendarDay />
                </div>
              </div>
            </div>
          </div>

          {/* Check-In / Check-Out Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleCheckIn}
              disabled={loading || todayAttendance?.checkIn}
              style={{
                padding: "1rem 2rem",
                background: todayAttendance?.checkIn
                  ? "#e5e7eb"
                  : "linear-gradient(135deg, #16a34a, #15803d)",
                color: "white",
                borderRadius: "12px",
                border: "none",
                cursor: todayAttendance?.checkIn
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <FaCheckCircle /> Check In
            </button>

            <button
              onClick={handleCheckOut}
              disabled={
                loading ||
                !todayAttendance?.checkIn ||
                todayAttendance?.checkOut
              }
              style={{
                padding: "1rem 2rem",
                background:
                  !todayAttendance?.checkIn || todayAttendance?.checkOut
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "white",
                borderRadius: "12px",
                border: "none",
                cursor:
                  !todayAttendance?.checkIn || todayAttendance?.checkOut
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <FaClock /> Check Out
            </button>
          </div>

          {/* Table (Last 7 Days) */}
          <div
            className="attendance-table-card"
            style={{ marginTop: "3rem", padding: "1rem" }}
          >
            <div
              className="table-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h3 className="table-title">Last 7 Days Attendance</h3>

              <div style={{ position: "relative" }}>
                <FaSearch
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "10px 10px 10px 35px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th onClick={() => changeSort("date")}>
                      Date {sortIcon("date")}
                    </th>
                    <th onClick={() => changeSort("checkIn")}>
                      Check In {sortIcon("checkIn")}
                    </th>
                    <th onClick={() => changeSort("checkOut")}>
                      Check Out {sortIcon("checkOut")}
                    </th>
                    <th onClick={() => changeSort("hours")}>
                      Hours {sortIcon("hours")}
                    </th>
                    <th onClick={() => changeSort("status")}>
                      Status {sortIcon("status")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAndSorted.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredAndSorted.map((r) => (
                      <tr key={r._id}>
                        <td>{r.date}</td>
                        <td>{r.checkIn || "--"}</td>
                        <td>{r.checkOut || "--"}</td>
                        <td>
                          {calculateHours(r.checkIn, r.checkOut)}
                        </td>
                        <td style={{ textTransform: "capitalize" }}>
                          {r.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarkAttendance;
