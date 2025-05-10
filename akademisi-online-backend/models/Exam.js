const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add index for better query performance
examSchema.index({ teacherId: 1 });
examSchema.index({ startTime: 1 });

// Add method to check if exam is currently active
examSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const endTime = new Date(this.startTime.getTime() + this.durationMinutes * 60000);
  return now >= this.startTime && now <= endTime;
};

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam; 