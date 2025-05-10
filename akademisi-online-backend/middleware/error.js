const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err.isOperational ? { details: err } : {})
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      errorCode: err.errorCode,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      status: 'fail',
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 'fail',
      errorCode: 'DUPLICATE_KEY',
      message: `Duplicate value for ${field}`,
      field
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      errorCode: 'INVALID_ID',
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      errorCode: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      errorCode: 'TOKEN_EXPIRED',
      message: 'Token expired'
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong'
  });
};

module.exports = errorHandler; 