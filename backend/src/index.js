const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BOLT SME Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/posts', (req, res) => {
  res.json({ 
    message: 'Posts endpoint - ready for implementation',
    data: []
  });
});

app.post('/api/posts', (req, res) => {
  res.json({ 
    message: 'Create post endpoint - ready for implementation',
    data: req.body
  });
});

app.get('/api/messages', (req, res) => {
  res.json({ 
    message: 'Messages endpoint - ready for implementation',
    data: []
  });
});

app.get('/api/social-accounts', (req, res) => {
  res.json({ 
    message: 'Social accounts endpoint - ready for implementation',
    data: []
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
