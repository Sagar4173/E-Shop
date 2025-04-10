import api from "./api";
import { PaymentIntent } from "../types";

// Create a Stripe payment intent with the order total
export const createPaymentIntent = async (
  amount: number
): Promise<PaymentIntent> => {
  try {
    const response = await api.post("/payments/create-payment-intent", {
      amount,
      currency: "usd",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Confirm Stripe payment
export const confirmPayment = async (
  paymentIntentId: string,
  orderId: string
) => {
  try {
    const response = await api.post(`/payments/confirm/${paymentIntentId}`, {
      orderId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Stripe publishable key from backend
export const getStripePublicKey = async () => {
  try {
    const response = await api.get("/payments/config");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Process payment for an order
export const processPayment = async (
  orderId: string,
  paymentDetails: {
    paymentMethodId: string;
    amount: number;
  }
) => {
  try {
    const response = await api.post(
      `/payments/process/${orderId}`,
      paymentDetails
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
