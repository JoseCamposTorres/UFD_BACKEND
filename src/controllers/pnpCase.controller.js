const pnpCaseService = require("../services/pnpCase.service");

const createCase = async (req, res) => {
  try {
    const {
      imputado_dni,
      imputado_nombres,
      agraviado_nombres,
      fecha_detencion,
      fecha_puesta_disposicion,
      comisaria_origen,
      delito,
      registrado_por,
      registrado_por_dni,
    } = req.body;

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const newCase = await pnpCaseService.createCase({
      imputado_dni,
      imputado_nombres,
      agraviado_nombres,
      fecha_detencion,
      fecha_puesta_disposicion,
      comisaria_origen,
      delito,
      registrado_por,
      registrado_por_dni,
      ip_registro: ip,
    });

    return res.status(201).json({
      success: true,
      data: newCase,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await pnpCaseService.getDashboardStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCase,
  getStats,
};
