/**
 * College Application Encryption System - Main Application
 * 
 * This is the main entry point for the backend server that handles:
 * - Student application submissions with end-to-end encryption
 * - Azure Key Vault integration for secure key management
 * - Azure SQL Database for persistent storage
 * - Admin functionality for decryption and data access
 * - GenAI integration for application analysis
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Import route handlers
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import genaiRoutes from './routes/genaiRoutes.js';

// Import middleware
import { errorHandler } from './utils/errorHandler.js';
import { requestLogger } from './utils/requestLogger.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware with increased limits for encrypted data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'College Application Encryption System',
    version: '2.0.0',
    features: [
      'Azure Key Vault Integration',
      'Azure SQL Database',
      'End-to-End Encryption',
      'GenAI Analysis',
      'Admin Dashboard'
    ]
  });
});

// API Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/genai', genaiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 College Application Encryption System running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔐 Azure Key Vault: ${process.env.AZURE_KEY_VAULT_NAME || 'Not configured'}`);
  console.log(`🗄️  Azure SQL: ${process.env.AZURE_SQL_SERVER || 'Not configured'}`);
});

export default app;
