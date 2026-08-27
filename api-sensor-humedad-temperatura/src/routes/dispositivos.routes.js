const express = require("express");
const { enviarComando } = require("../controllers/dispositivos.controller");

const router = express.Router();

router.post("/comandos", enviarComando);

module.exports = router;
