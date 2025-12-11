# Fix Registration Error (500 Internal Server Error)

## Problem
User registration is failing with a **500 Internal Server Error** as shown in the browser console.

## Root Cause
The backend `.env` file is missing the `JWT_SECRET` environment variable, which is required for generating authentication tokens during user registration.

## Solution

### Step 1: Add JWT_SECRET to .env file

Open `backend/.env` file and add this line:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
```

**Complete .env file should look like:**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/atmosview
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES=7d
```

### Step 2: Restart the Backend Server

1. Stop the current backend server (press `Ctrl+C` in the terminal)
2. Restart it: `npm run dev`

### Step 3: Test Registration

Try registering again with:
- Username: `ashmitha`
- Email: `ashmitha@gmail.com`
- Password: (your password)
- Account Type: Researcher

## Why This Happens

In `backend/controllers/authController.js` (lines 36-40), the registration process tries to create a JWT token:

```javascript
const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,  // ❌ This is undefined without .env
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
);
```

Without `JWT_SECRET`, the `jwt.sign()` function throws an error, causing the 500 error.

## Additional Checks

### Verify MongoDB Connection
Your MongoDB is running ✅ (process ID: 4404)

### Verify Backend is Running
Check the terminal where you ran `npm run dev` - you should see:
```
✅ MongoDB connected successfully
📊 Database: atmosview
🚀 AtmosView Backend API running on http://localhost:5001
```

## After The Fix

Once fixed, registration will return:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJS...",
  "user": {
    "id": "...",
    "email": "ashmitha@gmail.com",
    "username": "ashmitha",
    "role": "researcher"
  }
}
```

And you'll be automatically logged in! 🎉
