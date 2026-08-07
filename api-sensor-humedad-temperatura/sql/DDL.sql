CREATE TABLE telemetria_ambiental (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    dispositivo VARCHAR(100) NOT NULL,
    aula VARCHAR(100) NOT NULL,

    temperatura NUMERIC(5, 2) NOT NULL,
    humedad NUMERIC(5, 2) NOT NULL,
    umbral NUMERIC(5, 2) NOT NULL,

    alerta BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(30) NOT NULL,

    uptime BIGINT NOT NULL,

    recibido_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_temperatura
        CHECK (temperatura BETWEEN -40 AND 80),

    CONSTRAINT chk_humedad
        CHECK (humedad BETWEEN 0 AND 100),

    CONSTRAINT chk_uptime
        CHECK (uptime >= 0)
);