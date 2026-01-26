import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  brand: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['Dairy', 'Bakery', 'Snacks', 'Beverages', 'Instant Food', 'Personal Care', 'Fruits', 'Vegetables', 'Other'],
  },
  image: {
    type: String,
    required: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  deliveryTime: {
    type: String,
    default: '30 mins',
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
