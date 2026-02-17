require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./src/routes/auth.routes");
const deviceRoutes = require("./src/routes/device.routes");

const app = express();

// Seguridad básica HTTP headers
app.use(helmet());

// Body parser
app.use(express.json({ limit: "50kb" }));

// CORS (para tu web)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on :${port}`));
