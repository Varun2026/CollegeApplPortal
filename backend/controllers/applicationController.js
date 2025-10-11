/**
 * Application Controller
 * 
 * Handles all application-related operations:
 * - Student application submission
 * - Application retrieval
 * - Data validation and processing
 */

import azureSqlService from '../services/azureSqlService.js';
import azureKeyVaultService from '../services/azureKeyVaultService.js';
import { validateApplicationData } from '../utils/validation.js';

class ApplicationController {
  /**
   * Submit a new application
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async submitApplication(req, res) {
    try {
      console.log('\n=== New Application Submission ===');
      console.log('Timestamp:', new Date().toISOString());

      // Validate request data
      const validationResult = validateApplicationData(req.body);
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.errors
        });
      }

      const { encryptedData, iv, name, email, phone, course, department, gpa, documentName } = req.body;

      // Log submission details (without sensitive data)
      console.log('Application details:');
      console.log('- Name:', name || 'Not provided');
      console.log('- Email:', email || 'Not provided');
      console.log('- Course:', course || 'Not provided');
      console.log('- Department:', department || 'Not provided');
      console.log('- GPA:', gpa || 'Not provided');
      console.log('- Encrypted data length:', encryptedData?.length || 0);
      console.log('- IV length:', iv?.length || 0);

      // Prepare application data for storage
      const applicationData = {
        name: name || '',
        email: email || '',
        phone: phone || '',
        course: course || '',
        department: department || '',
        gpa: parseFloat(gpa) || 0,
        documentName: documentName || '',
        encryptedData: Buffer.from(encryptedData, 'base64'),
        iv: iv
      };

      // Save to Azure SQL Database
      const applicationId = await azureSqlService.saveApplication(applicationData);
      
      console.log('✅ Application stored successfully');
      console.log('Application ID:', applicationId);
      console.log('=================================\n');

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        applicationId: applicationId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error processing application:', error);
      res.status(500).json({
        error: 'Failed to process application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Get all applications (for admin dashboard)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllApplications(req, res) {
    try {
      console.log('\n=== Admin: Fetching All Applications ===');
      
      const applications = await azureSqlService.getAllApplications();
      
      // Remove sensitive encrypted data from response for security
      const safeApplications = applications.map(app => ({
        id: app.id,
        name: app.name,
        email: app.email,
        phone: app.phone,
        course: app.course,
        department: app.department,
        gpa: app.gpa,
        documentName: app.document_name,
        createdAt: app.created_at,
        hasEncryptedData: !!app.encrypted_data
      }));

      console.log(`📊 Found ${applications.length} applications`);
      console.log('========================================\n');

      res.status(200).json({
        success: true,
        applications: safeApplications,
        count: applications.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      res.status(500).json({
        error: 'Failed to fetch applications',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Get a specific application by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      console.log(`\n=== Fetching Application ${id} ===`);

      const application = await azureSqlService.getApplicationById(id);
      
      if (!application) {
        console.log('❌ Application not found');
        return res.status(404).json({
          error: 'Application not found',
          applicationId: id
        });
      }

      // Remove sensitive encrypted data from response
      const safeApplication = {
        id: application.id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        course: application.course,
        department: application.department,
        gpa: application.gpa,
        documentName: application.document_name,
        createdAt: application.created_at,
        hasEncryptedData: !!application.encrypted_data
      };

      console.log('✅ Application found');
      console.log('===================================\n');

      res.status(200).json({
        success: true,
        application: safeApplication,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error fetching application:', error);
      res.status(500).json({
        error: 'Failed to fetch application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Update an application
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log(`\n=== Updating Application ${id} ===`);

      // Validate update data
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: 'No update data provided'
        });
      }

      const success = await azureSqlService.updateApplication(id, updateData);
      
      if (!success) {
        return res.status(404).json({
          error: 'Application not found or no changes made',
          applicationId: id
        });
      }

      console.log('✅ Application updated successfully');
      console.log('====================================\n');

      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        applicationId: id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error updating application:', error);
      res.status(500).json({
        error: 'Failed to update application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Delete an application
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      console.log(`\n=== Deleting Application ${id} ===`);

      const success = await azureSqlService.deleteApplication(id);
      
      if (!success) {
        return res.status(404).json({
          error: 'Application not found',
          applicationId: id
        });
      }

      console.log('✅ Application deleted successfully');
      console.log('====================================\n');

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
        applicationId: id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error deleting application:', error);
      res.status(500).json({
        error: 'Failed to delete application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Get application statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getApplicationStats(req, res) {
    try {
      console.log('\n=== Generating Application Statistics ===');

      const applications = await azureSqlService.getAllApplications();
      
      // Calculate statistics
      const stats = {
        totalApplications: applications.length,
        departments: {},
        gpaDistribution: { high: 0, medium: 0, low: 0 },
        averageGpa: 0,
        recentApplications: 0
      };

      let totalGpa = 0;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      applications.forEach(app => {
        // Department analysis
        const dept = app.department || 'Unknown';
        stats.departments[dept] = (stats.departments[dept] || 0) + 1;

        // GPA analysis
        const gpa = parseFloat(app.gpa) || 0;
        totalGpa += gpa;
        
        if (gpa >= 3.5) stats.gpaDistribution.high++;
        else if (gpa >= 3.0) stats.gpaDistribution.medium++;
        else stats.gpaDistribution.low++;

        // Recent applications
        if (new Date(app.created_at) > oneWeekAgo) {
          stats.recentApplications++;
        }
      });

      stats.averageGpa = applications.length > 0 ? (totalGpa / applications.length).toFixed(2) : 0;

      console.log('📊 Statistics generated successfully');
      console.log('=====================================\n');

      res.status(200).json({
        success: true,
        statistics: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error generating statistics:', error);
      res.status(500).json({
        error: 'Failed to generate statistics',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
}

export default new ApplicationController();
