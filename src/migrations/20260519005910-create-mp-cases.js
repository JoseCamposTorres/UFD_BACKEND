// src/migrations/20260518202000-create-mp-cases.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mp_cases", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      // Relación directa con la tabla de la policía (UUID)
      case_pnp_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // Un caso PNP solo se valida una vez en MP
        references: {
          model: "pnp_cases",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fiscal_asignado: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Almacena 'Libertad', 'ConclusionA', 'ConclusionB' o vacío ''
      desenlace_mp: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      // Almacena 'Inmediato', 'Comun' o vacío ''
      derivacion_pj: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "",
      },
      // Auditoría básica de quién toca el expediente
      actualizado_por: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      actualizado_por_dni: {
        type: Sequelize.STRING(8),
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
    await queryInterface.dropTable("mp_cases");
  },
};