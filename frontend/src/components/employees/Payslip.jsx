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
          <title>Payslip - ${formatMonth(payslip?.month)}</title>
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
          ${printContent?.innerHTML}
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
                            {/* <button
                              className="btn-download"
                              onClick={() => downloadPayslip(payslip)}
                            >
                              <FiDownload /> Download
                            </button> */}
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