const express = require("express");
const router = express.Router();
const { createLeaveRequest, getEmployeeLeaveRequests } = require("../controllers/leaveController");

router.post("/leave/apply", createLeaveRequest);
router.post("/leave/history", getEmployeeLeaveRequests);

module.exports = router;
