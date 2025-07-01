require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'digiwise',
  port: process.env.DB_PORT || 3306
};

async function setupDatabase() {
  let connection;
  try {
    console.log('\n=== Database Setup ===');
    console.log('Connecting to MySQL server...');
    
    // Create connection without database
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    console.log(`✅ Database '${DB_CONFIG.database}' created or already exists`);

    // Use the database
    await connection.query(`USE \`${DB_CONFIG.database}\``);
    console.log(`✅ Using database '${DB_CONFIG.database}'`);

    // Drop existing tables if they exist
    console.log('\nDropping existing tables...');
    await connection.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS results;
      DROP TABLE IF EXISTS answers;
      DROP TABLE IF EXISTS assessments;
      DROP TABLE IF EXISTS questions;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS admins;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    console.log('✅ Dropped existing tables');

    // Create users table
    console.log('\nCreating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Created users table');

    // Create admins table
    console.log('\nCreating admins table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT(11) NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ Admins table created or already exists');

    // Check if default admin exists
    const [admins] = await connection.query('SELECT * FROM admins WHERE email = ?', ['admin@digiwise.com']);
    
    if (admins.length === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO admins (email, password, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['admin@digiwise.com', hashedPassword, 'Admin', 'User']
      );
      console.log('✅ Default admin created');
    } else {
      console.log('✅ Default admin already exists');
    }

    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the setup
setupDatabase().catch(console.error); 