/**
 * Request Logger Utilities
 * 
 * Provides request logging functionality for:
 * - API request/response logging
 * - Performance monitoring
 * - Security auditing
 * - Debug information
 */

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log request start
  console.log(`\n🚀 [${requestId}] ${req.method} ${req.path}`);
  console.log(`📊 [${requestId}] IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`🌐 [${requestId}] User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);
  
  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = sanitizeRequestBody(req.body);
    if (Object.keys(sanitizedBody).length > 0) {
      console.log(`📝 [${requestId}] Request Body:`, JSON.stringify(sanitizedBody, null, 2));
    }
  }
  
  // Capture response data
  let responseBody = null;
  const originalJson = res.json;
  res.json = function(body) {
    responseBody = body;
    return originalJson.call(this, body);
  };
  
  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusEmoji = getStatusEmoji(statusCode);
    
    console.log(`${statusEmoji} [${requestId}] ${req.method} ${req.path} ${statusCode} (${duration}ms)`);
    
    // Log response body for debugging (excluding sensitive data)
    if (responseBody && process.env.NODE_ENV === 'development') {
      const sanitizedResponse = sanitizeResponseBody(responseBody);
      if (Object.keys(sanitizedResponse).length > 0) {
        console.log(`📤 [${requestId}] Response:`, JSON.stringify(sanitizedResponse, null, 2));
      }
    }
    
    // Log performance warnings
    if (duration > 5000) {
      console.warn(`⚠️  [${requestId}] Slow request detected: ${duration}ms`);
    }
    
    // Log error responses
    if (statusCode >= 400) {
      console.error(`❌ [${requestId}] Error response: ${statusCode}`);
    }
    
    console.log(`✅ [${requestId}] Request completed\n`);
  });
  
  next();
}

/**
 * Generate unique request ID
 * @returns {string} Unique request identifier
 */
function generateRequestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Get emoji for HTTP status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Emoji representation
 */
function getStatusEmoji(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '✅';
  if (statusCode >= 300 && statusCode < 400) return '🔄';
  if (statusCode >= 400 && statusCode < 500) return '❌';
  if (statusCode >= 500) return '💥';
  return '❓';
}

/**
 * Sanitize request body to remove sensitive data
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'encryptedData',
    'iv',
    'encrypted_data'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Truncate long strings
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
      sanitized[key] = sanitized[key].substring(0, 100) + '...';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize response body to remove sensitive data
 * @param {Object} body - Response body
 * @returns {Object} Sanitized body
 */
function sanitizeResponseBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'encryptedData',
    'iv',
    'encrypted_data',
    'decryptedData'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} req - Express request object
 * @param {Object} details - Additional details
 */
export function logSecurityEvent(event, req, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || 'Unknown',
    path: req.path,
    method: req.method,
    details
  };
  
  console.warn(`🔒 Security Event: ${JSON.stringify(logEntry, null, 2)}`);
}

/**
 * Log performance metrics
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export function logPerformanceMetrics(operation, duration, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    duration,
    metadata
  };
  
  if (duration > 1000) {
    console.warn(`⏱️  Slow operation: ${JSON.stringify(logEntry, null, 2)}`);
  } else {
    console.log(`📊 Performance: ${JSON.stringify(logEntry, null, 2)}`);
  }
}

/**
 * Log database operations
 * @param {string} operation - Database operation
 * @param {string} table - Table name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export function logDatabaseOperation(operation, table, duration, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'database',
    operation,
    table,
    duration,
    metadata
  };
  
  console.log(`🗄️  Database: ${JSON.stringify(logEntry, null, 2)}`);
}

/**
 * Log Azure service operations
 * @param {string} service - Azure service name
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export function logAzureOperation(service, operation, duration, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'azure',
    service,
    operation,
    duration,
    metadata
  };
  
  console.log(`☁️  Azure: ${JSON.stringify(logEntry, null, 2)}`);
}

/**
 * Log encryption operations
 * @param {string} operation - Encryption operation
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export function logEncryptionOperation(operation, duration, metadata = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'encryption',
    operation,
    duration,
    metadata
  };
  
  console.log(`🔐 Encryption: ${JSON.stringify(logEntry, null, 2)}`);
}
