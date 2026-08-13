require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/database");
const telemetriaRoutes = require("./routes/telemetria.routes");

const app = express();

app.use(cors({
  origin: "https://iot-unev.aiondex.com"
}));
app.use(express.json());

app.get("/", async (req, res) => {
  res.json({
    servicio: "UNEV IoT API",
    estado: "ok",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS fecha");

    res.json({
      ok: true,
      database: "connected",
      fecha: result.rows[0].fecha,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      database: "disconnected",
    });
  }
});

app.use(
  "/api/v1/telemetria",
  telemetriaRoutes
);

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`);
  });
}

module.exports = app;
