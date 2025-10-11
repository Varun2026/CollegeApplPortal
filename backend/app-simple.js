/**
 * College Application Encryption System - Simple Version
 * This version starts without the complex imports to test basic functionality
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

console.log('🚀 Starting College Application Encryption System...');

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Basic application endpoint
app.post('/api/applications', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Application endpoint ready - Azure services not configured yet',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(port, '127.0.0.1', () => {
  console.log(`🚀 College Application Encryption System running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`⚠️  Azure services not configured - using demo mode`);
  console.log(`🔧 To configure Azure services, update your .env file`);
});
