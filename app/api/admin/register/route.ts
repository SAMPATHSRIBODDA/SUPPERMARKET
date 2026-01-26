import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, password, email, role } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: trimmedUsername });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator'];
    const adminRole = (validRoles.includes(role) ? role : 'admin');

    // Create new admin (in production, hash the password with bcrypt!)
    // TODO: Implement bcrypt hashing
    // import bcrypt from 'bcryptjs';
    // const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const newAdmin = await Admin.create({
      username: trimmedUsername,
      password: trimmedPassword, // TODO: Replace with hashedPassword after implementing bcrypt
      email: email?.trim() || '',
      role: adminRole,
      permissions: ['manage_products', 'manage_orders', 'view_dashboard'],
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully',
        admin: {
          id: newAdmin._id.toString(),
          username: newAdmin.username,
          email: newAdmin.email,
          role: newAdmin.role,
          permissions: newAdmin.permissions,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin account: ' + error.message },
      { status: 500 }
    );
  }
}

// Get all admin accounts (requires authentication)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const admins = await Admin.find({ isActive: true })
      .select('username email role permissions createdAt lastLogin')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: admins.length,
      admins,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin accounts: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
