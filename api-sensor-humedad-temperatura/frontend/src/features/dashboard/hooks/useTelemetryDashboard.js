import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TIMEZONE } from "../../../config/app.config";
import { telemetryApi } from "../../../services/telemetry.api";

export function useTelemetryDashboard() {
  const [range, setRange] = useState("24h");
  const [device, setDevice] = useState("");
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [monthMeta, setMonthMeta] = useState({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 });
  const [timeZone, setTimeZone] = useState(DEFAULT_TIMEZONE);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streamOnline, setStreamOnline] = useState(false);
  const [clock, setClock] = useState(Date.now());

  const loadData = useCallback(async (signal) => {
    setError("");
    const results = await Promise.allSettled([
      telemetryApi.latest(device, signal),
      telemetryApi.history(range, device, signal),
      telemetryApi.summary("hoy", device, signal),
      telemetryApi.summary("mes", device, signal),
      telemetryApi.hourly(device, signal),
      telemetryApi.monthly(device, signal),
      telemetryApi.devices(signal),
    ]);
    if (signal?.aborted) return;

    const [last, past, daySummary, monthSummary, hours, days, deviceList] = results;
    if (last.status === "fulfilled") setLatest(last.value.data);
    if (past.status === "fulfilled") setHistory(past.value.data || []);
    if (daySummary.status === "fulfilled") {
      setToday(daySummary.value.data);
      setTimeZone(daySummary.value.meta?.zona_horaria || DEFAULT_TIMEZONE);
    }
    if (monthSummary.status === "fulfilled") setMonth(monthSummary.value.data);
    if (hours.status === "fulfilled") setHourly(hours.value.data || []);
    if (days.status === "fulfilled") {
      setMonthly(days.value.data || []);
      setMonthMeta((current) => days.value.meta || current);
      setTimeZone(days.value.meta?.zona_horaria || DEFAULT_TIMEZONE);
    }
    if (deviceList.status === "fulfilled") setDevices(deviceList.value.data || []);

    const rejected = results.find((result) => result.status === "rejected");
    if (rejected) setError(rejected.reason?.message || "No se pudo consultar la telemetría");
    setLoading(false);
  }, [device, range]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  useEffect(() => {
    const refresh = setInterval(() => loadData(), 30000);
    const clockTick = setInterval(() => setClock(Date.now()), 30000);
    return () => {
      clearInterval(refresh);
      clearInterval(clockTick);
    };
  }, [loadData]);

  useEffect(() => {
    const stream = new EventSource(telemetryApi.streamUrl(device));
    stream.addEventListener("connected", () => setStreamOnline(true));
    stream.addEventListener("lectura", (event) => {
      const reading = JSON.parse(event.data);
      setLatest(reading);
      setHistory((current) => [...current, reading].slice(-1200));
      setStreamOnline(true);
    });
    stream.onerror = () => setStreamOnline(false);
    return () => stream.close();
  }, [device]);

  const sensorFresh = Boolean(latest?.recibido_en && clock - new Date(latest.recibido_en).getTime() < 120000);
  const historyCoverage = history.length > 1
    ? new Date(history.at(-1).recibido_en).getTime() - new Date(history[0].recibido_en).getTime()
    : 0;

  return {
    range,
    setRange,
    device,
    setDevice,
    latest,
    history,
    today,
    month,
    hourly,
    monthly,
    monthMeta,
    timeZone,
    devices,
    loading,
    error,
    streamOnline,
    sensorFresh,
    historyCoverage,
    loadData,
  };
}
