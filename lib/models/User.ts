/**
 * USER MODEL - Customer Account Schema
 * Manages all customer/user account information for the e-commerce platform
 * 
 * Features:
 * - Mobile-based authentication (primary identifier)
 * - Password storage (excluded from queries by default for security)
 * - User profile (name)
 * - Session tokens for authentication
 * - Automatic timestamps (createdAt, updatedAt)
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * IUser Interface - TypeScript type definition for User documents
 * Extends Document to include MongoDB document methods and properties
 */
export interface IUser extends Document {
  mobile: string;        // 10-digit phone number (unique, primary login field)
  name: string;         // User's full name
  password: string;     // Hashed password for authentication
  token?: string;       // Optional session/auth token
  createdAt?: Date;     // Automatic - when account was created
  updatedAt?: Date;     // Automatic - when account was last updated
}

/**
 * UserSchema - MongoDB Schema Definition
 * Defines structure and validation rules for user documents
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    // MOBILE NUMBER - Customer's 10-digit phone number
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],    // Must be provided
      unique: true,                                      // Can't have duplicate phone numbers
      trim: true,                                        // Remove spaces
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'], // Validate 10 digits only
    },
    
    // NAME - User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],             // Must be provided
      trim: true,                                        // Remove extra spaces
      minlength: [2, 'Name must be at least 2 characters'],     // At least 2 chars
      maxlength: [50, 'Name cannot exceed 50 characters'],      // Max 50 chars
    },
    
    // PASSWORD - Hashed password for login
    password: {
      type: String,
      required: [true, 'Password is required'],         // Must be provided
      select: false, // SECURITY: Don't return password in queries by default
    },
    
    // TOKEN - Session/authentication token
    token: {
      type: String,
      select: false, // SECURITY: Don't return token in queries by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * MODEL INITIALIZATION - Prevent re-compilation errors
 * In Next.js with hot reload, models can be compiled multiple times
 * This try-catch prevents "Cannot overwrite model" errors
 */
let User: mongoose.Model<IUser>;

try {
  // Try to get existing User model (if already compiled)
  User = mongoose.model<IUser>('User');
} catch (error) {
  // If model doesn't exist yet, create it with schema
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;
