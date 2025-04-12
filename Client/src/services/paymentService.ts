import api from "./api";
import { PaymentIntent } from "../types";

// Create a Stripe payment intent with the order total
export const createPaymentIntent = async (
  amount: number
): Promise<PaymentIntent> => {
  try {
    console.log("Initiating payment intent creation for amount:", amount);
    const response = await api.post("/payments/create-payment-intent", {
      amount,
      currency: "usd",
    });
    console.log("Payment intent created successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error in createPaymentIntent:", error.message);
    // Add specific error handling for common payment issues
    if (error.message?.includes("timeout")) {
      throw new Error(
        "Payment system is currently slow to respond. Please try again in a few minutes."
      );
    }
    throw error;
  }
};

// Create a Stripe payment intent for guest checkout
export const createGuestPaymentIntent = async (
  amount: number,
  guestInfo?: { name?: string; email?: string }
): Promise<PaymentIntent> => {
  try {
    console.log("Initiating guest payment intent for amount:", amount);
    const response = await api.post("/payments/guest-payment-intent", {
      amount,
      currency: "usd",
      guestInfo,
    });
    console.log("Guest payment intent created successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error in createGuestPaymentIntent:", error.message);
    if (error.message?.includes("timeout")) {
      throw new Error(
        "Payment system is currently slow to respond. Please try again in a few minutes."
      );
    }
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
    return {
      publishableKey: response.data.publishableKey,
      isTestMode: response.data.isTestMode,
    };
  } catch (error) {
    console.warn("Payment system running in test mode due to error:", error);
    return {
      publishableKey: null,
      isTestMode: true,
    };
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

// Check payment server health
export const checkPaymentServerHealth = async () => {
  try {
    const response = await api.get("/payments/health", { timeout: 5000 });
    return response.data.status === "ok";
  } catch (error) {
    console.warn("Payment server health check failed:", error);
    return false;
  }
};
