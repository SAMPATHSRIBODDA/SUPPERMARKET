import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PinCode } from '@/lib/models/PinCode';

// Sample PIN code data for Indian cities (expand as needed)
const samplePinCodes = [
  { pinCode: '500001', city: 'Hyderabad', state: 'Telangana', region: 'RTC Cross Road' },
  { pinCode: '500002', city: 'Hyderabad', state: 'Telangana', region: 'Lakdikapool' },
  { pinCode: '500003', city: 'Hyderabad', state: 'Telangana', region: 'Somajiguda' },
  { pinCode: '500004', city: 'Hyderabad', state: 'Telangana', region: 'Nampally' },
  { pinCode: '500005', city: 'Hyderabad', state: 'Telangana', region: 'Secunderabad' },
  { pinCode: '560001', city: 'Bangalore', state: 'Karnataka', region: 'Vidhana Soudha' },
  { pinCode: '560002', city: 'Bangalore', state: 'Karnataka', region: 'Cantonment' },
  { pinCode: '400001', city: 'Mumbai', state: 'Maharashtra', region: 'Fort' },
  { pinCode: '400002', city: 'Mumbai', state: 'Maharashtra', region: 'Colaba' },
  { pinCode: '110001', city: 'Delhi', state: 'Delhi', region: 'New Delhi' },
  { pinCode: '700001', city: 'Kolkata', state: 'West Bengal', region: 'Esplanade' },
  { pinCode: '600001', city: 'Chennai', state: 'Tamil Nadu', region: 'Fort St. George' },
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { action, pinCode, latitude, longitude } = await request.json();

    // Action 1: Validate PIN code and get city/state info
    if (action === 'validatePinCode') {
      if (!pinCode || pinCode.length !== 6) {
        return NextResponse.json(
          { error: 'PIN code must be 6 digits' },
          { status: 400 }
        );
      }

      const pinData = await PinCode.findOne({ pinCode });

      if (!pinData) {
        return NextResponse.json(
          {
            success: false,
            message: 'PIN code not found in our service area',
            pinCode,
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        success: true,
        pinCode: pinData.pinCode,
        city: pinData.city,
        state: pinData.state,
        region: pinData.region,
        deliveryAvailable: pinData.deliveryAvailable,
        estimatedDeliveryDays: pinData.estimatedDeliveryDays,
        message: `✅ ${pinData.city}, ${pinData.state}`,
      });
    }

    // Action 2: Get address from coordinates (reverse geocoding simulation)
    if (action === 'getAddressFromCoordinates') {
      if (!latitude || !longitude) {
        return NextResponse.json(
          { error: 'Latitude and longitude required' },
          { status: 400 }
        );
      }

      // Simulated reverse geocoding - in production use Google Maps or similar
      const address = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      return NextResponse.json({
        success: true,
        latitude,
        longitude,
        address,
        message: 'Location captured successfully',
      });
    }

    // Action 3: Seed PIN codes (admin only)
    if (action === 'seedPinCodes') {
      try {
        // Check if PIN codes already exist
        const count = await PinCode.countDocuments();
        if (count > 0) {
          return NextResponse.json({
            message: `PIN codes already seeded. Total: ${count}`,
          });
        }

        // Insert sample PIN codes
        const inserted = await PinCode.insertMany(samplePinCodes);
        return NextResponse.json({
          success: true,
          message: `Seeded ${inserted.length} PIN codes`,
          count: inserted.length,
        });
      } catch (err) {
        console.error('Seed error:', err);
        return NextResponse.json({
          success: false,
          message: 'Error seeding PIN codes',
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Geolocation error:', error);
    return NextResponse.json(
      { error: 'Failed to process geolocation request' },
      { status: 500 }
    );
  }
}

// GET endpoint to search PIN codes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const pinCode = searchParams.get('pinCode');
    const city = searchParams.get('city');

    if (pinCode) {
      const data = await PinCode.findOne({ pinCode });
      return NextResponse.json({ data, found: !!data });
    }

    if (city) {
      const results = await PinCode.find({
        city: { $regex: city, $options: 'i' },
      });
      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Provide pinCode or city parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
