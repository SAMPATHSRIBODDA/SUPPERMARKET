# Admin Tracker Management Guide

## Overview

The admin panel now includes comprehensive real-time tracker management features allowing admins to update order status, track delivery partner location, and manage order tracking in real-time.

## Features

### 1. Order Status Management

Update order status through the following stages:
- **Pending** - Initial order state
- **Confirmed** - Order confirmed by customer
- **Processing** - Order being prepared
- **Packed** - Items packed and ready
- **Shipped** - Order dispatched
- **Out for Delivery** - On the way to customer
- **Delivered** - Successfully delivered
- **Cancelled** - Order cancelled

### 2. Live Tracking Features

#### Delivery Partner Information
- **Partner Name**: Name of the delivery person (e.g., "Rajesh Kumar")
- **Partner Phone**: Contact number of delivery person (e.g., "9876543210")

#### Real-time Location Tracking
- **Latitude**: Current latitude coordinate (e.g., "17.3850")
- **Longitude**: Current longitude coordinate (e.g., "78.4867")
- Updates customer with exact delivery location

#### Tracking Messages
- Custom status messages for customer visibility
- Examples:
  - "Package picked up from warehouse"
  - "Out for delivery in your area"
  - "Delivery partner on the way"
  - "Package will arrive within 30 minutes"

### 3. Tracking Update History

View recent tracking updates in the "Recent Updates" section showing:
- Status updates
- Tracking messages
- Timestamp of each update

## How to Use

### Step 1: Access Admin Panel
1. Go to http://localhost:3000
2. Login with admin credentials:
   - Username: `admin`
   - Password: `admin@123`

### Step 2: Navigate to Orders Tab
1. Click on the "Orders" tab in the admin panel
2. View all orders in the table

### Step 3: Select an Order
1. Click on any order row in the table
2. Order details will appear in the right panel

### Step 4: Update Order Status
1. Scroll to **Order Status** section (blue box)
2. Select new status from dropdown
3. (Optional) Add notes about the status change
4. Click **"✓ Update Status"** button

### Step 5: Update Live Tracking
1. Scroll to **Live Tracking** section (green box)
2. Fill in the following fields:
   - **Delivery Partner**: Name of delivery personnel
   - **Partner Phone**: Contact number
   - **Latitude**: Current delivery location latitude
   - **Longitude**: Current delivery location longitude
   - **Tracking Message**: Status message for customer

3. Click **"🚚 Update Tracking"** button

### Step 6: Monitor Tracking Updates
1. View "Recent Updates" section at the bottom
2. Shows last 3 tracking updates with timestamps
3. Automatically updates after each change

## API Integration

The tracker uses two main endpoints:

### Update Order Status
```bash
PUT /api/orders/update
```
Body:
```json
{
  "orderId": "ORD123456789",
  "status": "Shipped",
  "notes": "Order dispatched"
}
```

### Update Live Tracking
```bash
PUT /api/orders/tracking
```
Body:
```json
{
  "orderId": "ORD123456789",
  "status": "Out for Delivery",
  "location": {
    "latitude": 17.3850,
    "longitude": 78.4867
  },
  "deliveryPartner": {
    "name": "Rajesh Kumar",
    "phone": "9876543210"
  },
  "message": "Delivery partner on the way"
}
```

## Example Workflow

### Order Received
1. Order status: **Pending**
2. Customer is notified that order is received

### Order Being Prepared
1. Update status to: **Processing**
2. Message: "Your order is being prepared"
3. Click "Update Status"

### Order Packed
1. Update status to: **Packed**
2. Message: "Your order is packed and ready to ship"
3. Click "Update Status"

### Order Shipped
1. Update status to: **Shipped**
2. Assign delivery partner:
   - Name: "Rajesh Kumar"
   - Phone: "9876543210"
3. Message: "Your order has been shipped"
4. Click "Update Tracking"

### Out for Delivery
1. Update status to: **Out for Delivery**
2. Update location:
   - Latitude: 17.3850
   - Longitude: 78.4867
3. Message: "Delivery partner is 5 mins away from your location"
4. Click "Update Tracking"

### Delivered
1. Update status to: **Delivered**
2. Message: "Order successfully delivered"
3. Click "Update Status"

## Real-time Features

- **Live Location Updates**: Update delivery partner location in real-time
- **Tracking History**: System automatically maintains all tracking updates
- **Customer Notifications**: Updates are visible to customers in Orders page
- **Multi-update Support**: Update status, location, and message all at once

## Best Practices

1. **Update Regularly**: Update status and location as order progresses
2. **Clear Messages**: Write clear, customer-friendly tracking messages
3. **Accurate Location**: Provide accurate GPS coordinates for precise tracking
4. **Partner Details**: Always include delivery partner name and phone
5. **Timely Updates**: Update status immediately when order state changes

## Notes

- Only one status update per action
- Location updates don't require status change
- All timestamps are automatically recorded
- Tracking history is preserved for audit trail
- Recent updates show last 3 changes only

## Troubleshooting

### Tracking Update Failed
- Verify Order ID is selected
- Check latitude/longitude format (decimal numbers)
- Ensure delivery partner phone number is valid

### Status Not Changing
- Refresh the page after update
- Verify order is still selected
- Check if order status is already at that state

### Location Not Updating
- Ensure latitude and longitude are decimal numbers
- Check format: Latitude -90 to 90, Longitude -180 to 180
- For Hyderabad: ~17.3850, 78.4867

## Support

For API documentation, see [LOCATION_TRACKING_GUIDE.md](LOCATION_TRACKING_GUIDE.md)

For general setup, see [MASTER_GUIDE.md](MASTER_GUIDE.md)
