import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

const CartSummary = () => {
  const { cartItems, getCartTotal } = useContext(CartContext) || {
    cartItems: [],
    getCartTotal: () => 0,
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1; // 10% tax
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
            ₹{shipping.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (10%)</span>
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
      </div>
    </div>
  );
};

export default CartSummary;
