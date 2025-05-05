// This file handles all upload-related requests
const app = require("../../Server/src/index.js");

// Export the handler function in the format Vercel expects
module.exports = (req, res) => {
  // Set environment variable for the server to know it's running in production
  process.env.NODE_ENV = "production";

  // For debugging - log the incoming uploads request
  console.log(`Uploads Request: ${req.method} ${req.url}`);

  // Handle the request using our Express app
  return app(req, res);
};
