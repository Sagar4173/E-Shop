const User = require("../models/User");
const Product = require("../models/Product");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price imageUrl stock category rating description",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    // Return the updated wishlist with populated products
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price imageUrl stock category rating description",
    });

    res.status(201).json({
      message: "Product added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product is in wishlist
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      return res.status(404).json({ message: "Product not in wishlist" });
    }

    // Remove from wishlist
    user.wishlist.splice(index, 1);
    await user.save();

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isInWishlist = user.wishlist.includes(productId);

    res.json({ isInWishlist });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = [];
    await user.save();

    res.json({ message: "Wishlist cleared" });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
