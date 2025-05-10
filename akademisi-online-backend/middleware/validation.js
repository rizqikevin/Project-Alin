const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return next(new ValidationError('Validation failed', errors));
    }

    next();
  };
};

// Validation schemas
const schemas = {
  createExam: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(500),
    startTime: Joi.date().iso().required(),
    durationMinutes: Joi.number().integer().min(1).max(180).required(),
    questions: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
    teacherId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),

  updateExam: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(500),
    startTime: Joi.date().iso(),
    durationMinutes: Joi.number().integer().min(1).max(180),
    questions: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1),
    isActive: Joi.boolean()
  }),

  createQuestion: Joi.object({
    question: Joi.string().required().min(10).max(500),
    optionA: Joi.string().required().max(200),
    optionB: Joi.string().required().max(200),
    optionC: Joi.string().required().max(200),
    optionD: Joi.string().required().max(200),
    correctAnswer: Joi.string().valid('A', 'B', 'C', 'D').required(),
    teacherId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),

  submitExam: Joi.object({
    answers: Joi.array().items(
      Joi.object({
        questionId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        selectedAnswer: Joi.string().valid('A', 'B', 'C', 'D').required()
      })
    ).min(1).required()
  })
};

module.exports = {
  validate,
  schemas
}; 