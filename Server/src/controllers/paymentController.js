const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

// Variable to hold the Stripe instance
let stripe;

// Check if the Stripe secret key is available and initialize
if (!stripeSecretKey) {
  console.error("Error: Stripe secret key is missing. Check your .env file.");
  // We'll handle the missing key in the route handlers
} else {
  try {
    stripe = require("stripe")(stripeSecretKey);
    // Verify Stripe is working by checking the API version
    stripe.charges
      .list({ limit: 1 })
      .then(() => {
        // Stripe API connection verified
      })
      .catch((error) => {
        console.error("Stripe API verification failed:", error.message);
      });
  } catch (error) {
    console.error("Failed to initialize Stripe:", error.message);
  }
}

// Define minimum amounts for different currencies in cents
// Updated with higher minimums to meet Stripe's requirements
const MINIMUM_CHARGE_AMOUNTS = {
  usd: 100, // $1.00 (increased from $0.50)
  eur: 100, // €1.00 (increased from €0.50)
  gbp: 100, // £1.00 (increased from £0.30)
  inr: 100, // ₹1.00 (increased from ₹0.50)
  // Add more currencies as needed
  default: 100, // Default minimum (increased from 50)
};

// Helper to get minimum amount for a currency
const getMinimumAmount = (currency) => {
  return MINIMUM_CHARGE_AMOUNTS[currency] || MINIMUM_CHARGE_AMOUNTS.default;
};

// @desc    Get Stripe publishable key
// @route   GET /api/payments/config
// @access  Public
exports.getConfig = async (req, res) => {
  res.json({
    publishableKey: stripePublishableKey || "pk_test_placeholder",
    isTestMode: !stripePublishableKey || process.env.NODE_ENV !== "production",
  });
};

// @desc    Create payment intent for Stripe (for authenticated users)
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({
      message: "Payment service is not available. Stripe API key is missing.",
    });
  }
  try {
    // Only extract the specific properties we need to avoid conflicts
    // Default currency to INR to match frontend display
    const { amount, currency = "inr", isZeroAmountOrder = false } = req.body;

    // We don't extract payment_method_types to avoid conflicts with automatic_payment_methods

    // Convert amount to cents and ensure it's an integer
    let amountInCents = Math.round(amount * 100);
    const minimumAmount = getMinimumAmount(currency);

    // Check if amount meets minimum requirement
    if (amountInCents < minimumAmount) {
      amountInCents = minimumAmount;
    }

    // Check if we're in test mode
    const isTestMode = process.env.NODE_ENV !== "production";

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        userId: req.user._id.toString(),
        isZeroAmountOrder: isZeroAmountOrder ? "true" : "false",
        isTestMode: isTestMode ? "true" : "false",
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // To ensure the payment shows up in the dashboard, we need to confirm it will be captured
      capture_method: "automatic",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create payment intent for guest checkout
// @route   POST /api/payments/guest-payment-intent
// @access  Public
exports.createGuestPaymentIntent = async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({
      message: "Payment service is not available. Stripe API key is missing.",
    });
  }
  try {
    // Only extract the specific properties we need and avoid conflicts
    // Default currency to INR to match frontend display
    const {
      amount,
      currency = "inr",
      guestInfo = {},
      isZeroAmountOrder = false,
    } = req.body;

    // We don't extract payment_method_types to avoid conflicts with automatic_payment_methods
    // Add basic validation
    if (!amount || amount <= 0) {
      // If tagged as a zero amount order, allow it but log a warning
      if (isZeroAmountOrder) {
        console.warn(
          "Zero amount order detected, proceeding with minimum amount"
        );
      } else {
        return res.status(400).json({ message: "Valid amount is required" });
      }
    }

    // Convert amount to cents and ensure it's an integer
    let amountInCents = Math.round(amount * 100);
    const minimumAmount = getMinimumAmount(currency);

    // Check if amount meets minimum requirement
    if (amountInCents < minimumAmount) {
      amountInCents = minimumAmount;
    }

    // Check if we're in test mode
    const isTestMode = process.env.NODE_ENV !== "production";

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        isGuest: "true",
        guestEmail: guestInfo.email || "guest@example.com",
        guestName: guestInfo.name || "Guest",
        isTestMode: isTestMode ? "true" : "false",
        isZeroAmountOrder: isZeroAmountOrder ? "true" : "false",
      },
      receipt_email: guestInfo.email || "guest@example.com",
      automatic_payment_methods: {
        enabled: true,
      },
      // To ensure the payment shows up in the dashboard, we need to confirm it will be captured
      capture_method: "automatic",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error("Guest payment intent creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({
      message: "Payment service is not available. Stripe API key is missing.",
    });
  }

  const signature = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature and extract the event
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        // Try to find the order associated with this payment intent
        const Order = require("../models/Order");
        let order;

        try {
          // First check if there's an order with this payment ID
          // Look for both the payment ID and any related payment IDs (like PM_xxx vs PI_xxx)
          order = await Order.findOne({
            $or: [
              { "paymentResult.id": paymentIntent.id },
              {
                "paymentResult.id": {
                  $regex: paymentIntent.id.split("_")[1],
                  $options: "i",
                },
              },
            ],
          });

          // If no order found by payment ID, check metadata for an order ID
          if (
            !order &&
            paymentIntent.metadata &&
            paymentIntent.metadata.orderId
          ) {
            order = await Order.findById(paymentIntent.metadata.orderId);
          }

          // If we found an order, update its payment status
          if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address:
                paymentIntent.receipt_email ||
                (paymentIntent.metadata
                  ? paymentIntent.metadata.guestEmail
                  : null),
            };

            // If order status is still pending, update it to processing
            if (order.status === "pending") {
              order.status = "processing";
              order.statusHistory.push({
                status: "processing",
                date: new Date(),
                note: "Payment confirmed via Stripe",
              });
            }

            await order.save();
          }
        } catch (orderError) {
          console.error(
            `Error processing order update for payment: ${orderError.message}`
          );
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        // Could implement notification system here for failed payments
        break;

      case "payment_intent.created":
        // Payment intent created
        break;

      case "payment_intent.processing":
        // Payment is processing
        break;

      case "payment_method.attached":
        // Payment method attached
        break;

      default:
      // Unhandled event type
    }
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    // Still return 200 to acknowledge receipt, we don't want Stripe to retry
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true, eventType: event.type });
};

