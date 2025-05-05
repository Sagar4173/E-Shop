// This file serves as the API entry point for Vercel serverless functions
const app = require('../Server/src/index.js');

// Export the handler function in the format Vercel expects
module.exports = (req, res) => {
  // Set environment variable for the server to know it's running in production
  process.env.NODE_ENV = 'production';
  
  // For debugging - log the incoming request
  console.log(`API Request: ${req.method} ${req.url}`);
  
  // Handle the request using our Express app
  return app(req, res);
};
