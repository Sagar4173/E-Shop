import axios from "axios";

// Create axios instance with base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Validate a JWT token's basic structure (not cryptographic validation)
 * @param token The token to validate
 * @returns boolean indicating if token has valid structure
 */
const isTokenStructureValid = (token: string | null): boolean => {
  if (!token) return false;
  if (token === "null" || token === "undefined") return false;
  if (token.length < 20) return false; // JWT tokens are typically much longer

  // Check basic JWT structure (three parts separated by dots)
  const parts = token.split(".");
  return parts.length === 3;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Increase timeout for API requests
  timeout: 120000, // 2 minutes
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for the token
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // Only add the Authorization header if token passes basic validation
    if (isTokenStructureValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      // If token exists but is invalid, log it and remove from storage
      console.warn("Invalid token detected, cleaning up...");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      // No Authorization header will be sent, causing a proper auth error
    }

    // Set extended timeout specifically for payment-related endpoints
    if (config.url?.includes("/payments/")) {
      config.timeout = 180000; // 3 minutes for payment endpoints
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error is due to authentication issues
    if (error.response?.status === 401) {
      // Clear invalid tokens on authentication failures
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Optionally redirect to login page if authentication fails
      if (window.location.pathname !== "/login") {
        // Uncomment the line below to enable automatic redirect to login
        // window.location.href = '/login';
      }
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data.message || "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      // The request was made but no response was received
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "The request took too long to complete. Please try again later."
        );
      }
      throw new Error("No response received from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up the request");
    }
  }
);

export default api;
