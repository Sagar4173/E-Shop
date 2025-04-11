import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaLock,
} from "react-icons/fa";

const CartSummary = () => {
  const { cartItems, getCartTotal } = useContext(CartContext) || {
    cartItems: [],
    getCartTotal: () => 0,
  };

  const subtotal = getCartTotal();
  // Apply free shipping when subtotal is ≥ ₹50, otherwise charge ₹10
  const shipping = subtotal >= 50 ? 0 : subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping > 0 ? `₹${shipping.toFixed(2)}` : "Free"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST (18%)</span>
          <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-semibold text-gray-900">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Link
        to={cartItems.length > 0 ? "/checkout" : "#"}
        className={`block w-full mt-6 py-3 px-4 rounded-md text-center text-white font-medium ${
          cartItems.length > 0
            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={(e) => {
          if (cartItems.length === 0) {
            e.preventDefault();
          }
        }}
      >
        Proceed to Checkout
      </Link>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>We accept all major credit cards and PayPal</p>
        <div className="flex justify-center mt-2 space-x-3">
          <FaCcVisa className="h-6 w-6 text-blue-500" />
          <FaCcMastercard className="h-6 w-6 text-red-500" />
          <FaCcPaypal className="h-6 w-6 text-blue-700" />
          <FaCcAmex className="h-6 w-6 text-blue-400" />
        </div>
      </div>

      {/* Security indicator */}
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center text-xs text-gray-500">
          <FaLock className="mr-1 text-gray-500" />
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
