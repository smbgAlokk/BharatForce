// require("dotenv").config();
// const mongoose = require("mongoose");
// const { Department, Designation, Branch } = require("./models/OrgModels");
// const User = require("./models/User");

// // ✅ CONFIGURATION
// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/bharatforce";

// const TARGET_EMAIL = "alokdeoria01@gmail.com";

// mongoose
//   .connect(MONGODB_URI)
//   .then(async () => {
//     console.log("✅ Connected to MongoDB...");

//     // 1. Find the User to get the correct Tenant ID
//     const user = await User.findOne({ email: TARGET_EMAIL });

//     if (!user) {
//       console.log(`❌ Error: User with email "${TARGET_EMAIL}" not found.`);
//       console.log(
//         "   Please Register this user via the App first, or update TARGET_EMAIL in this script."
//       );
//       process.exit(1);
//     }

//     // We use companyId as the tenant identifier
//     const tenantId = user.companyId;

//     if (!tenantId) {
//       console.log("❌ Error: This user is not linked to any Company/Tenant.");
//       process.exit(1);
//     }

//     console.log(`🌱 Seeding Org Data for Tenant ID: ${tenantId}`);

//     // 2. Clear existing data for this tenant (to avoid duplicates)
//     await Department.deleteMany({ tenantId });
//     await Designation.deleteMany({ tenantId });
//     await Branch.deleteMany({ tenantId });

//     // 3. Create Departments
//     const depts = await Department.insertMany([
//       { tenantId, companyId: tenantId, name: "Engineering", code: "ENG" },
//       { tenantId, companyId: tenantId, name: "Human Resources", code: "HR" },
//       { tenantId, companyId: tenantId, name: "Sales", code: "SAL" },
//       { tenantId, companyId: tenantId, name: "Marketing", code: "MKT" },
//     ]);
//     console.log(`✅ Added ${depts.length} Departments`);

//     // 4. Create Designations
//     const desigs = await Designation.insertMany([
//       { tenantId, companyId: tenantId, name: "Software Engineer", grade: "L1" },
//       { tenantId, companyId: tenantId, name: "Senior Developer", grade: "L2" },
//       { tenantId, companyId: tenantId, name: "Team Lead", grade: "L3" },
//       { tenantId, companyId: tenantId, name: "HR Manager", grade: "M1" },
//       { tenantId, companyId: tenantId, name: "Sales Executive", grade: "S1" },
//     ]);
//     console.log(`✅ Added ${desigs.length} Designations`);

//     // 5. Create Branches
//     const branches = await Branch.insertMany([
//       {
//         tenantId,
//         companyId: tenantId,
//         name: "Head Office",
//         location: "Gurugram",
//       },
//       {
//         tenantId,
//         companyId: tenantId,
//         name: "Bangalore Hub",
//         location: "Bangalore",
//       },
//       {
//         tenantId,
//         companyId: tenantId,
//         name: "Mumbai Branch",
//         location: "Mumbai",
//       },
//     ]);
//     console.log(`✅ Added ${branches.length} Branches`);

//     console.log("🎉 SUCCESS! Database populated. You can now Add Employees.");
//     process.exit();
//   })
//   .catch((err) => {
//     console.error("❌ Database Connection Error:", err);
//     process.exit(1);
//   });
