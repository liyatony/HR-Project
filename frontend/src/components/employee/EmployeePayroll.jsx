// src/components/payroll/GeneratePayroll.jsx
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver";

import {
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaFileDownload,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaEdit,
  FaEye,
  FaPrint,
  FaExclamationTriangle,
  FaChartLine,
  FaClock,
  FaArrowLeft,
  FaCalendar,
} from "react-icons/fa";
import "../../styles/payroll.css";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../common/Navbar";
import Sidebar from "../common/Sidebar";
import { useNavigate } from "react-router-dom";


const GeneratePayroll = ({ onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState("2025-01");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [payrollGenerated, setPayrollGenerated] = useState(false);
  const [showGeneratedPayrolls, setShowGeneratedPayrolls] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employdetails, setEmploydetails] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allPayrolls, setAllPayrolls] = useState([]);

   const navigate = useNavigate();

  const WORKING_HOURS_PER_DAY = 8;
  const OVERTIME_MULTIPLIER = 1.5;
  const DEFAULT_WORKING_DAYS = 27;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attnRes] = await Promise.all([
          axiosInstance.get("/admin/employees"),
          axiosInstance.get("/admin/attendance"),
        ]);
        console.log("Employee Response:", empRes.data);
        console.log("Attendance Response:", attnRes.data);
        setEmploydetails(empRes.data.data || empRes.data || []);
        setAttendance(attnRes.data.data || attnRes.data || []);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        console.error("Error details:", err.response?.data);
        alert(`Failed to fetch data: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (employdetails.length === 0 || attendance.length === 0) return;

    const merged = attendance.map((attn) => {
      const emp = employdetails.find((e) => e._id === attn.empId);

      const baseSalary = emp?.salary || 0;
      const workingDays = DEFAULT_WORKING_DAYS;
      const presentDays = attn.presentDays || 0;
      const overtimeHours = attn.overtime || 0;
      const absentDays = attn.totalAbsentDays || 0;

      const dailySalary = Number((baseSalary / workingDays).toFixed(2));
      const earnedSalary = Number((dailySalary * presentDays).toFixed(2));
      const overtimePay = Number(
        (
          (dailySalary / WORKING_HOURS_PER_DAY) *
          overtimeHours *
          OVERTIME_MULTIPLIER
        ).toFixed(2)
      );
      const absentDeductions = Number((dailySalary * absentDays).toFixed(2));
      const netSalary = Number(
        (earnedSalary + overtimePay - absentDeductions).toFixed(2)
      );
      return {
        ...attn,
        department: emp?.department || "Unknown",
        email: emp?.email || "unknown",
        baseSalary: baseSalary,
        workingDays: workingDays,
        deductions: 0,
        allowances: 0,
        status: "pending",
        netSalary: netSalary,
        absentDeductions: absentDeductions,
        Designation: emp?.position || "unknown",
      };
    });

    setPayroll(merged);
  }, [employdetails, attendance]);

  const hasSaved = useRef(false);

  useEffect(() => {
    if (payroll.length === 0) return;

    if (hasSaved.current) return;
    
    const saveInitialPayroll = async () => {
      hasSaved.current = true;

      try {
        console.log("Saving initial payroll:", payroll);
        const response = await axiosInstance.post("/admin/allmonthlypayrolls", payroll);
        console.log("Initial payroll data saved to database:", response.data);
      } catch (err) {
        console.error("Error saving initial payroll:", err);
        console.error("Error details:", err.response?.data);
      }
    };

    saveInitialPayroll();
  }, [payroll]);

  useEffect(() => {
    const fetchAllPayrolls = async () => {
      try {
        const res = await axiosInstance.get("/admin/allpayrolls");
        console.log("All payrolls fetched:", res.data);
        setAllPayrolls(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching all monthly payrolls:", err);
        console.error("Error details:", err.response?.data);
      }
    };
    fetchAllPayrolls();
  }, []);

  useEffect(() => {
    if (selectedMonth && allPayrolls.length > 0) {
      const filtered = allPayrolls.filter(
        (item) => item.month === selectedMonth
      );
      setEmployees(filtered);
    }
  }, [selectedMonth, allPayrolls]);

  const departments = ["all", "Engineering", "Marketing", "Sales", "HR"];

  const calculateNetSalary = (emp) => {
    if (!emp || !emp.baseSalary || !emp.workingDays) return 0;

    const dailySalary = emp.baseSalary / emp.workingDays;

    const earnedSalary = dailySalary * emp.presentDays;

    const overtimePay =
      (dailySalary / WORKING_HOURS_PER_DAY) *
      (emp.overtime || 0) *
      OVERTIME_MULTIPLIER;

    const absentDeductions = dailySalary * (emp.totalAbsentDays || 0);

    const netSalary = Number(
      (earnedSalary + overtimePay - absentDeductions).toFixed(2)
    );

    return netSalary;
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDepartment =
      selectedDepartment === "all" || emp.department === selectedDepartment;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const totalPayroll = filteredEmployees.reduce(
    (sum, emp) => sum + calculateNetSalary(emp),
    0
  );

  const processedCount = filteredEmployees.filter(
    (e) => e.status === "processed"
  ).length;

  const pendingCount = filteredEmployees.filter(
    (e) => e.status === "pending"
  ).length;

  const generatedPayrolls = employees.filter((e) => e.status === "processed");

  const handleSelectEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((e) => e._id));
    }
  };

  const handleGeneratePayroll = () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmGeneration = async () => {
    if (selectedEmployees.length === 0) return;

    setShowConfirmModal(false);

    try {
      console.log("Updating payrolls for IDs:", selectedEmployees);
      
      const updatePromises = selectedEmployees.map((payrollId) => {
        console.log(`Updating payroll ${payrollId} with status: processed`);
        return axiosInstance.put(`/admin/updatepayrolls/${payrollId}`, {
          status: "processed",
        });
      });

      const results = await Promise.all(updatePromises);
      console.log("Update results:", results);

      const refreshResponse = await axiosInstance.get("/admin/allpayrolls");
      console.log("Refreshed payrolls:", refreshResponse.data);
      setAllPayrolls(refreshResponse.data.data || refreshResponse.data || []);

      setEmployees((prev) =>
        prev.map((emp) =>
          selectedEmployees.includes(emp._id)
            ? { ...emp, status: "processed" }
            : emp
        )
      );

      setPayrollGenerated(true);

      setTimeout(() => {
        setPayrollGenerated(false);
        setSelectedEmployees([]);
      }, 3000);
    } catch (err) {
      console.error("Error updating payrolls:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      alert(`Failed to update payroll: ${err.response?.data?.message || err.message}`);
    }
  };

  const viewPayslip = (employee) => {
    setSelectedPayslip(employee);
    setShowPayslipModal(true);
  };

  const pdfDownLoader = (emp) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(25);
    doc.text("HR-SYS", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("payslip", pageWidth / 2, 26, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Employee: ${emp.name}`, 14, 40);
    doc.text(`Employee ID: ${emp.empId}`, 14, 45);
    doc.text(`Department: ${emp.department}`, 14, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 55);
    doc.text(`month: ${emp.month}`, 14, 60);

    autoTable(doc, {
      startY: 66,
      theme: "grid",
      head: [["Description", "Amount"]],
      body: [
        ["Base Salary", `₹${emp.baseSalary.toLocaleString("en-IN")}`],
        ["Attendance", `${emp.presentDays} / ${emp.workingDays} days`],
        [
          "Overtime Pay",
          `₹${(
            (emp.baseSalary / emp.workingDays / 8) *
            emp.overtime *
            1.5
          ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        ],
        ["Total Leaves", `-₹${emp.leaves}`],
        ["Absent Deductions", `-₹${emp.absentDeductions}`],
        [
          "Net Salary",
          `₹${calculateNetSalary(emp).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`,
        ],
      ],
    });

    // Save file
    doc.save(`${emp.name}-Payslip.pdf`);
  };

  const allpdfMaker = (generatedPayrolls) => {
    generatedPayrolls.forEach((emp) => {
      pdfDownLoader(emp);
    });
  };


  const exportsToexel=(generatedPayrolls)=>{

     const worksheet = XLSX.utils.json_to_sheet(generatedPayrolls);

  // Create workbook & add the sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");

  const wscols = Object.keys(generatedPayrolls[0] || {}).map(() => ({ wch: 15 }));
    worksheet["!cols"] = wscols;

    

  // Convert to Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Download the file
  const file = new Blob([excelBuffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(file, "Payroll_Report.xlsx");
    



  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="main-wrapper">
        <Navbar />

        <div className=" payroll-container">
          <div className="payroll-header">
            <div className="header-left">
              <button className="back-button" onClick={()=>{navigate("/dashboard")}}>
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="page-title">
                  <FaMoneyBillWave className="title-icon" />
                  Payroll Management
                </h1>
                <p className="page-subtitle">
                  Generate and manage employee payroll
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {payrollGenerated && (
            <div className="success-alert">
              <FaCheckCircle className="alert-icon" />
              <div>
                <strong>Payroll Generated Successfully!</strong>
                <p className="alert-message">
                  Payslips have been generated and are ready for distribution.
                </p>
              </div>
            </div>
          )}

          {/* Instructions Panel */}
          <div className="instructions-panel">
            <h3 className="instructions-title">How to Generate Payroll</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Select Period</strong>
                  <p>Choose the month for payroll generation</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Review Employee Data</strong>
                  <p>Check attendance, leaves, and overtime hours</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Select Employees</strong>
                  <p>Choose employees to process or select all</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Generate Payroll</strong>
                  <p>Click generate to create payslips</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-card-blue">
              <div className="stat-icon-wrapper">
                <FaUsers />
              </div>
              <div>
                <p className="stat-label">Total Employees</p>
                <h3 className="stat-value">{filteredEmployees.length}</h3>
              </div>
            </div>
            <div className="stat-card stat-card-green">
              <div className="stat-icon-wrapper">
                <FaCheckCircle />
              </div>
              <div>
                <p className="stat-label">Processed</p>
                <h3 className="stat-value">{processedCount}</h3>
                {processedCount > 0 && (
                  <button
                    className="view-payrolls-btn"
                    onClick={() => setShowGeneratedPayrolls(true)}
                  >
                    View Payrolls →
                  </button>
                )}
              </div>
            </div>
            <div className="stat-card stat-card-orange">
              <div className="stat-icon-wrapper">
                <FaClock />
              </div>
              <div>
                <p className="stat-label">Pending</p>
                <h3 className="stat-value">{pendingCount}</h3>
              </div>
            </div>
            <div className="stat-card stat-card-purple">
              <div className="stat-icon-wrapper">
                <FaChartLine />
              </div>
              <div>
                <p className="stat-label">Total Payroll</p>
                <h3 className="stat-value">
                  ₹{(totalPayroll / 1000).toFixed(1)}K
                </h3>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="filter-section">
            <div className="filter-left">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="select-wrapper">
                  
                <input
                  type="month"
                  id="start"
                  name="start"
                  min="2023-03"
                  value={selectedMonth}

                  className="filter-select"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                
              </div>

              <div className="select-wrapper">
                <FaFilter className="select-icon" />
                <select
                  className="filter-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-right">
              <button
                className="btn-primary"
                onClick={handleGeneratePayroll}
                disabled={selectedEmployees.length === 0}
              >
                <FaCheckCircle className="btn-icon" />
                Generate Payroll ({selectedEmployees.length})
              </button>
            </div>
          </div>

          {/* Employee Table */}
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Employee Payroll Details</h3>
              <button className="select-all-btn" onClick={handleSelectAll}>
                {selectedEmployees.length === filteredEmployees.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="table-wrapper">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedEmployees.length ===
                            filteredEmployees.length &&
                          filteredEmployees.length > 0
                        }
                        onChange={handleSelectAll}
                        className="table-checkbox"
                      />
                    </th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Attendance</th>
                    <th>Base Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp._id)}
                          onChange={() => handleSelectEmployee(emp._id)}
                          className="table-checkbox"
                        />
                      </td>
                      <td>
                        <div className="employee-info">
                          <div className="employee-name">{emp.name}</div>
                          <div className="employee-id">{emp.empId}</div>
                        </div>
                      </td>
                      <td>
                        <span className="department-badge">
                          {emp.department}
                        </span>
                      </td>
                      <td>
                        <div className="attendance-info">
                          <span>
                            {emp.presentDays}/{emp.workingDays}
                          </span>
                          {emp.leaves > 0 && (
                            <span className="leave-tag">{emp.leaves}L</span>
                          )}
                          {emp.overtime > 0 && (
                            <span className="overtime-tag">
                              +{emp.overtime}OT
                            </span>
                          )}
                        </div>
                      </td>
                      <td>₹{emp.baseSalary.toLocaleString()}</td>
                      <td>₹{emp.absentDeductions.toLocaleString()}</td>
                      <td>
                        <strong className="net-salary">
                          ₹
                          {calculateNetSalary(emp).toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={
                            emp.status === "processed"
                              ? "status-processed"
                              : "status-pending"
                          }
                        >
                          {emp.status === "processed" ? "Processed" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-btn"
                            onClick={() => viewPayslip(emp)}
                            title="View Payslip"
                            disabled={emp.status === "pending"}
                          >
                            <FaEye />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payslip Modal */}
          {showPayslipModal && selectedPayslip && (
            <div
              className="modal-overlay"
              onClick={() => setShowPayslipModal(false)}
            >
              <div
                className="payslip-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Payslip - {selectedMonth}</h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowPayslipModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="payslip-section">
                    <h3>Employee Details</h3>
                    <div className="payslip-row">
                      <span>Name:</span>
                      <strong>{selectedPayslip.name}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Employee ID:</span>
                      <strong>{selectedPayslip.empId}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Department:</span>
                      <strong>{selectedPayslip.department}</strong>
                    </div>
                  </div>

                  <div className="payslip-section">
                    <h3>Attendance</h3>
                    <div className="payslip-row">
                      <span>Working Days:</span>
                      <strong>{selectedPayslip.workingDays}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Present Days:</span>
                      <strong>{selectedPayslip.presentDays}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Leaves Taken:</span>
                      <strong>{selectedPayslip.leaves}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Overtime Hours:</span>
                      <strong>{selectedPayslip.overtime}</strong>
                    </div>
                    <div className="payslip-row">
                      <span>Absent days:</span>
                      <strong>{selectedPayslip.totalAbsentDays}</strong>
                    </div>
                  </div>

                  <div className="payslip-section">
                    <h3>Earnings</h3>
                    <div className="payslip-row">
                      <span>Base Salary:</span>
                      <strong>
                        ₹{selectedPayslip.baseSalary.toLocaleString()}
                      </strong>
                    </div>
                    <div className="payslip-row">
                      <span>Allowances:</span>
                      <strong>
                        ₹{selectedPayslip.allowances.toLocaleString()}
                      </strong>
                    </div>
                    <div className="payslip-row">
                      <span>Overtime Pay:</span>
                      <strong>
                        ₹
                        {(
                          (selectedPayslip.baseSalary /
                            selectedPayslip.workingDays /
                            8) *
                          selectedPayslip.overtime *
                          1.5
                        ).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </strong>
                    </div>
                  </div>

                  <div className="payslip-section">
                    <h3>Deductions</h3>
                    <div className="payslip-row">
                      <span>Total Deductions:</span>
                      <strong>
                        ₹{selectedPayslip.absentDeductions.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="payslip-section net-salary-section">
                    <div className="payslip-row">
                      <span className="net-label">NET SALARY:</span>
                      <strong className="net-amount">
                        ₹
                        {calculateNetSalary(selectedPayslip).toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowPayslipModal(false)}
                  >
                    Close
                  </button>
                  
                </div>
              </div>
            </div>
          )}

          {/* Generated Payrolls View */}
          {showGeneratedPayrolls && (
            <div
              className="modal-overlay"
              onClick={() => setShowGeneratedPayrolls(false)}
            >
              <div className="large-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Generated Payrolls - {selectedMonth}</h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowGeneratedPayrolls(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="payroll-summary">
                    <div className="summary-card">
                      <p>Total Employees</p>
                      <h3>{generatedPayrolls.length}</h3>
                    </div>
                    <div className="summary-card">
                      <p>Total Payroll Amount</p>
                      <h3 className="amount-green">
                        ₹
                        {generatedPayrolls
                          .reduce(
                            (sum, emp) => sum + calculateNetSalary(emp),
                            0
                          )
                          .toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                      </h3>
                    </div>
                    <div className="summary-card">
                      <p>Generated On</p>
                      <h3>{new Date().toLocaleDateString("en-IN")}</h3>
                    </div>
                  </div>

                  <div className="bulk-actions">
                    <button
                      className="btn-primary"
                      onClick={() => {
                        allpdfMaker(generatedPayrolls);
                      }}
                    >
                      <FaFileDownload className="btn-icon" />
                      Download All Payslips (PDF)
                    </button>
                    <button className="btn-secondary" onClick={()=>{exportsToexel(generatedPayrolls)}}>
                      <FaFileDownload className="btn-icon" />
                      Export to Excel
                    </button>
                  </div>

                  <div className="payrolls-list">
                    {generatedPayrolls.map((emp) => (
                      <div key={emp._id} className="payroll-card">
                        <div className="payroll-card-header">
                          <div>
                            <h4 className="payroll-employee-name">
                              {emp.name}
                            </h4>
                            <p className="payroll-employee-id">
                              {emp.empId} • {emp.department}
                            </p>
                          </div>
                          <div className="payroll-amount">
                            <span className="amount-label">Net Salary</span>
                            <h3 className="amount-value">
                              ₹
                              {calculateNetSalary(emp).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </h3>
                          </div>
                        </div>
                        <div className="payroll-details">
                          <div className="detail-row">
                            <span>Base Salary:</span>
                            <strong>₹{emp.baseSalary.toLocaleString()}</strong>
                          </div>
                          <div className="detail-row">
                            <span>Overtime Pay:</span>
                            <strong className="text-green">
                              +₹
                              {(
                                (emp.baseSalary / emp.workingDays / 8) *
                                emp.overtime *
                                1.5
                              ).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </strong>
                          </div>
                          <div className="detail-row">
                            <span>Deductions:</span>
                            <strong className="text-red">
                              -₹{emp.absentDeductions}
                            </strong>
                          </div>
                          <div className="detail-row">
                            <span>Attendance:</span>
                            <strong>
                              {emp.presentDays}/{emp.workingDays} days
                            </strong>
                          </div>
                        </div>
                        <div className="payroll-actions">
                          <button
                            className="btn-small-primary"
                            onClick={() => {
                              setShowGeneratedPayrolls(false);
                              viewPayslip(emp);
                            }}
                          >
                            <FaEye className="btn-icon-small" />
                            View Detailed Payslip
                          </button>
                          <button
                            className="btn-small-secondary"
                            onClick={() => {
                              pdfDownLoader(emp);
                            }}
                          >
                            <FaFileDownload className="btn-icon-small" />
                            Download PDF
                          </button>
                          <button className="btn-small-secondary">
                            <FaPrint />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div
              className="modal-overlay"
              onClick={() => setShowConfirmModal(false)}
            >
              <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="confirm-icon">
                  <FaExclamationTriangle />
                </div>
                <h2 className="confirm-title">Confirm Payroll Generation</h2>
                <p className="confirm-text">
                  You are about to generate payroll for{" "}
                  <strong>{selectedEmployees.length} employee(s)</strong> for
                  the period <strong>{selectedMonth}</strong>.
                </p>
                <div className="confirm-details">
                  <div className="confirm-row">
                    <span>Total Amount:</span>
                    <strong className="confirm-amount">
                      ₹
                      {filteredEmployees
                        .filter((e) => selectedEmployees.includes(e._id))
                        .reduce((sum, emp) => sum + calculateNetSalary(emp), 0)
                        .toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                    </strong>
                  </div>
                </div>
                <p className="confirm-warning">
                  <FaExclamationTriangle className="warning-icon" />
                  This action will mark the payroll as processed. Make sure all
                  data is correct.
                </p>
                <div className="confirm-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      confirmGeneration();
                      setShowConfirmModal(false);
                    }}
                  >
                    <FaCheckCircle className="btn-icon" />
                    Confirm & Generate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePayroll;