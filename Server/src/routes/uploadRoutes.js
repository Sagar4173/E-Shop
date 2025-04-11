const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");

// Protected routes
router.post(
  "/returns/:orderId/:returnItemId",
  protect,
  uploadController.uploadReturnPhotos
);

module.exports = router;
