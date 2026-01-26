# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Next.js React Application                   │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │          Checkout Page (page.tsx)              │ │  │
│  │  │  • Payment method selection                    │ │  │
│  │  │  • Address & delivery slot                     │ │  │
│  │  │  • Place Order button                          │ │  │
│  │  │  • Order summary display                       │ │  │
│  │  └────────────────┬────────────────────────────────┘ │  │
│  │                   │                                   │  │
│  │  ┌────────────────▼────────────────────────────────┐ │  │
│  │  │    handleInitiateRazorpayPayment()             │ │  │
│  │  │  • Validate address & slot                     │ │  │
│  │  │  • Create Razorpay order                       │ │  │
│  │  │  • Load Razorpay script                        │ │  │
│  │  │  • Open payment modal                          │ │  │
│  │  │  • Handle response & verify                    │ │  │
│  │  └────────────────┬────────────────────────────────┘ │  │
│  │                   │                                   │  │
│  │  ┌────────────────▼────────────────────────────────┐ │  │
│  │  │      Razorpay Checkout Modal                   │ │  │
│  │  │  • Payment options (UPI, Card, Net Banking)   │ │  │
│  │  │  • Customer details                           │ │  │
│  │  │  • Amount display                             │ │  │
│  │  └────────────────┬────────────────────────────────┘ │  │
│  └───────────────────┼──────────────────────────────────┘  │
└──────────────────────┼─────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
         ▼                            ▼
   ┌─────────────┐           ┌─────────────────────┐
   │ Payment     │           │ User Completes      │
   │ Successful  │           │ Payment in UPI App  │
   └─────────────┘           └──────────┬──────────┘
         │                             │
         │                             ▼
         │                   ┌─────────────────────┐
         │                   │ Razorpay Servers    │
         │                   │ • Process Payment   │
         │                   │ • Generate Signature│
         │                   │ • Return Response   │
         │                   └──────────┬──────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ Frontend Receives Payment   │
         │ Response & Signature        │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────────────────────────┐
         │                                                 │
┌────────┴─────────────────┐                  ┌──────────┴──────────┐
│                          │                  │                     │
▼                          ▼                  ▼                     ▼
```

## Data Flow - UPI Payment

```
START: User Clicks "Place Order"
  │
  ├─► Validate Address & Slot
  │   └─► If invalid: Show Error & Return
  │
  ├─► Check Payment Method
  │   ├─► If COD/Card: Use handlePlaceOrder()
  │   └─► If UPI: Continue with Razorpay
  │
  ├─► STEP 1: Create Razorpay Order
  │   ├─► POST /api/orders/create
  │   │   └─► Body: { amount, orderId, customerName, email, phone }
  │   │
  │   └─► Razorpay Returns:
  │       ├─ orderId
  │       ├─ amount
  │       ├─ currency
  │       └─ key
  │
  ├─► STEP 2: Load Razorpay Script
  │   ├─► dynamically create <script> tag
  │   ├─► src = https://checkout.razorpay.com/v1/checkout.js
  │   └─► Wait for script to load
  │
  ├─► STEP 3: Open Payment Modal
  │   ├─► new Razorpay(options)
  │   ├─► paymentObject.open()
  │   └─► User sees payment screen
  │
  ├─► STEP 4: User Completes Payment
  │   ├─► User selects UPI
  │   ├─► User opens UPI app
  │   ├─► User confirms payment
  │   └─► Razorpay generates response with signature
  │
  ├─► STEP 5: Payment Callback
  │   ├─► handler() function called
  │   ├─► Receive: razorpay_order_id
  │   ├─► Receive: razorpay_payment_id
  │   └─► Receive: razorpay_signature
  │
  ├─► STEP 6: Server Verification
  │   ├─► POST /api/orders/verify
  │   │   └─► Body: { order_id, payment_id, signature }
  │   │
  │   ├─► Backend Verifies:
  │   │   ├─ Generate expected signature: HMAC-SHA256(order_id|payment_id, secret)
  │   │   ├─ Compare with received signature
  │   │   └─ Fetch payment from Razorpay to confirm
  │   │
  │   └─► Response:
  │       ├─ success: true
  │       ├─ paymentId
  │       └─ orderId
  │
  ├─► STEP 7: Create App Order
  │   ├─► status: "Paid"
  │   ├─ paymentId: razorpay_payment_id
  │   ├─ total: calculated amount
  │   └─ other details...
  │
  ├─► STEP 8: Clear Cart
  │   └─► setCart([]) / setGuestCart([])
  │
  └─► STEP 9: Redirect & Success
      ├─ Show success message
      ├─ Redirect to /orders page
      └─ END: Order visible in orders list
