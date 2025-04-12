import api from "../api";
import { Order } from "../../types";

// Email service interface
interface EmailResponse {
  success: boolean;
  message: string;
}

/**
 * Send order confirmation email after successful checkout
 * @param orderId The order ID
 * @param order The complete order object
 * @returns Promise with email response
 */
export const sendOrderConfirmationEmail = async (
  orderId: string,
  order: Order
): Promise<EmailResponse> => {
  try {
    // Get recipient email from available sources
    const recipientEmail =
      order.user?.email ||
      order.shippingAddress?.email ||
      order.paymentResult?.email_address;

    if (!orderId || !recipientEmail) {
      console.error("Missing required fields for order confirmation email", {
        hasOrderId: !!orderId,
        hasEmail: !!recipientEmail,
      });
      return {
        success: false,
        message: "Missing required information for order confirmation email",
      };
    }

    const response = await api.post("/emails/order-confirmation", {
      orderId,
      recipient: recipientEmail,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    // Return success false when email fails but don't block the checkout process
    return {
      success: false,
      message:
        "Could not send confirmation email, but your order was processed successfully",
    };
  }
};

/**
 * Send order status update notifications
 * @param orderId The order ID
 * @param status The new order status
 * @param note Optional note about the status change
 * @returns Promise with email response
 */
export const sendOrderStatusUpdateEmail = async (
  orderId: string,
  status: string,
  note?: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/order-status-update", {
      orderId,
      status,
      note,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send order status update email:", error);
    return {
      success: false,
      message: "Could not send status update email",
    };
  }
};

/**
 * Send shipping notification with tracking information
 * @param orderId The order ID
 * @param trackingNumber The shipping tracking number
 * @param note Optional shipping note
 * @returns Promise with email response
 */
export const sendShippingNotification = async (
  orderId: string,
  trackingNumber: string,
  note?: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/shipping-notification", {
      orderId,
      trackingNumber,
      note,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send shipping notification:", error);
    return {
      success: false,
      message: "Could not send shipping notification email",
    };
  }
};

/**
 * Send return request confirmation email
 * @param orderId The order ID
 * @param returnId The return request ID
 * @returns Promise with email response
 */
export const sendReturnRequestConfirmation = async (
  orderId: string,
  returnId: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/return-request", {
      orderId,
      returnId,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send return request confirmation:", error);
    return {
      success: false,
      message: "Could not send return request confirmation email",
    };
  }
};

/**
 * Send return status update email
 * @param orderId The order ID
 * @param returnId The return ID
 * @param status The new return status
 * @param comments Optional comments about the return
 * @returns Promise with email response
 */
export const sendReturnStatusUpdate = async (
  orderId: string,
  returnId: string,
  status: string,
  comments?: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/return-status", {
      orderId,
      returnId,
      status,
      comments,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send return status update:", error);
    return {
      success: false,
      message: "Could not send return status update email",
    };
  }
};

/**
 * Send welcome email after user registration
 * @param email User email
 * @param name User name
 * @returns Promise with email response
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/welcome", {
      email,
      name,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return {
      success: false,
      message: "Could not send welcome email",
    };
  }
};

/**
 * Send password reset link
 * @param email User email
 * @param resetToken Password reset token
 * @returns Promise with email response
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/password-reset", {
      email,
      resetToken,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      message: "Could not send password reset email",
    };
  }
};

/**
 * Send contact form submission confirmation
 * @param email Sender email
 * @param name Sender name
 * @param subject Message subject
 * @returns Promise with email response
 */
export const sendContactFormConfirmation = async (
  email: string,
  name: string,
  subject: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/contact-form", {
      email,
      name,
      subject,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send contact form confirmation:", error);
    return {
      success: false,
      message: "Could not send confirmation email",
    };
  }
};

/**
 * Send notification about low inventory to admins
 * @param productId Product ID
 * @param productName Product name
 * @param currentStock Current stock level
 * @returns Promise with email response
 */
export const sendLowInventoryAlert = async (
  productId: string,
  productName: string,
  currentStock: number
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/inventory-alert", {
      productId,
      productName,
      currentStock,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send inventory alert:", error);
    return {
      success: false,
      message: "Could not send inventory alert email",
    };
  }
};

/**
 * Send OTP verification code via email
 * @param email User email
 * @param otp One-time password code
 * @param purpose Purpose of OTP (password reset, 2FA, etc.)
 * @returns Promise with email response
 */
export const sendOtpEmail = async (
  email: string,
  otp: string,
  purpose: "password-reset" | "2fa" | "verification" = "verification"
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/send-otp", {
      email,
      otp,
      purpose,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to send OTP email for ${purpose}:`, error);
    return {
      success: false,
      message: "Could not send verification code email",
    };
  }
};

/**
 * Send email verification OTP
 * @param email User email
 * @param name User name
 * @param otp Verification code
 * @returns Promise with email response
 */
export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  otp: string
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/emails/verification-otp", {
      email,
      name,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      message: "Could not send verification email",
    };
  }
};

/**
 * Verify OTP code
 * @param email User email
 * @param otp One-time password code
 * @param purpose Purpose of OTP (password reset, 2FA, etc.)
 * @returns Promise with verification result
 */
export const verifyOtp = async (
  email: string,
  otp: string,
  purpose: "password-reset" | "2fa" | "verification" = "verification"
): Promise<{ valid: boolean; message: string }> => {
  try {
    const response = await api.post("/auth/verify-otp", {
      email,
      otp,
      purpose,
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to verify OTP for ${purpose}:`, error);
    return {
      valid: false,
      message: "Invalid or expired verification code",
    };
  }
};

/**
 * Request password reset with OTP
 * @param email User email
 * @returns Promise with request result
 */
export const requestPasswordResetOtp = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to request password reset:", error);
    return {
      success: false,
      message: "Could not process password reset request",
    };
  }
};

/**
 * Reset password with OTP verification
 * @param email User email
 * @param otp One-time password code
 * @param newPassword New password
 * @returns Promise with reset result
 */
export const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to reset password:", error);
    return {
      success: false,
      message: "Could not reset password. Please try again.",
    };
  }
};
