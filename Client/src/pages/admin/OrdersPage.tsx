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
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                          <tr key={order._id}>
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FaEye className="inline" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
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
