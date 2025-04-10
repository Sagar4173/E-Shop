// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}

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
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}

// Order Types
export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  imageUrl: string;
  price: number;
  product: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
