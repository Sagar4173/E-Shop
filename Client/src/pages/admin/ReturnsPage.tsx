import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaExchangeAlt,
  FaEye,
  FaFilter,
  FaImage,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import { getAllReturns, updateReturnStatus } from "../../services/orderService";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "../../services/authService";
import { format } from "date-fns";

// Types for return data
interface ReturnItem {
  _id: string;
  orderItem: string;
  quantity: number;
  reason: string;
  otherReason?: string;
  status: string;
  comments?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReturnData {
  _id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  returnItems: ReturnItem[];
  refundMethod: string;
  isInternational: boolean;
  additionalNotes?: string;
  createdAt: string;
}

const ReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<ReturnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnData | null>(null);
  const [selectedReturnItem, setSelectedReturnItem] =
    useState<ReturnItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: "/admin/returns" } } });
      return;
    }

    const user = getCurrentUser();
    if (!user?.isAdmin) {
      // If not admin, redirect to home page
      navigate("/");
      return;
    }

    // Fetch all returns
    fetchReturns();
  }, [navigate]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReturns();
      setReturns(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch returns");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    returnItemId: string,
    newStatus: string,
    comments?: string
  ) => {
    try {
      await updateReturnStatus(returnItemId, newStatus, comments);

      // Update the local state
      setReturns((prevReturns) =>
        prevReturns.map((returnData) => ({
          ...returnData,
          returnItems: returnData.returnItems.map((item) =>
            item._id === returnItemId
              ? {
                  ...item,
                  status: newStatus,
                  comments: comments || item.comments,
                }
              : item
          ),
        }))
      );

      // Close the modal and show success message
      setIsModalOpen(false);
      setSelectedReturnItem(null);
      setUpdateMessage(`Return status updated to ${newStatus}`);

      // Hide message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update return status");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  // Filter returns based on status
  const filteredReturns =
    statusFilter === "all"
      ? returns
      : returns.filter((returnData) =>
          returnData.returnItems.some((item) => item.status === statusFilter)
        );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/admin" className="text-blue-600 hover:underline mr-4">
            <FaArrowLeft className="inline-block mr-2" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Manage Returns</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
        >
          <FaTimes className="mr-2" /> Logout
        </button>
      </div>

      {updateMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <FaCheck className="text-green-500 mr-2" />
            <p className="text-green-700">{updateMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <FaTimes className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filter options */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <FaFilter className="mr-2" /> Filter Returns
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            key="filter-all"
            className={`px-4 py-2 rounded-full ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            key="filter-pending"
            className={`px-4 py-2 rounded-full ${
              statusFilter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            key="filter-approved"
            className={`px-4 py-2 rounded-full ${
              statusFilter === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved
          </button>
          <button
            key="filter-completed"
            className={`px-4 py-2 rounded-full ${
              statusFilter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </button>
          <button
            key="filter-rejected"
            className={`px-4 py-2 rounded-full ${
              statusFilter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FaExchangeAlt className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">
            No returns found
          </h2>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "There are no return requests at the moment."
              : `There are no return requests with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReturns.map((returnData) => (
            <div
              key={returnData._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">
                    Return for Order #{returnData.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customer:{" "}
                    {returnData.customer ? returnData.customer.name : "Guest"}(
                    {returnData.customer
                      ? returnData.customer.email
                      : "No email"}
                    )
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted: {formatDate(returnData.createdAt)}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() =>
                      selectedReturn === returnData
                        ? setSelectedReturn(null)
                        : setSelectedReturn(returnData)
                    }
                    className={`flex items-center px-4 py-2 rounded-md ${
                      selectedReturn === returnData
                        ? "bg-gray-200 text-gray-800"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <FaEye className="mr-2" />
                    {selectedReturn === returnData
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </div>
              </div>

              {selectedReturn === returnData && (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Return Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="mb-1">
                        <strong>Refund Method:</strong>{" "}
                        {returnData.refundMethod === "original"
                          ? "Original Payment Method"
                          : "Store Credit (+10% bonus)"}
                      </p>
                      <p className="mb-1">
                        <strong>International Return:</strong>{" "}
                        {returnData.isInternational ? "Yes" : "No"}
                      </p>
                      {returnData.additionalNotes && (
                        <div className="mt-2">
                          <strong>Additional Notes:</strong>
                          <p className="text-gray-700 mt-1 bg-white p-3 border border-gray-200 rounded">
                            {returnData.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Return Items</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Photos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {returnData.returnItems.map((item) => (
                            <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.orderItem}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.quantity}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {item.reason === "other" && item.otherReason
                                    ? item.otherReason
                                    : item.reason.replace(/_/g, " ")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status.charAt(0).toUpperCase() +
                                    item.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item.photos && item.photos.length > 0 ? (
                                  <div className="flex items-center">
                                    <FaImage className="text-blue-500 mr-1" />
                                    <span className="text-sm text-gray-900">
                                      {item.photos.length} photos
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    No photos
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedReturnItem(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  disabled={
                                    item.status === "completed" ||
                                    item.status === "rejected"
                                  }
                                >
                                  Update Status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Return Status Update Modal */}
      {isModalOpen && selectedReturnItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Return Status</h2>
            <p className="text-gray-600 mb-4">
              Current status:{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  selectedReturnItem.status
                )}`}
              >
                {selectedReturnItem.status.charAt(0).toUpperCase() +
                  selectedReturnItem.status.slice(1)}
              </span>
            </p>

            {/* More robust photo handling to prevent errors */}
            {selectedReturnItem &&
            selectedReturnItem.photos &&
            Array.isArray(selectedReturnItem.photos) &&
            selectedReturnItem.photos.length > 0 ? (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Return Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReturnItem.photos.map((photo, index) => (
                    <a
                      key={`photo-${selectedReturnItem._id}-${index}`}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={photo}
                        alt={`Return photo ${index + 1}`}
                        className="h-32 w-full object-cover rounded"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-4">
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comments (optional)
              </label>
              <textarea
                id="comments"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                defaultValue={selectedReturnItem.comments || ""}
              />
            </div>

            <div className="flex justify-between space-x-4 mb-4">
              <button
                onClick={() => {
                  const commentsElement = document.getElementById(
                    "comments"
                  ) as HTMLTextAreaElement;
                  handleStatusUpdate(
                    selectedReturnItem._id,
                    "approved",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturnItem.status !== "pending"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturnItem.status !== "pending"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <FaCheck className="mr-2" /> Approve
              </button>
              <button
                onClick={() => {
                  const commentsElement = document.getElementById(
                    "comments"
                  ) as HTMLTextAreaElement;
                  handleStatusUpdate(
                    selectedReturnItem._id,
                    "completed",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturnItem.status !== "approved"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturnItem.status !== "approved"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <FaCheck className="mr-2" /> Complete
              </button>
              <button
                onClick={() => {
                  const commentsElement = document.getElementById(
                    "comments"
                  ) as HTMLTextAreaElement;
                  handleStatusUpdate(
                    selectedReturnItem._id,
                    "rejected",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturnItem.status !== "pending"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturnItem.status !== "pending"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <FaTimes className="mr-2" /> Reject
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ReturnsPage;
