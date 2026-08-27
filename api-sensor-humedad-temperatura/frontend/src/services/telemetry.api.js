import { DEFAULT_TIMEZONE } from "../config/app.config";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ROOT = `${API_BASE}/api/v1/telemetria`;
const DEVICES_ROOT = `${API_BASE}/api/v1/dispositivos`;

async function request(path, signal) {
  const response = await fetch(`${ROOT}${path}`, { signal });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(payload.mensaje || "La API no respondió correctamente");
  return payload;
}

function query(params) {
  const result = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) result.set(key, value);
  });
  const value = result.toString();
  return value ? `?${value}` : "";
}

export const telemetryApi = {
  latest: (device, signal) => request(`/ultima${query({ dispositivo: device })}`, signal),
  history: (range, device, signal) =>
    request(`/historial${query({ rango: range, dispositivo: device, limite: 1200 })}`, signal),
  summary: (period, device, signal) =>
    request(`/resumen${query({ periodo: period, dispositivo: device })}`, signal),
  hourly: (device, signal) => request(`/promedios-horarios${query({ dispositivo: device })}`, signal),
  monthly: (device, signal) => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: DEFAULT_TIMEZONE,
        year: "numeric",
        month: "numeric",
      }).formatToParts(new Date()).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
    );

    return request(`/metricas-mensuales${query({
      anio: parts.year,
      mes: parts.month,
      dispositivo: device,
    })}`, signal);
  },
  devices: (signal) => request("/dispositivos", signal),
  streamUrl: (device) => `${ROOT}/stream${query({ dispositivo: device })}`,
  sendCommand: async (command) => {
    const response = await fetch(`${DEVICES_ROOT}/comandos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comando: command }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(payload.mensaje || "No se pudo enviar el comando");
    return payload;
  },
};
