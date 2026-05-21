// src/models/PjCase.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PjCase = sequelize.define(
  "PjCase",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    mp_case_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    ingreso_proceso: DataTypes.STRING,

    etapa_inv_preparatoria: DataTypes.DATE,

    fecha_descargo_jip: DataTypes.DATE,

    conclusion_inv_preparatoria: DataTypes.STRING,

    fecha_presentacion_acusacion: DataTypes.DATE,

    fecha_ingreso_jup: DataTypes.DATE,

    fecha_descargo_jup: DataTypes.DATE,

    conclusion_juzgamiento: DataTypes.STRING,

    registrado_por: DataTypes.STRING,

    registrado_por_dni: DataTypes.STRING(8),

    estado: {
      type: DataTypes.STRING,
      defaultValue: "PENDIENTE",
    },
  },
  {
    tableName: "pj_cases",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PjCase;
