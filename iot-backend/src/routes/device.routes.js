const express = require("express");
const { requireAuth } = require("../Auth/auth.middleware");

const router = express.Router();

// POST /api/device/on
router.post("/on", requireAuth, async (req, res) => {
  // Luego aquí llamamos a Node-RED
  return res.json({ ok: true, action: "ON", by: req.user.email });
});

// POST /api/device/off
router.post("/off", requireAuth, async (req, res) => {
  // Luego aquí llamamos a Node-RED
  return res.json({ ok: true, action: "OFF", by: req.user.email });
});

module.exports = router;
