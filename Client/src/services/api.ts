import axios from "axios";

// Create axios instance with base URL from environment variables or use relative path in production
const isProduction = import.meta.env.MODE === "production";
// In production with monorepo deployment, the API is accessible at /api on the same domain
const API_BASE_URL = isProduction ? "/api" : import.meta.env.VITE_API_URL;

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
  // Increase timeout for API requests - shorter in production to improve UX
  timeout: isProduction ? 60000 : 120000, // 1 minute in production, 2 minutes in development
  // Add these options for better handling of network issues
  validateStatus: status => status < 500, // Only reject on server errors
  retryConfig: {
    retries: 3, // Retry failed requests up to 3 times
    retryDelay: retryCount => retryCount * 1000 // 1s, 2s, 3s
  }
});

// Function to retry failed requests
api.interceptors.response.use(undefined, async (err) => {
  const config = err.config;
  
  // Check if retry config exists and we have retries left
  if (!config || !config.retryConfig || !config.retryConfig.retries) {
    return Promise.reject(err);
  }
  
  // Set retry count (start at 0)
  config.retryCount = config.retryCount ?? 0;
  
  // Check if we've maxed out retries
  if (config.retryCount >= config.retryConfig.retries) {
    return Promise.reject(err);
  }
  
  // Increment retry count
  config.retryCount += 1;
  
  // Calculate delay
  const delay = config.retryConfig.retryDelay(config.retryCount);
  
  // Return promise with retry after delay
  return new Promise(resolve => {
    setTimeout(() => resolve(api(config)), delay);
  });
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
      config.timeout = isProduction ? 90000 : 180000; // 1.5 minutes in production, 3 minutes in development
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

      // In production, automatically redirect to login page
      if (isProduction && window.location.pathname !== "/login") {
        window.location.href = "/login";
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

      // Custom error message for production vs development
      throw new Error(
        isProduction
          ? "Unable to connect to server. Please check your internet connection."
          : "No response received from server"
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(
        isProduction
          ? "Something went wrong. Please try again."
          : "Error setting up the request"
      );
    }
  }
);

export default api;
