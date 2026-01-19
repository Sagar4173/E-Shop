// CORS configuration
const isProd = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: isProd
    ? "*" // In production with monorepo, CORS isn't needed between client and server
    : process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

module.exports = { corsOptions };
