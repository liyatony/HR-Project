const express = require("express");
const router = express.Router();
const { getPayrollById, getPayrollByEmpId } = require("../controllers/payrollController");

router.get("/payroll/:id", getPayrollById);
router.get("/payroll/employee/:id", getPayrollByEmpId);

module.exports = router;