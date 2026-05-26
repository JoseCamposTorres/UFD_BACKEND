"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pnp_cases", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      imputados: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      agraviados: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      fecha_detencion: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      fecha_puesta_disposicion: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      comisaria_origen: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      delito: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      registrado_por: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      registrado_por_dni: {
        type: Sequelize.STRING(8),
        allowNull: false,
      },

      ip_registro: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pnp_cases");
  },
};
