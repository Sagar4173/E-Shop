// Application-wide constants
// Centralized place for all constant values

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  COD: "cod",
} as const;

export type PaymentMethodType =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Product categories
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Kitchen",
  "Furniture",
  "Appliances",
  "Sports",
  "Books",
  "Toys",
  "Other",
] as const;

export type ProductCategoryType = (typeof PRODUCT_CATEGORIES)[number];

// Sort options
export const SORT_OPTIONS = {
  NEWEST: "newest",
  PRICE_LOW: "price_asc",
  PRICE_HIGH: "price_desc",
  RATING: "rating",
  NAME: "name",
} as const;

// Shipping methods
export const SHIPPING_METHODS = {
  STANDARD: {
    id: "standard",
    name: "Standard Shipping",
    price: 5.99,
    days: "5-7",
  },
  EXPRESS: {
    id: "express",
    name: "Express Shipping",
    price: 12.99,
    days: "2-3",
  },
  OVERNIGHT: {
    id: "overnight",
    name: "Overnight Shipping",
    price: 24.99,
    days: "1",
  },
} as const;

// Tax rate (percentage)
export const TAX_RATE = 0.08; // 8%

// Minimum order amount for free shipping
export const FREE_SHIPPING_THRESHOLD = 100;

// Cart constraints
export const CART_LIMITS = {
  MAX_QUANTITY_PER_ITEM: 10,
  MAX_ITEMS: 50,
} as const;

// Review constraints
export const REVIEW_LIMITS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 500,
} as const;

// Image upload constraints
export const IMAGE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_FILES: 5,
} as const;
