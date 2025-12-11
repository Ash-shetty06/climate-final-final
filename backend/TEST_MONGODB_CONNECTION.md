# Quick MongoDB Atlas Connection Test

Since you have the IP whitelist configured ✅, let's verify the connection string is correct.

## Steps to Verify & Fix:

### 1. Check Your MongoDB Atlas Connection String

Go to MongoDB Atlas and get a fresh connection string:

1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Choose **"Drivers"** → **"Node.js"**
3. Copy the connection string - should look like:
   ```
   mongodb+srv://pagadalamanoj73_db_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Important: URL-Encode Your Password

If your MongoDB Atlas password contains special characters like:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

You need to URL-encode them!

**Example:**
- Password: `MyPass@123#`
- Encoded: `MyPass%40123%23`

### 3. Update backend/.env

Your MONGO_URI should be:

```env
MONGO_URI=mongodb+srv://pagadalamanoj73_db_user:YOUR_ENCODED_PASSWORD@cluster0.xxxxx.mongodb.net/atmosview?retryWrites=true&w=majority&appName=Cluster0
```

**Make sure to:**
- Replace `YOUR_ENCODED_PASSWORD` with your actual password (URL-encoded if needed)
- Keep `/atmosview` as the database name
- Keep `?retryWrites=true&w=majority`

### 4. Restart the Backend

Stop backend (`Ctrl+C` in terminal) and restart:
```bash
npm run dev
```

### 5. Check the Console Output

You should see:
```
✅ MongoDB connected successfully
📊 Database: atmosview
```

If you see:
```
❌ MongoDB connection failed: MongoServerError: bad auth
```
Then your password is wrong or needs URL encoding.

### 6. Test Registration

Try registering at `http://localhost:3001/#/register`

If it still fails, check the backend terminal for the exact error message!

---

## Quick Test Command

Run this in PowerShell to test if your .env is being loaded:

```powershell
cd backend
node -e "require('dotenv').config(); console.log('MongoDB URI configured:', process.env.MONGO_URI ? 'YES' : 'NO')"
```

Should show: `MongoDB URI configured: YES`
