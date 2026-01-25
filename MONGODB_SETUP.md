# MongoDB Integration Setup Guide

## Overview
Replaced the in-memory mock database with MongoDB using Mongoose for persistent data storage.

---

## Files Added/Modified

### New Files Created:

1. **lib/mongodb.ts** - MongoDB connection utility with connection pooling
2. **lib/models/User.ts** - Mongoose User schema and model with validation
3. **lib/seed.ts** - Database seeding script to populate initial users
4. **.env.local** - Environment variables for MongoDB connection

### Modified Files:

1. **app/api/users/update-name/route.ts** - Updated to use MongoDB
2. **package.json** - Added mongoose and tsx, added seed script

---

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install mongoose
npm install --save-dev tsx
```
(Already done)

### Step 2: Configure MongoDB Connection

#### Option A: Local MongoDB
1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # On Windows
   mongod
   
   # Connection string in .env.local:
   MONGODB_URI=mongodb://localhost:27017/penumudies-app
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/penumudies-app?retryWrites=true&w=majority
   ```
4. Update `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/penumudies-app?retryWrites=true&w=majority
   ```

### Step 3: Seed Database with Sample Data
```bash
npm run seed
```

Output:
```
✓ Database seeded with sample users
Users created: 
  { mobile: '9876543210', name: 'John Doe' }
  { mobile: '9876543211', name: 'Jane Smith' }
  { mobile: '9876543212', name: 'Mike Johnson' }
```

### Step 4: Run Application
```bash
npm run dev
```

---

## Database Schema

### User Collection

```typescript
{
  _id: ObjectId,
  mobile: String (required, unique, 10 digits),
  name: String (required, 2-50 chars),
  password: String (required, hidden by default),
  token: String (optional, hidden by default),
  createdAt: Date,
  updatedAt: Date
}
```

**Validation Rules:**
- `mobile`: Must be 10 digits, unique, required
- `name`: 2-50 characters, required
- `password`: Required (never returned in API responses)
- `token`: Optional (never returned in API responses)

---

## API Changes

### PUT /api/users/update-name

**What Changed:**
- Now queries MongoDB instead of in-memory array
- Uses Mongoose for validation and data persistence
- Proper error handling for database operations

**Request:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json",
  "body": {
    "name": "New Name"
  }
}
```

**Response (200 Success):**
```json
{
  "message": "Name updated successfully",
  "user": {
    "mobile": "9876543210",
    "name": "New Name"
  }
}
```

**Error Responses:**
- `400`: Validation error (name too short/long)
- `401`: Unauthorized (invalid token)
- `404`: User not found
- `500`: Server/database error

---

## Environment Variables

Create `.env.local` in project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/penumudies-app

# Optional JWT Secret (for future use)
# JWT_SECRET=your_secret_key_here
```

⚠️ **Important**: 
- Never commit `.env.local` to Git
- Add to `.gitignore`
- Keep sensitive credentials secure

---

## Mongoose Connection Details

**Features:**
- ✅ Connection pooling (max 10 connections)
- ✅ Automatic reconnection
- ✅ Cached connection to prevent multiple connections
- ✅ Buffer commands during connection
- ✅ Runs validators on updates

**Connection Flow:**
```
API Call → dbConnect() → Check cached connection
  ↓
  If cached, use existing
  If new, create connection
  ↓
  Execute MongoDB operation
  ↓
  Return response
```

---

## User Model Features

**Schema Validation:**
```typescript
interface IUser extends Document {
  mobile: string;      // 10 digits, unique
  name: string;        // 2-50 chars
  password: string;    // Not returned in API
  token?: string;      // Not returned in API
  createdAt?: Date;    // Auto-set
  updatedAt?: Date;    // Auto-updated
}
```

**Pre-configured Validations:**
- Mobile: Must be exactly 10 digits
- Name: Min 2, max 50 characters
- Both fields required
- Timestamps automatically managed

---

## Database Seed Data

Default users created by `npm run seed`:

| Mobile | Name | Password |
|--------|------|----------|
| 9876543210 | John Doe | hashed_password_1 |
| 9876543211 | Jane Smith | hashed_password_2 |
| 9876543212 | Mike Johnson | hashed_password_3 |

Token format: `sample_token_<number>`

---

## Testing the Setup

### 1. Start MongoDB
```bash
mongod  # Run in separate terminal
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start App
```bash
npm run dev
```

### 4. Test Update API (using curl or Postman)
```bash
curl -X PUT http://localhost:3000/api/users/update-name \
  -H "Authorization: Bearer sample_token_1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

**Expected Response:**
```json
{
  "message": "Name updated successfully",
  "user": {
    "mobile": "9876543210",
    "name": "Updated Name"
  }
}
```

---

## Future Enhancements

1. **Implement Real JWT**
   ```bash
   npm install jsonwebtoken
   npm install --save-dev @types/jsonwebtoken
   ```
   Update token verification in `route.ts`

2. **Add More API Routes**
   - POST /api/users/register
   - POST /api/users/login
   - GET /api/users/profile

3. **Add MongoDB Indexes**
   ```typescript
   UserSchema.index({ mobile: 1 });
   UserSchema.index({ createdAt: -1 });
   ```

4. **Add Data Encryption**
   - Hash passwords before saving
   - Encrypt sensitive fields

5. **Add Request Logging**
   - Morgan middleware for request logging
   - MongoDB query logging

---

## Troubleshooting

### ❌ "Cannot connect to MongoDB"
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env.local`
- Check connection string format

### ❌ "ValidationError: name: Path `name` is required"
- User record missing `name` field
- Re-seed database: `npm run seed`

### ❌ "MongooseError: Cannot overwrite model"
- Restart dev server: `npm run dev`
- This is normal in development

### ❌ "404: User not found"
- Mobile number doesn't match in database
- Seed database with correct mobile numbers

---

## Security Notes

⚠️ **Current Implementation (Development):**
- Token verification is mock-based
- Passwords not hashed
- No rate limiting

✅ **Production Checklist:**
1. Implement real JWT verification
2. Hash passwords with bcrypt
3. Add rate limiting (express-rate-limit)
4. Use MongoDB Atlas with IP whitelist
5. Set `MONGODB_URI` as secure environment variable
6. Implement CORS properly
7. Add request validation middleware
8. Enable MongoDB encryption at rest

---

## Performance Considerations

- **Connection Pooling**: Max 10 connections (adjustable)
- **Indexes**: Mobile field indexed for fast lookups
- **Query Optimization**: Using findOneAndUpdate with validators

For high-traffic apps, consider:
- Redis caching for user data
- Database query optimization
- Load balancing
