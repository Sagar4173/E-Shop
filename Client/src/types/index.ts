// Product Types
export interface Product {
  _id: string;
  id?: string; // For compatibility with different APIs
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews?: Array<{
    _id: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
  }>;
  featured: boolean;
  originalPrice?: number; // For discount display
  user?: string; // Product owner/creator (admin)
  createdAt?: string;
  updatedAt?: string;
}

// Review Types
export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
  phone?: string; // Alias for phoneNumber (for consistency)
  phoneNumber?: string; // Server uses this field name
  isGuest?: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  addresses?: ShippingAddress[];
}

export interface UserProfile extends User {
  shippingAddresses?: ShippingAddress[];
}

// Cart Types
export interface CartItem {
  id: string;
  _id?: string; // For compatibility with different APIs
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock?: number;
}

// Order Types
export interface ShippingAddress {
  fullName?: string;
  street: string; // Required by server Order model
  address?: string; // Optional alias for street, for backward compatibility
  address2?: string; // Optional secondary address line
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string; // Optional for guest checkout
  email?: string; // For guest checkouts
}

// Status history entry for order tracking
export interface StatusHistoryEntry {
  status: string;
  date: string; // Changed from timestamp to date to match backend
  timestamp?: string; // Legacy field for backward compatibility
  note?: string;
  notes?: string; // Legacy alias for note
  updatedBy?: {
    // Changed from user to updatedBy with more detailed structure
    _id: string;
    name: string;
    email?: string;
  };
  user?: {
    // Legacy field for backward compatibility
    _id?: string;
    name?: string;
    email?: string;
  };
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: Array<{
    _id?: string;
    product: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    color?: string;
    size?: string;
    sku?: string;
  }>;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    email_address: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  discountAmount?: number;
  isPaid: boolean;
  paidAt?: string;
  status: string;
  statusHistory?: StatusHistoryEntry[];
  trackingNumber?: string;
  shippingMethod?: string;
  shippedAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  hasReturn?: boolean;
  returns?: Array<any>;
  customerNote?: string;
  adminNotes?: string;
  isRefunded?: boolean;
}

// Payment Types
export interface PaymentIntent {
  clientSecret: string;
  id: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pages: number;
  totalItems: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Form States
export interface FormState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Filter Types
export interface ProductFilters {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: "price" | "rating" | "newest";
  sortDirection?: "asc" | "desc";
}
