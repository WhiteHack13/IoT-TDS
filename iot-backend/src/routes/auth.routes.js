const express = require("express");
const { login } = require("../Auth/auth.service");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const result = await login(email, password);
  if (!result) {
    // Mensaje genérico para no dar pistas
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json(result);
});

module.exports = router;
