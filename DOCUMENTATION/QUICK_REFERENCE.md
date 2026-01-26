# Quick Reference - Penumudies v1.2.0

## 🔐 Admin Login
- **URL**: Click user icon → "Admin Panel" or set `currentPage = 'admin'`
- **Username**: `admin`
- **Password**: `admin@123`

## 📦 Admin Features

### View Products
- Click "Refresh Products" button
- See all products with current price & stock

### Edit Product
1. Click "Edit" button on any product
2. Change price (₹) and/or stock quantity
3. Click "Save" to apply changes
4. See color-coded stock: 🟢 >20 | 🟡 1-20 | 🔴 0

### Delete Product
1. Select product and click "Edit"
2. Click "Delete Product" button
3. Confirm deletion
4. Product removed from inventory

## 🔍 Search Fix

### Problem Fixed
Search dropdown no longer closes when moving cursor over results

### How to Use
1. Click search bar
2. Start typing product name (or see trending)
3. Results appear and stay visible
4. Click on any result to view search page
5. Click outside to close dropdown

## 💳 Razorpay Payment (UPI)

### Checkout Flow
1. Add products to cart
2. Click checkout
3. Select address & time slot
4. **Select "UPI" payment method**
5. Click "Place Order"
6. Razorpay modal appears
7. Complete payment
8. Order created with "Paid" status ✅

### Test Card
- Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

## 📊 Payment Methods

| Method | Status | Notes |
|--------|--------|-------|
| COD | ✅ Works | Default, no payment needed |
| UPI | ✅ Works | Razorpay integration, test mode |
| Card | 🔄 Ready | Can be enabled anytime |

## 🛠️ API Endpoints

### Admin
- `POST /api/admin/login` - Login with username/password

### Products
- `GET /api/products/update` - Fetch all products
- `POST /api/products/update` - Update product (price/stock)
- `DELETE /api/products/update` - Delete product

### Orders (Razorpay)
- `POST /api/orders/create` - Create Razorpay order
- `POST /api/orders/verify` - Verify payment signature

### User
- `POST /api/users/login` - User login
- `POST /api/users/signup` - User signup
- `PUT /api/users/update-name` - Update name

## 📱 Page Routes

```javascript
const currentPage = 'home'     // Main store
const currentPage = 'search'   // Search results
const currentPage = 'admin'    // Admin dashboard
const currentPage = 'profile'  // User profile
const currentPage = 'checkout' // Checkout page
const currentPage = 'orders'   // Order history
const currentPage = 'login'    // Login page
const currentPage = 'signup'   // Sign up page
```

## 🎯 Common Tasks

### Login as Admin
```
1. Click user icon (top right)
2. Click "Admin Panel"
3. Username: admin
4. Password: admin@123
5. Click Login
```

### Edit Product Price
```
1. Login as admin
2. Find product in list
3. Click "Edit" button
4. Change "Price (₹)" field
5. Click "Save"
6. See update in store immediately
```

### Change Product Stock
```
1. Login as admin
2. Find product in list
3. Click "Edit" button
4. Change "Stock" field
5. Click "Save"
6. Stock updated in store
```

### Test UPI Payment
```
1. Add items to cart
2. Go to checkout
3. Select address & time
4. Select "UPI" payment
5. Click "Place Order"
6. Use test card: 4111 1111 1111 1111
7. Enter any future expiry & CVV
8. Payment completes
9. Order shows "Paid" ✅
```

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Search closes too fast | Already fixed! Try again |
| Admin login fails | Check: `admin` / `admin@123` |
| Products not updating | Click "Refresh Products" |
| Razorpay modal blank | Check internet, refresh page |
| Can't find Admin Panel | Login first, then click user icon |

## 📈 Current Status

- **Server**: Running ✅
- **Database**: Connected ✅
- **Razorpay**: Test mode ✅
- **Search**: Fixed ✅
- **Admin Panel**: Working ✅
- **All Features**: Operational ✅

## 🔗 Important Links

- **Store**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000` → User icon → Admin Panel
- **Razorpay Docs**: https://razorpay.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 📞 Support

For issues:
1. Check terminal for error messages
2. Open DevTools (F12) console
3. Check network tab for API calls
4. Verify environment variables in `.env.local`
5. Restart server: `npm run dev`

---

**Version**: 1.2.0  
**Status**: ✅ Complete & Tested  
**Last Updated**: January 26, 2026
