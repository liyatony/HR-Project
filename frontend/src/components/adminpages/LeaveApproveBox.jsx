import React from "react";
import "../../styles/leaveapproveBox.css";

const LeaveActionBox = ({ leave, onApprove, onReject, onClose }) => {

  function isoToDateString(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN");
  }
  
  return (
    <div className="action-overlay">
      <div className="action-box">
        <h2>Review Leave Request</h2>

        <div className="section">
          <h3>Employee Details</h3>
          <p><strong>Name:</strong> {leave.employeeId.name}</p>
          <p><strong>Email:</strong> {leave.employeeId.email}</p>
        </div>

        <div className="section">
          <h3>Leave Details</h3>
          <p><strong>Type:</strong> {leave.leaveType}</p>
          <p><strong>From:</strong> {isoToDateString(leave.startDate)}</p>
          <p><strong>To:</strong> {isoToDateString(leave.endDate)}</p>
          <p><strong>Reason:</strong> {leave.reason}</p>
        </div>

        <div className="buttons">
          <button className="approve" onClick={() => {onApprove(leave.employeeId._id,leave.startDate, leave.endDate,leave.employeeId.name,leave._id,leave.employeeId.email),onClose()}}>
            Approve
          </button>

          <button className="reject" onClick={() =>{ onReject(leave._id,leave.employeeId.name,leave.employeeId.email,leave.startDate,leave.endDate),onClose()}}>
            Reject
          </button>

          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionBox;
