# Razorpay UPI Integration Guide

This document explains how to set up Razorpay UPI payment integration in the Penumudies e-commerce app.

## Overview

The Razorpay integration enables users to pay via UPI (Unified Payments Interface) during checkout. The integration uses Razorpay's secure payment gateway.

## Features Implemented

1. **UPI Payment Option** - Added UPI as a payment method in checkout
2. **Razorpay Order Creation** - Backend API to create Razorpay orders
3. **Payment Verification** - Secure payment signature verification
4. **Order Status Tracking** - Paid orders marked with "Paid" status
5. **Payment ID Tracking** - Razorpay payment IDs stored in orders

## Setup Instructions

### 1. Install Dependencies

```bash
npm install razorpay
```

The package.json has already been updated with the razorpay dependency.

### 2. Configure Environment Variables

Edit `.env.local` in the project root:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### 3. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Copy your Key ID and Key Secret
5. Paste them in `.env.local`

## File Structure

### New/Updated Files

- **`app/api/orders/create/route.ts`** - Creates Razorpay orders
- **`app/api/orders/verify/route.ts`** - Verifies payment signatures
- **`app/page.tsx`** - Updated with Razorpay payment handler
- **`package.json`** - Added razorpay dependency
- **`.env.example`** - Environment variable template

## How It Works

### Payment Flow

1. User selects "UPI" as payment method
2. User fills in delivery address and time slot
3. User clicks "Place Order"
4. Backend creates a Razorpay order
5. Razorpay checkout modal opens
6. User completes payment via UPI
7. Signature verified on server
8. Order status set to "Paid"
9. User redirected to orders page

### API Routes

#### POST `/api/orders/create`

Creates a Razorpay order.

**Request:**
```json
{
  "amount": 500,
  "orderId": "ORD1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9999999999"
}
```

**Response:**
```json
{
  "orderId": "order_123...",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_live_..."
}
```

#### POST `/api/orders/verify`

Verifies payment signature and completes payment.

**Request:**
```json
{
  "razorpay_order_id": "order_123...",
  "razorpay_payment_id": "pay_123...",
  "razorpay_signature": "signature..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "paymentId": "pay_123...",
  "orderId": "order_123...",
  "amount": 500
}
```

## Code Implementation Details

### Payment Handler Function

In `app/page.tsx`, the `handleInitiateRazorpayPayment()` function:

1. Validates delivery address and slot
2. Creates order via `/api/orders/create`
3. Loads Razorpay script dynamically
4. Opens Razorpay payment modal
5. Handles payment callback
6. Verifies payment via `/api/orders/verify`
7. Creates order record on success
8. Clears cart and redirects

### Key Features

- **Secure Payment Processing**: Uses HMAC-SHA256 signature verification
- **Dynamic Script Loading**: Razorpay script loaded only when needed
- **Error Handling**: Comprehensive error messages for payment failures
- **User-Friendly UI**: Badge shows "Powered by Razorpay" for UPI option

## Testing

### Test Mode

Razorpay provides test credentials for testing:

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to Test Mode (toggle in dashboard)
3. Use test payment credentials

### Test Payment Details

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits

For UPI testing, use any UPI app or contact Razorpay support for test credentials.

## Troubleshooting

### "Razorpay script failed to load"
- Check internet connectivity
- Verify browser console for CORS issues
- Ensure Razorpay domain is not blocked

### "Payment verification failed"
- Verify RAZORPAY_KEY_SECRET is correct in .env.local
- Check Razorpay order status in dashboard
- Ensure signature verification logic is correct

### "Order creation failed"
- Verify RAZORPAY_KEY_ID in .env.local
- Check API endpoint is accessible
- Review server logs for errors

## Security Notes

1. **Keep secrets safe**: Never commit .env.local to version control
2. **Signature verification**: Always verify signatures on the server
3. **HTTPS**: Ensure production uses HTTPS
4. **PCI Compliance**: Razorpay handles all PCI compliance

## Next Steps

1. Test with test credentials
2. Switch to live credentials when ready
3. Monitor orders in Razorpay dashboard
4. Set up webhooks for additional tracking (optional)

## Support

For Razorpay support, visit:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For app-specific issues, review the code comments in the API routes and payment handler.
