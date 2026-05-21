// src/services/mpCase.service.js
const { Op } = require("sequelize");
const MpCase = require("../models/MpCase");
const PnpCase = require("../models/PnpCase");

const getBandejaValidacion = async (searchTerm = "") => {
  let pnpWhere = {};

  if (searchTerm) {
    pnpWhere = {
      [Op.or]: [
        { imputado_nombres: { [Op.like]: `%${searchTerm}%` } },
        { id: { [Op.like]: `%${searchTerm}%` } },
      ],
    };
  }

  const rawCases = await PnpCase.findAll({
    where: pnpWhere,
    include: [
      {
        model: MpCase,
        as: "mpCase",
      },
    ],
    // Forzamos el ordenamiento usando el campo físico real de la tabla en MySQL
    order: [["fecha_detencion", "ASC"]],
  });

  // Mapeamos los datos solucionando el formato de fecha
  const formattedCases = rawCases.map((c) => {
    const fechaOrigen = c.fecha_detencion;

    // Configuración estricta para asegurar la zona horaria peruana en el Front
    const opcionesFecha = {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const opcionesHora = {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    return {
      id: c.id,
      referencia_pnp: `PNP-REG-${c.id.substring(0, 8).toUpperCase()}`,
      // Convertimos forzando America/Lima
      fecha_ingreso: fechaOrigen
        ? new Date(fechaOrigen).toLocaleDateString("es-PE", opcionesFecha)
        : "Sin Fecha",
      hora_ingreso: fechaOrigen
        ? new Date(fechaOrigen).toLocaleTimeString("es-PE", opcionesHora)
        : "Sin Hora",
      imputado_nombres: c.imputado_nombres,
      delito: c.delito,
      articulo: "Art. General",
      comisaria: c.comisaria_origen,
      urgente: false,
      fiscal_asignado: c.mpCase?.fiscal_asignado || "Sin Asignar",
      desenlace_mp: c.mpCase?.desenlace_mp || "",
      derivacion_pj: c.mpCase?.derivacion_pj || "",
      isEditing: false,
    };
  });

  // CONTADORES
  const totalRecibidos = await PnpCase.count();
  const totalInmediatos = await MpCase.count({
    where: { derivacion_pj: "Inmediato" },
  });
  const totalComunes = await MpCase.count({
    where: { derivacion_pj: "Comun" },
  });

  const totalConcluidos = await MpCase.count({
    where: {
      desenlace_mp: {
        [Op.in]: [
          "Libertad",
          "Libertad: Principio de oportunidad",
          "Libertad: No encontrar medios probatorios",
          "Libertad: Acuerdo reparatorio",
          "Libertad: Archivo de la inv. en diligencias preliminares",
          "Libertad: No constituye delito",
          "Otros",
        ],
      },
    },
  });

  return {
    metrics: {
      recibidos: totalRecibidos,
      procesosInmediatos: totalInmediatos,
      procesosComunes: totalComunes,
      concluidos: totalConcluidos,
    },
    cases: formattedCases,
  };
};

const saveResolution = async (resolutionData) => {
  const {
    case_pnp_id,
    fiscal_asignado,
    desenlace_mp,
    derivacion_pj,
    actualizado_por,
    actualizado_por_dni,
  } = resolutionData;

  const existingRecord = await MpCase.findOne({ where: { case_pnp_id } });

  if (existingRecord) {
    return await existingRecord.update({
      fiscal_asignado,
      desenlace_mp,
      derivacion_pj,
      actualizado_por,
      actualizado_por_dni,
    });
  } else {
    return await MpCase.create({
      case_pnp_id,
      fiscal_asignado,
      desenlace_mp,
      derivacion_pj,
      actualizado_por,
      actualizado_por_dni,
    });
  }
};

module.exports = {
  getBandejaValidacion,
  saveResolution,
};
