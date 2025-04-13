const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "OrderItem",
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "damaged",
        "defective",
        "wrong_item",
        "not_as_described",
        "no_longer_needed",
        "better_price_found",
        "accidental_order",
        "other",
      ],
    },
    otherReason: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    comments: {
      type: String,
    },
    refundMethod: {
      type: String,
      required: true,
      enum: ["original", "store_credit"],
      default: "original",
    },
    isInternational: {
      type: Boolean,
      default: false,
    },
    additionalNotes: {
      type: String,
    },
    photosUploaded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "returned",
      "cancelled",
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Changed from true to false to support guest checkout
      ref: "User",
    },
    isGuestOrder: {
      type: Boolean,
      default: false,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String }, // Added to store email for guest orders
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Stripe",
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    deliveredAt: {
      type: Date,
    },
    returns: [returnItemSchema],
    hasReturn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
