// Order validation utilities

/**
 * Validate shipping address
 * @param {Object} address - The shipping address to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateShippingAddress = (address) => {
  const errors = [];

  if (!address) {
    return { isValid: false, errors: ["Shipping address is required"] };
  }

  const requiredFields = ["street", "city", "state", "postalCode", "country"];

  requiredFields.forEach((field) => {
    if (!address[field] || address[field].trim() === "") {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      );
    }
  });

  // Validate postal code format (basic validation)
  if (
    address.postalCode &&
    !/^[0-9]{5,10}$/.test(address.postalCode.replace(/\s/g, ""))
  ) {
    errors.push("Invalid postal code format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate order items
 * @param {Array} items - The order items to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateOrderItems = (items) => {
  const errors = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return { isValid: false, errors: ["Order must contain at least one item"] };
  }

  items.forEach((item, index) => {
    if (!item.product) {
      errors.push(`Item ${index + 1}: Product ID is required`);
    }
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Quantity must be at least 1`);
    }
    if (item.quantity > 10) {
      errors.push(`Item ${index + 1}: Maximum quantity per item is 10`);
    }
    if (!item.price || item.price < 0) {
      errors.push(`Item ${index + 1}: Valid price is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate order totals
 * @param {Object} totals - The order totals to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateOrderTotals = (totals) => {
  const errors = [];

  if (totals.subtotal < 0) {
    errors.push("Subtotal cannot be negative");
  }
  if (totals.taxAmount < 0) {
    errors.push("Tax amount cannot be negative");
  }
  if (totals.shippingAmount < 0) {
    errors.push("Shipping amount cannot be negative");
  }
  if (totals.totalAmount < 0) {
    errors.push("Total amount cannot be negative");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateShippingAddress,
  validateOrderItems,
  validateOrderTotals,
};
