import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaChartLine,
  FaTag,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { getAllOrders } from "../../services/orderService";
import { getProducts } from "../../services/productService";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: JSX.Element;
  color: string;
}

interface RecentOrder {
  _id: string;
  createdAt: string;
  user: {
    name: string;
  };
  totalAmount: number;
  status: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataLastUpdated, setDataLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/admin" } } });
      return;
    }

    const user = getCurrentUser();
    if (!user?.isAdmin) {
      // If not admin, redirect to home page
      navigate("/");
      return;
    }

    // Fetch data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get orders data with Promise.all for parallel API calls
        const [ordersData, productsData] = await Promise.all([
          getAllOrders(),
          getProducts(),
        ]);

        // Process order data for analytics
        const completedOrders = ordersData.filter(
          (order: any) => order.isPaid && !order.isRefunded
        );

        // Calculate dashboard stats from real data
        const totalSales = completedOrders
          .reduce((sum: number, order: any) => sum + order.totalAmount, 0)
          .toFixed(2);

        const orderCount = ordersData.length;
        const productCount = productsData.length;

        // Calculate unique customers
        const customerIds = new Set(
          ordersData.map((order: any) =>
            order.user && typeof order.user === "object"
              ? order.user._id
              : order.user
          )
        );
        const customerCount = customerIds.size;

        // Calculate additional metrics
        const paidOrders = ordersData.filter((order: any) => order.isPaid);
        const paidOrdersCount = paidOrders.length;
        const conversionRate =
          orderCount > 0
            ? ((paidOrdersCount / orderCount) * 100).toFixed(1)
            : "0";

        // Calculate average order value
        const averageOrderValue =
          paidOrders.length > 0
            ? (
                paidOrders.reduce(
                  (sum: number, order: any) => sum + order.totalAmount,
                  0
                ) / paidOrders.length
              ).toFixed(2)
            : "0";

        // Set dashboard stats
        setStats([
          {
            title: "Total Sales",
            value: `₹${totalSales}`,
            icon: <FaChartLine size={20} />,
            color: "bg-blue-500",
          },
          {
            title: "Orders",
            value: orderCount,
            icon: <FaShoppingCart size={20} />,
            color: "bg-green-500",
          },
          {
            title: "Products",
            value: productCount,
            icon: <FaBoxOpen size={20} />,
            color: "bg-purple-500",
          },
          {
            title: "Customers",
            value: customerCount,
            icon: <FaUsers size={20} />,
            color: "bg-orange-500",
          },
          {
            title: "Conversion Rate",
            value: `${conversionRate}%`,
            icon: <FaTag size={20} />,
            color: "bg-pink-500",
          },
          {
            title: "Avg Order Value",
            value: `₹${averageOrderValue}`,
            icon: <FaChartLine size={20} />,
            color: "bg-indigo-500",
          },
        ]);

        // Get recent orders (last 5)
        const sortedOrders = [...ordersData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRecentOrders(sortedOrders.slice(0, 5));
        setDataLastUpdated(new Date());
        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error?.response?.data?.message || "Failed to load dashboard data"
        );
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </div>

      {loading ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow mb-6">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Last updated indicator */}
          {dataLastUpdated && (
            <div className="flex justify-end mb-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">Last updated:</span>
                <time dateTime={dataLastUpdated.toISOString()}>
                  {dataLastUpdated.toLocaleTimeString()}
                </time>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-3 text-blue-600 hover:text-blue-800 flex items-center"
                  title="Refresh data"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex items-center">
                  <div
                    className={`rounded-full p-4 mr-4 ${stat.color} text-white`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Orders
                </h2>
                <Link
                  to="/admin/orders"
                  className="text-blue-600 hover:text-blue-800"
                >
                  View All
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders found
                </div>
              ) : (
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
                        Total
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
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #
                            {order._id
                              .substring(order._id.length - 6)
                              .toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.user?.name || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{order.totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FaEye />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/products"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
            >
              <div className="rounded-full p-3 bg-purple-100 text-purple-600 mr-4">
                <FaBoxOpen size={20} />
              </div>
              <div>
                <h3 className="font-medium">Manage Products</h3>
                <p className="text-sm text-gray-600">
                  Add, edit, or remove products
                </p>
              </div>
            </Link>
            <Link
              to="/admin/orders"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
            >
              <div className="rounded-full p-3 bg-green-100 text-green-600 mr-4">
                <FaShoppingCart size={20} />
              </div>
              <div>
                <h3 className="font-medium">Manage Orders</h3>
                <p className="text-sm text-gray-600">
                  View and update order status
                </p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
            >
              <div className="rounded-full p-3 bg-orange-100 text-orange-600 mr-4">
                <FaUsers size={20} />
              </div>
              <div>
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-sm text-gray-600">
                  View and manage user accounts
                </p>
              </div>
            </Link>
          </div>
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;
