const User = require("../models/User");
const { generateToken } = require("../middlewares/authMiddleware");
const crypto = require("crypto");

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

    // Generate a random 6-digit OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      lastLogin: new Date(),
      notificationPreferences: {
        email: true,
        push: false,
        sms: false,
      },
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    if (user) {
      // Send verification email with OTP
      // TODO: Replace with actual email sending implementation
      console.log(`Email verification OTP for ${email}: ${otp}`);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        message:
          "Registration successful. Please verify your email to continue.",
        // Include OTP in response for testing purposes only (remove in production)
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Check if user's email is verified
      if (!user.isVerified) {
        return res.status(401).json({
          message: "Please verify your email address before logging in",
          needsVerification: true,
          email: user.email,
        });
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber || "",
        enable2FA: user.enable2FA || false,
        notificationPreferences: user.notificationPreferences || {
          email: true,
          push: false,
          sms: false,
        },
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        address: user.address || {},
        phoneNumber: user.phoneNumber || "",
        enable2FA: user.enable2FA || false,
        notificationPreferences: user.notificationPreferences || {
          email: true,
          push: false,
          sms: false,
        },
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.address) {
        user.address = {
          ...user.address,
          ...req.body.address,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      // Handle new profile fields
      if (req.body.phoneNumber !== undefined) {
        user.phoneNumber = req.body.phoneNumber;
      }

      if (req.body.enable2FA !== undefined) {
        user.enable2FA = req.body.enable2FA;
      }

      if (req.body.notificationPreferences) {
        user.notificationPreferences = {
          ...user.notificationPreferences,
          ...req.body.notificationPreferences,
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        address: updatedUser.address,
        phoneNumber: updatedUser.phoneNumber,
        enable2FA: updatedUser.enable2FA,
        notificationPreferences: updatedUser.notificationPreferences,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = Boolean(req.body.isAdmin);

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Generate and send OTP for password reset
// @route   POST /api/users/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists or not
      return res.json({
        success: true,
        message:
          "If your email is registered, you will receive a code shortly.",
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Store OTP and expiration in user document
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // In a production environment, send actual email with OTP
    // For now, we'll just log it and return it for testing
    console.log(`Password reset OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "Verification code sent to your email",
      // Include OTP in response for testing purposes only (remove in production)
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

// @desc    Verify OTP code
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid verification details",
      });
    }

    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Check purpose of OTP verification
    if (purpose === "password-reset") {
      // Verify password reset OTP
      if (
        user.resetPasswordOtp !== hashedOtp ||
        user.resetPasswordOtpExpires < Date.now()
      ) {
        return res.status(400).json({
          valid: false,
          message: "Invalid or expired verification code",
        });
      }
    } else if (purpose === "2fa") {
      // Verify 2FA OTP
      if (
        user.twoFactorOtp !== hashedOtp ||
        user.twoFactorOtpExpires < Date.now()
      ) {
        return res.status(400).json({
          valid: false,
          message: "Invalid or expired 2FA code",
        });
      }
    } else {
      // Handle other verification types
      return res.status(400).json({
        valid: false,
        message: "Invalid verification type",
      });
    }

    res.json({
      valid: true,
      message: "Verification successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      valid: false,
      message: "An error occurred during verification",
    });
  }
};

// @desc    Reset password with OTP verification
// @route   POST /api/users/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset details",
      });
    }

    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Verify the OTP is valid and not expired
    if (
      user.resetPasswordOtp !== hashedOtp ||
      user.resetPasswordOtpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Update password
    user.password = newPassword;

    // Clear OTP data
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
    });
  }
};

// @desc    Send OTP for two-factor authentication
// @route   POST /api/users/send-2fa
// @access  Private
exports.send2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Store OTP and expiration in user document
    user.twoFactorOtp = hashedOtp;
    user.twoFactorOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In production, send via SMS if phone number exists,
    // otherwise fall back to email
    let method = "email";
    if (user.phoneNumber && user.notificationPreferences?.sms) {
      // TODO: Implement SMS sending functionality
      method = "SMS";
    }

    // Log for testing purposes
    console.log(`2FA OTP for ${user.email}: ${otp}`);

    res.json({
      success: true,
      message: `Verification code sent via ${method}`,
      // Include OTP in response for testing purposes only (remove in production)
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// @desc    Verify 2FA OTP and complete login
// @route   POST /api/users/verify-2fa
// @access  Public
exports.verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification details",
      });
    }

    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Check if OTP is valid and not expired
    if (
      user.twoFactorOtp !== hashedOtp ||
      user.twoFactorOtpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Clear OTP data
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate authentication token
    const token = generateToken(user._id);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phoneNumber: user.phoneNumber || "",
      enable2FA: user.enable2FA || false,
      notificationPreferences: user.notificationPreferences || {
        email: true,
        push: false,
        sms: false,
      },
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during verification",
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification details",
      });
    }

    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Check if OTP is valid and not expired
    if (
      user.verificationOtp !== hashedOtp ||
      user.verificationOtpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Mark user as verified
    user.isVerified = true;

    // Clear OTP data
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during verification",
    });
  }
};
