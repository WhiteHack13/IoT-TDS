import { useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Gauge,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  X,
} from "lucide-react";
import { RANGE_LABELS } from "../../config/app.config";
import { ContourMap } from "../../shared/components/ContourMap";
import { EmptyPanel, ErrorBanner, LoadingPanel } from "../../shared/components/AsyncStates";
import { formatDuration, formatNumber } from "../../shared/utils/formatters";
import { HourlyTable } from "./components/HourlyTable";
import { LiveReading } from "./components/LiveReading";
import { MonthlyChart, RangeChart } from "./components/TelemetryCharts";
import { useTelemetryDashboard } from "./hooks/useTelemetryDashboard";
import "./dashboard.css";

export function DashboardPage({ onLogout }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const telemetry = useTelemetryDashboard();
  const {
    range, setRange, device, setDevice, latest, history, today, month,
    hourly, monthly, monthMeta, timeZone, devices, loading, error,
    streamOnline, sensorFresh, historyCoverage, loadData,
  } = telemetry;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="app-brand" href="#resumen" aria-label="UNEV Ambiente, ir al resumen">
          <img src="/unev-logo.png" alt="UNEV" />
        </a>
        <nav id="main-navigation" className={mobileMenu ? "main-nav is-open" : "main-nav"} aria-label="Navegación principal">
          <a className="active" href="#resumen" onClick={() => setMobileMenu(false)}><LayoutDashboard size={17} />Vista general</a>
          <a href="#horas" onClick={() => setMobileMenu(false)}><History size={17} />Por hora</a>
          <a href="#mes" onClick={() => setMobileMenu(false)}><BarChart3 size={17} />Mes</a>
        </nav>
        <div className="topbar-actions">
          <span className={`api-state ${streamOnline ? "online" : ""}`}><i />{streamOnline ? "Canal API activo" : "Conectando API"}</span>
          <button className="icon-button mobile-menu-button" type="button" aria-label={mobileMenu ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileMenu} aria-controls="main-navigation" onClick={() => setMobileMenu((value) => !value)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
          <button className="logout-button" type="button" onClick={onLogout}><LogOut size={16} /><span>Salir</span></button>
        </div>
      </header>

      <main className="dashboard-main" id="resumen">
        <ContourMap className="dashboard-contours" />
        <section className="dashboard-heading">
          <div>
            <span className="section-kicker">Panel ambiental</span>
            <h1>Vista general</h1>
            <p>Lecturas, variaciones y promedios de la estación en un solo campo.</p>
          </div>
          <div className="dashboard-filters">
            <label>
              <span className="sr-only">Dispositivo</span>
              <Gauge size={17} />
              <select value={device} onChange={(event) => setDevice(event.target.value)}>
                <option value="">Todos los dispositivos</option>
                {devices.map((item) => <option value={item.dispositivo} key={item.dispositivo}>{item.dispositivo}</option>)}
              </select>
              <ChevronDown size={15} />
            </label>
            <button className="icon-button" type="button" aria-label="Actualizar datos" onClick={() => loadData()}><RefreshCw size={18} /></button>
          </div>
        </section>

        {error && <ErrorBanner message={error} onRetry={() => loadData()} />}
        {loading ? <LoadingPanel /> : !latest && !history.length ? <EmptyPanel onRetry={() => loadData()} /> : (
          <>
            <section className="primary-grid">
              <LiveReading latest={latest} summary={today} apiConnected={streamOnline} sensorFresh={sensorFresh} timeZone={timeZone} />
              <article className="history-panel" aria-labelledby="history-title">
                <div className="section-heading">
                  <div><span className="section-kicker">Comportamiento</span><h2 id="history-title">{RANGE_LABELS[range]}</h2></div>
                  <label className="range-select">
                    <CalendarDays size={16} />
                    <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Rango de tiempo">
                      <option value="1h">1 hora</option><option value="6h">6 horas</option><option value="12h">12 horas</option>
                      <option value="24h">24 horas</option><option value="7d">7 días</option><option value="30d">30 días</option>
                    </select>
                    <ChevronDown size={14} />
                  </label>
                </div>
                <div className="chart-legend"><span className="temp-text"><i />Temperatura (°C)</span><span className="humidity-text"><i />Humedad (%)</span></div>
                <RangeChart data={history} range={range} timeZone={timeZone} />
                <div className="chart-footer"><Activity size={15} />{history.length} lecturas · cobertura disponible: {formatDuration(historyCoverage)} · los huecos indican ausencia de datos</div>
              </article>
            </section>

            <section className="analysis-grid">
              <article className="hourly-panel" id="horas" aria-labelledby="hourly-title">
                <div className="section-heading">
                  <div><span className="section-kicker">Ritmo del día</span><h2 id="hourly-title">Promedios por hora</h2></div>
                  <span className="quiet-meta">Hoy</span>
                </div>
                <HourlyTable data={hourly} timeZone={timeZone} />
              </article>

              <article className="month-panel" id="mes" aria-labelledby="month-title">
                <div className="section-heading">
                  <div><span className="section-kicker">Escala mensual</span><h2 id="month-title">Comportamiento del mes</h2></div>
                  <span className="quiet-meta">{monthly.length} días con datos · {month?.lecturas || 0} lecturas</span>
                </div>
                <div className="month-content">
                  <MonthlyChart data={monthly} meta={monthMeta} timeZone={timeZone} />
                  <div className="month-metrics">
                    <div className="metric-line temperature-metric"><span>Temperatura promedio</span><strong>{formatNumber(month?.temperatura?.promedio)}°C</strong><small>{formatNumber(month?.temperatura?.minima)}° mín. · {formatNumber(month?.temperatura?.maxima)}° máx.</small></div>
                    <div className="metric-line humidity-metric"><span>Humedad promedio</span><strong>{formatNumber(month?.humedad?.promedio, 0)}%</strong><small>{formatNumber(month?.humedad?.minima, 0)}% mín. · {formatNumber(month?.humedad?.maxima, 0)}% máx.</small></div>
                    <div className="metric-line alert-metric"><span>Alertas registradas</span><strong>{month?.alertas ?? 0}</strong><small>{month?.alertas ? "Requieren revisión" : "Sin alertas en el periodo"}</small></div>
                  </div>
                </div>
              </article>
            </section>

            <footer className="dashboard-footer">
              <span><CheckCircle2 size={15} /> Datos servidos por PostgreSQL</span>
              <span>Zona horaria: {timeZone}</span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
