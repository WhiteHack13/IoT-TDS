import { formatHour, formatNumber } from "../../../shared/utils/formatters";

export function HourlyTable({ data, timeZone }) {
  if (!data.length) return <p className="compact-empty">No hay promedios horarios para hoy.</p>;

  return (
    <div className="hourly-table-wrap">
      <table>
        <thead><tr><th>Hora</th><th>Temp.</th><th>Humedad</th><th>Lecturas</th></tr></thead>
        <tbody>
          {data.slice(-8).reverse().map((row) => (
            <tr key={row.hora}>
              <td>{formatHour(row.hora, timeZone)}</td>
              <td className="temp-text">{formatNumber(row.temperatura_promedio)}°C</td>
              <td className="humidity-text">{formatNumber(row.humedad_promedio, 0)}%</td>
              <td>{row.lecturas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
