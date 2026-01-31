/**
 * ADDRESS MODEL - Customer Delivery Address Schema
 * Stores customer's saved delivery addresses for quick checkout
 * 
 * Features:
 * - Multiple saved addresses per user
 * - Default address selection
 * - Complete address details (street, city, state, PIN)
 * - GPS coordinates for location-based services
 * - Custom address labels (Home, Office, etc.)
 */

import mongoose from 'mongoose';

/**
 * AddressSchema - MongoDB Schema for Delivery Addresses
 * Allows customers to save multiple addresses
 */
const AddressSchema = new mongoose.Schema({
  // USER ID - Reference to the customer who owns this address
  userId: {
    type: String,
  },
  
  // USER MOBILE - Customer's phone number for verification
  userMobile: {
    type: String,
    required: true,
  },
  
  // TITLE - Custom label for this address (e.g., "Home", "Office", "Mom's Place")
  title: {
    type: String,
  },
  
  // NAME - Recipient name for this address
  name: {
    type: String,
    required: true,
  },
  
  // ADDRESS - Full street address details
  address: {
    type: String,
    required: true,
  },
  
  // CITY - City name
  city: {
    type: String,
    required: true,
  },
  
  // STATE - State/Province name
  state: {
    type: String,
  },
  
  // PINCODE - 6-digit postal code (PIN code in India)
  pincode: {
    type: String,
    required: true,
  },
  
  // PHONE - Contact number for this address
  phone: {
    type: String,
  },
  
  // LATITUDE - GPS latitude coordinate for location-based delivery
  latitude: {
    type: Number,
  },
  
  // LONGITUDE - GPS longitude coordinate for location-based delivery
  longitude: {
    type: Number,
  },
  
  // IS DEFAULT - Whether this is the default address for orders
  isDefault: {
    type: Boolean,
    default: false,   // False initially, user can set one as default
  },
  
  // CREATED AT - When this address was saved
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // UPDATED AT - When this address was last modified
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true  // Automatically manage timestamps
});

/**
 * EXPORT - Make Address model available
 */
export const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);
