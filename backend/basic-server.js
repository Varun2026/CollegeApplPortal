// Simple Express server that will definitely work
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🚀 Starting College Application Encryption System...');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'College Application Encryption System',
    version: '2.0.0',
    message: 'Server is running successfully!'
  });
});

// Application endpoint
app.post('/api/applications', (req, res) => {
  console.log('📝 Application submitted');
  res.json({
    success: true,
    message: 'Application received successfully',
    timestamp: new Date().toISOString()
  });
});

// Admin endpoint
app.get('/api/admin/health', (req, res) => {
  console.log('👨‍💼 Admin health check requested');
  res.json({
    status: 'healthy',
    admin: true,
    message: 'Admin panel is accessible'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`👨‍💼 Admin: http://localhost:${port}/api/admin/health`);
  console.log(`🎯 Ready to accept requests!`);
});
