const Payroll = require("../models/payroll_model");

// Create payroll record
exports.createPayroll = async (req, res) => {
  try {
    const {
      empId,
      name,
      email,
      department,
      month,
      baseSalary,
      workingDays,
      presentDays,
      leaves,
      overtime,
      deductions,
      allowances,
    } = req.body;

    // Calculate total absent days
    const totalAbsentDays = workingDays - (presentDays + leaves);

    // Calculate absent deductions (pro-rata based on absent days)
    const dailySalary = baseSalary / workingDays;
    const absentDeductions = dailySalary * totalAbsentDays;

    // Calculate net salary
    const grossSalary = baseSalary - absentDeductions;
    const netSalary = grossSalary + (allowances || 0) - (deductions || 0);

    const payroll = new Payroll({
      empId,
      name,
      email,
      department,
      month,
      baseSalary,
      workingDays,
      presentDays,
      leaves: leaves || 0,
      totalAbsentDays,
      overtime: overtime || 0,
      absentDeductions,
      deductions: deductions || 0,
      allowances: allowances || 0,
      netSalary,
    });

    await payroll.save();

    res.status(201).json({
      success: true,
      message: "Payroll record created successfully",
      data: payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all payroll records with filters
exports.getAllPayrolls = async (req, res) => {
  try {
    const { month, department, status, empId } = req.query;
    const filter = {};

    if (month) filter.month = month;
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (empId) filter.empId = empId;

    const payrolls = await Payroll.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single payroll record by ID
exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payroll by employee ID and month
exports.getPayrollByEmpAndMonth = async (req, res) => {
  try {
    const { empId, month } = req.params;

    const payroll = await Payroll.findOne({ empId, month });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found for this employee and month",
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPayrollByEmpId = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;
    let empId = id

    console.log("empId", empId);
    

    const filter = { empId };
    if (month) filter.month = month;

    const payrolls = await Payroll.find(filter).sort({ month: -1 });

    if (payrolls.length === 0) {
      return res.status(404).json({
        success: false,
        message: month 
          ? "Payroll record not found for this employee and month"
          : "No payroll records found for this employee",
      });
    }

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: month ? payrolls[0] : payrolls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payroll record
exports.updatePayroll = async (req, res) => {
  try {
    const {
      presentDays,
      leaves,
      overtime,
      deductions,
      allowances,
      totalHoursWorked,
    } = req.body;

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    // Update fields if provided
    if (presentDays !== undefined) payroll.presentDays = presentDays;
    if (leaves !== undefined) payroll.leaves = leaves;
    if (overtime !== undefined) payroll.overtime = overtime;
    if (deductions !== undefined) payroll.deductions = deductions;
    if (allowances !== undefined) payroll.allowances = allowances;
    if (totalHoursWorked !== undefined)
      payroll.totalHoursWorked = totalHoursWorked;

    // Recalculate totals
    payroll.totalAbsentDays =
      payroll.workingDays - (payroll.presentDays + payroll.leaves);
    const dailySalary = payroll.baseSalary / payroll.workingDays;
    payroll.absentDeductions = dailySalary * payroll.totalAbsentDays;

    const grossSalary = payroll.baseSalary - payroll.absentDeductions;
    payroll.netSalary =
      grossSalary + payroll.allowances - payroll.deductions;

    await payroll.save();

    res.status(200).json({
      success: true,
      message: "Payroll record updated successfully",
      data: payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payroll status
exports.updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "processed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending' or 'processed'",
      });
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll status updated successfully",
      data: payroll,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete payroll record
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payroll summary by month
exports.getPayrollSummary = async (req, res) => {
  try {
    const { month } = req.params;

    const summary = await Payroll.aggregate([
      { $match: { month } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalBaseSalary: { $sum: "$baseSalary" },
          totalDeductions: { $sum: "$deductions" },
          totalAbsentDeductions: { $sum: "$absentDeductions" },
          totalAllowances: { $sum: "$allowances" },
          totalNetSalary: { $sum: "$netSalary" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processedCount: {
            $sum: { $cond: [{ $eq: ["$status", "processed"] }, 1, 0] },
          },
        },
      },
    ]);

    if (summary.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payroll records found for this month",
      });
    }

    res.status(200).json({
      success: true,
      data: summary[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get department-wise payroll summary
exports.getDepartmentWiseSummary = async (req, res) => {
  try {
    const { month } = req.params;

    const summary = await Payroll.aggregate([
      { $match: { month } },
      {
        $group: {
          _id: "$department",
          employeeCount: { $sum: 1 },
          totalBaseSalary: { $sum: "$baseSalary" },
          totalNetSalary: { $sum: "$netSalary" },
          totalDeductions: { $sum: "$deductions" },
          totalAllowances: { $sum: "$allowances" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};