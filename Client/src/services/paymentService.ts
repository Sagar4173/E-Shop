import { PaymentIntent } from "../types";
import api from "./api";

// Currency to use for all payments - should match server configuration
const PAYMENT_CURRENCY = "inr";

// Create a Stripe payment intent with the order total
export const createPaymentIntent = async (
  amount: number
): Promise<PaymentIntent> => {
  try {
    // Handle zero amount orders with a special flow
    if (amount <= 0) {
      // Use the minimum amount required by Stripe (₹1.00 = 100 paise)
      amount = 1;
    }

    const response = await api.post("/payments/create-payment-intent", {
      amount,
      currency: PAYMENT_CURRENCY,
      isZeroAmountOrder: amount === 1 ? true : undefined,
    });
    return response.data;
  } catch (error: any) {
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
    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    const response = await api.post("/payments/guest-payment-intent", {
      amount,
      currency: PAYMENT_CURRENCY,
      guestInfo,
    });
    return response.data;
  } catch (error: any) {
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
  } catch (error: unknown) {
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
  } catch {
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
  }
): Promise<PaymentProcessingResponse> => {
  try {
    const response = await api.post(
      `/payments/process/${orderId}`,
      paymentDetails
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
