import { CartItem } from "../../types";

interface OrderSummaryProps {
  cartItems: CartItem[];
  total: number;
  loading?: boolean;
}

const OrderSummary = ({
  cartItems,
  total,
  loading = false,
}: OrderSummaryProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item) => (
          <div
            key={`${item.id}-${item.name}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center">
              <span className="font-medium">{item.quantity}×</span>
              <span className="ml-2">{item.name}</span>
            </div>
            <span className="text-gray-600">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Order Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">₹{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="text-gray-800">Free</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax:</span>
          <span className="text-gray-800">₹{(total * 0.18).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
          <span>Total:</span>
          <span>₹{(total + total * 0.18).toFixed(2)}</span>
        </div>
      </div>

      {/* Promo code input */}
      <div className="mt-6">
        <label
          htmlFor="promo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Promo code
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="promo"
            className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter code"
          />
          <button
            type="button"
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">We Accept</h3>
        <ul className="flex space-x-2">
          {["visa", "mastercard", "amex", "paypal"].map((method, index) => (
            <li key={`payment-${method}-${index}`} className="flex-shrink-0">
              <img
                src={`/images/payment/${method}.svg`}
                alt={method}
                className="h-8"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-4 py-2 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-t-blue-600 border-r-blue-600 border-b-blue-600 border-l-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Processing payment...</p>
        </div>
      )}

      {/* Payment security notice */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured with industry-standard encryption
        </p>
        <div className="flex justify-center mt-2 space-x-2">
          <svg
            className="h-5 w-8"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="20" rx="2" fill="#E5E7EB" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16 14C18.2091 14 20 12.2091 20 10C20 7.79086 18.2091 6 16 6C13.7909 6 12 7.79086 12 10C12 12.2091 13.7909 14 16 14Z"
              stroke="#4B5563"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            className="h-5 w-8"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="20" rx="2" fill="#E5E7EB" />
            <path
              d="M21.5 6H10.5C9.67157 6 9 6.67157 9 7.5V12.5C9 13.3284 9.67157 14 10.5 14H21.5C22.3284 14 23 13.3284 23 12.5V7.5C23 6.67157 22.3284 6 21.5 6Z"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            className="h-5 w-8"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="20" rx="2" fill="#E5E7EB" />
            <path
              d="M22 7H10L11.5 13H20.5L22 7Z"
              stroke="#4B5563"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10C19 8.34315 17.6569 7 16 7C14.3431 7 13 8.34315 13 10C13 11.6569 14.3431 13 16 13C17.6569 13 19 11.6569 19 10Z"
              fill="#4B5563"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
