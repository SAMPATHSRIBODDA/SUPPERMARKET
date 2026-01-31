/**
 * ORDER CREATION API ROUTE (Razorpay Integration)
 * Endpoint: POST /api/orders/create
 * 
 * Purpose: Create a Razorpay payment order for online payments
 * Handles UPI, Card payments via Razorpay gateway
 * 
 * Request Body:
 * {
 *   amount: 500,           // Order amount in INR
 *   orderId: "ORD12345",   // Unique order ID from app
 *   customerName: "John",  // Customer name
 *   customerEmail: "john@email.com",
 *   customerPhone: "9876543210"
 * }
 * 
 * Response Success (200):
 * {
 *   orderId: "order_ABC123",        // Razorpay order ID
 *   amount: 50000,                  // Amount in paise
 *   currency: "INR",
 *   key: "rzp_live_xxxxx"          // Razorpay public key
 * }
 * 
 * Response Error (400/500):
 * {
 *   error: "Error description"
 * }
 */

import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

/**
 * RAZORPAY INITIALIZATION
 * Creates Razorpay instance with API credentials from environment variables
 * These credentials are set in .env.local and are SENSITIVE
 * 
 * Security Note:
 * - key_id: Public key (safe to send to frontend)
 * - key_secret: SECRET key (never expose to frontend)
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',           // Public API key
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',   // Secret API key
});

/**
 * POST Handler - Create Razorpay Order
 * Called when user clicks "Pay with UPI" button
 * Creates a payment order in Razorpay, returns order ID to show payment modal
 */
export async function POST(request: NextRequest) {
  try {
    // STEP 1: Extract payment details from request
    const { amount, orderId, customerName, customerEmail, customerPhone } = await request.json();

    // STEP 2: Validate required fields
    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and orderId are required' },
        { status: 400 }  // 400 = Bad Request
      );
    }

    // STEP 3: Prepare Razorpay order options
    // IMPORTANT: Razorpay expects amount in PAISE, not rupees
    // ₹500 = 50,000 paise
    const options = {
      amount: Math.round(amount * 100),    // Convert ₹ to paise (₹500 -> 50000p)
      currency: 'INR',                     // Indian Rupee
      receipt: orderId,                    // Reference ID for tracking
      payment_capture: 1,                  // Auto-capture payment
      notes: {
        // Additional info attached to order (for reference)
        orderId,
        customerName,
        customerEmail,
        customerPhone,
      },
    };

    // STEP 4: Create order in Razorpay
    // This generates an order ID that we send to frontend
    // Frontend will use this to show payment modal
    const order = await razorpay.orders.create(options);

    // STEP 5: Return order details to frontend
    // Frontend uses orderId to initialize Razorpay checkout form
    return NextResponse.json({
      orderId: order.id,              // Order ID from Razorpay (use this for payment)
      amount: order.amount,           // Amount in paise
      currency: order.currency,       // Currency type (INR)
      key: process.env.RAZORPAY_KEY_ID,  // Public key for frontend
    });
    
  } catch (error) {
    // STEP 6: Error handling
    
    // Get error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating Razorpay order:', errorMessage, error);
    
    // STEP 7: Check if credentials are missing (most common error)
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { 
          error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.' 
        },
        { status: 500 }  // 500 = Server Error
      );
    }
    
    // STEP 8: Return generic error message
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
