/**
 * Application Routes
 * 
 * Handles all application-related endpoints:
 * - Student application submission
 * - Application retrieval
 * - Application management
 */

import express from 'express';
import applicationController from '../controllers/applicationController.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { validateApplicationId, validatePaginationParams } from '../utils/validation.js';

const router = express.Router();

/**
 * POST /api/applications
 * Submit a new encrypted college application
 * 
 * Request body:
 * {
 *   encryptedData: string (base64 encoded encrypted data),
 *   iv: string (base64 encoded initialization vector),
 *   name?: string,
 *   email?: string,
 *   phone?: string,
 *   course?: string,
 *   department?: string,
 *   gpa?: string,
 *   documentName?: string
 * }
 */
router.post('/', asyncHandler(applicationController.submitApplication));

/**
 * GET /api/applications
 * Retrieve all applications (for admin dashboard)
 * 
 * Query parameters:
 * - page: Page number (optional)
 * - limit: Items per page (optional, max 100)
 * - department: Filter by department (optional)
 * - course: Filter by course (optional)
 * - minGpa: Minimum GPA filter (optional)
 * - maxGpa: Maximum GPA filter (optional)
 */
router.get('/', asyncHandler(async (req, res, next) => {
  // Validate pagination parameters
  const paginationValidation = validatePaginationParams(req.query);
  if (!paginationValidation.isValid) {
    return res.status(400).json({
      error: 'Invalid pagination parameters',
      details: paginationValidation.errors
    });
  }
  
  await applicationController.getAllApplications(req, res, next);
}));

/**
 * GET /api/applications/stats
 * Get application statistics
 */
router.get('/stats', asyncHandler(applicationController.getApplicationStats));

/**
 * GET /api/applications/:id
 * Retrieve a specific application by ID
 */
router.get('/:id', asyncHandler(async (req, res, next) => {
  // Validate application ID
  const idValidation = validateApplicationId(req.params.id);
  if (!idValidation.isValid) {
    return res.status(400).json({
      error: 'Invalid application ID',
      details: idValidation.errors
    });
  }
  
  await applicationController.getApplicationById(req, res, next);
}));

/**
 * PUT /api/applications/:id
 * Update an application
 * 
 * Request body:
 * {
 *   name?: string,
 *   email?: string,
 *   phone?: string,
 *   course?: string,
 *   department?: string,
 *   gpa?: string,
 *   documentName?: string
 * }
 */
router.put('/:id', asyncHandler(async (req, res, next) => {
  // Validate application ID
  const idValidation = validateApplicationId(req.params.id);
  if (!idValidation.isValid) {
    return res.status(400).json({
      error: 'Invalid application ID',
      details: idValidation.errors
    });
  }
  
  await applicationController.updateApplication(req, res, next);
}));

/**
 * DELETE /api/applications/:id
 * Delete an application
 */
router.delete('/:id', asyncHandler(async (req, res, next) => {
  // Validate application ID
  const idValidation = validateApplicationId(req.params.id);
  if (!idValidation.isValid) {
    return res.status(400).json({
      error: 'Invalid application ID',
      details: idValidation.errors
    });
  }
  
  await applicationController.deleteApplication(req, res, next);
}));

export default router;
