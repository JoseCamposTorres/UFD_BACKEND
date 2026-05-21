const { Op } = require("sequelize");

const MpCase = require("../models/MpCase");
const PnpCase = require("../models/PnpCase");
const PjCase = require("../models/PjCase");
const PjJipAudiencia = require("../models/PjJipAudiencia");
const PjJupAudiencia = require("../models/PjJupAudiencia");

// ==========================================
// HELPER PARA LIMPIAR FECHAS INVÁLIDAS
// ==========================================
const parseDateForDB = (val) => {
  if (!val || val === "Invalid date" || String(val).trim() === "") {
    return null;
  }
  return val;
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
      // BUSCAMOS SI YA EXISTE REGISTRO EN PJ
      const pjCase = await PjCase.findOne({
        where: {
          mp_case_id: mp.case_pnp_id,
        },
      });

      // TRAEMOS AUDIENCIAS JIP
      const jipAudiencias = await PjJipAudiencia.findAll({
        where: {
          mp_case_id: mp.case_pnp_id,
        },
        order: [["fecha_audiencia", "ASC"]],
      });

      // TRAEMOS AUDIENCIAS JUP
      const jupAudiencias = await PjJupAudiencia.findAll({
        where: {
          mp_case_id: mp.case_pnp_id,
        },
        order: [["fecha_audiencia", "ASC"]],
      });

      return {
        mp_case_id: mp.case_pnp_id,
        codigo_mp: `MP-REG-${mp.case_pnp_id.substring(0, 8).toUpperCase()}`,
        imputado: mp.pnpCase?.imputado_nombres || "NO REGISTRADO",
        delito: mp.pnpCase?.delito || "NO REGISTRADO",
        fiscal_asignado: mp.fiscal_asignado || "SIN FISCAL",
        derivacion_pj: mp.derivacion_pj,
        desenlace_mp: mp.desenlace_mp,
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
        jip_audiencias: jipAudiencias,
        jup_audiencias: jupAudiencias,
      };
    }),
  );

  // =========================
  // MÉTRICAS
  // =========================
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
      "Sobreseimiento en JPU",
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
  // ==========================================
  // LIMPIEZA DE DATOS ANTES DE PASAR A SEQUELIZE
  // ==========================================
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

  if (existing) {
    return await existing.update(data);
  }

  return await PjCase.create(data);
};

const createJipAudiencia = async (data) => {
  // Aplicar también a la fecha de la audiencia por seguridad
  data.fecha_audiencia = parseDateForDB(data.fecha_audiencia);
  return await PjJipAudiencia.create(data);
};

const createJupAudiencia = async (data) => {
  // Aplicar también a la fecha de la audiencia por seguridad
  data.fecha_audiencia = parseDateForDB(data.fecha_audiencia);
  return await PjJupAudiencia.create(data);
};

module.exports = {
  getBandeja,
  saveCase,
  createJipAudiencia,
  createJupAudiencia,
};
