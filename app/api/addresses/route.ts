import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Address } from '@/lib/models/Address';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userMobile = searchParams.get('userMobile');

    if (!userMobile) {
      return NextResponse.json(
        { error: 'userMobile is required' },
        { status: 400 }
      );
    }

    const addresses = await Address.find({ userMobile });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { userMobile, name, address, city, state, pincode, phone, title, latitude, longitude, isDefault } = await request.json();

    if (!userMobile || !name || !address || !city || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newAddress = new Address({
      userMobile,
      name,
      address,
      city,
      state: state || '',
      pincode,
      phone: phone || '',
      title: title || '',
      latitude: latitude || null,
      longitude: longitude || null,
      isDefault: isDefault || false,
    });

    await newAddress.save();

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully',
      address: newAddress,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving address:', error);
    return NextResponse.json(
      { error: 'Failed to save address: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { addressId, ...updateData } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateData,
      { new: true }
    );

    if (!updatedAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress,
    });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const deletedAddress = await Address.findByIdAndDelete(addressId);

    if (!deletedAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address: ' + error.message },
      { status: 500 }
    );
  }
}
