import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { mobile, name, password } = body;

    console.log('Signup attempt:', { mobile, name });

    // Validate input
    if (!mobile || !name || !password) {
      return NextResponse.json(
        { message: 'Mobile, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { message: 'Mobile number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { message: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }
    if (trimmedName.length > 50) {
      return NextResponse.json(
        { message: 'Name cannot exceed 50 characters' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this mobile number already exists' },
        { status: 409 }
      );
    }

    // Generate token for the user
    const token = `token_${mobile}`;

    // Create new user
    // Note: In production, hash the password using bcrypt before storing
    const newUser = await User.create({
      mobile,
      name: trimmedName,
      password, // TODO: Hash with bcrypt in production
      token
    });

    console.log('User created successfully:', newUser.mobile);

    // Return user data (without password)
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser._id.toString(),
          mobile: newUser.mobile,
          name: newUser.name,
          token
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'User with this mobile number already exists' },
        { status: 409 }
      );
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
