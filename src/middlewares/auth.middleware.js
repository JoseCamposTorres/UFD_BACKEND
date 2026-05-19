const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token requerido',
      });
    }

    const cleanToken = token.replace('Bearer ', '');

    const decoded = jwt.verify(
      cleanToken,
      process.env.JWT_SECRET
    );

    req.user = decoded;

   next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

module.exports = validateJWT;