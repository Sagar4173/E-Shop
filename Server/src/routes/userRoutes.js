const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getUsers,
  getUserById,
  getUserOrdersById,
  deleteUser,
  updateUserRole,
  forgotPassword,
  verifyOtp,
  resetPassword,
  send2FA,
  verify2FA,
  verifyEmail,
  resendVerification,
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-2fa", verify2FA);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Protected routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/profile/password", protect, updatePassword);
router.post("/send-2fa", protect, send2FA);

// Admin routes
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.get("/:id/orders", protect, admin, getUserOrdersById);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id/role", protect, admin, updateUserRole);

module.exports = router;
