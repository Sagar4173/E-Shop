// Debug logging to help identify the issue
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  STRIPE_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
  STRIPE_KEY_LENGTH: process.env.STRIPE_SECRET_KEY
    ? process.env.STRIPE_SECRET_KEY.length
    : 0,
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
  console.log("Initializing Stripe with the secret key");
  stripe = require("stripe")(stripeSecretKey);
}

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

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
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
    console.error(error);
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

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
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
    console.error(error);
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
