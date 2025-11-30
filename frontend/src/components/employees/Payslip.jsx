// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { FiDownload, FiCalendar, FiDollarSign } from "react-icons/fi";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import "../../styles/payslip.css";
// import "../../styles/dashboard.css";

// const PayslipDownload = () => {
//   const [payslips, setPayslips] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMonth, setSelectedMonth] = useState("");

//   useEffect(() => {
//     fetchPayslips();
//   }, []);

//   const fetchPayslips = async () => {
//     try {
//       // Dummy data for testing
//       const dummyPayslips = [
//         {
//           _id: "1",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2025-01",
//           baseSalary: 50000,
//           workingDays: 26,
//           presentDays: 24,
//           leaves: 2,
//           totalAbsentDays: 0,
//           totalHoursWorked: 192,
//           overtime: 8,
//           absentDeductions: 0,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 53000,
//           status: "processed",
//         },
//         {
//           _id: "2",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2024-12",
//           baseSalary: 50000,
//           workingDays: 25,
//           presentDays: 23,
//           leaves: 1,
//           totalAbsentDays: 1,
//           totalHoursWorked: 184,
//           overtime: 4,
//           absentDeductions: 2000,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 51000,
//           status: "processed",
//         },
//         {
//           _id: "3",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2024-11",
//           baseSalary: 50000,
//           workingDays: 24,
//           presentDays: 24,
//           leaves: 0,
//           totalAbsentDays: 0,
//           totalHoursWorked: 192,
//           overtime: 12,
//           absentDeductions: 0,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 53000,
//           status: "processed",
//         },
//         {
//           _id: "4",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2024-10",
//           baseSalary: 50000,
//           workingDays: 27,
//           presentDays: 25,
//           leaves: 2,
//           totalAbsentDays: 0,
//           totalHoursWorked: 200,
//           overtime: 6,
//           absentDeductions: 0,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 53000,
//           status: "processed",
//         },
//         {
//           _id: "5",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2024-09",
//           baseSalary: 50000,
//           workingDays: 26,
//           presentDays: 22,
//           leaves: 1,
//           totalAbsentDays: 3,
//           totalHoursWorked: 176,
//           overtime: 0,
//           absentDeductions: 6000,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 47000,
//           status: "processed",
//         },
//         {
//           _id: "6",
//           empId: "EMP001",
//           name: "Vishnu Kumar",
//           email: "vishnu.kumar@example.com",
//           department: "HR",
//           month: "2025-02",
//           baseSalary: 50000,
//           workingDays: 26,
//           presentDays: 20,
//           leaves: 0,
//           totalAbsentDays: 6,
//           totalHoursWorked: 160,
//           overtime: 0,
//           absentDeductions: 12000,
//           deductions: 2000,
//           allowances: 5000,
//           netSalary: 41000,
//           status: "pending",
//         },
//       ];

//       setPayslips(dummyPayslips);
//       setLoading(false);

//       // When ready to use real API, uncomment below:
//       // const empId = localStorage.getItem("empId");
//       // const response = await axios.get(`/api/payroll/employee/${empId}`);
//       // setPayslips(response.data);
//       // setLoading(false);
//     } catch (error) {
//       console.error("Error fetching payslips:", error);
//       setLoading(false);
//     }
//   };

//   const downloadPayslip = (payslip) => {
//     const doc = new jsPDF();

//     // Company Header
//     doc.setFillColor(102, 126, 234);
//     doc.rect(0, 0, 210, 40, "F");
    
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(24);
//     doc.setFont("helvetica", "bold");
//     doc.text("PAYSLIP", 105, 20, { align: "center" });
    
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.text("HR Management System", 105, 30, { align: "center" });

//     // Reset text color
//     doc.setTextColor(0, 0, 0);

//     // Employee Details Section
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Employee Details", 15, 55);

//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Employee ID: ${payslip.empId}`, 15, 65);
//     doc.text(`Name: ${payslip.name}`, 15, 72);
//     doc.text(`Email: ${payslip.email}`, 15, 79);
//     doc.text(`Department: ${payslip.department}`, 15, 86);
//     doc.text(`Month: ${formatMonth(payslip.month)}`, 15, 93);

