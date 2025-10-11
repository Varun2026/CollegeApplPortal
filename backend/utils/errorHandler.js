/**
 * Error Handler Utilities
 * 
 * Provides centralized error handling for:
 * - Application errors
 * - Database errors
 * - Azure service errors
 * - Validation errors
 */

/**
 * Centralized error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function errorHandler(err, req, res, next) {
  console.error('\n=== Error Handler ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('Request:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  console.error('====================\n');

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (err.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too Many Requests';
  } else if (err.name === 'DatabaseError') {
    statusCode = 500;
    message = 'Database Error';
    details = 'Database operation failed';
  } else if (err.name === 'AzureError') {
    statusCode = 502;
    message = 'Azure Service Error';
    details = 'External service unavailable';
  } else if (err.name === 'EncryptionError') {
    statusCode = 500;
    message = 'Encryption Error';
    details = 'Data encryption/decryption failed';
  }

  // Prepare error response
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.details = 'An internal error occurred';
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Create custom error classes
 */
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export class AzureError extends Error {
  constructor(message, service = null) {
    super(message);
    this.name = 'AzureError';
    this.service = service;
  }
}

export class EncryptionError extends Error {
  constructor(message, operation = null) {
    super(message);
    this.name = 'EncryptionError';
    this.operation = operation;
  }
}

export class NotFoundError extends Error {
  constructor(message, resource = null) {
    super(message);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message, resource = null) {
    super(message);
    this.name = 'ConflictError';
    this.resource = resource;
  }
}

export class RateLimitError extends Error {
  constructor(message, retryAfter = null) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle database errors
 * @param {Error} error - Database error
 * @returns {DatabaseError} Formatted database error
 */
export function handleDatabaseError(error) {
  console.error('Database error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return new DatabaseError('Database connection refused', error);
  } else if (error.code === 'ETIMEDOUT') {
    return new DatabaseError('Database connection timeout', error);
  } else if (error.code === 'ENOTFOUND') {
    return new DatabaseError('Database server not found', error);
  } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return new DatabaseError('Database access denied', error);
  } else if (error.code === 'ER_BAD_DB_ERROR') {
    return new DatabaseError('Database does not exist', error);
  } else {
    return new DatabaseError('Database operation failed', error);
  }
}

/**
 * Handle Azure service errors
 * @param {Error} error - Azure service error
 * @param {string} service - Service name
 * @returns {AzureError} Formatted Azure error
 */
export function handleAzureError(error, service = 'Azure') {
  console.error(`${service} error:`, error);
  
  if (error.code === 'ENOTFOUND') {
    return new AzureError(`${service} service not found`, service);
  } else if (error.code === 'ECONNREFUSED') {
    return new AzureError(`${service} connection refused`, service);
  } else if (error.code === 'ETIMEDOUT') {
    return new AzureError(`${service} request timeout`, service);
  } else if (error.status === 401) {
    return new AzureError(`${service} authentication failed`, service);
  } else if (error.status === 403) {
    return new AzureError(`${service} access forbidden`, service);
  } else if (error.status === 404) {
    return new AzureError(`${service} resource not found`, service);
  } else {
    return new AzureError(`${service} service error`, service);
  }
}

/**
 * Handle encryption errors
 * @param {Error} error - Encryption error
 * @param {string} operation - Operation that failed
 * @returns {EncryptionError} Formatted encryption error
 */
export function handleEncryptionError(error, operation = 'encryption') {
  console.error(`Encryption error (${operation}):`, error);
  
  if (error.message.includes('Invalid key')) {
    return new EncryptionError('Invalid encryption key', operation);
  } else if (error.message.includes('Invalid IV')) {
    return new EncryptionError('Invalid initialization vector', operation);
  } else if (error.message.includes('Authentication failed')) {
    return new EncryptionError('Encryption authentication failed', operation);
  } else {
    return new EncryptionError(`${operation} operation failed`, operation);
  }
}

/**
 * Log error with context
 * @param {Error} error - Error to log
 * @param {Object} context - Additional context
 */
export function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  };
  
  console.error('Error logged:', JSON.stringify(logEntry, null, 2));
}
