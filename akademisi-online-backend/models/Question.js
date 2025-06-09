const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
  type: String,
  required: false,
  trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add toJSON method to convert _id to id
questionSchema.methods.toJSON = function() {
  const question = this.toObject();
  question.id = question._id;
  delete question._id;
  delete question.__v;
  return question;
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 