const { Op } = require("sequelize");

const MpCase = require("../models/MpCase");
const PnpCase = require("../models/PnpCase");
const PjCase = require("../models/PjCase");
const PjJipAudiencia = require("../models/PjJipAudiencia");
const PjJupAudiencia = require("../models/PjJupAudiencia");

// ==========================================
// HELPER PARA LIMPIAR FECHAS Y PARSEAR JSON
// ==========================================
const parseDateForDB = (val) => {
  if (!val || val === "Invalid date" || String(val).trim() === "") {
    return null;
  }
  return val;
};

const safeParseJSON = (data) => {
  try {
    if (!data) return [];

    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    console.error("Error parseando JSON:", e);
    return [];
  }
};

const getBandeja = async () => {
  // TRAEMOS TODOS LOS CASOS INMEDIATOS DEL MP
  const mpCases = await MpCase.findAll({
    where: {
      derivacion_pj: "Inmediato",
    },
    include: [
      {
        model: PnpCase,
        as: "pnpCase",
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  const response = await Promise.all(
    mpCases.map(async (mp) => {
      const pjCase = await PjCase.findOne({
        where: {
          mp_case_id: mp.case_pnp_id,
        },
      });

      const jipAudiencias = await PjJipAudiencia.findAll({
        where: { mp_case_id: mp.case_pnp_id },
        order: [["fecha_audiencia", "ASC"]],
      });

      const jupAudiencias = await PjJupAudiencia.findAll({
        where: { mp_case_id: mp.case_pnp_id },
        order: [["fecha_audiencia", "ASC"]],
      });

      const fechaOrigen = mp.pnpCase?.fecha_detencion;

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

      // ==========================================
      // PARSEAMOS IMPUTADOS Y AGRAVIADOS
      // ==========================================
      const listaImputados = safeParseJSON(mp.pnpCase?.imputados);

      const listaAgraviados = safeParseJSON(mp.pnpCase?.agraviados);

      return {
        // ==========================================
        // DATOS BASE
        // ==========================================
        mp_case_id: mp.case_pnp_id,

        codigo_mp: `MP-REG-${mp.case_pnp_id.substring(0, 8).toUpperCase()}`,

        fecha_ingreso: fechaOrigen
          ? new Date(fechaOrigen).toLocaleDateString("es-PE", opcionesFecha)
          : "Sin Fecha",

        hora_ingreso: fechaOrigen
          ? new Date(fechaOrigen).toLocaleTimeString("es-PE", opcionesHora)
          : "Sin Hora",

        // ==========================================
        // IMPUTADOS
        // ==========================================
        imputados: listaImputados,

        imputado_nombres:
          listaImputados
            .map((i) => (i?.nombres ? i.nombres.trim() : "SIN NOMBRE"))
            .join(", ") || "NO REGISTRADO",

        // ==========================================
        // AGRAVIADOS
        // ==========================================
        agraviados: listaAgraviados,

        agraviado_nombres:
          listaAgraviados
            .map((a) => (a?.nombres ? a.nombres.trim() : "SIN NOMBRE"))
            .join(", ") || "NO REGISTRADO",

        // ==========================================
        // DATOS MP / PNP
        // ==========================================
        delito: mp.pnpCase?.delito || "NO REGISTRADO",

        fiscal_asignado: mp.fiscal_asignado || "SIN FISCAL",

        derivacion_pj: mp.derivacion_pj,

        desenlace_mp: mp.desenlace_mp,

        // ==========================================
        // DATOS PJ
        // ==========================================
        ingreso_proceso: pjCase?.ingreso_proceso || "",

        etapa_inv_preparatoria: pjCase?.etapa_inv_preparatoria || null,

        fecha_descargo_jip: pjCase?.fecha_descargo_jip || null,

        conclusion_inv_preparatoria: pjCase?.conclusion_inv_preparatoria || "",

        fecha_presentacion_acusacion:
          pjCase?.fecha_presentacion_acusacion || null,

        fecha_ingreso_jup: pjCase?.fecha_ingreso_jup || null,

        fecha_descargo_jup: pjCase?.fecha_descargo_jup || null,

        conclusion_juzgamiento: pjCase?.conclusion_juzgamiento || "",

        estado: pjCase?.estado || "PENDIENTE",

        registrado_por: pjCase?.registrado_por || "",

        registrado_por_dni: pjCase?.registrado_por_dni || "",

        // ==========================================
        // AUDIENCIAS
        // ==========================================
        jip_audiencias: jipAudiencias,

        jup_audiencias: jupAudiencias,
      };
    }),
  );

  // ==========================================
  // MÉTRICAS
  // ==========================================
  const totalCasos = response.length;

  const totalResueltosJip = response.filter((c) =>
    ["Sentencia de T.A", "Sobreseimiento en JIP", "Improcedente P.I"].includes(
      c.conclusion_inv_preparatoria,
    ),
  ).length;

  const totalResueltosJup = response.filter((c) =>
    [
      "Sentencia Condenatoria",
      "Sentencia Absolutoria",
      "Sobreseimiento en JUP",
    ].includes(c.conclusion_juzgamiento),
  ).length;

  const totalPendientes = response.filter(
    (c) =>
      c.estado === "PENDIENTE" ||
      c.conclusion_juzgamiento === "Proceso en reserva",
  ).length;

  return {
    metrics: {
      totalCasos,
      totalResueltosJip,
      totalResueltosJup,
      totalPendientes,
    },

    cases: response,
  };
};

const saveCase = async (data) => {
  data.etapa_inv_preparatoria = parseDateForDB(data.etapa_inv_preparatoria);

  data.fecha_descargo_jip = parseDateForDB(data.fecha_descargo_jip);

  data.fecha_presentacion_acusacion = parseDateForDB(
    data.fecha_presentacion_acusacion,
  );

  data.fecha_ingreso_jup = parseDateForDB(data.fecha_ingreso_jup);

  data.fecha_descargo_jup = parseDateForDB(data.fecha_descargo_jup);

  const existing = await PjCase.findOne({
    where: {
      mp_case_id: data.mp_case_id,
    },
  });

  return existing ? await existing.update(data) : await PjCase.create(data);
};

const createJipAudiencia = async (data) => {
  data.fecha_audiencia = parseDateForDB(data.fecha_audiencia);

  return await PjJipAudiencia.create(data);
};

const createJupAudiencia = async (data) => {
  data.fecha_audiencia = parseDateForDB(data.fecha_audiencia);

  return await PjJupAudiencia.create(data);
};

module.exports = {
  getBandeja,
  saveCase,
  createJipAudiencia,
  createJupAudiencia,
};
