
// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// const generateAccessTokenPayload = (user) => ({
//   id: user._id,
//   employeeId: user.employeeId,
//   email: user.email,
//   role: user.role,
//   name: (user.employeeId && user.employeeId.name) || user.name || ""
// });
const generateAccessTokenPayload = (user) => ({
  id: user._id,
  employeeId: user.employeeId,
  email: user.email,

  // 🔥 Convert user → employee in token
  role: user.role === "user" ? "employee" : user.role,

  name: (user.employeeId && user.employeeId.name) || user.name || ""
});

const verifyAccessToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied. Admin only." });
  next();
};

const isDeptHead = (req, res, next) => {
  if (!req.user || (req.user.role !== "dpt_head" && req.user.role !== "admin")) return res.status(403).json({ success: false, message: "Access denied. Department head or admin only." });
  next();
};

const isEmployeeOrOwner = (req, res, next) => {
  const resourceEmployeeId = req.params.id || req.body.employeeId;
  if (!req.user) return res.status(403).json({ success: false, message: "Access denied." });
  if (req.user.role === "admin" || req.user.role === "dpt_head" || String(req.user.employeeId) === String(resourceEmployeeId)) return next();
  return res.status(403).json({ success: false, message: "Access denied." });
};

module.exports = { verifyAccessToken, isAdmin, isDeptHead, isEmployeeOrOwner, generateAccessTokenPayload };
