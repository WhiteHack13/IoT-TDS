import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANGE_MS } from "../../../config/app.config";
import { formatDate, formatDay, formatHour, formatNumber } from "../../../shared/utils/formatters";

function ChartTooltip({ active, payload, label, timeZone }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{formatDate(label, timeZone)}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value)} {item.dataKey.includes("temperatura") ? "°C" : "%"}
        </span>
      ))}
    </div>
  );
}

export function RangeChart({ data, range, timeZone }) {
  const end = Date.now();
  const start = end - RANGE_MS[range];
  const ticks = Array.from({ length: 5 }, (_, index) => start + ((end - start) * index) / 4);
  const chartData = data.map((item) => ({ ...item, timestamp: new Date(item.recibido_en).getTime() }));

  return (
    <div className="chart-shell" role="img" aria-label="Gráfico temporal de temperatura y humedad; los espacios vacíos representan periodos sin lecturas">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart accessibilityLayer data={chartData} margin={{ top: 16, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6500" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#ff6500" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#d9dedb" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={[start, end]}
            ticks={ticks}
            allowDataOverflow
            tickFormatter={(value) => range.endsWith("d") ? `${formatDay(value, timeZone)} · ${formatHour(value, timeZone)}` : formatHour(value, timeZone)}
            minTickGap={46}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="temp" domain={["dataMin - 2", "dataMax + 2"]} axisLine={false} tickLine={false} />
          <YAxis yAxisId="hum" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip timeZone={timeZone} />} />
          <Area yAxisId="temp" type="monotone" dataKey="temperatura" name="Temperatura" stroke="none" fill="url(#tempArea)" />
          <Line yAxisId="temp" type="monotone" dataKey="temperatura" name="Temperatura" stroke="#ff6500" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#ff6500", stroke: "#fff", strokeWidth: 2 }} />
          <Line yAxisId="hum" type="monotone" dataKey="humedad" name="Humedad" stroke="#1d2e5c" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#1d2e5c", stroke: "#fff", strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyChart({ data, meta, timeZone }) {
  const chartData = data.map((item) => {
    const day = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone }).format(new Date(item.fecha)));
    return { ...item, timestamp: Date.UTC(meta.anio, meta.mes - 1, day, 12) };
  });
  const start = Date.UTC(meta.anio, meta.mes - 1, 1, 12);
  const end = Date.UTC(meta.anio, meta.mes, 0, 12);
  const ticks = Array.from({ length: 6 }, (_, index) => start + ((end - start) * index) / 5);

  return (
    <div className="monthly-chart" role="img" aria-label="Promedios diarios sobre el mes completo; los espacios vacíos son días sin lecturas">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart accessibilityLayer data={chartData} margin={{ top: 12, right: 0, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#d9dedb" strokeDasharray="2 6" vertical={false} />
          <XAxis dataKey="timestamp" type="number" scale="time" domain={[start, end]} ticks={ticks} allowDataOverflow tickFormatter={(value) => formatDay(value, timeZone)} axisLine={false} tickLine={false} />
          <YAxis yAxisId="temp" axisLine={false} tickLine={false} />
          <YAxis yAxisId="hum" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip timeZone={timeZone} />} />
          <Line yAxisId="temp" dataKey="temperatura_promedio" name="Temperatura" stroke="#ff6500" strokeWidth={2.2} dot={{ r: 2 }} />
          <Line yAxisId="hum" dataKey="humedad_promedio" name="Humedad" stroke="#1d2e5c" strokeWidth={2.2} dot={{ r: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
