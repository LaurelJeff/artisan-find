import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates a new job listing posted by an employer (User)
 */
export async function createJobListing(title, description, location, jobType, salary, employerId) {
    try {
        return await prisma.jobListing.create({
            data: {
                title,
                description,
                location,
                jobType,
                salary,
                employerId,
            },
        });
    } catch (error) {
        console.error("Error creating job listing:", error);
        throw error;
    }
}

/**
 * Retrieves a job listing by its ID
 */
export async function getJobListingById(id) {
    return prisma.jobListing.findUnique({
        where: { id },
        include: {
            employer: {
                select: { id: true, name: true, email: true }
            },
        },
    });
}

/**
 * Retrieves all job listings
 */
export async function getAllJobListings() {
    return prisma.jobListing.findMany({
        include: {
            employer: {
                select: { id: true, name: true, email: true }
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

/**
 * Registers (applies) an artisan for a job listing
 */
export async function registerArtisanForJob(jobId, artisanId) {
    try {
        // Check if job exists
        const job = await prisma.jobListing.findUnique({ where: { id: jobId } });
        if (!job) {
            throw new Error("Job listing not found");
        }

        // Create the registration/application
        return await prisma.jobRegistration.create({
            data: {
                jobId,
                artisanId,
                status: "registered",
            },
        });
    } catch (error) {
        console.error("Error registering artisan for job:", error);
        throw error;
    }
}

/**
 * Hires an artisan for a job (updates registration status to 'hired')
 * Only the employer who posted the job can perform this action.
 */
export async function hireArtisanForJob(jobId, artisanId, employerId) {
    try {
        // Find the job listing to verify ownership
        const job = await prisma.jobListing.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            throw new Error("Job listing not found");
        }

        if (job.employerId !== employerId) {
            throw new Error("Unauthorized: Only the job poster can hire for this job");
        }

        // Find and update the registration status to hired
        return await prisma.jobRegistration.update({
            where: {
                jobId_artisanId: {
                    jobId,
                    artisanId,
                },
            },
            data: {
                status: "hired",
            },
        });
    } catch (error) {
        console.error("Error hiring artisan for job:", error);
        throw error;
    }
}

/**
 * Retrieves all registrations/applications for a specific job
 */
export async function getJobRegistrations(jobId) {
    return prisma.jobRegistration.findMany({
        where: { jobId },
        include: {
            artisan: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }
        },
    });
}

/**
 * Retrieves all job registrations/applications submitted by a specific artisan
 */
export async function getArtisanRegistrations(artisanId) {
    return prisma.jobRegistration.findMany({
        where: { artisanId },
        include: {
            job: {
                include: {
                    employer: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }
        },
    });
}
