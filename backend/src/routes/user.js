import express from 'express';
import { 
    getUser, 
    postUser, 
    getUsers, 
    removeUser, 
    editUser 
} from '../controller/UserController.js';

const router = express.Router();

// User CRUD routes
router.get('/users', getUsers);
router.get('/user/:id', getUser);
router.post('/user', postUser);
router.delete('/user/:id', removeUser);
router.put('/user/:id', editUser);

export default router;
