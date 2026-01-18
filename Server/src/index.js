// Load environment variables first before any other imports
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const emailRoutes = require("./routes/emailRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const couponRoutes = require("./routes/couponRoutes");
const rateLimit = require("express-rate-limit");

// Initialize Express app
const app = express();

// Environment variables
const isProd = process.env.NODE_ENV === "production";
// In monorepo deployment, we don't need a separate CLIENT_URL since everything is on same domain
const CLIENT_URL = isProd
  ? "*"
  : process.env.CLIENT_URL || "http://localhost:3000";

// Security middleware for production
if (isProd) {
  // Use Helmet for security headers
  app.use(helmet());

  // Rate limiting to prevent abuse/DDoS
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });

  // Apply rate limiting to API routes
  app.use("/api/", apiLimiter);
}

// CORS configuration - simplified for monorepo deployment
const corsOptions = {
  origin: isProd
    ? "*" // In production with monorepo, CORS isn't needed between client and server
    : CLIENT_URL, // In development, respect the client URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "1mb" })); // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// File upload middleware
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: isProd ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB in prod, 10MB in dev
      files: 5, // Max 5 files at once
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
    useTempFiles: isProd, // Use temp files in production for better memory usage
    tempFileDir: "/tmp/",
    debug: !isProd,
  }),
);

// Static folder for uploads - conditionally setup based on environment
// In Vercel, static files need special handling
if (!isProd) {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
} else {
  // For Vercel, we could use a cloud storage provider like S3
  // Or handle file paths differently - using the uploads route defined below
  console.log("Production environment detected - static file hosting adjusted");
}

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
    serverSelectionTimeoutMS: isProd ? 10000 : 15000, // Shorter timeout in production
    socketTimeoutMS: 60000,
    family: 4, // Force IPv4
    maxPoolSize: isProd ? 100 : 50, // Larger pool in production
    retryWrites: true,
    connectTimeoutMS: isProd ? 20000 : 30000,
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
          "DNS resolution issue detected. Trying alternative approach...",
        );

        // Try to use a direct connection method if we're using SRV format
        if (process.env.MONGODB_URI.includes("mongodb+srv://")) {
          try {
            // Extract parts from the original connection string
            const uriWithoutProtocol = process.env.MONGODB_URI.replace(
              "mongodb+srv://",
              "",
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
                  console.log("Connected to MongoDB using direct connection"),
                )
                .catch((directErr) =>
                  handleRetry(directErr, retryCount, maxRetries),
                );
            }, 2000);
            return;
          } catch (parseErr) {
            console.error(
              "Failed to parse connection string for direct connection:",
              parseErr,
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
      }/${maxRetries})`,
    );
    setTimeout(() => {
      connectWithRetry(retryCount + 1, maxRetries);
    }, retryDelay);
  } else {
    console.error(
      `Failed to connect to MongoDB after ${
        maxRetries + 1
      } attempts. Service may be unavailable.`,
    );

    if (isProd) {
      // In production, consider sending an alert here
      console.error("CRITICAL: Database connection failed in production");
    } else {
      console.log(
        "Server will continue to run, but MongoDB functionality will not work.",
      );
    }
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
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Add API status endpoint
app.get("/api/status", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred",
    ...(isProd ? {} : { stack: err.stack }),
  });
});

// For Vercel serverless functions, we need to export the app
module.exports = app;

// Start server if not being imported (e.g., when running locally)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
