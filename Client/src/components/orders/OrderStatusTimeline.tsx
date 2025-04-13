import React from "react";
import { format } from "date-fns";
import {
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaShippingFast,
  FaFileInvoice,
} from "react-icons/fa";
import { StatusHistoryEntry } from "../../types";

interface OrderStatusTimelineProps {
  statusHistory: StatusHistoryEntry[];
  currentStatus: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  statusHistory,
  currentStatus,
}) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy h:mm a");
    } catch (e) {
      return date;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <FaFileInvoice className="text-blue-500" />;
      case "processing":
        return <FaBoxOpen className="text-yellow-500" />;
      case "shipped":
        return <FaTruck className="text-blue-600" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBoxOpen className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-blue-500";
      case "processing":
        return "border-yellow-500";
      case "shipped":
        return "border-blue-600";
      case "delivered":
        return "border-green-500";
      case "cancelled":
        return "border-red-500";
      default:
        return "border-gray-300";
    }
  };

  // Sort history with newest entries first, using date instead of timestamp
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Order Status Timeline</h2>
      <div className="relative">
        <div className="absolute left-6 top-0 h-full border-l-2 border-gray-200 z-0"></div>

        <div className="space-y-6 relative z-10">
          {sortedHistory.map((entry, index) => (
            <div key={index} className="flex items-start">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 ${getStatusColor(
                  entry.status
                )} z-10`}
              >
                {getStatusIcon(entry.status)}
              </div>
              <div className="flex-1 ml-4 bg-gray-50 rounded-lg p-3">
                <div className="font-medium">
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(entry.date)}
                </div>
                {entry.note && (
                  <div className="mt-1 text-sm text-gray-700 bg-gray-100 p-2 rounded">
                    {entry.note}
                  </div>
                )}
                {entry.updatedBy && (
                  <div className="text-xs text-gray-500 mt-1">
                    Updated by: {entry.updatedBy.name}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add current status if not in history */}
          {sortedHistory.length === 0 && (
            <div className="flex items-start">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 ${getStatusColor(
                  currentStatus
                )} z-10`}
              >
                {getStatusIcon(currentStatus)}
              </div>
              <div className="flex-1 ml-4 bg-gray-50 rounded-lg p-3">
                <div className="font-medium">
                  {currentStatus.charAt(0).toUpperCase() +
                    currentStatus.slice(1)}
                </div>
                <div className="text-sm text-gray-500">Current Status</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
