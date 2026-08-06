# UNEV Ambiente

Proyecto didáctico de telemetría ambiental. Node-RED envía lecturas de temperatura y humedad a una API Express, PostgreSQL conserva los registros y un frontend React los presenta en tiempo real con agregaciones por hora, día y mes.

## Requisitos

- Node.js 20 o superior
- Una base PostgreSQL con la tabla `telemetria_ambiental` usada por la API
- Node-RED enviando el payload validado por `src/schemas/telemetria.schema.js`

## Configuración

1. Copia `.env.example` a `.env`.
2. Define `DATABASE_URL` y, si corresponde, `APP_TIMEZONE`.
3. Instala las dependencias:

```bash
pnpm install
pnpm --prefix frontend install
```

Para una tabla con muchas lecturas, ejecuta una vez los índices de [`sql/indexes.sql`](sql/indexes.sql) en PostgreSQL.

## Desarrollo

Ejecuta backend y frontend en terminales separadas:

```bash
pnpm run dev
```

```bash
pnpm run dev:frontend
```

- API: `http://localhost:8000`
- Frontend: `http://localhost:5173`

El servidor de Vite redirige `/api` al backend. Para apuntar el frontend compilado a otro host, define `VITE_API_URL` antes de ejecutar `pnpm run build:frontend`.

## Acceso didáctico

- Usuario: `admin`
- Contraseña: `admin123`

La sesión se guarda en `sessionStorage`. No existen tokens ni validación en el servidor; este login no debe utilizarse para proteger un sistema real.

## Endpoints

Todos parten de `/api/v1/telemetria`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/` | Valida, almacena y publica una lectura recibida desde Node-RED. |
| `GET` | `/ultima` | Devuelve la lectura más reciente. |
| `GET` | `/historial?rango=24h&limite=500` | Devuelve lecturas cronológicas. Rangos: `1h`, `6h`, `12h`, `24h`, `7d`, `30d`. |
| `GET` | `/resumen?periodo=hoy` | Calcula promedio, mínimo, máximo, conteo y alertas para `hoy` o `mes`. |
| `GET` | `/promedios-horarios?fecha=2026-08-06` | Agrupa las lecturas de una fecha por hora local. |
| `GET` | `/metricas-mensuales?anio=2026&mes=8` | Agrupa el mes por día con métricas de ambas variables. |
| `GET` | `/dispositivos` | Lista dispositivos y su último estado conocido. |
| `GET` | `/stream` | Canal Server-Sent Events con cada nueva lectura. |

Los endpoints `GET` aceptan opcionalmente `dispositivo=esp32-01` cuando aplica.

## Compilación del frontend

```bash
ppnpm run build:frontend
```

La salida se genera en `frontend/dist`.

## Arquitectura del frontend

El código React utiliza una estructura modular orientada por funcionalidades:

```text
frontend/src/
├── config/                 Configuración y constantes de la aplicación
├── features/
│   ├── auth/               Pantalla y estilos de autenticación
│   └── dashboard/          Página, componentes, hook y estilos del dashboard
├── services/               Cliente de la API de telemetría
├── shared/
│   ├── components/         Componentes reutilizables
│   └── utils/              Formateadores compartidos
├── styles/                 Tokens y estilos globales
├── App.jsx                 Control de sesión y composición principal
└── main.jsx                Punto de entrada de React
```
