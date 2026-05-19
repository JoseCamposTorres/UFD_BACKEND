const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    dni: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },

    names: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "ADMIN",
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    tableName: "users",

    timestamps: true,

    createdAt: "created_at",

    updatedAt: "updated_at",
  },
);

module.exports = User;
