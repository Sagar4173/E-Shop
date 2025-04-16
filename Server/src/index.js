// Load environment variables first before any other imports
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Log environment variables (excluding sensitive info)
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  STRIPE_KEYS_CONFIGURED:
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY,
  MONGODB_CONNECTED: !!process.env.MONGODB_URI,
});

// Enhanced MongoDB connection with retry and DNS fallback logic
const connectWithRetry = (retryCount = 0, maxRetries = 5) => {
  console.log(`MongoDB connection attempt ${retryCount + 1}/${maxRetries + 1}`);

  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000, // Increased from 10000
    socketTimeoutMS: 60000, // Increased from 45000
    family: 4, // Force IPv4
    maxPoolSize: 50,
    retryWrites: true,
    connectTimeoutMS: 30000, // Increase connection timeout
  };

  return mongoose
    .connect(process.env.MONGODB_URI, connectionOptions)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);

      // Check if we hit the DNS resolution error
      if (
        (err.code === "ETIMEOUT" || err.code === "ENOTFOUND") &&
        (err.syscall === "queryTxt" || err.syscall === "getaddrinfo")
      ) {
        console.log(
          "DNS resolution issue detected. Trying alternative approach..."
        );

        // Try to use a direct connection method if we're using SRV format
        if (process.env.MONGODB_URI.includes("mongodb+srv://")) {
          try {
            // Extract parts from the original connection string
            const uriWithoutProtocol = process.env.MONGODB_URI.replace(
              "mongodb+srv://",
              ""
            );
            const [credentials, rest] = uriWithoutProtocol.split("@");
            const [host, dbPath] = rest.split("/");

            // Create a direct connection string using the standard MongoDB port 27017
            // This bypasses the SRV lookup
            const directUri = `mongodb://${credentials}@${
              host.split(".")[0]
            }.${host.split(".").slice(1).join(".")}:27017/${dbPath}`;
            console.log("Attempting direct connection fallback...");

            // Try the direct connection after a short delay
            setTimeout(() => {
              mongoose
                .connect(directUri, { ...connectionOptions, ssl: true })
                .then(() =>
                  console.log("Connected to MongoDB using direct connection")
                )
                .catch((directErr) =>
                  handleRetry(directErr, retryCount, maxRetries)
                );
            }, 2000);
            return;
          } catch (parseErr) {
            console.error(
              "Failed to parse connection string for direct connection:",
              parseErr
            );
          }
        }
      }

      // Handle normal retry logic
      handleRetry(err, retryCount, maxRetries);
    });
};

// Helper function to handle retry logic
const handleRetry = (err, retryCount, maxRetries) => {
  if (retryCount < maxRetries) {
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
    console.log(
      `Retrying MongoDB connection in ${retryDelay / 1000} seconds... (${
        retryCount + 1
      }/${maxRetries})`
    );
    setTimeout(() => {
      connectWithRetry(retryCount + 1, maxRetries);
    }, retryDelay);
  } else {
    console.error(
      `Failed to connect to MongoDB after ${
        maxRetries + 1
      } attempts. Service may be unavailable.`
    );
    console.log(
      "Server will continue to run, but MongoDB functionality will not work."
    );
    // Don't exit - allow the server to run without DB connection
    // For production, you might want to add a health check endpoint that reports DB status
  }
};

// Start the connection process
connectWithRetry();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/emails", emailRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("E-Commerce API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
