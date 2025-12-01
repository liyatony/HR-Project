import React, { useState, useEffect } from "react";
import EmployeeSidebar from "../common/EmployeeSidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaExclamationCircle,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import "../../styles/dashboard.css";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";

const AttendanceHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const [stats, setStats] = useState({ present: 0, absent: 0, leaves: 0 });
  const [loading, setLoading] = useState(true);

//correction
  const [correctionModal, setCorrectionModal] = useState(false); 
  const [correctionReason, setCorrectionReason] = useState("");
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("");

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

    const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

   useEffect(() => {
  setSelectedMonth("all");    
  fetchRecords("all");
}, []);


  const fetchRecords = async (month) => {
    try {
      setLoading(true);

        const res = await axiosInstance.get(
  `/emp/my-attendance-records?month=${month || "all"}`
);


      if (res.data.success) {
        setAttendance(res.data.data);
        setFiltered(res.data.data);
        generateStats(res.data.data);
      }
    } catch (err) {
      console.error("Fetch records error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateStats = (records) => {
    setStats({
      present: records.filter((r) => r.status === "present").length,
      absent: records.filter((r) => r.status === "absent").length,
      leaves: records.filter((r) => r.status === "leave").length,
    });
  };

  //calculate hour
  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";
    const [h1, m1] = checkIn.split(":").map(Number);
    const [h2, m2] = checkOut.split(":").map(Number);
    const total = h2 * 60 + m2 - (h1 * 60 + m1);
    return `${Math.floor(total / 60)}h ${total % 60}m`;
  };

  // sorting and filtering
  useEffect(() => {
    let temp = [...attendance];

    if (search.trim().length > 0) {
      const s = search.toLowerCase();
      temp = temp.filter(
        (r) =>
          r.date.toLowerCase().includes(s) ||
          (r.checkIn || "").toLowerCase().includes(s) ||
          (r.checkOut || "").toLowerCase().includes(s) ||
          r.status.toLowerCase().includes(s)
      );
    }

    if (sortConfig.key) {
      temp.sort((a, b) => {
        const x = a[sortConfig.key] || "";
        const y = b[sortConfig.key] || "";

        if (sortConfig.direction === "asc") return x > y ? 1 : -1;
        return x < y ? 1 : -1;
      });
    }

    setFiltered(temp);
  }, [search, attendance, sortConfig]);

  const sortColumn = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // correction
  const openCorrection = (recordId) => {
    setSelectedAttendanceId(recordId);
    setCorrectionReason("");
    setCorrectionModal(true);
  };

  const submitCorrection = async () => {
    if (!correctionReason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    try {
      const res = await axiosInstance.post("/emp/my-attendance-correction", {
        attendanceId: selectedAttendanceId,
        reason: correctionReason,
      });

      if (res.data.success) {
        alert("Correction request submitted!");
        setCorrectionModal(false);
      }
    } catch (err) {
      alert("Failed to submit correction request.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="main-wrapper">
          <div style={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-wrapper">
        

  <header className="top-navbar">
          <div className="navbar-left">
            <button className="toggle-btn" onClick={toggleSidebar}>
              <FiMenu />
            </button>

            <div className="page-title">
              <h1>Attendance History</h1>
             
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
          {/* Search Bar */}
          <div
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <FaSearch style={{ color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search date, status, check-in, check-out…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
          </div>

       
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Present Days</p>
                  <h3 className="stat-value">{stats.present}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                  <FaCheckCircle />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Absent Days</p>
                  <h3 className="stat-value">{stats.absent}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                  <FaTimesCircle />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-body">
                <div className="stat-info">
                  <p className="stat-title">Leave Days</p>
                  <h3 className="stat-value">{stats.leaves}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}>
                  <FaCalendarCheck />
                </div>
              </div>
            </div>
          </div>

          
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaCalendarAlt style={{ color: "#4f46e5", fontSize: "1.5rem" }} />
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>Attendance Records</h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th onClick={() => sortColumn("date")}>Date {sortIcon("date")}</th>
                    <th onClick={() => sortColumn("checkIn")}>Check In {sortIcon("checkIn")}</th>
                    <th onClick={() => sortColumn("checkOut")}>Check Out {sortIcon("checkOut")}</th>
                    <th>Hours</th>
                    <th onClick={() => sortColumn("status")}>Status {sortIcon("status")}</th>
                    <th style={{ textAlign: "center" }}>Fix</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r._id}>
                        <td>{r.date}</td>
                        <td>{r.checkIn || "--"}</td>
                        <td>{r.checkOut || "--"}</td>
                        <td>{calculateHours(r.checkIn, r.checkOut)}</td>
                        <td>
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              textTransform: "capitalize",
                              backgroundColor:
                                r.status === "present"
                                  ? "#dcfce7"
                                  : r.status === "absent"
                                  ? "#fee2e2"
                                  : "#ffedd5",
                              color:
                                r.status === "present"
                                  ? "#16a34a"
                                  : r.status === "absent"
                                  ? "#dc2626"
                                  : "#ea580c",
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => openCorrection(r._id)}
                            style={{
                              background: "#fde68a",
                              border: "none",
                              padding: "8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <FaExclamationCircle style={{ color: "#92400e" }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIMPLE CORRECTION POPUP */}
          {correctionModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "2rem",
                  borderRadius: "12px",
                  width: "90%",
                  maxWidth: "450px",
                }}
              >
                <h3 style={{ marginBottom: "1rem" }}>Request Correction</h3>

                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Explain your correction request..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    marginBottom: "1rem",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button
                    onClick={() => setCorrectionModal(false)}
                    style={{
                      padding: "0.6rem 1.2rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={submitCorrection}
                    style={{
                      padding: "0.6rem 1.2rem",
                      background: "#4f46e5",
                      color: "white",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendanceHistory;
