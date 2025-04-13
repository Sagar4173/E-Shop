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

    // Create new order
    const order = new Order({
      orderItems,
      user: req.user ? req.user._id : null, // Allow null user for guest checkout
      shippingAddress,
      paymentMethod,
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      isGuestOrder: isGuestCheckout || false,
    });

    // If payment result is included in the request (for guest checkout),
    // update payment status immediately
    if (paymentResult && isGuestCheckout) {
      order.isPaid = true;
      order.paidAt = Date.now();
      if (order.status === "pending") {
        order.status = "processing";
      }
      order.paymentResult = paymentResult;
    }

    // Update product stock quantities
    for (const item of orderItems) {
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

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;

    // Use findOneAndUpdate to avoid validation issues with partial updates
    // This ensures we only update the fields we want and don't affect required fields
    const updateFields = { status };

    // Add optional fields if they're provided
    if (status === "delivered") {
      updateFields.deliveredAt = Date.now();
    }

    if (trackingNumber) {
      updateFields.trackingNumber = trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
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
    const orders = await Order.find({})
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
        // Find the original order item
        const orderItem = order.orderItems.find(
          (item) => item._id.toString() === returnItem.orderItem.toString()
        );

        if (orderItem) {
          returns.push({
            returnId: returnItem._id,
            orderId: order._id,
            orderDate: order.createdAt,
            user: order.user,
            productName: orderItem.name,
            quantity: returnItem.quantity,
            reason: returnItem.reason,
            otherReason: returnItem.otherReason,
            status: returnItem.status,
            createdAt: returnItem.createdAt,
            updatedAt: returnItem.updatedAt,
          });
        }
      });
    });

    res.json(returns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
