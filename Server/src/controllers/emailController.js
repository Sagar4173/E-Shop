const Order = require("../models/Order");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates with basic HTML structure
const emailTemplates = {
  orderConfirmation: (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Thank You for Your Order!</h1>
          <p>Order #${order._id.toString().substring(0, 8).toUpperCase()}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${order.shippingAddress.fullName || "Valued Customer"},</p>
          <p>Your order has been successfully placed and is now being processed.</p>
          
          <h3>Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
              <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
            </tr>
            ${order.orderItems
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  item.name
                }</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${
                  item.quantity
                }</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">₹${item.price.toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          
          <div style="margin-top: 20px;">
            <table style="width: 100%;">
              <tr>
                <td style="text-align: right;">Subtotal:</td>
                <td style="text-align: right; width: 100px;">₹${order.subtotal.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td style="text-align: right;">Shipping:</td>
                <td style="text-align: right;">${
                  order.shippingAmount > 0
                    ? `₹${order.shippingAmount.toFixed(2)}`
                    : "Free"
                }</td>
              </tr>
              <tr>
                <td style="text-align: right;">Tax:</td>
                <td style="text-align: right;">₹${order.taxAmount.toFixed(
                  2
                )}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td style="text-align: right;">Total:</td>
                <td style="text-align: right;">₹${order.totalAmount.toFixed(
                  2
                )}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px;">
            <h3>Shipping Information</h3>
            <p>
              ${order.shippingAddress.fullName || "Customer"}<br>
              ${order.shippingAddress.address || order.shippingAddress.street || ""}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
                order.shippingAddress.postalCode
              }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions about your order, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  orderStatusUpdate: (order, status, note) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Order Status Update</h1>
          <p>Order #${order._id.toString().substring(0, 8).toUpperCase()}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${order.shippingAddress.fullName || "Valued Customer"},</p>
          <p>Your order status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
          
          <p>You can view your order details by logging into your account.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  shippingNotification: (order, trackingNumber, note) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Your Order Has Shipped!</h1>
          <p>Order #${order._id.toString().substring(0, 8).toUpperCase()}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${order.shippingAddress.fullName || "Valued Customer"},</p>
          <p>Great news! Your order is on its way to you.</p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
          </div>
          
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
          
          <p>You can track your package using the tracking number above.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions about your shipment, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  returnRequest: (order, returnItem) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Return Request Received</h1>
          <p>Return #${returnItem._id
            .toString()
            .substring(0, 8)
            .toUpperCase()}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${order.shippingAddress.fullName || "Valued Customer"},</p>
          <p>We have received your return request for Order #${order._id
            .toString()
            .substring(0, 8)
            .toUpperCase()}</p>
          
          <p>Your return is currently being reviewed by our team. We'll update you with the status of your return as soon as possible.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions about your return, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  returnStatus: (order, returnItem, status, comments) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Return Status Update</h1>
          <p>Return #${returnItem._id
            .toString()
            .substring(0, 8)
            .toUpperCase()}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${order.shippingAddress.fullName || "Valued Customer"},</p>
          <p>Your return status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ""}
          
          <div style="margin-top: 30px;">
            <p>If you have any questions about your return, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for your patience!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  verificationOtp: (name, otp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Verify Your Email Address</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>Thank you for signing up with E-Commerce Platform. To complete your registration, please verify your email address.</p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h2>
          </div>
          
          <p>Enter this verification code in the application to verify your email address. This code will expire in 1 hour.</p>
          
          <p>If you did not request this verification code, please ignore this email.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions, please contact our customer support at support@ecommerce.com</p>
            <p>Thank you for choosing E-Commerce Platform!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  passwordResetOtp: (name, otp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Password Reset Verification</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>You requested to reset your password on E-Commerce Platform. Please use the verification code below to complete the process.</p>
          
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h2>
          </div>
          
          <p>Enter this verification code in the password reset page to continue setting a new password. This code will expire in 30 minutes.</p>
          
          <p>If you did not request to reset your password, please ignore this email or contact our support team.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions, please contact our customer support at support@ecommerce.com</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  welcome: (name) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Welcome to E-Commerce Platform!</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>Thank you for joining E-Commerce Platform! We're excited to have you as part of our community.</p>
          
          <p>With your new account, you can:</p>
          <ul>
            <li>Shop our extensive collection of products</li>
            <li>Track your orders easily</li>
            <li>Save your favorite items to your wishlist</li>
            <li>Enjoy a seamless shopping experience</li>
          </ul>
          
          <p>Start exploring our products and discover great deals today!</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions, please contact our customer support at support@ecommerce.com</p>
            <p>Happy shopping!</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  passwordReset: (resetLink) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions, please contact our customer support at support@ecommerce.com</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  contactForm: (name) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>We've Received Your Message</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>Thank you for contacting us. We've received your message and will get back to you as soon as possible.</p>
          
          <p>Our team typically responds within 24-48 hours during business days.</p>
          
          <div style="margin-top: 30px;">
            <p>If you have any additional questions, please contact our customer support at support@ecommerce.com</p>
            <p>Best regards,</p>
            <p>Customer Support Team<br>E-Commerce Platform</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },

  lowInventory: (productName, currentStock) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1>Low Inventory Alert</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello Admin,</p>
          <p>This is an automated notification to inform you about a low inventory item that may require attention.</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #ffc107;">
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Current Stock:</strong> ${currentStock} units</p>
          </div>
          
          <p>Please consider restocking this item soon to avoid stock-outs.</p>
          
          <div style="margin-top: 30px;">
            <p>This is an automated message from your inventory management system.</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 E-Commerce Platform. All rights reserved.</p>
        </div>
      </div>
    `;
  },
};

// Helper function to send emails
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Check if email configuration is complete
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.error(
        "Email configuration incomplete. Check environment variables."
      );
      return {
        success: false,
        message:
          "Email configuration incomplete. Please contact your administrator.",
      };
    }

    // Skip actual email sending in development environment if configured
    if (
      process.env.NODE_ENV === "development" &&
      process.env.SKIP_EMAILS === "true"
    ) {
      return { success: true, message: "Email skipped in development" };
    }

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"E-Commerce Platform" <no-reply@ecommerce.com>',
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error.message);
    // More detailed error information for debugging
    if (error.code === "EAUTH") {
      return {
        success: false,
        message: "Authentication failed. Check email credentials.",
      };
    } else if (error.code === "ESOCKET") {
      return {
        success: false,
        message: "Network error. Check email server settings.",
      };
    } else {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }
};

// Check if email notifications are enabled for a user
const isEmailNotificationEnabled = async (userId) => {
  try {
    const user = await User.findById(userId);
    return (
      user && user.notificationPreferences && user.notificationPreferences.email
    );
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    // Default to true if there's an error checking
    return true;
  }
};

// @desc    Send order confirmation email
// @route   POST /api/emails/order-confirmation
// @access  Private
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId, recipient } = req.body;

    if (!orderId || !recipient) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email notificationPreferences"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user has email notifications enabled
    if (order.user && !(await isEmailNotificationEnabled(order.user._id))) {
      return res.json({
        success: true,
        message: "Email notification skipped - user preference",
      });
    }

    const emailContent = emailTemplates.orderConfirmation(order);
    const result = await sendEmail(
      recipient,
      `Order Confirmation #${orderId.toString().substring(0, 8).toUpperCase()}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send order status update email
// @route   POST /api/emails/order-status-update
// @access  Private/Admin
exports.sendOrderStatusUpdate = async (req, res) => {
  try {
    const { orderId, status, note } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email notificationPreferences"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get recipient email from user or shipping address
    const recipientEmail = order.user?.email || order.shippingAddress.email;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No recipient email found",
      });
    }

    // Check if user has email notifications enabled
    if (order.user && !(await isEmailNotificationEnabled(order.user._id))) {
      return res.json({
        success: true,
        message: "Email notification skipped - user preference",
      });
    }

    const emailContent = emailTemplates.orderStatusUpdate(order, status, note);
    const result = await sendEmail(
      recipientEmail,
      `Order Status Update: ${status.toUpperCase()} - #${orderId
        .toString()
        .substring(0, 8)
        .toUpperCase()}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending order status update email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send shipping notification email
// @route   POST /api/emails/shipping-notification
// @access  Private/Admin
exports.sendShippingNotification = async (req, res) => {
  try {
    const { orderId, trackingNumber, note } = req.body;

    if (!orderId || !trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email notificationPreferences"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get recipient email from user or shipping address
    const recipientEmail = order.user?.email || order.shippingAddress.email;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No recipient email found",
      });
    }

    // Check if user has email notifications enabled
    if (order.user && !(await isEmailNotificationEnabled(order.user._id))) {
      return res.json({
        success: true,
        message: "Email notification skipped - user preference",
      });
    }

    const emailContent = emailTemplates.shippingNotification(
      order,
      trackingNumber,
      note
    );
    const result = await sendEmail(
      recipientEmail,
      `Your Order Has Shipped! #${orderId
        .toString()
        .substring(0, 8)
        .toUpperCase()}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending shipping notification:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send return request confirmation email
