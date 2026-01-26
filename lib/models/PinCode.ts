import mongoose from 'mongoose';

const PinCodeSchema = new mongoose.Schema(
  {
    pinCode: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => /^[0-9]{6}$/.test(v),
        message: 'PIN code must be 6 digits',
      },
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: true,
      lowercase: true,
    },
    region: {
      type: String,
      default: '',
    },
    deliveryAvailable: {
      type: Boolean,
      default: true,
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

// Index for faster searches
PinCodeSchema.index({ pinCode: 1 });
PinCodeSchema.index({ city: 1, state: 1 });

export const PinCode =
  mongoose.models.PinCode || mongoose.model('PinCode', PinCodeSchema);
