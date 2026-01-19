// User validation utilities

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user registration data
 * @param {Object} userData - The user data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateRegistration = (userData) => {
  const errors = [];

  if (!userData.name || userData.name.trim() === "") {
    errors.push("Name is required");
  } else if (userData.name.length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (userData.name.length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  if (!userData.email) {
    errors.push("Email is required");
  } else if (!isValidEmail(userData.email)) {
    errors.push("Invalid email format");
  }

  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate user profile update
 * @param {Object} updateData - The update data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateProfileUpdate = (updateData) => {
  const errors = [];

  if (updateData.name !== undefined) {
    if (updateData.name.trim() === "") {
      errors.push("Name cannot be empty");
    } else if (updateData.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (updateData.name.length > 100) {
      errors.push("Name cannot exceed 100 characters");
    }
  }

  if (updateData.email !== undefined) {
    if (!isValidEmail(updateData.email)) {
      errors.push("Invalid email format");
    }
  }

  if (updateData.phone !== undefined && updateData.phone !== "") {
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    if (!phoneRegex.test(updateData.phone)) {
      errors.push("Invalid phone number format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateRegistration,
  validateProfileUpdate,
};
