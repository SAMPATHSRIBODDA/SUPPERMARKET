import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
  },
  userMobile: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: Number,
      name: String,
      brand: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  address: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
  },
  deliverySlot: {
    id: String,
    label: String,
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'Card'],
    required: true,
  },
  paymentId: {
    type: String,
    default: null,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Paid'],
    default: 'Pending',
  },
  notes: {
    type: String,
    default: '',
  },
  // Order Tracking Fields
  trackingUpdates: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      message: String,
    },
  ],
  estimatedDeliveryDate: {
    type: Date,
    default: null,
  },
  actualDeliveryDate: {
    type: Date,
    default: null,
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: Date,
  },
  deliveryPartner: {
    name: String,
    phone: String,
    latitude: Number,
    longitude: Number,
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

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
