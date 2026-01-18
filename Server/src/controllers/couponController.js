const Coupon = require("../models/Coupon");

// @desc    Validate and apply a coupon
// @route   POST /api/coupons/validate
// @access  Public (but user ID used if authenticated)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check if coupon is valid
    const userId = req.user ? req.user._id : null;
    const validation = coupon.isValid(userId, cartTotal || 0);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal || 0);

    res.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: discount,
      minimumPurchase: coupon.minimumPurchase,
      maximumDiscount: coupon.maximumDiscount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Apply coupon to order (mark as used)
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Mark coupon as used by this user
    coupon.usedCount += 1;
    coupon.usedBy.push({
      user: req.user._id,
      usedAt: new Date(),
    });

    await coupon.save();

    res.json({ message: "Coupon applied successfully" });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single coupon (admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    console.error("Get coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new coupon (admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
      applicableCategories,
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumPurchase: minimumPurchase || 0,
      maximumDiscount,
      validFrom: validFrom || new Date(),
      validUntil,
      usageLimit,
      isActive: isActive !== undefined ? isActive : true,
      applicableCategories: applicableCategories || [],
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a coupon (admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
      applicableCategories,
    } = req.body;

    // Check if new code conflicts with existing coupon
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      coupon.code = code.toUpperCase();
    }

    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumPurchase !== undefined) coupon.minimumPurchase = minimumPurchase;
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount;
    if (validFrom) coupon.validFrom = validFrom;
    if (validUntil) coupon.validUntil = validUntil;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableCategories)
      coupon.applicableCategories = applicableCategories;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await Coupon.deleteOne({ _id: req.params.id });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get active coupons for display
// @route   GET /api/coupons/active
// @access  Public
exports.getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    }).select(
      "code description discountType discountValue minimumPurchase validUntil",
    );

    res.json(coupons);
  } catch (error) {
    console.error("Get active coupons error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
