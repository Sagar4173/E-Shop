// Product validation utilities

/**
 * Validate product data
 * @param {Object} product - The product data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateProduct = (product) => {
  const errors = [];

  if (!product.name || product.name.trim() === "") {
    errors.push("Product name is required");
  } else if (product.name.length < 3) {
    errors.push("Product name must be at least 3 characters");
  } else if (product.name.length > 200) {
    errors.push("Product name cannot exceed 200 characters");
  }

  if (!product.description || product.description.trim() === "") {
    errors.push("Product description is required");
  } else if (product.description.length < 10) {
    errors.push("Product description must be at least 10 characters");
  }

  if (product.price === undefined || product.price === null) {
    errors.push("Product price is required");
  } else if (isNaN(product.price) || product.price < 0) {
    errors.push("Product price must be a positive number");
  }

  if (product.stock !== undefined && product.stock !== null) {
    if (isNaN(product.stock) || product.stock < 0) {
      errors.push("Stock must be a non-negative number");
    }
  }

  if (!product.category || product.category.trim() === "") {
    errors.push("Product category is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate product review
 * @param {Object} review - The review data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateReview = (review) => {
  const errors = [];

  if (!review.rating || isNaN(review.rating)) {
    errors.push("Rating is required");
  } else if (review.rating < 1 || review.rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  if (!review.comment || review.comment.trim() === "") {
    errors.push("Comment is required");
  } else if (review.comment.length < 10) {
    errors.push("Comment must be at least 10 characters");
  } else if (review.comment.length > 500) {
    errors.push("Comment cannot exceed 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateProduct,
  validateReview,
};
