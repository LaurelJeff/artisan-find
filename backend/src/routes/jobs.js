import express from 'express';
import { 
    createJob, 
    getAllJobs, 
    getJobDetails, 
    registerForJob, 
    hireArtisan, 
    getJobRegistrations 
} from '../controller/JobsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobDetails);

// Protected routes
router.post('/', authMiddleware, createJob);
router.post('/:id/register', authMiddleware, registerForJob);
router.get('/:id/registrations', authMiddleware, getJobRegistrations);
router.post('/:id/hire', authMiddleware, hireArtisan);

export default router;
