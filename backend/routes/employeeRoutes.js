const express = require("express");
const router = express.Router();
const { getEmployeeById } = require("../controllers/employeeController");

router.get("/employee/:id", getEmployeeById);

module.exports = router;
