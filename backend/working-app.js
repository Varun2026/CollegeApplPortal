/**
 * College Application Encryption System - Working Version
 * This version starts without complex imports to ensure it works
 */

console.log('🚀 Starting College Application Encryption System...');

// Import modules one by one to identify any issues
let express, cors, helmet, dotenv, createServer;

try {
  console.log('📦 Loading Express...');
  const expressModule = await import('express');
  express = expressModule.default;
  console.log('✅ Express loaded');
} catch (error) {
  console.error('❌ Failed to load Express:', error.message);
  process.exit(1);
}

try {
  console.log('📦 Loading CORS...');
  const corsModule = await import('cors');
  cors = corsModule.default;
  console.log('✅ CORS loaded');
} catch (error) {
  console.error('❌ Failed to load CORS:', error.message);
  process.exit(1);
}

try {
  console.log('📦 Loading Helmet...');
  const helmetModule = await import('helmet');
  helmet = helmetModule.default;
  console.log('✅ Helmet loaded');
} catch (error) {
  console.error('❌ Failed to load Helmet:', error.message);
  process.exit(1);
}

try {
  console.log('📦 Loading dotenv...');
  const dotenvModule = await import('dotenv');
  dotenv = dotenvModule.default;
  console.log('✅ dotenv loaded');
} catch (error) {
  console.error('❌ Failed to load dotenv:', error.message);
  process.exit(1);
}

try {
  console.log('📦 Loading HTTP...');
  const httpModule = await import('http');
  createServer = httpModule.createServer;
  console.log('✅ HTTP loaded');
} catch (error) {
  console.error('❌ Failed to load HTTP:', error.message);
  process.exit(1);
}

// Load environment variables
console.log('🔧 Loading environment variables...');
dotenv.config();

// Create Express app
console.log('🏗️  Creating Express app...');
const app = express();
const port = process.env.PORT || 5000;

// Security middleware
console.log('🔒 Setting up security middleware...');
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
console.log('📝 Setting up body parsing...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
console.log('🏥 Setting up health check...');
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
console.log('📋 Setting up application endpoint...');
app.post('/api/applications', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Application endpoint ready - Azure services not configured yet',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
console.log('🌐 Creating HTTP server...');
const server = createServer(app);

// Start server
console.log('🚀 Starting server...');
server.listen(port, '127.0.0.1', () => {
  console.log(`✅ College Application Encryption System running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`⚠️  Azure services not configured - using demo mode`);
  console.log(`🔧 To configure Azure services, update your .env file`);
  console.log(`🎯 Ready to accept requests!`);
});
