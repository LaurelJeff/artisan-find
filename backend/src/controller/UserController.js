import bcrypt from 'bcrypt';
import { createUser, getUserByEmail, getUserById } from '../models/User.model.js';

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function register(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Validate input
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Create user
        const user = await createUser(name, email, password);

        // Create session
        req.session.userId = user.id;
        req.session.userEmail = user.email;

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Login a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function login(req, res) {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.userEmail = user.email;

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Logout a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export function logout(req, res) {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging out' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Get current user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getCurrentUser(req, res) {
    try {
        const user = await getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
