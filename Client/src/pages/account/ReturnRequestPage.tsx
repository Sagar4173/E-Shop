import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExchangeAlt,
  FaExclamationCircle,
  FaInfoCircle,
  FaMoneyBillWave,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import {
  createReturnRequest,
  getOrderById,
  uploadReturnPhotos,
} from "../../services/orderService";
import { Order } from "../../types";

// Interface for return item selection
interface ReturnItemSelection {
  id: string;
  selected: boolean;
  quantity: number;
  reason: string;
  photos: File[];
  orderItemId: string; // Need to store the actual MongoDB _id of the orderItem
}

// Interface for return reasons
type ReturnReason =
  | "damaged"
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "no_longer_needed"
  | "better_price_found"
  | "accidental_order"
  | "other";

// Refund method types
type RefundMethod = "original" | "store_credit";

const returnReasonOptions = [
  { value: "damaged", label: "Item arrived damaged" },
  { value: "defective", label: "Item is defective" },
  { value: "wrong_item", label: "Received wrong item" },
  { value: "not_as_described", label: "Item not as described" },
  { value: "no_longer_needed", label: "No longer needed" },
  { value: "better_price_found", label: "Found better price elsewhere" },
  { value: "accidental_order", label: "Ordered by accident" },
  { value: "other", label: "Other reason" },
];

const RefundMethodOptions = [
  {
    value: "original",
    label: "Original Payment Method",
    description:
      "Refund to your original payment method. Processing time: 5-10 business days.",
    icon: <FaMoneyBillWave className="text-green-500 h-6 w-6" />,
  },
  {
    value: "store_credit",
    label: "Store Credit (+10% bonus)",
    description:
      "Convert your refund to store credit with a 10% bonus value. Processed within 24 hours.",
    icon: <FaExchangeAlt className="text-yellow-500 h-6 w-6" />,
  },
];

const ReturnRequestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State variables
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItemSelection[]>([]);
  const [otherReason, setOtherReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("original");
  const [isInternational, setIsInternational] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) {
        setError("Order ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);

        // Check if order is international based on shipping address country
        const isOrderInternational =
          orderData.shippingAddress.country.toLowerCase() !== "india";

        setIsInternational(isOrderInternational);

        // Initialize return items with all items in the order
        const initialReturnItems = orderData.orderItems.map((item: any) => ({
          id: item.product,
          orderItemId: item._id, // Store the MongoDB _id of the orderItem
          selected: false,
          quantity: 1,
          reason: "damaged",
          photos: [],
        }));

        setReturnItems(initialReturnItems);
        setLoading(false);
      } catch (err) {
        setError("Failed to load order details. Please try again.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Handle return item checkbox toggle
  const handleSelectItem = (itemId: string) => {
    setReturnItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Handle quantity change for a return item
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setReturnItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Handle reason change for a return item
  const handleReasonChange = (itemId: string, reason: string) => {
    setReturnItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, reason: reason } : item
      )
    );
  };

  // Handle photo upload for a return item
  const handlePhotoUpload = (
    itemId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert FileList to Array for easier manipulation
      const filesArray = Array.from(event.target.files);

      setReturnItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, photos: [...item.photos, ...filesArray] }
            : item
        )
      );
    }
  };

  // Handle photo removal
  const handleRemovePhoto = (itemId: string, photoIndex: number) => {
    setReturnItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updatedPhotos = [...item.photos];
          updatedPhotos.splice(photoIndex, 1);
          return { ...item, photos: updatedPhotos };
        }
        return item;
      })
    );
  };

  // Handle refund method change
  const handleRefundMethodChange = (method: RefundMethod) => {
    setRefundMethod(method);
  };

  // Form validation
  const validateForm = () => {
    const selectedItems = returnItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setError("Please select at least one item to return");
      return false;
    }

    // Check if photos are required but missing for certain return reasons
    const itemsMissingPhotos = selectedItems.filter(
      (item) =>
        (item.reason === "damaged" || item.reason === "defective") &&
        item.photos.length === 0
    );

    if (itemsMissingPhotos.length > 0) {
      setError("Please add photos for damaged or defective items");
      return false;
    }

    // All validations passed
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const selectedItems = returnItems.filter((item) => item.selected);

      // Format data for API
      const returnData = {
        returnItems: selectedItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason: item.reason,
          otherReason: item.reason === "other" ? otherReason : undefined,
        })),
        refundMethod,
        additionalNotes,
        isInternational,
      };

      if (!id) {
        throw new Error("Order ID is missing");
      }

      // Create return request first
      const response = await createReturnRequest(id, returnData);

      // Upload photos for each item that has them
      const responseReturnItems = response.returnItems || [];
      const uploadPromises = selectedItems
        .filter((item) => item.photos.length > 0)
        .map(async (item) => {
          // Find the corresponding return item ID from the response
          const returnItemData = responseReturnItems.find(
            (ri) => ri.orderItem === item.orderItemId
          );

          if (returnItemData && returnItemData._id) {
            // Upload photos for this return item
            return uploadReturnPhotos(
              id as string,
              returnItemData._id,
              item.photos
            );
          }
          return null;
        });

      // Wait for all photo uploads to complete
      await Promise.all(uploadPromises);

      setSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to submit return request. Please try again."
      );
      setSubmitting(false);
    }
  };

  // Calculate if the order is within the return window (30 days)
  const isWithinReturnWindow = (orderDate: string): boolean => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const daysDifference = Math.floor(
      (currentTime - orderTime) / (1000 * 60 * 60 * 24)
    );

    return daysDifference <= 30;
  };

  // Calculate remaining days in return window
  const getRemainingDays = (orderDate: string): number => {
    const orderTime = new Date(orderDate).getTime();
    const currentTime = new Date().getTime();
    const daysDifference = Math.floor(
      (currentTime - orderTime) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, 30 - daysDifference);
  };

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error && !order) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <FaExclamationCircle className="text-red-400 h-5 w-5 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <Link
            to="/account/orders"
            className="text-blue-600 hover:underline flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-6">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Return Request Submitted
            </h2>
            <p className="text-gray-700 mb-6">
              We've received your return request and will process it within 1-2
              business days. You'll receive an email with further instructions
              once your request is approved.
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Link
                to="/account/orders"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                View Your Orders
              </Link>
              <Link
                to="/"
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <FaExclamationCircle className="text-yellow-400 h-5 w-5 mr-3" />
              <p className="text-yellow-700">Order not found</p>
            </div>
          </div>
          <Link
            to="/account/orders"
            className="text-blue-600 hover:underline flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  // Check if the order is eligible for return
  const isEligibleForReturn =
    order.status === "delivered" && isWithinReturnWindow(order.createdAt);
  const remainingDays = getRemainingDays(order.createdAt);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/account/orders"
            className="text-blue-600 hover:underline flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold mb-2">Return Request</h1>
          <p className="text-gray-600">
            Order #{order._id.substring(order._id.length - 6).toUpperCase()} •
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* International Order Info */}
        {isInternational && isEligibleForReturn && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <FaInfoCircle className="text-blue-400 h-5 w-5 mr-3 mt-0.5" />
              <div>
                <p className="text-blue-700 font-medium">
                  International Return
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  International returns may take longer to process. Please note
                  that customs fees, import duties, or taxes paid on the
                  original shipment are typically non-refundable.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Return window info */}
        {isEligibleForReturn && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <FaInfoCircle className="text-green-400 h-5 w-5 mr-3 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">
                  Return Window: {remainingDays} days remaining
                </p>
                <p className="text-green-600 text-sm mt-1">
                  You have until{" "}
                  {formatDate(
                    new Date(
                      new Date(order.createdAt).getTime() +
                        30 * 24 * 60 * 60 * 1000
                    ).toISOString()
                  )}{" "}
                  to return items from this order.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Return eligibility warning */}
        {!isEligibleForReturn && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <FaExclamationCircle className="text-red-400 h-5 w-5 mr-3" />
              <div>
                <p className="text-red-700 font-medium">
                  This order is not eligible for return
                </p>
                <p className="text-red-600 text-sm mt-1">
                  {order.status !== "delivered"
                    ? "Only delivered orders can be returned."
                    : "The 30-day return window has expired."}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <FaExclamationCircle className="text-red-400 h-5 w-5 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Items selection section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-medium text-lg">Select Items to Return</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.orderItems.map((item: any) => {
                const returnItem = returnItems.find(
                  (ri) => ri.id === item.product
                );
                if (!returnItem) return null;

                const maxQuantity = item.quantity;
                const isDefectReason =
                  returnItem.reason === "damaged" ||
                  returnItem.reason === "defective" ||
                  returnItem.reason === "wrong_item";

                return (
                  <div key={item.product} className="p-6">
                    <div className="flex flex-col md:flex-row">
                      {/* Checkbox and image */}
                      <div className="flex items-start mb-4 md:mb-0">
                        <input
                          type="checkbox"
                          id={`item-${item.product}`}
                          checked={returnItem.selected}
                          onChange={() => handleSelectItem(item.product)}
                          disabled={!isEligibleForReturn}
                          className="mr-4 mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      </div>

                      {/* Item details */}
                      <div className="md:ml-4 flex-grow">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <p className="text-gray-500 text-sm">
                          ₹{item.price.toFixed(2)} each · Quantity:{" "}
                          {item.quantity}
                        </p>

                        {/* Return options (only show if selected) */}
                        {returnItem.selected && (
                          <div className="mt-4 space-y-4">
                            {/* Quantity select */}
                            <div>
                              <label
                                htmlFor={`qty-${item.product}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Quantity to return:
                              </label>
                              <select
                                id={`qty-${item.product}`}
                                value={returnItem.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.product,
                                    Number(e.target.value)
                                  )
                                }
                                disabled={!isEligibleForReturn}
                                className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              >
                                {[...Array(maxQuantity)].map((_, i) => (
                                  <option key={i} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Reason select */}
                            <div>
                              <label
                                htmlFor={`reason-${item.product}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Reason for return:
                              </label>
                              <select
                                id={`reason-${item.product}`}
                                value={returnItem.reason}
                                onChange={(e) =>
                                  handleReasonChange(
                                    item.product,
                                    e.target.value
                                  )
                                }
                                disabled={!isEligibleForReturn}
                                className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                              >
                                {returnReasonOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Other reason textfield */}
                            {returnItem.reason === "other" && (
                              <div>
                                <label
                                  htmlFor={`other-${item.product}`}
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Please describe the reason:
                                </label>
                                <textarea
                                  id={`other-${item.product}`}
                                  value={otherReason}
                                  onChange={(e) =>
                                    setOtherReason(e.target.value)
                                  }
                                  disabled={!isEligibleForReturn}
                                  rows={2}
                                  className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 w-full"
                                  placeholder="Please provide details"
                                />
                              </div>
                            )}

                            {/* Photo upload section for defective/damaged items */}
                            {isDefectReason && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {returnItem.reason === "damaged"
                                    ? "Upload photos of damage"
                                    : returnItem.reason === "defective"
                                      ? "Upload photos showing defect"
                                      : "Upload photos for verification"}
                                  :
                                </label>
                                <div className="mt-1 flex items-center">
                                  <label
                                    htmlFor={`photo-${item.product}`}
                                    className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                  >
                                    <FaUpload className="inline-block mr-2" />
                                    Upload Photos
                                    <input
                                      id={`photo-${item.product}`}
                                      name={`photo-${item.product}`}
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="sr-only"
                                      onChange={(e) =>
                                        handlePhotoUpload(item.product, e)
                                      }
                                      disabled={!isEligibleForReturn}
                                    />
                                  </label>
                                  {returnItem.photos.length > 0 && (
                                    <span className="ml-4 text-sm text-gray-500">
                                      {returnItem.photos.length} photo(s)
                                      selected
                                    </span>
                                  )}
                                </div>

                                {/* Preview uploaded photos */}
                                {returnItem.photos.length > 0 && (
                                  <div className="mt-4 grid grid-cols-2 gap-2">
                                    {returnItem.photos.map((photo, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={URL.createObjectURL(photo)}
                                          alt={`Photo ${index + 1}`}
                                          className="w-full h-24 object-cover rounded-md"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemovePhoto(
                                              item.product,
                                              index
                                            )
                                          }
                                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        >
                                          <FaTrash className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {isDefectReason &&
                                  returnItem.photos.length === 0 && (
                                    <p className="mt-1 text-xs text-amber-600">
                                      Photos are required for{" "}
                                      {returnItem.reason === "damaged"
                                        ? "damaged"
                                        : "defective"}{" "}
                                      items.
                                    </p>
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund Method Selection */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-medium text-lg">Refund Method</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {RefundMethodOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      refundMethod === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      isEligibleForReturn &&
                      handleRefundMethodChange(option.value as RefundMethod)
                    }
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-6">
                        <input
                          type="radio"
                          id={`refund-${option.value}`}
                          name="refundMethod"
                          value={option.value}
                          checked={refundMethod === option.value}
                          onChange={() =>
                            handleRefundMethodChange(
                              option.value as RefundMethod
                            )
                          }
                          disabled={!isEligibleForReturn}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <label
                          htmlFor={`refund-${option.value}`}
                          className="flex items-center font-medium text-gray-900"
                        >
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-medium text-lg">Additional Notes</h2>
            </div>

            <div className="p-6">
              <textarea
                rows={3}
                placeholder="Add any additional information about your return request"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                disabled={!isEligibleForReturn}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Return policy reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">
              Return Policy Reminder
            </h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>
                Items must be in their original condition with tags attached
              </li>
              <li>Return shipping is free for damaged or defective items</li>
              <li>For other returns, a shipping fee may apply</li>
              <li>
                Refunds are processed within 5-10 business days after we receive
                your return
              </li>
              <li>Store credit refunds receive a 10% bonus value</li>
            </ul>
            <div className="mt-2">
              <Link
                to="/returns"
                className="text-sm text-blue-600 hover:underline"
              >
                View complete return policy
              </Link>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !isEligibleForReturn}
              className={`px-6 py-3 rounded-md font-medium ${
                isEligibleForReturn
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Submitting...
                </>
              ) : (
                "Submit Return Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReturnRequestPage;
