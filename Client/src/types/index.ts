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
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string; // For guest checkouts
}

// Status history entry for order tracking
export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note?: string;
  user?: string; // ID or name of the user who made the status change
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
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  status: string;
  statusHistory?: StatusHistoryEntry[];
  trackingNumber?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  hasReturn?: boolean;
  returns?: Array<any>;
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
