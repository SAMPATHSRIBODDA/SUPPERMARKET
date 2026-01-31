import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        userName: order.userName,
        userMobile: order.userMobile,
        total: order.total,
        paymentMethod: order.paymentMethod,
        address: order.address,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        actualDeliveryDate: order.actualDeliveryDate,
        currentLocation: order.currentLocation,
        deliveryPartner: order.deliveryPartner,
        trackingUpdates: order.trackingUpdates || [],
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { orderId, status, location, message, deliveryPartner } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status required' },
        { status: 400 }
      );
    }

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Add tracking update
    const trackingUpdate = {
      status,
      timestamp: new Date(),
      location: location || {
        latitude: null,
        longitude: null,
        address: '',
      },
      message: message || `Order ${status}`,
    };

    if (!order.trackingUpdates) {
      order.trackingUpdates = [];
    }

    order.trackingUpdates.push(trackingUpdate);
    order.status = status;

    // Update current location
    if (location && location.latitude && location.longitude) {
      order.currentLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || '',
        updatedAt: new Date(),
      };
    }

    // Update delivery partner information
    if (deliveryPartner) {
      order.deliveryPartner = {
        name: deliveryPartner.name || '',
        phone: deliveryPartner.phone || '',
        latitude: deliveryPartner.latitude || null,
        longitude: deliveryPartner.longitude || null,
      };
    }

    // Set estimated delivery date if not set
    if (!order.estimatedDeliveryDate && status === 'Shipped') {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days from now
      order.estimatedDeliveryDate = deliveryDate;
    }

    // Set actual delivery date if delivered
    if (status === 'Delivered' && !order.actualDeliveryDate) {
      order.actualDeliveryDate = new Date();
    }

    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order tracking updated',
      order,
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}
