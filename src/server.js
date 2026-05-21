const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("Base de datos conectada");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
  }
};

///adasdasdasdasdasd

startServer();
