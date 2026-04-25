class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;
    // This line is used to preserve the original stack trace of the error.
    // If we don't call this method, the stack trace will point to the constructor of the AppError class,
    // which is not very useful for debugging purposes.
    // By calling Error.captureStackTrace, we ensure that the stack trace points to the place where the AppError was created.
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = appError;
