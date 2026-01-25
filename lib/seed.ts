import mongoose from 'mongoose';
import dbConnect from './mongodb';
import User from './models/User';

const seedUsers = async () => {
  try {
    await dbConnect();

    // Clear existing users
    await User.deleteMany({});

    // Create sample users
    const users = await User.insertMany([
      {
        mobile: '9876543210',
        name: 'John Doe',
        password: 'hashed_password_1',
        token: 'sample_token_1'
      },
      {
        mobile: '9876543211',
        name: 'Jane Smith',
        password: 'hashed_password_2',
        token: 'sample_token_2'
      },
      {
        mobile: '9876543212',
        name: 'Mike Johnson',
        password: 'hashed_password_3',
        token: 'sample_token_3'
      }
    ]);

    console.log('✓ Database seeded with sample users');
    console.log('Users created:', users.map(u => ({ mobile: u.mobile, name: u.name })));
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
