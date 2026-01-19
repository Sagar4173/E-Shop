import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  FaDownload,
  FaEye,
  FaArrowLeft,
  FaExclamationTriangle,
  FaFileInvoice,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import api from "../../services/api";
import { downloadInvoice, previewInvoice } from "../../utils/invoiceGenerator";
import { Order } from "../../types";

const InvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      if (!email) {
        setError("Email verification is required to view this invoice");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/orders/invoice/${id}?email=${encodeURIComponent(email)}`,
        );
        setOrder(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        let errorMessage = "Failed to load invoice. Please try again.";

        if (err.response) {
          const statusCode = err.response.status;
          if (statusCode === 404) {
            errorMessage = "Order not found.";
          } else if (statusCode === 401) {
            errorMessage =
              "Email does not match order records. Please check the email address.";
          } else if (statusCode === 400) {
            errorMessage = "Invalid request. Order ID and email are required.";
          } else {
            errorMessage =
              err.response.data?.message || "Server error occurred.";
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, email]);

  const handleDownloadInvoice = () => {
    if (order) {
      downloadInvoice(order);
    }
  };

  const handlePreviewInvoice = () => {
    if (order) {
      previewInvoice(order);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Unable to Load Invoice
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link
                to="/track-order"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Track Your Order
              </Link>
              <Link
                to="/"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return null;
  }

  const orderId = order._id.substring(order._id.length - 8).toUpperCase();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaFileInvoice className="text-blue-600 text-3xl" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
                <p className="text-gray-500">Order #{orderId}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePreviewInvoice}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaEye />
                <span>View Invoice</span>
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
              >
                <FaDownload />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Order Details
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Order ID:</span>{" "}
                  <span className="font-medium">#{orderId}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Date:</span>{" "}
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>{" "}
                  <span
                    className={`font-medium capitalize ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Payment Pending"}
                  </span>
                </p>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Billing Address
              </h3>
              <div className="text-sm">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.address ||
                    order.shippingAddress.street}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Items</h2>
          <div className="divide-y">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between py-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-800">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>
                {order.shippingAmount === 0
                  ? "Free"
                  : `₹${order.shippingAmount.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (18%)</span>
              <span>₹{order.taxAmount.toFixed(2)}</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/track-order"
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            <span>Track Another Order</span>
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default InvoicePage;
