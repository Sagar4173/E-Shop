import api from "./api";
import { PaymentIntent } from "../types";

// Create a Stripe payment intent with the order total
export const createPaymentIntent = async (
  amount: number,
): Promise<PaymentIntent> => {
  try {
    // Handle zero amount orders with a special flow
    if (amount <= 0) {
      console.warn("Zero or negative amount detected, using minimum amount");
      // Use the minimum amount required by Stripe ($1.00 = 100 cents)
      amount = 1;
    }

    console.log("Initiating payment intent creation for amount:", amount);
    // Only sending amount and currency to avoid payment method configuration conflicts
    const response = await api.post("/payments/create-payment-intent", {
      amount,
      currency: "usd",
      isZeroAmountOrder: amount === 1 ? true : undefined,
    });
    console.log("Payment intent created successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error in createPaymentIntent:", error.message);
    // Add specific error handling for common payment issues
    if (error.message?.includes("timeout")) {
      throw new Error(
        "Payment system is currently slow to respond. Please try again in a few minutes.",
      );
    }
    throw error;
  }
};

// Create a Stripe payment intent for guest checkout
export const createGuestPaymentIntent = async (
  amount: number,
  guestInfo?: { name?: string; email?: string },
): Promise<PaymentIntent> => {
  try {
    // Validate amount before making API call
    if (amount <= 0) {
      console.warn(
        "Cannot create guest payment intent with zero or negative amount",
      );
      throw new Error("Payment amount must be greater than zero");
    }

    console.log("Initiating guest payment intent for amount:", amount);
    // Only sending amount, currency and guestInfo to avoid payment method configuration conflicts
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
        "Payment system is currently slow to respond. Please try again in a few minutes.",
      );
    }
    throw error;
  }
};

// Confirm Stripe payment
export const confirmPayment = async (
  paymentIntentId: string,
  orderId: string,
) => {
  try {
    console.log(`Confirming payment: ${paymentIntentId} for order: ${orderId}`);
    const response = await api.post(`/payments/confirm/${paymentIntentId}`, {
      orderId,
    });
    console.log("Payment confirmation response:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error confirming payment:", error);
    // Add more detailed error for troubleshooting
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (apiError.response) {
        console.error("Error response data:", apiError.response.data);
        console.error("Error response status:", apiError.response.status);
      }
    }
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

// Payment processing response
interface PaymentProcessingResponse {
  success: boolean;
  paymentIntent?: {
    id: string;
    status: string;
  };
}

// Process payment for an order
export const processPayment = async (
  orderId: string,
  paymentDetails: {
    paymentMethodId: string;
    amount: number;
  },
): Promise<PaymentProcessingResponse> => {
  try {
    const response = await api.post(
      `/payments/process/${orderId}`,
      paymentDetails,
    );
    return response.data;
  } catch (error: unknown) {
    // Enhanced error reporting for development
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };

      // Return more descriptive error message
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Payment processing failed";
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// Check payment server health
export const checkPaymentServerHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get("/payments/health", { timeout: 5000 });
    return response.data.status === "ok";
  } catch {
    // Payment server health check failed - return false silently
    return false;
  }
};
