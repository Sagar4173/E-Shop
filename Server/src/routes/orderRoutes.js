const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Guest checkout route that doesn't require authentication
router.post("/guest", orderController.createOrder);

// Guest order tracking (by order ID and email)
router.post("/track", orderController.trackGuestOrder);

// Protected routes
router.post("/", protect, orderController.createOrder);
router.get("/myorders", protect, orderController.getMyOrders);

// Admin routes - specific routes must come before parameter routes
router.get("/returns", protect, admin, orderController.getAllReturns);
router.get("/", protect, admin, orderController.getOrders);

// Dynamic parameter routes
router.get("/:id", protect, orderController.getOrderById);
router.get(
  "/:id/status-history",
  protect,
  orderController.getOrderStatusHistory,
);
router.put("/:id/pay", protect, orderController.updateOrderToPaid);

// Return routes
router.post("/:id/return", protect, orderController.createReturnRequest);
router.put(
  "/:id/return/:returnId",
  protect,
  admin,
  orderController.updateReturnStatus,
);

// Admin routes - with parameters
router.put("/:id/status", protect, admin, orderController.updateOrderStatus);

module.exports = router;
