const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { NotFoundError, AuthenticationError, ValidationError } = require('../utils/errors');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// Debug middleware
router.use((req, res, next) => {
  console.log('Results Route:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Get results for a specific student
router.get('/student/:studentId', auth, async (req, res, next) => {
  try {
    console.log('Getting results for student:', {
      requestedStudentId: req.params.studentId,
      authenticatedUserId: req.user.id,
      userRole: req.user.role
    });

    // Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      throw new ValidationError('Invalid student ID format');
    }

    // Only allow students to view their own results
    if (req.user.role === 'STUDENT' && req.user.id !== req.params.studentId) {
      throw new AuthenticationError('Not authorized to view these results');
    }

    const results = await ExamResult.find({ studentId: req.params.studentId })
      .populate({
        path: 'examId',
        select: 'title description startTime durationMinutes',
        populate: {
          path: 'teacherId',
          select: 'name email kelas'
        }
      });

    console.log('Found results:', {
      count: results.length,
      studentId: req.params.studentId
    });

    res.json(results);
  } catch (error) {
    console.error('Error in getStudentResults:', error);
    next(error);
  }
});

// Get all results for a specific exam
router.get('/exam/:examId', auth, requireRole(['TEACHER']), async (req, res, next) => {
  try {
    console.log('Getting results for exam:', {
      examId: req.params.examId,
      teacherId: req.user.id
    });

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(req.params.examId)) {
      throw new ValidationError('Invalid exam ID format');
    }

    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Only allow teachers to view results for their own exams
    if (exam.teacherId.toString() !== req.user.id) {
      throw new AuthenticationError('Not authorized to view these results');
    }

    const results = await ExamResult.find({ examId: req.params.examId })
      .populate({
        path: 'studentId',
        select: 'name email'
      });

    console.log('Found exam results:', {
      count: results.length,
      examId: req.params.examId
    });

    res.json(results);
  } catch (error) {
    console.error('Error in getExamResults:', error);
    next(error);
  }
});

// Submit exam answers
router.post('/:examId/submit', auth, requireRole(['STUDENT']), validate(schemas.submitExam), async (req, res, next) => {
  try {
    console.log('Submitting exam answers:', {
      examId: req.params.examId,
      studentId: req.user.id,
      answerCount: req.body.answers?.length
    });

    const { examId } = req.params;
    const { answers } = req.body;

    // Validasi format ObjectId
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      throw new ValidationError('Invalid exam ID format');
    }

    // Cek apakah exam sudah pernah dikerjakan
    const existingResult = await ExamResult.findOne({
      examId,
      studentId: req.user.id
    });
    if (existingResult) {
      throw new ValidationError('Exam sudah dikerjakan.');
    }

    // Ambil data ujian dan populate pertanyaan
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (!exam.isCurrentlyActive()) {
      throw new ValidationError('Exam is not currently active');
    }

    // Hitung skor dan tandai benar/salah
    let score = 0;
    const processedAnswers = answers.map(answer => {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) score++;
      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: !!isCorrect
      };
    });

    // Simpan hasil ujian
    const result = new ExamResult({
      examId,
      studentId: req.user.id,
      score,
      answers: processedAnswers,
      startedAt: new Date(), // Bisa gunakan waktu aktual mulai jika dicatat
      submittedAt: new Date()
    });

    await result.save();

    console.log('Exam submitted successfully:', {
      examId,
      studentId: req.user.id,
      score,
      totalQuestions: exam.questions.length
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in submitExam:', error);
    next(error);
  }
});

module.exports = router; 