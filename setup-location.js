// Initialize PIN codes in database
// Run: node setup-location.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const pinCodeSchema = new mongoose.Schema({
  pinCode: { type: String, unique: true, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  region: String,
  deliveryAvailable: { type: Boolean, default: true },
  estimatedDeliveryDays: { type: Number, default: 2 },
});

const samplePinCodes = [
  { pinCode: '500001', city: 'Hyderabad', state: 'Telangana', region: 'RTC Cross Road', estimatedDeliveryDays: 2 },
  { pinCode: '500002', city: 'Hyderabad', state: 'Telangana', region: 'Lakdikapool', estimatedDeliveryDays: 2 },
  { pinCode: '500003', city: 'Hyderabad', state: 'Telangana', region: 'Somajiguda', estimatedDeliveryDays: 2 },
  { pinCode: '500004', city: 'Hyderabad', state: 'Telangana', region: 'Nampally', estimatedDeliveryDays: 2 },
  { pinCode: '500005', city: 'Hyderabad', state: 'Telangana', region: 'Secunderabad', estimatedDeliveryDays: 2 },
  { pinCode: '560001', city: 'Bangalore', state: 'Karnataka', region: 'Vidhana Soudha', estimatedDeliveryDays: 2 },
  { pinCode: '560002', city: 'Bangalore', state: 'Karnataka', region: 'Cantonment', estimatedDeliveryDays: 2 },
  { pinCode: '400001', city: 'Mumbai', state: 'Maharashtra', region: 'Fort', estimatedDeliveryDays: 3 },
  { pinCode: '400002', city: 'Mumbai', state: 'Maharashtra', region: 'Colaba', estimatedDeliveryDays: 3 },
  { pinCode: '110001', city: 'Delhi', state: 'Delhi', region: 'New Delhi', estimatedDeliveryDays: 3 },
  { pinCode: '700001', city: 'Kolkata', state: 'West Bengal', region: 'Esplanade', estimatedDeliveryDays: 3 },
  { pinCode: '600001', city: 'Chennai', state: 'Tamil Nadu', region: 'Fort St. George', estimatedDeliveryDays: 3 },
];

async function setupLocation() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/penumudies-app';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const PinCode = mongoose.model('PinCode', pinCodeSchema);

    // Check existing PIN codes
    const count = await PinCode.countDocuments();
    console.log(`📍 PIN codes in database: ${count}`);

    if (count > 0) {
      console.log('✅ PIN codes already initialized!\n');
      const samples = await PinCode.find().limit(5);
      console.log('Sample PIN codes:');
      samples.forEach(p => {
        console.log(`  ${p.pinCode} → ${p.city}, ${p.state} (${p.estimatedDeliveryDays} days)`);
      });
    } else {
      console.log('⏳ Seeding PIN codes...\n');
      const inserted = await PinCode.insertMany(samplePinCodes);
      console.log(`✅ Seeded ${inserted.length} PIN codes!\n`);
      console.log('Added PIN codes:');
      inserted.forEach(p => {
        console.log(`  ✓ ${p.pinCode} → ${p.city}, ${p.state}`);
      });
    }

    console.log('\n📊 Summary:');
    const cities = await PinCode.distinct('city');
    const states = await PinCode.distinct('state');
    console.log(`  Cities: ${cities.join(', ')}`);
    console.log(`  States: ${states.join(', ')}`);
    console.log(`\n✅ Location setup complete!`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupLocation();
