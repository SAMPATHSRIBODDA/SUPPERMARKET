import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userMobile = searchParams.get('userMobile');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    let query: any = {};

    // If userMobile is provided, fetch only that user's orders
    if (userMobile && userMobile.trim() !== '') {
      query.userMobile = userMobile.trim();
    }

    // If status filter is provided
    if (status && status.trim() !== '') {
      query.status = status.trim();
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { orderId, userId, userMobile, userName, items, address, deliverySlot, paymentMethod, paymentId, razorpayOrderId, total, status } = await request.json();

    if (!orderId || !userMobile || !userName || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, userMobile, userName, items, total' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { error: 'Total must be a positive number' },
        { status: 400 }
      );
    }

    // Check if order already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return NextResponse.json(
        { error: 'Order with this ID already exists' },
        { status: 409 }
      );
    }

    const newOrder = new Order({
      orderId,
      userId: userId || null,
      userMobile,
      userName,
      items,
      address: address || null,
      deliverySlot: deliverySlot || null,
      paymentMethod: paymentMethod || 'COD',
      paymentId: paymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      total,
      status: status || 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newOrder.save();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { orderId, status, trackingUpdates, notes } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateOperations: any = { $set: {} };

    if (status) {
      updateOperations.$set.status = status;
    }

    if (notes) {
      updateOperations.$set.notes = notes;
    }

    if (trackingUpdates) {
      updateOperations.$push = { trackingUpdates };
    }

    updateOperations.$set.updatedAt = new Date();

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      updateOperations,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order: ' + error.message },
      { status: 500 }
    );
  }
}
