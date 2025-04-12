import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  FaDownload,
  FaMapMarkerAlt,
  FaUser,
  FaFileInvoice,
  FaShippingFast,
  FaExchangeAlt,
  FaArrowLeft,
  FaPrint,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline";
import {
  getOrderById,
  getOrderStatusHistory,
} from "../../services/orderService";
import { downloadInvoice } from "../../utils/invoiceGenerator";
import { Order, StatusHistoryEntry } from "../../types";

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch order details
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Fetch status history
        try {
          const historyData = await getOrderStatusHistory(id);
          setStatusHistory(historyData);
        } catch (err) {
          console.error("Error fetching status history:", err);
          // Don't set error here, as we can still display the order without history
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return format(new Date(dateString), "MMMM d, yyyy h:mm a");
  };

  const handleDownloadInvoice = () => {
    if (order) {
      downloadInvoice(order);
    }
  };

  const handlePrintPage = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || "Order not found"}</p>
            <Link
              to="/account/orders"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              &larr; Back to Orders
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4 print:py-0 print:px-0 print:shadow-none">
        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 print:hidden">
          <div>
            <Link
              to="/account/orders"
              className="inline-flex items-center text-blue-600 hover:underline mb-4"
            >
              <FaArrowLeft className="mr-2" /> Back to Orders
            </Link>
            <h1 className="text-2xl font-bold">
              Order #{order._id.substring(order._id.length - 6).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaDownload className="mr-2" /> Invoice
            </button>
            <button
              onClick={handlePrintPage}
              className="flex items-center bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              <FaPrint className="mr-2" /> Print
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="print:hidden">
              <OrderStatusTimeline
                statusHistory={statusHistory}
                currentStatus={order.status}
              />
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="divide-y divide-gray-200">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="py-4 flex items-center">
                    {item.imageUrl && (
                      <div className="w-16 h-16 flex-shrink-0 mr-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <div className="text-sm text-gray-600">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaShippingFast className="mr-2 text-blue-600" /> Shipping
                  Information
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                  <div className="font-medium">Tracking Number:</div>
                  <div className="flex items-center mt-1">
                    <span className="text-blue-700 font-mono">
                      {order.trackingNumber}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <a
                      href={`https://www.google.com/search?q=${order.trackingNumber}+tracking`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Track your package &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Return Policy */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:hidden">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaExchangeAlt className="mr-2 text-blue-600" /> Returns &
                Exchanges
              </h2>
              <p className="text-gray-700 mb-4">
                Not satisfied with your purchase? You have 30 days from delivery
                to return most items in their original condition.
              </p>
              {order.status === "delivered" && (
                <Link
                  to={`/account/orders/${order._id}/return`}
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Start a Return
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>
                    {order.shippingAmount > 0
                      ? `₹${order.shippingAmount.toFixed(2)}`
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹{order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                  <span>Total:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaFileInvoice className="mr-2 text-blue-600" /> Payment
                Information
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-gray-600">Method:</div>
                  <div>{order.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-gray-600">Status:</div>
                  <div
                    className={`font-medium ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Payment Pending"}
                    {order.paidAt && ` on ${formatDate(order.paidAt)}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" /> Shipping
                Address
              </h2>
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-1">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-4 print:shadow-none print:border print:border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" /> Customer Information
              </h2>
              <div>
                {typeof order.user === "object" && order.user ? (
                  <>
                    <p className="font-medium">{order.user.name}</p>
                    <p>{order.user.email}</p>
                  </>
                ) : order.shippingAddress.email ? (
                  <p>{order.shippingAddress.email}</p>
                ) : (
                  <p>Customer information not available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;
