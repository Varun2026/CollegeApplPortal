import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

console.log('Loading environment variables...');
dotenv.config();

console.log('Creating Express app...');
const app = express();

console.log('Setting up middleware...');
app.use(helmet());
app.use(cors());
app.use(express.json());

console.log('Setting up routes...');
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'College Application Encryption System'
  });
});

const port = process.env.PORT || 5000;

console.log('Starting server...');
app.listen(port, '127.0.0.1', () => {
  console.log(`🚀 Server running on port ${port}`);
});
