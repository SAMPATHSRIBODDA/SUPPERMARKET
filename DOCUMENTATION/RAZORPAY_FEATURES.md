# Razorpay UPI Payment - Feature Documentation

## Feature Overview

The Razorpay UPI integration allows users to make secure, instant payments using UPI (Unified Payments Interface) during checkout.

## User Experience Flow

### 1. Checkout Page
When user navigates to checkout, they see:
- Delivery address selection
- Delivery time slot selection
- **Payment Methods**: COD, UPI (Powered by Razorpay), Card

### 2. Selecting UPI
User selects UPI payment method button:
- Button turns blue with highlight
- Badge shows "Powered by Razorpay"
- Provides confidence of secure payment

### 3. Placing Order
When user clicks "Place Order":
1. Address and time slot validation
2. Backend creates Razorpay order
3. Razorpay Checkout page opens
4. User sees payment details and amount

### 4. Payment Options
Inside Razorpay checkout, user can choose:
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking
- Wallets

### 5. Payment Completion
After successful payment:
- Order status set to "Paid"
- Payment ID stored for reference
- Cart cleared automatically
- Redirected to Orders page
- Success message displayed

## Implementation Details

### Payment Flow Architecture

```
┌─────────────────────────────────────────────────┐
│         Frontend (Next.js React)                │
│  handleInitiateRazorpayPayment()                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    Backend API (/api/orders/create)             │
│  Creates Razorpay Order                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│      Razorpay Servers                           │
│  Generates Order ID and Key                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    Frontend Opens Razorpay Modal                │
│  User Completes Payment                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│    Backend API (/api/orders/verify)             │
│  Verifies Payment Signature                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  Create App Order with "Paid" Status            │
│  Clear Cart & Redirect to Orders Page           │
└─────────────────────────────────────────────────┘
```

## Code Examples

### Creating an Order (Backend)

```typescript
// POST /api/orders/create
const response = await fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 500,
    orderId: 'ORD1234567890',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '9999999999'
  })
});
```

### Response

```json
{
  "orderId": "order_JtZMNPKArJQyPj",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_live_xxxxx"
}
```

### Opening Razorpay Modal

```typescript
const options = {
  key: data.key,
  amount: data.amount,
  currency: data.currency,
  order_id: data.orderId,
  handler: async (response) => {
    // Handle payment response
    // Verify signature on backend
  },
  prefill: {
    name: 'John Doe',
    contact: '9999999999'
  },
  theme: {
    color: '#3b82f6' // Blue
  }
};

const paymentObject = new Razorpay(options);
paymentObject.open();
```

### Verifying Payment

```typescript
// POST /api/orders/verify
const response = await fetch('/api/orders/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    razorpay_order_id: 'order_xxx',
    razorpay_payment_id: 'pay_xxx',
    razorpay_signature: 'signature_xxx'
  })
});
```

## Database Schema

Orders created with Razorpay payments include:

```typescript
{
  id: 'ORD1234567890',
  userId: 'user_id',
  items: [
    {
      id: 1,
      name: 'Product Name',
      price: 500,
      quantity: 2,
      // ... other product details
    }
  ],
  address: {
    name: 'John Doe',
    phone: '9999999999',
    address: '123 Main St',
    city: 'Mumbai',
    pincode: '400001'
  },
  slot: {
    id: 1,
    label: 'Today, 2:00 PM - 4:00 PM'
  },
  paymentMethod: 'UPI',
  paymentId: 'pay_JtZMNPKArJQyPj',  // Razorpay Payment ID
  total: 1500,
  status: 'Paid',  // vs 'Confirmed' for COD
  createdAt: '2024-01-26T10:30:00.000Z'
}
```

## Error Handling

### Common Error Scenarios

1. **Invalid Amount**
   - Error: 400 Bad Request
   - Message: "Amount and orderId are required"

2. **Signature Mismatch**
   - Error: 401 Unauthorized
   - Message: "Payment verification failed"

3. **Network Error**
   - Error: 500 Internal Server Error
   - Message: "Failed to create order"

4. **Script Load Failure**
   - Message: "Razorpay script failed to load"
   - Solution: Check internet, retry

## Testing Scenarios

### Test 1: Successful Payment
1. Add items to cart
2. Go to checkout
3. Select UPI
4. Complete payment with test card
5. Verify order status is "Paid"
6. Check payment ID is stored

### Test 2: Payment Cancellation
1. Follow steps 1-3
2. Cancel payment in Razorpay modal
3. Verify app redirects to checkout
4. Verify cart items remain

### Test 3: Invalid Signature
1. Intercept payment response
2. Modify signature value
3. Submit verification
4. Verify error message displayed

### Test 4: Address Validation
1. Go to checkout without address
2. Select UPI
3. Click "Place Order"
4. Verify error: "Select delivery address"

## UI Components

### Payment Method Button

```tsx
<button
  onClick={() => setPaymentMethod('UPI')}
  className={`w-full p-4 border-2 rounded-lg text-left flex items-center justify-between ${
    paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
  }`}
>
  <span className="font-medium">UPI</span>
  <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">
    Powered by Razorpay
  </span>
</button>
```

### Place Order Button

```tsx
<button
  onClick={handleInitiateRazorpayPayment}
  disabled={processingOrder}
  className={`w-full mt-6 py-3 rounded-lg font-semibold ${
    processingOrder ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'
  }`}
>
  {processingOrder ? 'Processing...' : 'Place Order'}
</button>
```

## Razorpay Features Utilized

1. **Checkout.js**: Modal-based payment interface
2. **Order Management**: Server-side order creation
3. **Payment Gateway**: Multi-instrument payments
4. **Signature Verification**: HMAC-SHA256 security
5. **Test Mode**: Safe testing before going live

## Security Best Practices Implemented

1. ✅ Server-side signature verification
2. ✅ Secure key management (environment variables)
3. ✅ No keys exposed in client code
4. ✅ HTTPS compatible
5. ✅ Error messages don't leak sensitive data
6. ✅ Validation on both client and server
7. ✅ Payment ID stored for reconciliation

## Monitoring & Debugging

### Enable Console Logging

Add to `handleInitiateRazorpayPayment()`:
```typescript
console.log('Creating order with amount:', total);
console.log('Razorpay response:', data);
console.log('Payment signature:', response.razorpay_signature);
```

### Check Razorpay Dashboard

1. Visit https://dashboard.razorpay.com
2. Go to "Transactions"
3. Find your test payment
4. View payment details and order info
5. Check refund status if applicable

## Future Enhancements

- [ ] Webhook integration for real-time order updates
- [ ] Refund management UI
- [ ] Payment failure retry logic
- [ ] Multiple payment methods support
- [ ] Recurring payments for subscriptions
- [ ] Invoice generation and download
- [ ] Payment notifications via email/SMS

## Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Testing Guide**: https://razorpay.com/docs/payments/how-to-guide/testing/
- **Support Chat**: Available in Razorpay Dashboard

---

**Implementation Date**: January 26, 2026
**Status**: Ready for Testing
**Next Step**: Install dependencies and add API keys