// @desc    Health check for payment service
// @route   GET /api/payments/health
// @access  Public
exports.healthCheck = async (req, res) => {
  // Check if Stripe is properly initialized
  const isStripeAvailable = !!stripe;

  res.json({
    status: isStripeAvailable ? "ok" : "error",
    message: isStripeAvailable
      ? "Payment service is available"
      : "Payment service is not properly configured",
    timestamp: new Date().toISOString(),
    testMode: process.env.NODE_ENV !== "production",
  });
};

// @desc    Validate a payment card for test mode
// @route   POST /api/payments/validate-card
// @access  Public
exports.validateCard = async (req, res) => {
  try {
    const { cardNumber } = req.body;

    if (!cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Card number is required",
      });
    }

    // Use our test card validator
    const { isTestCard } = require("../utils/testCardValidator");
    const cardInfo = isTestCard(cardNumber);

    res.json({
      success: true,
      ...cardInfo,
      message: cardInfo.description,
    });
  } catch (error) {
    console.error("Error validating card:", error.message);
    res.status(500).json({
      success: false,
      message: "Error validating card",
    });
  }
};

// @desc    Confirm a payment intent
// @route   POST /api/payments/confirm/:paymentIntentId
// @access  Public
exports.confirmPaymentIntent = async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(500).json({
      message: "Payment service is not available. Stripe API key is missing.",
    });
  }

  try {
    const { paymentIntentId } = req.params;
    const { orderId } = req.body;

    // Enhance test mode detection - check for payment method ID too
    const isPaymentMethod =
      paymentIntentId && paymentIntentId.startsWith("pm_");
    const isTestMode =
      process.env.NODE_ENV !== "production" ||
      paymentIntentId.includes("_test_");

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // First verify using our payment validator
    const { verifyPaymentIntent } = require("../utils/paymentValidator");
    const verification = await verifyPaymentIntent(paymentIntentId);

    // For test mode or verified payments, proceed with confirmation
    if (verification.isValid) {
      // If we're in test mode or the verification was successful, we can return success
      res.json({
        success: true,
        status: verification.status,
        paymentIntentId: verification.paymentIntent?.id || paymentIntentId,
        isTestMode,
      });
    } else {
      // If verification failed, try to retrieve the payment intent directly
      try {
        // Retrieve the payment intent to check its status
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
          return res.status(404).json({ message: "Payment intent not found" });
        }

        // Check if the payment intent needs to be confirmed or is already in a final state
        if (paymentIntent.status === "requires_confirmation") {
          // Confirm the payment intent if it requires confirmation
          const confirmedIntent =
            await stripe.paymentIntents.confirm(paymentIntentId);

          res.json({
            success: true,
            status: confirmedIntent.status,
            paymentIntentId: confirmedIntent.id,
          });
        } else if (
          ["succeeded", "processing", "requires_capture"].includes(
            paymentIntent.status
          )
        ) {
          // If it's already in a successful or processing state
          // For payment intents that require capture (for auth only)
          if (paymentIntent.status === "requires_capture") {
            // Handle requires_capture status if needed
            res.json({
              success: true,
              status: paymentIntent.status,
              paymentIntentId: paymentIntent.id,
              message: "Payment authorized and requires capture",
            });
          } else {
            res.json({
              success: true,
              status: paymentIntent.status,
              paymentIntentId: paymentIntent.id,
            });
          }
        } else {
          // If the payment intent is in some other state (failed, canceled, etc.)
          res.status(400).json({
            success: false,
            message: `Payment is in state: ${paymentIntent.status}`,
            status: paymentIntent.status,
          });
        }
      } catch (stripeError) {
        // If we can't retrieve the payment intent and verification failed
        console.error("Payment confirmation error:", verification.message); // Check if this is a payment method ID and we're in test mode
        const isPaymentMethod =
          paymentIntentId && paymentIntentId.startsWith("pm_");
        const isTestMode =
          process.env.NODE_ENV !== "production" ||
          paymentIntentId.includes("_test_");

        if (isTestMode && isPaymentMethod) {
          // In test mode with payment methods, always allow the payment despite errors
          // Create a consistent test payment ID format for easier tracking/debugging
          const testPaymentId = `test_pi_from_${paymentIntentId.substring(
            0,
            8
          )}_${Date.now().toString().substring(9)}`;

          res.json({
            success: true,
            status: "succeeded_test",
            paymentIntentId: testPaymentId,
            isTestMode: true,
            message: "Test mode: Payment method accepted",
            // Include orderId for debugging if available
            orderId: orderId || null,
          });
        } else {
          res.status(400).json({
            success: false,
            message: verification.message,
            status: verification.status,
          });
        }
      }
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Debug verify payment intent
// @route   POST /api/payments/verify-payment
// @access  Public (only available in non-production)
exports.verifyPaymentDebug = async (req, res) => {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "Debug endpoints not available in production",
    });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
      });
    }

    const { verifyPaymentIntent } = require("../utils/paymentValidator");
    const result = await verifyPaymentIntent(paymentId);

    res.json({
      verification: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Payment verification debug error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Debug payment issues in test mode
// @route   GET /api/payments/debug-test-mode/:paymentId?
// @access  Public (only available in non-production)
exports.debugTestMode = async (req, res) => {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      message: "Debug endpoints not available in production",
    });
  }

  try {
    const paymentId = req.params.paymentId;
    const isPaymentMethod = paymentId && paymentId.startsWith("pm_");
    const isPaymentIntent = paymentId && paymentId.startsWith("pi_");

    // General debug info
    const debugInfo = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      stripeInitialized: !!stripe,
      isTestMode: true,
      paymentId,
      paymentIdType: isPaymentMethod
        ? "payment_method"
        : isPaymentIntent
          ? "payment_intent"
          : "unknown",
    };

    // If a specific payment ID was provided, provide more info
    if (paymentId) {
      if (stripe) {
        try {
          if (isPaymentMethod) {
            // Get payment method details
            const paymentMethod =
              await stripe.paymentMethods.retrieve(paymentId);
            debugInfo.paymentMethod = {
              id: paymentMethod.id,
              type: paymentMethod.type,
              created: new Date(paymentMethod.created * 1000).toISOString(),
              card: paymentMethod.card
                ? {
                    brand: paymentMethod.card.brand,
                    last4: paymentMethod.card.last4,
                    exp_month: paymentMethod.card.exp_month,
                    exp_year: paymentMethod.card.exp_year,
                  }
                : null,
            };

            // Try to find associated payment intents
            const paymentIntents = await stripe.paymentIntents
              .list({
                limit: 10,
                payment_method: paymentId,
              })
              .catch(() => ({ data: [] }));

            debugInfo.associatedPaymentIntents = paymentIntents.data.map(
              (pi) => ({
                id: pi.id,
                status: pi.status,
                amount: pi.amount,
                currency: pi.currency,
                created: new Date(pi.created * 1000).toISOString(),
              })
            );
          } else if (isPaymentIntent) {
            // Get payment intent details
            const paymentIntent =
              await stripe.paymentIntents.retrieve(paymentId);
            debugInfo.paymentIntent = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              payment_method: paymentIntent.payment_method,
              created: new Date(paymentIntent.created * 1000).toISOString(),
              metadata: paymentIntent.metadata || {},
            };
          }
        } catch (stripeError) {
          debugInfo.stripeError = {
            message: stripeError.message,
            type: stripeError.type,
            statusCode: stripeError.statusCode,
          };
        }
      }

      // Check our payment validator
      try {
        const { verifyPaymentIntent } = require("../utils/paymentValidator");
        const verification = await verifyPaymentIntent(paymentId);
        debugInfo.verification = verification;
      } catch (verificationError) {
        debugInfo.verificationError = {
          message: verificationError.message,
          stack:
            process.env.NODE_ENV === "development"
              ? verificationError.stack
              : null,
        };
      }
    }

    res.json(debugInfo);
  } catch (error) {
    console.error("Payment debug error:", error);
    res.status(500).json({ message: error.message });
  }
};
