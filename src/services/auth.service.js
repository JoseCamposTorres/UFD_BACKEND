const User = require("../models/User");

const { hashPassword, comparePassword } = require("../utils/encrypt");

const { generateToken } = require("../utils/jwt");

const register = async (data) => {
  const existingUser = await User.findOne({
    where: {
      dni: data.dni,
    },
  });

  if (existingUser) {
    throw new Error("El usuario ya existe");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    dni: data.dni,
    names: data.names,
    password: hashedPassword,
    role: data.role || "POLICIA",
  });

  return user;
};

const login = async (dni, password) => {
  const user = await User.findOne({
    where: {
      dni,
    },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    throw new Error("Credenciales inválidas");
  }

  const token = generateToken({
    id: user.id,
    dni: user.dni,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      dni: user.dni,
      names: user.names,
      role: user.role,
    },
  };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  // 1. Buscar al usuario usando el ID del JWT
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // 2. Validar que la contraseña actual sea la correcta
  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error("La contraseña actual es incorrecta");
  }

  // 3. Hashear e infiltrar la nueva contraseña
  const hashedNewPassword = await hashPassword(newPassword);
  user.password = hashedNewPassword;

  // 4. Persistir en la base de datos
  await user.save();
  return true;
};

module.exports = {
  register,
  login,
  updatePassword, // <- Exportado
};