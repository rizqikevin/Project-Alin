const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const mongoose = require('mongoose');
const { validate, schemas } = require('../middleware/validation');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Debug middleware
router.use((req, res, next) => {
  console.log('Exams Route:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Get all exams
router.get('/', async (req, res, next) => {
  try {
    const exams = await Exam.find()
      .populate('questions')
      .populate('teacherId', 'name email');
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// Get active exams for students
router.get('/active', async (req, res, next) => {
  try {
    const now = new Date();
    const exams = await Exam.find({
      startTime: { $lte: now },
      $expr: {
        $gt: [
          { $add: ['$startTime', { $multiply: ['$durationMinutes', 60000] }] },
          now
        ]
      },
      isActive: true
    })
    .populate('questions')
    .populate('teacherId', 'name email');
    
    console.log('Found active exams:', exams);
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// Get exams by teacher ID
router.get('/teacher/:teacherId', async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      throw new ValidationError('Invalid teacher ID format');
    }

    const exams = await Exam.find({ teacherId })
      .populate('questions')
      .populate('teacherId', 'name email');
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// Get exam by ID
router.get('/:examId', async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new ValidationError('Invalid exam ID format');
    }

    const exam = await Exam.findById(examId)
      .populate('questions')
      .populate('teacherId', 'name email');

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    res.json(exam);
  } catch (error) {
    next(error);
  }
});

// Add new exam
router.post('/', validate(schemas.createExam), async (req, res, next) => {
  try {
    const { title, description, startTime, durationMinutes, questions, teacherId } = req.body;

    // Convert IDs to ObjectIds
    const questionObjectIds = questions.map(id => new mongoose.Types.ObjectId(id));
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    // Create exam object
    const examData = {
      title,
      description,
      startTime: new Date(startTime),
      durationMinutes: parseInt(durationMinutes, 10),
      questions: questionObjectIds,
      teacherId: teacherObjectId
    };

    console.log('Creating exam with processed data:', JSON.stringify(examData, null, 2));

    // Create and save exam
    const exam = new Exam(examData);
    const savedExam = await exam.save();
    
    // Populate the saved exam
    const populatedExam = await Exam.findById(savedExam._id)
      .populate('questions')
      .populate('teacherId', 'name email');
    
    console.log('Exam created successfully:', JSON.stringify(populatedExam, null, 2));
    res.status(201).json(populatedExam);
  } catch (error) {
    next(error);
  }
});

// Update exam
router.put('/:id', validate(schemas.updateExam), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid exam ID format');
    }

    const exam = await Exam.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('questions')
    .populate('teacherId', 'name email');

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    res.json(exam);
  } catch (error) {
    next(error);
  }
});

// Delete exam
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid exam ID format');
    }

    const exam = await Exam.findByIdAndDelete(id);
    
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 