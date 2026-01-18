const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null, // No limit if null
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // Unlimited if null
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: [
      {
        type: String,
      },
    ],
    // Users who have used this coupon
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function (userId, cartTotal) {
  const now = new Date();

  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, message: "This coupon is no longer active" };
  }

  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, message: "This coupon is not yet valid" };
  }

  if (now > this.validUntil) {
    return { valid: false, message: "This coupon has expired" };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit" };
  }

  // Check minimum purchase
  if (cartTotal < this.minimumPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of ₹${this.minimumPurchase} required`,
    };
  }

  // Check if user has already used this coupon (for single-use coupons)
  if (
    userId &&
    this.usedBy.some((u) => u.user.toString() === userId.toString())
  ) {
    return { valid: false, message: "You have already used this coupon" };
  }

  return { valid: true, message: "Coupon is valid" };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (cartTotal) {
  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (cartTotal * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  // Apply maximum discount cap if set
  if (this.maximumDiscount && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }

  // Ensure discount doesn't exceed cart total
  if (discount > cartTotal) {
    discount = cartTotal;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model("Coupon", couponSchema);
