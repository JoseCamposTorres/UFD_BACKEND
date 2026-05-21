// src/services/dashboard.service.js
const { Op, fn, col } = require("sequelize");
const PnpCase = require("../models/PnpCase");
const MpCase = require("../models/MpCase");
const PjCase = require("../models/PjCase");

// Matriz de valores válidos que determinan un caso concluido en el Ministerio Público
const VALORES_CONCLUIDOS_MP = [
  "Libertad: Principio de oportunidad",
  "Libertad: No encontrar medios probatorios",
  "Libertad: Acuerdo reparatorio",
  "Libertad: Archivo de la inv. en diligencias preliminares",
  "Libertad: No constituye delito",
  "Otros",
];

const getDashboardStats = async () => {
  // ---------------------------------------------------------
  // 1. MÉTRICAS GENERALES (CONTEOS PRINCIPALES)
  // ---------------------------------------------------------
  const numDetenidos = await PnpCase.count();

  const numIngresosFiscalia = await MpCase.count();

  const numFormalizacion = await MpCase.count({
    where: { derivacion_pj: "Comun" },
  });

  const numConcluidosFiscalia = await MpCase.count({
    where: {
      desenlace_mp: {
        [Op.in]: VALORES_CONCLUIDOS_MP,
      },
    },
  });

  const numIngresadosUuff = await PjCase.count();

  const numCasosResueltos = await PjCase.count({
    where: { estado: "CONCLUIDO" },
  });

  // ---------------------------------------------------------
  // 2. INFORMACIÓN PNP (AGRUPACIONES)
  // ---------------------------------------------------------
  const pnpPorDelitoRaw = await PnpCase.findAll({
    attributes: ["delito", [fn("COUNT", col("id")), "count"]],
    group: ["delito"],
    raw: true,
  });

  const pnpPorDelito = pnpPorDelitoRaw.map((item) => ({
    name: item.delito,
    count: parseInt(item.count, 10),
  }));

  const pnpPorComisariaRaw = await PnpCase.findAll({
    attributes: ["comisaria_origen", [fn("COUNT", col("id")), "count"]],
    group: ["comisaria_origen"],
    raw: true,
  });

  const pnpPorComisaria = pnpPorComisariaRaw.map((item) => ({
    name: item.comisaria_origen,
    count: parseInt(item.count, 10),
  }));

  // ---------------------------------------------------------
  // 3. CONCLUIDOS MINISTERIO PÚBLICO
  // ---------------------------------------------------------
  const mpConcluidosRaw = await MpCase.findAll({
    where: {
      desenlace_mp: {
        [Op.in]: VALORES_CONCLUIDOS_MP,
      },
    },
    attributes: ["desenlace_mp", [fn("COUNT", col("id")), "count"]],
    group: ["desenlace_mp"],
    raw: true,
  });

  const mpConcluidosEstructurado = {
    "Libertad: Principio de oportunidad": 0,
    "Libertad: No encontrar medios probatorios": 0,
    "Libertad: Acuerdo reparatorio": 0,
    "Libertad: Archivo de la inv. en diligencias preliminares": 0,
    "Libertad: No constituye delito": 0,
    Otros: 0,
  };

  mpConcluidosRaw.forEach((item) => {
    const key = item.desenlace_mp;
    if (mpConcluidosEstructurado[key] !== undefined) {
      mpConcluidosEstructurado[key] += parseInt(item.count, 10);
    } else {
      mpConcluidosEstructurado["Otros"] += parseInt(item.count, 10);
    }
  });

  const concluidosMPData = Object.keys(mpConcluidosEstructurado).map(
    (name) => ({
      name,
      count: mpConcluidosEstructurado[name],
    }),
  );

  // ---------------------------------------------------------
  // 4. CONCLUIDOS PODER JUDICIAL (MÉTRICA CONDICIONAL Y TIEMPOS)
  // ---------------------------------------------------------
  const pjCasesList = await PjCase.findAll({
    attributes: [
      "conclusion_inv_preparatoria",
      "conclusion_juzgamiento",
      "etapa_inv_preparatoria",
      "fecha_descargo_jip",
      "fecha_ingreso_jup",
      "fecha_descargo_jup",
    ],
    raw: true,
  });

  const pjEstructurado = {
    "Sentencia de T.A": 0,
    "Sobreseimiento en JIP": 0,
    "Improcedente P.I": 0,
    "Sentencia Condenatoria": 0,
    "Sentencia Absolutoria": 0,
    "Sobreseimiento en JPU": 0,
  };

  const valoresJIP = [
    "Sentencia de T.A",
    "Sobreseimiento en JIP",
    "Improcedente P.I",
  ];
  const valoresJUP = [
    "Sentencia Condenatoria",
    "Sentencia Absolutoria",
    "Sobreseimiento en JPU",
  ];

  let tiempoTotalJIP = 0;
  let contadorJIP = 0;
  let tiempoTotalJUP = 0;
  let contadorJUP = 0;

  pjCasesList.forEach((c) => {
    if (valoresJIP.includes(c.conclusion_inv_preparatoria)) {
      pjEstructurado[c.conclusion_inv_preparatoria]++;
    } else if (valoresJUP.includes(c.conclusion_juzgamiento)) {
      pjEstructurado[c.conclusion_juzgamiento]++;
    }

    // Acumulador tiempo promedio - JIP
    if (
      valoresJIP.includes(c.conclusion_inv_preparatoria) &&
      c.fecha_descargo_jip &&
      c.etapa_inv_preparatoria
    ) {
      const diff =
        new Date(c.fecha_descargo_jip) - new Date(c.etapa_inv_preparatoria);
      if (diff > 0) {
        tiempoTotalJIP += diff;
        contadorJIP++;
      }
    }

    // Acumulador tiempo promedio - JUP
    if (
      valoresJUP.includes(c.conclusion_juzgamiento) &&
      c.fecha_descargo_jup &&
      c.fecha_ingreso_jup
    ) {
      const diff =
        new Date(c.fecha_descargo_jup) - new Date(c.fecha_ingreso_jup);
      if (diff > 0) {
        tiempoTotalJUP += diff;
        contadorJUP++;
      }
    }
  });

  const concluidosPJData = Object.keys(pjEstructurado).map((name) => ({
    name,
    count: pjEstructurado[name],
  }));

  // 🔥 CAMBIO AQUÍ: Usamos Math.floor para truncar al entero inferior directo (e.g., 18.3 -> 18)
  const promedioJIPDias =
    contadorJIP > 0
      ? Math.floor(tiempoTotalJIP / (1000 * 60 * 60 * 24) / contadorJIP)
      : 0;

  const promedioJUPDias =
    contadorJUP > 0
      ? Math.floor(tiempoTotalJUP / (1000 * 60 * 60 * 24) / contadorJUP)
      : 0;

  return {
    metrics: {
      recibidos: numDetenidos,
      ingresosFiscalia: numIngresosFiscalia,
      formalizacion: numFormalizacion,
      concluidosFiscalia: numConcluidosFiscalia,
      ingresadosUuff: numIngresadosUuff,
      casosResueltos: numCasosResueltos,
    },
    pnpPorDelito,
    pnpPorComisaria,
    concluidosMPData,
    concluidosPJData,
    tiemposPromedio: {
      investigacionPreparatoriaDias: promedioJIPDias,
      juzgamientoDias: promedioJUPDias,
    },
  };
};

module.exports = {
  getDashboardStats,
};
