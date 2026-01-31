/**
 * USER LOGIN API ROUTE
 * Endpoint: POST /api/users/login
 * 
 * Purpose: Authenticate user with mobile number and password
 * 
 * Request Body:
 * {
 *   mobile: "9876543210",  // 10-digit phone number
 *   password: "password123" // User's password
 * }
 * 
 * Response Success (200):
 * {
 *   success: true,
 *   message: "Login successful",
 *   user: {
 *     id: "userid123",
 *     mobile: "9876543210",
 *     name: "User Name",
 *     token: "token_9876543210"
 *   }
 * }
 * 
 * Response Error (400/401/404):
 * {
 *   message: "Error description"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

/**
 * POST Handler - User Login
 * Validates credentials and returns user data with authentication token
 */
export async function POST(request: NextRequest) {
  try {
    // STEP 1: Connect to MongoDB database
    await dbConnect();

    // STEP 2: Extract mobile and password from request body
    const body = await request.json();
    const { mobile, password } = body;

    // DEBUG: Log login attempt (remove in production)
    console.log('Login attempt:', { mobile, password });

    // STEP 3: Validate input - both fields are required
    if (!mobile || !password) {
      return NextResponse.json(
        { message: 'Mobile and password are required' },
        { status: 400 }  // 400 = Bad Request
      );
    }

    // STEP 4: Search for user in database by mobile number
    // .select('+password +token') includes password field which is normally hidden
    const user = await User.findOne({ mobile }).select('+password +token');
    
    // DEBUG: Log search result
    console.log('User found:', user ? 'YES' : 'NO', user?.mobile);

    // STEP 5: Check if user exists
    if (!user) {
      // Debug info: Show all users in database (for testing)
      const allUsers = await User.find({});
      console.log('Total users in DB:', allUsers.length);
      allUsers.forEach(u => console.log('  -', u.mobile, u.name));
      
      return NextResponse.json(
        { message: 'Account not found. Please create an account first.' },
        { status: 404 }  // 404 = Not Found
      );
    }

    // STEP 6: Verify password matches
    // ⚠️ NOTE: In production, use bcrypt for password hashing!
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }  // 401 = Unauthorized
      );
    }

    // STEP 7: Create authentication token (simple format)
    // ⚠️ NOTE: In production, use JWT tokens!
    const token = 'token_' + user.mobile;

    // STEP 8: Return success response with user data
    // Password is intentionally NOT included in response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id?.toString(),        // MongoDB document ID
        mobile: user.mobile,             // Phone number
        name: user.name,                 // User's name
        token: token,                    // Auth token for future requests
      }
    }, { status: 200 });  // 200 = OK

  } catch (error: any) {
    // STEP 9: Handle any errors that occur
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }  // 500 = Server Error
    );
  }
}

/**
 * DYNAMIC = FORCE-DYNAMIC
 * Tells Next.js: Always run this route on server (don't cache)
 * Because user login is dynamic data, not static
 */
export const dynamic = 'force-dynamic';
