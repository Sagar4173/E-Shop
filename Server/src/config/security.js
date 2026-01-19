// Security configuration for production
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const isProd = process.env.NODE_ENV === "production";

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts, please try again later.",
});

// Apply security middleware
const applySecurityMiddleware = (app) => {
  if (isProd) {
    // Use Helmet for security headers
    app.use(helmet());

    // Apply rate limiting to API routes
    app.use("/api/", apiLimiter);

    // Apply stricter rate limiting to auth routes
    app.use("/api/users/login", authLimiter);
    app.use("/api/users/register", authLimiter);
  }
};

module.exports = { apiLimiter, authLimiter, applySecurityMiddleware };
