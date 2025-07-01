const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assessment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assessments',
      key: 'id'
    }
  },
  overall_score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_scores: {
    type: DataTypes.JSON,
    allowNull: false
  },
  risk_level: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['low', 'moderate', 'high', 'severe']]
    }
  }
}, {
  tableName: 'results',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Result;