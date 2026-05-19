const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validateFields = require('../middlewares/validate.middleware');

const {
  registerValidation,
  loginValidation,
} = require('../validations/auth.validation');

router.post(
  '/register',
  registerValidation,
  validateFields,
  authController.register
);

router.post(
  '/login',
  loginValidation,
  validateFields,
  authController.login
);

module.exports = router;