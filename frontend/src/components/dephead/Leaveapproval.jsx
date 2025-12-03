import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Navbar from "../common/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import LeaveApproveBox from "../adminpages/LeaveApproveBox";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import "../../styles/leavemanagement.css";
import { useAuth } from "../../utils/AuthContext";


const LeaveManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("leave");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [leaveApprove, setLeaveApprove] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
const [filterDepartment, setFilterDepartment] = useState("");
const { user } = useAuth();


  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const leaveTypes = [
    "Sick Leave",
    "Casual Leave",
    "Paid Leave",
    "Maternity Leave",
    "Emergency Leave",
  ];
  const [leaveRequests, setLeaveRequests] = useState([]);


  // const fetchLeaves =()=>{
  //    axiosInstance.get("admin/leave").then((res) => {
  //     console.log(res.data.data);

  //     setLeaveRequests(res.data.data);
      
  //   });

  // }
  const fetchLeaves = () => {
  axiosInstance.get("admin/leave").then((res) => {
    const allLeaves = res.data.data;

    console.log("All leaves:", allLeaves);

    // ⭐ FILTER BY DEPARTMENT ONLY
    const deptLeaves = allLeaves.filter(
      (req) => req.employeeId?.department === user.department
    );

    setLeaveRequests(deptLeaves);
  });
};

  

  useEffect(() => {
    fetchLeaves()
   
  }, []);

  function isoToDateString(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN");
  }





  const handleApprove = (employeeId, startDate, endDate, employeeName, _id,email) => {
    axiosInstance
      .put("admin/leave_confirm", { _id })
      .then((res) => {
        console.log(res.data.message);
        fetchLeaves()
      })
      .catch((err) => {
        console.log(err);
      });

    function getWeekdayISODates(startISO, endISO) {
      const start = new Date(startISO);
      const end = new Date(endISO);
      const weekdays = [];

      for (
        let d = new Date(start);
        d <= end;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const day = d.getUTCDay(); // 0 = Sunday, 6 = Saturday
        if (day !== 0 && day !== 6) {
          weekdays.push(new Date(d).toISOString()); // keep ISO format
        }
      }

      return weekdays;
    }
    const leaveId = _id;

    const days = getWeekdayISODates(startDate, endDate);

    axiosInstance
      .post("admin/approved_leave", { employeeId, days, employeeName, leaveId ,email})
      .then((res) => {
        console.log(res.data.message);
      }).catch((err)=>{
        console.error(err)
      })
  };

  const handleReject = (leaveId,name,email,startDate,endDate) => {

    axiosInstance.put("admin/rejected_leave",{leaveId,name,email,startDate,endDate}).then((res)=>{

    fetchLeaves();

    }).catch((err)=>{
      console.error(err)
    })




    
  };

  // // Sample leave requests data
  // const leaveRequests = [
  //   {
  //     id: 1,
  //     employee: "John Doe",
  //     empId: "EMP001",
  //     department: "Engineering",
  //     leaveType: "Sick Leave",
  //     startDate: "2025-01-20",
  //     endDate: "2025-01-22",
  //     days: 3,
  //     reason: "Medical treatment",
  //     appliedOn: "2025-01-15",
  //     status: "Pending"
  //   },
  //   {
  //     id: 2,
  //     employee: "Sarah Johnson",
  //     empId: "EMP002",
  //     department: "Marketing",
  //     leaveType: "Casual Leave",
  //     startDate: "2025-01-25",
  //     endDate: "2025-01-26",
  //     days: 2,
  //     reason: "Personal work",
  //     appliedOn: "2025-01-14",
  //     status: "Approved"
  //   },
  //   {
  //     id: 3,
  //     employee: "Mike Chen",
  //     empId: "EMP003",
  //     department: "Engineering",
  //     leaveType: "Paid Leave",
  //     startDate: "2025-02-01",
  //     endDate: "2025-02-05",
  //     days: 5,
  //     reason: "Family vacation",
  //     appliedOn: "2025-01-10",
  //     status: "Approved"
  //   },
  //   {
  //     id: 4,
  //     employee: "Lisa Anderson",
  //     empId: "EMP004",
  //     department: "HR",
  //     leaveType: "Emergency Leave",
  //     startDate: "2025-01-18",
  //     endDate: "2025-01-18",
  //     days: 1,
  //     reason: "Family emergency",
  //     appliedOn: "2025-01-17",
  //     status: "Rejected"
  //   },
  //   {
  //     id: 5,
  //     employee: "David Brown",
  //     empId: "EMP005",
  //     department: "Sales",
  //     leaveType: "Sick Leave",
  //     startDate: "2025-01-22",
  //     endDate: "2025-01-24",
  //     days: 3,
  //     reason: "Fever and cold",
  //     appliedOn: "2025-01-16",
  //     status: "Pending"
  //   },
  // ];

  const statsData = [
    {
      title: "Total Requests",
      value: leaveRequests.length,
      icon: <FaCalendarAlt />,
      color: "#4f46e5",
      bgColor: "#e0e7ff",
    },
    {
      title: "Approved",
      value: leaveRequests.filter(r => r.status === "approved").length,
      icon: <FaCheckCircle />,
      color: "#059669",
      bgColor: "#d1fae5",
    },
    {
      title: "Pending",
      value: leaveRequests.filter(r => r.status === "pending").length,
      icon: <FaHourglassHalf />,
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      title: "Rejected",
      value: leaveRequests.filter(r => r.status === "rejected").length,
      icon: <FaTimesCircle />,
      color: "#dc2626",
      bgColor: "#fee2e2",
    },
  ];

  const handleExportReport = () => {
    console.log("Exporting leave report...");
    console.log("Date Range:", filterStartDate, "to", filterEndDate);
    console.log("Status:", filterStatus || "All");
    console.log("Leave Type:", filterType || "All");
  };

  const handleApplyFilters = () => {
    console.log("Applying filters...");
    console.log("Search:", searchTerm);
    console.log("Start Date:", filterStartDate);
    console.log("End Date:", filterEndDate);
    console.log("Status:", filterStatus);
    console.log("Leave Type:", filterType);
  };

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
          pageTitle="Leave Management"
          pageSubtitle="Manage employee leave requests"
        />

        <main className="content-area">
          {/* Stats Cards */}
          <div className="leave-stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="leave-stat-card">
                <div
                  className="stat-icon-box"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <p className="stat-label">{stat.title}</p>
                  <h3 className="stat-number">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Leave Requests Table */}
          <div className="leave-table-card">
            <div className="table-header">
              <h3 className="table-title">
                <FaCalendarAlt /> Leave Requests
              </h3>
              <span className="record-count">
                {leaveRequests.length} Requests
              </span>
            </div>

            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="emp-id-cell">{request.employeeId._id}</td>
                      <td className="emp-name-cell">
                        {request.employeeId.name}
                      </td>
                      <td>{request.employeeId.department}</td>
                      <td className="leave-type-cell">{request.leaveType}</td>
                      <td className="date-cell">
                        {isoToDateString(request.startDate)}
                      </td>
                      <td className="date-cell">
                        {isoToDateString(request.endDate)}
                      </td>
                      <td className="days-cell">{request.numberOfDays} days</td>
                      <td className="date-cell">
                        {isoToDateString(request.appliedDate)}
                      </td>
                      <td>
                        <span
                          className={`leave-status-badge ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action view"
                            title="View Details"
                            onClick={() => {
                              setLeaveApprove(true), setSelectedLeave(request);
                            }}
                          >
                            <FaEye />
                          </button>

                          {/* {request.status === "pending" && (
                            <>
                              <button
                                className="btn-action approve"
                                title="Approve"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                className="btn-action reject"
                                title="Reject"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {leaveApprove && selectedLeave && (
            <LeaveApproveBox
              leave={selectedLeave}
              onApprove={handleApprove}
              onReject={handleReject}
              onClose={() => setLeaveApprove(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default LeaveManagement;
