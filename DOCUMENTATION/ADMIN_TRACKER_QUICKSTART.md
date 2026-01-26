# Admin Tracker Quick Start

## 🚀 Start Using Admin Tracker in 30 Seconds

### 1. Go to Admin Panel
```
URL: http://localhost:3000
Login: admin / admin@123
Tab: Orders
```

### 2. Select an Order
Click any order in the table → Details appear on right panel

### 3. Two Sections Available

#### Blue Section: 📋 Order Status
```
Dropdown: Select status (8 options)
Notes: Add notes (optional)
Button: ✓ Update Status
```

#### Green Section: 📍 Live Tracking
```
Delivery Partner: Name of person
Partner Phone: Contact number
Latitude: GPS latitude (e.g., 17.3850)
Longitude: GPS longitude (e.g., 78.4867)
Tracking Message: Status for customer
Button: 🚚 Update Tracking
```

### 4. Fill Fields & Click Update Button

**Done!** ✅

## 📌 Status Options

- Pending
- Confirmed
- Processing
- **Packed** ← Item packing status shown to customer
- Shipped
- Out for Delivery
- Delivered
- Cancelled

## 🎯 Example Inputs

**Delivery Partner:**
```
Name: Rajesh Kumar
Phone: 9876543210
Latitude: 17.3850
Longitude: 78.4867
Message: Delivery arriving in 15 minutes
```

## 👀 What Customer Sees

When you update tracking, customer sees:
- ✓ Item packing status (after "Packed" status)
- Timeline progression with visual indicators
- Delivery partner info
- Real-time location
- Tracking messages
- Estimated delivery time

## 💡 Pro Tips

1. **Update regularly** - After each status change
2. **Use messages** - Helps customer understand progress
3. **Accurate coords** - Better customer experience
4. **Partner details** - Essential for customer contact

## 📱 Working Endpoints

```
PUT /api/orders/update  → For status changes
PUT /api/orders/tracking → For location & tracking
```

Both endpoints automatically:
- Update order in database
- Maintain tracking history
- Send to customer's Orders page
- Calculate delivery dates

## ❓ Need Help?

- Full guide: [ADMIN_TRACKER_GUIDE.md](ADMIN_TRACKER_GUIDE.md)
- Implementation details: [ADMIN_TRACKER_IMPLEMENTATION.md](ADMIN_TRACKER_IMPLEMENTATION.md)
- Location API: [LOCATION_TRACKING_GUIDE.md](LOCATION_TRACKING_GUIDE.md)

---

**That's it!** Your admin tracker is ready to use. 🎉
