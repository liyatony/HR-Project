// const LeaveRequest = require("../models/leave_request_model");
const LeaveRequest = require("../models/leaveReques_model");
const Employee = require("../models/employee_model");

// Calculate number of days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
};

// @desc    Create a new leave request
// @route   POST /api/leaves/apply
// @access  Private (Employee)
exports.createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    // Validation
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be in the past",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Calculate number of days
    const numberOfDays = calculateDays(startDate, endDate);

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: "pending",
      appliedDate: new Date(),
    });

    // Populate employee details
    await leaveRequest.populate("employeeId", "name email department");

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit leave request",
      error: error.message,
    });
  }
};

// @desc    Get all leave requests for a specific employee
// @route   GET /api/leaves/employee/:employeeId
// @access  Private (Employee)
exports.getEmployeeLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Get all leave requests for this employee
    const leaveRequests = await LeaveRequest.find({ employeeId })
      .populate("employeeId", "name email department")
      .populate("reviewedBy", "name email")
      .sort({ appliedDate: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      count: leaveRequests.length,
      data: leaveRequests,
    });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves/all
// @access  Private (Admin)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, department, leaveType } = req.query;

    // Build filter object
    let filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    // Get all leave requests
    const leaveRequests = await LeaveRequest.find(filter)
      .populate("employeeId", "name email department position")
      .populate("reviewedBy", "name email")
      .sort({ appliedDate: -1 });

    // Filter by department if specified
    let filteredRequests = leaveRequests;
    if (department) {
      filteredRequests = leaveRequests.filter(
        (request) => request.employeeId?.department === department
      );
    }

    res.status(200).json({
      success: true,
      count: filteredRequests.length,
      data: filteredRequests,
    });
  } catch (error) {
    console.error("Error fetching all leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

// @desc    Update leave request status (Approve/Reject)
// @route   PUT /api/leaves/:leaveId/status
// @access  Private (Admin/Manager)
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, reviewedBy, reviewerComments } = req.body;

    // Validation
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    if (!reviewedBy) {
      return res.status(400).json({
        success: false,
        message: "Reviewer ID is required",
      });
    }

    // Check if leave request exists
    const leaveRequest = await LeaveRequest.findById(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Check if already reviewed
    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${leaveRequest.status}`,
      });
    }

    // Update leave request
    leaveRequest.status = status;
    leaveRequest.reviewedBy = reviewedBy;
    leaveRequest.reviewedDate = new Date();
    if (reviewerComments) {
      leaveRequest.reviewerComments = reviewerComments;
    }

    await leaveRequest.save();

    // Populate employee and reviewer details
    await leaveRequest.populate("employeeId", "name email department");
    await leaveRequest.populate("reviewedBy", "name email");

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Error updating leave request status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update leave request status",
      error: error.message,
    });
  }
};

// @desc    Delete a leave request
// @route   DELETE /api/leaves/:leaveId
// @access  Private (Employee/Admin)
exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leaveRequest = await LeaveRequest.findById(leaveId);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Only allow deletion of pending requests
    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be deleted",
      });
    }

    await LeaveRequest.findByIdAndDelete(leaveId);

    res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete leave request",
      error: error.message,
    });
  }
};