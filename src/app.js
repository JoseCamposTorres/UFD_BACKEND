const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const pnpCaseRoutes = require("./routes/pnpCase.routes");
const mpCaseRoutes = require("./routes/mpCase.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",

      "http://127.0.0.1:5173",

      "http://192.168.0.102:5173",
    ],

    credentials: true,
  }),
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/pnp-cases", pnpCaseRoutes);
app.use("/api/mp-case", mpCaseRoutes); 
module.exports = app;
