// Configuration exports
const { connectDB } = require("./database");
const { corsOptions } = require("./cors");
const {
  apiLimiter,
  authLimiter,
  applySecurityMiddleware,
} = require("./security");

module.exports = {
  connectDB,
  corsOptions,
  apiLimiter,
  authLimiter,
  applySecurityMiddleware,
};