// @route   POST /api/emails/return-request
// @access  Private
exports.sendReturnRequestConfirmation = async (req, res) => {
  try {
    const { orderId, returnId } = req.body;

    if (!orderId || !returnId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email notificationPreferences"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const returnItem = order.returns.id(returnId);
    if (!returnItem) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Get recipient email from user or shipping address
    const recipientEmail = order.user?.email || order.shippingAddress.email;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No recipient email found",
      });
    }

    // Check if user has email notifications enabled
    if (order.user && !(await isEmailNotificationEnabled(order.user._id))) {
      return res.json({
        success: true,
        message: "Email notification skipped - user preference",
      });
    }

    const emailContent = emailTemplates.returnRequest(order, returnItem);
    const result = await sendEmail(
      recipientEmail,
      `Return Request Received #${returnId
        .toString()
        .substring(0, 8)
        .toUpperCase()}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending return request confirmation:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send return status update email
// @route   POST /api/emails/return-status
// @access  Private/Admin
exports.sendReturnStatusUpdate = async (req, res) => {
  try {
    const { orderId, returnId, status, comments } = req.body;

    if (!orderId || !returnId || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "name email notificationPreferences"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const returnItem = order.returns.id(returnId);
    if (!returnItem) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Get recipient email from user or shipping address
    const recipientEmail = order.user?.email || order.shippingAddress.email;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "No recipient email found",
      });
    }

    // Check if user has email notifications enabled
    if (order.user && !(await isEmailNotificationEnabled(order.user._id))) {
      return res.json({
        success: true,
        message: "Email notification skipped - user preference",
      });
    }

    const emailContent = emailTemplates.returnStatus(
      order,
      returnItem,
      status,
      comments
    );
    const result = await sendEmail(
      recipientEmail,
      `Return Status Update: ${status.toUpperCase()} #${returnId
        .toString()
        .substring(0, 8)
        .toUpperCase()}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending return status update:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send welcome email after registration
