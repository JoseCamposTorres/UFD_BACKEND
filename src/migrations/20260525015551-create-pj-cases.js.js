// src/migrations/20260520010000-create-pj-cases.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pj_cases", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // UUID REAL DE MP
      mp_case_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "mp_cases",
          key: "case_pnp_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      ingreso_proceso: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      // ES FECHA
      etapa_inv_preparatoria: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      fecha_descargo_jip: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      conclusion_inv_preparatoria: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fecha_presentacion_acusacion: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      fecha_ingreso_jup: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      fecha_descargo_jup: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      conclusion_juzgamiento: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      registrado_por: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      registrado_por_dni: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },

      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "PENDIENTE",
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
    await queryInterface.dropTable("pj_cases");
  },
};
