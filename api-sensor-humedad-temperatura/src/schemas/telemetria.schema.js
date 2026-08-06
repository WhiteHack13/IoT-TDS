const { z } = require("zod");

const telemetriaSchema = z.object({
  dispositivo: z.string().min(1).max(100),
  aula: z.string().min(1).max(100),

  temperatura: z.number().min(-40).max(80),
  humedad: z.number().min(0).max(100),
  umbral: z.number(),

  alerta: z.boolean(),
  estado: z.string().min(1).max(30),

  uptime: z.number().int().nonnegative(),
  recibido_en: z.string().datetime()
});

module.exports = {
  telemetriaSchema
};