// src/models/PjJipAudiencia.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PjJipAudiencia = sequelize.define(
  "PjJipAudiencia",
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
    tableName: "pj_jip_audiencias",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PjJipAudiencia;
