const authService = require('../services/auth.service');

const {
  successResponse,
  errorResponse,
} = require('../utils/response');

const register = async (req, res) => {

  try {

    const user = await authService.register(
      req.body
    );

    return successResponse(
      res,
      'Usuario registrado correctamente',
      user,
      201
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message,
      400
    );
  }
};

const login = async (req, res) => {

  try {

    const response = await authService.login(
      req.body.dni,
      req.body.password
    );

    return successResponse(
      res,
      'Login exitoso',
      response
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message,
      401
    );
  }
};

module.exports = {
  register,
  login,
};