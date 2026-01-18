// Admin user creation script
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected for admin creation"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Function to create a new admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (adminExists) {
      console.log(
        "Admin user already exists. Updating to ensure admin privileges.",
      );
      adminExists.isAdmin = true;
      await adminExists.save();
      console.log("Admin user updated with admin privileges:", adminExists);
      process.exit();
      return;
    }

    // Create new admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // This will be hashed automatically by the pre-save hook
      isAdmin: true,
    });

    console.log("Admin user created successfully:");
    console.log({
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
    });
    console.log("Please login with:");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit();
  }
};

// Execute the function
createAdminUser();
