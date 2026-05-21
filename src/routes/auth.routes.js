// src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validateFields = require("../middlewares/validate.middleware");
const validateJWT = require("../middlewares/auth.middleware"); // Tu middleware provisto

const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");

router.post(
  "/register",
  registerValidation,
  validateFields,
  authController.register,
);
router.post("/login", loginValidation, validateFields, authController.login);

// NUEVA RUTA INTEGRADA
router.put("/update-password", validateJWT, authController.updatePassword);

module.exports = router;
