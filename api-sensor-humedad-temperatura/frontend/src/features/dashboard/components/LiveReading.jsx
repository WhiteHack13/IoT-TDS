import { ArrowDown, ArrowUp, Droplets, Thermometer, Wifi, WifiOff } from "lucide-react";
import { formatDate, formatNumber } from "../../../shared/utils/formatters";

export function LiveReading({ latest, summary, apiConnected, sensorFresh, timeZone }) {
  const temperature = summary?.temperatura || {};
  const humidity = summary?.humedad || {};

  return (
    <aside className="live-reading" aria-labelledby="live-title">
      <div className="section-heading">
        <div><span className="section-kicker">Ahora</span><h2 id="live-title">Lectura en vivo</h2></div>
        <span className={`connection-badge ${sensorFresh ? "is-online" : ""}`}>
          {sensorFresh ? <Wifi size={14} /> : <WifiOff size={14} />}
          {sensorFresh ? "Sensor activo" : apiConnected ? "Lectura atrasada" : "Reconectando"}
        </span>
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
        <div><dt>Estado</dt><dd>{latest?.estado || "Sin datos"}</dd></div>
        <div><dt>Última lectura</dt><dd>{formatDate(latest?.recibido_en, timeZone)}</dd></div>
      </dl>
    </aside>
  );
}
