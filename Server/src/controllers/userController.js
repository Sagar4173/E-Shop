const User = require("../models/User");
const PendingRegistration = require("../models/PendingRegistration");
const { generateToken } = require("../middlewares/authMiddleware");
const crypto = require("crypto");

// @desc    Start user registration by sending OTP
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

    // Instead of using a global variable, create a document in the PendingRegistration collection
    // First delete any existing pending registrations for this email
    await PendingRegistration.deleteMany({ email });

    // Create a new pending registration
    const pendingRegistration = new PendingRegistration({
      name,
      email,
      password,
      verificationOtp: hashedOtp,
      verificationOtpExpires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    await pendingRegistration.save();

    // Send verification email with OTP
    try {
      // Call the email service to send verification OTP
      const emailResponse = await fetch(
        `${process.env.BASE_URL}/api/emails/verification-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
            otp,
          }),
        }
      );

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        console.error(
          "Failed to send verification email:",
          emailResult.message
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    res.status(200).json({
      success: true,
      message:
        "Verification code sent to your email. Please verify to complete registration.",
      email: email,
      // Include OTP in response for testing purposes only (remove in production)
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
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

    // Send the OTP via email
    try {
      // Call the email service to send password reset OTP
      const emailResponse = await fetch(
        `${process.env.BASE_URL}/api/emails/password-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: user.name,
            otp,
          }),
        }
      );

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        console.error(
          "Failed to send password reset email:",
          emailResult.message
        );
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }

    console.log(`Password reset OTP for ${email}: ${otp}`); // For testing only, remove in production

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

// @desc    Verify email with OTP and complete registration
// @route   POST /api/users/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the pending registration in the database
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(400).json({
        success: false,
        message:
          "No pending registration found or registration expired. Please register again.",
      });
    }

    // Hash the submitted OTP for comparison
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Check if OTP is valid and not expired
    if (
      pendingRegistration.verificationOtp !== hashedOtp ||
      pendingRegistration.verificationOtpExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Create the new user now that verification is successful
    const user = await User.create({
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      password: pendingRegistration.password,
      lastLogin: new Date(),
      notificationPreferences: {
        email: true,
        push: false,
        sms: false,
      },
      isVerified: true, // User is verified from the start
    });

    // Clean up the pending registration
    await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

    if (user) {
      // Send welcome email
      try {
        // Call the email service to send welcome email
        const emailResponse = await fetch(
          `${process.env.BASE_URL}/api/emails/welcome`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              name: user.name,
            }),
          }
        );

        const emailResult = await emailResponse.json();

        if (!emailResult.success) {
          console.error("Failed to send welcome email:", emailResult.message);
        }
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }

      // Generate authentication token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Registration completed successfully!",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to create user account",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during verification",
    });
  }
};

// @desc    Resend email verification OTP
// @route   POST /api/users/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if there's a pending registration for this email
    const pendingRegistration = await PendingRegistration.findOne({ email });

    // If there's no pending registration, check if there's already a user with this email
    if (!pendingRegistration) {
      const user = await User.findOne({ email });

      // If there's no pending registration and no existing user, it's an invalid request
      if (!user) {
        // For security reasons, don't reveal if email exists or not
        return res.json({
          success: true,
          message:
            "If your email is registered, you will receive a verification code shortly.",
        });
      }

      // If user exists but is already verified, no need to send verification
      if (user.isVerified) {
        return res.json({
          success: false,
          message: "Email is already verified. Please login instead.",
        });
      }

      // This shouldn't happen with the new flow (users created only after verification),
      // but keeping it for backwards compatibility
      return res.status(400).json({
        success: false,
        message: "No pending registration found. Please register again.",
      });
    }

    // Generate a new OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash the OTP before storing
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Update pending registration with new OTP
    pendingRegistration.verificationOtp = hashedOtp;
    pendingRegistration.verificationOtpExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    // Track attempt count
    pendingRegistration.attempts += 1;
    pendingRegistration.lastAttempt = Date.now();

    // Save the updated document
    await pendingRegistration.save();

    // Send verification email with OTP
    try {
      // Call the email service to send verification OTP
      const emailResponse = await fetch(
        `${process.env.BASE_URL}/api/emails/verification-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: pendingRegistration.name,
            otp,
          }),
        }
      );

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        console.error(
          "Failed to send verification email:",
          emailResult.message
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    res.json({
      success: true,
      message: "Verification code sent to your email",
      email: email,
      // Include OTP in response for testing purposes only (remove in production)
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resending verification code",
    });
  }
};
