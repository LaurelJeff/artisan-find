import express from 'express';
import { register, login, logout, getCurrentUser, becomeArtisan } from '../controller/UserController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authMiddleware, getCurrentUser);
router.post('/become-artisan', authMiddleware, becomeArtisan);

export default router;
