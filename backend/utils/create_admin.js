



// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");
// require("dotenv").config();
// const Employee = require("../models/employee_model");
// const User = require("../models/user_model");

// mongoose
//   .connect(process.env.DB_URL)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.log("❌ DB Error:", err);
//     process.exit(1);
//   });

// async function createAdmin() {
//   try {
//     const email = "liyamtony@gmail.com";
//     const password = "Admin@123";

//     // Check if admin already exists
//     const existingEmployee = await Employee.findOne({ email });
//     if (existingEmployee) {
//       console.log("⚠️ Admin employee exists");
      
//       const existingUser = await User.findOne({ email: email.toLowerCase() });
//       if (existingUser) {
//         console.log("⚠️ Admin user exists. No action needed.");
//         process.exit();
//       } else {
//         // Create user for existing employee
//         const user = new User({
//           email: email.toLowerCase(),
//           passwordHash: existingEmployee.passwordHash,
//           role: "admin",
//           employeeId: existingEmployee._id,
//           active: true,
//         });
//         await user.save();
//         console.log("✅ Admin user created!");
//         console.log("📧 Email:", email);
//         console.log("🔑 Password:", password);
//         process.exit();
//       }
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Create admin employee
//     const admin = new Employee({
//       name: "Super Admin",
//       email,
//       phone: "+91 9876543210",
//       passwordHash,
//       role: "admin",
//       department: "HR",
//       position: "HR Manager",
//       dateOfJoining: new Date(),
//       salary: 100000,
//       active: true,
//     });

//     await admin.save();
//     console.log("✅ Admin employee created!");

//     // Create admin user
//     const adminUser = new User({
//       email: email.toLowerCase(),
//       passwordHash,
//       role: "admin",
//       employeeId: admin._id,
//       active: true,
//     });

//     await adminUser.save();
//     console.log("✅ Admin user created!");
//     console.log("\n🎉 Setup complete!");
//     console.log("📧 Email:", email);
//     console.log("🔑 Password:", password);
    
//     process.exit();
//   } catch (error) {
//     console.error("❌ Error:", error);
//     process.exit(1);
//   }
// }

// createAdmin();



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

// Array of admins to create
const ADMINS = [
  {
    name: "Super Admin 1",
    email: "liyamtony@gmail.com",
    password: "Admin@123",
    phone: "+91 9876543210",
    department: "HR",
    position: "HR Manager",
    salary: 100000,
  },
  {
    name: "Super Admin 2",
    email: "valka6300@gmail.com", // Change this to your second admin email
    password: "Admin@456",        // Change this to your second admin password
    phone: "+91 9876543211",
    department: "IT",
    position: "IT Manager",
    salary: 100000,
  },

{
    name: "Super Admin 3",
    email: "aparnnaraju3@gmail.com", // Change this to your second admin email
    password: "Admin@789",        // Change this to your second admin password
    phone: "+91 9876543212",
    department: "HR",
    position: "HR Assistant Manager",
    salary: 50000,
  },

];

async function createAdmin(adminData) {
  try {
    const { email, password, name, phone, department, position, salary } = adminData;

    console.log(`\n🔄 Processing admin: ${name} (${email})`);

    // Check if admin already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmployee) {
      console.log(`⚠️  Admin employee already exists: ${email}`);
      
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.log(`✓  Admin user already exists. Skipping...`);
        return { success: true, message: "Already exists" };
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
        console.log(`✅ Admin user created for existing employee!`);
        return { success: true, message: "User created" };
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin employee
    const admin = new Employee({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: "admin",
      department,
      position,
      dateOfJoining: new Date(),
      salary,
      active: true,
    });

    await admin.save();
    console.log(`✅ Admin employee created: ${name}`);

    // Create admin user
    const adminUser = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
      employeeId: admin._id,
      active: true,
    });

    await adminUser.save();
    console.log(`✅ Admin user created!`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    
    return { success: true, message: "Created successfully" };
  } catch (error) {
    console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
    return { success: false, message: error.message };
  }
}

async function createAllAdmins() {
  console.log("🚀 Starting admin creation process...");
  console.log(`📝 Total admins to process: ${ADMINS.length}\n`);

  const results = [];

  for (const adminData of ADMINS) {
    const result = await createAdmin(adminData);
    results.push({ ...adminData, result });
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));

  results.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.name}`);
    console.log(`   Email: ${item.email}`);
    console.log(`   Status: ${item.result.success ? "✅" : "❌"} ${item.result.message}`);
    if (item.result.success && item.result.message === "Created successfully") {
      console.log(`   Password: ${item.password}`);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Admin creation process completed!");
  console.log("=".repeat(60) + "\n");

  process.exit();
}

createAllAdmins();