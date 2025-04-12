import axios from "axios";

// Create axios instance with base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
