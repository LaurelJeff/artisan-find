import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { createUser, getUserById, getAllUsers, deleteUser } from './src/models/User.model.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// base state inituialization
app.get('/api', async (req, res) => {
    res.status(200)
        .json({
            message: 'Welcome to Artisan Find API',
        });
});

// get user by id
app.get('/api/user/:id', async (req, res) => {
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
});

// Create a new user
app.post('/api/user', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await createUser(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500)
            .json({ message: 'Internal server error' });
    }
})

// get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        if (users.length > 0) {
            res.status(200)
                .json(users);
        } else {
            res.status(404)
                .json({ message: 'no users avialable' })
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

// delete user by id
app.delete('/api/user/:id', async (req, res) => {
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
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});