// @route   POST /api/emails/welcome
// @access  Public
exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailContent = emailTemplates.welcome(name);
    const result = await sendEmail(
      email,
      "Welcome to E-Commerce Platform!",
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send password reset email
// @route   POST /api/emails/password-reset
// @access  Public
exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, resetToken } = req.body;

    if (!email || !resetToken) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailContent = emailTemplates.passwordReset(resetLink);

    const result = await sendEmail(
      email,
      "Password Reset Request",
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send password reset OTP email
// @route   POST /api/emails/password-reset-otp
// @access  Public
exports.sendPasswordResetOtpEmail = async (req, res) => {
  try {
    const { email, name, otp } = req.body;

    if (!email || !name || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailContent = emailTemplates.passwordResetOtp(name, otp);
    const result = await sendEmail(
      email,
      "Password Reset Verification Code",
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending password reset OTP email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send contact form submission confirmation
// @route   POST /api/emails/contact-form
// @access  Public
exports.sendContactFormConfirmation = async (req, res) => {
  try {
    const { email, name, subject } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // First, send confirmation to the customer
    const customerEmailContent = emailTemplates.contactForm(name);
    await sendEmail(email, "We've Received Your Message", customerEmailContent);

    // Then, send the inquiry to the admin/support team
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${req.body.message || "(No message content)"}</p>
      </div>
    `;

    const adminResult = await sendEmail(
      process.env.ADMIN_EMAIL || "admin@ecommerce.com",
      `New Contact Form: ${subject}`,
      adminEmailContent
    );

    res.json({
      success: true,
      message: "Contact form emails sent successfully",
    });
  } catch (error) {
    console.error("Error sending contact form emails:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send low inventory alert to admins
// @route   POST /api/emails/inventory-alert
// @access  Private/Admin
exports.sendLowInventoryAlert = async (req, res) => {
  try {
    const { productId, productName, currentStock } = req.body;

    if (!productId || !productName || currentStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailContent = emailTemplates.lowInventory(productName, currentStock);
    const result = await sendEmail(
      process.env.ADMIN_EMAIL || "admin@ecommerce.com",
      `Low Inventory Alert: ${productName}`,
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending inventory alert:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send verification OTP email
// @route   POST /api/emails/verification-otp
// @access  Public
exports.sendVerificationOtpEmail = async (req, res) => {
  try {
    const { email, name, otp } = req.body;

    if (!email || !name || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailContent = emailTemplates.verificationOtp(name, otp);
    const result = await sendEmail(
      email,
      "Verify Your Email Address",
      emailContent
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending verification OTP email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
    });
  }
};

// @desc    Send invoice email
// @route   POST /api/emails/send-invoice
// @access  Public (with order ownership validation)
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { orderId, recipientEmail } = req.body;

    if (!orderId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId and recipientEmail",
      });
    }

    const order = await Order.findById(orderId).populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Security: Validate that the requester is authorized to access this order
    const isOwner =
      req.user &&
      order.user &&
      order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.isAdmin;
    const isGuestOrder = order.isGuestOrder;
    const emailMatchesOrder =
      recipientEmail === order.shippingAddress.email ||
      (order.paymentResult &&
        recipientEmail === order.paymentResult.email_address) ||
      (order.user && recipientEmail === order.user.email);

    // Allow if: owner, admin, or guest order with matching email
    if (!isOwner && !isAdmin && !(isGuestOrder && emailMatchesOrder)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send invoice for this order",
      });
    }

    // Generate the public invoice URL with email verification
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const invoiceUrl = `${baseUrl}/invoice/${order._id}?email=${encodeURIComponent(recipientEmail)}`;

    // Create invoice email template with button to view invoice
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #3B82F6; padding: 20px; text-align: center; border-top-left-radius: 6px; border-top-right-radius: 6px;">
          <h1 style="color: white; margin: 0;">Your Invoice</h1>
          <p style="color: white; margin: 5px 0 0;">Order #${order._id
            .toString()
            .substring(0, 8)
            .toUpperCase()}</p>
        </div>
        
        <div style="border: 1px solid #e1e1e1; border-top: none; padding: 20px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
          <p>Hello ${
            order.shippingAddress.fullName ||
            (order.user ? order.user.name : "Valued Customer")
          },</p>
          <p>Thank you for your order. You can view and download your invoice by clicking the button below.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${invoiceUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              📄 View Invoice
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin: 15px 0;">
            <h3 style="margin-top: 0; color: #3B82F6;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Order Date:</td>
                <td style="padding: 8px 0; text-align: right;">${new Date(
                  order.createdAt
                ).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${order.totalAmount.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Status:</td>
                <td style="padding: 8px 0; text-align: right; color: ${
                  order.isPaid ? "#10B981" : "#F59E0B"
                };">
                  ${order.isPaid ? "Paid" : "Payment Pending"}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Order Status:</td>
                <td style="padding: 8px 0; text-align: right;">${
                  order.status.charAt(0).toUpperCase() + order.status.slice(1)
                }</td>
              </tr>
            </table>
          </div>
          
          <p style="margin-top: 20px;">If you have any questions about your invoice or order, please contact our customer support at <a href="mailto:support@ecommerce.com" style="color: #3B82F6;">support@ecommerce.com</a></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1;">
            <p style="color: #666; margin: 0;">Thank you for shopping with us!</p>
            <p style="color: #666; margin: 5px 0 0;">E-Commerce Platform Team</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 6px; margin-top: 15px;">
          <p>© ${new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
          <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    `;

    // Check email configuration before attempting to send
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.warn("Missing email configuration. Using fallback response.");
      return res.json({
        success: true,
        message: "Email service not configured",
      });
    }

    try {
      // Send email with invoice button (no PDF attachment)
      const result = await sendEmail(
        recipientEmail,
        `Invoice for Order #${order._id
          .toString()
          .substring(0, 8)
          .toUpperCase()}`,
        emailContent
      );

      res.json(result);
    } catch (emailSendError) {
      console.error("Email sending failed:", emailSendError.message);

      // Return a more graceful error to the client
      res.status(200).json({
        success: false,
        message: "Email delivery failed",
        error: emailSendError.message,
      });
    }
  } catch (error) {
    console.error("Error in invoice email process:", error);
    // Return 200 status with error details to prevent order payment from failing
    res.status(200).json({
      success: false,
      message: "Error processing invoice email request",
      errorType: error.name,
      errorMessage: error.message,
    });
  }
};
