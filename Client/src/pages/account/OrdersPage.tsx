import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaAddressCard,
  FaSignOutAlt,
  FaEye,
  FaDownload,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { User } from "../../types";
import { getUserOrders } from "../../services/orderService";
import { format } from "date-fns";

// Interface for order data from API
interface Order {
  _id: string;
  orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  hasReturn?: boolean;
  returns?: Array<{
    _id: string;
    status: "pending" | "approved" | "rejected" | "completed";
    reason: string;
    quantity: number;
  }>;
}

const OrdersPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to navigate to order details
  const navigateToOrderDetails = (orderId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on an action button
    if ((event.target as Element).closest("a, button")) {
      return;
    }
    navigate(`/account/orders/${orderId}`);
  };

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/account/orders" } } });
      return;
    }

    // Get user data
    const userData = getCurrentUser();
    if (userData) {
      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      });
    }

    // Fetch orders from API
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders();
        setOrders(data);
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

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get return status badge class
  const getReturnStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get return status icon
  const getReturnStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <FaCheckCircle className="mr-1" />;
      case "pending":
        return <FaClock className="mr-1" />;
      case "rejected":
        return <FaTimesCircle className="mr-1" />;
      case "completed":
        return <FaCheckCircle className="mr-1" />;
      default:
        return null;
    }
  };

  // Format date to display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate total items in an order
  const getTotalItems = (order: Order) => {
    return order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Check if an order is eligible for return
  const isEligibleForReturn = (order: Order) => {
    if (order.status !== "delivered" || !order.deliveredAt) {
      return false;
    }

    const deliveryDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysDiff <= 30;
  };

  // Get latest return status
  const getLatestReturnStatus = (order: Order) => {
    if (!order.returns || order.returns.length === 0) {
      return null;
    }

    // Find the most recent return by sorting (if createdAt is available)
    // For simplicity, we'll just take the first one for now
    return order.returns[0];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>

        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mr-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Navigation */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Account Overview</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center px-4 py-3 text-gray-900 bg-gray-100 rounded-md"
                >
                  <FaClipboardList className="mr-3 text-gray-500" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/account/profile"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaAddressCard className="mr-3 text-gray-500" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaSignOutAlt className="mr-3 text-gray-500" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Account Content */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Order History</h2>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
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
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
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
                      {orders.map((order) => {
                        const returnStatus = getLatestReturnStatus(order);
                        const canReturn =
                          isEligibleForReturn(order) && !order.hasReturn;

                        return (
                          <tr
                            key={order._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={(event) =>
                              navigateToOrderDetails(order._id, event)
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order._id.substring(0, 8).toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {getTotalItems(order)}{" "}
                                {getTotalItems(order) === 1 ? "item" : "items"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                  order.status
                                )}`}
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>

                              {/* Return status badge if a return exists */}
                              {returnStatus && (
                                <div className="mt-1">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReturnStatusClass(
                                      returnStatus.status
                                    )}`}
                                  >
                                    {getReturnStatusIcon(returnStatus.status)}
                                    Return {returnStatus.status}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/account/orders/${order._id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <FaEye className="inline mr-1" size={14} />
                                View
                              </Link>

                              {canReturn && (
                                <Link
                                  to={`/account/orders/${order._id}/return`}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <FaExchangeAlt
                                    className="inline mr-1"
                                    size={14}
                                  />
                                  Return
                                </Link>
                              )}

                              <button className="text-blue-600 hover:text-blue-900">
                                <FaDownload className="inline mr-1" size={14} />
                                Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    You haven't placed any orders yet.
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
