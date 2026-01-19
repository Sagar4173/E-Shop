import { useState, FormEvent, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CartContext } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import { sendOrderConfirmationEmail } from "../../services/email/emailService";
import { updateOrderToPaid } from "../../services/orderService";
import {
  FaCreditCard,
  FaLock,
  FaCheck,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
} from "react-icons/fa";

interface CheckoutFormProps {
  isGuestCheckout?: boolean;
  guestInfo?: {
    name: string;
    email: string;
  };
  clientSecret?: string;
}

const CheckoutForm = ({
  isGuestCheckout = false,
  guestInfo = { name: "", email: "" },
  clientSecret = "",
}: CheckoutFormProps) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext) || {
    cartItems: [],
    getCartTotal: () => 0,
    clearCart: () => {},
  };

  // Add ref to track if we're in the middle of checkout completion
  const isCompletingOrder = useRef(false);

  const [processing, setProcessing] = useState<boolean>(false);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [showOrderReview, setShowOrderReview] = useState<boolean>(false);
  const [saveAddress, setSaveAddress] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN", // Changed from "India" to "IN" for Stripe compatibility
    },
  });

  // Pre-fill guest information if available
  useEffect(() => {
    if (isGuestCheckout && guestInfo) {
      setFormData((prevData) => ({
        ...prevData,
        name: guestInfo.name || prevData.name,
        email: guestInfo.email || prevData.email,
      }));
    }
  }, [isGuestCheckout, guestInfo]);

  const validateAddress = () => {
    // Basic validation
    if (
      !formData.address.line1 ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.postal_code
    ) {
      setValidationMessage("Please fill in all required address fields");
      return false;
    }

    // Format validation for postal code based on country (ISO 2-letter codes)
    const postalRegexByCountry: Record<string, RegExp> = {
      IN: /^\d{6}$/, // India: 6 digits
      US: /^\d{5}(-\d{4})?$/, // US: 5 digits or 5+4
      UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // UK postal code (space optional)
      GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, // GB (alias for UK)
      CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, // Canada: A1A 1A1 format (space optional)
      AU: /^\d{4}$/, // Australia: 4 digits
      DE: /^\d{5}$/, // Germany: 5 digits
      FR: /^\d{5}$/, // France: 5 digits
      JP: /^\d{3}-?\d{4}$/, // Japan: 123-4567 format
      CN: /^\d{6}$/, // China: 6 digits
    };

    const regex = postalRegexByCountry[formData.address.country];
    if (regex && !regex.test(formData.address.postal_code)) {
      setValidationMessage(
        `Invalid postal code format for ${formData.address.country}`,
      );
      return false;
    }

    // Phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationMessage("Please enter a valid phone number");
      return false;
    }

    // All validations passed
    setValidationMessage("Address validated successfully!");
    return true;
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as Record<
            string,
            unknown
          >),
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate address before proceeding
    if (!validateAddress()) {
      setError(validationMessage);
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      // Set the flag to indicate we're completing an order
      isCompletingOrder.current = true;

      // Create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
          },
        });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Payment failed");
        setProcessing(false);
        isCompletingOrder.current = false;
        return;
      }

      // Calculate order amounts
      const subtotal = getCartTotal();
      const shippingAmount = subtotal >= 50 ? 0 : 10;
      const taxAmount = subtotal * 0.18; // 18% tax
      const totalAmount = subtotal + shippingAmount + taxAmount; // Prepare order data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl, // Correctly mapped to match server-side Order model
          product: item.id, // Changed from item._id to item.id - this is how IDs are stored in the cart
        })),
        shippingAddress: {
          fullName: formData.name,
          address:
            formData.address.line1 +
            (formData.address.line2 ? ", " + formData.address.line2 : ""),
          street: formData.address.line1, // Include both address and street for compatibility
          address2: formData.address.line2 || undefined,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.postal_code,
          country: formData.address.country,
          phone: formData.phone,
          email: formData.email, // Add email to shipping address for non-logged in users
        },
        paymentMethod: "Stripe",
        paymentResult: {
          id: "pending_pi_" + paymentMethod.id, // Will be replaced with the actual payment intent ID after confirmation
          status: "processing", // Set to processing until full confirmation
          update_time: new Date().toISOString(),
          email_address: formData.email,
        },
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        isGuestCheckout, // Flag to indicate if this is a guest order
      };

      // Create the order in our system
      const createdOrder = await createOrder(orderData);
      try {
        // Complete the Stripe payment flow using confirmCardPayment
        const { paymentIntent, error: confirmError } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement },
          });

        if (confirmError) {
          // Payment failed
          console.error("Payment confirmation error:", confirmError);
          throw new Error(confirmError.message || "Payment failed");
        }
        if (paymentIntent && paymentIntent.status === "succeeded") {
          // Payment succeeded, update order status
          const paymentResultUpdate = {
            id: paymentIntent.id, // Use payment intent ID instead of payment method ID
            status: paymentIntent.status, // This should be "succeeded"
            update_time: new Date().toISOString(),
            email_address: formData.email,
          };

          // Update payment for both guest and logged-in users
          await updateOrderToPaid(createdOrder._id, paymentResultUpdate);
          console.log(
            `Payment successfully completed. Status: ${paymentIntent.status}`,
          );

          // For debugging payment flow
          if (isGuestCheckout) {
            console.log("Guest checkout payment completed successfully");
          }
        } else {
          console.warn(
            "Payment intent status not successful:",
            paymentIntent?.status,
          );

          // For guest checkout, we need to be strict about payment success
          if (isGuestCheckout) {
            throw new Error(
              `Payment not completed. Status: ${
                paymentIntent?.status || "unknown"
              }`,
            );
          } else {
            // For logged-in users, we still notify but continue
            setError(
              `Payment not completed. Status: ${
                paymentIntent?.status || "unknown"
              }`,
            );
          }
        }
      } catch (payError: unknown) {
        console.error("Failed to update order payment status:", payError);

        // For guest checkout, stop the process if payment fails
        if (isGuestCheckout) {
          throw payError; // Re-throw to break out of the checkout flow
        }
        // For logged-in users, continue with checkout but show error
        const errorMessage =
          payError instanceof Error
            ? payError.message
            : "Error processing payment";
        setError(`Payment issue: ${errorMessage}`);
      }

      // Send order confirmation email
      await sendOrderConfirmationEmail(createdOrder._id, {
        ...createdOrder,
        paidAt: createdOrder.paidAt || undefined, // Convert null to undefined if needed
        deliveredAt: createdOrder.deliveredAt || undefined, // Convert null to undefined
        shippingAddress: {
          ...createdOrder.shippingAddress,
          email: formData.email, // Ensure email is explicitly set
        },
        paymentResult: {
          ...createdOrder.paymentResult,
          email_address: formData.email, // Ensure email is explicitly set
        },
      });

      // Set payment as successful
      setSucceeded(true);
      setError(null);

      // Clear the shopping cart
      clearCart();

      // Redirect to order confirmation with the actual order ID
      navigate(`/order-confirmation?id=${createdOrder._id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during checkout",
      );
      setProcessing(false);
      // Reset the flag if payment fails
      isCompletingOrder.current = false;
    }
  };

  // Create a custom card element style that ensures accessibility - removed unsupported ::focus property
  const cardElementStyle = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true, // Handle postal code separately for better accessibility
  };

  // Add a ref to access the card element wrapper for focus management
  const cardElementRef = useRef<HTMLDivElement>(null);

  // Handle the case when the card element receives or loses focus
  const handleCardElementFocus = (event: { elementType: string }) => {
    if (cardElementRef.current) {
      // When using Stripe's actual events, we don't get focused property
      // So we'll determine focus state based on presence of a class
      const isFocused = cardElementRef.current.classList.contains("ring-2");

      if (!isFocused) {
        // Element is getting focus
        cardElementRef.current.setAttribute(
          "aria-describedby",
          "card-element-errors",
        );
        // Add a focus class to improve visual focus indicator
        cardElementRef.current.classList.add("ring-2", "ring-blue-500");
      } else {
        // Element is losing focus
        cardElementRef.current.classList.remove("ring-2", "ring-blue-500");
      }
    }
  };

  return (
    <div className="space-y-6">
      {!showOrderReview ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateAddress()) {
              setShowOrderReview(true);
              setError(null);
            } else {
              setError(validationMessage);
            }
          }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center text-blue-600">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-blue-600 bg-blue-600 text-white">
                    1
                  </div>
                  <div className="text-sm font-medium ml-2">Information</div>
                </div>
                <div className="flex-grow border-t-2 border-gray-300 mx-4"></div>
                <div className="flex items-center text-gray-400">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-gray-300">
                    2
                  </div>
                  <div className="text-sm font-medium ml-2">Review</div>
                </div>
                <div className="flex-grow border-t-2 border-gray-300 mx-4"></div>
                <div className="flex items-center text-gray-400">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-gray-300">
                    3
                  </div>
                  <div className="text-sm font-medium ml-2">Payment</div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>

            {/* Contact form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="address.line1"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="address.line1"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="address.line2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="address.line2"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="address.city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="address.state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="address.postal_code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="address.postal_code"
                    name="address.postal_code"
                    value={formData.address.postal_code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="address.country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <select
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          country: e.target.value,
                        },
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="CN">China</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="save-address"
                  name="save-address"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="save-address"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Save this address for future use
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700"
          >
            Review Order
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center text-green-600">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-green-600 text-white bg-green-600">
                    <FaCheck className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium ml-2">Information</div>
                </div>
                <div className="flex-grow border-t-2 border-gray-300 mx-4"></div>
                <div className="flex items-center text-green-600">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-green-600 text-white bg-green-600">
                    <FaCheck className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium ml-2">Review</div>
                </div>
                <div className="flex-grow border-t-2 border-gray-300 mx-4"></div>
                <div className="flex items-center text-blue-600">
                  <div className="rounded-full h-8 w-8 flex items-center justify-center border-2 border-blue-600 bg-blue-600 text-white">
                    3
                  </div>
                  <div className="text-sm font-medium ml-2">Payment</div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Review Your Order
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700">
                  Contact Information
                </h3>
                <p className="text-sm text-gray-600">{formData.name}</p>
                <p className="text-sm text-gray-600">{formData.email}</p>
                <p className="text-sm text-gray-600">{formData.phone}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-700">
                  Shipping Address
                </h3>
                <p className="text-sm text-gray-600">
                  {formData.address.line1}
                  {formData.address.line2 && `, ${formData.address.line2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.address.city}, {formData.address.state},{" "}
                  {formData.address.postal_code}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.address.country}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <div className="flex items-center">
                <FaCreditCard className="mr-2 text-gray-600" />
                Payment Details
              </div>
            </h2>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Accepted payment methods
                </div>
                <div className="flex space-x-2">
                  <FaCcVisa className="h-6 w-6 text-blue-700" />
                  <FaCcMastercard className="h-6 w-6 text-red-500" />
                  <FaCcAmex className="h-6 w-6 text-blue-400" />
                  <FaCcDiscover className="h-6 w-6 text-orange-500" />
                </div>
              </div>

              {stripe && elements ? (
                <div>
                  {/* Accessible label for the card element */}
                  <label
                    htmlFor="card-element"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Credit or debit card
                  </label>
                  {/* Accessible wrapper for the card element with improved focus handling */}
                  <div
                    className="border border-gray-300 rounded-md p-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
                    ref={cardElementRef}
                    role="group"
                    aria-labelledby="card-element-label"
                  >
                    <div id="card-element-label" className="sr-only">
                      Enter your credit card information
                    </div>
                    <CardElement
                      id="card-element"
                      options={cardElementStyle}
                      onChange={(event) => {
                        if (event.error) {
                          setError(event.error.message);
                        } else {
                          setError(null);
                        }
                      }}
                      onFocus={handleCardElementFocus}
                      onBlur={handleCardElementFocus}
                      className="w-full"
                    />
                  </div>
                  {/* Error message container with proper accessibility */}
                  <div
                    id="card-element-errors"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    aria-live="assertive"
                  >
                    {error}
                  </div>
                </div>
              ) : (
                // Placeholder card input when not using Stripe Elements
                <div className="border border-gray-300 rounded-md p-4">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <label
                        htmlFor="card-number"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        placeholder="1234 1234 1234 1234"
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiry"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          placeholder="MM/YY"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cvc"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          CVC
                        </label>
                        <input
                          type="text"
                          id="cvc"
                          placeholder="123"
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center mt-4">
                <FaLock className="text-green-600 mr-2" />
                <p className="text-sm text-gray-600">
                  Your payment information is secured with SSL encryption
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
                role="alert"
              >
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowOrderReview(false)}
              className="py-2 px-4 rounded-md text-blue-600 border border-blue-600 hover:bg-blue-100"
            >
              Back to Information
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!stripe || processing || succeeded}
              className={`py-3 px-6 rounded-md text-white font-medium flex items-center ${
                !stripe || processing || succeeded
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {processing ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                "Complete Order"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
