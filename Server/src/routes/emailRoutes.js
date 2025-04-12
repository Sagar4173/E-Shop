const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/welcome", emailController.sendWelcomeEmail);
router.post("/password-reset", emailController.sendPasswordResetEmail);
router.post("/contact-form", emailController.sendContactFormConfirmation);
router.post("/verification-otp", emailController.sendVerificationOtpEmail);

// Protected routes
router.post(
  "/order-confirmation",
  protect,
  emailController.sendOrderConfirmation
);
router.post(
  "/order-status-update",
  protect,
  emailController.sendOrderStatusUpdate
);
router.post(
  "/shipping-notification",
  protect,
  emailController.sendShippingNotification
);
router.post(
  "/return-request",
  protect,
  emailController.sendReturnRequestConfirmation
);
router.post("/return-status", protect, emailController.sendReturnStatusUpdate);

// Admin routes
router.post(
  "/inventory-alert",
  protect,
  admin,
  emailController.sendLowInventoryAlert
);

module.exports = router;
