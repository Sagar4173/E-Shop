import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaSignOutAlt,
  FaHome,
  FaBoxOpen,
  FaUsers,
  FaExchangeAlt,
  FaShippingFast,
  FaFileInvoice,
  FaDownload,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import {
  sendOrderStatusUpdateEmail,
  sendShippingNotification,
} from "../../services/email/emailService";
import { format } from "date-fns";
import {
  downloadInvoice,
  previewInvoice,
  emailInvoice,
} from "../../utils/invoiceGenerator";

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  totalAmount: number;
  isPaid: boolean;
  paidAt: string;
  status: string;
  trackingNumber?: string;
  deliveredAt: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  invoiceSent?: boolean;
}

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ordersPerPage] = useState<number>(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [processingInvoices, setProcessingInvoices] = useState<boolean>(false);
  const [progressCount, setProgressCount] = useState<number>(0);
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/admin/orders" } } });
      return;
    }

    const user = getCurrentUser();
    if (!user?.isAdmin) {
      // If not admin, redirect to home page
      navigate("/");
      return;
    }

    // Fetch orders
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
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

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setStatusNote("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setSelectedOrder(null);
    setTrackingNumber("");
    setStatusNote("");
    setShowStatusModal(false);
  };

  const openInvoiceModal = () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order to manage invoices");
      return;
    }
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setProcessingInvoices(false);
    setProgressCount(0);
    setTotalProgress(0);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // If it's a direct change from the dropdown (no modal)
      if (!selectedOrder) {
        // Update order status in database
        await updateOrderStatus(orderId, newStatus);

        // Send email notification about status change
        await sendOrderStatusUpdateEmail(orderId, newStatus);

        // Update the order in the local state
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleStatusSubmit = async () => {
    if (!selectedOrder) return;

    try {
      const newStatus = selectedOrder.status;
      const orderId = selectedOrder._id;
      const data: any = {
        status: newStatus,
        note: statusNote,
      };

      // Add tracking number for shipped status
      if (newStatus === "shipped" && trackingNumber) {
        data.trackingNumber = trackingNumber;
      }

      // Update order status in database
      await updateOrderStatus(orderId, newStatus, data);

      // Send appropriate notification
      if (newStatus === "shipped" && trackingNumber) {
        await sendShippingNotification(orderId, trackingNumber, statusNote);
      } else {
        await sendOrderStatusUpdateEmail(orderId, newStatus, statusNote);
      }

      // Update the order in the local state
      setOrders(
        orders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: newStatus,
                trackingNumber: data.trackingNumber,
              }
            : order
        )
      );

      closeStatusModal();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
      setSelectAll(false);
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleSelectAllOrders = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map((order) => order._id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk invoice operations
  const handleBulkDownloadInvoices = async () => {
    try {
      setProcessingInvoices(true);
      setTotalProgress(selectedOrders.length);
      setProgressCount(0);

      for (let i = 0; i < selectedOrders.length; i++) {
        const orderId = selectedOrders[i];
        const order = orders.find((o) => o._id === orderId);

        if (order) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Add a small delay to avoid browser issues
          downloadInvoice(order);
          setProgressCount(i + 1);
        }
      }

      setSuccessMessage(
        `Successfully downloaded ${selectedOrders.length} invoices`
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      // Keep the modal open to show success message
      setTimeout(() => {
        setProcessingInvoices(false);
      }, 1000);
    } catch (error) {
      console.error("Error in bulk invoice download:", error);
      alert("There was an error downloading some invoices. Please try again.");
      setProcessingInvoices(false);
    }
  };

  const handleBulkEmailInvoices = async () => {
    try {
      setProcessingInvoices(true);
      setTotalProgress(selectedOrders.length);
      setProgressCount(0);
      let successCount = 0;

      for (let i = 0; i < selectedOrders.length; i++) {
        const orderId = selectedOrders[i];
        const order = orders.find((o) => o._id === orderId);

        if (order) {
          const success = await emailInvoice(order);
          if (success) {
            successCount++;

            // Mark order as having invoice sent
            setOrders(
              orders.map((o) =>
                o._id === orderId ? { ...o, invoiceSent: true } : o
              )
            );
          }
          setProgressCount(i + 1);
        }
      }

      setSuccessMessage(
        `Successfully emailed ${successCount} out of ${selectedOrders.length} invoices`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Keep the modal open to show success message
      setTimeout(() => {
        setProcessingInvoices(false);
      }, 1000);
    } catch (error) {
      console.error("Error in bulk invoice emailing:", error);
      alert("There was an error emailing some invoices. Please try again.");
      setProcessingInvoices(false);
    }
  };

  // Filter orders by status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === statusFilter);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Update Order Status: #
              {selectedOrder._id
                .substring(selectedOrder._id.length - 6)
                .toUpperCase()}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className={`w-full border rounded-md py-2 px-3 ${getStatusClass(
                  selectedOrder.status
                )}`}
                value={selectedOrder.status}
                onChange={(e) =>
                  setSelectedOrder({ ...selectedOrder, status: e.target.value })
                }
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {selectedOrder.status === "shipped" && (
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
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (Optional)
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
                onClick={closeStatusModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Management Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              Manage Invoices ({selectedOrders.length} orders selected)
            </h2>

            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <div className="flex">
                  <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}

            {processingInvoices ? (
              <div className="text-center py-4">
                <FaSpinner className="animate-spin text-blue-600 h-8 w-8 mx-auto mb-4" />
                <p className="text-gray-700 mb-2">Processing invoices...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progressCount / totalProgress) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {progressCount} of {totalProgress} completed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaDownload className="text-blue-600 mr-2" /> Download
                    Invoices
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download PDF invoices for the selected orders (will open
                    multiple tabs/downloads)
                  </p>
                  <button
                    onClick={handleBulkDownloadInvoices}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
                  >
                    Download {selectedOrders.length} Invoices
                  </button>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaEnvelope className="text-blue-600 mr-2" /> Email Invoices
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send invoice emails to customers for the selected orders
                  </p>
                  <button
                    onClick={handleBulkEmailInvoices}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
                  >
                    Email {selectedOrders.length} Invoices
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={closeInvoiceModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                  E-Shop
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <FaSignOutAlt className="inline mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
          </div>
          <nav className="mt-4">
            <Link
              to="/admin"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <FaHome className="mr-3" />
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <FaBoxOpen className="mr-3" />
              Products
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center px-6 py-3 bg-gray-100 text-blue-600"
            >
              <FaBoxOpen className="mr-3" />
              Orders
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <FaUsers className="mr-3" />
              Users
            </Link>
            <Link
              to="/admin/returns"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <FaExchangeAlt className="mr-3" />
              Returns
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Orders Management
            </h1>

            {/* Invoice management button */}
            <button
              onClick={openInvoiceModal}
              disabled={selectedOrders.length === 0}
              className={`flex items-center px-4 py-2 rounded ${
                selectedOrders.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FaFileInvoice className="mr-2" />
              Manage Invoices ({selectedOrders.length})
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center">
              <label className="mr-2 text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-8 px-6 py-3">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAllOrders}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Invoice
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                          <tr
                            key={order._id}
                            className={
                              selectedOrders.includes(order._id)
                                ? "bg-blue-50"
                                : ""
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleSelectOrder(order._id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #
                                {order._id
                                  .substring(order._id.length - 6)
                                  .toUpperCase()}
                              </div>
                              {order.trackingNumber && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <FaShippingFast className="mr-1" />
                                  {order.trackingNumber}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.user?.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.user?.email || ""}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-medium px-2 py-1 rounded mb-1 text-center ${getStatusClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                                <button
                                  onClick={() => openStatusModal(order)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Update Status
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {order.invoiceSent ? (
                                <div className="flex items-center text-xs text-green-600">
                                  <FaCheckCircle className="mr-1" />
                                  Sent
                                </div>
                              ) : order.isPaid ? (
                                <div className="flex items-center text-xs text-gray-500">
                                  <FaFileInvoice className="mr-1" />
                                  Ready
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  Not paid
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FaEye className="inline" />
                              </Link>
                              <button
                                onClick={() => {
                                  if (order.isPaid) {
                                    downloadInvoice(order);
                                  } else {
                                    alert(
                                      "Cannot download invoice for unpaid order"
                                    );
                                  }
                                }}
                                className={`text-${
                                  order.isPaid ? "blue" : "gray"
                                }-600 hover:text-${
                                  order.isPaid ? "blue" : "gray"
                                }-900`}
                                disabled={!order.isPaid}
                                title={
                                  order.isPaid
                                    ? "Download Invoice"
                                    : "Order not paid"
                                }
                              >
                                <FaDownload className="inline ml-2" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredOrders.length > ordersPerPage && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="px-4 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
