import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username and password cannot be empty' },
        { status: 400 }
      );
    }

    // Find admin in database
    const admin = await Admin.findOne({ 
      username: username.trim(), 
      isActive: true 
    }).select('+password');

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password (in production, use bcrypt comparison)
    if (admin.password !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create token
    const token = Buffer.from(`${username}:${admin._id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
      message: 'Admin login successful',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Failed to login: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
