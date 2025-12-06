import express from 'express';
import { register, login, getCurrentUser, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;
