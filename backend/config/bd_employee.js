
// backend/config/bd_employee.js
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error("DB connection failed", err); process.exit(1); });
