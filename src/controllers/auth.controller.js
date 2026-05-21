const authService = require("../services/auth.service");

const { successResponse, errorResponse } = require("../utils/response");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    return successResponse(res, "Usuario registrado correctamente", user, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const response = await authService.login(req.body.dni, req.body.password);

    return successResponse(res, "Login exitoso", response);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; // Extraído de tu middleware validateJWT
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, "Todos los campos son obligatorios", 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(
        res,
        "La nueva contraseña y la confirmación no coinciden",
        400,
      );
    }

    if (newPassword.length < 8) {
      return errorResponse(
        res,
        "La nueva contraseña debe tener al menos 8 caracteres",
        400,
      );
    }

    await authService.updatePassword(userId, currentPassword, newPassword);

    return successResponse(
      res,
      "Contraseña actualizada correctamente de forma segura",
      null,
    );
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  register,
  login,
  updatePassword, // <- Exportado
};
