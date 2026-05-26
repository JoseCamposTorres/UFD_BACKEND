const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PnpCase = sequelize.define(
  "PnpCase",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    imputados: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    agraviados: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    fecha_detencion: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    fecha_puesta_disposicion: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    comisaria_origen: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    delito: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    registrado_por: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    registrado_por_dni: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },

    ip_registro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "pnp_cases",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PnpCase;
