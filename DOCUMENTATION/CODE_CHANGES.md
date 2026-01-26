# Code Changes Reference

This document shows all the code changes made for Razorpay UPI integration.

## 1. package.json - Dependency Added

### What Changed
Added Razorpay SDK to dependencies.

### Before
```json
"dependencies": {
  "lucide-react": "^0.563.0",
  "mongoose": "^9.1.5",
  "next": "16.1.4",
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

### After
```json
"dependencies": {
  "lucide-react": "^0.563.0",
  "mongoose": "^9.1.5",
  "next": "16.1.4",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "razorpay": "^2.12.1"
}
```

---

## 2. app/api/orders/create/route.ts - NEW FILE

Complete new file created for Razorpay order creation.

```typescript
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerName, customerEmail, customerPhone } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and orderId are required' },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1,
      notes: {
        orderId,
        customerName,
        customerEmail,
        customerPhone,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

---

## 3. app/api/orders/verify/route.ts - NEW FILE

Complete new file created for payment verification.

```typescript
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 401 }
      );
    }

    // Fetch payment details to confirm
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not captured' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: payment.amount / 100, // Convert paise to rupees
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
```

---

## 4. app/page.tsx - State Variables Added

### Added After Existing State Variables (around line 90-97)

```typescript
const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
const [razorpayAmount, setRazorpayAmount] = useState<number>(0);
```

---

## 5. app/page.tsx - New Functions Added

### Added in CheckoutPage Component (around line 1507)

```typescript
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const handleInitiateRazorpayPayment = async () => {
  if (!selectedAddress) {
    setError('Select delivery address');
    setTimeout(() => setError(''), 3000);
    return;
  }

  if (!selectedSlot) {
    setError('Select delivery slot');
    setTimeout(() => setError(''), 3000);
    return;
  }

  if (paymentMethod !== 'UPI') {
    handlePlaceOrder();
    return;
  }

  setProcessingOrder(true);

  try {
    const total = calculateCartTotal().total;
    const orderId = `ORD${Date.now()}`;

    // Create order on server
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        orderId,
        customerName: currentUser?.name || 'Guest',
        customerEmail: 'customer@penumudies.com',
        customerPhone: currentUser?.mobile || '9999999999',
      }),
    });

    const data = await response.json();

    if (!data.orderId) {
      throw new Error('Failed to create order');
    }

    // Load Razorpay script
    const res = await loadRazorpayScript();
    if (!res) {
      throw new Error('Razorpay script failed to load');
    }

    // Show Razorpay payment modal
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Create order in app
            const order = {
              id: orderId,
              userId: currentUser?.id,
              items: activeCart,
              address: addresses.find(a => a.id === selectedAddress),
              slot: deliverySlots.find((s: any) => s.id === selectedSlot),
              paymentMethod,
              paymentId: response.razorpay_payment_id,
              total: calculateCartTotal().total,
              status: 'Paid',
              createdAt: new Date().toISOString()
            };

            setOrders([...orders, order]);
            if (currentUser) {
              setCart([]);
            } else {
              setGuestCart([]);
            }

            setProcessingOrder(false);
            setSuccess('Payment successful! Order placed.');
            setTimeout(() => {
              setSuccess('');
              setCurrentPage('orders');
            }, 2000);
          } else {
            setError('Payment verification failed');
            setProcessingOrder(false);
          }
        } catch (err) {
          setError('Payment verification error');
          setProcessingOrder(false);
        }
      },
      prefill: {
        name: currentUser?.name || 'Guest',
        contact: currentUser?.mobile || '9999999999',
      },
      notes: {
        address: addresses.find(a => a.id === selectedAddress)?.address,
      },
      theme: {
        color: '#3b82f6',
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  } catch (error) {
    console.error('Payment error:', error);
    setError('Failed to initiate payment');
    setProcessingOrder(false);
  }
};
```

---

## 6. app/page.tsx - Payment UI Updated

### Before (around line 1763)
```tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-bold mb-4">Payment</h2>
  <div className="space-y-3">
    {['COD', 'UPI', 'Card'].map(method => (
      <button
        key={method}
        onClick={() => setPaymentMethod(method)}
        className={`w-full p-4 border-2 rounded-lg text-left ${
          paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        }`}
      >
        {method}
      </button>
    ))}
  </div>
</div>
```

### After (updated)
```tsx
<div className="bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-bold mb-4">Payment</h2>
  <div className="space-y-3">
    {['COD', 'UPI', 'Card'].map(method => (
      <button
        key={method}
        onClick={() => setPaymentMethod(method)}
        className={`w-full p-4 border-2 rounded-lg text-left flex items-center justify-between ${
          paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <span className="font-medium">{method}</span>
        {method === 'UPI' && paymentMethod === method && (
          <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">Powered by Razorpay</span>
        )}
      </button>
    ))}
  </div>
</div>
```

---

## 7. app/page.tsx - Place Order Button Updated

### Before (around line 1816)
```tsx
<button
  onClick={handlePlaceOrder}
  disabled={processingOrder}
  className={`w-full mt-6 py-3 rounded-lg font-semibold ${
    processingOrder ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'
  }`}
>
  {processingOrder ? 'Processing...' : 'Place Order'}
</button>
```

### After (updated)
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

---

## 8. .env.local - Template for Configuration

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

---

## 9. .env.example - Environment Variables Template

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# MongoDB Configuration (if needed)
MONGODB_URI=your_mongodb_uri_here
```

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| `package.json` | Modified | Added razorpay ^2.12.1 |
| `app/api/orders/create/route.ts` | NEW | Razorpay order creation |
| `app/api/orders/verify/route.ts` | NEW | Payment verification |
| `app/page.tsx` | Modified | Added state, functions, UI |
| `.env.local` | Modified | Ready for API keys |
| `.env.example` | Modified | Added template |

---

## Total Code Added
- **Backend API Routes**: ~100 lines
- **Frontend Payment Handler**: ~150 lines
- **UI Updates**: ~20 lines
- **State Variables**: ~3 lines
- **Total**: ~270 lines of TypeScript/JavaScript

---

## Key Implementation Points

1. ✅ Razorpay SDK integrated
2. ✅ Order creation endpoint
3. ✅ Payment verification with signature
4. ✅ Frontend payment handler
5. ✅ UPI payment option in UI
6. ✅ Order status tracking
7. ✅ Error handling throughout
8. ✅ Environment variable management

All changes are backward compatible and don't affect existing functionality!
