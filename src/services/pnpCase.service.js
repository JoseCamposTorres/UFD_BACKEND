// Agregamos 'literal' aquí arriba:
const { Op, fn, col, literal } = require("sequelize");
const PnpCase = require("../models/PnpCase");

const createCase = async (data) => {
  return await PnpCase.create(data);
};

const getDashboardStats = async () => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 1. Total Ingresos
  const total24h = await PnpCase.count({
    where: {
      created_at: {
        [Op.gte]: last24Hours,
      },
    },
  });

  // 2. Top 3 Delitos (Aquí es donde se rompía por falta de literal)
  const topDelitos = await PnpCase.findAll({
    attributes: ["delito", [fn("COUNT", col("id")), "count"]],
    group: ["delito"],
    order: [[literal("count"), "DESC"]], // <-- Ahora sí funcionará
    limit: 3,
    raw: true,
  });

  // 3. Top 4 Comisarías
  const topComisarias = await PnpCase.findAll({
    attributes: ["comisaria_origen", [fn("COUNT", col("id")), "count"]],
    group: ["comisaria_origen"],
    order: [[literal("count"), "DESC"]], // <-- Ahora sí funcionará
    limit: 4,
    raw: true,
  });

  return {
    totalIngresos24h: total24h,
    principalesDelitos: topDelitos.map((d) => ({
      label: d.delito,
      value: parseInt(d.count, 10),
    })),
    topComisarias: topComisarias.map((c, index) => ({
      numero: String(index + 1).padStart(2, "0"),
      lugar: c.comisaria_origen,
      value: parseInt(c.count, 10),
    })),
  };
};

module.exports = {
  createCase,
  getDashboardStats,
};
