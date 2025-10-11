/**
 * Azure SQL Database Service
 * 
 * This service handles all interactions with Azure SQL Database for:
 * - Storing encrypted application data
 * - Retrieving application records
 * - Database connection management
 * - Query optimization and error handling
 */

import sql from 'mssql';

class AzureSqlService {
  constructor() {
    // Azure SQL configuration from environment variables
    this.config = {
      user: process.env.AZURE_SQL_USER || 'demo-user',
      password: process.env.AZURE_SQL_PASSWORD || 'demo-password',
      server: process.env.AZURE_SQL_SERVER || 'demo-server.database.windows.net',
      database: process.env.AZURE_SQL_DATABASE || 'demo-database',
      options: {
        encrypt: true, // Use SSL encryption
        trustServerCertificate: false, // Validate server certificate
        enableArithAbort: true,
        connectionTimeout: 30000, // 30 seconds
        requestTimeout: 30000, // 30 seconds
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        }
      }
    };
    
    // Check if we have real Azure SQL credentials
    this.isConfigured = this.config.user !== 'demo-user' && 
                       this.config.password !== 'demo-password' && 
                       this.config.server !== 'demo-server.database.windows.net';
    
    this.pool = null;
    
    if (!this.isConfigured) {
      console.warn('⚠️  Azure SQL Database not configured - using demo mode');
    }
  }

  /**
   * Get database connection pool
   * @returns {Promise<sql.ConnectionPool>} Database connection pool
   */
  async getConnection() {
    try {
      if (!this.pool) {
        this.pool = await sql.connect(this.config);
        console.log('✅ Connected to Azure SQL Database');
      }
      return this.pool;
    } catch (error) {
      console.error('❌ Failed to connect to Azure SQL Database:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Save a new application to the database
   * @param {Object} applicationData - Application data to save
   * @returns {Promise<string>} Generated application ID
   */
  async saveApplication(applicationData) {
    const pool = await this.getConnection();
    
    try {
      const request = pool.request();
      
      // Insert application with encrypted data
      const result = await request
        .input('name', sql.NVarChar(255), applicationData.name || '')
        .input('email', sql.NVarChar(255), applicationData.email || '')
        .input('phone', sql.NVarChar(50), applicationData.phone || '')
        .input('course', sql.NVarChar(255), applicationData.course || '')
        .input('department', sql.NVarChar(255), applicationData.department || '')
        .input('gpa', sql.Decimal(3, 2), applicationData.gpa || 0)
        .input('documentName', sql.NVarChar(255), applicationData.documentName || '')
        .input('encryptedData', sql.VarBinary('MAX'), applicationData.encryptedData)
        .input('iv', sql.NVarChar(255), applicationData.iv)
        .query(`
          INSERT INTO Applications (name, email, phone, course, department, gpa, document_name, encrypted_data, iv, created_at)
          OUTPUT INSERTED.id
          VALUES (@name, @email, @phone, @course, @department, @gpa, @documentName, @encryptedData, @iv, GETDATE())
        `);

      const applicationId = result.recordset[0].id;
      console.log(`📝 Application saved with ID: ${applicationId}`);
      return applicationId;
    } catch (error) {
      console.error('❌ Error saving application:', error);
      throw new Error('Failed to save application to database');
    }
  }

  /**
   * Retrieve all applications from the database
   * @returns {Promise<Array>} Array of application records
   */
  async getAllApplications() {
    const pool = await this.getConnection();
    
    try {
      const result = await pool.request().query(`
        SELECT 
          id,
          name,
          email,
          phone,
          course,
          department,
          gpa,
          document_name,
          encrypted_data,
          iv,
          created_at
        FROM Applications 
        ORDER BY created_at DESC
      `);

      console.log(`📊 Retrieved ${result.recordset.length} applications from database`);
      return result.recordset;
    } catch (error) {
      console.error('❌ Error retrieving applications:', error);
      throw new Error('Failed to retrieve applications from database');
    }
  }

  /**
   * Retrieve a specific application by ID
   * @param {string} applicationId - Application ID to retrieve
   * @returns {Promise<Object|null>} Application record or null if not found
   */
  async getApplicationById(applicationId) {
    const pool = await this.getConnection();
    
    try {
      const result = await pool.request()
        .input('id', sql.UniqueIdentifier, applicationId)
        .query(`
          SELECT 
            id,
            name,
            email,
            phone,
            course,
            department,
            gpa,
            document_name,
            encrypted_data,
            iv,
            created_at
          FROM Applications 
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      console.log(`🔍 Retrieved application: ${applicationId}`);
      return result.recordset[0];
    } catch (error) {
      console.error('❌ Error retrieving application:', error);
      throw new Error('Failed to retrieve application from database');
    }
  }

  /**
   * Update an application record
   * @param {string} applicationId - Application ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async updateApplication(applicationId, updateData) {
    const pool = await this.getConnection();
    
    try {
      const request = pool.request().input('id', sql.UniqueIdentifier, applicationId);
      
      // Build dynamic update query based on provided fields
      const updateFields = [];
      if (updateData.name !== undefined) {
        request.input('name', sql.NVarChar(255), updateData.name);
        updateFields.push('name = @name');
      }
      if (updateData.email !== undefined) {
        request.input('email', sql.NVarChar(255), updateData.email);
        updateFields.push('email = @email');
      }
      if (updateData.phone !== undefined) {
        request.input('phone', sql.NVarChar(50), updateData.phone);
        updateFields.push('phone = @phone');
      }
      if (updateData.course !== undefined) {
        request.input('course', sql.NVarChar(255), updateData.course);
        updateFields.push('course = @course');
      }
      if (updateData.department !== undefined) {
        request.input('department', sql.NVarChar(255), updateData.department);
        updateFields.push('department = @department');
      }
      if (updateData.gpa !== undefined) {
        request.input('gpa', sql.Decimal(3, 2), updateData.gpa);
        updateFields.push('gpa = @gpa');
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      const result = await request.query(`
        UPDATE Applications 
        SET ${updateFields.join(', ')}
        WHERE id = @id
      `);

      console.log(`✏️  Updated application: ${applicationId}`);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('❌ Error updating application:', error);
      throw new Error('Failed to update application in database');
    }
  }

  /**
   * Delete an application record
   * @param {string} applicationId - Application ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteApplication(applicationId) {
    const pool = await this.getConnection();
    
    try {
      const result = await pool.request()
        .input('id', sql.UniqueIdentifier, applicationId)
        .query('DELETE FROM Applications WHERE id = @id');

      console.log(`🗑️  Deleted application: ${applicationId}`);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      throw new Error('Failed to delete application from database');
    }
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const pool = await this.getConnection();
      await pool.request().query('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Initialize database schema (create tables if they don't exist)
   * @returns {Promise<void>}
   */
  async initializeSchema() {
    const pool = await this.getConnection();
    
    try {
      // Create Applications table if it doesn't exist
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Applications' AND xtype='U')
        CREATE TABLE Applications (
          id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
          name NVARCHAR(255),
          email NVARCHAR(255),
          phone NVARCHAR(50),
          course NVARCHAR(255),
          department NVARCHAR(255),
          gpa DECIMAL(3,2),
          document_name NVARCHAR(255),
          encrypted_data VARBINARY(MAX),
          iv NVARCHAR(255),
          created_at DATETIME2 DEFAULT GETDATE()
        )
      `);

      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database schema:', error);
      throw new Error('Failed to initialize database schema');
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async closeConnection() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.log('🔌 Database connection closed');
    }
  }
}

// Export singleton instance
export default new AzureSqlService();
