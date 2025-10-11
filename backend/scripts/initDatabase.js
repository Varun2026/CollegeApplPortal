/**
 * Database Initialization Script
 * 
 * This script initializes the Azure SQL Database schema
 * Run this script after setting up your Azure SQL Database
 */

import dotenv from 'dotenv';
import azureSqlService from '../services/azureSqlService.js';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  console.log('\n=== Database Initialization ===');
  console.log('Initializing Azure SQL Database schema...\n');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await azureSqlService.testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to Azure SQL Database');
      console.error('Please check your database configuration in .env file');
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');

    // Initialize database schema
    console.log('📋 Creating database schema...');
    await azureSqlService.initializeSchema();
    
    console.log('✅ Database schema initialized successfully');
    console.log('\n=== Initialization Complete ===');
    console.log('Your database is ready to use!');
    console.log('You can now start the application with: npm run dev:backend');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your Azure SQL Database configuration');
    console.error('2. Ensure your database server is running');
    console.error('3. Verify your connection credentials');
    console.error('4. Check firewall rules for your IP address');
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
