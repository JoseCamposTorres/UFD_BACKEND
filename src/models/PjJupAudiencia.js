// src/models/PjJupAudiencia.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PjJupAudiencia = sequelize.define(
  "PjJupAudiencia",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    mp_case_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    fecha_audiencia: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    estado: {
      type: DataTypes.STRING,
      defaultValue: "PROGRAMADA",
    },

    registrado_por: DataTypes.STRING,

    registrado_por_dni: DataTypes.STRING(8),
  },
  {
    tableName: "pj_jup_audiencias",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PjJupAudiencia;
