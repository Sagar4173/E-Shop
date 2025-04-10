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
  getStripePublicKey,
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

  // Fetch Stripe publishable key from backend
  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const { publishableKey } = await getStripePublicKey();
        if (publishableKey) {
          setStripePromise(loadStripe(publishableKey));
        }
      } catch (err) {
        console.error("Error fetching Stripe publishable key:", err);
        // We don't set an error here, as payment can still work in test mode
      }
    };

    fetchStripeKey();
  }, []);

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (cartItems.length === 0) {
        navigate("/products");
        return;
      }

      try {
        setLoading(true);
        const total = getCartTotal();
        const data = await createPaymentIntent(total);
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error creating payment intent:", err);
        setError("Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [cartItems, getCartTotal, navigate]);

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
            </div>
          )}

          {!stripePromise && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Payment system is in test mode</p>
              <p>
                Please proceed with checkout to simulate an order without
                payment processing.
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm />
            </Elements>
          ) : !loading && !error ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Checkout
              </h2>
              <p className="text-gray-600 mb-4">
                Please fill out your shipping and payment information to
                complete your order.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/order-confirmation");
                }}
                className="space-y-6"
              >
                {/* Basic Form Fields */}
                <div className="space-y-4">
                  {/* Name */}
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
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Email */}
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
          ) : null}
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
