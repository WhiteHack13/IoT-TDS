const { publicarComando } = require("../services/mqtt.service");

const COMANDOS_PERMITIDOS = new Set([
  "BUZZER_ON",
  "BUZZER_OFF",
  "LED_ON",
  "LED_OFF",
]);

async function enviarComando(req, res) {
  const comando = req.body?.comando;

  if (!COMANDOS_PERMITIDOS.has(comando)) {
    return res.status(400).json({
      ok: false,
      mensaje: "Comando no permitido",
    });
  }

  try {
    await publicarComando(comando);

    return res.json({
      ok: true,
      comando,
      mensaje: "Comando enviado al dispositivo",
    });
  } catch (error) {
    console.error("ERROR PUBLICANDO COMANDO:", error.message);

    return res.status(503).json({
      ok: false,
      mensaje: "No se pudo enviar el comando al dispositivo",
    });
  }
}

module.exports = {
  enviarComando,
};
