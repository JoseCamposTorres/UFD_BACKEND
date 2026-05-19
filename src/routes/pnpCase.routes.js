const express = require("express");
const router = express.Router();
const pnpCaseController = require("../controllers/pnpCase.controller");

router.post("/", pnpCaseController.createCase);
router.get("/stats", pnpCaseController.getStats);

module.exports = router;
