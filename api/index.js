// This file serves as the API entry point for Vercel serverless functions
const app = require("../Server/src/index.js");

// Export the Express app as a serverless function
module.exports = app;
