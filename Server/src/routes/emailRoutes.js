const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const {
  protect,
  admin,
  optionalAuth,
} = require("../middlewares/authMiddleware");

// Public routes (some with optional auth for validation)
router.post("/welcome", emailController.sendWelcomeEmail);
router.post("/password-reset", emailController.sendPasswordResetEmail);
router.post("/password-reset-otp", emailController.sendPasswordResetOtpEmail);
router.post("/contact-form", emailController.sendContactFormConfirmation);
router.post("/verification-otp", emailController.sendVerificationOtpEmail);
router.post("/send-invoice", optionalAuth, emailController.sendInvoiceEmail);

// Protected routes
router.post(
  "/order-confirmation",
  protect,
  emailController.sendOrderConfirmation,
);
router.post(
  "/order-status-update",
  protect,
  emailController.sendOrderStatusUpdate,
);
router.post(
  "/shipping-notification",
  protect,
  emailController.sendShippingNotification,
);
router.post(
  "/return-request",
  protect,
  emailController.sendReturnRequestConfirmation,
);
router.post("/return-status", protect, emailController.sendReturnStatusUpdate);

// Admin routes
router.post(
  "/inventory-alert",
  protect,
  admin,
  emailController.sendLowInventoryAlert,
);

module.exports = router;
