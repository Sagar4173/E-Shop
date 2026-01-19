# Payment System Documentation

This document describes the payment validation system used in the E-Commerce Platform.

## Overview

The payment system integrates with Stripe for secure payment processing. It includes utilities for validating payments, handling test cards, and managing payment verification.

## Key Features

1. **Dual ID Support**: Handles both payment intent IDs (`pi_*`) and payment method IDs (`pm_*`)
2. **Direct Stripe Verification**: Validates payment status directly with Stripe API
3. **Test Card Support**: Special handling for Stripe test cards
4. **Test Mode Support**: Relaxed validation in test and development environments

## Files

- `Server/src/utils/paymentValidator.js` - Main payment verification logic
- `Server/src/utils/testCardValidator.js` - Stripe test card detection

## Payment Method ID Handling

When a payment method ID (`pm_*`) is provided instead of a payment intent ID (`pi_*`), the system:

1. Detects the ID type based on the prefix
2. For payment method IDs:
   - Retrieves the payment method details from Stripe
   - Searches for payment intents associated with this payment method
   - Falls back to test mode allowances if needed

## Test Mode Detection

The system automatically detects test mode based on:

1. Environment settings (`NODE_ENV !== "production"`)
2. Payment ID format (contains `_test_`)

In test mode:

- Payment verification is relaxed
- Missing payment intents are auto-approved
- All payment statuses are treated as valid
- Detailed mock payment responses are provided

## Status Verification

The system accepts multiple payment statuses as valid:

- "succeeded"
- "complete"
- "paid"
- "requires_capture"

## Usage Example

```javascript
const { verifyPaymentIntent } = require("../utils/paymentValidator");

// Verify a payment intent
const verification = await verifyPaymentIntent("pi_123456789");

if (verification.isValid) {
  // Process successful payment
} else {
  // Handle verification failure
  console.error(verification.message);
}
```

## Test Cards

For development and testing, use these Stripe test cards:

### Always Succeed

- `4242 4242 4242 4242` - Visa

### Always Fail

- `4000 0000 0000 0002` - Always declined

### 3D Secure Required

- `4000 0027 6000 3184` - Requires authentication

## Troubleshooting

### Payment Validation Failure

If you see errors like:

```
Payment verification failed: No payment intent found
```

Check:

1. Is the payment ID format correct (pi*\* or pm*\*)?
2. Is the server running in test mode?
3. Are Stripe API keys configured correctly?

### Server Error During Payment

If you see 500 errors during payment processing:

1. Check email configuration
2. Verify all environment variables are set
3. Check server logs for detailed error messages
