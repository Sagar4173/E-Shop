// API configuration constants
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.MODE === "production"
      ? "/api"
      : import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  TIMEOUT: import.meta.env.MODE === "production" ? 60000 : 120000,
  PAYMENT_TIMEOUT: import.meta.env.MODE === "production" ? 90000 : 180000,
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || "",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48],
} as const;
