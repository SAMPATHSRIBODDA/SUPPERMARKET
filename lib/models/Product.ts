/**
 * PRODUCT MODEL - E-Commerce Product Catalog Schema
 * Manages all product information for the online store
 * 
 * Features:
 * - Product details (name, brand, description)
 * - Pricing (current price, original price for discounts)
 * - Inventory management (stock tracking)
 * - Categorization (predefined categories)
 * - Product images
 * - Delivery time estimates
 * - Popular product flagging for featured display
 */

import mongoose from 'mongoose';

/**
 * ProductSchema - MongoDB Schema Definition
 * Defines structure for all product documents in the database
 */
const ProductSchema = new mongoose.Schema({
  // PRODUCT NAME - What the product is called
  name: {
    type: String,
    required: true,
    minlength: 2,      // At least 2 characters
    maxlength: 100,    // Max 100 characters
  },
  
  // BRAND NAME - Brand/manufacturer of the product
  brand: {
    type: String,
    required: true,
    minlength: 2,      // At least 2 characters
    maxlength: 50,     // Max 50 characters
  },
  
  // CURRENT PRICE - What customer pays now (in INR)
  price: {
    type: Number,
    required: true,
    min: 0,            // Can't be negative
  },
  
  // ORIGINAL PRICE - Before discount (shows savings)
  oldPrice: {
    type: Number,
    required: true,
    min: 0,            // Can't be negative
  },
  
  // STOCK - How many items available (inventory)
  stock: {
    type: Number,
    required: true,
    min: 0,            // Can't be negative (out of stock = 0)
  },
  
  // CATEGORY - Product classification for browsing/filtering
  category: {
    type: String,
    required: true,
    // Removed enum restriction to allow custom categories added by admin
  },
  
  // IMAGE - URL/path to product image
  image: {
    type: String,
    required: true,
  },
  
  // POPULAR FLAG - Whether to highlight in featured section
  popular: {
    type: Boolean,
    default: false,    // Not popular by default
  },
  
  // DELIVERY TIME - Expected time to deliver product
  deliveryTime: {
    type: String,
    default: '30 mins', // Default delivery estimate
  },
  
  // DESCRIPTION - Detailed product description
  description: {
    type: String,
    default: '',       // Optional description
  },
  
  // CREATED AT - When product was added to system
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current time
  },
  
  // UPDATED AT - Last time product was modified
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set to current time
  },
});

/**
 * EXPORT - Make Product model available to application
 * Uses mongoose.models to prevent model re-compilation errors
 */
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
