import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import { createUser } from './src/models/User.model.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api', (req, res) => {
    res.status(200)
        .json({ message: 'Welcome to Artisan Find API' });
    createUser('John Doe', 'john@example.com', 'password123');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});