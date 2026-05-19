// src/controllers/mpCase.controller.js
const mpCaseService = require("../services/mpCase.service");

const getBandeja = async (req, res) => {
  try {
    const { search } = req.query;
    const bandejaData = await mpCaseService.getBandejaValidacion(search);

    return res.status(200).json({
      success: true,
      data: bandejaData, // Contiene metrics y cases
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveCaseResolution = async (req, res) => {
  try {
    const {
      case_pnp_id,
      fiscal_asignado,
      desenlace_mp,
      derivacion_pj,
      actualizado_por,
      actualizado_por_dni,
    } = req.body;

    if (!case_pnp_id) {
      return res.status(400).json({
        success: false,
        message: "El parámetro case_pnp_id es totalmente obligatorio.",
      });
    }

    await mpCaseService.saveResolution({
      case_pnp_id,
      fiscal_asignado,
      desenlace_mp,
      derivacion_pj,
      actualizado_por,
      actualizado_por_dni,
    });

    return res.status(200).json({
      success: true,
      message: "Resolución del Ministerio Público procesada correctamente.",
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
  getBandeja,
  saveCaseResolution,
};
