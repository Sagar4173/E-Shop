import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaExchangeAlt,
  FaEye,
  FaFileAlt,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
} from "../../services/authService";
import {
  getAllReturns,
  ReturnRequest,
  updateReturnStatus,
} from "../../services/orderService";

// Use ReturnRequest from orderService, but alias it for local use
type ReturnApiData = ReturnRequest & {
  returnId?: string;
  orderDate?: string;
  productName?: string;
  quantity?: number;
  comments?: string;
};

const ReturnsPage: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<ReturnApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnApiData | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

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
      console.log("Fetched returns data:", data);

      if (!data || !Array.isArray(data)) {
        setDebugInfo(`Unexpected data format: ${JSON.stringify(data)}`);
        setReturns([]);
      } else {
        setReturns(data);
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching returns:", err);
      setError(err.message || "Failed to fetch returns");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    returnId: string,
    newStatus: string,
    comments?: string
  ) => {
    try {
      // Extract orderId from the selected return (use returnId or _id)
      const selectedReturnData = returns.find(
        (r) => (r.returnId || r._id) === returnId
      );

      if (!selectedReturnData) {
        throw new Error("Return not found");
      }

      const orderId = selectedReturnData.orderId;

      await updateReturnStatus(orderId, returnId, newStatus, comments);

      // Update the local state
      setReturns((prevReturns) =>
        prevReturns.map((returnData) =>
          (returnData.returnId || returnData._id) === returnId
            ? {
                ...returnData,
                status: newStatus,
                comments: comments || returnData.comments,
              }
            : returnData
        )
      );

      // Close the modal and show success message
      setIsModalOpen(false);
      setSelectedReturn(null);
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

  const navigateToOrderDetails = (orderId: string) => {
    navigate(`/account/orders/${orderId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  // Filter returns based on status with null checks
  const filteredReturns =
    statusFilter === "all"
      ? returns
      : returns.filter((returnData) => returnData?.status === statusFilter);

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

      {debugInfo && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">{debugInfo}</p>
        </div>
      )}

      {/* Filter options */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <FaFilter className="mr-2" /> Filter Returns
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            key="all"
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
            key="pending"
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
            key="approved"
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
            key="completed"
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
            key="rejected"
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
      ) : !Array.isArray(returns) ||
        returns.length === 0 ||
        !Array.isArray(filteredReturns) ||
        filteredReturns.length === 0 ? (
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
              key={returnData.returnId}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">
                    Return for Product: {returnData.productName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customer: {returnData.user?.name || "Guest"}
                    {returnData.user?.email
                      ? ` (${returnData.user.email})`
                      : ""}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted:{" "}
                    {returnData.createdAt
                      ? formatDate(returnData.createdAt)
                      : "Unknown date"}
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
                        <strong>Order ID:</strong> {returnData.orderId}
                      </p>
                      <p className="mb-1">
                        <strong>Order Date:</strong>{" "}
                        {returnData.orderDate
                          ? formatDate(returnData.orderDate)
                          : "N/A"}
                      </p>
                      <p className="mb-1">
                        <strong>Product:</strong> {returnData.productName}
                      </p>
                      <p className="mb-1">
                        <strong>Quantity:</strong> {returnData.quantity}
                      </p>
                      <p className="mb-1">
                        <strong>Reason:</strong>{" "}
                        {returnData.reason === "other" && returnData.otherReason
                          ? returnData.otherReason
                          : (returnData.reason || "Not specified").replace(
                              /_/g,
                              " "
                            )}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            returnData.status
                          )}`}
                        >
                          {returnData.status.charAt(0).toUpperCase() +
                            returnData.status.slice(1)}
                        </span>
                      </p>
                      {returnData.comments && (
                        <div className="mt-2">
                          <strong>Comments:</strong>
                          <p className="text-gray-700 mt-1 bg-white p-3 border border-gray-200 rounded">
                            {returnData.comments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => navigateToOrderDetails(returnData.orderId)}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
                    >
                      <FaFileAlt className="mr-2" /> View Order Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReturn(returnData);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      disabled={
                        returnData.status === "completed" ||
                        returnData.status === "rejected"
                      }
                    >
                      {returnData.status === "completed" ||
                      returnData.status === "rejected"
                        ? "Status Finalized"
                        : "Update Status"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Return Status Update Modal */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Return Status</h2>
            <p className="text-gray-600 mb-4">
              Current status:{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  selectedReturn.status
                )}`}
              >
                {selectedReturn.status.charAt(0).toUpperCase() +
                  selectedReturn.status.slice(1)}
              </span>
            </p>

            {/* Safe photo rendering with multiple guards */}
            {selectedReturn &&
            selectedReturn.photos &&
            Array.isArray(selectedReturn.photos) &&
            selectedReturn.photos.length > 0 ? (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Return Photos</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReturn.photos.map((photo, index) => (
                    <a
                      key={`photo-${index}-${selectedReturn.returnId}`}
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
            ) : (
              <div className="mb-4 text-gray-500 italic">
                No photos available
              </div>
            )}

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
                defaultValue={selectedReturn.comments || ""}
              />
            </div>

            <div className="flex justify-between space-x-4 mb-4">
              <button
                onClick={() => {
                  const commentsElement = document.getElementById(
                    "comments"
                  ) as HTMLTextAreaElement;
                  handleStatusUpdate(
                    selectedReturn.returnId || selectedReturn._id,
                    "approved",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturn.status !== "pending"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturn.status !== "pending"
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
                    selectedReturn.returnId || selectedReturn._id,
                    "completed",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturn.status !== "approved"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturn.status !== "approved"
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
                    selectedReturn.returnId || selectedReturn._id,
                    "rejected",
                    commentsElement?.value
                  );
                }}
                disabled={selectedReturn.status !== "pending"}
                className={`px-4 py-2 rounded-md font-medium flex-1 flex justify-center items-center ${
                  selectedReturn.status !== "pending"
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
