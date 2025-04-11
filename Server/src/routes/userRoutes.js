const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);

// Admin routes
router.get("/", protect, admin, userController.getUsers);
router.delete("/:id", protect, admin, userController.deleteUser);
router.put("/:id/role", protect, admin, userController.updateUserRole);

module.exports = router;
