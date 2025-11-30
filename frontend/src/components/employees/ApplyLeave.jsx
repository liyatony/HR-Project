
import React, { useEffect, useState } from 'react';
import { FiHome, FiUser, FiClock, FiClipboard, FiFileText, FiDownload, FiLogOut, FiMenu, FiCalendar, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import '../../styles/leavepage.css';
import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../utils/AuthContext';
import EmployeeSidebar from '../common/EmployeeSidebar';

export default function LeaveManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('apply');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [id, setId] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setId(user?.employeeId)
    }
  }, [user])



  // const id = localStorage.getItem("employeeId");

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    employeeId: id
  });

  useEffect(() => {
    if (id) {
      setFormData({
        employeeId: id
      })
    }
  }, [id])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4300/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Leave request submitted successfully!');
        setFormData({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: ''
        });
      } else {
        alert(data.message || 'Failed to submit leave request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="status-icon approved" />;
      case 'rejected':
        return <FiXCircle className="status-icon rejected" />;
      default:
        return <FiAlertCircle className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  useEffect(() => {
    if (!id) {
      console.error("No employee ID found in localStorage");
      return;
    }

    fetch("http://localhost:4300/leave/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLeaveRequests(data?.data);
      })
      .catch((err) => console.error("Error fetching leave history:", err));
  }, [id]);



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
              <h1>Leave Page</h1>
             
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

        {/* TAB NAVIGATION */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
          >
            <FiFileText /> Apply Leave
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FiCalendar /> Leave History
          </button>
        </div>

        <main className="content-area">
          {activeTab === 'apply' ? (
            <div className="leave-form-container">
              <div className="form-card">
                <h2 className="form-title">Apply for Leave</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="leaveType">Leave Type</label>
                    <select
                      id="leaveType"
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="annual">Annual Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="startDate">Start Date</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason for Leave</label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                      placeholder="Please provide a reason for your leave request..."
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                  </button>
                </form>
              </div>

              <div className="leave-balance-card">
                <h3>Leave Balance</h3>
                <div className="balance-grid">
                  <div className="balance-item">
                    <span className="balance-label">Casual Leave</span>
                    <span className="balance-value">8 days</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Sick Leave</span>
                    <span className="balance-value">10 days</span>
                  </div>
                  <div className="balance-item">
                    <span className="balance-label">Annual Leave</span>
                    <span className="balance-value">15 days</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="leave-history-container">
              <h2 className="section-title">Leave Request History</h2>
              <div className="leave-list">
                {leaveRequests?.map((request) => (
                  <div key={request.id} className="leave-card">
                    <div className="leave-header">
                      <div className="leave-type-info">
                        <FiCalendar className="calendar-icon" />
                        <div>
                          <h3>{request.leaveType}</h3>
                          <p className="date-range">
                            {new Date(request.startDate).toLocaleDateString()} to{" "}
                            {new Date(request.endDate).toLocaleDateString()} ({request.days} days)
                          </p>
                        </div>
                      </div>
                      <div className={getStatusClass(request.status)}>
                        {getStatusIcon(request.status)}
                        <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </div>
                    </div>
                    <div className="leave-body">
                      <p className="leave-reason"><strong>Reason:</strong> {request.reason}</p>
                      <p className="applied-date">Applied on: {new Date(request.appliedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}