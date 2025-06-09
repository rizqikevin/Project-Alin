const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Debug middleware
router.use((req, res, next) => {
  console.log('Questions Route:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  next();
});

// Helper function to convert string ID to ObjectId
const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (error) {
    console.error('Error converting to ObjectId:', error);
    return null;
  }
};

// Get all questions for a teacher
router.get('/', auth, async (req, res) => {
  try {
    const { teacherId } = req.query;
    
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    const questions = await Question.find({ teacherId });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get a single question
router.get('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Error fetching question' });
  }
});

// Create a new question
router.post('/', auth, async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation,imageUrl, teacherId } = req.body;

    // Validate required fields
    if (!question || !options || correctAnswer === undefined || !explanation || !teacherId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Question must have exactly 4 options' });
    }

    // Validate correctAnswer
    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: 'Correct answer must be between 0 and 3' });
    }

    const newQuestion = new Question({
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswer,
      explanation: explanation.trim(),
       imageUrl: imageUrl?.trim() || null,
      teacherId
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation, imageUrl } = req.body;

    // Validate required fields
    if (!question || !options || correctAnswer === undefined || !explanation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Question must have exactly 4 options' });
    }

    // Validate correctAnswer
    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: 'Correct answer must be between 0 and 3' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer,
        explanation: explanation.trim(),
         imageUrl: imageUrl?.trim() || null,
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/questions/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (_req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/upload-image', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imageUrl = `/uploads/questions/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});


module.exports = router; 