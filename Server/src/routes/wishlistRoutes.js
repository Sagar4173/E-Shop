const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middlewares/authMiddleware");

// All wishlist routes require authentication
router.get("/", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.delete("/", protect, clearWishlist);
router.get("/check/:productId", protect, checkWishlist);
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
