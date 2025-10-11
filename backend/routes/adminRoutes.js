/**
 * Admin Routes
 * 
 * Handles admin-specific endpoints:
 * - Application decryption
 * - Administrative functions
 * - Data access controls
 */

import express from 'express';
import adminController from '../controllers/adminController.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { authenticateAdmin, requireAdmin, adminRateLimit } from '../utils/auth.js';
import { validateApplicationId } from '../utils/validation.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);
router.use(requireAdmin);
router.use(adminRateLimit);

/**
 * GET /api/admin/decrypt/:id
 * Decrypt and retrieve a student's application data
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Query parameters:
 * - token: Admin token (alternative to Authorization header)
 */
router.get('/decrypt/:id', asyncHandler(async (req, res, next) => {
  // Validate application ID
  const idValidation = validateApplicationId(req.params.id);
  if (!idValidation.isValid) {
    return res.status(400).json({
      error: 'Invalid application ID',
      details: idValidation.errors
    });
  }
  
  await adminController.decryptApplication(req, res, next);
}));

/**
 * GET /api/admin/applications
 * Get all applications with decryption capability
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Query parameters:
 * - token: Admin token (alternative to Authorization header)
 */
router.get('/applications', asyncHandler(adminController.getAllApplicationsWithDecryption));

/**
 * GET /api/admin/analytics
 * Get application analytics for admin dashboard
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Query parameters:
 * - token: Admin token (alternative to Authorization header)
 */
router.get('/analytics', asyncHandler(adminController.getApplicationAnalytics));

/**
 * GET /api/admin/export
 * Export applications data (CSV format)
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Query parameters:
 * - token: Admin token (alternative to Authorization header)
 * - format: Export format (csv, json) - default: csv
 */
router.get('/export', asyncHandler(adminController.exportApplications));

/**
 * GET /api/admin/health
 * System health check for admin
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Query parameters:
 * - token: Admin token (alternative to Authorization header)
 */
router.get('/health', asyncHandler(adminController.getSystemHealth));

/**
 * POST /api/admin/decrypt-batch
 * Decrypt multiple applications at once
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Request body:
 * {
 *   applicationIds: string[]
 * }
 */
router.post('/decrypt-batch', asyncHandler(async (req, res, next) => {
  const { applicationIds } = req.body;
  
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    return res.status(400).json({
      error: 'Invalid application IDs',
      message: 'applicationIds must be a non-empty array'
    });
  }
  
  // Validate each application ID
  const invalidIds = applicationIds.filter(id => {
    const validation = validateApplicationId(id);
    return !validation.isValid;
  });
  
  if (invalidIds.length > 0) {
    return res.status(400).json({
      error: 'Invalid application IDs',
      details: invalidIds
    });
  }
  
  // Process batch decryption
  try {
    const results = await Promise.allSettled(
      applicationIds.map(async (id) => {
        const req = { params: { id } };
        const res = { status: () => ({ json: () => {} }) };
        return await adminController.decryptApplication(req, res, next);
      })
    );
    
    const successful = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failed = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason);
    
    res.status(200).json({
      success: true,
      results: {
        successful: successful.length,
        failed: failed.length,
        total: applicationIds.length
      },
      data: successful,
      errors: failed,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Batch decryption failed',
      message: error.message || 'Unknown error occurred'
    });
  }
}));

export default router;
