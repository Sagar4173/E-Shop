const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");

// Create payment intent - protected route
router.post(
  "/create-payment-intent",
  protect,
  paymentController.createPaymentIntent
);

// Webhook for Stripe events - public route
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

module.exports = router;