```

## Payment Verification Flow

```
┌──────────────────────────────────┐
│  Frontend Payment Response        │
│  ┌──────────────────────────────┐│
│  │ razorpay_order_id: xxx       ││
│  │ razorpay_payment_id: yyy     ││
│  │ razorpay_signature: zzz      ││
│  └──────────────────────────────┘│
└──────────────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ POST /api/orders/verify
        └──────────┬───────────┘
                   │
                   ▼
   ┌───────────────────────────────┐
   │ HMAC-SHA256 Verification      │
   │                               │
   │ Expected = HMAC-SHA256(       │
   │   msg: order_id|payment_id    │
   │   key: RAZORPAY_KEY_SECRET    │
   │ )                             │
   │                               │
   │ Compare Expected === Received │
   └───────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    Match              No Match
        │                     │
        ▼                     ▼
  Continue         Return Error
  Verification     (401 Unauthorized)
        │
        ▼
   ┌──────────────────────────┐
   │ Fetch Payment Details    │
   │ from Razorpay            │
   │                          │
   │ razorpay.payments        │
   │ .fetch(payment_id)       │
   └──────────┬───────────────┘
              │
              ▼
   ┌──────────────────────────┐
   │ Check Status             │
   │                          │
   │ if status === 'captured' │
   └──────────┬───────────────┘
              │
        ┌─────┴─────┐
        │           │
      Yes           No
        │           │
        ▼           ▼
    Success      Failure
    Return       Return Error
    {            {
      success:   error: 'Not
      true       captured'
    }            }
```

## Database Schema - Order with Payment

```
┌──────────────────────────────────────────┐
│           Order Document                 │
├──────────────────────────────────────────┤
│                                          │
│  ID: ORD1234567890                       │
│  ├─ userId: user_123                     │
│  │                                       │
│  ├─ Items: [                             │
│  │   {                                   │
│  │     id: 1,                            │
│  │     name: "Product Name",             │
│  │     price: 500,                       │
│  │     quantity: 2                       │
│  │   },                                  │
│  │   ...                                 │
│  │ ]                                     │
│  │                                       │
│  ├─ Delivery Address: {                  │
│  │   name: "John Doe",                   │
│  │   phone: "9999999999",                │
│  │   address: "123 Main St",             │
│  │   city: "Mumbai",                     │
│  │   pincode: "400001"                   │
│  │ }                                     │
│  │                                       │
│  ├─ Delivery Slot: {                     │
│  │   id: 1,                              │
│  │   label: "Today, 2:00 PM - 4:00 PM"  │
│  │ }                                     │
│  │                                       │
│  ├─ Payment: {                           │
│  │   method: "UPI",                      │
│  │   status: "Paid",              ◄─ NEW │
│  │   paymentId: "pay_xxx",        ◄─ NEW │
│  │   amount: 1500,                       │
│  │   currency: "INR"                     │
│  │ }                                     │
│  │                                       │
│  └─ Timestamps: {                        │
│     createdAt: "2024-01-26T10:30:00Z"   │
│   }                                      │
│                                          │
└──────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    App Component                        │
│  (page.tsx - Main application container)               │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────────┐
    │ HomePage │  │CheckOut  │  │OrdersPage    │
    │          │  │Page      │  │              │
    │• Display │  │• Address │  │• List Orders │
    │• Products│  │• Slots   │  │• Show Status │
    │• Cart    │  │• Payment │  │• Show PayID  │
    └──────────┘  └────┬─────┘  └──────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Payment Method Selection    │
        │  ┌────┐ ┌────┐ ┌────┐      │
        │  │COD │ │UPI*│ │Card│      │
        │  └────┘ └────┘ └────┘      │
        │        * = New Feature      │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ handleInitiateRazorpayPayment│
        │                              │
        │ ┌─────────────────────────┐ │
        │ │ Validate Checkout       │ │
        │ └────────────┬────────────┘ │
        │              │              │
        │ ┌────────────▼────────────┐ │
        │ │ Create Razorpay Order   │ │
        │ │ (Backend API)           │ │
        │ └────────────┬────────────┘ │
        │              │              │
        │ ┌────────────▼────────────┐ │
        │ │ Load Script & Open Modal│ │
        │ └────────────┬────────────┘ │
        │              │              │
        │ ┌────────────▼────────────┐ │
        │ │ Verify Payment (Backend)│ │
        │ └────────────┬────────────┘ │
        │              │              │
        │ ┌────────────▼────────────┐ │
        │ │ Create App Order        │ │
        │ └────────────┬────────────┘ │
        │              │              │
        │ ┌────────────▼────────────┐ │
        │ │ Redirect to Orders      │ │
        │ └────────────────────────┘ │
        └──────────────────────────────┘
