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

async function migrateUsersToSeparateCollection() {
  try {
    console.log("🚀 Starting migration...\n");

    const employees = await Employee.find({});
    console.log(`📊 Found ${employees.length} employees`);

    let migrated = 0;
    let skipped = 0;

    for (const employee of employees) {
      try {
        const existingUser = await User.findOne({
          email: employee.email.toLowerCase(),
        });

        if (existingUser) {
          console.log(`⏭️  Skipped: ${employee.email}`);
          skipped++;
          continue;
        }

        const newUser = new User({
          email: employee.email.toLowerCase(),
          passwordHash: employee.passwordHash,
          role: employee.role || "employee",
          employeeId: employee._id,
          active: employee.active !== undefined ? employee.active : true,
        });

        await newUser.save();
        migrated++;
        console.log(`✅ Migrated: ${employee.name} (${employee.role})`);
      } catch (error) {
        console.error(`❌ Error: ${employee.email}`, error.message);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📊 Total: ${employees.length}`);
    console.log("=".repeat(50));
    console.log("\n🎉 Migration complete!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateUsersToSeparateCollection();