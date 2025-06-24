// models/RawRegistrationLog.js
const mongoose = require('mongoose');

const rawRegistrationLogSchema = new mongoose.Schema({
name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
   kelas: {
    type: String,
    required: function () {
      return this.role === 'STUDENT'; // hanya wajib jika role-nya siswa
    },
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['TEACHER', 'STUDENT', 'ADMIN'],
    required: [true, 'Role is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RawRegistrationLog', rawRegistrationLogSchema);
