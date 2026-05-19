import { PrismaClient } from "@prisma/client";
import { createUser } from "./User.model.js";

const prisma = new PrismaClient();

/**
 * Creates a brand new user and immediately registers them as an artisan
 */
export async function createArtisan(name, email, password, profession) {
    try {
        const user = await createUser(name, email, password);
        return prisma.artisan.create({
            data: {
                userId: user.id,
                profession: profession,
            },
        });
    } catch (error) {
        console.error("Error creating artisan:", error);
        throw error;
    }
}

/**
 * Upgrades an existing user to an artisan profile
 * @param {number} userId 
 * @param {string} profession 
 */
export async function upgradeUserToArtisan(userId, profession) {
    try {
        // Check if already an artisan
        const existing = await prisma.artisan.findUnique({
            where: { userId: userId },
        });

        if (existing) {
            throw new Error("User is already registered as an artisan");
        }

        return await prisma.artisan.create({
            data: {
                userId: userId,
                profession: profession,
            },
        });
    } catch (error) {
        console.error("Error upgrading user to artisan:", error);
        throw error;
    }
}

export async function getArtisanById(id) {
    return prisma.artisan.findUnique({
        where: { id: id },
        include: { user: true },
    });
}

export async function getArtisanByUserId(userId) {
    return prisma.artisan.findUnique({
        where: { userId: userId },
        include: { user: true },
    });
}

export async function getAllArtisans() {
    return prisma.artisan.findMany({
        include: { user: true },
    });
}

export async function deleteArtisan(id) {
    return prisma.artisan.delete({
        where: { id: id }
    });
}