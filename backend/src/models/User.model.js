import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Creates a new user in the database
 * @param {name} name 
 * @param {email} email 
 * @param {password} password 
 * @returns void
 */
export async function createUser(name, email, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

/**
 * `Finds a user by their email address
 * @param {email} email 
 * @returns void
 */
export async function getUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
};

/**
 * Finds a user by their ID
 * @param {id} id 
 * @returns void
 */
export async function getUserById(id) {
    return prisma.user.findUnique({
        where: { id },
    });
};

/**
 * Retrieves all users from the database
 * @returns void
 */
export async function getAllUsers() {
    return prisma.user.findMany();
};

export async function deleteUser(id) {
    return prisma.user.delete(
        {
            where: { id }
        }
    );
}
