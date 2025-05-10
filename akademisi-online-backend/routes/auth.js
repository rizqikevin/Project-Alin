const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ValidationError } = require('../utils/errors');

// Debug middleware
router.use((req, res, next) => {
  console.log('Auth Route:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { 
      email,
      hasPassword: !!password,
      bodyKeys: Object.keys(req.body)
    });

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password:', { email, hasPassword: !!password });
      throw new ValidationError('Email and password are required');
    }

    // Trim email and validate format
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      console.log('Invalid email format:', trimmedEmail);
      throw new ValidationError('Invalid email format');
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('User not found:', trimmedEmail);
      throw new ValidationError('Invalid credentials');
    }

    console.log('Found user:', { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', trimmedEmail);
      throw new ValidationError('Invalid credentials');
    }

    console.log('Password matched for user:', trimmedEmail);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Generated token for user:', trimmedEmail);

    const response = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };

    console.log('Sending login response:', {
      userId: response.user.id,
      userRole: response.user.role,
      tokenLength: token.length
    });

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registration attempt:', { 
      name,
      email,
      role,
      hasPassword: !!password,
      bodyKeys: Object.keys(req.body)
    });

    // Validate input
    if (!name || !email || !password || !role) {
      console.log('Missing required fields:', { 
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role
      });
      throw new ValidationError('All fields are required');
    }

    // Trim email and validate format
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      console.log('Invalid email format:', trimmedEmail);
      throw new ValidationError('Invalid email format');
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      console.log('Email already registered:', trimmedEmail);
      throw new ValidationError('Email already registered');
    }

    const user = new User({
      name: name.trim(),
      email: trimmedEmail,
      password,
      role
    });

    await user.save();
    console.log('Registration successful for user:', trimmedEmail);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const response = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };

    console.log('Sending registration response:', {
      userId: response.user.id,
      userRole: response.user.role,
      tokenLength: token.length
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

module.exports = router; 