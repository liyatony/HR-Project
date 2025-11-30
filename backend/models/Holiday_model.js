const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  description: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Holiday", holidaySchema);
