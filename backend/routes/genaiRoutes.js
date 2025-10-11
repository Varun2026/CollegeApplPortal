/**
 * GenAI Routes
 * 
 * Handles GenAI-related endpoints:
 * - Application analysis
 * - Document summarization
 * - AI-powered insights
 */

import express from 'express';
import genaiController from '../controllers/genaiController.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { authenticateAdmin, requireAdmin } from '../utils/auth.js';

const router = express.Router();

/**
 * POST /api/genai/analyze
 * Analyze application quality using GenAI
 * 
 * Request body:
 * {
 *   applicationData: {
 *     name: string,
 *     email: string,
 *     course: string,
 *     department: string,
 *     gpa: string
 *   }
 * }
 */
router.post('/analyze', asyncHandler(genaiController.analyzeApplication));

/**
 * POST /api/genai/summarize
 * Summarize document content using GenAI
 * 
 * Request body:
 * {
 *   pdfText: string,
 *   documentType?: string
 * }
 */
router.post('/summarize', asyncHandler(genaiController.summarizeDocument));

/**
 * POST /api/genai/insights
 * Generate insights from application data
 * 
 * Request body:
 * {
 *   applications: Array<ApplicationData>
 * }
 */
router.post('/insights', asyncHandler(genaiController.generateInsights));

/**
 * POST /api/genai/score
 * Score application quality (legacy endpoint)
 * 
 * Request body:
 * {
 *   gpa: string,
 *   course: string,
 *   department: string
 * }
 */
router.post('/score', asyncHandler(genaiController.scoreApplication));

/**
 * GET /api/genai/health
 * Check GenAI service health
 */
router.get('/health', asyncHandler(genaiController.getServiceHealth));

/**
 * POST /api/genai/batch-analyze
 * Analyze multiple applications in batch
 * 
 * Request body:
 * {
 *   applications: Array<{
 *     id: string,
 *     data: ApplicationData
 *   }>
 * }
 */
router.post('/batch-analyze', asyncHandler(genaiController.batchAnalyzeApplications));

export default router;
