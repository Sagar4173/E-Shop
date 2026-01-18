const User = require("../models/User");
const Order = require("../models/Order");
const PendingRegistration = require("../models/PendingRegistration");
const { generateToken } = require("../middlewares/authMiddleware");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, subject, message) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">E-Shop Verification</h2>
          <p>${message}</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if there's a pending registration
    await PendingRegistration.deleteOne({ email });

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store pending registration
    const pendingRegistration = new PendingRegistration({
      name,
      email,
      password,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    await pendingRegistration.save();

    // Send verification email
    const emailSent = await sendOTPEmail(
      email,
      otp,
      "Verify Your Email - E-Shop",
      "Thank you for registering! Please use the following code to verify your email address:",
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message: "Verification code sent to your email",
      email: email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find pending registration
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    // Check if OTP is valid
    if (pendingRegistration.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Check if OTP is expired
    if (pendingRegistration.verificationOtpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Create the actual user
    const user = new User({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      isVerified: true,
    });

    await user.save();

    // Delete pending registration
    await PendingRegistration.deleteOne({ email });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// @desc    Resend verification OTP
// @route   POST /api/users/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    pendingRegistration.verificationOtp = otp;
    pendingRegistration.verificationOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000,
    );
    await pendingRegistration.save();

    // Send new verification email
    const emailSent = await sendOTPEmail(
      email,
      otp,
      "Verify Your Email - E-Shop",
      "Here is your new verification code:",
    );

    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.json({ message: "New verification code sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
        email: user.email,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Check if 2FA is enabled
    if (user.enable2FA) {
      // Generate and send 2FA OTP
      const otp = generateOTP();
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOTPEmail(
        email,
        otp,
        "Two-Factor Authentication - E-Shop",
        "Use this code to complete your login:",
      );

      return res.json({
        requires2FA: true,
        email: user.email,
        message: "2FA code sent to your email",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      enable2FA: user.enable2FA,
      phoneNumber: user.phoneNumber,
      address: user.address,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Send 2FA OTP
// @route   POST /api/users/send-2fa
// @access  Private
exports.send2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.twoFactorOtp = otp;
    user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(
      user.email,
      otp,
      "Two-Factor Authentication - E-Shop",
      "Use this code to complete your action:",
    );

    res.json({ message: "2FA code sent to your email" });
  } catch (error) {
    console.error("Send 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/users/verify-2fa
// @access  Public
exports.verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.twoFactorOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.twoFactorOtpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Clear 2FA OTP
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      enable2FA: user.enable2FA,
      phoneNumber: user.phoneNumber,
      address: user.address,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      token,
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.enable2FA =
      req.body.enable2FA !== undefined ? req.body.enable2FA : user.enable2FA;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...req.body.notificationPreferences,
      };
    }

    // If password is being updated
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isVerified: updatedUser.isVerified,
        enable2FA: updatedUser.enable2FA,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        notificationPreferences: updatedUser.notificationPreferences,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user password (requires current password)
// @route   PUT /api/users/profile/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message: "If the email exists, a reset code has been sent",
      });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(
      email,
      otp,
      "Password Reset - E-Shop",
      "Use this code to reset your password:",
    );

    res.json({ message: "If the email exists, a reset code has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    let storedOtp, expiry;

    if (purpose === "password-reset") {
      storedOtp = user.resetPasswordOtp;
      expiry = user.resetPasswordOtpExpires;
    } else if (purpose === "2fa") {
      storedOtp = user.twoFactorOtp;
      expiry = user.twoFactorOtpExpires;
    } else {
      return res.status(400).json({ message: "Invalid purpose" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (expiry < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    res.json({ success: true, message: "Code verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get orders for a specific user (admin only)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
exports.getUserOrdersById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing your own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot change your own admin status" });
    }

    user.isAdmin = req.body.isAdmin;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
