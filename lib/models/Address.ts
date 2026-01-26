import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  userMobile: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);
