const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name' // Explicitly set the database column name
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name' // Explicitly set the database column name
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age_range: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'age_range' // Explicitly set the database column name
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'examinee'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login' // Explicitly set the database column name
  }
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User; 