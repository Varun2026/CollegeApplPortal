/**
 * Admin Controller
 * 
 * Handles admin-specific operations:
 * - Application decryption
 * - Admin authentication
 * - Data access controls
 * - Administrative functions
 */

import azureSqlService from '../services/azureSqlService.js';
import azureKeyVaultService from '../services/azureKeyVaultService.js';
import { authenticateAdmin } from '../utils/auth.js';

class AdminController {
  /**
   * Decrypt and retrieve a student's application data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async decryptApplication(req, res) {
    try {
      const { id } = req.params;
      console.log(`\n=== Admin: Decrypting Application ${id} ===`);

      // Get application from database
      const application = await azureSqlService.getApplicationById(id);
      
      if (!application) {
        console.log('❌ Application not found');
        return res.status(404).json({
          error: 'Application not found',
          applicationId: id
        });
      }

      if (!application.encrypted_data) {
        console.log('❌ No encrypted data found');
        return res.status(400).json({
          error: 'No encrypted data found for this application'
        });
      }

      // Decrypt the data using Azure Key Vault
      const decryptedData = await azureKeyVaultService.decryptData(application.encrypted_data);
      const decryptedText = decryptedData.toString('utf-8');
      
      let decryptedApplicationData;
      try {
        decryptedApplicationData = JSON.parse(decryptedText);
      } catch (parseError) {
        console.error('❌ Error parsing decrypted data:', parseError);
        return res.status(500).json({
          error: 'Failed to parse decrypted application data'
        });
      }

      console.log('✅ Application decrypted successfully');
      console.log('Student:', decryptedApplicationData.name || 'Unknown');
      console.log('==========================================\n');

      res.status(200).json({
        success: true,
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
          phone: application.phone,
          course: application.course,
          department: application.department,
          gpa: application.gpa,
          documentName: application.document_name,
          createdAt: application.created_at,
          decryptedData: decryptedApplicationData
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error decrypting application:', error);
      res.status(500).json({
        error: 'Failed to decrypt application',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Get all applications with decryption capability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllApplicationsWithDecryption(req, res) {
    try {
      console.log('\n=== Admin: Fetching All Applications with Decryption ===');
      
      const applications = await azureSqlService.getAllApplications();
      
      // Process applications to include decrypted data
      const processedApplications = await Promise.all(
        applications.map(async (app) => {
          const baseApplication = {
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
          };

          // Attempt to decrypt if encrypted data exists
          if (app.encrypted_data) {
            try {
              const decryptedData = await azureKeyVaultService.decryptData(app.encrypted_data);
              const decryptedText = decryptedData.toString('utf-8');
              baseApplication.decryptedData = JSON.parse(decryptedText);
            } catch (decryptError) {
              console.warn(`⚠️  Could not decrypt application ${app.id}:`, decryptError.message);
              baseApplication.decryptionError = 'Failed to decrypt data';
            }
          }

          return baseApplication;
        })
      );

      console.log(`📊 Processed ${applications.length} applications`);
      console.log('================================================\n');

      res.status(200).json({
        success: true,
        applications: processedApplications,
        count: applications.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error fetching applications with decryption:', error);
      res.status(500).json({
        error: 'Failed to fetch applications',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Get application analytics for admin dashboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getApplicationAnalytics(req, res) {
    try {
      console.log('\n=== Admin: Generating Application Analytics ===');

      const applications = await azureSqlService.getAllApplications();
      
      // Calculate comprehensive analytics
      const analytics = {
        overview: {
          totalApplications: applications.length,
          recentApplications: 0,
          pendingReview: 0
        },
        demographics: {
          departments: {},
          courses: {},
          gpaDistribution: { excellent: 0, good: 0, average: 0, belowAverage: 0 },
          averageGpa: 0
        },
        trends: {
          dailySubmissions: {},
          weeklyTrend: [],
          monthlyGrowth: 0
        },
        quality: {
          highQualityApplications: 0,
          averageQualityApplications: 0,
          lowQualityApplications: 0
        }
      };

      let totalGpa = 0;
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      applications.forEach(app => {
        const appDate = new Date(app.created_at);
        const gpa = parseFloat(app.gpa) || 0;
        totalGpa += gpa;

        // Recent applications
        if (appDate > oneWeekAgo) {
          analytics.overview.recentApplications++;
        }

        // Department analysis
        const dept = app.department || 'Unknown';
        analytics.demographics.departments[dept] = (analytics.demographics.departments[dept] || 0) + 1;

        // Course analysis
        const course = app.course || 'Unknown';
        analytics.demographics.courses[course] = (analytics.demographics.courses[course] || 0) + 1;

        // GPA distribution
        if (gpa >= 3.7) analytics.demographics.gpaDistribution.excellent++;
        else if (gpa >= 3.3) analytics.demographics.gpaDistribution.good++;
        else if (gpa >= 2.7) analytics.demographics.gpaDistribution.average++;
        else analytics.demographics.gpaDistribution.belowAverage++;

        // Quality assessment (simplified)
        if (gpa >= 3.5) analytics.quality.highQualityApplications++;
        else if (gpa >= 3.0) analytics.quality.averageQualityApplications++;
        else analytics.quality.lowQualityApplications++;

        // Daily submissions
        const dateKey = appDate.toISOString().split('T')[0];
        analytics.trends.dailySubmissions[dateKey] = (analytics.trends.dailySubmissions[dateKey] || 0) + 1;
      });

      analytics.demographics.averageGpa = applications.length > 0 ? (totalGpa / applications.length).toFixed(2) : 0;

      // Calculate monthly growth
      const monthlyApplications = applications.filter(app => 
        new Date(app.created_at) > oneMonthAgo
      ).length;
      analytics.trends.monthlyGrowth = monthlyApplications;

      console.log('📊 Analytics generated successfully');
      console.log('====================================\n');

      res.status(200).json({
        success: true,
        analytics: analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error generating analytics:', error);
      res.status(500).json({
        error: 'Failed to generate analytics',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * Export applications data (CSV format)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async exportApplications(req, res) {
    try {
      console.log('\n=== Admin: Exporting Applications Data ===');

      const applications = await azureSqlService.getAllApplications();
      
      // Generate CSV content
      const csvHeader = 'ID,Name,Email,Phone,Course,Department,GPA,Document Name,Created At\n';
      const csvRows = applications.map(app => 
        `${app.id},"${app.name || ''}","${app.email || ''}","${app.phone || ''}","${app.course || ''}","${app.department || ''}",${app.gpa || 0},"${app.document_name || ''}","${app.created_at}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;

      console.log(`📄 Exported ${applications.length} applications to CSV`);
      console.log('==============================================\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="applications_${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csvContent);

    } catch (error) {
      console.error('❌ Error exporting applications:', error);
      res.status(500).json({
        error: 'Failed to export applications',
        message: error.message || 'Unknown error occurred'
      });
    }
  }

  /**
   * System health check for admin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSystemHealth(req, res) {
    try {
      console.log('\n=== Admin: System Health Check ===');

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          azureSql: false,
          azureKeyVault: false,
          genai: false
        },
        database: {
          connection: false,
          applicationsCount: 0
        },
        keyVault: {
          connection: false,
          keyAccess: false
        }
      };

      // Test Azure SQL connection
      try {
        health.services.azureSql = await azureSqlService.testConnection();
        health.database.connection = health.services.azureSql;
        
        if (health.services.azureSql) {
          const applications = await azureSqlService.getAllApplications();
          health.database.applicationsCount = applications.length;
        }
      } catch (error) {
        console.error('❌ Azure SQL health check failed:', error);
      }

      // Test Azure Key Vault connection
      try {
        health.services.azureKeyVault = await azureKeyVaultService.testConnection();
        health.keyVault.connection = health.services.azureKeyVault;
        health.keyVault.keyAccess = health.services.azureKeyVault;
      } catch (error) {
        console.error('❌ Azure Key Vault health check failed:', error);
      }

      // Test GenAI service (if configured)
      try {
        const { default: genaiService } = await import('../services/genaiService.js');
        health.services.genai = await genaiService.testConnection();
      } catch (error) {
        console.warn('⚠️  GenAI service not available:', error.message);
      }

      // Overall status
      const allServicesHealthy = Object.values(health.services).every(status => status === true);
      health.status = allServicesHealthy ? 'healthy' : 'degraded';

      console.log('🏥 System health check completed');
      console.log('================================\n');

      res.status(200).json(health);

    } catch (error) {
      console.error('❌ Error checking system health:', error);
      res.status(500).json({
        error: 'Failed to check system health',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
}

export default new AdminController();
