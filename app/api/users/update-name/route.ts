import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

// Verify JWT token (mock implementation)
// TODO: Replace with actual JWT verification library (jsonwebtoken)
function verifyToken(token: string): string | null {
  // In production, use: import jwt from 'jsonwebtoken';
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // return decoded.mobile;
  
  // For now, extract mobile from token if it follows pattern
  const parts = token.split('_');
  if (parts[0] === 'token' && parts.length > 1) {
    return parts[1]; // Return mobile number
  }
  
  return null;
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const userMobile = verifyToken(token);

    if (!userMobile) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

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

    // Find and update user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { mobile: userMobile },
      { name: trimmedName },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user (without password/token)
    return NextResponse.json(
      {
        message: 'Name updated successfully',
        user: {
          mobile: updatedUser.mobile,
          name: updatedUser.name
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating name:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
