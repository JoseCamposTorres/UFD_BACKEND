// src/migrations/20260520010100-create-pj-jip-audiencias.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pj_jip_audiencias", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      mp_case_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "mp_cases",
          key: "case_pnp_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      fecha_audiencia: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "PROGRAMADA",
      },

      registrado_por: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      registrado_por_dni: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pj_jip_audiencias");
  },
};
