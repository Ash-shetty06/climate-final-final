# EMERGENCY FIX FOR REGISTRATION - DO THIS NOW!

## Step 1: Replace your backend/.env with this EXACT content:

```
PORT=5001
MONGO_URI=mongodb+srv://pagadalamanoj73_db_user:XuJp3Xq9FrYyaRqZBN-VlXuJp@cluster0.q74hs.mongodb.net/atmosview?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-for-atmosview-12345
JWT_EXPIRES=7d
```

## Step 2: Restart Backend

In your backend terminal:
1. Press `Ctrl+C` to stop
2. Run `npm run dev`
3. Wait for: `✅ MongoDB connected successfully`

## Step 3: Try Registration

Go to http://localhost:3001/#/register and register with:
- Username: manoj
- Email: pagadalamanoj73@gmail.com
- Password: (anything you want)
- Account Type: Researcher

## If Still Not Working:

Check the backend terminal for the EXACT error message and tell me what it says!

The error will be after "Registration error:" in red text.
