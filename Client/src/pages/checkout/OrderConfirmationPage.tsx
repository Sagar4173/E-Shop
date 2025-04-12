import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaCheckCircle,
  FaFileInvoice,
  FaFileDownload,
  FaShippingFast,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import { getOrderById } from "../../services/orderService";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import { Order } from "../../types";
import { format } from "date-fns";

const OrderConfirmationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("id");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch order details if we have an order ID
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          setLoading(true);
          const orderData = await getOrderById(orderId);
          setOrder(orderData);
        } catch (err) {
          console.error("Failed to fetch order details:", err);
          setError(
            "Failed to load order details. Please check your order history."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetails();
    } else {
      setLoading(false);
      setError("Order ID not found. Please check your order history.");
    }
  }, [orderId]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Handle invoice download
  const handleDownloadInvoice = () => {
    if (order) {
      downloadInvoice(order);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Order Information Unavailable
            </h2>
            <p className="text-red-600">
              {error || "Order information could not be loaded"}
            </p>
          </div>
          <Link
            to="/account/orders"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            View Your Orders
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-12">
        <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-6" />
        <h1 className="text-3xl font-bold mb-3">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-2">
          Your order has been successfully placed and is being processed.
        </p>
        <p className="text-gray-600 mb-8">
          A confirmation email has been sent to{" "}
          <span className="font-medium">
            {order.user?.email ||
              order.paymentResult?.email_address ||
              order.shippingAddress?.email ||
              "your email address"}
          </span>
          .
        </p>

        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FaFileDownload className="mr-1" />
              Download Invoice
            </button>
          </div>

          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">
                #{order._id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-blue-600">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium text-blue-600 flex items-center">
                  <FaShippingFast className="mr-1" />
                  {order.trackingNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium">
                {order.isPaid ? "Paid" : "Payment Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="divide-y">
              {order.orderItems.map((item, index) => (
                <div key={index} className="py-2 flex justify-between">
                  <span className="flex items-center">
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="ml-2">{item.name}</span>
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span>
                  {order.shippingAmount > 0
                    ? `₹${order.shippingAmount.toFixed(2)}`
                    : "Free"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span>₹{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <span>Total:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600 border-t pt-4">
            <p className="mb-2">
              If you have any questions about your order, please contact our
              customer support:
            </p>
            <p>
              <a
                href="mailto:support@ecommerce.com"
                className="text-blue-600 hover:underline"
              >
                support@ecommerce.com
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account/orders"
            className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-3 px-6 rounded-md font-medium transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