```

## API Communication Diagram

```
Frontend                           Backend                     Razorpay

User clicks                                                   
"Place Order"                                                
  │                                                          
  ├─►POST /api/orders/create                                
  │  { amount, orderId, ... }                               
  │                                    ├─►CREATE ORDER      
  │                                    │  ┌──────────────┐  
  │                                    │  │ Razorpay     │  
  │                                    │  │ Servers      │  
  │                                    │  └──────────────┘  
  │                    ◄─ Response ◄───┤                    
  │        { orderId, amount, key }    │                    
  │                                    │                    
Load Razorpay Script                   │                    
Open Modal                             │                    
User pays                              │                    
  │                                    │                    
  │        ┌──────────────────────────────────────────┐     
  │        │ Payment Processing in UPI App / Modal    │     
  │        └──────────────────────────────────────────┘     
  │                                    │                    
Get response with signature            │                    
  │                                    │                    
  ├─►POST /api/orders/verify                              
  │  { order_id, payment_id, sig }                         
  │                    ├─►VERIFY ──────────────────────►  
  │                    │  Check signature                 
  │                    │  Fetch payment details           
  │                    │  ◄──────────────────────────────┐ 
  │        ◄─ Response ◄─┤                                 │ 
  │     { success: true, paymentId }  │                    │ 
  │                                    │                    
Create App Order                       │                    
Display Success                        │                    
Redirect to Orders                     │                    
```

## State Management Flow

```
Initial State:
  paymentMethod = 'COD'
  selectedAddress = null
  selectedSlot = null
  processingOrder = false
  orders = []
  cart = [...]

User selects "UPI":
  paymentMethod = 'UPI'

User fills checkout details:
  selectedAddress = address_id
  selectedSlot = slot_id

User clicks "Place Order":
  processingOrder = true
  
  ├─► Razorpay payment successful
  │   └─► Order created with status = "Paid"
  │
  ├─► Add order to orders array
  │
  ├─► Clear cart:
  │   cart = []
  │
  ├─► Update UI:
  │   processingOrder = false
  │   success = "Payment successful!"
  │
  └─► Redirect to /orders page
      currentPage = 'orders'

Final State:
  orders = [
    {
      id: ORD123...,
      paymentMethod: 'UPI',
      status: 'Paid',
      paymentId: 'pay_xxx',
      ...
    },
    ...previous orders...
  ]
  cart = []
  selectedAddress = null
  selectedSlot = null
```

---

These diagrams show:
1. **System Architecture** - How components interact
2. **Data Flow** - Complete UPI payment process
3. **Verification Flow** - Signature verification steps
4. **Database Schema** - Order structure with payment
5. **Component Interaction** - React component relationships
6. **API Communication** - Frontend-backend-Razorpay flow
7. **State Management** - State changes throughout process

Each diagram builds understanding of the complete Razorpay integration!
