import { DEFAULT_TIMEZONE } from "../../config/app.config";

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("es-HN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value));
}

export function formatDate(value, timeZone = DEFAULT_TIMEZONE) {
  if (!value) return "Sin lecturas";
  return new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function formatHour(value, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

export function formatDay(value, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("es-HN", { day: "2-digit", timeZone }).format(new Date(value));
}

export function formatDuration(milliseconds) {
  const minutes = Math.max(0, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} días`;
}
