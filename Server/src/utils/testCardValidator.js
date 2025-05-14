// Test card validator for Stripe
// This utility checks if a card number is a Stripe test card to improve testing workflows

// Define test cards that always fail
const ALWAYS_FAILING_CARDS = [
  "4000000000000002", // Always declined
  "4000000000009995", // Insufficient funds decline
  "4000000000009987", // Lost card decline
  "4000000000009979", // Stolen card decline
  "4000000000000069", // Expired card
  "4000000000000127", // Incorrect CVC
  "4000000000000119", // Processing error
];

// Define test cards that always succeed
const ALWAYS_SUCCEEDING_CARDS = [
  "4242424242424242", // Visa success
  "4000056655665556", // Visa (debit) success
  "5555555555554444", // Mastercard success
  "2223003122003222", // Mastercard (2-series) success
  "5200828282828210", // Mastercard (debit) success
  "378282246310005", // American Express success
  "6011111111111117", // Discover success
  "3056930009020004", // Diners Club success
  "36227206271667", // Diners Club (14 digit card) success
  "3566002020360505", // JCB success
];

// Define 3D Secure test cards (which require additional verification)
const THREEDS_CARDS = [
  "4000002760003184", // 3D Secure 2 authentication required
  "4000000000003220", // 3D Secure 2 authentication required (US-issued card)
  "4000000000003063", // 3D Secure 2 authentication required, but fails
  "4000008400001629", // 3D Secure 2 authentication required, setup for failure
  "4000000000003055", // 3D Secure 2 authentication required, but rejected
];

/**
 * Checks if a card number is a known Stripe test card
 * @param {string} cardNumber - Credit card number to check
 * @returns {object} Result containing info about the test card
 */
function isTestCard(cardNumber) {
  // Clean up the card number
  const cleanedNumber = cardNumber?.replace(/\D/g, "");

  if (!cleanedNumber) {
    return {
      isTestCard: false,
      willSucceed: false,
      requires3DS: false,
      description: "Not a valid card number",
    };
  }

  // Check if it's a test card
  if (ALWAYS_SUCCEEDING_CARDS.includes(cleanedNumber)) {
    return {
      isTestCard: true,
      willSucceed: true,
      requires3DS: false,
      description: "Test card that will always succeed",
    };
  }

  if (ALWAYS_FAILING_CARDS.includes(cleanedNumber)) {
    return {
      isTestCard: true,
      willSucceed: false,
      requires3DS: false,
      description: "Test card that will always fail",
    };
  }

  if (THREEDS_CARDS.includes(cleanedNumber)) {
    return {
      isTestCard: true,
      willSucceed: false, // Initially false since it requires another step
      requires3DS: true,
      description: "Test card requiring 3D Secure authentication",
    };
  }

  // Not a known test card
  return {
    isTestCard: false,
    willSucceed: false,
    requires3DS: false,
    description: "Not a recognized test card",
  };
}

module.exports = { isTestCard };
