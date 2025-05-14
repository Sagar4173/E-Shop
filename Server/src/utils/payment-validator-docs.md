# Stripe Payment Validator Implementation

This module provides utilities for validating payments in the e-commerce system.

## Key Features

1. **Dual ID Support**: Handles both payment intent IDs (`pi_*`) and payment method IDs (`pm_*`)
2. **Direct Stripe Verification**: Validates payment status directly with Stripe API
3. **Test Card Support**: Special handling for Stripe test cards
4. **Test Mode Support**: Relaxed validation in test and development environments

## Implementation Details

### Payment Method ID Handling

When a payment method ID (`pm_*`) is provided instead of a payment intent ID (`pi_*`), the system:

1. Detects the ID type based on the prefix
2. For payment method IDs:
   - Retrieves the payment method details from Stripe
   - Searches for payment intents associated with this payment method
   - Falls back to test mode allowances if needed

### Test Mode Detection

The system automatically detects test mode based on:

1. Environment settings (`NODE_ENV !== "production"`)
2. Payment ID format (contains `_test_`)
3. In test mode:
   - Payment verification is relaxed
   - Missing payment intents are auto-approved
   - All payment statuses are treated as valid
   - Detailed mock payment responses are provided

### Status Verification

The system accepts multiple payment statuses as valid:

- "succeeded"
- "complete"
- "paid"
- "requires_capture"

### Error Handling

The system provides detailed error messages for different failure scenarios:

- Payment intent not found
- Payment method ID provided without matching intent
- Payment failed or requires additional action
- Network or API errors

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
