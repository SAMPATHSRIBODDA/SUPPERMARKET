// Script to update admin credentials in database
// Run: node update-admin.js

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

async function updateAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/penumudies-app';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check for old admin
    const oldAdmin = await Admin.findOne({ username: 'admin' });
    if (oldAdmin) {
      console.log('Found old admin record, updating...');
      oldAdmin.username = 'sampath';
      oldAdmin.password = 'siddu@123';
      await oldAdmin.save();
      console.log('✅ Updated admin from "admin" to "sampath"');
      console.log('  New Password: siddu@123');
    } else {
      console.log('No old admin found, checking for sampath...');
      const existingAdmin = await Admin.findOne({ username: 'sampath' });
      if (existingAdmin) {
        console.log('✅ Sampath admin already exists');
        existingAdmin.password = 'siddu@123';
        await existingAdmin.save();
        console.log('✅ Password updated to: siddu@123');
      } else {
        console.log('Creating new sampath admin...');
        await Admin.create({
          username: 'sampath',
          password: 'siddu@123',
          email: 'admin@penumudies.com',
          role: 'admin',
          permissions: ['manage_products', 'manage_orders', 'view_dashboard'],
          isActive: true,
        });
        console.log('✅ Admin account created successfully!');
        console.log('  Username: sampath');
        console.log('  Password: siddu@123');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdmin();
