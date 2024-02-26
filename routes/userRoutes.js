const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ... Authentication middleware (`authMiddleware.js`) - you'll need to implement this ...

// Register a new user
router.post('/register', async (req, res) => {
    try {
        // 1. Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10); 

        // 2. Create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isSubscribed: false // Default to non-subscribed
        });

        await newUser.save();
        res.status(201).json({ message: 'User created' }); 
    } catch (err) {
        if (err.code === 11000) { // Check for duplicate keys
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Get all users 
router.get('/', authMiddleware, async (req, res) => {  
    // Add admin-only authorization based on req.user (implementation needed) 

    try {
        const users = await User.find({}, '-password'); 
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get a user by ID 
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) return res.status(404).json({ error: 'User not found' }); 
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Delete a user by ID
router.delete('/:id', authMiddleware, async (req, res) => {
    // Add authorization to ensure the user or admin can delete (implementation needed) 

    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Login route 
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find the user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid username or password' });

        // 2. Compare the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({ error: 'Invalid username or password' });

        // 3. Create a JWT 
        const payload = { 
            _id: user._id,
            isSubscribed: user.isSubscribed
        }; 

        const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 

        res.json({ token }); 
    } catch (err) {
        res.status(500).json({ error: 'Login failed' }); 
    }
});

module.exports = router; 
