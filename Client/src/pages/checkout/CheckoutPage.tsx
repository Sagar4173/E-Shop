import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import OrderSummary from "../../components/checkout/OrderSummary";
import Layout from "../../components/layout/Layout";
import { CartContext } from "../../context/CartContext";
import { getCurrentUser } from "../../services/authService";
import { createGuestOrder, createOrder } from "../../services/orderService";
import {
  checkPaymentServerHealth,
  createGuestPaymentIntent,
  createPaymentIntent,
  getStripePublicKey,
} from "../../services/paymentService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext) || {
    cartItems: [],
    getCartTotal: () => 0,
    clearCart: () => {},
  };

  // Add a ref to track if we're completing checkout
  const isCompletingCheckout = useRef(false);
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "" });
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [paymentServerAvailable, setPaymentServerAvailable] = useState(true);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const user = getCurrentUser();

  // Check payment server health
  useEffect(() => {
    const checkServerHealth = async () => {
      const isAvailable = await checkPaymentServerHealth();
      setPaymentServerAvailable(isAvailable);

      if (!isAvailable) {
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
        setIsTestMode(isTestMode);

        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      } catch {
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
      // Check if we're in the midst of completing checkout based on localStorage
      const isCheckoutComplete =
        localStorage.getItem("checkoutComplete") === "true";

      // Only redirect to products if not completing checkout and cart is empty
      if (
        cartItems.length === 0 &&
        !isCompletingCheckout.current &&
        !isCheckoutComplete &&
        !location.pathname.includes("order-confirmation")
      ) {
        // Add a small delay to ensure we're not in the middle of a navigation
        setTimeout(() => {
          navigate("/products");
        }, 100);
        return;
      }

      // Clear the checkout complete flag once we've passed the redirect check
      if (isCheckoutComplete) {
        localStorage.removeItem("checkoutComplete");
      }

      // Skip trying to create a payment intent if server is already known to be down
      if (!paymentServerAvailable && retryAttempt === 0) {
        setIsTestMode(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const total = getCartTotal();

        // Skip payment intent creation if total is zero or negative
        if (total <= 0) {
          setIsTestMode(true);
          setLoading(false);
          return;
        }

        let paymentData;

        try {
          paymentData = await createPaymentIntent(total);
          setIsGuestCheckout(false);
          setClientSecret(paymentData.clientSecret);
          setError(null);

          // Reset server availability state since request succeeded
          setPaymentServerAvailable(true);
        } catch (authError: any) {
          // Check if it's a Stripe account error (402 status)
          if (
            authError.response?.status === 402 ||
            authError.message?.includes("402")
          ) {
            setPaymentServerAvailable(false);
            setIsTestMode(true);
            setError("Payment processing unavailable. Using test mode.");
            setLoading(false);
            return;
          }
          // If it's a timeout error, might be a server issue
          if (
            authError.message?.includes("timeout") ||
            authError.message?.includes("too long")
          ) {
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
      }
    };

    initializePayment();
  }, [cartItems, getCartTotal, navigate, paymentServerAvailable, retryAttempt]);

  const appearance = {
    theme: "stripe" as const, // Use const assertion for correct typing
    variables: {
      colorPrimary: "#3b82f6", // blue-500
    },
  };

  const options: StripeElementsOptions = {
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
      setIsTestMode(true);
      return;
    }
    try {
      setLoading(true);
      const total = getCartTotal();

      if (total <= 0) {
        setIsTestMode(true);
        setLoading(false);
        return;
      }

      const paymentData = await createGuestPaymentIntent(total, guestInfo);

      setClientSecret(paymentData.clientSecret);
      setError(null);

      // Reset server availability state since request succeeded
      setPaymentServerAvailable(true);
    } catch (err: any) {
      console.error("Error creating guest payment intent:", err);

      // Check for Stripe account errors (402)
      if (err.response?.status === 402 || err.message?.includes("402")) {
        setPaymentServerAvailable(false);
        setIsTestMode(true);
        setError("Payment processing unavailable. Using test mode.");
      } else if (
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

  const handleTestModeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get("test-name") as string;
      const email = formData.get("test-email") as string;

      // Get shipping address from localStorage or use default
      const shippingAddress = JSON.parse(
        localStorage.getItem("shippingAddress") || "{}"
      );

      // Prepare order data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.id || item._id,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: name || user?.name || "Test User",
          street:
            shippingAddress.address ||
            shippingAddress.street ||
            "123 Test Street",
          city: shippingAddress.city || "Test City",
          state: shippingAddress.state || "Test State",
          postalCode: shippingAddress.postalCode || "12345",
          country: shippingAddress.country || "US",
          phone: shippingAddress.phone || "1234567890",
          email: email || user?.email || "test@example.com",
        },
        paymentMethod: "test",
        subtotal: getCartTotal(),
        taxAmount: getCartTotal() * 0.18,
        shippingAmount: 0,
        totalAmount: getCartTotal() * 1.18,
        isGuestCheckout: !user,
        paymentResult: {
          id: "test_" + Date.now(),
          status: "completed",
          update_time: new Date().toISOString(),
          email_address: email || user?.email || "test@example.com",
        },
      };

      // Create the order
      const newOrder = user
        ? await createOrder(orderData)
        : await createGuestOrder(orderData);

      // Set both the ref flag and a more permanent localStorage flag
      isCompletingCheckout.current = true;
      localStorage.setItem("checkoutComplete", "true");

      // Clear the cart after successful order
      clearCart();

      // Redirect to order confirmation with order ID
      navigate(`/order-confirmation?id=${newOrder._id}`);
    } catch (error) {
      console.error("Error creating test order:", error);
      setError("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
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

    if (isGuestCheckout && !clientSecret) {
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

    if (isTestMode) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Mode Checkout
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Test Mode:</strong> Your order will be processed without
              payment. No charges will be made.
            </p>
          </div>
          <form onSubmit={handleTestModeSubmit} className="space-y-6">
            <div className="space-y-4">
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
                  defaultValue={user?.name || ""}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                  defaultValue={user?.email || ""}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
              >
                Complete Test Order
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (clientSecret && stripePromise) {
      return (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            isGuestCheckout={isGuestCheckout}
            guestInfo={guestInfo}
          />
        </Elements>
      );
    }

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
