const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const pnpCaseRoutes = require("./routes/pnpCase.routes");
const mpCaseRoutes = require("./routes/mpCase.routes");
const pjCaseRoutes = require("./routes/pjCase.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://192.168.0.102:5173",

      // Combinación UFD (La que está usando tu hosting real según el error)
      "https://ufdcanete.wolfcodetech.com",
      "https://ufdcaneteback.wolfcodetech.com",

      // Combinación UDF (Por si acaso lo cambias en el futuro)
      "https://udfcanete.wolfcodetech.com",
      "https://udfcaneteback.wolfcodetech.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(morgan("dev"));

app.use(express.json());

// Ruta de prueba para verificar que el backend responde
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "UFD Cañete Backend API v1.0.0 corriendo exitosamente en 2026",
    timestamp: new Date(),
  });
});

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/pnp-cases", pnpCaseRoutes);
app.use("/api/mp-case", mpCaseRoutes);
app.use("/api/pj", pjCaseRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
