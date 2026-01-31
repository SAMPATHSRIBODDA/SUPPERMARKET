import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { mobile, newMobile } = body;

    // Validate input
    if (!mobile || !newMobile) {
      return NextResponse.json(
        { message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Validate new mobile format (10 digits)
    if (!/^\d{10}$/.test(newMobile)) {
      return NextResponse.json(
        { message: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Find user by current mobile
    const user = await User.findOne({ mobile });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if new mobile already exists
    const existingUser = await User.findOne({ mobile: newMobile });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { message: 'Mobile number already in use' },
        { status: 409 }
      );
    }

    // Update mobile number
    user.mobile = newMobile;
    await user.save();

    // Return updated user
    return NextResponse.json({
      success: true,
      message: 'Mobile number updated successfully',
      user: {
        id: user._id?.toString(),
        mobile: user.mobile,
        name: user.name,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Update mobile error:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
