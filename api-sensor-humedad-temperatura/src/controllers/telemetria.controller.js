const pool = require("../config/database");
const {
  telemetriaSchema
} = require("../schemas/telemetria.schema");
const telemetriaEvents = require("../realtime/telemetria.events");

const ZONA_HORARIA = process.env.APP_TIMEZONE || "America/Tegucigalpa";
const RANGOS = {
  "1h": "1 hour",
  "6h": "6 hours",
  "12h": "12 hours",
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

function numero(valor) {
  return valor === null || valor === undefined ? null : Number(valor);
}

function normalizarLectura(fila) {
  if (!fila) return null;

  return {
    ...fila,
    temperatura: numero(fila.temperatura),
    humedad: numero(fila.humedad),
    umbral: numero(fila.umbral),
    uptime: numero(fila.uptime),
  };
}

function dispositivoQuery(dispositivo, posicion) {
  return dispositivo
    ? { clausula: ` AND dispositivo = $${posicion}`, valores: [dispositivo] }
    : { clausula: "", valores: [] };
}

function responderError(res, error, mensaje) {
  console.error(mensaje, error);
  return res.status(500).json({ ok: false, mensaje });
}

function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || "")) return false;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const parsed = new Date(Date.UTC(anio, mes - 1, dia));
  return parsed.getUTCFullYear() === anio && parsed.getUTCMonth() === mes - 1 && parsed.getUTCDate() === dia;
}

