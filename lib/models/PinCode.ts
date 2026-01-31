/**
 * PINCODE MODEL
 * ============
 * Database model for Indian PIN codes with delivery information
 * 
 * Features:
 * - PIN code validation (6 digits)
 * - City and state information
 * - Regional area details
 * - Delivery availability status
 * - Estimated delivery time
 */

import mongoose from 'mongoose';

/**
 * PIN CODE SCHEMA DEFINITION
 * Stores location data for delivery service areas
 */
const PinCodeSchema = new mongoose.Schema(
  {
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      unique: true,
      trim: true,
      length: 6,
      validate: {
        validator: function (v: string) {
          return /^\d{6}$/.test(v);
        },
        message: 'PIN code must be exactly 6 digits',
      },
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 2,
      min: 1,
      max: 7,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * INDEXES for faster queries
 */
PinCodeSchema.index({ pinCode: 1 });
PinCodeSchema.index({ city: 1 });
PinCodeSchema.index({ state: 1 });

/**
 * EXPORT - Make PinCode model available
 */
export const PinCode = mongoose.models.PinCode || mongoose.model('PinCode', PinCodeSchema);
