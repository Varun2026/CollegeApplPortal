/**
 * Validation Utilities
 * 
 * Provides validation functions for:
 * - Application data validation
 * - Input sanitization
 * - Data format checking
 */

/**
 * Validate application data structure
 * @param {Object} data - Application data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateApplicationData(data) {
  const errors = [];
  
  // Check required fields
  if (!data.encryptedData) {
    errors.push('Encrypted data is required');
  }
  
  if (!data.iv) {
    errors.push('Initialization vector (IV) is required');
  }

  // Validate encrypted data format
  if (data.encryptedData && typeof data.encryptedData !== 'string') {
    errors.push('Encrypted data must be a string');
  }

  // Validate IV format
  if (data.iv && typeof data.iv !== 'string') {
    errors.push('IV must be a string');
  }

  // Validate optional fields if provided
  if (data.name && (typeof data.name !== 'string' || data.name.trim().length < 2)) {
    errors.push('Name must be at least 2 characters long');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (data.course && (typeof data.course !== 'string' || data.course.trim().length < 2)) {
    errors.push('Course must be at least 2 characters long');
  }

  if (data.department && (typeof data.department !== 'string' || data.department.trim().length < 2)) {
    errors.push('Department must be at least 2 characters long');
  }

  if (data.gpa && !isValidGpa(data.gpa)) {
    errors.push('GPA must be between 0.0 and 4.0');
  }

  if (data.documentName && typeof data.documentName !== 'string') {
    errors.push('Document name must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone) {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Check if it has 10-15 digits (international format)
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate GPA value
 * @param {string|number} gpa - GPA to validate
 * @returns {boolean} True if valid GPA
 */
export function isValidGpa(gpa) {
  const gpaNum = parseFloat(gpa);
  return !isNaN(gpaNum) && gpaNum >= 0.0 && gpaNum <= 4.0;
}

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUuid(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate base64 string
 * @param {string} str - String to validate as base64
 * @returns {boolean} True if valid base64
 */
export function isValidBase64(str) {
  if (typeof str !== 'string') {
    return false;
  }
  
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}

/**
 * Validate application ID parameter
 * @param {string} id - Application ID to validate
 * @returns {Object} Validation result
 */
export function validateApplicationId(id) {
  const errors = [];
  
  if (!id) {
    errors.push('Application ID is required');
  } else if (!isValidUuid(id)) {
    errors.push('Invalid application ID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validation result
 */
export function validatePaginationParams(params) {
  const errors = [];
  const { page, limit } = params;
  
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate search parameters
 * @param {Object} params - Search parameters
 * @returns {Object} Validation result
 */
export function validateSearchParams(params) {
  const errors = [];
  const { query, department, course, minGpa, maxGpa } = params;
  
  if (query && typeof query !== 'string') {
    errors.push('Search query must be a string');
  }
  
  if (department && typeof department !== 'string') {
    errors.push('Department filter must be a string');
  }
  
  if (course && typeof course !== 'string') {
    errors.push('Course filter must be a string');
  }
  
  if (minGpa !== undefined && !isValidGpa(minGpa)) {
    errors.push('Minimum GPA must be between 0.0 and 4.0');
  }
  
  if (maxGpa !== undefined && !isValidGpa(maxGpa)) {
    errors.push('Maximum GPA must be between 0.0 and 4.0');
  }
  
  if (minGpa !== undefined && maxGpa !== undefined && parseFloat(minGpa) > parseFloat(maxGpa)) {
    errors.push('Minimum GPA cannot be greater than maximum GPA');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
