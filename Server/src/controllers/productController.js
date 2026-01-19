const Product = require("../models/Product");
const mongoose = require("mongoose");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, keyword, sort, limit, min, max, rating } = req.query;
    const queryFilter = {};

    // Apply category filter if specified
    if (category) {
      queryFilter.category = category;
    }

    // Apply keyword search if specified (search in name and description)
    if (keyword) {
      // Escape special regex characters to prevent ReDoS attacks
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryFilter.$or = [
        { name: { $regex: escapedKeyword, $options: "i" } },
        { description: { $regex: escapedKeyword, $options: "i" } },
      ];
    }

    // Apply price range filter
    if (min || max) {
      queryFilter.price = {};
      if (min) queryFilter.price.$gte = Number(min);
      if (max) queryFilter.price.$lte = Number(max);
    }

    // Apply rating filter
    if (rating) {
      queryFilter.rating = { $gte: Number(rating) };
    }

    // Set up sorting options
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case "price-low-high":
          sortOption = { price: 1 };
          break;
        case "price-high-low":
          sortOption = { price: -1 };
          break;
        case "name-a-z":
          sortOption = { name: 1 };
          break;
        case "name-z-a":
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 }; // Default sort by newest
    }

    // Check if pagination is requested (for backward compatibility)
    if (req.query.page) {
      // Pagination
      const pageSize = Number(req.query.pageSize) || 20;
      const page = Number(req.query.page) || 1;

      const count = await Product.countDocuments(queryFilter);
      const products = await Product.find(queryFilter)
        .sort(sortOption)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

      return res.json({
        products,
        page,
        pages: Math.ceil(count / pageSize),
        totalProducts: count,
      });
    }

    // No pagination - return all products
    const count = await Product.countDocuments(queryFilter);
    const products = await Product.find(queryFilter)
      .sort(sortOption)
      .limit(Number(limit) || 0); // Use limit if provided, otherwise return all

    res.json({
      products,
      totalProducts: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({ featured: true })
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
// @access  Public
exports.getProductCategories = async (req, res) => {
  try {
    // Find all unique categories from the products collection
    const categories = await Product.distinct("category");

    // Sort alphabetically
    categories.sort();

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    // Return early if no ID is provided
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock, featured } =
      req.body;

    // Basic validation
    if (
      !name ||
      !description ||
      price === undefined ||
      !imageUrl ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      stock: stock || 0,
      featured: featured || false,
      user: req.user._id, // Add the required user field from the authenticated user
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, price, imageUrl, category, stock, featured } =
      req.body;

    // Return early if no ID is provided
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.imageUrl = imageUrl || product.imageUrl;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.featured = featured !== undefined ? featured : product.featured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    // Return early if no ID is provided
    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate required fields
    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Return early if no ID is provided
    if (!productId || productId === "undefined" || productId === "null") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If the product doesn't have a user field, add it using the current user
    if (!product.user) {
      product.user = req.user._id;
      await product.save();
      console.log(`Added missing user field to product ${product._id}`);
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    // Create new review
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // Add review to product
    product.reviews.push(review);

    // Update product rating and review count
    product.numReviews = product.reviews.length;

    // Calculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    // Save product with new review
    await product.save();

    res.status(201).json({ message: "Review added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;

    // Return early if no ID is provided
    if (!productId || productId === "undefined" || productId === "null") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId).populate(
      "reviews.user",
      "name",
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
exports.deleteProductReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviewId = req.params.reviewId;

    // Return early if no IDs are provided
    if (!productId || !reviewId) {
      return res
        .status(400)
        .json({ message: "Product ID and Review ID are required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the review
    const review = product.reviews.find((r) => r._id.toString() === reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the review belongs to the logged-in user or if user is an admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    // Remove the review
    const updatedReviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId,
    );
    product.reviews = updatedReviews;

    // Update product rating and review count
    product.numReviews = product.reviews.length;

    // Recalculate average rating
    if (product.reviews.length > 0) {
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.rating = 0;
    }

    // Save product with updated reviews
    await product.save();

    res.json({ message: "Review removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
