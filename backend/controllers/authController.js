import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
    try {
        const { email, password, role, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: 'Email, username, and password are required'
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            username,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                favoriteCities: user.favoriteCities
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const requireResearcher = (req, res, next) => {
    if (req.userRole !== 'researcher') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Researcher role required.'
        });
    }
    next();
};

// Add city to favorites
export const addFavoriteCity = async (req, res) => {
    try {
        const { cityId, name, lat, lon } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.favoriteCities.some(city => city.cityId === cityId || city.name === name)) {
            return res.status(400).json({ success: false, message: 'City already in favorites' });
        }

        user.favoriteCities.push({ cityId, name, lat, lon });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'City added to favorites',
            favoriteCities: user.favoriteCities
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const removeFavoriteCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.favoriteCities = user.favoriteCities.filter(city => city.cityId !== cityId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'City removed from favorites',
            favoriteCities: user.favoriteCities
        });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
