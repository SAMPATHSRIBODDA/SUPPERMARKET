/**
 * ADMIN MODEL - Administrator Account Schema
 * Manages admin user accounts with role-based access control
 * 
 * Features:
 * - Username-based authentication
 * - Role-based permissions (super_admin, admin, moderator)
 * - Permission list for feature access control
 * - Active/Inactive status management
 * - Last login tracking for security monitoring
 */

import mongoose from 'mongoose';

/**
 * AdminSchema - MongoDB Schema Definition
 * Defines structure for admin user accounts
 */
const AdminSchema = new mongoose.Schema(
  {
    // USERNAME - Unique identifier for admin login
    username: {
      type: String,
      required: true,              // Must be provided
      unique: true,                // No duplicate usernames
      minlength: 3,                // At least 3 characters
      maxlength: 30,               // Maximum 30 characters
    },
    
    // PASSWORD - Hashed password for authentication
    password: {
      type: String,
      required: true,              // Must be provided
      minlength: 6,                // At least 6 characters for security
    },
    
    // EMAIL - Contact email (optional)
    email: {
      type: String,
      required: false,             // Email is optional
    },
    
    // ROLE - Admin's permission level (3-tier system)
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],  // Only these 3 values allowed
      default: 'admin',                              // Default to regular admin
    },
    
    // PERMISSIONS - List of features/actions admin can perform
    permissions: {
      type: [String],              // Array of permission strings
      default: [
        'manage_products',         // Can create/edit products
        'manage_orders',           // Can view/manage orders
        'view_dashboard'           // Can view admin dashboard
      ],
    },
    
    // IS_ACTIVE - Account status (enables/disables login)
    isActive: {
      type: Boolean,
      default: true,               // Accounts are active by default
    },
    
    // LAST_LOGIN - Track when admin last logged in (for security monitoring)
    lastLogin: {
      type: Date,
      default: null,               // Null until first login
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * EXPORT - Make Admin model available to application
 * Uses mongoose.models to prevent re-compilation errors in Next.js
 */
export const Admin =
  mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
