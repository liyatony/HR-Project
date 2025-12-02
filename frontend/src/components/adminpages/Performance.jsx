import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import { 
  FaStar, 
  FaTasks, 
  FaTrophy,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaDownload
} from "react-icons/fa";
import "../../styles/performance.css";
import axiosInstance from "../../utils/axiosInstance";

const Performance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("performance");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState({
    avgPerformance: "0/5.0",
    totalRated: "0",
    topPerformers: "0",
    avgScore: "0%"
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // UPDATED: Added IT department to the list
  const departments = ["HR", "IT", "Engineering", "Marketing", "Sales", "Finance"];

  // Initialize with current month
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch performance data
  useEffect(() => {
    if (selectedMonth) {
      fetchPerformanceData();
    }
  }, [selectedMonth]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/performance/all?month=${selectedMonth}`);
      
      if (res.data.success) {
        const formattedData = res.data.data.map((perf, index) => ({
          id: index + 1,
          employee: perf.employeeId?.name || "Unknown",
          empId: perf.employeeId?._id || "N/A",
          department: perf.employeeId?.department || "N/A",
          taskCompletion: perf.ratings?.taskCompletion || 0,
          attendance: perf.ratings?.attendance || 0,
          behaviour: perf.ratings?.behaviour || 0,
          rating: perf.score || 0,
          lastReview: new Date(perf.updatedAt).toLocaleDateString(),
          status: getStatusFromScore(perf.score),
          comments: perf.comments || "No comments",
          reviewerId: perf.reviewerId
        }));

        setPerformanceData(formattedData);
        calculateStats(formattedData);
      }
    } catch (err) {
      console.error("Error fetching performance:", err);
      alert("Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromScore = (score) => {
    if (score >= 4.5) return "Excellent";
    if (score >= 3.5) return "Good";
    if (score >= 2.5) return "Average";
    return "Poor";
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStatsData({
        avgPerformance: "0/5.0",
        totalRated: "0",
        topPerformers: "0",
        avgScore: "0%"
      });
      return;
    }

    const totalScore = data.reduce((sum, emp) => sum + emp.rating, 0);
    const avgScore = (totalScore / data.length).toFixed(1);
    const topPerformers = data.filter(emp => emp.rating >= 4.5).length;
    const avgPercentage = ((avgScore / 5) * 100).toFixed(1);

    setStatsData({
      avgPerformance: `${avgScore}/5.0`,
      totalRated: data.length.toString(),
      topPerformers: topPerformers.toString(),
      avgScore: `${avgPercentage}%`
    });
  };

  const handleExportReport = () => {
    const filtered = getFilteredData();
    
    const csvContent = [
      ["Employee ID", "Employee Name", "Department", "Task Completion", "Attendance", "Behaviour", "Overall Rating", "Status", "Last Review", "Comments"],
      ...filtered.map(record => [
        record.empId,
        record.employee,
        record.department,
        record.taskCompletion,
        record.attendance,
        record.behaviour,
        record.rating,
        record.status,
        record.lastReview,
        record.comments
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `performance-report-${selectedMonth}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredData = () => {
    return performanceData.filter(record => {
      const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.empId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = !filterDepartment || record.department === filterDepartment;
      const matchesStatus = !filterStatus || record.status === filterStatus;
      
      return matchesSearch && matchesDept && matchesStatus;
    });
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through getFilteredData
    console.log("Filters applied");
  };

  const filteredData = getFilteredData();

  const statsDisplay = [
    { 
      title: "Avg Performance", 
      value: statsData.avgPerformance, 
      icon: <FaStar />, 
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    { 
      title: "Total Rated", 
      value: statsData.totalRated, 
      icon: <FaTasks />, 
      color: "#059669",
      bgColor: "#d1fae5"
    },
    { 
      title: "Top Performers", 
      value: statsData.topPerformers, 
      icon: <FaTrophy />, 
      color: "#dc2626",
      bgColor: "#fee2e2"
    },
    { 
      title: "Avg Score", 
      value: statsData.avgScore, 
      icon: <FaChartLine />, 
      color: "#4f46e5",
      bgColor: "#e0e7ff"
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
          pageTitle="Performance Management"
          pageSubtitle="Track and evaluate employee performance"
        />

        <main className="content-area">
          {/* Stats Cards */}
          <div className="performance-stats-grid">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="performance-stat-card">
                <div className="stat-icon-box" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <p className="stat-label">{stat.title}</p>
                  <h3 className="stat-number">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <div className="performance-filters-card">
            <div className="filters-header">
              <h3 className="filters-title">
                <FaFilter /> Filter Performance Records
              </h3>
            </div>

            <div className="filters-container">
              <div className="filter-row">
                <div className="filter-item">
                  <label className="filter-label">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="department-select-field"
                  />
                </div>

                <div className="filter-item">
                  <label className="filter-label">Search Employee</label>
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon-input" />
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input-field"
                    />
                  </div>
                </div>

                <div className="filter-item">
                  <label className="filter-label">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="department-select-field"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label className="filter-label">Performance Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="department-select-field"
                  >
                    <option value="">All Status</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn-apply-filter" onClick={handleApplyFilters}>
                  <FaFilter /> Apply Filters
                </button>
                <button className="btn-export-report" onClick={handleExportReport}>
                  <FaDownload /> Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="performance-table-card">
            <div className="table-header">
              <h3 className="table-title">
                <FaChartLine /> Employee Performance Overview - {selectedMonth}
              </h3>
              <span className="record-count">{filteredData.length} Employees</span>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Loading performance data...
              </div>
            ) : filteredData.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                No performance data available for the selected month.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Task Completion</th>
                      <th>Attendance</th>
                      <th>Behaviour</th>
                      <th>Overall Rating</th>
                      <th>Last Review</th>
                      <th>Status</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((record) => (
                      <tr key={record.id}>
                        <td className="emp-id-cell">{record.empId}</td>
                        <td className="emp-name-cell">{record.employee}</td>
                        <td>{record.department}</td>
                        <td className="tasks-cell">{record.taskCompletion.toFixed(1)}</td>
                        <td className="tasks-cell">{record.attendance.toFixed(1)}</td>
                        <td className="tasks-cell">{record.behaviour.toFixed(1)}</td>
                        <td>
                          <div className="rating-box">
                            <FaStar className="star-icon" />
                            <span className="rating-value">{record.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="date-cell">{record.lastReview}</td>
                        <td>
                          <span className={`performance-status-badge ${record.status.toLowerCase()}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="emp-name-cell" title={record.comments}>
                          {record.comments.length > 30 
                            ? record.comments.substring(0, 30) + "..." 
                            : record.comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Performance;




// import React, { useState, useEffect } from "react";
// import Sidebar from "../common/Sidebar";
// import Navbar from "../common/Navbar";
// import { 
//   FaStar, 
//   FaTasks, 
//   FaTrophy,
//   FaChartLine,
//   FaSearch,
//   FaFilter,
//   FaEye,
//   FaEdit,
//   FaDownload
// } from "react-icons/fa";
// import "../../styles/performance.css";
// import axiosInstance from "../../utils/axiosInstance";

// const Performance = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeMenu, setActiveMenu] = useState("performance");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterDepartment, setFilterDepartment] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
  
//   const [performanceData, setPerformanceData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [statsData, setStatsData] = useState({
//     avgPerformance: "0/5.0",
//     totalRated: "0",
//     topPerformers: "0",
//     avgScore: "0%"
//   });

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   const departments = ["HR", "Engineering", "Marketing", "Sales", "Finance"];

//   // Initialize with current month
//   useEffect(() => {
//     const currentMonth = new Date().toISOString().slice(0, 7);
//     setSelectedMonth(currentMonth);
//   }, []);

//   // Fetch performance data
//   useEffect(() => {
//     if (selectedMonth) {
//       fetchPerformanceData();
//     }
//   }, [selectedMonth]);

//   const fetchPerformanceData = async () => {
//     setLoading(true);
//     try {
//       // Admin uses /emp/performance/all route
//       const res = await axiosInstance.get(`/admin/performance/all?month=${selectedMonth}`);
      
//       if (res.data.success) {
//         const formattedData = res.data.data.map((perf, index) => ({
//           id: index + 1,
//           employee: perf.employeeId?.name || "Unknown",
//           empId: perf.employeeId?._id || "N/A",
//           department: perf.employeeId?.department || "N/A",
//           taskCompletion: perf.ratings?.taskCompletion || 0,
//           attendance: perf.ratings?.attendance || 0,
//           behaviour: perf.ratings?.behaviour || 0,
//           rating: perf.score || 0,
//           lastReview: new Date(perf.updatedAt).toLocaleDateString(),
//           status: getStatusFromScore(perf.score),
//           comments: perf.comments || "No comments",
//           reviewerId: perf.reviewerId
//         }));

//         setPerformanceData(formattedData);
//         calculateStats(formattedData);
//       }
//     } catch (err) {
//       console.error("Error fetching performance:", err);
//       alert("Failed to fetch performance data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusFromScore = (score) => {
//     if (score >= 4.5) return "Excellent";
//     if (score >= 3.5) return "Good";
//     if (score >= 2.5) return "Average";
//     return "Poor";
//   };

//   const calculateStats = (data) => {
//     if (data.length === 0) {
//       setStatsData({
//         avgPerformance: "0/5.0",
//         totalRated: "0",
//         topPerformers: "0",
//         avgScore: "0%"
//       });
//       return;
//     }

//     const totalScore = data.reduce((sum, emp) => sum + emp.rating, 0);
//     const avgScore = (totalScore / data.length).toFixed(1);
//     const topPerformers = data.filter(emp => emp.rating >= 4.5).length;
//     const avgPercentage = ((avgScore / 5) * 100).toFixed(1);

//     setStatsData({
//       avgPerformance: `${avgScore}/5.0`,
//       totalRated: data.length.toString(),
//       topPerformers: topPerformers.toString(),
//       avgScore: `${avgPercentage}%`
//     });
//   };

//   const handleExportReport = () => {
//     const filtered = getFilteredData();
    
//     const csvContent = [
//       ["Employee ID", "Employee Name", "Department", "Task Completion", "Attendance", "Behaviour", "Overall Rating", "Status", "Last Review", "Comments"],
//       ...filtered.map(record => [
//         record.empId,
//         record.employee,
//         record.department,
//         record.taskCompletion,
//         record.attendance,
//         record.behaviour,
//         record.rating,
//         record.status,
//         record.lastReview,
//         record.comments
//       ])
//     ].map(row => row.join(",")).join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `performance-report-${selectedMonth}.csv`;
//     link.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const getFilteredData = () => {
//     return performanceData.filter(record => {
//       const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            record.empId.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesDept = !filterDepartment || record.department === filterDepartment;
//       const matchesStatus = !filterStatus || record.status === filterStatus;
      
//       return matchesSearch && matchesDept && matchesStatus;
//     });
//   };

//   const handleApplyFilters = () => {
//     // Filters are applied automatically through getFilteredData
//     console.log("Filters applied");
//   };

//   const filteredData = getFilteredData();

//   const statsDisplay = [
//     { 
//       title: "Avg Performance", 
//       value: statsData.avgPerformance, 
//       icon: <FaStar />, 
//       color: "#f59e0b",
//       bgColor: "#fef3c7"
//     },
//     { 
//       title: "Total Rated", 
//       value: statsData.totalRated, 
//       icon: <FaTasks />, 
//       color: "#059669",
//       bgColor: "#d1fae5"
//     },
//     { 
//       title: "Top Performers", 
//       value: statsData.topPerformers, 
//       icon: <FaTrophy />, 
//       color: "#dc2626",
//       bgColor: "#fee2e2"
//     },
//     { 
//       title: "Avg Score", 
//       value: statsData.avgScore, 
//       icon: <FaChartLine />, 
//       color: "#4f46e5",
//       bgColor: "#e0e7ff"
//     },
//   ];

//   return (
//     <div className="dashboard-wrapper">
//       {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

//       <Sidebar 
//         isOpen={sidebarOpen} 
//         toggleSidebar={toggleSidebar}
//         activeMenu={activeMenu}
//         setActiveMenu={setActiveMenu}
//       />

//       <div className="main-wrapper">
//         <Navbar
//           toggleSidebar={toggleSidebar}
//           pageTitle="Performance Management"
//           pageSubtitle="Track and evaluate employee performance"
//         />

//         <main className="content-area">
//           {/* Stats Cards */}
//           <div className="performance-stats-grid">
//             {statsDisplay.map((stat, index) => (
//               <div key={index} className="performance-stat-card">
//                 <div className="stat-icon-box" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
//                   {stat.icon}
//                 </div>
//                 <div className="stat-details">
//                   <p className="stat-label">{stat.title}</p>
//                   <h3 className="stat-number">{stat.value}</h3>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Filters Section */}
//           <div className="performance-filters-card">
//             <div className="filters-header">
//               <h3 className="filters-title">
//                 <FaFilter /> Filter Performance Records
//               </h3>
//             </div>

//             <div className="filters-container">
//               <div className="filter-row">
//                 <div className="filter-item">
//                   <label className="filter-label">Select Month</label>
//                   <input
//                     type="month"
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(e.target.value)}
//                     className="department-select-field"
//                   />
//                 </div>

//                 <div className="filter-item">
//                   <label className="filter-label">Search Employee</label>
//                   <div className="search-input-wrapper">
//                     <FaSearch className="search-icon-input" />
//                     <input
//                       type="text"
//                       placeholder="Search employee..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="search-input-field"
//                     />
//                   </div>
//                 </div>

//                 <div className="filter-item">
//                   <label className="filter-label">Department</label>
//                   <select
//                     value={filterDepartment}
//                     onChange={(e) => setFilterDepartment(e.target.value)}
//                     className="department-select-field"
//                   >
//                     <option value="">All Departments</option>
//                     {departments.map((dept, index) => (
//                       <option key={index} value={dept}>{dept}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="filter-item">
//                   <label className="filter-label">Performance Status</label>
//                   <select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     className="department-select-field"
//                   >
//                     <option value="">All Status</option>
//                     <option value="Excellent">Excellent</option>
//                     <option value="Good">Good</option>
//                     <option value="Average">Average</option>
//                     <option value="Poor">Poor</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="filter-actions">
//                 <button className="btn-apply-filter" onClick={handleApplyFilters}>
//                   <FaFilter /> Apply Filters
//                 </button>
//                 <button className="btn-export-report" onClick={handleExportReport}>
//                   <FaDownload /> Export Report
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Performance Table */}
//           <div className="performance-table-card">
//             <div className="table-header">
//               <h3 className="table-title">
//                 <FaChartLine /> Employee Performance Overview - {selectedMonth}
//               </h3>
//               <span className="record-count">{filteredData.length} Employees</span>
//             </div>

//             {loading ? (
//               <div style={{ padding: "2rem", textAlign: "center" }}>
//                 Loading performance data...
//               </div>
//             ) : filteredData.length === 0 ? (
//               <div style={{ padding: "2rem", textAlign: "center" }}>
//                 No performance data available for the selected month.
//               </div>
//             ) : (
//               <div className="table-wrapper">
//                 <table className="performance-table">
//                   <thead>
//                     <tr>
//                       <th>Employee ID</th>
//                       <th>Employee Name</th>
//                       <th>Department</th>
//                       <th>Task Completion</th>
//                       <th>Attendance</th>
//                       <th>Behaviour</th>
//                       <th>Overall Rating</th>
//                       <th>Last Review</th>
//                       <th>Status</th>
//                       <th>Comments</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.map((record) => (
//                       <tr key={record.id}>
//                         <td className="emp-id-cell">{record.empId}</td>
//                         <td className="emp-name-cell">{record.employee}</td>
//                         <td>{record.department}</td>
//                         <td className="tasks-cell">{record.taskCompletion.toFixed(1)}</td>
//                         <td className="tasks-cell">{record.attendance.toFixed(1)}</td>
//                         <td className="tasks-cell">{record.behaviour.toFixed(1)}</td>
//                         <td>
//                           <div className="rating-box">
//                             <FaStar className="star-icon" />
//                             <span className="rating-value">{record.rating.toFixed(1)}</span>
//                           </div>
//                         </td>
//                         <td className="date-cell">{record.lastReview}</td>
//                         <td>
//                           <span className={`performance-status-badge ${record.status.toLowerCase()}`}>
//                             {record.status}
//                           </span>
//                         </td>
//                         <td className="emp-name-cell" title={record.comments}>
//                           {record.comments.length > 30 
//                             ? record.comments.substring(0, 30) + "..." 
//                             : record.comments}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Performance;