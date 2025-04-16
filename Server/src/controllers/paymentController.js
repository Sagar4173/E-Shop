// Simple initialization log without exposing sensitive information
console.log("Payment Controller Initialization");
console.log("Environment check:", {
  NODE_ENV: process.env.NODE_ENV,
  STRIPE_KEYS_CONFIGURED:
    !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PUBLISHABLE_KEY,
});

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
    console.log("Initializing Stripe");
    stripe = require("stripe")(stripeSecretKey);
    console.log("Stripe initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Stripe");
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
    const { amount, currency = "usd", paymentMethodType = "card" } = req.body;

    // Convert amount to cents and ensure it's an integer
    let amountInCents = Math.round(amount * 100);
    const minimumAmount = getMinimumAmount(currency);

    // Check if amount meets minimum requirement
    if (amountInCents < minimumAmount) {
      console.log(
        `Amount ${amountInCents} is below minimum ${minimumAmount} for ${currency}, using minimum`
      );
      amountInCents = minimumAmount;
    }

    console.log(
      `Creating payment intent for ${amountInCents} cents (${currency})`
    );

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      payment_method_types: [paymentMethodType],
      metadata: {
        userId: req.user._id.toString(),
      },
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
    const {
      amount,
      currency = "usd",
      paymentMethodType = "card",
      guestInfo = {},
    } = req.body;

    // Add basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Convert amount to cents and ensure it's an integer
    let amountInCents = Math.round(amount * 100);
    const minimumAmount = getMinimumAmount(currency);

    // Check if amount meets minimum requirement
    if (amountInCents < minimumAmount) {
      console.log(
        `Amount ${amountInCents} is below minimum ${minimumAmount} for ${currency}, using minimum`
      );
      amountInCents = minimumAmount;
    }

    console.log(
      `Creating guest payment intent for ${amountInCents} cents (${currency})`
    );

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      payment_method_types: [paymentMethodType],
      metadata: {
        isGuest: true,
        guestEmail: guestInfo.email || "guest@example.com",
        guestName: guestInfo.name || "Guest",
      },
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

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Update your database here
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log(
        `Payment failed: ${failedPayment.last_payment_error?.message}`
      );
      // Notify the customer that payment failed
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};
