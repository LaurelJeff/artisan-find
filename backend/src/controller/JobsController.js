import { 
    createJobListing, 
    getJobListingById, 
    getAllJobListings, 
    registerArtisanForJob, 
    hireArtisanForJob, 
    getJobRegistrations as getJobRegistrationsModel 
} from '../models/Jobs.model.js';
import { getArtisanByUserId } from '../models/Artisan.model.js';

/**
 * Post/Create a new job listing
 */
export async function createJob(req, res) {
    const { title, description, location, jobType, salary } = req.body;

    try {
        if (!title || !description || !location || !jobType) {
            return res.status(400).json({ message: 'All fields (title, description, location, jobType) are required' });
        }

        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        const job = await createJobListing(title, description, location, jobType, salary || null, req.userId);
        res.status(201).json({
            message: 'Job listing created successfully',
            job,
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Get all job listings
 */
export async function getAllJobs(req, res) {
    try {
        const jobs = await getAllJobListings();
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Get specific job listing details
 */
export async function getJobDetails(req, res) {
    const { id } = req.params;
    try {
        const job = await getJobListingById(parseInt(id));
        if (!job) {
            return res.status(404).json({ message: 'Job listing not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Register/Apply for a job listing (must be logged in as an Artisan)
 */
export async function registerForJob(req, res) {
    const { id: jobId } = req.params;

    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        // Find the artisan profile of the logged-in user
        const artisan = await getArtisanByUserId(req.userId);
        if (!artisan) {
            return res.status(403).json({ message: 'Forbidden - You must have an Artisan profile to register/apply for jobs' });
        }

        const registration = await registerArtisanForJob(parseInt(jobId), artisan.id);
        res.status(201).json({
            message: 'Successfully registered for the job',
            registration,
        });
    } catch (error) {
        console.error('Error registering for job:', error);
        if (error.message === 'Job listing not found') {
            return res.status(404).json({ message: error.message });
        }
        // Unique constraint error (P2002) in Prisma
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'You have already registered/applied for this job' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Hire an artisan for a job (must be the owner/creator of the job listing)
 */
export async function hireArtisan(req, res) {
    const { id: jobId } = req.params;
    const { artisanId } = req.body;

    try {
        if (!artisanId) {
            return res.status(400).json({ message: 'artisanId is required' });
        }

        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        const registration = await hireArtisanForJob(parseInt(jobId), parseInt(artisanId), req.userId);
        res.status(200).json({
            message: 'Artisan hired successfully for this job',
            registration,
        });
    } catch (error) {
        console.error('Error hiring artisan:', error);
        if (error.message === 'Job listing not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Unauthorized: Only the job poster can hire for this job') {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error or registration does not exist' });
    }
}

/**
 * Get all registrations/applications for a job listing (must be the owner/creator of the job listing)
 */
export async function getJobRegistrations(req, res) {
    const { id: jobId } = req.params;

    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        const job = await getJobListingById(parseInt(jobId));
        if (!job) {
            return res.status(404).json({ message: 'Job listing not found' });
        }

        if (job.employerId !== req.userId) {
            return res.status(403).json({ message: 'Forbidden - Only the job owner can view registrations' });
        }

        const registrations = await getJobRegistrationsModel(parseInt(jobId));
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error getting job registrations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
