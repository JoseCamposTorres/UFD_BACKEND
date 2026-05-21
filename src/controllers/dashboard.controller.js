// src/controllers/dashboard.controller.js
const dashboardService = require("../services/dashboard.service");

const getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error en getDashboardData Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al procesar los datos del dashboard.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
