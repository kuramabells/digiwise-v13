'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('results', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assessments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      overall_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      category_scores: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      risk_level: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      AssessmentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'assessments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('results');
  }
};
