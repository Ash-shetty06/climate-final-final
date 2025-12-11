require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/weatherr';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev_change_me';
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_create_key';

const isAtlas = MONGO_URI.includes('mongodb+srv');
console.log('Using MongoDB URI:', isAtlas ? 'MongoDB Atlas' : 'Local MongoDB');

// enable CORS with credentials so browser sends/receives cookies
app.use(cors({ 
  origin: ['http://10.13.130.39:3001', 'http://localhost:3001', 'http://localhost:3000'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB via mongoose
mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Create fixed admin account if missing
    const adminAccount = { email: 'weatheradmin@gmail.com', password: 'weather123' };
    try {
      const existing = await User.findOne({ email: adminAccount.email }).exec();
      if (!existing) {
        const hash = await bcrypt.hash(adminAccount.password, 10);
        const newAdmin = new User({ email: adminAccount.email, password: hash, role: 'admin' });
        await newAdmin.save();
        console.log(`✓ Admin account created: ${adminAccount.email}`);
      } else {
        console.log(`✓ Admin account exists: ${adminAccount.email}`);
      }
    } catch (err) {
      console.error(`Failed to create admin ${adminAccount.email}:`, err.message);
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Define User model
const { Schema } = mongoose;
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: () => new Date() }
});
const User = mongoose.model('User', userSchema);

function generateToken(user) {
  const payload = { email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function requireAuth(req, res, next) {
  // Accept token from Authorization header or httpOnly cookie named 'token'
  let token = null;
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
  if (!token && req.cookies && req.cookies.token) token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Missing or invalid token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden: insufficient role' });
    next();
  };
}

app.get('/', (req, res) => res.json({ ok: true, msg: 'Weatherr backend running' }));

// Frontend auth endpoints (with username support and token response)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  
  try {
    const existing = await User.findOne({ email }).exec();
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });
    
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, role: role || 'user' });
    await user.save();
    
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Registered successfully',
      token,
      user: { email: user.email, role: user.role, username: username || email.split('@')[0] }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    if (role && role !== user.role) return res.status(403).json({ success: false, message: 'Role mismatch. Login not allowed for requested role.' });
    
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ 
      success: true,
      token,
      user: { email: user.email, role: user.role, username: email.split('@')[0] }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Original auth endpoints (for AuthModal component)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  try {
    const existing = await User.findOne({ email }).exec();
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'Registered successfully. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ message: 'User not found. Please register first.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    // If client provided a desired role, enforce it matches stored role
    if (role && role !== user.role) return res.status(403).json({ message: 'Role mismatch. Login not allowed for requested role.' });
    // Only allow the fixed admin account to login as admin
    if (role === 'admin' && user.role === 'admin' && user.email !== 'weatheradmin@gmail.com') {
      return res.status(403).json({ message: 'This admin account is not allowed to login' });
    }
    const token = generateToken(user);
    // Set httpOnly cookie so frontend doesn't need to store token in localStorage
    const cookieOptions = {
      httpOnly: true,
      secure: false, // HTTP in local/network
      sameSite: 'lax', // allow normal navigation and XHR from same IP/port origin
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('token', token, cookieOptions);
    res.json({ user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint - clears the httpOnly cookie
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
});

// Protected route example
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('email role createdAt').exec();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin-only: list all users (no passwords)
app.get('/api/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('email role createdAt').exec();
    res.json(users.map(u => ({ email: u.email, role: u.role, createdAt: u.createdAt })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin-only: delete a user by email
app.delete('/api/users/:email', requireAuth, requireRole('admin'), async (req, res) => {
  const { email } = req.params;
  if (!email) return res.status(400).json({ message: 'Email required' });
  // Prevent deletion of admin accounts
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });
    await User.deleteOne({ email }).exec();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Weatherr backend listening on port ${PORT}...`));
