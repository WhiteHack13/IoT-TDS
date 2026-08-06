import { useState } from "react";
import { AUTH_CONFIG } from "../../config/app.config";
import "./login.css";

export function LoginPage({ onLogin }) {
  const [user, setUser] = useState(AUTH_CONFIG.user);
  const [password, setPassword] = useState(AUTH_CONFIG.password);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (user === AUTH_CONFIG.user && password === AUTH_CONFIG.password) {
      sessionStorage.setItem(AUTH_CONFIG.sessionKey, "true");
      onLogin();
      return;
    }
    setError("Usuario o contraseña incorrectos.");
  }

  return (
    <main className="login-page">
      <section className="login-container" aria-labelledby="login-title">
        <header className="login-header">
          <img src="/unev-logo.png" alt="Instituto Universitario de Educación Virtual" />
          <div>
            <strong>Sistema de monitoreo ambiental</strong>
            <span>Panel de temperatura y humedad</span>
          </div>
        </header>

        <div className="login-panel">
          <h1 id="login-title">Iniciar sesión</h1>
          <p className="login-intro">Utiliza las credenciales asignadas para acceder al dashboard.</p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="user">Usuario</label>
            <input
              id="user"
              value={user}
              onChange={(event) => { setUser(event.target.value); setError(""); }}
              autoComplete="username"
              required
            />
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(""); }}
              autoComplete="current-password"
              required
            />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit">Ingresar</button>
          </form>

          <p className="security-note">Acceso de demostración para fines académicos.</p>
        </div>

        <footer className="login-footer">UNEV · Instituto Universitario de Educación Virtual</footer>
      </section>
    </main>
  );
}
