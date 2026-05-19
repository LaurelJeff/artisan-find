import express from 'express';
import { getAllArtisans, getArtisanProfile, getAppliedJobs } from '../controller/ArtisanController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/my-applications', authMiddleware, getAppliedJobs);

// Public routes
router.get('/', getAllArtisans);
router.get('/:id', getArtisanProfile);

export default router;
