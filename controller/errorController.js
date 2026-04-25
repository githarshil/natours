const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const appError = require('../utils/appError');

const prodError = (err, req, res, next) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const devError = (err, req, res, next) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const JwtError = () => new appError('invalid json web token', 401);
const TokenExpired = () => new appError('json web token expired', 401);
const castError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
};

const duplicateFields = (err) => {
  let field;

  // Preferred: extract field name from err.keyValue if available
  if (err.keyValue && typeof err.keyValue === 'object') {
    const keys = Object.keys(err.keyValue);
    if (keys.length > 0) {
      field = keys[0];
    }
  }

  // Fallback: try to extract field name from the error message using regex
  if (!field && typeof err.message === 'string') {
    // Example message:
    // E11000 duplicate key error collection: db.users index: email_1 dup key: { email: "test@test.com" }
    const indexMatch = err.message.match(/index:\s+([a-zA-Z0-9_]+)_\d+\s/);
    if (indexMatch && indexMatch[1]) {
      field = indexMatch[1];
    } else {
      // Alternative pattern: look inside "dup key: { field: ... }"
      const dupKeyMatch = err.message.match(/dup key:\s*\{\s*([^:]+):/);
      if (dupKeyMatch && dupKeyMatch[1]) {
        field = dupKeyMatch[1].trim().replace(/["']/g, '');
      }
    }
  }

  let message;
  if (field) {
    // Expected output: "email already exists. Please use another value!"
    message = `${field} already exists. Please use another value!`;
  } else {
    // Very defensive fallback if we still couldn't determine the field
    message = 'A value you provided already exists. Please use another value!';
  }

  return new appError(message, 400);
};

const valError = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input data. ${errors}`;
  return new appError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Mongoose CastError
  if (err.name === 'CastError') {
    err = castError(err);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    err = duplicateFields(err);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    err = valError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    err = JwtError(err);
  }
  if (err.name === 'TokenExpiredError') {
    err = TokenExpired(err);
  }
  if (process.env.NODE_ENV === 'development') {
    devError(err, req, res, next);
  } else if (process.env.NODE_ENV === 'production') {
    prodError(err, req, res, next);
  }
};
