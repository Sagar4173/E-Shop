import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaCheckCircle,
  FaFileInvoice,
  FaFileDownload,
  FaShippingFast,
  FaEye,
  FaEnvelope,
  FaEllipsisV,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import { getOrderById } from "../../services/orderService";
import {
  downloadInvoice,
  previewInvoice,
  emailInvoice,
} from "../../utils/invoiceGenerator";
import { Order } from "../../types";
import { format } from "date-fns";

const OrderConfirmationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);

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
            "Failed to load order details. Please check your order history.",
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

  // Handle invoice preview
  const handlePreviewInvoice = () => {
    if (order) {
      previewInvoice(order);
    }
  };

  // Handle email invoice
  const handleEmailInvoice = async () => {
    if (order) {
      setSendingEmail(true);
      try {
        const success = await emailInvoice(order);
        if (success) {
          setEmailSent(true);
          setTimeout(() => {
            setEmailSent(false);
          }, 5000);
        } else {
          alert("Failed to send invoice email. Please try again later.");
        }
      } catch (error) {
        console.error("Error sending invoice email:", error);
        alert("Failed to send invoice email. Please try again later.");
      } finally {
        setSendingEmail(false);
      }
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
      <div className="max-w-2xl mx-auto py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="bg-green-50 inline-block rounded-full p-5 mb-4">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-2">
            Your order has been successfully placed and is being processed.
          </p>
          <p className="text-gray-600">
            A confirmation email has been sent to{" "}
            <span className="font-medium">
              {(typeof order.user === "object" && order.user?.email) ||
                order.paymentResult?.email_address ||
                order.shippingAddress?.email ||
                "your email address"}
            </span>
            .
          </p>
        </div>

        {/* Order information */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Order Information</h2>
            <div className="relative">
              {emailSent && (
                <div className="absolute top-[-40px] right-0 bg-green-50 text-green-600 px-3 py-2 rounded border border-green-200 text-sm whitespace-nowrap">
                  Invoice sent to email!
                </div>
              )}
              {/* Invoice actions */}
              <div className="flex items-center">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-l text-sm hover:bg-blue-700"
                  title="Download Invoice"
                >
                  <FaFileDownload className="mr-1" /> Invoice
                </button>

                {/* More options button */}
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="bg-blue-600 text-white px-2 py-2 rounded-r hover:bg-blue-700 border-l border-blue-500 text-sm"
                  title="More Options"
                >
                  <FaEllipsisV />
                </button>

                {/* Dropdown menu with additional options */}
                {showOptions && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg z-10 border border-gray-200 w-48">
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        handlePreviewInvoice();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaEye className="mr-2 text-blue-600" /> Preview Invoice
                    </button>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        handleEmailInvoice();
                      }}
                      disabled={sendingEmail}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <FaEnvelope className="mr-2 text-blue-600" />
                      {sendingEmail ? "Sending..." : "Email Invoice"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="flex flex-col space-y-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">
                #{order._id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-sm">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium text-blue-600 flex items-center">
                  <FaShippingFast className="mr-1" />
                  {order.trackingNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span
                className={`font-medium px-2 py-0.5 rounded-full text-sm ${
                  order.isPaid
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {order.isPaid ? "Paid" : "Payment Pending"}
              </span>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3 flex items-center">
              <FaFileInvoice className="mr-2 text-blue-600" /> Order Summary
            </h3>
            <div className="divide-y border rounded-lg overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-8 bg-gray-50 p-3 font-medium text-sm">
                <div className="col-span-4">Item</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-1 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              {order.orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-8 p-3 text-sm">
                  <div className="col-span-4">{item.name}</div>
                  <div className="col-span-1 text-center">{item.quantity}</div>
                  <div className="col-span-1 text-right">
                    ₹{item.price.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="p-3 bg-gray-50">
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
                <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment and Shipping Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="text-sm">
                <p className="mb-1">
                  <span className="text-gray-600">Method:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p
                  className={
                    order.isPaid ? "text-green-600" : "text-yellow-600"
                  }
                >
                  {order.isPaid ? "Paid" : "Payment Pending"}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="text-sm">
                <p className="mb-1">
                  {order.shippingAddress.fullName || "Customer"}
                </p>
                <p className="mb-1">
                  {order.shippingAddress.address ||
                    order.shippingAddress.street}
                </p>
                <p className="mb-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <h3 className="font-medium mb-2">Need Help?</h3>
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
