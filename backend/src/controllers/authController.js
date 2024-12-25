const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
    return jwt.sign(
        { sub: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
    );
};

/**
 * User registration
 * @route POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role = 'Dentist' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            email,
            password,
            role
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User created successfully',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};

/**
 * User login
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error during login',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    login,
    getProfile
};
