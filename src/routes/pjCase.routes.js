// src/routes/pjCase.routes.js

const express = require("express");

const router = express.Router();

const pjController = require("../controllers/pjCase.controller");

router.get("/bandeja", pjController.getBandeja);

router.post("/save", pjController.saveCase);

router.post("/jip-audiencia", pjController.createJipAudiencia);

router.post("/jup-audiencia", pjController.createJupAudiencia);

module.exports = router;
