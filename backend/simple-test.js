import express from 'express';

console.log('Starting simple test...');

const app = express();
const port = 5000;

app.get('/test', (req, res) => {
  res.json({ message: 'Test successful!' });
});

app.listen(port, () => {
  console.log(`🚀 Simple test server running on port ${port}`);
});
