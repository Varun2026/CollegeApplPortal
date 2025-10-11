/**
 * Authentication Utilities
 * 
 * Provides authentication functions for:
 * - Admin token validation
 * - Simple token-based authentication
 * - Security middleware
 */

/**
 * Simple admin token authentication
 * @param {string} token - Token to validate
 * @returns {boolean} True if token is valid
 */
export function validateAdminToken(token) {
  if (!token) {
    return false;
  }
  
  // Get admin token from environment variables
  const validToken = process.env.ADMIN_TOKEN || 'admin-demo-token-2024';
  
  return token === validToken;
}

/**
 * Middleware to authenticate admin requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function authenticateAdmin(req, res, next) {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token;
    
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid admin token'
      });
    }
    
    if (!validateAdminToken(token)) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'The provided token is not valid'
      });
    }
    
    // Add admin flag to request object
    req.isAdmin = true;
    next();
    
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
}

/**
 * Generate a simple admin token (for demo purposes)
 * @returns {string} Generated token
 */
export function generateAdminToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `admin-${timestamp}-${random}`;
}

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This endpoint requires admin privileges'
    });
  }
  next();
}

/**
 * Rate limiting for admin endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function adminRateLimit(req, res, next) {
  // Simple in-memory rate limiting (for demo)
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Initialize rate limit store if not exists
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const key = `admin_${clientIp}`;
  const requests = global.rateLimitStore.get(key) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = requests.filter(time => now - time < 60000);
  
  // Check if rate limit exceeded (10 requests per minute)
  if (recentRequests.length >= 10) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many admin requests. Please try again later.'
    });
  }
  
  // Add current request
  recentRequests.push(now);
  global.rateLimitStore.set(key, recentRequests);
  
  next();
}

/**
 * Validate API key for external integrations
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid API key
 */
export function validateApiKey(apiKey) {
  if (!apiKey) {
    return false;
  }
  
  const validApiKey = process.env.API_KEY || 'demo-api-key-2024';
  return apiKey === validApiKey;
}

/**
 * Middleware for API key authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide a valid API key'
      });
    }
    
    if (!validateApiKey(apiKey)) {
      return res.status(403).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('❌ API key authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during API key validation'
    });
  }
}

/**
 * Security headers middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function securityHeaders(req, res, next) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

/**
 * Log authentication attempts
 * @param {Object} req - Express request object
 * @param {boolean} success - Whether authentication was successful
 * @param {string} reason - Reason for failure (if applicable)
 */
export function logAuthAttempt(req, success, reason = null) {
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    timestamp,
    clientIp,
    userAgent,
    success,
    reason,
    endpoint: req.path,
    method: req.method
  };
  
  if (success) {
    console.log(`✅ Authentication successful: ${JSON.stringify(logEntry)}`);
  } else {
    console.warn(`❌ Authentication failed: ${JSON.stringify(logEntry)}`);
  }
}
