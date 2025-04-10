const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductCategories,
  createProductReview,
  getProductReviews,
  deleteProductReview,
} = require("../controllers/productController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getProductCategories);
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);

// Protected routes
router.post("/:id/reviews", protect, createProductReview);
router.delete("/:id/reviews/:reviewId", protect, deleteProductReview);

// Protected admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
