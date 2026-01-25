import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { mobile, password } = body;

    console.log('Login attempt:', { mobile, password });

    // Validate input
    if (!mobile || !password) {
      return NextResponse.json(
        { message: 'Mobile and password are required' },
        { status: 400 }
      );
    }

    // Find user in MongoDB
    const user = await User.findOne({ mobile }).select('+password +token');
    
    console.log('User found:', user ? 'YES' : 'NO', user?.mobile);

    if (!user) {
      // Check total users in DB
      const allUsers = await User.find({});
      console.log('Total users in DB:', allUsers.length);
      allUsers.forEach(u => console.log('  -', u.mobile, u.name));
      
      return NextResponse.json(
        { message: 'Account not found. Please create an account first.' },
        { status: 404 }
      );
    }

    // Verify password (in production, use bcrypt comparison)
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const response = {
      message: 'Login successful',
      user: {
        mobile: user.mobile,
        name: user.name,
        token: user.token || 'token_' + user.mobile,
        id: user._id?.toString()
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
