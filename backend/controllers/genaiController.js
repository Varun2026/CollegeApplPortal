/**
 * GenAI Controller
 * 
 * Handles GenAI-related operations:
 * - Application analysis and scoring
 * - Document summarization
 * - Data insights generation
 * - AI-powered features
 */

import genaiService from '../services/genaiService.js';

class GenAIController {
  /**
   * Analyze application quality using GenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeApplication(req, res) {
    try {
      console.log('\n=== GenAI: Analyzing Application ===');
      
      const { applicationData } = req.body;
      
      if (!applicationData) {
        return res.status(400).json({
          error: 'Application data is required',
          message: 'Please provide application data for analysis'
        });
      }
      
      // Validate required fields
      const { name, email, course, department, gpa } = applicationData;
      if (!name || !email || !course || !department || !gpa) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, email, course, department, and GPA are required'
        });
      }
      
      console.log('Analyzing application for:', name);
      console.log('Course:', course, 'Department:', department, 'GPA:', gpa);
      
      // Perform GenAI analysis
      const analysis = await genaiService.analyzeApplication(applicationData);
      
      console.log('✅ Analysis completed');
      console.log('Score:', analysis.score);
      console.log('=====================================\n');
      
      res.status(200).json({
        success: true,
        analysis: analysis,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error analyzing application:', error);
      res.status(500).json({
        error: 'Failed to analyze application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Summarize document content using GenAI
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async summarizeDocument(req, res) {
    try {
      console.log('\n=== GenAI: Summarizing Document ===');
      
      const { pdfText, documentType = 'application' } = req.body;
      
      if (!pdfText) {
        return res.status(400).json({
          error: 'PDF text is required',
          message: 'Please provide PDF text content for summarization'
        });
      }
      
      console.log('Document type:', documentType);
      console.log('Text length:', pdfText.length);
      
      // Perform document summarization
      const summary = await genaiService.summarizeDocument(pdfText);
      
      console.log('✅ Document summarized');
      console.log('Summary length:', summary.length);
      console.log('=====================================\n');
      
      res.status(200).json({
        success: true,
        summary: summary,
        documentType: documentType,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error summarizing document:', error);
      res.status(500).json({
        error: 'Failed to summarize document',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Generate insights from application data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateInsights(req, res) {
    try {
      console.log('\n=== GenAI: Generating Insights ===');
      
      const { applications } = req.body;
      
      if (!Array.isArray(applications)) {
        return res.status(400).json({
          error: 'Applications array is required',
          message: 'Please provide an array of applications for analysis'
        });
      }
      
      if (applications.length === 0) {
        return res.status(400).json({
          error: 'No applications provided',
          message: 'Please provide at least one application for analysis'
        });
      }
      
      console.log('Analyzing', applications.length, 'applications');
      
      // Generate insights
      const insights = await genaiService.generateInsights(applications);
      
      console.log('✅ Insights generated');
      console.log('=====================================\n');
      
      res.status(200).json({
        success: true,
        insights: insights,
        applicationCount: applications.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      res.status(500).json({
        error: 'Failed to generate insights',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Score application quality (legacy endpoint)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async scoreApplication(req, res) {
    try {
      console.log('\n=== GenAI: Scoring Application ===');
      
      const { gpa, course, department } = req.body;
      
      if (!gpa || !course || !department) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'GPA, course, and department are required'
        });
      }
      
      console.log('Scoring application:');
      console.log('Course:', course, 'Department:', department, 'GPA:', gpa);
      
      // Score application
      const scoreResult = await genaiService.scoreApplicationQuality({ gpa, course, department });
      
      console.log('✅ Application scored');
      console.log('Score:', scoreResult.score);
      console.log('=====================================\n');
      
      res.status(200).json({
        success: true,
        scoreFeedback: scoreResult,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error scoring application:', error);
      res.status(500).json({
        error: 'Failed to score application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Check GenAI service health
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getServiceHealth(req, res) {
    try {
      console.log('\n=== GenAI: Health Check ===');
      
      const isHealthy = await genaiService.testConnection();
      
      const health = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'GenAI Service',
        timestamp: new Date().toISOString(),
        features: {
          analysis: isHealthy,
          summarization: isHealthy,
          insights: isHealthy,
          scoring: isHealthy
        }
      };
      
      console.log('GenAI service status:', health.status);
      console.log('=====================================\n');
      
      res.status(isHealthy ? 200 : 503).json(health);
      
    } catch (error) {
      console.error('❌ Error checking GenAI health:', error);
      res.status(500).json({
        error: 'Failed to check GenAI service health',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Analyze multiple applications in batch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async batchAnalyzeApplications(req, res) {
    try {
      console.log('\n=== GenAI: Batch Analysis ===');
      
      const { applications } = req.body;
      
      if (!Array.isArray(applications)) {
        return res.status(400).json({
          error: 'Applications array is required',
          message: 'Please provide an array of applications for batch analysis'
        });
      }
      
      if (applications.length === 0) {
        return res.status(400).json({
          error: 'No applications provided',
          message: 'Please provide at least one application for analysis'
        });
      }
      
      console.log('Batch analyzing', applications.length, 'applications');
      
      // Process applications in parallel
      const results = await Promise.allSettled(
        applications.map(async (app) => {
          const analysis = await genaiService.analyzeApplication(app.data);
          return {
            id: app.id,
            analysis: analysis
          };
        })
      );
      
      // Separate successful and failed analyses
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => ({
          id: result.reason.id || 'unknown',
          error: result.reason.message || 'Analysis failed'
        }));
      
      console.log('✅ Batch analysis completed');
      console.log('Successful:', successful.length);
      console.log('Failed:', failed.length);
      console.log('=====================================\n');
      
      res.status(200).json({
        success: true,
        results: {
          successful: successful.length,
          failed: failed.length,
          total: applications.length
        },
        analyses: successful,
        errors: failed,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error in batch analysis:', error);
      res.status(500).json({
        error: 'Failed to perform batch analysis',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
}

export default new GenAIController();
