-- Índices recomendados para sostener historial y agregaciones al crecer la tabla.
-- Ejecutar una sola vez con un usuario que pueda crear índices.

CREATE INDEX IF NOT EXISTS idx_telemetria_recibido_en_desc
  ON telemetria_ambiental (recibido_en DESC);

CREATE INDEX IF NOT EXISTS idx_telemetria_dispositivo_fecha_desc
  ON telemetria_ambiental (dispositivo, recibido_en DESC);
