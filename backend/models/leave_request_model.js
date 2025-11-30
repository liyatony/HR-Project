// const mongoose = require("mongoose");

// const leaveRequestSchema = new mongoose.Schema(
//   {
//     employeeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },
//     leaveType: {
//       type: String,
//       required: true,
//       enum: ["sick", "casual", "annual", "maternity", "paternity", "unpaid"],
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//     },
//     numberOfDays: {
//       type: Number,
//       required: true,
//     },
//     reason: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     appliedDate: {
//       type: Date,
//       default: Date.now,
//     },
//     reviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       default: null,
//     },
//     reviewedDate: {
//       type: Date,
//       default: null,
//     },
//     reviewerComments: {
//       type: String,
//       trim: true,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);