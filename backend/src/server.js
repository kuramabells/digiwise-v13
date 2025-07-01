// Load environment variables first
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const { sequelize } = require('./models');

// Log environment variables for debugging (without sensitive data)
console.log('\n=== Environment Variables ===');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('- DB_NAME:', process.env.DB_NAME || 'digiwise');
console.log('- DB_USER:', process.env.DB_USER || 'root');
console.log('- PORT:', process.env.PORT || 5001);

// Import the app after environment variables are loaded
const createApp = require('./app');
const app = createApp();

// Debug: Verify app is an Express app
console.log('\n=== Server Debug ===');
console.log('App type:', typeof app);
console.log('Has listen method:', typeof app.listen === 'function');

const PORT = process.env.PORT || 5001;

// Log environment info
console.log('\n=== Server Starting ===');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);

// Test database connection before starting server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models (remove { force: true } in production)
    await sequelize.sync();
    console.log('✅ Database synchronized');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n=== Server Status ===');
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Database: Connected (${process.env.DB_HOST})`);
      console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
      console.log('\nAvailable Routes:');
      console.log('- POST /api/auth/register');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/admins/register');
      console.log('- POST /api/admins/login');
      console.log('\n=== Server Ready ===\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n❌ Unhandled Promise Rejection:');
  console.error(err);
  // Don't exit in development to allow for debugging
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Don't exit the process, just log the error
});