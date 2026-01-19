import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBox,
  FaCalendarAlt,
  FaCommentAlt,
  FaDollarSign,
  FaDownload,
  FaEdit,
  FaEnvelope,
  FaExchangeAlt,
  FaEye,
  FaFileInvoice,
  FaHistory,
  FaMapMarkerAlt,
  FaPhone,
  FaPrint,
  FaSave,
  FaShippingFast,
  FaTag,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline";
import { getCurrentUser, isAuthenticated } from "../../services/authService";
import { sendOrderStatusUpdateEmail } from "../../services/emailService";
import {
  addTrackingNumber,
  getOrderById,
  getOrderReturns,
  getOrderStatusHistory,
  updateOrderStatus,
} from "../../services/orderService";
import { Order, StatusHistoryEntry } from "../../types";
import {
  downloadInvoice,
  emailInvoice,
  previewInvoice,
} from "../../utils/invoiceGenerator";

const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");
  const [editingTracking, setEditingTracking] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [returnRequests, setReturnRequests] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: `/admin/orders/${id}` } },
      });
      return;
    }

    const user = getCurrentUser();
    if (!user?.isAdmin) {
      // If not admin, redirect to home page
      navigate("/");
      return;
    }

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
        setNewStatus(orderData.status);
        setTrackingNumber(orderData.trackingNumber || "");

        // Fetch status history
        try {
          const historyData = await getOrderStatusHistory(id);
          setStatusHistory(historyData);

          // Prepare activity log from status history
          const activities = historyData.map((entry) => ({
            type: "status",
            date: entry.timestamp || entry.date,
            details: `Status changed to ${entry.status}`,
            user: entry.user?.name || entry.updatedBy?.name || "System",
            notes: entry.notes || entry.note || "",
          }));

          setActivityLog(activities);
        } catch (err) {
          console.error("Error fetching status history:", err);
        }

        // Fetch return requests if any
        try {
          const returnsData = await getOrderReturns(id);
          setReturnRequests(returnsData);

          // Add return activities to activity log
          if (returnsData && returnsData.length > 0) {
            const returnActivities = returnsData.map((returnReq) => ({
              type: "return",
              date: returnReq.createdAt,
              details: `Return request created - Status: ${returnReq.status}`,
              items:
                returnReq.returnItems?.length || returnReq.items?.length || 0,
            }));

            setActivityLog((prev) =>
              [...prev, ...returnActivities].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
            );
          }
        } catch (err) {
          console.error("Error fetching return requests:", err);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        let errorMessage = "Failed to load order details. Please try again.";

        if (err.response) {
          const statusCode = err.response.status;
          if (statusCode === 404) {
            errorMessage = "Order not found. It may have been deleted.";
          } else if (statusCode === 401) {
            errorMessage = "You're not authorized to view this order.";
          } else {
            errorMessage = `Server error (${statusCode}): ${
              err.response.data?.message || "Unknown error"
            }`;
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return format(new Date(dateString), "MMMM d, yyyy h:mm a");
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

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

  const handleEmailInvoice = async () => {
    if (order) {
      try {
        const success = await emailInvoice(order);
        if (success) {
          setEmailSent(true);

          // Add to activity log
          const newActivity = {
            type: "email",
            date: new Date().toISOString(),
            details: "Invoice emailed to customer",
            user: getCurrentUser()?.name || "Admin",
          };
          setActivityLog((prev) => [newActivity, ...prev]);

          setTimeout(() => {
            setEmailSent(false);
          }, 5000);
        } else {
          alert("Failed to send invoice email. Please try again later.");
        }
      } catch (error) {
        console.error("Error sending invoice email:", error);
        alert("Failed to send invoice email. Please try again later.");
      }
    }
  };

  const handlePrintPage = () => {
    window.print();
  };

  const openStatusModal = () => {
    if (order) {
      setNewStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setStatusNote("");
      setShowStatusModal(true);
    }
  };

  const handleStatusSubmit = async () => {
    if (!order) return;

    try {
      setSubmitting(true);

      const data: any = {
        status: newStatus,
        note: statusNote,
      };

      // Add tracking number if it exists
      if (trackingNumber) {
        data.trackingNumber = trackingNumber;
      }

      // Update order status in database
      await updateOrderStatus(order._id, newStatus, data);

      // Send email notification about status change
      await sendOrderStatusUpdateEmail(order._id, newStatus, statusNote);

      // Add to activity log
      const newActivity = {
        type: "status",
        date: new Date().toISOString(),
        details: `Status changed to ${newStatus}`,
        user: getCurrentUser()?.name || "Admin",
        notes: statusNote,
      };
      setActivityLog((prev) => [newActivity, ...prev]);

      // Update the order in the local state
      setOrder({
        ...order,
        status: newStatus,
        trackingNumber: trackingNumber || order.trackingNumber,
      });

      // Update status history
      const updatedHistory = await getOrderStatusHistory(order._id);
      setStatusHistory(updatedHistory);

      setShowStatusModal(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
      setSubmitting(false);
    }
  };

  const saveTracking = async () => {
    if (!order) return;

    try {
      await addTrackingNumber(order._id, trackingNumber);

      // Update local order data
      setOrder({
        ...order,
        trackingNumber,
      });

      // Add to activity log
      const newActivity = {
        type: "tracking",
        date: new Date().toISOString(),
        details: `Tracking number updated: ${trackingNumber}`,
        user: getCurrentUser()?.name || "Admin",
      };
      setActivityLog((prev) => [newActivity, ...prev]);

      setEditingTracking(false);
    } catch (error) {
      console.error("Error adding tracking number:", error);
      alert("Failed to update tracking number. Please try again.");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || "Order not found"}</p>
            <Link
              to="/admin/orders"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              &larr; Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Update Order Status: #
              {order._id.substring(order._id.length - 6).toUpperCase()}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="order-status-select"
                aria-label="Order status"
                className={`w-full border rounded-md py-2 px-3 ${getStatusClass(
                  newStatus
                )}`}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Add tracking number"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note to Customer (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md py-2 px-3"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note to the customer"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 bg-white p-6 rounded-lg shadow-sm print:hidden">
          <div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-blue-600 hover:underline mb-4"
            >
              <FaArrowLeft className="mr-2" /> Back to Orders
            </Link>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-3">
                Order #{order._id.substring(order._id.length - 6).toUpperCase()}
              </h1>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClass(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end mt-4 md:mt-0">
            {emailSent && (
              <div className="bg-green-50 text-green-600 px-3 py-2 rounded border border-green-200 text-sm mb-3">
                Invoice sent to customer!
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={openStatusModal}
                className="flex items-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                <FaEdit className="mr-2" /> Update Status
              </button>

              <div className="dropdown relative inline-block">
                <button className="flex items-center bg-gray-100 text-gray-800 px-3 py-2 rounded hover:bg-gray-200">
                  <FaFileInvoice className="mr-2" /> Invoice Actions
                </button>
                <div className="dropdown-content hidden absolute right-0 bg-white mt-1 py-2 w-48 rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaDownload className="mr-2 text-blue-600" /> Download
                  </button>
                  <button
                    onClick={handlePreviewInvoice}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaEye className="mr-2 text-blue-600" /> Preview
                  </button>
                  <button
                    onClick={handleEmailInvoice}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaEnvelope className="mr-2 text-blue-600" /> Email to
                    Customer
                  </button>
                  <button
                    onClick={handlePrintPage}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  >
                    <FaPrint className="mr-2 text-blue-600" /> Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
              <OrderStatusTimeline
                statusHistory={statusHistory}
                currentStatus={order.status}
              />
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaBox className="mr-2 text-blue-600" /> Order Items
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        SKU
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.imageUrl && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              {item.color && (
                                <span className="text-xs text-gray-500">
                                  Color: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="text-xs text-gray-500 ml-2">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sku || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td
                        colSpan={4}
                        className="px-6 py-3 text-sm font-medium text-gray-900 text-right"
                      >
                        Subtotal:
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        ₹{order.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-1 text-sm text-gray-500 text-right"
                      >
                        Tax:
                      </td>
                      <td className="px-6 py-1 text-sm text-gray-500 text-right">
                        ₹{order.taxAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-1 text-sm text-gray-500 text-right"
                      >
                        Shipping:
                      </td>
                      <td className="px-6 py-1 text-sm text-gray-500 text-right">
                        {order.shippingAmount > 0
                          ? `₹${order.shippingAmount.toFixed(2)}`
                          : "Free"}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-3 text-base font-medium text-gray-900 text-right"
                      >
                        Total:
                      </td>
                      <td className="px-6 py-3 text-base font-medium text-gray-900 text-right">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaShippingFast className="mr-2 text-blue-600" /> Shipping
                Information
              </h2>

              <div className="flex flex-col md:flex-row mb-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-700 mb-1">
                    Tracking Number
                  </div>
                  {editingTracking ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1 mr-2 w-full md:w-60"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        aria-label="Tracking number"
                      />
                      <button
                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                        onClick={saveTracking}
                        aria-label="Save tracking number"
                      >
                        <FaSave className="mr-1 inline" /> Save
                      </button>
                      <button
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setTrackingNumber(order.trackingNumber || "");
                          setEditingTracking(false);
                        }}
                        aria-label="Cancel editing tracking number"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span
                        className={`font-mono ${
                          trackingNumber
                            ? "text-blue-700"
                            : "text-gray-500 italic"
                        }`}
                      >
                        {trackingNumber || "No tracking number"}
                      </span>
                      <button
                        className="ml-3 text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => setEditingTracking(true)}
                      >
                        <FaEdit className="mr-1 inline" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 md:mt-0">
                  <div className="font-medium text-gray-700 mb-1">
                    Shipping Method
                  </div>
                  <span className="text-gray-800">
                    {order.shippingMethod || "Standard Shipping"}
                  </span>
                </div>
              </div>

              {order.status === "shipped" && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="text-sm text-blue-800">
                    <p>
                      This order was shipped on{" "}
                      {order.shippedAt ? formatDate(order.shippedAt) : "N/A"}.
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-2">
                        <a
                          href={`https://www.google.com/search?q=${order.trackingNumber}+tracking`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Track shipment &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Customer Notes */}
            {order.customerNote && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  <FaCommentAlt className="mr-2 text-blue-600" /> Customer Notes
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-gray-800">
                  {order.customerNote}
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaHistory className="mr-2 text-blue-600" /> Activity Log
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activityLog.length > 0 ? (
                  activityLog.map((activity, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 py-1"
                    >
                      <div className="flex items-start">
                        <div
                          className={`rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0 ${
                            activity.type === "status"
                              ? "bg-blue-500"
                              : activity.type === "return"
                                ? "bg-yellow-500"
                                : activity.type === "email"
                                  ? "bg-green-500"
                                  : activity.type === "tracking"
                                    ? "bg-purple-500"
                                    : "bg-gray-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {activity.details}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FaCalendarAlt className="mr-1" />{" "}
                            {formatDate(activity.date)}
                            {activity.user && (
                              <span className="ml-2">by {activity.user}</span>
                            )}
                          </div>
                          {activity.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic">
                              "{activity.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No activity recorded
                  </p>
                )}
              </div>
            </div>

            {/* Return Requests */}
            {returnRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaExchangeAlt className="mr-2 text-blue-600" /> Return
                  Requests
                </h2>

                {returnRequests.map((request, index) => (
                  <div
                    key={index}
                    className={`border ${
                      request.status === "approved"
                        ? "border-green-200 bg-green-50"
                        : request.status === "rejected"
                          ? "border-red-200 bg-red-50"
                          : "border-yellow-200 bg-yellow-50"
                    } rounded-md p-4 mb-4`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          Return Request #
                          {request._id
                            .substring(request._id.length - 6)
                            .toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Created on {formatShortDate(request.createdAt)}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm font-medium">Items</div>
                      <div className="space-y-2 mt-1">
                        {request.returnItems.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex justify-between text-sm"
                          >
                            <div>
                              {item.name} × {item.quantity}
                            </div>
                            <div>Reason: {item.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Link
                        to={`/admin/returns/${request._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaUser className="mr-2 text-blue-600" /> Customer
                </h2>
                {typeof order.user === "object" && order.user && (
                  <Link
                    to={`/admin/users/${order.user._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Customer
                  </Link>
                )}
              </div>

              <div className="space-y-2">
                {typeof order.user === "object" && order.user ? (
                  <>
                    <div>
                      <span className="font-medium">{order.user.name}</span>
                      {order.user.isGuest && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          Guest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      <a
                        href={`mailto:${order.user.email}`}
                        className="hover:underline"
                      >
                        {order.user.email}
                      </a>
                    </div>
                    {(order.user.phone || (order.user as any).phoneNumber) && (
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="mr-2 text-gray-400" />
                        <a
                          href={`tel:${order.user.phone || (order.user as any).phoneNumber}`}
                          className="hover:underline"
                        >
                          {order.user.phone || (order.user as any).phoneNumber}
                        </a>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Customer since {formatShortDate(order.user.createdAt)}
                    </div>
                  </>
                ) : order.shippingAddress.email ? (
                  <>
                    <div>
                      <span className="font-medium">
                        {order.shippingAddress.fullName || "Guest Customer"}
                      </span>
                      <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        Guest
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      <a
                        href={`mailto:${order.shippingAddress.email}`}
                        className="hover:underline"
                      >
                        {order.shippingAddress.email}
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">
                    Customer information not available
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" /> Shipping
                Address
              </h2>
              <div>
                <p className="font-medium">
                  {order.shippingAddress.fullName || "Customer"}
                </p>
                <p>
                  {order.shippingAddress.address ||
                    order.shippingAddress.street}
                </p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-1 flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    <a
                      href={`tel:${order.shippingAddress.phone}`}
                      className="hover:underline"
                    >
                      {order.shippingAddress.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Billing Address */}
            {order.billingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" /> Billing
                  Address
                </h2>
                <div>
                  <p className="font-medium">{order.billingAddress.fullName}</p>
                  <p>{order.billingAddress.address}</p>
                  {order.billingAddress.address2 && (
                    <p>{order.billingAddress.address2}</p>
                  )}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.state}{" "}
                    {order.billingAddress.postalCode}
                  </p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaDollarSign className="mr-2 text-blue-600" /> Payment
                Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-gray-600">Method:</div>
                  <div>{order.paymentMethod}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-gray-600">Status:</div>
                  <div
                    className={`font-medium ${
                      order.isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Payment Pending"}
                    {order.paidAt && ` on ${formatShortDate(order.paidAt)}`}
                  </div>
                </div>
                {order.paymentResult && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <div className="text-sm font-medium mb-1">
                        Payment Details:
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        {order.paymentResult.id && (
                          <>
                            <div className="text-gray-600">Transaction ID:</div>
                            <div className="font-mono">
                              {order.paymentResult.id}
                            </div>
                          </>
                        )}
                        {order.paymentResult.status && (
                          <>
                            <div className="text-gray-600">Status:</div>
                            <div>{order.paymentResult.status}</div>
                          </>
                        )}
                        {order.paymentResult.update_time && (
                          <>
                            <div className="text-gray-600">Update Time:</div>
                            <div>
                              {new Date(
                                order.paymentResult.update_time
                              ).toLocaleString()}
                            </div>
                          </>
                        )}
                        {order.paymentResult.email_address && (
                          <>
                            <div className="text-gray-600">Email:</div>
                            <div>{order.paymentResult.email_address}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tags and Notes (Admin-only) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaTag className="mr-2 text-blue-600" /> Admin Notes
              </h2>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="adminNotes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes (Internal Only)
                  </label>
                  <textarea
                    id="adminNotes"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                    rows={3}
                    placeholder="Add notes about this order (not visible to customer)"
                    defaultValue={order.adminNotes || ""}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
