# Setup MongoDB Atlas for User Registration/Login

## Current Issue
Your MongoDB Atlas connection string in `.env` is **malformed/incomplete**, causing the 500 error during registration.

## Option 1: Fix MongoDB Atlas Connection (Recommended for Production)

### Step 1: Get Correct Connection String from MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Click **"Connect"** on your cluster
4. Choose **"Connect your application"**
5. Copy the connection string - it should look like this:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/atmosview?retryWrites=true&w=majority
   ```

### Step 2: Update .env File

Open `backend/.env` and replace the MONGO_URI line with your correct connection string:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/atmosview?retryWrites=true&w=majority
```

**Important:** 
- Replace `YOUR_USERNAME` with your Atlas username
- Replace `YOUR_PASSWORD` with your Atlas password
- Replace `YOUR_CLUSTER` with your cluster name
- Make sure `atmosview` is the database name (or change it)

### Step 3: Whitelist Your IP Address

In MongoDB Atlas:
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Either:
   - Click **"Add Current IP Address"** (for your current IP)
   - Or click **"Allow Access from Anywhere"** (use `0.0.0.0/0` - less secure but works everywhere)

### Step 4: Restart Backend

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## Option 2: Use Local MongoDB (Quick Testing)

If you just want to test quickly without Atlas:

### Step 1: Update .env

```env
MONGO_URI=mongodb://localhost:27017/atmosview
```

### Step 2: Restart Backend

Your local MongoDB is already running (process 4404), so it will work immediately!

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## How to Verify It's Working

After restarting the backend, you should see:

```
✅ MongoDB connected successfully
📊 Database: atmosview
🚀 AtmosView Backend API running on http://localhost:5001
```

If you see this error instead:
```
❌ MongoDB connection failed: ...
```

Then:
- **For Atlas:** Check your username/password and IP whitelist
- **For Local:** Make sure MongoDB is running

---

## Which Should You Use?

| Feature | MongoDB Atlas | Local MongoDB |
|---------|---------------|---------------|
| **Data Persistence** | ✅ Stored in cloud | ⚠️ Only on your computer |
| **Access from Anywhere** | ✅ Yes | ❌ No |
| **Setup Complexity** | ⚠️ Need account + config | ✅ Simple |
| **For Production** | ✅ Recommended | ❌ Not recommended |
| **For Viva/Demo** | ✅ Works great | ✅ Also fine |

**Recommendation:** Use **MongoDB Atlas** for your viva since the data will persist even if you restart your computer, and it's more professional!

---

## After Fixing

Try registering again at `http://localhost:3001/#/register` with:
- Username: ashmitha
- Email: ashmitha@gmail.com  
- Password: (your password)
- Account Type: Researcher

You should get a success message and be automatically logged in! 🎉
