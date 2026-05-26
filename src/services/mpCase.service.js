// src/services/mpCase.service.js
const { Op } = require("sequelize");
const MpCase = require("../models/MpCase");
const PnpCase = require("../models/PnpCase");

const getBandejaValidacion = async (searchTerm = "") => {
  let pnpWhere = {};

  // Ajustamos la búsqueda reactiva para que escanee los nuevos campos JSON si es necesario,
  // o mantenga el escaneo por ID/Referencia.
  if (searchTerm) {
    pnpWhere = {
      [Op.or]: [
        { id: { [Op.like]: `%${searchTerm}%` } },
        { delito: { [Op.like]: `%${searchTerm}%` } },
        // Si mantienes campos planos de texto para búsqueda rápida, agrégalos aquí.
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
    order: [["fecha_detencion", "ASC"]],
  });

  // Mapeamos los datos solucionando el formato de fecha e inyectando las colecciones JSON
  const formattedCases = rawCases.map((c) => {
    const fechaOrigen = c.fecha_detencion;

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

    let listaImputados = [];
    try {
      listaImputados =
        typeof c.imputados === "string"
          ? JSON.parse(c.imputados)
          : c.imputados || [];
    } catch (e) {
      console.error("Error al parsear imputados del caso:", c.id, e);
    }

    // 2. Parseo de Agraviados
    let listaAgraviados = [];
    try {
      listaAgraviados =
        typeof c.agraviados === "string"
          ? JSON.parse(c.agraviados)
          : c.agraviados || [];
    } catch (e) {
      console.error("Error al parsear agraviados del caso:", c.id, e);
    }

    return {
      id: c.id,
      referencia_pnp: `PNP-REG-${c.id.substring(0, 8).toUpperCase()}`,
      fecha_ingreso: fechaOrigen
        ? new Date(fechaOrigen).toLocaleDateString("es-PE", opcionesFecha)
        : "Sin Fecha",
      hora_ingreso: fechaOrigen
        ? new Date(fechaOrigen).toLocaleTimeString("es-PE", opcionesHora)
        : "Sin Hora",

      // 🌟 Mandamos ambos nombres al Front-End para que uses el que prefieras sin romper nada
      imputados: listaImputados,
      agraviados: listaAgraviados,

      // Listado unificado en formato String separado por comas para las tablas generales
      imputado_nombres:
        listaImputados
          .map((d) => (d.nombres ? d.nombres.trim() : "Sin Nombre"))
          .join(", ") || "Sin Imputados",
      agraviado_nombres:
        listaAgraviados
          .map((a) => (a.nombres ? a.nombres.trim() : "Sin Nombre"))
          .join(", ") || "Sin Agraviados",

      articulo: "Art. General",
      comisaria: c.comisaria_origen,
      urgente: false,
      fiscal_asignado: c.mpCase?.fiscal_asignado || "Sin Asignar",
      desenlace_mp: c.mpCase?.desenlace_mp || "",
      derivacion_pj: c.mpCase?.derivacion_pj || "",
      actualizado_por: c.mpCase?.actualizado_por || "No registrado",
      actualizado_por_dni: c.mpCase?.actualizado_por_dni || "",
      isEditing: false,
    };
  });

  // CONTADORES (Métricas estáticas de bandeja)
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
      processesInmediatos: totalInmediatos,
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