//     // Attendance Details
//     doc.setFontSize(14);
//     doc.setFont("helvetica", "bold");
//     doc.text("Attendance Details", 120, 55);

//     doc.setFontSize(10);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Working Days: ${payslip.workingDays}`, 120, 65);
//     doc.text(`Present Days: ${payslip.presentDays}`, 120, 72);
//     doc.text(`Leaves: ${payslip.leaves}`, 120, 79);
//     doc.text(`Absent Days: ${payslip.totalAbsentDays}`, 120, 86);
//     doc.text(`Hours Worked: ${payslip.totalHoursWorked}`, 120, 93);
//     doc.text(`Overtime: ${payslip.overtime} hrs`, 120, 100);

//     // Salary Breakdown Table
//     doc.autoTable({
//       startY: 110,
//       head: [["Description", "Amount (₹)"]],
//       body: [
//         ["Base Salary", payslip.baseSalary.toFixed(2)],
//         ["Allowances", `+ ${payslip.allowances.toFixed(2)}`],
//         ["Absent Deductions", `- ${payslip.absentDeductions.toFixed(2)}`],
//         ["Other Deductions", `- ${payslip.deductions.toFixed(2)}`],
//       ],
//       foot: [["Net Salary", `₹ ${payslip.netSalary.toFixed(2)}`]],
//       headStyles: {
//         fillColor: [102, 126, 234],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//         fontSize: 11,
//       },
//       footStyles: {
//         fillColor: [16, 185, 129],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//         fontSize: 12,
//       },
//       bodyStyles: {
//         fontSize: 10,
//       },
//       alternateRowStyles: {
//         fillColor: [245, 247, 250],
//       },
//       margin: { left: 15, right: 15 },
//     });

//     // Footer
//     const finalY = doc.lastAutoTable.finalY + 20;
//     doc.setFontSize(9);
//     doc.setTextColor(100, 100, 100);
//     doc.text(
//       "This is a computer-generated payslip and does not require a signature.",
//       105,
//       finalY,
//       { align: "center" }
//     );
    
//     doc.setFontSize(8);
//     doc.text(
//       `Generated on: ${new Date().toLocaleDateString()}`,
//       105,
//       finalY + 7,
//       { align: "center" }
//     );

//     // Save the PDF
//     doc.save(`Payslip_${payslip.empId}_${payslip.month}.pdf`);
//   };

//   const formatMonth = (monthStr) => {
//     const [year, month] = monthStr.split("-");
//     const date = new Date(year, month - 1);
//     return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
//   };

//   const filteredPayslips = selectedMonth
//     ? payslips.filter((p) => p.month === selectedMonth)
//     : payslips;

//   if (loading) {
//     return (
//       <div className="payslip-loading">
//         <div className="spinner"></div>
//         <p>Loading payslips...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="payslip-container">
//       <div className="payslip-header">
//         <h1>Download Payslip</h1>
//         <p>View and download your monthly payslips</p>
//       </div>

//       {/* Month Filter */}
//       <div className="filter-section">
//         <FiCalendar className="filter-icon" />
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="month-filter"
//         >
//           <option value="">All Months</option>
//           {[...new Set(payslips.map((p) => p.month))].map((month) => (
//             <option key={month} value={month}>
//               {formatMonth(month)}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Payslips List */}
//       {filteredPayslips.length === 0 ? (
//         <div className="no-payslips">
//           <FiDollarSign className="empty-icon" />
//           <h3>No Payslips Available</h3>
//           <p>You don't have any payslips for the selected period.</p>
//         </div>
//       ) : (
//         <div className="payslips-grid">
//           {filteredPayslips.map((payslip) => (
//             <div key={payslip._id} className="payslip-card">
//               <div className="payslip-card-header">
//                 <div>
//                   <h3>{formatMonth(payslip.month)}</h3>
//                   <p className="emp-id">ID: {payslip.empId}</p>
//                 </div>
//                 <span
//                   className={`status-badge ${payslip.status}`}
//                 >
//                   {payslip.status}
//                 </span>
//               </div>

