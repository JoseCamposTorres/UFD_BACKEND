const { Op, fn, col, literal } = require("sequelize");
const PnpCase = require("../models/PnpCase");

const createCase = async (data) => {
  return await PnpCase.create(data);
};

const getDashboardStats = async () => {
  // 🇵🇪 Forzar la fecha actual en formato "YYYY-MM-DD HH:mm:ss" en Hora Perú
  // Usamos 'sv-SE' porque devuelve el formato ISO limpio directamente
  const horaPeruStr = new Date().toLocaleString("sv-SE", {
    timeZone: "America/Lima",
  });
  const ahoraPeru = new Date(horaPeruStr);

  // Restamos exactamente 24 horas basándonos en la hora de Perú
  const last24Hours = new Date(ahoraPeru.getTime() - 24 * 60 * 60 * 1000);

  // 1. Total Ingresos de Casos en las últimas 24h (Hora Perú)
  const total24h = await PnpCase.count({
    where: {
      created_at: {
        [Op.gte]: last24Hours,
      },
    },
  });

  // 2. NUEVO: Contar la cantidad total de DETENIDOS (elementos dentro de cada array 'imputados')
  const casosDetenidos24h = await PnpCase.findAll({
    attributes: ["imputados"],
    where: {
      created_at: {
        [Op.gte]: last24Hours,
      },
    },
    raw: true,
  });

  let totalDetenidos24h = 0;
  casosDetenidos24h.forEach((caso) => {
    if (caso.imputados) {
      try {
        // Si la base de datos lo devuelve como String (TEXT), lo parseamos; si ya es Objeto/Array, lo usamos directo
        const listaImputados =
          typeof caso.imputados === "string"
            ? JSON.parse(caso.imputados)
            : caso.imputados;

        if (Array.isArray(listaImputados)) {
          totalDetenidos24h += listaImputados.length;
        }
      } catch (error) {
        console.error("Error al parsear el campo imputados de un caso:", error);
      }
    }
  });

  // 3. Top 3 Delitos
  const topDelitos = await PnpCase.findAll({
    attributes: ["delito", [fn("COUNT", col("id")), "count"]],
    group: ["delito"],
    order: [[literal("count"), "DESC"]],
    limit: 3,
    raw: true,
  });

  // 4. Top 4 Comisarías
  const topComisarias = await PnpCase.findAll({
    attributes: ["comisaria_origen", [fn("COUNT", col("id")), "count"]],
    group: ["comisaria_origen"],
    order: [[literal("count"), "DESC"]],
    limit: 4,
    raw: true,
  });

  return {
    totalIngresos24h: total24h,
    totalDetenidos24h: totalDetenidos24h, // 🌟 Nuevo KPI agregado
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
