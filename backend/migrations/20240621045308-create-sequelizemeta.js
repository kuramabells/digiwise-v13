'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sequelizemeta', {
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sequelizemeta');
  }
};
