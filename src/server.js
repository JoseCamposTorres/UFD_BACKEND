const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 3000;

// Levantamos el servidor Express primero para evitar el 503 inmediato
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  // Conectamos a la base de datos de manera asíncrona en segundo plano
  sequelize
    .authenticate()
    .then(() => {
      console.log("Base de datos conectada exitosamente");
    })
    .catch((error) => {
      console.error("Error al conectar a la base de datos:", error.message);
    });
});
