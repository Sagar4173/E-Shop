// Client-side validation utilities

/**
 * Validate email format
 * @param email - Email to validate
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid flag and error messages
 */
export const validatePassword = (
  password: string,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate postal code format
 * @param postalCode - Postal code to validate
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  // Basic validation - supports most international formats
  const postalCodeRegex = /^[0-9]{5,10}$/;
  return postalCodeRegex.test(postalCode.replace(/\s/g, ""));
};

/**
 * Check if a string is empty or whitespace only
 * @param value - String to check
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === "";
};

/**
 * Validate credit card number (Luhn algorithm)
 * @param cardNumber - Card number to validate
 */
export const isValidCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate expiry date (MM/YY format)
 * @param expiry - Expiry date to validate
 */
export const isValidExpiryDate = (expiry: string): boolean => {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

/**
 * Validate CVV
 * @param cvv - CVV to validate
 */
export const isValidCVV = (cvv: string): boolean => {
  const cvvRegex = /^[0-9]{3,4}$/;
  return cvvRegex.test(cvv);
};
