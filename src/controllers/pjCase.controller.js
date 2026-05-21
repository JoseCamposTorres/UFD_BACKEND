// src/controllers/pjCase.controller.js

const pjService = require("../services/pjCase.service");

const getBandeja = async (req, res) => {
  try {
    const response = await pjService.getBandeja();

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const saveCase = async (req, res) => {
  try {
    const response = await pjService.saveCase(req.body);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createJipAudiencia = async (req, res) => {
  try {
    const response = await pjService.createJipAudiencia(req.body);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createJupAudiencia = async (req, res) => {
  try {
    const response = await pjService.createJupAudiencia(req.body);

    return res.status(200).json({
      success: true,
      data: response,
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
  saveCase,
  createJipAudiencia,
  createJupAudiencia,
};
