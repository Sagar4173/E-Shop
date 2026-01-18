const express = require("express");
const router = express.Router();
const {
  validateCoupon,
  applyCoupon,
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
} = require("../controllers/couponController");
const {
  protect,
  admin,
  optionalAuth,
} = require("../middlewares/authMiddleware");

// Public routes (with optional auth for user-specific validation)
router.post("/validate", optionalAuth, validateCoupon);
router.get("/active", getActiveCoupons);

// Protected routes
router.post("/apply", protect, applyCoupon);

// Admin routes
router.get("/", protect, admin, getCoupons);
router.post("/", protect, admin, createCoupon);
router.get("/:id", protect, admin, getCouponById);
router.put("/:id", protect, admin, updateCoupon);
router.delete("/:id", protect, admin, deleteCoupon);

module.exports = router;
