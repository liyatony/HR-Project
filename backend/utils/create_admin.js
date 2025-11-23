



const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();
const Employee = require("../models/employee_model");
const User = require("../models/user_model");

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ DB Error:", err);
    process.exit(1);
  });

async function createAdmin() {
  try {
    const email = "liyamtony@gmail.com";
    const password = "Admin@123";

    // Check if admin already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      console.log("⚠️ Admin employee exists");
      
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log("⚠️ Admin user exists. No action needed.");
        process.exit();
      } else {
        // Create user for existing employee
        const user = new User({
          email: email.toLowerCase(),
          passwordHash: existingEmployee.passwordHash,
          role: "admin",
          employeeId: existingEmployee._id,
          active: true,
        });
        await user.save();
        console.log("✅ Admin user created!");
        console.log("📧 Email:", email);
        console.log("🔑 Password:", password);
        process.exit();
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin employee
    const admin = new Employee({
      name: "Super Admin",
      email,
      phone: "+91 9876543210",
      passwordHash,
      role: "admin",
      department: "HR",
      position: "HR Manager",
      dateOfJoining: new Date(),
      salary: 100000,
      active: true,
    });

    await admin.save();
    console.log("✅ Admin employee created!");

    // Create admin user
    const adminUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
      employeeId: admin._id,
      active: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created!");
    console.log("\n🎉 Setup complete!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();