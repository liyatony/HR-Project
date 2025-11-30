const Employee = require("../models/employee_model");

// @desc    Get employee by ID
// @route   GET /api/employee/:id
// @access  Public or Protected (depending on your auth setup)
exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Find employee
    // const employee = await Employee.findById(employeeId).select("-passwordHash");
const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};
