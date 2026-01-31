/**
 * ORDER MODEL - Customer Order & Tracking Schema
 * Comprehensive order management with real-time tracking capabilities
 * 
 * Features:
 * - Order identification (orderId, orderNumber)
 * - Customer information (userId, mobile, name)
 * - Order items (products with quantity)
 * - Delivery address and location
 * - Payment tracking (method, status, Razorpay integration)
 * - Order status workflow
 * - Real-time location tracking for delivery
 * - Estimated and actual delivery dates
 * - Delivery partner information
 */

import mongoose from 'mongoose';

/**
 * OrderSchema - MongoDB Schema for Orders
 * Handles complete order lifecycle from creation to delivery
 */
const OrderSchema = new mongoose.Schema({
  // UNIQUE ORDER ID - Unique identifier for each order (e.g., "ORD12345")
  orderId: {
    type: String,
    required: true,
    unique: true,      // No duplicate orders
  },
  
  // USER ID - Reference to customer who placed order
  userId: {
    type: String,
  },
  
  // USER MOBILE - Customer's phone number for contact
  userMobile: {
    type: String,
    required: true,
  },
  
  // USER NAME - Customer's name
  userName: {
    type: String,
    required: true,
  },
  
  // ITEMS - Array of products in this order
  items: [
    {
      productId: String,    // Reference to Product
      name: String,         // Product name (stored for history if product is deleted)
      brand: String,        // Brand name
      price: Number,        // Price per unit when ordered
      quantity: Number,     // How many items
      image: String,        // Product image URL
    },
  ],
  
  // DELIVERY ADDRESS - Where order should be delivered
  address: {
    name: String,          // Recipient name
    phone: String,         // Contact phone
    address: String,       // Street address
    city: String,          // City name
    pincode: String,       // PIN code (6 digits)
    latitude: Number,      // GPS latitude for location tracking
    longitude: Number,     // GPS longitude for location tracking
  },
  
  // DELIVERY SLOT - When customer wants delivery (time window)
  deliverySlot: {
    id: String,           // Slot identifier
    label: String,        // Readable format (e.g., "10:00 AM - 2:00 PM")
  },
  
  // PAYMENT METHOD - How customer paid
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'Card'],  // Cash, UPI, or Card payment
    required: true,
  },
  
  // PAYMENT ID - Transaction ID from payment gateway
  paymentId: {
    type: String,
    default: null,        // Null if payment not processed yet
  },
  
  // RAZORPAY ORDER ID - Reference ID from Razorpay (if using UPI)
  razorpayOrderId: {
    type: String,
    default: null,
  },
  
  // TOTAL - Final order amount (in INR)
  total: {
    type: Number,
    required: true,
  },
  
  // STATUS - Current state of order
  status: {
    type: String,
    enum: [
      'Pending',           // Order created, not confirmed
      'Confirmed',         // Order confirmed by system
      'Processing',        // Being prepared by store
      'Shipped',           // Handed to delivery partner
      'Out for Delivery',  // On the way to customer
      'Delivered',         // Successfully delivered
      'Cancelled',         // Order cancelled
      'Paid'               // Payment confirmed
    ],
    default: 'Pending',
  },
  
  // NOTES - Special instructions from customer
  notes: {
    type: String,
    default: '',
  },
  
  // TRACKING UPDATES - History of order status changes with location
  trackingUpdates: [
    {
      status: String,      // Status at this update
      timestamp: { 
        type: Date, 
        default: Date.now  // When this status was set
      },
      location: {
        latitude: Number,  // GPS location of delivery partner
        longitude: Number,
        address: String,   // Human-readable location
      },
      message: String,     // Status message (e.g., "Out for delivery")
    },
  ],
  
  // ESTIMATED DELIVERY DATE - When order should arrive
  estimatedDeliveryDate: {
    type: Date,
    default: null,
  },
  
  // ACTUAL DELIVERY DATE - When order actually arrived
  actualDeliveryDate: {
    type: Date,
    default: null,
  },
  
  // CURRENT LOCATION - Real-time location of order/delivery partner
  currentLocation: {
    latitude: Number,     // Current GPS latitude
    longitude: Number,    // Current GPS longitude
    address: String,      // Current location name
    updatedAt: Date,      // When location was last updated
  },
  
  // DELIVERY PARTNER - Information about who's delivering
  deliveryPartner: {
    name: String,         // Delivery person's name
    phone: String,        // Delivery person's phone
    latitude: Number,     // Their current GPS location
    longitude: Number,
  },
  
  // CREATED AT - When order was placed
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // UPDATED AT - Last time order was modified
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true  // Automatically update timestamps
});

/**
 * EXPORT - Make Order model available
 * Handles model re-compilation prevention
 */
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
