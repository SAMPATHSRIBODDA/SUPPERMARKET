// Check and create admin account
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    role: String,
    permissions: Array,
    isActive: Boolean,
    lastLogin: Date,
  },
  { timestamps: true }
);

async function setupAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/penumudies-app';
    console.log('🔗 Connecting to:', mongoUri.substring(0, 50) + '...');
    
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    
    const Admin = mongoose.model('Admin', adminSchema);
    
    // Check existing admins
    const admins = await Admin.find({});
    console.log(`\n📋 Found ${admins.length} admin(s) in database:`);
    admins.forEach(admin => {
      console.log(`   - Username: ${admin.username}, Email: ${admin.email}, Role: ${admin.role}`);
    });

    // Create default admin if none exist
    if (admins.length === 0) {
      console.log('\n➕ Creating default admin account...');
      const newAdmin = await Admin.create({
        username: 'admin',
        password: 'admin@123',
        email: 'admin@penumudies.com',
        role: 'admin',
        permissions: ['manage_products', 'manage_orders', 'view_dashboard'],
        isActive: true,
      });
      console.log('✅ Admin created!');
    }

    console.log('\n🎯 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin@123');

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
