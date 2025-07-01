const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      age_range, 
      region, 
      role = 'examinee' 
    } = req.body;

    console.log('Registration request received:', { email, first_name, last_name, age_range, region });

    // Validate required fields
    const requiredFields = ['email', 'password', 'first_name', 'last_name', 'age_range', 'region'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('Validation error:', errorMessage);
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error('Registration failed: Email already registered:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    console.log('Creating new user with data:', { email, first_name, last_name, age_range, region, role });

    // Create new user
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      age_range,
      region,
      role: role || 'examinee' // Default role if not provided
    });
    
    console.log('User created successfully:', user.id);

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      age_range: user.age_range,
      region: user.region,
      role: user.role
    };

    console.log('Registration successful:', userResponse);
    
    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      age_range: user.age_range,
      region: user.region,
      role: user.role
    };

    console.log('Login successful:', userResponse);

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare user data for response
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      age_range: user.age_range,
      region: user.region,
      role: user.role,
      last_login: user.last_login
    };

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 