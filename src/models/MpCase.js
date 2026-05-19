// src/models/MpCase.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const PnpCase = require("./PnpCase"); // Importamos para la relación

const MpCase = sequelize.define(
  "MpCase",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Enlace directo al UUID de la tabla pnp_cases
    case_pnp_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: PnpCase,
        key: "id",
      },
    },
    fiscal_asignado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Guarda: 'Libertad', 'ConclusionA', 'ConclusionB' o ''
    desenlace_mp: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    // Guarda: 'Inmediato', 'Comun' o ''
    derivacion_pj: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    // Auditoría
    actualizado_por: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actualizado_por_dni: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
  },
  {
    tableName: "mp_cases",
    timestamps: true,
    underscored: true,
  },
);

// Establecemos la relación BelongsTo (Un caso MP pertenece a un caso PNP)
MpCase.belongsTo(PnpCase, { foreignKey: "case_pnp_id", as: "pnpCase" });
PnpCase.hasOne(MpCase, { foreignKey: "case_pnp_id", as: "mpCase" });

module.exports = MpCase;
