import bcrypt from 'bcrypt';
import { createUser, getUserByEmail, getUserById, getAllUsers, deleteUser, updateUser } from '../models/User.model.js';
import { upgradeUserToArtisan } from '../models/Artisan.model.js';

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

/**
 * Upgrade currently logged in user to an artisan
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function becomeArtisan(req, res) {
    const { profession } = req.body;
    try {
        if (!profession) {
            return res.status(400).json({ message: 'Profession is required' });
        }

        // Check if user is logged in
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized - Please log in' });
        }

        const artisan = await upgradeUserToArtisan(req.userId, profession);
        res.status(200).json({
            message: 'Upgraded to Artisan successfully',
            artisan: {
                id: artisan.id,
                userId: artisan.userId,
                profession: artisan.profession,
            }
        });
    } catch (error) {
        console.error('Error upgrading user to artisan:', error);
        if (error.message === 'User is already registered as an artisan') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Get user by id
 */
export async function getUser(req, res) {
    const { id } = req.params;
    try {
        const user = await getUserById(parseInt(id));
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Create a new user
 */
export async function postUser(req, res) {
    const { name, email, password } = req.body;
    try {
        const user = await createUser(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Get all users
 */
export async function getUsers(req, res) {
    try {
        const users = await getAllUsers();
        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: 'no users avialable' })
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Delete user by id
 */
export async function removeUser(req, res) {
    const { id } = req.params;
    try {
        const deletedUser = await deleteUser(parseInt(id));
        if (deletedUser) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error or user does not exist' });
    }
}

/**
 * Update user
 */
export async function editUser(req, res) {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        const updatedUser = await updateUser(parseInt(id), name, email, password);
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
