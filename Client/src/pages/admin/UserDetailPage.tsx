import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaEdit,
  FaTrash,
  FaKey,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";
import {
  getUserById,
  updateUserRole,
  deleteUser,
} from "../../services/userService";
import { getUserOrders } from "../../services/orderService";
import { isAuthenticated, getCurrentUser } from "../../services/authService";

interface UserAddress {
  fullName: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string; // Server returns this field
  isAdmin: boolean;
  isGuest: boolean;
  addresses?: UserAddress[];
  createdAt: string;
  updatedAt: string;
}

const AdminUserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    // Check if admin is logged in
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: `/admin/users/${id}` } },
      });
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser?.isAdmin) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      if (!id) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch user details
        const userData = await getUserById(id);
        setUser(userData);

        // Fetch user orders
        try {
          const ordersData = await getUserOrders(id);
          setUserOrders(ordersData);
        } catch (err) {
          console.error("Error fetching user orders:", err);
          // Don't set error here, we can still show user data without orders
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        let errorMessage = "Failed to load user details. Please try again.";

        if (err.response) {
          const statusCode = err.response.status;
          if (statusCode === 404) {
            errorMessage = "User not found.";
          } else if (statusCode === 401) {
            errorMessage = "You're not authorized to view this user.";
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

    fetchUserData();
  }, [id, navigate]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleRoleUpdate = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      // Toggle isAdmin status
      const newRole = !user.isAdmin;
      await updateUserRole(user._id, newRole);

      // Update local state
      setUser({
        ...user,
        isAdmin: newRole,
      });

      setShowRoleModal(false);
      setProcessing(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      await deleteUser(user._id);
      setShowDeleteModal(false);
      setProcessing(false);
      navigate("/admin/users", {
        state: { message: "User deleted successfully" },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
      setProcessing(false);
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || "User not found"}</p>
            <Link
              to="/admin/users"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              &larr; Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Role Update Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {user.isAdmin ? "Remove Admin Role" : "Grant Admin Role"}
            </h2>

            <p className="mb-4 text-gray-700">
              {user.isAdmin
                ? `Are you sure you want to remove admin privileges from ${user.name}?`
                : `Are you sure you want to grant admin privileges to ${user.name}?`}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleRoleUpdate}
                className={`px-4 py-2 ${
                  user.isAdmin
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-md flex items-center`}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : user.isAdmin ? (
                  "Remove Admin Role"
                ) : (
                  "Grant Admin Role"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete User</h2>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the user account for{" "}
              <span className="font-semibold">{user.name}</span>? This action
              cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* User Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <Link
              to="/admin/users"
              className="inline-flex items-center text-blue-600 hover:underline mb-4"
            >
              <FaArrowLeft className="mr-2" /> Back to Users
            </Link>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-3">{user.name}</h1>
              {user.isAdmin && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Admin
                </span>
              )}
              {user.isGuest && (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded ml-2">
                  Guest
                </span>
              )}
            </div>
            <p className="text-gray-600">
              User since {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowRoleModal(true)}
              className={`flex items-center ${
                user.isAdmin
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              } px-3 py-2 rounded`}
            >
              <FaKey className="mr-2" />
              {user.isAdmin ? "Remove Admin Role" : "Make Admin"}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center bg-red-100 text-red-800 px-3 py-2 rounded hover:bg-red-200"
            >
              <FaTrash className="mr-2" /> Delete User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaShoppingBag className="mr-2 text-blue-600" /> Orders
              </h2>

              {userOrders.length > 0 ? (
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
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #
                            {order._id
                              .substring(order._id.length - 6)
                              .toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ₹{order.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/admin/orders/${order._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  This user has no orders.
                </div>
              )}
            </div>

            {/* User Addresses */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-600" /> Saved
                  Addresses
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <p className="font-medium">{address.fullName}</p>
                      <p>{address.address}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && (
                        <p className="mt-1">
                          <FaPhone
                            className="inline mr-1 text-gray-400"
                            size={14}
                          />
                          {address.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" /> User Information
              </h2>

              <div className="space-y-4">
                <div className="border-b pb-2">
                  <div className="text-gray-500 text-sm">Full Name</div>
                  <div>{user.name}</div>
                </div>

                <div className="border-b pb-2">
                  <div className="text-gray-500 text-sm">Email Address</div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-2" size={14} />
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.email}
                    </a>
                  </div>
                </div>

                {(user.phone || user.phoneNumber) && (
                  <div className="border-b pb-2">
                    <div className="text-gray-500 text-sm">Phone Number</div>
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-2" size={14} />
                      <a
                        href={`tel:${user.phone || user.phoneNumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.phone || user.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                <div className="border-b pb-2">
                  <div className="text-gray-500 text-sm">Account Type</div>
                  <div className="flex items-center">
                    <FaIdCard className="text-gray-400 mr-2" size={14} />
                    {user.isGuest ? "Guest" : "Registered User"}
                  </div>
                </div>

                <div className="border-b pb-2">
                  <div className="text-gray-500 text-sm">Admin Status</div>
                  <div className="flex items-center">
                    {user.isAdmin ? (
                      <>
                        <FaCheck className="text-green-500 mr-2" size={14} />
                        <span className="text-green-600">Admin</span>
                      </>
                    ) : (
                      <>
                        <FaTimes className="text-red-500 mr-2" size={14} />
                        <span className="text-gray-600">Regular User</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 text-sm">Registration Date</div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" size={14} />
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Account Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  className="w-full flex items-center justify-center bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                >
                  <FaEdit className="mr-2" /> Edit User Details
                </button>

                <button
                  onClick={() => setShowRoleModal(true)}
                  className={`w-full flex items-center justify-center ${
                    user.isAdmin
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  } px-4 py-2 rounded`}
                >
                  <FaKey className="mr-2" />
                  {user.isAdmin ? "Remove Admin Role" : "Make Admin"}
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200"
                >
                  <FaTrash className="mr-2" /> Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
