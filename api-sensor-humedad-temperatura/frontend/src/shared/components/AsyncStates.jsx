import { Database, RefreshCw, WifiOff } from "lucide-react";

export function LoadingPanel() {
  return (
    <div className="state-panel" role="status">
      <RefreshCw className="spin" size={22} />
      <strong>Consultando la estación</strong>
      <span>Estamos preparando las lecturas y sus promedios.</span>
    </div>
  );
}

export function EmptyPanel({ onRetry }) {
  return (
    <div className="state-panel">
      <Database size={24} />
      <strong>Todavía no hay datos para este periodo</strong>
      <span>Comprueba que Node-RED esté enviando lecturas o selecciona otro rango.</span>
      <button className="secondary-button" type="button" onClick={onRetry}>Volver a consultar</button>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <WifiOff size={20} />
      <div><strong>No pudimos conectar con la API</strong><span>{message}</span></div>
      <button type="button" onClick={onRetry}>Reintentar</button>
    </div>
  );
}
