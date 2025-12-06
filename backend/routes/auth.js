import express from 'express';
import { register, login, getCurrentUser, verifyToken, addFavoriteCity, removeFavoriteCity } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);


// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/favorites', verifyToken, addFavoriteCity);
router.delete('/favorites/:cityId', verifyToken, removeFavoriteCity);

export default router;
