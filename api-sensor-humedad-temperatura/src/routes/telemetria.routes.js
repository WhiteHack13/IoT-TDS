const express = require("express");
const router = express.Router();

const {
  crearTelemetria,
  obtenerUltima,
  obtenerHistorial,
  obtenerResumen,
  obtenerPromediosHorarios,
  obtenerMetricasMensuales,
  obtenerDispositivos,
  transmitirTelemetria,
} = require("../controllers/telemetria.controller");

router.post("/", crearTelemetria);
router.get("/ultima", obtenerUltima);
router.get("/historial", obtenerHistorial);
router.get("/resumen", obtenerResumen);
router.get("/promedios-horarios", obtenerPromediosHorarios);
router.get("/metricas-mensuales", obtenerMetricasMensuales);
router.get("/dispositivos", obtenerDispositivos);
router.get("/stream", transmitirTelemetria);

module.exports = router;
