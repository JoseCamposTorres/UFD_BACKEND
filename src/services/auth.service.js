const User = require('../models/User');

const {
  hashPassword,
  comparePassword,
} = require('../utils/encrypt');

const { generateToken } = require('../utils/jwt');

const register = async (data) => {

  const existingUser = await User.findOne({
    where: {
      dni: data.dni,
    },
  });

  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await hashPassword(
    data.password
  );

  const user = await User.create({
    dni: data.dni,
    names: data.names,
    password: hashedPassword,
    role: data.role || 'POLICIA',
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
    throw new Error('Credenciales inválidas');
  }

  const validPassword = await comparePassword(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error('Credenciales inválidas');
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

module.exports = {
  register,
  login,
};