import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BellOff, BellRing, Droplets, LoaderCircle, Thermometer, TriangleAlert, Wifi, WifiOff } from "lucide-react";
import { telemetryApi } from "../../../services/telemetry.api";
import { formatDate, formatNumber } from "../../../shared/utils/formatters";

export function LiveReading({ latest, summary, apiConnected, sensorFresh, timeZone }) {
  const temperature = summary?.temperatura || {};
  const humidity = summary?.humedad || {};
  const currentTemperature = Number(latest?.temperatura);
  const configuredThreshold = Number(latest?.umbral ?? 30);
  const thresholdExceeded = latest?.alerta === true || (
    Number.isFinite(currentTemperature)
    && Number.isFinite(configuredThreshold)
    && currentTemperature >= configuredThreshold
  );
  const [alarmMode, setAlarmMode] = useState(thresholdExceeded ? "active" : "normal");
  const [sendingCommand, setSendingCommand] = useState(false);
  const [commandMessage, setCommandMessage] = useState("");
  const [commandError, setCommandError] = useState("");

  useEffect(() => {
    setAlarmMode((current) => {
      if (!thresholdExceeded) return "normal";
      return current === "silenced" ? current : "active";
    });
  }, [thresholdExceeded]);

  const alarmLabel = alarmMode === "active"
    ? "Alarma activa"
    : alarmMode === "silenced"
      ? "Alarma silenciada"
      : "Alarma normal";

  async function handleAlarmCommand() {
    const command = alarmMode === "active" ? "BUZZER_OFF" : "BUZZER_ON";
    setSendingCommand(true);
    setCommandError("");
    setCommandMessage("");

    try {
      const response = await telemetryApi.sendCommand(command);
      setAlarmMode(command === "BUZZER_OFF" ? "silenced" : "active");
      setCommandMessage(response.mensaje);
    } catch (error) {
      setCommandError(error.message);
    } finally {
      setSendingCommand(false);
    }
  }

  return (
    <aside className="live-reading" aria-labelledby="live-title">
      <div className="section-heading">
        <div><span className="section-kicker">Ahora</span><h2 id="live-title">Lectura en vivo</h2></div>
        <span className={`connection-badge ${sensorFresh ? "is-online" : ""}`}>
          {sensorFresh ? <Wifi size={14} /> : <WifiOff size={14} />}
          {sensorFresh ? "Sensor activo" : apiConnected ? "Lectura atrasada" : "Reconectando"}
        </span>
      </div>

      {thresholdExceeded && (
        <div className="threshold-alert" role="alert" aria-live="assertive">
          <span className="threshold-alert-icon" aria-hidden="true">
            <TriangleAlert size={24} strokeWidth={2.4} />
          </span>
          <div>
            <strong>Alerta de temperatura alta</strong>
            <span>
              La lectura de {formatNumber(latest?.temperatura)} °C superó el umbral de {formatNumber(latest?.umbral)} °C.
            </span>
          </div>
          <span className="threshold-alert-signal" aria-hidden="true" />
        </div>
      )}

      <div className={`alarm-control is-${alarmMode}`}>
        <div className="alarm-control-status">
          {alarmMode === "active" ? <BellRing size={20} /> : <BellOff size={20} />}
          <div>
            <span>Control remoto · ESP32-01</span>
            <strong>{alarmLabel}</strong>
          </div>
        </div>
        <button type="button" onClick={handleAlarmCommand} disabled={sendingCommand}>
          {sendingCommand && <LoaderCircle className="spin" size={16} />}
          {sendingCommand
            ? "Enviando..."
            : alarmMode === "active"
              ? "Silenciar alarma"
              : "Activar alarma"}
        </button>
        {(commandMessage || commandError) && (
          <p className={commandError ? "is-error" : "is-success"} role={commandError ? "alert" : "status"}>
            {commandError || commandMessage}
          </p>
        )}
      </div>

      <div className="reading-block temperature-reading">
        <Thermometer size={28} />
        <div><span>Temperatura</span><strong>{formatNumber(latest?.temperatura)}<small>°C</small></strong></div>
      </div>
      <div className="reading-range">
        <span><ArrowDown size={13} /> Mín. {formatNumber(temperature.minima)}°</span>
        <span>Prom. {formatNumber(temperature.promedio)}°</span>
        <span><ArrowUp size={13} /> Máx. {formatNumber(temperature.maxima)}°</span>
      </div>

      <div className="reading-block humidity-reading">
        <Droplets size={28} />
        <div><span>Humedad</span><strong>{formatNumber(latest?.humedad, 0)}<small>%</small></strong></div>
      </div>
      <div className="reading-range">
        <span><ArrowDown size={13} /> Mín. {formatNumber(humidity.minima, 0)}%</span>
        <span>Prom. {formatNumber(humidity.promedio, 0)}%</span>
        <span><ArrowUp size={13} /> Máx. {formatNumber(humidity.maxima, 0)}%</span>
      </div>

      <dl className="sensor-facts">
        <div><dt>Dispositivo</dt><dd>{latest?.dispositivo || "—"}</dd></div>
        <div><dt>Ubicación</dt><dd>{latest?.aula || "—"}</dd></div>
        <div>
          <dt>Estado</dt>
          <dd><span className={`reading-status ${thresholdExceeded ? "is-alert" : ""}`}>{latest?.estado || "Sin datos"}</span></dd>
        </div>
        <div><dt>Última lectura</dt><dd>{formatDate(latest?.recibido_en, timeZone)}</dd></div>
      </dl>
    </aside>
  );
}
