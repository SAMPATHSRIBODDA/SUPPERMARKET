# Razorpay Integration - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get API Keys
1. Go to https://dashboard.razorpay.com
2. Login/Signup
3. Settings → API Keys
4. Copy Key ID and Key Secret

### Step 3: Add to .env.local
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Step 4: Start Development
```bash
npm run dev
```

### Step 5: Test Payment
1. Open http://localhost:3000
2. Add items to cart
3. Go to checkout
4. Select **UPI** payment
5. Click **Place Order**
6. Complete payment in modal

## 📋 Implementation Checklist

- [x] Razorpay SDK installed
- [x] API routes created (/api/orders/create, /api/orders/verify)
- [x] Payment handler implemented
- [x] UPI button added to checkout
- [x] Signature verification implemented
- [x] Error handling added
- [ ] Environment variables configured (YOUR TASK)
- [ ] Dependencies installed (YOUR TASK)
- [ ] Tested with test API keys (YOUR TASK)

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `app/api/orders/create/route.ts` | Create Razorpay orders |
| `app/api/orders/verify/route.ts` | Verify payment signatures |
| `app/page.tsx` | Payment handler & UI updates |
| `package.json` | Razorpay dependency |
| `.env.local` | API keys (you fill this) |
| `.env.example` | Template for env vars |

## 🔧 Configuration

### Environment Variables
```env
# Required
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Optional (for MongoDB)
MONGODB_URI=your_mongodb_uri
```

### Test Mode Keys
When in Razorpay Test Mode:
- Key ID: `rzp_test_xxxxx` (provided automatically)
- Key Secret: `xxxxx` (provided automatically)

## 🧪 Testing

### Test Payment Flow
```
1. Add items to cart
2. Proceed to checkout
3. Fill address & delivery slot
4. Select UPI
5. Click Place Order
6. Use test card: 4111 1111 1111 1111
7. Any expiry, any CVV
8. Order status → "Paid"
```

### Test Payment Methods
- **Cards**: 4111 1111 1111 1111
- **UPI**: Use any test UPI app
- **Wallets**: Available in test mode

## 💡 Key Features

✅ **Secure**: HMAC-SHA256 signature verification
✅ **Fast**: Instant payment processing
✅ **Easy**: One-click payment modal
✅ **Reliable**: Server-side verification
✅ **User-friendly**: Clear payment UI

## 🎯 API Endpoints

### Create Order
```
POST /api/orders/create
Body: { amount, orderId, customerName, customerEmail, customerPhone }
Response: { orderId, amount, currency, key }
```

### Verify Payment
```
POST /api/orders/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
Response: { success, message, paymentId, orderId, amount }
```

## 📊 Order Status

- **"Confirmed"**: COD or unpaid
- **"Paid"**: Razorpay UPI payment completed
- **Payment ID**: Stored in order for tracking

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` |
| Verification failed | Check API secret in .env.local |
| Script load error | Check internet connection |
| Modal doesn't open | Verify API key is correct |

## 📞 Support

- **Razorpay Help**: https://razorpay.com/support
- **Docs**: https://razorpay.com/docs
- **Dashboard**: https://dashboard.razorpay.com

## 🔐 Security Reminders

⚠️ Never commit `.env.local`
⚠️ Keep API secret confidential
⚠️ Always verify signatures server-side
⚠️ Use HTTPS in production

## 📈 Next Steps

1. Install dependencies
2. Add API keys to .env.local
3. Test with test mode
4. Verify everything works
5. Switch to live keys when ready

---

**Ready to go!** 🎉 Follow the Quick Setup steps and you'll be processing payments in minutes.

For detailed information, see:
- `RAZORPAY_SETUP.md` - Complete setup guide
- `RAZORPAY_INTEGRATION.md` - Integration details
- `RAZORPAY_FEATURES.md` - Features documentation
