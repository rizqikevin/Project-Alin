const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const demoUsers = [
  {
    name: 'Demo Teacher',
    email: 'guru@example.com',
    password: 'password123',
    role: 'TEACHER'
  },
  {
    name: 'Demo Student',
    email: 'siswa@example.com',
    password: 'password123',
    role: 'STUDENT'
  }
];

async function initDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop all indexes
    await User.collection.dropIndexes();
    console.log('Dropped existing indexes');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const createdUsers = await User.create(demoUsers);
    console.log('Created demo users:', createdUsers.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role
    })));

    console.log('Demo users initialized successfully');
  } catch (error) {
    console.error('Error initializing demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initDemoUsers(); 