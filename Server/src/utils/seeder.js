// Load environment variables
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const scrapeProductsFromFakeStoreAPI = require("./scraper/fakeStoreApiScraper");

// Sample products data
const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling headphones with 30-hour battery life and comfortable over-ear design. Features quick charging and voice assistant integration.",
    price: 149.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Electronics",
    stock: 50,
    rating: 4.8,
    numReviews: 124,
    featured: true,
  },
  {
    name: "Smartwatch Series 5",
    description:
      "Water-resistant smartwatch with heart rate monitoring, GPS tracking, and a customizable interface. Perfect for fitness enthusiasts.",
    price: 299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Electronics",
    stock: 35,
    rating: 4.5,
    numReviews: 89,
    featured: true,
  },
  {
    name: "Professional DSLR Camera",
    description:
      "High-end DSLR camera with 24.2MP sensor, 4K video recording, and interchangeable lens system. Includes camera bag and basic accessories.",
    price: 1299.99,
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Electronics",
    stock: 15,
    rating: 4.9,
    numReviews: 56,
    featured: false,
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Adjustable office chair with lumbar support, breathable mesh back, and cushioned seat for all-day comfort. Ideal for home offices.",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Furniture",
    stock: 25,
    rating: 4.3,
    numReviews: 42,
    featured: false,
  },
  {
    name: "Premium Coffee Maker",
    description:
      "Programmable coffee maker with built-in grinder, thermal carafe, and multiple brewing options. Makes up to 12 cups.",
    price: 129.99,
    imageUrl:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Appliances",
    stock: 40,
    rating: 4.7,
    numReviews: 78,
    featured: true,
  },
  {
    name: "Orthopedic Memory Foam Pillow",
    description:
      "Contoured memory foam pillow that provides optimal neck support and improves sleep quality. Includes washable, hypoallergenic cover.",
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Home",
    stock: 60,
    rating: 4.6,
    numReviews: 103,
    featured: false,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-walled, vacuum-insulated water bottle that keeps beverages cold for 24 hours or hot for 12 hours. Durable and leak-proof.",
    price: 34.99,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Kitchen",
    stock: 75,
    rating: 4.4,
    numReviews: 91,
    featured: false,
  },
  {
    name: "Lightweight Hiking Backpack",
    description:
      "Durable 30L backpack with multiple compartments, hydration sleeve, and adjustable straps. Perfect for day hikes or travel.",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Outdoors",
    stock: 30,
    rating: 4.2,
    numReviews: 64,
    featured: false,
  },
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Create admin user
const createAdminUser = async () => {
  // Check if admin user already exists
  const adminExists = await User.findOne({ email: "admin@example.com" });
  if (adminExists) {
    return adminExists._id;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    isAdmin: true,
  });

  console.log("Admin user created");
  return adminUser._id;
};

// Import Data
const importData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await Order.deleteMany();

    console.log("Existing products and orders cleared");

    // Create admin user
    const adminUser = await createAdminUser();

    // Add admin user reference to products
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    // Insert products
    await Product.insertMany(sampleProducts);

    console.log("Default data imported successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error}`);
    process.exit(1);
  }
};

// Import products from Fake Store API
const importFakeStoreProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    console.log("Existing products cleared");

    // Create admin user
    const adminUser = await createAdminUser();

    // Get products from Fake Store API
    const fakeStoreProducts = await scrapeProductsFromFakeStoreAPI();

    // Add admin user reference to products
    const productsWithUser = fakeStoreProducts.map((product) => {
      return { ...product, user: adminUser };
    });

    // Insert products
    await Product.insertMany(productsWithUser);

    console.log(
      `${productsWithUser.length} products imported from Fake Store API!`
    );
    process.exit();
  } catch (error) {
    console.error(`Error importing Fake Store API data: ${error}`);
    process.exit(1);
  }
};

// Destroy Data
const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Order.deleteMany();

    console.log("Products and orders destroyed successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Execute based on command line argument
if (process.argv[2] === "-d") {
  destroyData();
} else if (process.argv[2] === "-f") {
  importFakeStoreProducts();
} else {
  importData();
}