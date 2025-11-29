const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {  // YYYY-MM
      type: String,
      required: true,
    },
    ratings: {
      taskCompletion: { type: Number, default: 0 },
      attendance: { type: Number, default: 0 },
      behaviour: { type: Number, default: 0 }
    },
    comments: {
      type: String,
      default: ""
    },
    score: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Performance", performanceSchema);
