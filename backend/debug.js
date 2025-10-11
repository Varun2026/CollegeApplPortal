console.log('=== DEBUG TEST ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

try {
  console.log('Testing Express import...');
  const express = await import('express');
  console.log('✅ Express imported successfully');
  
  console.log('Testing CORS import...');
  const cors = await import('cors');
  console.log('✅ CORS imported successfully');
  
  console.log('Testing Helmet import...');
  const helmet = await import('helmet');
  console.log('✅ Helmet imported successfully');
  
  console.log('Testing dotenv import...');
  const dotenv = await import('dotenv');
  console.log('✅ dotenv imported successfully');
  
  console.log('All imports successful!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
}
