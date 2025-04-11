import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaAddressCard,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserShield,
  FaHistory,
  FaLock,
  FaTachometerAlt,
  FaCalendarAlt,
  FaClock,
  FaBell,
  FaShoppingBag,
  FaChartLine,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaPen,
  FaStar,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
  updateUserProfile,
  getUserProfile,
} from "../../services/authService";
import { format } from "date-fns";
import { getUserOrders } from "../../services/orderService";
import { getWishlistItems } from "../../services/wishlistService";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
  lastLogin?: string;
  enable2FA?: boolean;
  phoneNumber?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  addresses?: Address[];
}

interface Address {
  id: string;
  type: string;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  enable2FA: boolean;
  phoneNumber: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
    enable2FA: false,
    phoneNumber: "",
    notificationPreferences: {
      email: true,
      push: false,
      sms: false,
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/account/profile" } } });
      return;
    }

    // Fetch complete user data from API
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfile();
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin,
          enable2FA: userData.enable2FA,
          phoneNumber: userData.phoneNumber,
          notificationPreferences: userData.notificationPreferences,
          addresses: userData.addresses,
        });

        setFormData({
          name: userData.name,
          email: userData.email,
          password: "",
          confirmPassword: "",
          address: userData.address || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "US",
          },
          enable2FA: userData.enable2FA || false,
          phoneNumber: userData.phoneNumber || "",
          notificationPreferences: userData.notificationPreferences || {
            email: true,
            push: false,
            sms: false,
          },
        });

        // Fetch user orders
        const fetchedOrders = await getUserOrders(userData._id);
        setOrders(fetchedOrders);

        // Fetch wishlist items
        const fetchedWishlistItems = await getWishlistItems(userData._id);
        setWishlistItems(fetchedWishlistItems);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match if both are provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      setLoading(false);
      return;
    }

    try {
      // Prepare data for update - only include password if it was changed
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        enable2FA: formData.enable2FA,
        phoneNumber: formData.phoneNumber,
        notificationPreferences: formData.notificationPreferences,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      // Update user profile via API
      const updatedUser = await updateUserProfile(updateData);

      // Update local state with the response
      setUser({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        enable2FA: updatedUser.enable2FA,
        phoneNumber: updatedUser.phoneNumber,
        notificationPreferences: updatedUser.notificationPreferences,
        addresses: updatedUser.addresses,
      });

      setMessage({ text: "Profile updated successfully", type: "success" });
    } catch (err) {
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "Failed to update profile. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>

        {user && (
          <div
            className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${
              user.isAdmin ? "border-l-4 border-blue-500" : ""
            }`}
          >
            <div className="flex items-center mb-4">
              <div
                className={`w-16 h-16 ${
                  user.isAdmin
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                } rounded-full flex items-center justify-center text-2xl mr-4`}
              >
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

            <div className="flex flex-wrap items-center text-sm text-gray-600 mt-4">
              <div className="flex items-center mr-6 mb-2">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                <span>Account Created: {formatDate(user.createdAt)}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center mb-2">
                  <FaClock className="mr-2 text-gray-400" />
                  <span>Last Login: {formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>

            {user.isAdmin && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-blue-800 mb-3">
                  Admin Quick Access
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/admin"
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center text-sm"
                  >
                    <FaTachometerAlt className="mr-2" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center text-sm"
                  >
                    <FaClipboardList className="mr-2" /> Orders
                  </Link>
                  <Link
                    to="/admin/products"
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center text-sm"
                  >
                    <FaShieldAlt className="mr-2" /> Products
                  </Link>
                  <Link
                    to="/admin/users"
                    className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center text-sm"
                  >
                    <FaUserShield className="mr-2" /> Users
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`block w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "overview"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaChartLine className="inline-block mr-2" />
                      Account Overview
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`block w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "profile"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaUser className="inline-block mr-2" />
                      Profile Information
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`block w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "security"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaLock className="inline-block mr-2" />
                      Security Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`block w-full text-left px-4 py-2 rounded-md ${
                        activeTab === "notifications"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FaBell className="inline-block mr-2" />
                      Notifications
                    </button>
                  </li>
                  <li>
                    <Link
                      to="/account/orders"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FaClipboardList className="inline-block mr-2" />
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/account/addresses"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FaAddressCard className="inline-block mr-2" />
                      Addresses
                    </Link>
                  </li>
                  {user?.isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 rounded-md text-blue-700 hover:bg-blue-50 font-medium"
                      >
                        <FaUserShield className="inline-block mr-2" />
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt className="inline-block mr-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {message && (
                <div
                  className={`mb-6 p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Account Overview</h2>
                    </div>

                    {/* Account Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-full text-blue-600 mr-3">
                            <FaClipboardList size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Total Orders
                            </p>
                            <p className="text-xl font-bold">{orders.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-start">
                          <div className="bg-green-100 p-2 rounded-full text-green-600 mr-3">
                            <FaAddressCard size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Saved Addresses
                            </p>
                            <p className="text-xl font-bold">
                              {user?.addresses?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-start">
                          <div className="bg-purple-100 p-2 rounded-full text-purple-600 mr-3">
                            <FaShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Wishlist Items
                            </p>
                            <p className="text-xl font-bold">
                              {wishlistItems.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mb-8">
                      <h3 className="text-md font-medium text-gray-700 mb-3">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                          to="/account/orders"
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center">
                            <FaClipboardList
                              className="text-blue-600 mb-2"
                              size={18}
                            />
                            <span className="text-sm">View Orders</span>
                          </div>
                        </Link>
                        <Link
                          to="/account/profile"
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center">
                            <FaUser className="text-blue-600 mb-2" size={18} />
                            <span className="text-sm">Edit Profile</span>
                          </div>
                        </Link>
                        <Link
                          to="/account/addresses"
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center">
                            <FaMapMarkerAlt
                              className="text-blue-600 mb-2"
                              size={18}
                            />
                            <span className="text-sm">Manage Addresses</span>
                          </div>
                        </Link>
                        <Link
                          to="/account/wishlist"
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center">
                            <FaStar className="text-blue-600 mb-2" size={18} />
                            <span className="text-sm">My Wishlist</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Recent Orders</h3>
                        {orders.length > 0 && (
                          <Link
                            to="/account/orders"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View All
                          </Link>
                        )}
                      </div>

                      {orders.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Order #
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {orders.slice(0, 3).map((order) => (
                                  <tr
                                    key={order._id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                      #
                                      {order._id
                                        .substring(
                                          order._id.length - 8,
                                          order._id.length
                                        )
                                        .toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {format(
                                        new Date(order.createdAt),
                                        "MMM d, yyyy"
                                      )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          order.status === "delivered"
                                            ? "bg-green-100 text-green-800"
                                            : order.status === "shipped"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {order.status.charAt(0).toUpperCase() +
                                          order.status.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      $
                                      {order.totalAmount?.toFixed(2) ||
                                        order.total?.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                      <Link
                                        to={`/account/orders/${order._id}`}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        View
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-gray-600 mb-4">
                            You haven't placed any orders yet.
                          </p>
                          <Link
                            to="/products"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Account Details Summary */}
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Contact Information
                          </h4>
                          <div className="bg-white p-4 border border-gray-200 rounded-lg">
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-gray-600">{user?.email}</p>
                            <p className="text-gray-600">
                              {user?.phoneNumber || "No phone number added"}
                            </p>
                            <Link
                              to="/account/profile"
                              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                            >
                              Edit{" "}
                              <span className="sr-only">
                                contact information
                              </span>
                            </Link>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Default Shipping Address
                          </h4>
                          {user?.addresses?.find(
                            (address) => address.isDefault
                          ) ? (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg">
                              <p className="font-medium">Shipping Address</p>
                              <p className="text-gray-600">
                                {
                                  user.addresses.find(
                                    (address) => address.isDefault
                                  )?.street
                                }
                              </p>
                              <p className="text-gray-600">
                                {
                                  user.addresses.find(
                                    (address) => address.isDefault
                                  )?.city
                                }
                                ,{" "}
                                {
                                  user.addresses.find(
                                    (address) => address.isDefault
                                  )?.state
                                }{" "}
                                {
                                  user.addresses.find(
                                    (address) => address.isDefault
                                  )?.postalCode
                                }
                              </p>
                              <p className="text-gray-600">
                                {
                                  user.addresses.find(
                                    (address) => address.isDefault
                                  )?.country
                                }
                              </p>
                              <Link
                                to="/account/addresses"
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                              >
                                Manage{" "}
                                <span className="sr-only">addresses</span>
                              </Link>
                            </div>
                          ) : (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg flex items-center justify-center h-full">
                              <div className="text-center">
                                <p className="text-gray-600 mb-2">
                                  No default shipping address set
                                </p>
                                <Link
                                  to="/account/addresses"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Add Address
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Profile Information Tab */}
                {activeTab === "profile" && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Profile Information</h2>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="(123) 456-7890"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div>
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">
                        Default Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="address.street"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="address.street"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="address.city"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            City
                          </label>
                          <input
                            type="text"
                            id="address.city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="address.state"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            State / Province
                          </label>
                          <input
                            type="text"
                            id="address.state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="address.postalCode"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Postal / ZIP Code
                          </label>
                          <input
                            type="text"
                            id="address.postalCode"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="address.country"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Country
                          </label>
                          <select
                            id="address.country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="IN">India</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Security Settings Tab */}
                {activeTab === "security" && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">Security Settings</h2>
                    </div>

                    {/* Password Section */}
                    <div>
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">
                        Change Password
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Leave blank to keep current password
                          </p>
                        </div>
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication Section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-start mt-4">
                        <div className="flex items-center h-5">
                          <input
                            id="enable2FA"
                            name="enable2FA"
                            type="checkbox"
                            checked={formData.enable2FA}
                            onChange={handleCheckboxChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="enable2FA"
                            className="font-medium text-gray-700"
                          >
                            Enable Two-Factor Authentication
                          </label>
                          <p className="text-gray-500">
                            Add an extra layer of security to your account by
                            requiring both a password and a verification code.
                          </p>
                        </div>
                      </div>
                      {formData.enable2FA && (
                        <div className="mt-4 ml-7 p-4 bg-blue-50 rounded-md text-sm">
                          <p className="font-medium text-blue-800 mb-2">
                            Two-Factor Authentication is enabled
                          </p>
                          <p className="text-blue-700 mb-2">
                            You'll be asked for a verification code sent to your
                            phone when signing in from a new device or browser.
                          </p>
                          <p className="text-blue-700">
                            Make sure your phone number is up-to-date in your
                            profile.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin-only security settings */}
                    {user?.isAdmin && (
                      <div className="mt-8 border-t-2 border-blue-100 pt-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-blue-800 mb-2">
                            Admin Security Settings
                          </h3>
                          <p className="text-blue-700 text-sm mb-4">
                            Enhanced security options are available for
                            administrator accounts.
                          </p>
                          <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                              <input
                                id="adminNotify"
                                name="adminNotify"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="adminNotify"
                                className="font-medium text-blue-700"
                              >
                                Notify on Admin Login Attempts
                              </label>
                              <p className="text-blue-600">
                                Receive email notifications when someone
                                attempts to log in to your admin account.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                              <input
                                id="ipRestriction"
                                name="ipRestriction"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="ipRestriction"
                                className="font-medium text-blue-700"
                              >
                                IP Address Restriction
                              </label>
                              <p className="text-blue-600">
                                Restrict admin login to specific IP addresses
                                for enhanced security.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold">
                        Notification Preferences
                      </h2>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="notificationPreferences.email"
                            name="notificationPreferences.email"
                            type="checkbox"
                            checked={formData.notificationPreferences.email}
                            onChange={handleCheckboxChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="notificationPreferences.email"
                            className="font-medium text-gray-700"
                          >
                            Email Notifications
                          </label>
                          <p className="text-gray-500">
                            Receive order updates, shipping notifications, and
                            promotional offers via email.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="notificationPreferences.push"
                            name="notificationPreferences.push"
                            type="checkbox"
                            checked={formData.notificationPreferences.push}
                            onChange={handleCheckboxChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="notificationPreferences.push"
                            className="font-medium text-gray-700"
                          >
                            Push Notifications
                          </label>
                          <p className="text-gray-500">
                            Receive notifications directly to your browser about
                            orders and account activity.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="notificationPreferences.sms"
                            name="notificationPreferences.sms"
                            type="checkbox"
                            checked={formData.notificationPreferences.sms}
                            onChange={handleCheckboxChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="notificationPreferences.sms"
                            className="font-medium text-gray-700"
                          >
                            SMS Notifications
                          </label>
                          <p className="text-gray-500">
                            Receive text messages for important updates about
                            your orders.
                          </p>
                        </div>
                      </div>

                      {user?.isAdmin && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-medium text-blue-800 mb-3">
                            Admin Notifications
                          </h3>

                          <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                              <input
                                id="adminOrderNotify"
                                name="adminOrderNotify"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="adminOrderNotify"
                                className="font-medium text-blue-700"
                              >
                                New Order Notifications
                              </label>
                              <p className="text-blue-600">
                                Receive notifications when new orders are
                                placed.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                              <input
                                id="adminUserNotify"
                                name="adminUserNotify"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="adminUserNotify"
                                className="font-medium text-blue-700"
                              >
                                New User Registration Notifications
                              </label>
                              <p className="text-blue-600">
                                Receive notifications when new users register on
                                the platform.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start mt-4">
                            <div className="flex items-center h-5">
                              <input
                                id="adminInventoryNotify"
                                name="adminInventoryNotify"
                                type="checkbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                defaultChecked
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="adminInventoryNotify"
                                className="font-medium text-blue-700"
                              >
                                Low Inventory Alerts
                              </label>
                              <p className="text-blue-600">
                                Receive alerts when product inventory falls
                                below threshold.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                      user?.isAdmin
                        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">
                          ⚪
                        </span>
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