async function crearTelemetria(req, res) {
  try {
    const validacion = telemetriaSchema.safeParse(req.body);

    if (!validacion.success) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos",
        errores: validacion.error.issues,
      });
    }

    const data = validacion.data;

    const query = `
      INSERT INTO telemetria_ambiental (
        dispositivo,
        aula,
        temperatura,
        humedad,
        umbral,
        alerta,
        estado,
        uptime,
        recibido_en
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      data.dispositivo,
      data.aula,
      data.temperatura,
      data.humedad,
      data.umbral,
      data.alerta,
      data.estado,
      data.uptime,
      data.recibido_en,
    ];

    const result = await pool.query(query, values);
    const lectura = normalizarLectura(result.rows[0]);
    telemetriaEvents.emit("lectura", lectura);

    return res.status(201).json({
      ok: true,
      mensaje: "Telemetría almacenada correctamente",
      data: lectura,
    });

  } catch (error) {
    console.error("ERROR POSTGRES:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error guardando telemetría",
      error: error.message,
    });
  }
}

async function obtenerUltima(req, res) {
  try {
    const filtro = dispositivoQuery(req.query.dispositivo, 1);
    const result = await pool.query(
      `SELECT * FROM telemetria_ambiental
       WHERE 1 = 1${filtro.clausula}
       ORDER BY recibido_en DESC
       LIMIT 1`,
      filtro.valores
    );

    return res.json({ ok: true, data: normalizarLectura(result.rows[0]) });
  } catch (error) {
    return responderError(res, error, "No se pudo obtener la última lectura");
  }
}

async function obtenerHistorial(req, res) {
  try {
    if (req.query.rango && !RANGOS[req.query.rango]) {
      return res.status(400).json({ ok: false, mensaje: "Rango no válido" });
    }
    const rango = RANGOS[req.query.rango] || RANGOS["24h"];
    const limite = Math.floor(Math.min(Math.max(Number(req.query.limite) || 500, 1), 2000));
    const filtro = dispositivoQuery(req.query.dispositivo, 2);
    const valores = [rango, ...filtro.valores, limite];
    const posicionLimite = valores.length;

    const result = await pool.query(
      `SELECT * FROM (
         SELECT dispositivo, aula, temperatura::float8 AS temperatura,
                humedad::float8 AS humedad, umbral::float8 AS umbral,
                alerta, estado, uptime, recibido_en
         FROM telemetria_ambiental
         WHERE recibido_en >= NOW() - $1::interval${filtro.clausula}
         ORDER BY recibido_en DESC
         LIMIT $${posicionLimite}
       ) AS lecturas_recientes
       ORDER BY recibido_en ASC`,
      valores
    );

    return res.json({
      ok: true,
      meta: { rango: req.query.rango || "24h", total: result.rowCount },
      data: result.rows.map(normalizarLectura),
    });
  } catch (error) {
    return responderError(res, error, "No se pudo obtener el historial");
  }
}

async function obtenerResumen(req, res) {
  try {
    if (req.query.periodo && !["hoy", "mes"].includes(req.query.periodo)) {
      return res.status(400).json({ ok: false, mensaje: "Periodo no válido" });
    }
    const periodo = req.query.periodo === "mes" ? "month" : "day";
    const filtro = dispositivoQuery(req.query.dispositivo, 3);
    const result = await pool.query(
      `SELECT COUNT(*)::int AS lecturas,
              AVG(temperatura)::float8 AS temperatura_promedio,
              MIN(temperatura)::float8 AS temperatura_minima,
              MAX(temperatura)::float8 AS temperatura_maxima,
              AVG(humedad)::float8 AS humedad_promedio,
              MIN(humedad)::float8 AS humedad_minima,
              MAX(humedad)::float8 AS humedad_maxima,
              COUNT(*) FILTER (WHERE alerta = true)::int AS alertas,
              MAX(recibido_en) AS ultima_lectura
       FROM telemetria_ambiental
       WHERE recibido_en >= (
         date_trunc($1, NOW() AT TIME ZONE $2) AT TIME ZONE $2
       )${filtro.clausula}`,
      [periodo, ZONA_HORARIA, ...filtro.valores]
    );

    const data = result.rows[0];
    return res.json({
      ok: true,
      meta: { periodo: periodo === "month" ? "mes" : "hoy", zona_horaria: ZONA_HORARIA },
      data: {
        lecturas: Number(data.lecturas),
        temperatura: {
          promedio: numero(data.temperatura_promedio),
          minima: numero(data.temperatura_minima),
          maxima: numero(data.temperatura_maxima),
        },
        humedad: {
          promedio: numero(data.humedad_promedio),
          minima: numero(data.humedad_minima),
          maxima: numero(data.humedad_maxima),
        },
        alertas: Number(data.alertas),
        ultima_lectura: data.ultima_lectura,
      },
    });
  } catch (error) {
    return responderError(res, error, "No se pudo calcular el resumen");
  }
}

async function obtenerPromediosHorarios(req, res) {
  try {
    if (req.query.fecha && !fechaValida(req.query.fecha)) {
      return res.status(400).json({ ok: false, mensaje: "Fecha no válida; usa AAAA-MM-DD" });
    }
    const fecha = req.query.fecha || new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(new Date());
    const filtro = dispositivoQuery(req.query.dispositivo, 3);
    const result = await pool.query(
      `SELECT date_trunc('hour', recibido_en AT TIME ZONE $2) AT TIME ZONE $2 AS hora,
              COUNT(*)::int AS lecturas,
              AVG(temperatura)::float8 AS temperatura_promedio,
              MIN(temperatura)::float8 AS temperatura_minima,
              MAX(temperatura)::float8 AS temperatura_maxima,
              AVG(humedad)::float8 AS humedad_promedio,
              MIN(humedad)::float8 AS humedad_minima,
              MAX(humedad)::float8 AS humedad_maxima
       FROM telemetria_ambiental
       WHERE recibido_en >= ($1::date::timestamp AT TIME ZONE $2)
         AND recibido_en < (($1::date + 1)::timestamp AT TIME ZONE $2)${filtro.clausula}
       GROUP BY 1
       ORDER BY 1 ASC`,
      [fecha, ZONA_HORARIA, ...filtro.valores]
    );

    return res.json({ ok: true, meta: { fecha, zona_horaria: ZONA_HORARIA }, data: result.rows });
  } catch (error) {
    return responderError(res, error, "No se pudieron calcular los promedios horarios");
  }
}

async function obtenerMetricasMensuales(req, res) {
  try {
    const ahora = new Date();
    const anio = Math.floor(Math.min(Math.max(Number(req.query.anio) || ahora.getFullYear(), 2000), 2100));
    const mes = Math.floor(Math.min(Math.max(Number(req.query.mes) || ahora.getMonth() + 1, 1), 12));
    const filtro = dispositivoQuery(req.query.dispositivo, 4);
    const result = await pool.query(
      `SELECT date_trunc('day', recibido_en AT TIME ZONE $3)::date AS fecha,
              COUNT(*)::int AS lecturas,
              AVG(temperatura)::float8 AS temperatura_promedio,
              MIN(temperatura)::float8 AS temperatura_minima,
              MAX(temperatura)::float8 AS temperatura_maxima,
              AVG(humedad)::float8 AS humedad_promedio,
              MIN(humedad)::float8 AS humedad_minima,
              MAX(humedad)::float8 AS humedad_maxima,
              COUNT(*) FILTER (WHERE alerta = true)::int AS alertas
       FROM telemetria_ambiental
       WHERE recibido_en >= (make_date($1, $2, 1)::timestamp AT TIME ZONE $3)
         AND recibido_en < ((make_date($1, $2, 1) + INTERVAL '1 month') AT TIME ZONE $3)${filtro.clausula}
       GROUP BY 1
       ORDER BY 1 ASC`,
      [anio, mes, ZONA_HORARIA, ...filtro.valores]
    );

    return res.json({ ok: true, meta: { anio, mes, zona_horaria: ZONA_HORARIA }, data: result.rows });
  } catch (error) {
    return responderError(res, error, "No se pudieron calcular las métricas mensuales");
  }
}

async function obtenerDispositivos(req, res) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (dispositivo)
              dispositivo, aula, estado, alerta, recibido_en AS ultima_lectura
       FROM telemetria_ambiental
       ORDER BY dispositivo, recibido_en DESC`
    );
    return res.json({ ok: true, data: result.rows });
  } catch (error) {
    return responderError(res, error, "No se pudieron obtener los dispositivos");
  }
}

function transmitirTelemetria(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const enviar = (evento, data) => {
    res.write(`event: ${evento}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  enviar("connected", { ok: true, zona_horaria: ZONA_HORARIA });

  const manejarLectura = (lectura) => {
    if (!req.query.dispositivo || lectura.dispositivo === req.query.dispositivo) {
      enviar("lectura", lectura);
    }
  };
  const pulso = setInterval(() => res.write(": keep-alive\n\n"), 25000);
  telemetriaEvents.on("lectura", manejarLectura);

  req.on("close", () => {
    clearInterval(pulso);
    telemetriaEvents.off("lectura", manejarLectura);
  });
}

module.exports = {
  crearTelemetria,
  obtenerUltima,
  obtenerHistorial,
  obtenerResumen,
  obtenerPromediosHorarios,
  obtenerMetricasMensuales,
  obtenerDispositivos,
  transmitirTelemetria,
};
