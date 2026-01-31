# 🚀 QUICK REFERENCE CARD - Penumudies App

**Print this or keep open while developing!**

---

## 📁 FOLDER SHORTCUTS

| Need to... | Go to... | Command |
|---|---|---|
| **Create API** | `app/api/[feature]/` | Create `route.ts` |
| **Add model** | `lib/models/` | Create `[Model].ts` |
| **Edit UI** | `app/page.tsx` | Main component |
| **Connect DB** | `lib/mongodb.ts` | Already configured |
| **Check config** | Root level | `.env.local` |
| **Setup data** | Root level | Run `.js` scripts |

---

## 🔌 COMMON API ENDPOINTS

```javascript
// USER ENDPOINTS
POST   /api/users/login          // Login user
POST   /api/users/signup         // Register user
PATCH  /api/users/update         // Update mobile
PATCH  /api/users/update-name    // Update name

// PRODUCT ENDPOINTS  
POST   /api/products/create      // Add product (admin)
PATCH  /api/products/update      // Edit product (admin)

// ORDER ENDPOINTS
POST   /api/orders/create        // Create order
GET    /api/orders/tracking      // Track order
PATCH  /api/orders/update        // Update order
POST   /api/orders/verify        // Verify payment

// ADMIN ENDPOINTS
POST   /api/admin/login          // Admin login
GET    /api/admin/orders         // List orders

// LOCATION ENDPOINTS
POST   /api/location/geolocation // Validate PIN
GET    /api/location/geolocation // Search PIN

// SYSTEM
GET    /api/health               // Server status
```

---

## 💾 DATABASE MODELS

```javascript
// Models location: lib/models/

User {
  name, email, mobile, password
}

Admin {
  username, password, email, permissions
}

Product {
  name, price, image, category, stock
}

Order {
  userId, items, total, status, tracking
}

Address {
  userId, pinCode, street, city, state
}

PinCode {
  pinCode, city, state, deliveryDays
}
```

---

## 🔑 KEY FILES TO KNOW

| File | What It Does |
|------|---|
| `app/page.tsx` | Main UI component |
| `lib/mongodb.ts` | Database connection |
| `.env.local` | Secrets & config |
| `package.json` | Dependencies |
| `create-admin.js` | Setup admin user |
| `setup-location.js` | Setup PIN codes |

---

## 🏃 QUICK COMMANDS

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Building
npm run build            # Build for production
npm start               # Start production server

# Database
node create-admin.js    # Create admin account
node setup-location.js  # Seed PIN codes
node update-admin.js    # Update admin creds

# Code Quality
npm run lint            # Check code style
```

---

## 📝 CURRENT ADMIN LOGIN

```
Username: sampath
Password: siddu@123
```

---

## 🗺️ NAVIGATION FLOW

```
HOME (page.tsx)
  ├── User Login (/api/users/login)
  ├── Product List (/api/products)
  ├── Cart → Create Order (/api/orders/create)
  ├── Track Order (/api/orders/tracking)
  └── Admin Panel
      ├── Admin Login (/api/admin/login)
      ├── View Orders (/api/admin/orders)
      ├── Create Product (/api/products/create)
      └── Manage Orders (/api/orders/manage)
```

---

## ⚠️ COMMON ISSUES & FIXES

| Issue | Solution |
|---|---|
| **API not working** | Check `.env.local` has MongoDB URL |
| **Login fails** | Run `node update-admin.js` |
| **PIN codes not found** | Run `node setup-location.js` |
| **Build error** | Delete `.next/` and rebuild |
| **TypeScript error** | Check imports and types |
| **Database connection** | Check MongoDB is running |

---

## 🔐 NEVER COMMIT

```
❌ .env.local
❌ .env (with real values)
❌ node_modules/
❌ .next/
❌ Passwords or API keys in code
```

---

## 📚 WHERE TO FIND DOCS

| Topic | File |
|---|---|
| **Admin guide** | DOCUMENTATION/ADMIN_LOGIN_GUIDE.md |
| **Setup help** | DOCUMENTATION/MASTER_GUIDE.md |
| **API details** | DOCUMENTATION/IMPLEMENTATION_COMPLETE.md |
| **Orders** | DOCUMENTATION/ORDERS_VISIBILITY_*.md |
| **Products** | DOCUMENTATION/PRODUCTS_VISIBILITY_*.md |
| **Payment** | DOCUMENTATION/RAZORPAY_*.md |

---

## 🎯 BEFORE DEPLOYMENT

- [ ] Update .env.local with production values
- [ ] Run tests
- [ ] Check all endpoints work
- [ ] Update admin password
- [ ] Delete backup files
- [ ] Review CODE_CLEANUP_REPORT.md
- [ ] Run `npm run build`
- [ ] Test `npm start`

---

## 🆘 GET HELP

1. Check PROJECT_ORGANIZATION.md (full structure)
2. Check relevant documentation file
3. Check API route code
4. Check database model
5. Check browser console for errors
6. Check server logs

---

**Last Updated**: January 28, 2026  
**Status**: ✅ Production Ready
