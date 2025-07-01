const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Database configuration
const DB_CONFIG = {
  database: process.env.DB_NAME || 'digiwise',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000,
    supportBigNumbers: true,
    bigNumberStrings: true,
    decimalNumbers: true
  }
};

// Log database configuration (without password)
console.log('\n=== Database Configuration ===');
console.log(`- Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
console.log(`- Database: ${DB_CONFIG.database}`);
console.log(`- User: ${DB_CONFIG.username}`);
console.log(`- Dialect: ${DB_CONFIG.dialect}`);

// Create Sequelize instance
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  {
    ...DB_CONFIG,
    // Remove the password from the logged config
    password: DB_CONFIG.password ? '***' : undefined
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;