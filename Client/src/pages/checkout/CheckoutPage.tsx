import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { CartContext } from "../../context/CartContext";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import OrderSummary from "../../components/checkout/OrderSummary";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  createPaymentIntent,
  createGuestPaymentIntent,
  getStripePublicKey,
  checkPaymentServerHealth,
} from "../../services/paymentService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext) || {
    cartItems: [],
    getCartTotal: () => 0,
    clearCart: () => {},
  };

  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(true);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [paymentServerAvailable, setPaymentServerAvailable] = useState(true);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Check payment server health
  useEffect(() => {
    const checkServerHealth = async () => {
      const isAvailable = await checkPaymentServerHealth();
      setPaymentServerAvailable(isAvailable);

      if (!isAvailable) {
        console.log("Payment server is not available, using test mode");
        setIsTestMode(true);
      }
    };

    checkServerHealth();
  }, []);

  // Fetch Stripe publishable key from backend
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const { publishableKey, isTestMode } = await getStripePublicKey();
        console.log("Stripe config received:", {
          publishableKey: !!publishableKey,
          isTestMode,
        });
        setIsTestMode(isTestMode);

        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      } catch (err) {
        console.error("Error fetching Stripe publishable key:", err);
        // Set test mode to true as a fallback
        setIsTestMode(true);
      }
    };

    // Only fetch the key if payment server is available
    if (paymentServerAvailable) {
      fetchStripeKey();
    }
  }, [paymentServerAvailable]);

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (cartItems.length === 0) {
        navigate("/products");
        return;
      }

      // Skip trying to create a payment intent if server is already known to be down
      if (!paymentServerAvailable && retryAttempt === 0) {
        console.log("Payment server is unavailable, using test mode");
        setIsTestMode(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const total = getCartTotal();
        console.log("Starting checkout with total:", total);
        let paymentData;

        try {
          // First try the authenticated endpoint
          console.log("Attempting authenticated checkout flow");
          paymentData = await createPaymentIntent(total);
          setIsGuestCheckout(false);
          setClientSecret(paymentData.clientSecret);
          setError(null);
          console.log("Authenticated checkout successful");

          // Reset server availability state since request succeeded
          setPaymentServerAvailable(true);
        } catch (authError: any) {
          console.log(
            "Authentication error, trying guest checkout:",
            authError
          );

          // If it's a timeout error, might be a server issue
          if (
            authError.message?.includes("timeout") ||
            authError.message?.includes("too long")
          ) {
            console.warn(
              "Payment server might be down or slow, attempt " +
                (retryAttempt + 1)
            );

            // If this is the first retry attempt, try once more
            if (retryAttempt < 1) {
              setRetryAttempt(retryAttempt + 1);
              setError("Payment system is responding slowly. Retrying...");
              setLoading(false);
              return; // Exit early to allow the effect to run again
            } else {
              // If we already retried, mark server as unavailable and use test mode
              setPaymentServerAvailable(false);
              setIsTestMode(true);
              setError(
                "Payment system is temporarily unavailable. Using test mode."
              );
              setLoading(false);
              return;
            }
          }

          // If authentication fails, fall back to guest checkout
          if (
            authError.message?.includes("Not authorized") ||
            authError.message?.includes("token")
          ) {
            console.log("Switching to guest checkout flow");
            setIsGuestCheckout(true);

            // Clear any previous client secret when switching to guest mode
            setClientSecret("");

            // Don't create the intent yet until we have guest info - we'll do that in handleGuestInfoSubmit
            setError(null);
          } else {
            // If it's some other error, show the error message
            throw authError;
          }
        }
      } catch (err: any) {
        console.error("Error creating payment intent:", err);

        // Handle server errors specially
        if (err.message?.includes("500") || err.message?.includes("server")) {
          setError(
            "The payment server encountered an error. You can continue in test mode or try again later."
          );
          setIsTestMode(true);
        } else {
          setError(
            "Failed to initialize payment system. Please try again or contact support."
          );
        }
      } finally {
        setLoading(false);
        console.log("Checkout state after initialization:", {
          isGuestCheckout,
          hasClientSecret: !!clientSecret,
          isTestMode,
        });
      }
    };

    initializePayment();
  }, [cartItems, getCartTotal, navigate, paymentServerAvailable, retryAttempt]);

  // Log state changes to help with debugging
  useEffect(() => {
    console.log("Checkout mode changed:", {
      isGuestCheckout,
      hasClientSecret: !!clientSecret,
      isTestMode,
      isLoading: loading,
    });
  }, [isGuestCheckout, clientSecret, isTestMode, loading]);

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#3b82f6", // blue-500
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Handle guest info submission and create guest payment intent
  const handleGuestInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestInfo.name || !guestInfo.email) {
      setError("Please provide your name and email");
      return;
    }

    if (!paymentServerAvailable) {
      console.log(
        "Payment server is unavailable for guest checkout, using test mode"
      );
      setIsTestMode(true);
      return;
    }

    try {
      setLoading(true);
      const total = getCartTotal();
      console.log("Creating guest payment intent with info:", {
        name: guestInfo.name,
        email: guestInfo.email,
        total,
      });

      // Create guest payment intent with the user info
      const paymentData = await createGuestPaymentIntent(total, guestInfo);
      console.log("Guest payment intent created successfully");

      setClientSecret(paymentData.clientSecret);
      setError(null);

      // Reset server availability state since request succeeded
      setPaymentServerAvailable(true);
    } catch (err: any) {
      console.error("Error creating guest payment intent:", err);

      if (
        err.message?.includes("timeout") ||
        err.message?.includes("too long")
      ) {
        setPaymentServerAvailable(false);
        setIsTestMode(true);
        setError("Payment system is temporarily unavailable. Using test mode.");
      } else {
        setError(
          "Failed to create payment. Please try again or contact support."
        );
        setIsTestMode(true); // Fallback to test mode
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle test mode order completion
  const handleTestModeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Completing order in test mode");
    // In test mode, just redirect to order confirmation
    navigate("/order-confirmation");
    // Clear the cart after successful order
    clearCart();
  };

  // Handle guest info input changes
  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Retry payment connection
  const handleRetryConnection = () => {
    setRetryAttempt(0);
    setPaymentServerAvailable(true);
    setError(null);
    setIsTestMode(false);
    // This will trigger the useEffect to retry the payment initialization
  };

  // Determine which checkout form to show
  const renderCheckoutForm = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // If in guest checkout mode and no client secret yet, show the guest info form regardless of test mode
    if (isGuestCheckout && !clientSecret) {
      console.log("Rendering guest checkout form");
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Guest Checkout
          </h2>
          <p className="text-gray-600 mb-4">
            Please provide your information to continue as a guest.
          </p>
          <form onSubmit={handleGuestInfoSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={guestInfo.name}
                  onChange={handleGuestInfoChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={guestInfo.email}
                  onChange={handleGuestInfoChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      );
    }

    // If we have a client secret and Stripe is initialized, show the Stripe Elements form
    // regardless of test mode - this fixes the issue where the client secret exists but test mode is true
    if (clientSecret && stripePromise) {
      console.log("Rendering Stripe Elements form with client secret");
      return (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            isGuestCheckout={isGuestCheckout}
            guestInfo={guestInfo}
          />
        </Elements>
      );
    }

    // Default to test mode form if no client secret is available
    console.log("Rendering test mode form");
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isTestMode ? "Test Mode Checkout" : "Checkout"}
        </h2>
        <p className="text-gray-600 mb-4">
          Please fill out your shipping and payment information to complete your
          order.
        </p>
        <form onSubmit={handleTestModeSubmit} className="space-y-6">
          {/* Basic Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="test-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="test-name"
                name="test-name"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="test-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="test-email"
                name="test-email"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
            >
              Complete Order
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">
          Complete your order by providing your details below
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form - Takes up 2/3 of the space on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
              {!paymentServerAvailable && (
                <button
                  onClick={handleRetryConnection}
                  className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded text-sm"
                >
                  Retry Connection
                </button>
              )}
            </div>
          )}

          {isTestMode && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Payment system is in test mode</p>
              <p>
                {!paymentServerAvailable
                  ? "The payment server is currently unavailable. Your order will be processed in test mode."
                  : "Please proceed with checkout to simulate an order without payment processing."}
              </p>
            </div>
          )}

          {renderCheckoutForm()}
        </div>

        {/* Order Summary - Takes up 1/3 of the space on large screens */}
        <div>
          <OrderSummary
            cartItems={cartItems}
            total={getCartTotal()}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
