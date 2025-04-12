import api from "./api";
import { ShippingAddress, Order } from "../types";

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

// Interface for return request items
interface ReturnItem {
  orderItemId: string;
  quantity: number;
  reason: string;
  otherReason?: string;
}

// Refund method types
type RefundMethod = "original" | "store_credit";

// Interface for return request data
interface ReturnRequestData {
  returnItems: ReturnItem[];
  refundMethod: RefundMethod;
  additionalNotes?: string;
  isInternational?: boolean;
}

// Create a new order
export const createOrder = async (
  orderData: CreateOrderData
): Promise<Order> => {
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
export const updateOrderStatus = async (
  id: string,
  status: string,
  additionalData?: {
    trackingNumber?: string;
    note?: string;
  }
) => {
  try {
    const response = await api.put(`/orders/${id}/status`, {
      status,
      ...additionalData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Add tracking number to an order
export const addTrackingNumber = async (id: string, trackingNumber: string) => {
  try {
    const response = await api.put(`/orders/${id}/tracking`, {
      trackingNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order status history
export const getOrderStatusHistory = async (id: string) => {
  try {
    const response = await api.get(`/orders/${id}/status-history`);
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

// Create a return request for an order
export const createReturnRequest = async (
  orderId: string,
  returnData: ReturnRequestData
) => {
  try {
    const response = await api.post(`/orders/${orderId}/return`, returnData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload photos for a return request
export const uploadReturnPhotos = async (
  orderId: string,
  returnItemId: string,
  photoFiles: File[]
) => {
  try {
    const formData = new FormData();

    // Add each photo to the form data
    photoFiles.forEach((file) => {
      formData.append("photos", file);
    });

    // Use api with different content type (multipart/form-data)
    const response = await api.post(
      `/uploads/returns/${orderId}/${returnItemId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Update a return request status
export const updateReturnStatus = async (
  orderId: string,
  returnId: string,
  status: string,
  comments?: string
) => {
  try {
    const response = await api.put(`/orders/${orderId}/return/${returnId}`, {
      status,
      comments,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: Get all return requests
export const getAllReturns = async () => {
  try {
    const response = await api.get("/orders/returns");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get return requests for an order
export const getOrderReturns = async (id: string) => {
  try {
    const response = await api.get(`/orders/${id}/returns`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
