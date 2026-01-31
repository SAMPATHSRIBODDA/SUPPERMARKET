// Quick script to create admin account
// Run: node create-admin.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    role: { type: String, default: 'admin' },
    permissions: { type: Array, default: ['manage_products', 'manage_orders', 'view_dashboard'] },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/penumudies-app';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'sampath' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      console.log('  Username:', existingAdmin.username);
      console.log('  Email:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    // Create new admin
    const admin = await Admin.create({
      username: 'sampath',
      password: 'siddu@123',
      email: 'admin@penumudies.com',
      role: 'admin',
      permissions: ['manage_products', 'manage_orders', 'view_dashboard'],
      isActive: true,
    });

    console.log('✅ Admin account created successfully!');
    console.log('  ID (Username): sampath');
    console.log('  Password: siddu@123');
    console.log('  Email: admin@penumudies.com');
    console.log('\n📝 Use these credentials to login to admin panel');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
