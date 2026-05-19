// src/routes/mpCase.routes.js
const express = require("express");
const router = express.Router();
const mpCaseController = require("../controllers/mpCase.controller");

// Obtiene casos + métricas de tarjetas
router.get("/bandeja", mpCaseController.getBandeja);

// Guarda o actualiza la fila con auditoría
router.post("/save", mpCaseController.saveCaseResolution);

module.exports = router;
