import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import authRoutes from './src/routes/authroute.js';
import artisanRoutes from './src/routes/artisan.js';
import jobRoutes from './src/routes/jobs.js';
import userRoutes from './src/routes/user.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: process.env.SESSION_LIFETIME ? parseInt(process.env.SESSION_LIFETIME) : 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', userRoutes);

// base state inituialization
app.get('/api', async (req, res) => {
    res.status(200)
        .json({
            message: 'Welcome to Artisan Find API',
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});