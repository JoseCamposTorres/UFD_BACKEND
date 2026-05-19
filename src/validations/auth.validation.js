const { body } = require('express-validator');

const registerValidation = [

  body('dni')
    .isLength({ min: 8, max: 8 })
    .withMessage('DNI inválido'),

  body('names')
    .notEmpty()
    .withMessage('Nombre requerido'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password mínimo 8 caracteres'),
];

const loginValidation = [

  body('dni')
    .isLength({ min: 8, max: 8 })
    .withMessage('DNI inválido'),

  body('password')
    .notEmpty()
    .withMessage('Password requerido'),
];

module.exports = {
  registerValidation,
  loginValidation,
};