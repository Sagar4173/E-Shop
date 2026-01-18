import { useState } from "react";
import { CartItem } from "../../types";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaLock,
  FaExchangeAlt,
  FaRegClock,
  FaTag,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { validateCoupon, CouponValidation } from "../../services/couponService";

interface OrderSummaryProps {
  cartItems: CartItem[];
  total: number;
  loading?: boolean;
  orderPlaced?: boolean;
  orderId?: string;
  onDiscountApplied?: (discount: number, couponCode: string) => void;
}

const OrderSummary = ({
  cartItems,
  total,
  loading = false,
  orderPlaced = false,
  orderId = "",
  onDiscountApplied,
}: OrderSummaryProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null,
  );

  // Apply the same free shipping logic as in CartSummary.tsx
  const shipping = total >= 50 ? 0 : total > 0 ? 10 : 0;
  const discount = appliedCoupon?.discount || 0;
  const subtotalAfterDiscount = total - discount;
  const tax = subtotalAfterDiscount * 0.18; // 18% tax on checkout
  const finalTotal = subtotalAfterDiscount + shipping + tax;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoError("");
    setPromoLoading(true);

    try {
      const result = await validateCoupon(promoCode.trim(), total);
      setAppliedCoupon(result);
      if (onDiscountApplied) {
        onDiscountApplied(result.discount, result.code);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setPromoError(
        error.response?.data?.message || "Invalid or expired coupon code",
      );
      setAppliedCoupon(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    if (onDiscountApplied) {
      onDiscountApplied(0, "");
    }
  };

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
        {appliedCoupon && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center">
              <FaTag className="mr-1" />
              Discount ({appliedCoupon.code}):
            </span>
            <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="text-gray-800">
            {shipping > 0 ? `₹${shipping.toFixed(2)}` : "Free"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">GST (18%):</span>
          <span className="text-gray-800">₹{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
          <span>Total:</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo code input */}
      {!orderPlaced && !appliedCoupon && (
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
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter code"
              disabled={promoLoading}
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoLoading}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {promoLoading ? "..." : "Apply"}
            </button>
          </div>
          {promoError && (
            <p className="text-red-500 text-xs mt-1">{promoError}</p>
          )}
        </div>
      )}

      {/* Applied coupon display */}
      {!orderPlaced && appliedCoupon && (
        <div className="mt-6 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <FaTag className="mr-2" />
              <span className="font-medium">{appliedCoupon.code}</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-gray-500 hover:text-red-500"
              aria-label="Remove coupon"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-green-600 mt-1">
            {appliedCoupon.discountType === "percentage"
              ? `${appliedCoupon.discountValue}% off`
              : `₹${appliedCoupon.discountValue} off`}
            {appliedCoupon.description && ` - ${appliedCoupon.description}`}
          </p>
        </div>
      )}

      {/* Return Request Section - Only shown after order is placed */}
      {orderPlaced && orderId && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <FaExchangeAlt className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium">Return Policy</h3>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Not satisfied? You have 30 days from delivery date to return most
            items in their original condition.
          </p>
          <div className="flex items-center text-xs text-gray-600 mb-4">
            <FaRegClock className="h-3 w-3 mr-1" />
            <span>Return window closes in 30 days</span>
          </div>
          <Link
            to={`/account/orders/${orderId}/return`}
            className="block w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Request Return
          </Link>
          <Link
            to="/returns"
            className="block w-full text-center mt-2 text-xs text-blue-600 hover:underline"
          >
            View Return Policy
          </Link>
        </div>
      )}

      {/* Payment methods */}
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">We Accept</h3>
        <div className="flex space-x-3">
          <FaCcVisa className="h-7 w-7 text-blue-500" />
          <FaCcMastercard className="h-7 w-7 text-red-500" />
          <FaCcPaypal className="h-7 w-7 text-blue-700" />
          <FaCcAmex className="h-7 w-7 text-blue-400" />
        </div>
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
          <FaLock className="h-5 w-8 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
