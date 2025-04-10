import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaAddressCard,
  FaSignOutAlt,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { User } from "../../types";

const AccountPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/account" } } });
      return;
    }

    // Get user data
    const userData = getCurrentUser();
    if (userData) {
      setUser({
        _id: userData._id, // Changed from 'id' to '_id' to match the User interface
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
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
                  className="flex items-center px-4 py-3 text-gray-900 bg-gray-100 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Account Overview</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
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
              <h2 className="text-2xl font-semibold mb-4">Account Overview</h2>

              {/* Recent Orders Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Orders</h3>
                  <Link
                    to="/account/orders"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <div className="p-8 text-center text-gray-500">
                    <p>No recent orders found</p>
                    <Link
                      to="/products"
                      className="mt-2 inline-block text-blue-600 hover:underline"
                    >
                      Browse products
                    </Link>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Account Information
                </h3>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {user?.name || "N/A"}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      {user?.email || "N/A"}
                    </dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Account Created
                    </dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      April 10, 2025
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
