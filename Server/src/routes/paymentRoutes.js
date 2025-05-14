const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

// Get Stripe publishable key - public route
router.get("/config", paymentController.getConfig);

// Health check for payment system - public route
router.get("/health", paymentController.healthCheck);

// Create payment intent - protected route
router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);

// Guest checkout payment intent - public route
router.post(
  "/guest-payment-intent",
  paymentController.createGuestPaymentIntent
);

// Webhook for Stripe events - public route
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;
