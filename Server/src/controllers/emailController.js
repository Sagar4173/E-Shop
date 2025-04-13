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
              ${order.shippingAddress.fullName || ""}<br>
              ${order.shippingAddress.address}<br>
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
      console.log("Email sending skipped in development");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${htmlContent.substring(0, 100)}...`);
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
    console.log("Email sent: %s", info.messageId);
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

// Helper function to send emails with attachments
const sendEmailWithAttachment = async (
  to,
  subject,
  htmlContent,
  attachments
) => {
  try {
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

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"E-Commerce Platform" <no-reply@ecommerce.com>',
      to,
      subject,
      html: htmlContent,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email with attachment:", error.message);
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
};

// Helper function to generate invoice PDF
const generateInvoicePdf = async (order) => {
  try {
    // Use PDFKit to generate a PDF invoice that matches the client-side jsPDF version
    const PDFDocument = require("pdfkit");
    const fs = require("fs");
    const path = require("path");

    // Convert MongoDB ObjectId to string if needed
    const orderIdString = order._id.toString();

    // Create a document with A4 size
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Invoice-${orderIdString.substring(0, 8).toUpperCase()}`,
        Author: "E-Commerce Platform",
      },
    });

    // Page dimensions
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Define common colors to match client-side
    const colors = {
      lightBlue: "#f5f7fa",
      blue: "#3B82F6",
      green: "#27ae60",
      red: "#e74c3c",
      darkText: "#282828",
      lightText: "#505050",
      grayText: "#646464",
      borderGray: "#dcdcdc",
    };

    // Add light blue/gray background for the header area
    doc.rect(0, 0, pageWidth, 40).fill(colors.lightBlue);

    // Add separator line
    doc
      .strokeColor(colors.blue)
      .lineWidth(0.5)
      .moveTo(50, 40)
      .lineTo(pageWidth - 50, 40)
      .stroke();

    // Load the company logo or add text header instead
    // This is a base64 encoded logo similar to the client-side version
    const logoBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAA9OSURBVHic7Z15cFTXfcc/v/de70m7QiAJSUjGMggQIMBgG9s4vrDj2I6TetL4kjiNM2k64zTjJm2SZtKZpJ12xp12Jk1dZ5Lxn43HdYJjsLFxjA0GjG3AAglJSEII3Uho71vt9vrHvoXQhaS3q6cR/D4zO7zvvXN+5/x+v7vn3PM75xcJBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFA8L8TWdSqpZiVpaOMKqgr5nrmG0VRkBBIKFgsNsxp5qmo85K9AaCurk6Z37Q437KaZ+DDhw/LudhzLFaLNC+CzyeKogACERkkkJCRJQlVyc12VVHsQI4BYFRUxca9wMX0dCzbDFBXV6dcvHjREm/+vXv3SpFIxDJbWZJkBlCQJYlQMPSBrJnJykZRFOrq6pTDhw/LkyMbYN68eZGcnJxJkxwVunr1qu348ePlRUVFwdLS0sB8jz4mk2nakTc0NGTr6em2OZ1Oc3FxcThdoQOBAIqiEA6HMRqNaDnsphb/+Z7jEWZUAMePHzc1NTU5btiwYU337t27j1tNQrS1tVkbGxttJSUlQZfLpZWUlISyMjMnL1dXW2BlJBIZu2sEbreb/v5+TCYTmZmZ2Gw2LBYLRqMxLfnHwVpWVhZOW9YpjImNjY5F/RnA4XBEDhw48Hl93A/qvGfOnHGuWbMmmJ+frwGYTCbnUmmJZkJbWxsBvx+f14vP5yMcDg9dCwaDBAIBIpEIiqKMRNzZs2fL77777iKLxSKbTCZMJhPJtPTgwYOVzz333FfOnTuX3dDQ4OztkbMAysvLeyoqKprr6+vTrgYyDQAhwGSer91u1yorK8Nz584NAZCdlTVj+cbGRlfla6+t7OjoWBoOh6XBwcGRa3a7nYyMDHJycsjJziYrK2tMBNjtdkpKSrBarXgGs1FVlb6+PmpqalxvvfXWrkAgsOiFF16oPnHixMpjh49WBYPBCu/QewsGg0giMiwvdru9fvz48brzMxW3mCmbQxP666LsjPcejP45qK16p++Pb8/79TpZ7LC6u7v3K7L0cu/QiyYUS1Qe+d3QWEZ1aCzxRUjJ3ZeenPgv73zopNmuKMpZXVfPDue5SjY2zMrds9X8H+In08Z9iwT3eoxDU/nH9vnEHonimDSRHNJYvgvBTOVOGOtMdNoUY9CIK9EUaVKO9QYC/D1nPsNiYN9T2RiSnFSa7sb2EzXoQk6JFJBqTJxswJPNnbYOZ2qa+BxpyfFfG/sM8y/u3Fs7U10njfBz2a6ZzvgnzSfRNTrVWBJdS5TXTMqeruzxnzfdXDwppoz5fwQA/Dt3rsP/4ov8erZ6TACAL/zN5aLnH5t3Zvv24nQlnStMSgArVy7vsNlsddOEijISuKOvP7h69YPZJ0+W5HZ3Z2dGo3kbTbJUd/DgWHus3nQnOZtM2jgPBAIZff39War6wWYyPaSBywC5ubljhs3pdKru7u5RHUYVUBRFU1UV3/VEOvF5FUWTZRlZVkBRVbPZLMuyjJqIwdFDsNHA5ZHtd+uPHk5CDvGMTiuNymOI3QMnHoMiOUbeDz0DSi68RJEkFhb5yc3NDQNYh+2Ttw057/ceq/mJy+U6abfbLx4+fDivoaHh67rO5s7OzqxwOJwXyZDzJEnOkyQpT5KkPF3X82RNMT04ZyiA1Wu3TBsjtbRXsrS0dCselwOyLGmyLGuyLGvqcMRoajTX1tbW3djYuBZgbGVC19TUNLeclIHZ2KUEgsFgra7rCVnkdDojy5cv9wMsXry4J14bt2/fXjlTufFZWlpCBhsNTJ8AOps1ERkBRAMBu9/vz2htbc2N7xjK8rrJKIqiWa3WiGNcvDCa2SzEghm6f7OJACn9vlnTdR1tYCDT4/HMueM3rwJQFEXNyMhIaPg/eBdZVX39OW1tbSOXdu/ebQlg7Q2HIzuBVUlUNY8EME0Nks7JzgkyLTNKphcbqa6uPgswZ86cnm3btlX09/fXJix85Nm3f//9qTmhwhyUkmWPpyMYDL7Y2Nj4JeAA8Gv9fjrgZ84+Y1IQrS2663PKpRFmVQUSiLkw5gRaq8T7+/t3Llu27PG9e/duALBYLA+OT3P+/Pmc/v7+eum6Q+Pew4cP551p6/q1p8dbIqdfqpnElChJ+e2Ro0evdnZ2dnV2dlZ7PJ6OtrY2taGhIbu5udkWjUYLABYuXDjsIVpNJpP27rvvug4ePFilaVrVW2+9tdNut+/s7+8fdodHi5mYwciTtxEuXrxYWlFR8a+vvPLKlzt8XeUmk8m0aNGisurq6u22rAwIR3C73Vp+fn5Ef/ob7e3t7XVqweDCq1evVvv9/jNdXV3nS0pKjra0tGidnZ1aOBzWs7KytG3btrkBS0l5+eVZxYWp1ATxDHuErKapmM1mJMOKefPs9utLy97mecMKLVTuZ3VPPnvN9SQVTFJIkmgrkK3QoNeRqPBpaJEZv3vKpcWUTxsT3TcRVVVdDxTKspwXiUY3BYNBQpHISuBrxcXF4XvuuQdN0zAMw5OdnV0G/Kver/nA4scffzxz4rh+7W/d6caQRhsQ64J5vMCzZNw0/dGilasWT7F5zp07t8Nut7/kdDp/NTo/AJf6LnH23FmUcCR37x93v+RyuSKmSOZDTv0CU7cksm/XrkfCodB+RVFU4EdAMBKNntU07a8k+B3g0vA2f3lRoQ7QfK6lLBgK/qXT6TxiGMbb4XA4CAqHDx9WPB6PLRgMPvXVr351h6qqLl3X/xh4lKsn30JT9TtG9cCGv2UqA2Z6nG9QTUw2PTsdNmzYMFhVVXXRYrHsN+zZhoDPH9ZAMwyD9rbOXz7zzDNOm80mW61WeTrvIJWcpgVJJoAGFEpXjkpShiYZvu4+TX5+PlfrOykz98D//PFj0+pjsbGc+ckjiQh07733dgJMF32DQ3HKtuh+We6RJElX5XEDXmHOAsAk2QO6LmvwcLKyvO7fTdczZ1tIkgFLgJ8PwK39+/dfHhgY+JnVaq30er3GvHnzLvl8vteB+K2G56ZYwHnisceeh/hzsPHocP6kD80CZmJDlGdoRmcV+v3+rFgs9zQyfm+8OVdVlZgyMyqAvLw8DfhZ/JGLXq/3n4KBwOPhcGS7qqrYbfYLX3jiiQaAP/jye+UYbEstf73fc+p0w7hHUA9W7GDBjXFM9X/6RlUkqQCmqgl2P/XUojfeeKP0xIkTjpaWFg40NIyvpr4L3uGhznT7jx09mqVdv/y9iKZpezFFLh3u7PifaOz/hn50kTfpSWZTMdU1+NPQkIUUJYkXwyV4xQcw/5HynzcbfDeeyvYDnz148OAjPM6jmVlelW3bDnz55x3vLUCPrLJl0mYymVQDeMNisUQARv7IR4E7utrbf4EkZeZkZe0tf2gPWy4eOn9rdvN53n++jazzDU+bLVa6y8rk9oWL6Hrsscccc+bOuTc7J3ub3WbLValvZ4TmQHgxIBuGUd1pMkWB8GhF6CNRbUw7Hegb4OoplcJYLJZVUlLincqimXr5Ezp+E9T1BgNkXOZw+ea5Ob8g+l6GYp5vNKAcKAH+CFgGGKqqiuHw0AaoFLPZHHI4HBGGdmKvXLnSp6pqWgLs3bs3z2Qy/YnJZPrAwkiSpOnXmiy/37/VYDRypVJDk+R5si5T18f7H9dlOQ0MAGdJ3a8QXR0Wcwx4Z+i8rp6elopcLOaOIdYPPTVfA5z6mGXQ4sBS4LbhfHRdJxaLRWVZRtM0e4KiJoUkSQSDQYLBIEDvaLtHMZhosJXA94F5qRRSmROK/TvwGrAb+AaQxxSC2pPgesKUAI9z1d8xSXogEOgCFMaPlSQRS5Gn4ycqiqKMPOkkSUY3DKxWK+vXrzfPdHJROmQmuH4H8E/A9hw7PTN9w2vdO9h6HGgB/nZMHgm8tykpTSsDzrvv/gC2VJWXlGqUeYO0ZFzm2wq0fwgDH4dhFsfi4+F1hCvABcCnGCgLFtE4p4wjBfnc6XSyxwQBxqcf+UIy9+RZ3LzTDy5VtnREmC4mzR6lQAUwH1gQ08j0ROjJzuTHA37WJvG88yZS7Myf1VrAJErIi4SOmvl1Z5DTeVlslmUeNUngzaEbuz3fqM0pXPPddB/oInGFjwMo6w/RVeigpEfmG2EVizfKf1wMckb/UGDaglyoM2dEe/PNdamSuRGm9AZuZtFunwBQeJnvc0P8zfmSzm3deofcM9t2PSxkOMaIYKKnQjckgC5Lo7ZJBzLj1ZsiMOdK/L8iXM+wDtAZiTBRBJMV+mHtBpZTnAnsZGpHUjbXehpThcxf5phjmmzcrvxcpzuDTuCDCeinehndGJpy+9aHoQn4EnG9gWRIqgloI0s7DjTs4JLZzlPerIdNJtM8WZYFH2JCuszrvpRUxw5iWkN+w1qGPxEjNnPVsOSXZzNUhcI809nJFqezf5Mssy47O9tnMpkEC5JEMgw+wQfnNs4SKQJ46cghDubnVd9ssS6x2Wx/b7PZ2lRVLbLZbKPmLIQ2ZopkePDt5ERqhZFSAKOZLIJwOIzb7aavr6/I5/N1XXrvsvXNN998srGx8b6CgoKuTZs2tYdC4Q6/3y94MEs8+IFvk2QnsEeS9jidzj8Hfgpkx1+rra1tA9oArFarCpSqKrUYhpH29q8bFsmIxJfkzGHgb0jS7ZdsEwBTiwCgsbGxorGxcb3H4ymLxWIZAIFAIA/Y7fF4lnu93jKv17vs/PnzZR6PZ5nX66sKBPwldnvGLA2SCWYVnGYZyVLRpBxBu3fvflC/OnTAMPTNsTjAoOtXoKuXZpblH1ssFknXdVnX9ZQdQVPp5GYiWUeQJMn/abVaP+XQ9U+HIpFI1dtvv32fx+OpCQaDZT09PdVdXV1VXm/vtdfs95IJycYBoyeApJxBe/bsWeFyufbnZGcHFVmWYrFY7ODzz28KBAKLs7OySzVNW2C1Whe4XK6SRYsWtZWXly86derUdQGM6rENHfKYLNcP91TAIl1LeKrPHzq/1g5RFCU6nG6S9JNlPeG83OFRfeib+icbn0ZRlMiQN+5trkUCQ1+cTrxcdTqNjhemoOdHlOl8AYmPoGEMw/gPINHeeutn3I+PH3n88T9XwiHesVqtfr/fr7S1tVl7enpsfX19tn6fzxYIBGzBYMAWDAbtgUDAHgwG7IqiLOnr66tMckcSpNULyADodDlduiRJVQZcbc8kGxbl+jHpsbsVmDShFFSIdW/UiP3BYPC5QCBQY7PZ+lVVdWdkZPTl5eX19PR0uYPBYFYo5O8MBAK5fr/fEQqHX8zIyLB3D/TXmkyKyev35aUn7s1BIotBRVWVVeZ5+R0CgwrgyIZcQYBglqjICVw570JdYMQzYow7Z+TEzPuR9xMPdX7YMEU2fexWiJRWlG8YBNmS+QIRUEM/pMF9AoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAj+V/F/vWJX+Z+VgesAAAAASUVORK5CYII=";

    try {
      // Add logo from base64 data
      doc.image(Buffer.from(logoBase64.split(",")[1], "base64"), 50, 10, {
        width: 40,
        height: 18,
      });
    } catch (logoErr) {
      console.error("Logo error:", logoErr);
      // Fallback to text header
      doc
        .fontSize(22)
        .fillColor(colors.darkText)
        .text("E-Commerce Platform", 50, 15)
        .fontSize(10)
        .fillColor(colors.lightText)
        .text(
          "www.ecommerceplatform.com | support@ecommerce.com | +91 1234567890",
          50,
          30
        );
    }

    // Add invoice title with a colored background
    doc.rect(pageWidth - 170, 10, 120, 12).fill(colors.blue);
    doc
      .fillColor("white")
      .fontSize(16)
      .text("INVOICE", pageWidth - 110, 18, { align: "center" });

    // Add payment status
    if (order.isPaid) {
      doc.rect(pageWidth - 170, 25, 120, 8).fill(colors.green);
      doc
        .fillColor("white")
        .text("PAID", pageWidth - 110, 31, { align: "center" });
    } else {
      doc.rect(pageWidth - 170, 25, 120, 8).fill(colors.red);
      doc
        .fillColor("white")
        .text("UNPAID", pageWidth - 110, 31, { align: "center" });
    }

    const startY = 50;

    // Add left column - Customer info with nice box
    doc.rect(50, startY, 230, 35).fill(colors.lightBlue);
    doc.rect(50, startY, 230, 35).lineWidth(1).stroke(colors.borderGray);

    doc
      .fontSize(11)
      .fillColor(colors.blue)
      .text("BILL TO:", 53, startY + 6);

    // Customer name and address
    const customerName =
      typeof order.user === "string"
        ? "Customer"
        : order.user?.name || "Customer";
    doc
      .fontSize(10)
      .fillColor(colors.darkText)
      .text(customerName, 53, startY + 12)
      .text(
        order.shippingAddress.address || order.shippingAddress.street || "",
        53,
        startY + 18
      )
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
        53,
        startY + 24
      )
      .text(order.shippingAddress.country || "N/A", 53, startY + 30);

    // Add right column - Invoice info with nice box
    doc.rect(pageWidth - 280, startY, 230, 35).fill(colors.lightBlue);
    doc
      .rect(pageWidth - 280, startY, 230, 35)
      .lineWidth(1)
      .stroke(colors.borderGray);

    doc
      .fillColor(colors.blue)
      .text("INVOICE DETAILS:", pageWidth - 277, startY + 6);

    // Invoice details - left side labels
    doc
      .fillColor(colors.grayText)
      .text("Invoice Number:", pageWidth - 277, startY + 12)
      .text("Order Number:", pageWidth - 277, startY + 18)
      .text("Invoice Date:", pageWidth - 277, startY + 24)
      .text("Order Date:", pageWidth - 277, startY + 30);

    // Invoice details - right side values
    const invoiceDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    doc
      .fillColor(colors.darkText)
      .text(
        `INV-${orderIdString.substring(0, 8)}`,
        pageWidth - 120,
        startY + 12,
        {
          align: "right",
        }
      )
      .text(
        `#${orderIdString.substring(0, 8).toUpperCase()}`,
        pageWidth - 120,
        startY + 18,
        { align: "right" }
      )
      .text(invoiceDate, pageWidth - 120, startY + 24, { align: "right" })
      .text(orderDate, pageWidth - 120, startY + 30, { align: "right" });

    // Add tracking number section if available
    let itemsStartY = startY + 45;

    try {
      if (order.trackingNumber) {
        const trackingY = startY + 42;
        doc.rect(50, trackingY, pageWidth - 100, 15).fill("#ebf5fa");
        doc
          .rect(50, trackingY, pageWidth - 100, 15)
          .lineWidth(1)
          .stroke("#c8dcf0");

        doc
          .fillColor(colors.blue)
          .text("SHIPPING INFORMATION:", 53, trackingY + 6);

        doc
          .fillColor(colors.grayText)
          .text("Tracking Number:", 200, trackingY + 6);

        doc
          .fillColor(colors.darkText)
          .text(order.trackingNumber, 280, trackingY + 6);

        doc
          .fillColor(colors.grayText)
          .text("Shipping Method:", 400, trackingY + 6);

        doc
          .fillColor(colors.darkText)
          .text("Standard Shipping", 480, trackingY + 6);

        itemsStartY = trackingY + 25;
      }
    } catch (trackingErr) {
      console.error("Tracking error:", trackingErr);
      // Continue without tracking info if there's an error
    }

    // Add order items table
    doc
      .fontSize(14)
      .fillColor(colors.darkText)
      .text("Order Items:", 50, itemsStartY);

    // Table headers
    const tableTop = itemsStartY + 20;
    doc.rect(50, tableTop, pageWidth - 100, 20).fill(colors.blue);

    doc
      .fillColor("white")
      .fontSize(10)
      .text("Item", 60, tableTop + 7)
      .text("Description", 180, tableTop + 7)
      .text("Qty", 350, tableTop + 7)
      .text("Price", 390, tableTop + 7)
      .text("Total", 490, tableTop + 7);

    // Table rows
    let y = tableTop + 20;

    // Safety check for order items
    const safeOrderItems = Array.isArray(order.orderItems)
      ? order.orderItems
      : [];

    try {
      safeOrderItems.forEach((item, i) => {
        // Add alternating row backgrounds
        if (i % 2 === 0) {
          doc.rect(50, y, pageWidth - 100, 20).fill(colors.lightBlue);
        }

        const total = (item.price || 0) * (item.quantity || 1);
        // Truncate long names and descriptions to match client-side
        const name = item.name
          ? item.name.length > 15
            ? item.name.substring(0, 15) + "..."
            : item.name
          : "Product";
        const desc = item.description
          ? item.description.length > 20
            ? item.description.substring(0, 20) + "..."
            : item.description
          : "";
        const qty = item.quantity?.toString() || "1";
        const price = item.price?.toFixed(2) || "0.00";

        doc
          .fillColor(colors.darkText)
          .text(name, 60, y + 7, { width: 110 })
          .text(desc, 180, y + 7, { width: 160 })
          .text(qty, 350, y + 7)
          .text(`₹${price}`, 390, y + 7)
          .text(`₹${total.toFixed(2)}`, 490, y + 7);

        y += 20;
      });
    } catch (tableErr) {
      console.error("Error generating table:", tableErr);
      // Add a generic error message in the table area
      doc
        .fillColor("#e74c3c")
        .text(
          "Error displaying order items. Please contact support.",
          100,
          tableTop + 30
        );
      y = tableTop + 50; // Move below the error message
    }

    // Add separator line
    doc
      .strokeColor("#e1e1e1")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(pageWidth - 50, y)
      .stroke();

    y += 10;

    // Add totals
    doc
      .fillColor(colors.darkText)
      .text("Subtotal:", 400, y)
      .text(`₹${(order.subtotal || 0).toFixed(2)}`, 490, y);
    y += 15;

    doc
      .text("Shipping:", 400, y)
      .text(
        (order.shippingAmount || 0) > 0
          ? `₹${order.shippingAmount.toFixed(2)}`
          : "Free",
        490,
        y
      );
    y += 15;

    doc
      .text("Tax (18%):", 400, y)
      .text(`₹${(order.taxAmount || 0).toFixed(2)}`, 490, y);
    y += 15;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, y)
      .text(`₹${(order.totalAmount || 0).toFixed(2)}`, 490, y);
    doc.font("Helvetica");

    // Add return policy and payment information
    const policyY = Math.min(y + 40, 680); // Ensure it fits on page

    try {
      doc
        .fontSize(9)
        .fillColor(colors.lightText)
        .rect(50, policyY, pageWidth - 100, 25)
        .lineWidth(1)
        .stroke(colors.borderGray);

      doc.rect(50, policyY, pageWidth - 100, 6).fill(colors.lightBlue);

      doc
        .fillColor(colors.blue)
        .fontSize(10)
        .text("RETURN & PAYMENT INFORMATION", 52, policyY + 4);

      doc
        .fillColor(colors.lightText)
        .fontSize(9)
        .text(
          "• Return Policy: Items can be returned within 30 days of delivery in original condition.",
          52,
          policyY + 10
        )
        .text(
          "• Payment Method: " + (order.paymentMethod || "Credit/Debit Card"),
          52,
          policyY + 14
        );

      // Add note for refunds
      if (order.hasReturn) {
        doc.text(
          "• This order has an active return request. Refund will be processed after return is completed.",
          52,
          policyY + 18
        );
      } else {
        doc.text(
          "• For returns, visit your account dashboard or contact support@ecommerce.com",
          52,
          policyY + 18
        );
      }

      doc.text(
        "• To download a digital copy of this invoice, visit your account page at www.ecommerceplatform.com",
        52,
        policyY + 22
      );
    } catch (policyErr) {
      console.error("Error adding policy info:", policyErr);
      // Continue without policy section if there's an error
    }

    // Add footer
    try {
      doc
        .fontSize(8)
        .fillColor("#969696")
        .text(
          "E-Commerce Platform | Tax ID: GSTIN12345678 | www.ecommerceplatform.com",
          pageWidth / 2,
          pageHeight - 30,
          { align: "center" }
        )
        .text(
          `Invoice generated on: ${new Date().toLocaleString()} | Page 1 of 1`,
          pageWidth / 2,
          pageHeight - 20,
          { align: "center" }
        );

      // Add bottom border
      doc
        .strokeColor(colors.blue)
        .lineWidth(1)
        .moveTo(50, pageHeight - 40)
        .lineTo(pageWidth - 50, pageHeight - 40)
        .stroke();
    } catch (footerErr) {
      console.error("Error adding footer:", footerErr);
      // Continue without footer if there's an error
    }

    // Return a promise that resolves with the PDF buffer
    return new Promise((resolve, reject) => {
      try {
        let pdfData = Buffer.alloc(0);
        doc.on("data", (chunk) => {
          pdfData = Buffer.concat([pdfData, chunk]);
        });

        doc.on("end", () => {
          resolve(pdfData);
        });

        doc.on("error", (err) => {
          console.error("PDFKit error:", err);
          reject(err);
        });

        // Finalize the PDF
        doc.end();
      } catch (bufferErr) {
        console.error("Buffer error:", bufferErr);
        reject(bufferErr);
      }
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw new Error(`Failed to generate invoice: ${error.message}`);
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
// @access  Public
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

    // Generate the invoice PDF
    const pdf = await generateInvoicePdf(order);

    // Create a better invoice email template
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
          <p>Thank you for your order. Please find attached the invoice for your recent purchase.</p>
          
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
          
          <p>You can view your complete order details by logging into your account.</p>
          
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

    // Send email with PDF attachment
    const result = await sendEmailWithAttachment(
      recipientEmail,
      `Invoice for Order #${order._id
        .toString()
        .substring(0, 8)
        .toUpperCase()}`,
      emailContent,
      [
        {
          filename: `Invoice-${order._id
            .toString()
            .substring(0, 8)
            .toUpperCase()}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      ]
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending invoice email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending invoice email",
    });
  }
};
