const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Question'
  },
  selectedAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const examResultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Exam'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  answers: [answerSchema],
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examResultSchema.index({ studentId: 1, submittedAt: -1 });

// Virtual for duration in minutes
examResultSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.submittedAt - this.startedAt) / (1000 * 60));
});

// Method to calculate percentage score
examResultSchema.methods.getPercentageScore = function() {
  const totalQuestions = this.answers.length;
  if (totalQuestions === 0) return 0;
  return Math.round((this.score / totalQuestions) * 100);
};

const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = ExamResult; 