/**
 * ADMIN LOGIN API ROUTE
 * Endpoint: POST /api/admin/login
 * 
 * Purpose: Authenticate admin user with username and password
 * Admin has higher privileges than regular customers
 * 
 * Request Body:
 * {
 *   username: "sampath",        // Admin username
 *   password: "siddu@123"       // Admin password
 * }
 * 
 * Response Success (200):
 * {
 *   success: true,
 *   token: "c2FtcGF0aD...",     // Encoded auth token
 *   admin: {
 *     id: "adminid123",
 *     username: "sampath",
 *     email: "admin@example.com",
 *     role: "admin",
 *     permissions: ["manage_products", "manage_orders", "view_dashboard"]
 *   },
 *   message: "Admin login successful"
 * }
 * 
 * Response Error (400/401/500):
 * {
 *   error: "Error description"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';

/**
 * POST Handler - Admin Login
 * Authenticates admin user and returns admin data with token
 */
export async function POST(request: NextRequest) {
  try {
    // STEP 1: Connect to database
    await dbConnect();

    // STEP 2: Extract username and password from request
    const { username, password } = await request.json();

    // STEP 3: Validate - both fields are required
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }  // 400 = Bad Request
      );
    }

    // STEP 4: Validate - fields cannot be empty/whitespace only
    if (username.trim().length === 0 || password.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username and password cannot be empty' },
        { status: 400 }
      );
    }

    // STEP 5: Find admin in database
    // .select('+password') includes password field which is normally hidden for security
    // isActive: true - only allows active admins, prevents disabled accounts from logging in
    const admin = await Admin.findOne({ 
      username: username.trim(), 
      isActive: true     // Only active admin accounts
    }).select('+password');

    // STEP 6: Check if admin exists
    if (!admin) {
      // Don't specify whether username or password is wrong (security best practice)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }  // 401 = Unauthorized
      );
    }

    // STEP 7: Verify password matches
    // ⚠️ TODO: In production, use bcrypt for password hashing!
    if (admin.password !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // STEP 8: Update last login timestamp (for security monitoring)
    admin.lastLogin = new Date();
    await admin.save();

    // STEP 9: Create authentication token
    // Format: username:adminId:timestamp (Base64 encoded)
    // ⚠️ TODO: In production, use JWT tokens!
    const token = Buffer.from(`${username}:${admin._id}:${Date.now()}`).toString('base64');

    // STEP 10: Return success response with admin data
    return NextResponse.json({
      success: true,
      token,                      // Auth token for future admin requests
      admin: {
        id: admin._id.toString(),        // Admin's unique ID
        username: admin.username,        // Admin username
        email: admin.email,              // Admin email
        role: admin.role,                // Role (super_admin, admin, moderator)
        permissions: admin.permissions,  // Features admin can access
      },
      message: 'Admin login successful',
    }, { status: 200 });
    
  } catch (error: any) {
    // STEP 11: Handle any errors
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Failed to login: ' + error.message },
      { status: 500 }  // 500 = Server Error
    );
  }
}

/**
 * DYNAMIC = FORCE-DYNAMIC
 * Tells Next.js to always run this on server (no caching)
 * Admin login is dynamic and changes per request
 */
export const dynamic = 'force-dynamic';