//               <div className="payslip-details">
//                 <div className="detail-row">
//                   <span>Department:</span>
//                   <strong>{payslip.department}</strong>
//                 </div>
//                 <div className="detail-row">
//                   <span>Present Days:</span>
//                   <strong>{payslip.presentDays}/{payslip.workingDays}</strong>
//                 </div>
//                 <div className="detail-row">
//                   <span>Net Salary:</span>
//                   <strong className="salary">₹ {payslip.netSalary.toFixed(2)}</strong>
//                 </div>
//               </div>

//               <button
//                 className="download-btn"
//                 onClick={() => downloadPayslip(payslip)}
//               >
//                 <FiDownload />
//                 Download Payslip
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PayslipDownload;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiClock, FiClipboard, FiFileText, FiDownload, FiLogOut, FiMenu } from "react-icons/fi";
import '../../styles/payslip.css';
import "../../styles/dashboard.css";
import { useAuth } from "../../utils/AuthContext";
import EmployeeSidebar from "../common/EmployeeSidebar";

const Payslip = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(null);
  

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

    const { user } = useAuth();
  
    useEffect(() => {
      if (user?.id) {
        setId(user?.employeeId)
      }
    }, [user])

  // const id = localStorage.getItem("employeeId");
  // Fetch payslips from API
  useEffect(() => {
    fetchPayslips();
  }, [id]);

  const fetchPayslips = async () => {
    
      try {
    if (!id) {
      console.error("No employee ID found in localStorage");
      return;
    }

    fetch(`http://localhost:4300/payroll/employee/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data?.data);
        
         setPayslips(data?.data);
      })
      .catch((err) => console.error("Error fetching payroll:", err));
     
     
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      setLoading(false);
    }
  };

  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const downloadPayslip = (payslip) => {
    const printContent = document.getElementById(`payslip-${payslip._id}`);
    const windowPrint = window.open("", "", "width=800,height=600");
    
    windowPrint.document.write(`
      <html>
        <head>
          <title>Payslip - ${formatMonth(payslip.month)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .payslip-print { max-width: 800px; margin: 0 auto; }
            .print-header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .print-header h1 { color: #4f46e5; margin: 0; }
            .print-header p { margin: 5px 0; color: #666; }
            .info-section { margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; }
            .info-label { font-weight: 600; color: #333; }
            .info-value { color: #666; }
            .section-title { font-size: 18px; font-weight: 600; color: #4f46e5; margin: 20px 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
            .earnings-deductions { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .column { background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .row:last-child { border-bottom: none; }
            .total-row { font-weight: 700; font-size: 16px; background: #4f46e5; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-row .label { font-size: 18px; }
            .total-row .value { font-size: 20px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  const viewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
  };

  const closePayslipView = () => {
    setSelectedPayslip(null);
  };

  return (
    <div className="dashboard-wrapper">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

 <EmployeeSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

     

      <div className="main-wrapper">
        <header className="top-navbar">
          <div className="navbar-left">
            <button className="toggle-btn" onClick={toggleSidebar}>
              <FiMenu />
            </button>

            <div className="page-title">
              <h1>Payslips</h1>
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

        <main className="main-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading payslips...</p>
            </div>
          ) : (
            <>
              {!selectedPayslip ? (
                <div className="payslips-list">
                  <div className="content-header">
                  
                  </div>

                  {payslips?.length === 0 ? (
                    <div className="empty-state">
                      <FiFileText className="empty-icon" />
                      <h3>No Payslips Available</h3>
                      <p>Your payslips will appear here once processed</p>
                    </div>
                  ) : (
                    <div className="payslips-grid">
                      {payslips?.map((payslip) => (
                        <div key={payslip._id} className="payslip-card">
                          <div className="card-header">
                            <div className="month-badge">
                              {formatMonth(payslip.month)}
                            </div>
                            <span className={`status-badge ${payslip.status}`}>
                              {payslip.status}
                            </span>
                          </div>

                          <div className="card-body">
                            <div className="salary-info">
                              <span className="salary-label">Net Salary</span>
                              <span className="salary-amount">
                                {formatCurrency(payslip.netSalary)}
                              </span>
                            </div>

                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Base Salary</span>
                                <span className="detail-value">
                                  {formatCurrency(payslip.baseSalary)}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Working Days</span>
                                <span className="detail-value">
                                  {payslip.presentDays}/{payslip.workingDays}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="card-footer">
                            <button
                              className="btn-view"
                              onClick={() => viewPayslip(payslip)}
                            >
                              <FiFileText /> View Details
                            </button>
                            <button
                              className="btn-download"
                              onClick={() => downloadPayslip(payslip)}
                            >
                              <FiDownload /> Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="payslip-detail-view">
                  <div className="detail-header">
                    <button className="btn-back" onClick={closePayslipView}>
                      ← Back to Payslips
                    </button>
                    <button
                      className="btn-download-main"
                      onClick={() => downloadPayslip(selectedPayslip)}
                    >
                      <FiDownload /> Download Payslip
                    </button>
                  </div>

                  <div
                    id={`payslip-${selectedPayslip._id}`}
                    className="payslip-print"
                  >
                    <div className="print-header">
                      <h1>Payslip</h1>
                     
                      <h2 style={{ marginTop: "20px", color: "#333" }}>
                        Payslip for {formatMonth(selectedPayslip.month)}
                      </h2>
                    </div>

                    <div className="info-section">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Employee ID:</span>
                          <span className="info-value">
                            {selectedPayslip.empId}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Employee Name:</span>
                          <span className="info-value">
                            {selectedPayslip.name}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">
                            {selectedPayslip.email}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Department:</span>
                          <span className="info-value">
                            {selectedPayslip.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="section-title">Attendance Summary</div>
                    <div className="info-section">
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Working Days:</span>
                          <span className="info-value">
                            {selectedPayslip.workingDays}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Present Days:</span>
                          <span className="info-value">
                            {selectedPayslip.presentDays}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Leaves:</span>
                          <span className="info-value">
                            {selectedPayslip.leaves}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Absent Days:</span>
                          <span className="info-value">
                            {selectedPayslip.totalAbsentDays}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Total Hours Worked:</span>
                          <span className="info-value">
                            {selectedPayslip.totalHoursWorked} hrs
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Overtime:</span>
                          <span className="info-value">
                            {selectedPayslip.overtime} hrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="section-title">Earnings & Deductions</div>
                    <div className="earnings-deductions">
                      <div className="column">
                        <h3 style={{ marginTop: 0, marginBottom: 15, color: "#059669" }}>
                          Earnings
                        </h3>
                        <div className="row">
                          <span>Base Salary</span>
                          <span>{formatCurrency(selectedPayslip.baseSalary)}</span>
                        </div>
                        <div className="row">
                          <span>Allowances</span>
                          <span>{formatCurrency(selectedPayslip.allowances)}</span>
                        </div>
                        <div className="row" style={{ fontWeight: 600, marginTop: 10, paddingTop: 10, borderTop: "2px solid #059669" }}>
                          <span>Total Earnings</span>
                          <span>
                            {formatCurrency(
                              selectedPayslip.baseSalary + selectedPayslip.allowances
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="column">
                        <h3 style={{ marginTop: 0, marginBottom: 15, color: "#dc2626" }}>
                          Deductions
                        </h3>
                        <div className="row">
                          <span>Absent Deductions</span>
                          <span>
                            {formatCurrency(selectedPayslip.absentDeductions)}
                          </span>
                        </div>
                        <div className="row">
                          <span>Other Deductions</span>
                          <span>{formatCurrency(selectedPayslip.deductions)}</span>
                        </div>
                        <div className="row" style={{ fontWeight: 600, marginTop: 10, paddingTop: 10, borderTop: "2px solid #dc2626" }}>
                          <span>Total Deductions</span>
                          <span>
                            {formatCurrency(
                              selectedPayslip.absentDeductions +
                                selectedPayslip.deductions
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="total-row">
                      <span className="label">Net Salary</span>
                      <span className="value">
                        {formatCurrency(selectedPayslip.netSalary)}
                      </span>
                    </div>

                    <div className="footer">
                      <p>
                        This is a computer-generated payslip and does not require
                        a signature.
                      </p>
                      <p>
                        Generated on:{" "}
                        {new Date().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Payslip;