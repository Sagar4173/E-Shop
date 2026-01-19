const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes - verifies the JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header and trim any whitespace
      token = req.headers.authorization.split(" ")[1]?.trim();

      // Enhanced validation - check for null, undefined, or invalid format
      if (
        !token ||
        token === "null" ||
        token === "undefined" ||
        token.length < 20
      ) {
        return res
          .status(401)
          .json({ message: "Invalid authentication token format" });
      }

      try {
        // Verify token with explicit error handling
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id (from token) and exclude password
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return res
            .status(401)
            .json({ message: "User not found or deactivated" });
        }

        // Add token expiration time check if needed
        const tokenExp = decoded.exp * 1000; // Convert to milliseconds
        if (Date.now() >= tokenExp) {
          return res.status(401).json({ message: "Token has expired" });
        }

        req.user = user;
        next();
      } catch (jwtError) {
        // Specific error handling for JWT verification
        if (jwtError.name === "JsonWebTokenError") {
          console.error("JWT Error:", jwtError.message);
          return res
            .status(401)
            .json({ message: "Invalid authentication token" });
        } else if (jwtError.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Authentication token expired" });
        } else {
          throw jwtError; // Re-throw unexpected errors
        }
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
      return res.status(401).json({ message: "Authentication failed" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "No authentication token provided" });
  }
};

// Middleware to verify if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

// Optional authentication - doesn't fail if no token provided
// Sets req.user if valid token exists, otherwise continues without user
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]?.trim();

      if (
        token &&
        token !== "null" &&
        token !== "undefined" &&
        token.length >= 20
      ) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user) {
          const tokenExp = decoded.exp * 1000;
          if (Date.now() < tokenExp) {
            req.user = user;
          }
        }
      }
    } catch (error) {
      // Silently ignore auth errors for optional auth
      // User just won't be set
    }
  }

  next();
};

// Generate JWT token with expiry - updated to include user role for easier client-side checks
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
