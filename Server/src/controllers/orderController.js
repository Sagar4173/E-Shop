const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      isGuestCheckout,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Process order items to ensure imageUrl is present
    const processedOrderItems = [...orderItems];
    for (let i = 0; i < processedOrderItems.length; i++) {
      const item = processedOrderItems[i];
      if (!item.imageUrl && item.product) {
        try {
          // If imageUrl is missing but we have a product ID, fetch from database
          const product = await Product.findById(item.product);
          if (product && product.imageUrl) {
            processedOrderItems[i] = {
              ...item,
              imageUrl: product.imageUrl,
            };
            console.log(
              `Added missing imageUrl for product ${item.name} from database`
            );
          } else {
            // Use a default image if product not found or has no image
            processedOrderItems[i] = {
              ...item,
              imageUrl: "https://via.placeholder.com/150",
            };
            console.log(`Using placeholder imageUrl for product ${item.name}`);
          }
        } catch (error) {
          console.error(
            `Error fetching product image for ${item.name}:`,
            error
          );
          // Use placeholder image as fallback
          processedOrderItems[i] = {
            ...item,
            imageUrl: "https://via.placeholder.com/150",
          };
        }
      }
    } // Create new order
    const order = new Order({
      orderItems: processedOrderItems,
      user: req.user ? req.user._id : null, // Allow null user for guest checkout
      shippingAddress,
      paymentMethod,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      isGuestOrder: isGuestCheckout || false,
    }); // If payment result is included in the request (for guest checkout),
    // only mark as paid if status is successful
    if (paymentResult && isGuestCheckout) {
      // Only set isPaid to true if payment status is "succeeded" or "complete"
      // Strict check to ensure payment was actually completed successfully
      const validPaymentStatuses = ["succeeded", "complete", "paid"];

      if (validPaymentStatuses.includes(paymentResult.status)) {
        // For important payments, we should verify with Stripe directly
        try {
          // Import the payment validator
          const { verifyPaymentIntent } = require("../utils/paymentValidator");

          // Verify payment status directly with Stripe if we have a payment ID
          if (paymentResult.id) {
            const verification = await verifyPaymentIntent(paymentResult.id);

            if (verification.isValid) {
              order.isPaid = true;
              order.paidAt = Date.now();
              if (order.status === "pending") {
                order.status = "processing";
              }
              console.log(
                `Order marked as paid after verification with Stripe. Status: ${verification.status}`
              );
            } else {
              console.warn(
                `Payment verification failed: ${verification.message}`
              );
              order.isPaid = false;
            }
          } else {
            // If no payment ID to verify, rely on the status provided
            order.isPaid = true;
            order.paidAt = Date.now();
            if (order.status === "pending") {
              order.status = "processing";
            }
            console.log(
              `Order marked as paid with payment status: ${paymentResult.status} (no verification)`
            );
          }
        } catch (verificationError) {
          console.error(
            "Error during payment verification:",
            verificationError
          );
          // Default to not paid if verification fails
          order.isPaid = false;
        }
      } else {
        console.log(`Payment not completed. Status: ${paymentResult.status}`);
        // Ensure order is explicitly marked as not paid
        order.isPaid = false;
      }
      order.paymentResult = paymentResult;
    } // Update product stock quantities
    for (const item of processedOrderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        // Make sure we're not creating a new product document by using save()
        // Just update the stock field specifically
        await Product.updateOne(
          { _id: product._id },
          { $set: { stock: product.stock } }
        );
      }
    }

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Check if the order belongs to the user or if the user is an admin
      if (
        order.user._id.toString() === req.user._id.toString() ||
        req.user.isAdmin
      ) {
        res.json(order);
      } else {
        res
          .status(401)
          .json({ message: "Not authorized to access this order" });
      }
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Verify payment status with Stripe before marking as paid
      const { verifyPaymentIntent } = require("../utils/paymentValidator");
      if (req.body.id) {
        const paymentId = req.body.id;
        console.log(
          `Verifying payment ${paymentId} for order ${req.params.id}`
        ); // Check if this is a payment method (pm_) or payment intent (pi_)
        const isPaymentMethod = paymentId.startsWith("pm_");
        // Check for test mode - be consistent with paymentValidator.js
        const isTestMode =
          process.env.NODE_ENV !== "production" || paymentId.includes("_test_");

        if (isPaymentMethod) {
          console.log(
            `Payment ID appears to be a payment method ID (${paymentId}) - Test mode: ${
              isTestMode ? "Yes" : "No"
            }`
          );
        }

        const verification = await verifyPaymentIntent(paymentId);

        if (!verification.isValid) {
          console.warn(`Payment verification failed: ${verification.message}`);

          // Allow payments to proceed in test mode if using payment method IDs
          if (isTestMode && isPaymentMethod) {
            console.log(
              "Test mode: Proceeding with payment method despite verification failure"
            );
            // Override verification for test mode with payment methods
            verification.isValid = true;
            verification.status = "succeeded_test_override";
            verification.message =
              "Test mode: Payment method accepted without verification";
            verification.paymentIntent = {
              id: `test_pi_from_${paymentId.substring(0, 8)}`,
              status: "succeeded",
            };
          } else {
            return res.status(400).json({
              message: `Payment verification failed: ${verification.message}`,
              status: verification.status,
            });
          }
        }

        console.log(`Payment verified successfully: ${verification.status}`);
      } else {
        console.warn("No payment ID provided for verification");
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      // Update order status to processing when paid
      if (order.status === "pending") {
        order.status = "processing";
      }
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();

      // Send invoice email automatically when order is marked as paid
      // But schedule it as a background task to avoid blocking the payment confirmation
      setTimeout(() => {
        try {
          // Only attempt to send email if not in test mode and not for zero amount orders
          if (
            !(process.env.NODE_ENV !== "production" && order.totalAmount === 0)
          ) {
            // Determine recipient email from available sources
            const recipientEmail =
              order.paymentResult?.email_address ||
              (order.user && typeof order.user !== "string" && order.user.email
                ? order.user.email
                : undefined) ||
              (order.shippingAddress && order.shippingAddress.email);

            // Only attempt to send email if we have a valid email
            if (recipientEmail) {
              // Try to get the BASE_URL - use default if not available
              const baseUrl = process.env.BASE_URL || "http://localhost:5000";

              console.log(
                `Attempting to send invoice email to ${recipientEmail}`
              );

              // Import axios here to avoid blocking the main thread
              const axios = require("axios");

              // Use a timeout to prevent long-running requests
              axios
                .post(
                  `${baseUrl}/api/emails/send-invoice`,
                  {
                    orderId: order._id,
                    recipientEmail: recipientEmail,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    timeout: 8000, // 8 second timeout (increased)
                  }
                )
                .then((response) =>
                  console.log("Invoice email sent:", response.data.success)
                )
                .catch((err) => {
                  console.error("Failed to send invoice email:", err.message);
                  // Log more details about the error for debugging
                  if (err.response) {
                    console.error(
                      "Error response:",
                      err.response.status,
                      err.response.data
                    );
                  }
                });

              console.log("Email sending initiated (completely non-blocking)");
            } else {
              console.log(
                "Skipping invoice email - no recipient email available"
              );
            }
          } else {
            console.log(
              "Skipping invoice email for test mode or zero amount order"
            );
          }
        } catch (emailError) {
          // Log but don't stop anything if email setup fails
          console.error("Failed in email background task:", emailError.message);
        }
      }, 100); // Minimal delay to ensure it runs after the response is sent

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error in updateOrderToPaid:", error.message);
    console.error("Error stack:", error.stack);
    // Include additional details for debugging but keep response generic for security
    res.status(500).json({
      message: "Server error processing payment",
      errorType: error.name,
      code: error.code || "UNKNOWN",
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;

    // Find the order first to get current data
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create a status history entry
    const statusHistoryEntry = {
      status: status,
      date: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    };

    // Use findOneAndUpdate to avoid validation issues with partial updates
    // This ensures we only update the fields we want and don't affect required fields
    const updateFields = { status };

    // Add the new status history entry
    updateFields.$push = { statusHistory: statusHistoryEntry };

    // Add optional fields if they're provided
    if (status === "delivered") {
      updateFields.deliveredAt = Date.now();
    }

    if (trackingNumber) {
      updateFields.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: false } // Return updated document, skip validation
    );

    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    // Check if userId query parameter exists to filter orders
    const filter = {};
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    const orders = await Order.find(filter)
      .populate("user", "id name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create return request for an order
// @route   POST /api/orders/:id/return
// @access  Private
exports.createReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { returnItems, refundMethod, additionalNotes, isInternational } =
      req.body;

    if (!returnItems || returnItems.length === 0) {
      return res.status(400).json({ message: "No items to return" });
    }

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to create return for this order" });
    }

    // Check if order is eligible for return
    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    }

    // Check if 30 days have passed since delivery
    const deliveryDate = new Date(order.deliveredAt);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deliveryDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff > 30) {
      return res
        .status(400)
        .json({ message: "Return window has expired (30 days)" });
    }

    // Validate and process return items
    const processedReturnItems = [];

    // Validate refund method
    const validRefundMethods = ["original", "store_credit"];
    const chosenRefundMethod =
      refundMethod && validRefundMethods.includes(refundMethod)
        ? refundMethod
        : "original";

    for (const item of returnItems) {
      // Find the order item
      const orderItemIndex = order.orderItems.findIndex(
        (oi) => oi._id.toString() === item.orderItemId
      );

      if (orderItemIndex === -1) {
        return res.status(400).json({
          message: `Item with ID ${item.orderItemId} not found in order`,
        });
      }

      const orderItem = order.orderItems[orderItemIndex];

      // Check if return quantity is valid
      if (item.quantity <= 0 || item.quantity > orderItem.quantity) {
        return res.status(400).json({
          message: `Invalid return quantity for item ${orderItem.name}`,
        });
      }

      // Create return item with additional fields
      processedReturnItems.push({
        orderItem: orderItem._id,
        quantity: item.quantity,
        reason: item.reason,
        otherReason: item.otherReason || "",
        status: "pending",
        refundMethod: chosenRefundMethod,
        isInternational: isInternational || false,
        additionalNotes: additionalNotes || "",
      });
    }

    // Instead of directly saving the order, use findByIdAndUpdate to avoid validation issues
    // This will add the return items to the returns array and set hasReturn to true
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $push: { returns: { $each: processedReturnItems } },
        $set: { hasReturn: true },
      },
      {
        new: true,
        runValidators: false, // Skip validation to avoid shippingAddress.phone issue
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found during update" });
    }

    res.status(201).json({
      message: "Return request created successfully",
      returnItems: updatedOrder.returns,
    });
  } catch (error) {
    console.error("Error creating return request:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update return request status
// @route   PUT /api/orders/:id/return/:returnId
// @access  Private/Admin
exports.updateReturnStatus = async (req, res) => {
  try {
    const { id, returnId } = req.params;
    const { status, comments } = req.body;

    if (!["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // First check if the order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the return item to get its current state
    const returnItem = order.returns.id(returnId);
    if (!returnItem) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Prepare update query for the specific return item
    const updateQuery = {
      $set: {
        "returns.$[item].status": status,
      },
    };

    // Add comments if provided
    if (comments) {
      updateQuery.$set["returns.$[item].comments"] = comments;
    }

    // Check if we need to update the hasReturn flag
    let hasReturn = order.hasReturn;

    if (status === "completed" || status === "rejected") {
      // Count other returns that are still pending or approved
      const otherPendingReturns = order.returns.filter(
        (r) =>
          r._id.toString() !== returnId &&
          r.status !== "completed" &&
          r.status !== "rejected"
      );

      // If no other pending returns, update hasReturn flag
      if (otherPendingReturns.length === 0) {
        updateQuery.$set.hasReturn = false;
      }
    }

    // Use findOneAndUpdate with arrayFilters to update the specific return item
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id },
      updateQuery,
      {
        new: true,
        runValidators: false,
        arrayFilters: [{ "item._id": returnId }],
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Error updating return" });
    }

    // Find the updated return item in the result
    const updatedReturnItem = updatedOrder.returns.id(returnId);

    res.json({
      message: "Return status updated successfully",
      returnItem: updatedReturnItem,
    });
  } catch (error) {
    console.error("Error updating return status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all returns for admin
// @route   GET /api/orders/returns
// @access  Private/Admin
exports.getAllReturns = async (req, res) => {
  try {
    const orders = await Order.find({ hasReturn: true })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    const returns = [];

    orders.forEach((order) => {
      order.returns.forEach((returnItem) => {
        // Find the corresponding order item
        const orderItem = order.orderItems.find(
          (item) => item._id.toString() === returnItem.orderItem.toString()
        );

        if (orderItem) {
          returns.push({
            returnId: returnItem._id,
            orderId: order._id,
            orderNumber: order._id.toString().slice(-6).toUpperCase(),
            orderDate: order.createdAt,
            customer: order.user
              ? {
                  _id: order.user._id,
                  name: order.user.name,
                  email: order.user.email,
                }
              : {
                  name: "Guest Customer",
                  email: order.shippingAddress.email || "No email provided",
                },
            item: {
              name: orderItem.name,
              price: orderItem.price,
              quantity: returnItem.quantity,
              imageUrl: orderItem.imageUrl,
            },
            reason: returnItem.reason,
            otherReason: returnItem.otherReason,
            status: returnItem.status,
            comments: returnItem.comments,
            refundMethod: returnItem.refundMethod,
            createdAt: returnItem.createdAt,
            updatedAt: returnItem.updatedAt,
            isInternational: returnItem.isInternational,
            photosUploaded: returnItem.photosUploaded,
          });
        }
      });
    });

    res.json(returns);
  } catch (error) {
    console.error("Error fetching all returns:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get returns for a specific order
// @route   GET /api/orders/:id/returns
// @access  Private
exports.getOrderReturns = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (
      !req.user.isAdmin &&
      (!order.user || order.user.toString() !== req.user._id.toString())
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to view returns for this order" });
    }

    // If the order has returns, process them for response
    if (order.returns && order.returns.length > 0) {
      const returnsData = order.returns.map((returnItem) => {
        // Find the corresponding order item
        const orderItem = order.orderItems.find(
          (item) => item._id.toString() === returnItem.orderItem.toString()
        );

        return {
          returnId: returnItem._id,
          item: orderItem
            ? {
                name: orderItem.name,
                price: orderItem.price,
                quantity: returnItem.quantity,
                imageUrl: orderItem.imageUrl,
              }
            : {
                name: "Unknown Item",
                quantity: returnItem.quantity,
              },
          reason: returnItem.reason,
          otherReason: returnItem.otherReason,
          status: returnItem.status,
          comments: returnItem.comments,
          refundMethod: returnItem.refundMethod,
          createdAt: returnItem.createdAt,
          updatedAt: returnItem.updatedAt,
          isInternational: returnItem.isInternational,
          photosUploaded: returnItem.photosUploaded,
        };
      });

      return res.json(returnsData);
    }

    // If no returns
    return res.json([]);
  } catch (error) {
    console.error("Error fetching order returns:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get order status history
// @route   GET /api/orders/:id/status-history
// @access  Private
exports.getOrderStatusHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "statusHistory.updatedBy",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has permission to view this order
    // Admin can view any order, regular users can only view their own orders
    if (
      !req.user.isAdmin &&
      order.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to view this order's status history",
      });
    }

    // Return the populated status history, sorted by date (newest first)
    const statusHistory = order.statusHistory || [];

    // If the history is empty (for old orders), create a basic history from available data
    if (statusHistory.length === 0) {
      // Create initial entry from creation date
      statusHistory.push({
        status: "pending",
        date: order.createdAt,
        note: "Order created",
      });

      // Add paid status if applicable
      if (order.isPaid) {
        statusHistory.push({
          status: "processing",
          date: order.paidAt,
          note: "Payment received",
        });
      }

      // Add delivered status if applicable
      if (order.deliveredAt) {
        statusHistory.push({
          status: "delivered",
          date: order.deliveredAt,
          note: "Order delivered",
        });
      }
    }

    // Sort by date, newest first
    const sortedHistory = [...statusHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(sortedHistory);
  } catch (error) {
    console.error("Error getting order status history:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
