const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    // port: process.env.DB_PORT,
    logging: false,

    // 1. Le dice a Sequelize cómo interpretar los objetos de fecha internamente
    timezone: "-05:00",

    // 2. Configura la conexión directa con el motor MySQL
    dialectOptions: {
      dateStrings: true, // Fuerza a retornar las fechas como strings en vez de objetos UTC
      typeCast: true, // Mantiene el casteo correcto de tipos de datos
      timezone: "-05:00", // Fuerza a la sesión de MySQL a operar en la hora de Perú
    },
  },
);

module.exports = sequelize;
