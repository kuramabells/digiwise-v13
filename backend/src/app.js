const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import routes
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const questionRoutes = require('./routes/questions');
const quizRoutes = require('./routes/quizzes');
const resultRoutes = require('./routes/results');
const feedbackRoutes = require('./routes/feedback');
const answerRoutes = require('./routes/answer');
const assessmentRoutes = require('./routes/assessment');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Function to create a new Express app
const createApp = () => {
  const app = express();

  // Log environment variables for debugging
  console.log('Environment Variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '*** (set)' : 'NOT SET');
  console.log('- DB_HOST:', process.env.DB_HOST);

  // Debug: Log the type of app to verify it's an Express app
  console.log('App type:', typeof app);
  console.log('Has listen method:', typeof app.listen === 'function');
  
  return app;
};

// Create the app
const app = createApp();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

// Security middleware - should come first
app.use(helmet());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// CORS configuration - PERMISSIVE for development
// This must come before any route handlers
app.use((req, res, next) => {
  // Allow any origin in development
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request for:', req.url);
    return res.status(200).end();
  }
  
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/auth', authRoutes);

// Response logging middleware
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function(data) {
    console.log(`\n=== Outgoing Response ===`);
    console.log(`Status: ${res.statusCode}`);
    console.log('Body:', data);
    oldSend.apply(res, arguments);
  };
  next();
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.log(`\n❌ Route Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Export the createApp function instead of the app instance
module.exports = createApp; 