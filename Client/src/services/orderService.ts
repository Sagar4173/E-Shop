import api from "./api";
import { ShippingAddress } from "../types";

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
}

// Create a new order
export const createOrder = async (orderData: CreateOrderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async () => {
  try {
    const response = await api.get("/orders/myorders");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id: string) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order to paid status
export const updateOrderToPaid = async (id: string, paymentResult: any) => {
  try {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Get all orders
export const getAllOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update order status
export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Mark order as delivered
export const updateOrderToDelivered = async (id: string) => {
  try {
    const response = await api.put(`/orders/${id}/deliver`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
