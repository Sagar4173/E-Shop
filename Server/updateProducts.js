const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const User = require("./src/models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log("MongoDB Connected...");

      const adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        console.log("No admin user found. Please create an admin user first.");
        process.exit(1);
      }

      console.log(`Found admin user: ${adminUser.name} (${adminUser._id})`);

      const productsToUpdate = await Product.find({
        $or: [{ user: { $exists: false } }, { user: null }],
      });
      console.log(
        `Found ${productsToUpdate.length} products without a user field.`
      );

      if (productsToUpdate.length > 0) {
        for (const product of productsToUpdate) {
          product.user = adminUser._id;
          await product.save();
          console.log(`Updated product: ${product.name}`);
        }
        console.log("All products updated successfully.");
      } else {
        console.log("No products need to be updated.");
      }
    } catch (error) {
      console.error("Error updating products:", error);
    } finally {
      mongoose.disconnect();
      console.log("MongoDB Disconnected");
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
