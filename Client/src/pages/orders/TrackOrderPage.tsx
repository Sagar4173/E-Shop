import React, { useState } from "react";
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaSpinner,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Order } from "../../types";

interface TrackingOrder {
  _id: string;
  orderItems: Order["orderItems"];
  shippingAddress: {
    street?: string;
    address?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  status: string;
  deliveredAt?: string;
  trackingNumber?: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
}

const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError("Please enter both Order ID and Email");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/orders/track", {
        orderId: orderId.trim(),
        email: email.trim(),
      });
      setOrder(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message ||
          "Unable to find order. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "processing":
        return <FaBox className="text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-purple-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Order
            </h1>
            <p className="text-gray-600">
              Enter your order details to check the status of your order
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="orderId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Order ID
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email used for the order"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Status Header */}
              <div className="bg-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Order ID</p>
                    <p className="font-mono font-medium">{order._id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-6 space-y-6">
                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Tracking Number
                    </p>
                    <p className="text-lg font-mono">{order.trackingNumber}</p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-gray-600">
                    {order.shippingAddress.address ||
                      order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{order.shippingAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{order.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Order Timeline
                    </h3>
                    <div className="space-y-3">
                      {order.statusHistory.map((history, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          {getStatusIcon(history.status)}
                          <div>
                            <p className="font-medium capitalize">
                              {history.status}
                            </p>
                            <p className="text-gray-500">
                              {new Date(history.date).toLocaleString()}
                            </p>
                            {history.note && (
                              <p className="text-gray-600 mt-1">
                                {history.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div>
                      <p className="text-gray-500">Payment Date</p>
                      <p className="font-medium">
                        {new Date(order.paidAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div>
                      <p className="text-gray-500">Delivery Date</p>
                      <p className="font-medium">
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Need help?{" "}
              <Link
                to="/contact"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
