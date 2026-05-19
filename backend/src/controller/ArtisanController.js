import { getAllArtisans as getAllArtisansModel, getArtisanById, getArtisanByUserId } from '../models/Artisan.model.js';
import { getArtisanRegistrations } from '../models/Jobs.model.js';

/**
 * Fetch all registered artisans
 */
export async function getAllArtisans(req, res) {
    try {
        const artisans = await getAllArtisansModel();
        res.status(200).json(artisans);
    } catch (error) {
        console.error('Error fetching artisans:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Fetch a specific artisan's profile by their ID
 */
export async function getArtisanProfile(req, res) {
    const { id } = req.params;
    try {
        const artisan = await getArtisanById(parseInt(id));
        if (!artisan) {
            return res.status(404).json({ message: 'Artisan profile not found' });
        }
        res.status(200).json(artisan);
    } catch (error) {
        console.error('Error fetching artisan profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Fetch all jobs applied/registered by the currently logged-in artisan
 */
export async function getAppliedJobs(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        // Find the artisan profile associated with this user
        const artisan = await getArtisanByUserId(req.userId);
        if (!artisan) {
            return res.status(403).json({ message: 'Forbidden - You do not have an Artisan profile' });
        }

        const registrations = await getArtisanRegistrations(artisan.id);
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching applied jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
